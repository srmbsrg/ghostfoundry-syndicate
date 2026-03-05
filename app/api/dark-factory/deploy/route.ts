/**
 * Dark Factory - Deploy API
 * POST /api/dark-factory/deploy
 * 
 * Deploys generated artifacts to the codebase
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as fs from 'fs/promises';
import * as path from 'path';

export const dynamic = 'force-dynamic';

const PROJECT_ROOT = process.cwd();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { taskId, artifactIds, environment = 'dev' } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Get the task
    const task = await prisma.generationTask.findUnique({
      where: { id: taskId },
      include: { artifacts: true },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Only allow deployment for approved tasks
    if (task.status !== 'awaiting_approval' && task.status !== 'completed') {
      return NextResponse.json(
        { error: `Cannot deploy task with status: ${task.status}` },
        { status: 400 }
      );
    }

    // Filter artifacts to deploy
    const artifactsToDeploy = artifactIds 
      ? task.artifacts.filter(a => artifactIds.includes(a.id))
      : task.artifacts;

    if (artifactsToDeploy.length === 0) {
      return NextResponse.json(
        { error: 'No artifacts to deploy' },
        { status: 400 }
      );
    }

    // Create deployment record
    const deployment = await prisma.deployment.create({
      data: {
        taskId,
        environment,
        artifactIds: artifactsToDeploy.map(a => a.id),
        status: 'deploying',
        logs: [],
      },
    });

    const logs: string[] = [];
    const deployedArtifacts: string[] = [];
    const failedArtifacts: string[] = [];

    // Deploy each artifact
    for (const artifact of artifactsToDeploy) {
      try {
        const filePath = path.join(PROJECT_ROOT, artifact.path);
        const dir = path.dirname(filePath);

        // Create directory if it doesn't exist
        await fs.mkdir(dir, { recursive: true });

        // Write the file
        await fs.writeFile(filePath, artifact.content, 'utf-8');

        // Mark artifact as deployed
        await prisma.generatedArtifact.update({
          where: { id: artifact.id },
          data: { deployed: true },
        });

        deployedArtifacts.push(artifact.id);
        logs.push(`✓ Deployed: ${artifact.path}`);

      } catch (error) {
        failedArtifacts.push(artifact.id);
        logs.push(`✗ Failed: ${artifact.path} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update deployment record
    const success = failedArtifacts.length === 0;
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: success ? 'completed' : 'failed',
        deployedAt: new Date(),
        logs,
      },
    });

    // Update task status if all artifacts deployed
    if (success) {
      await prisma.generationTask.update({
        where: { id: taskId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });
    }

    // Log event
    await prisma.factoryEvent.create({
      data: {
        type: success ? 'deployment_completed' : 'deployment_failed',
        taskId,
        payload: {
          deploymentId: deployment.id,
          deployedCount: deployedArtifacts.length,
          failedCount: failedArtifacts.length,
        },
      },
    });

    return NextResponse.json({
      success,
      deploymentId: deployment.id,
      deployed: deployedArtifacts.length,
      failed: failedArtifacts.length,
      logs,
    });

  } catch (error) {
    console.error('Deployment error:', error);
    return NextResponse.json(
      { 
        error: 'Deployment failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
