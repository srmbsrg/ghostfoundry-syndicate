/**
 * Dark Factory Orchestrator
 * Coordinates the entire code generation pipeline
 */

import { prisma } from '@/lib/db';
import {
  GenerationRequest,
  GenerationTask,
  ParsedIntent,
  TaskStatus,
  GenerationStage,
  GeneratedArtifact,
  ArtifactType,
} from '@/lib/types/dark-factory';
import { parseIntent, estimateComplexity } from '../intent/parser';
import { generateSchemas, GeneratedSchema, schemaToPrismaString } from '../schema/generator';
import { generateApiRoutes, GeneratedRoute } from '../../generators/api/route-generator';
import { generatePrismaSchemaSection, generateTypeScriptTypes } from '../../generators/database/prisma-generator';
import { generateApiTests, GeneratedTest } from '../../generators/tests/test-generator';
import crypto from 'crypto';

export interface PipelineResult {
  taskId: string;
  status: TaskStatus;
  artifacts: GeneratedArtifact[];
  stages: GenerationStage[];
  error?: string;
}

export class DarkFactoryPipeline {
  private taskId: string = '';
  private stages: GenerationStage[] = [];

  /**
   * Execute the full generation pipeline
   */
  async execute(request: GenerationRequest): Promise<PipelineResult> {
    // Create task record
    const task = await this.createTask(request);
    this.taskId = task.id;

    try {
      // Stage 1: Parse Intent
      const intent = await this.runStage('parse_intent', async () => {
        return await parseIntent(request);
      });

      if (intent.type === 'unknown' || intent.confidence < 0.3) {
        throw new Error('Could not understand the request. Please provide more details.');
      }

      // Stage 2: Generate Schemas
      const schemas = await this.runStage('generate_schemas', async () => {
        return await generateSchemas(intent);
      });

      // Stage 3: Generate Code
      const artifacts = await this.runStage('generate_code', async () => {
        return await this.generateAllCode(schemas, intent);
      });

      // Stage 4: Validate (basic checks)
      await this.runStage('validate', async () => {
        return await this.validateArtifacts(artifacts);
      });

      // Save artifacts to database
      const savedArtifacts = await this.saveArtifacts(artifacts);

      // Update task status
      await this.updateTaskStatus('awaiting_approval');

      return {
        taskId: this.taskId,
        status: 'awaiting_approval',
        artifacts: savedArtifacts,
        stages: this.stages,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.updateTaskStatus('failed', errorMessage);
      
      return {
        taskId: this.taskId,
        status: 'failed',
        artifacts: [],
        stages: this.stages,
        error: errorMessage,
      };
    }
  }

  private async createTask(request: GenerationRequest): Promise<{ id: string }> {
    // Create request record
    const dbRequest = await prisma.generationRequest.create({
      data: {
        prompt: request.prompt,
        context: request.context ? JSON.parse(JSON.stringify(request.context)) : null,
        priority: request.priority,
        requestedBy: request.requestedBy,
        status: 'processing',
      },
    });

    // Create task record
    const task = await prisma.generationTask.create({
      data: {
        requestId: dbRequest.id,
        status: 'parsing',
        stages: [],
      },
    });

    // Log event
    await this.logEvent('request_received', { requestId: dbRequest.id });

    return task;
  }

  private async runStage<T>(
    stageName: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const stage: GenerationStage = {
      name: stageName,
      status: 'running',
      startedAt: new Date(),
    };
    this.stages.push(stage);

    try {
      const result = await fn();
      stage.status = 'completed';
      stage.completedAt = new Date();
      stage.output = result;
      
      await this.updateStages();
      await this.logEvent(`${stageName}_completed`, { stageName });
      
      return result;
    } catch (error) {
      stage.status = 'failed';
      stage.completedAt = new Date();
      stage.error = error instanceof Error ? error.message : 'Unknown error';
      
      await this.updateStages();
      await this.logEvent('error_occurred', { stageName, error: stage.error });
      
      throw error;
    }
  }

  private async generateAllCode(
    schemas: GeneratedSchema,
    intent: ParsedIntent
  ): Promise<Array<{ type: ArtifactType; path: string; content: string }>> {
    const artifacts: Array<{ type: ArtifactType; path: string; content: string }> = [];

    // Generate Prisma models
    if (schemas.prismaModels.length > 0) {
      const prismaResult = generatePrismaSchemaSection(schemas.prismaModels);
      artifacts.push({
        type: 'prisma_model',
        path: 'prisma/generated-models.prisma',
        content: prismaResult.modelCode,
      });
    }

    // Generate TypeScript types
    if (schemas.prismaModels.length > 0) {
      const types = generateTypeScriptTypes(schemas.prismaModels);
      artifacts.push({
        type: 'typescript_type',
        path: 'lib/types/generated.ts',
        content: types,
      });
    }

    // Generate API routes
    if (schemas.apiEndpoints.length > 0) {
      const routes = generateApiRoutes(schemas.apiEndpoints, schemas.prismaModels);
      for (const route of routes) {
        artifacts.push({
          type: 'api_route',
          path: route.filename,
          content: route.content,
        });
      }
    }

    // Generate tests
    if (schemas.apiEndpoints.length > 0) {
      const tests = generateApiTests(schemas.apiEndpoints, schemas.prismaModels);
      for (const test of tests) {
        artifacts.push({
          type: 'test_file',
          path: test.filename,
          content: test.content,
        });
      }
    }

    return artifacts;
  }

  private async validateArtifacts(
    artifacts: Array<{ type: ArtifactType; path: string; content: string }>
  ): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    for (const artifact of artifacts) {
      // Basic syntax validation
      if (artifact.type === 'api_route' || artifact.type === 'typescript_type') {
        // Check for obvious issues
        if (artifact.content.includes('undefined') && !artifact.content.includes('| undefined')) {
          issues.push(`Potential undefined reference in ${artifact.path}`);
        }
      }

      // Check for empty content
      if (artifact.content.trim().length === 0) {
        issues.push(`Empty artifact: ${artifact.path}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  private async saveArtifacts(
    artifacts: Array<{ type: ArtifactType; path: string; content: string }>
  ): Promise<GeneratedArtifact[]> {
    const saved: GeneratedArtifact[] = [];

    for (const artifact of artifacts) {
      const checksum = crypto
        .createHash('sha256')
        .update(artifact.content)
        .digest('hex');

      const dbArtifact = await prisma.generatedArtifact.create({
        data: {
          taskId: this.taskId,
          type: artifact.type,
          path: artifact.path,
          content: artifact.content,
          checksum,
          version: 1,
        },
      });

      saved.push({
        id: dbArtifact.id,
        taskId: dbArtifact.taskId,
        type: dbArtifact.type as ArtifactType,
        path: dbArtifact.path,
        content: dbArtifact.content,
        checksum: dbArtifact.checksum,
        version: dbArtifact.version,
        createdAt: dbArtifact.createdAt,
      });
    }

    return saved;
  }

  private async updateTaskStatus(status: TaskStatus, error?: string): Promise<void> {
    await prisma.generationTask.update({
      where: { id: this.taskId },
      data: {
        status,
        error,
        completedAt: ['completed', 'failed'].includes(status) ? new Date() : undefined,
      },
    });
  }

  private async updateStages(): Promise<void> {
    await prisma.generationTask.update({
      where: { id: this.taskId },
      data: {
        stages: JSON.parse(JSON.stringify(this.stages)),
      },
    });
  }

  private async logEvent(type: string, payload: Record<string, unknown>): Promise<void> {
    await prisma.factoryEvent.create({
      data: {
        type,
        taskId: this.taskId,
        payload: JSON.parse(JSON.stringify(payload)),
      },
    });
  }
}

/**
 * Main entry point for the Dark Factory
 */
export async function runDarkFactory(request: GenerationRequest): Promise<PipelineResult> {
  const pipeline = new DarkFactoryPipeline();
  return pipeline.execute(request);
}

/**
 * Get the status of a generation task
 */
export async function getTaskStatus(taskId: string): Promise<GenerationTask | null> {
  const task = await prisma.generationTask.findUnique({
    where: { id: taskId },
    include: {
      artifacts: true,
      validations: true,
      deployments: true,
    },
  });

  if (!task) return null;

  return {
    id: task.id,
    requestId: task.requestId,
    intent: task.intent as unknown as ParsedIntent | null,
    status: task.status as TaskStatus,
    stages: (task.stages as unknown as GenerationStage[]) || [],
    artifacts: task.artifacts.map(a => ({
      id: a.id,
      taskId: a.taskId,
      type: a.type as ArtifactType,
      path: a.path,
      content: a.content,
      checksum: a.checksum,
      version: a.version,
      createdAt: a.createdAt,
    })),
    startedAt: task.startedAt || undefined,
    completedAt: task.completedAt || undefined,
    error: task.error || undefined,
  } as GenerationTask;
}
