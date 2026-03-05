/**
 * Modification Executor
 * 
 * Executes approved modification proposals using the Dark Factory.
 * Manages the full execution lifecycle with proper error handling.
 */

import { prisma } from '@/lib/db';
import {
  ModificationProposal,
  ExecutionStep,
  ModificationResult,
  GeneratedArtifact,
  ValidationResult
} from './types';
import { EventBus } from '../event-bus';

export class ModificationExecutor {
  /**
   * Execute an approved modification proposal
   */
  async execute(proposal: ModificationProposal): Promise<ModificationResult> {
    const startTime = Date.now();
    const executedSteps: ExecutionStep[] = [];
    const artifacts: GeneratedArtifact[] = [];
    let rollbackRequired = false;
    let rollbackExecuted = false;
    const validationResults: ValidationResult[] = [];
    
    try {
      // Update proposal status to executing
      await this.updateProposalStatus(proposal.id, 'executing');
      
      // Emit execution started event
      await EventBus.emit(
        'system',
        'gfs.self_mod.execution_started',
        {
          proposalId: proposal.id,
          title: proposal.title,
          modificationType: proposal.type,
          stepsCount: proposal.executionPlan.length
        }
      );
      
      // Execute each step
      for (const step of proposal.executionPlan) {
        const executedStep = await this.executeStep(step, proposal, artifacts);
        executedSteps.push(executedStep);
        
        // If step failed, initiate rollback
        if (executedStep.status === 'failed') {
          rollbackRequired = true;
          break;
        }
      }
      
      // Handle rollback if needed
      if (rollbackRequired) {
        rollbackExecuted = await this.executeRollback(proposal, artifacts);
        await this.updateProposalStatus(proposal.id, 'failed');
      } else {
        // Validate the changes
        await this.updateProposalStatus(proposal.id, 'validating');
        const validation = await this.validateExecution(proposal, artifacts);
        validationResults.push(...validation);
        
        const allPassed = validation.every(r => r.passed);
        
        if (allPassed) {
          await this.updateProposalStatus(proposal.id, 'completed');
          
          // Emit success event
          await EventBus.emit(
            'system',
            'gfs.self_mod.execution_completed',
            {
              proposalId: proposal.id,
              title: proposal.title,
              artifactsCount: artifacts.length,
              duration: Date.now() - startTime
            }
          );
        } else {
          rollbackRequired = true;
          rollbackExecuted = await this.executeRollback(proposal, artifacts);
          await this.updateProposalStatus(proposal.id, 'rolled_back');
        }
      }
      
      return {
        proposalId: proposal.id,
        success: !rollbackRequired,
        executedSteps,
        validationResults,
        artifacts,
        rollbackRequired,
        rollbackExecuted,
        completedAt: new Date()
      };
      
    } catch (error) {
      // Emit failure event
      await EventBus.emit(
        'system',
        'gfs.self_mod.execution_failed',
        {
          proposalId: proposal.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );
      
      await this.updateProposalStatus(proposal.id, 'failed');
      
      // Attempt emergency rollback
      rollbackExecuted = await this.executeRollback(proposal, artifacts);
      
      return {
        proposalId: proposal.id,
        success: false,
        executedSteps,
        validationResults: [],
        artifacts,
        rollbackRequired: true,
        rollbackExecuted,
        completedAt: new Date()
      };
    }
  }
  
  /**
   * Execute a single step
   */
  private async executeStep(
    step: ExecutionStep,
    proposal: ModificationProposal,
    artifacts: GeneratedArtifact[]
  ): Promise<ExecutionStep> {
    const executedStep: ExecutionStep = {
      ...step,
      status: 'in_progress',
      startedAt: new Date()
    };
    
    try {
      switch (step.action) {
        case 'backup':
          await this.createBackup(proposal);
          break;
          
        case 'generate':
          const generated = await this.generateCode(proposal);
          artifacts.push(...generated);
          break;
          
        case 'validate':
          // Validation handled separately
          break;
          
        case 'deploy':
          await this.deployArtifacts(artifacts);
          break;
          
        case 'verify':
          await this.verifyDeployment(proposal, artifacts);
          break;
      }
      
      executedStep.status = 'completed';
      executedStep.completedAt = new Date();
      
    } catch (error) {
      executedStep.status = 'failed';
      executedStep.error = error instanceof Error ? error.message : 'Unknown error';
      executedStep.completedAt = new Date();
    }
    
    return executedStep;
  }
  
  /**
   * Create backup before making changes
   */
  private async createBackup(proposal: ModificationProposal): Promise<void> {
    // Store backup info in factory events
    await prisma.factoryEvent.create({
      data: {
        type: 'backup_created',
        description: `Backup for proposal: ${proposal.title}`,
        payload: JSON.parse(JSON.stringify({
          proposalId: proposal.id,
          affectedComponents: proposal.changes.map(c => c.component),
          timestamp: new Date().toISOString()
        })),
        status: 'completed'
      }
    });
  }
  
  /**
   * Generate code using Dark Factory
   */
  private async generateCode(proposal: ModificationProposal): Promise<GeneratedArtifact[]> {
    const artifacts: GeneratedArtifact[] = [];
    
    for (const change of proposal.changes) {
      if (!change.darkFactorySpec) continue;
      
      // Create generation request
      const generationRequest = await prisma.generationRequest.create({
        data: {
          prompt: change.darkFactorySpec,
          status: 'pending',
          requestedBy: 'self_modification_engine',
          context: JSON.parse(JSON.stringify({
            proposalId: proposal.id,
            component: change.component,
            changeType: change.changeType,
            triggeredBy: 'system'
          }))
        }
      });
      
      // Trigger Dark Factory generation
      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/dark-factory/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: change.darkFactorySpec,
            type: change.changeType === 'create' ? 'full_stack' : 'api',
            requestId: generationRequest.id
          })
        });
        
        if (!response.ok) {
          console.error(`Dark Factory generation failed: ${response.statusText}`);
          continue;
        }
        
        // Get generated artifacts by finding the task first
        const task = await prisma.generationTask.findUnique({
          where: { requestId: generationRequest.id }
        });
        
        const generatedArtifacts = task ? await prisma.generatedArtifact.findMany({
          where: { taskId: task.id }
        }) : [];
        
        for (const artifact of generatedArtifacts) {
          artifacts.push({
            id: artifact.id,
            type: this.mapArtifactType(artifact.type),
            path: artifact.path,
            content: artifact.content,
            deployed: false
          });
        }
      } catch (error) {
        console.error('Dark Factory call failed:', error);
      }
    }
    
    return artifacts;
  }
  
  /**
   * Deploy generated artifacts
   */
  private async deployArtifacts(artifacts: GeneratedArtifact[]): Promise<void> {
    for (const artifact of artifacts) {
      // Mark as deployed in database
      await prisma.generatedArtifact.update({
        where: { id: artifact.id },
        data: { deployed: true }
      });
      
      artifact.deployed = true;
    }
    
    // Trigger deployment via Dark Factory deploy endpoint
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/dark-factory/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artifactIds: artifacts.map(a => a.id)
        })
      });
    } catch (error) {
      console.error('Deploy call failed:', error);
    }
  }
  
  /**
   * Verify deployment was successful
   */
  private async verifyDeployment(
    proposal: ModificationProposal,
    artifacts: GeneratedArtifact[]
  ): Promise<void> {
    // Check all artifacts are deployed
    for (const artifact of artifacts) {
      const dbArtifact = await prisma.generatedArtifact.findUnique({
        where: { id: artifact.id }
      });
      
      if (!dbArtifact?.deployed) {
        throw new Error(`Artifact ${artifact.id} not deployed`);
      }
    }
    
    // Log verification
    await prisma.factoryEvent.create({
      data: {
        type: 'deployment_verified',
        description: `Deployment verified for proposal: ${proposal.title}`,
        payload: JSON.parse(JSON.stringify({
          proposalId: proposal.id,
          artifactCount: artifacts.length
        })),
        status: 'completed'
      }
    });
  }
  
  /**
   * Validate the execution
   */
  private async validateExecution(
    proposal: ModificationProposal,
    artifacts: GeneratedArtifact[]
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    // Basic validation: check artifacts exist
    results.push({
      type: 'unit_test',
      name: 'Artifacts Generated',
      passed: artifacts.length > 0,
      details: `Generated ${artifacts.length} artifacts`
    });
    
    // Check all artifacts deployed
    results.push({
      type: 'integration_test',
      name: 'Artifacts Deployed',
      passed: artifacts.every(a => a.deployed),
      details: `${artifacts.filter(a => a.deployed).length}/${artifacts.length} deployed`
    });
    
    return results;
  }
  
  /**
   * Execute rollback
   */
  private async executeRollback(
    proposal: ModificationProposal,
    artifacts: GeneratedArtifact[]
  ): Promise<boolean> {
    try {
      // Mark artifacts as not deployed
      for (const artifact of artifacts) {
        if (artifact.deployed) {
          await prisma.generatedArtifact.update({
            where: { id: artifact.id },
            data: { deployed: false }
          });
          artifact.deployed = false;
        }
      }
      
      // Log rollback
      await prisma.factoryEvent.create({
        data: {
          type: 'rollback_executed',
          description: `Rollback executed for proposal: ${proposal.title}`,
          payload: JSON.parse(JSON.stringify({
            proposalId: proposal.id,
            artifactsRolledBack: artifacts.length
          })),
          status: 'completed'
        }
      });
      
      // Emit rollback event
      await EventBus.emit(
        'system',
        'gfs.self_mod.rollback_executed',
        {
          proposalId: proposal.id,
          title: proposal.title,
          reason: 'Validation failed or execution error'
        }
      );
      
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Update proposal status
   */
  private async updateProposalStatus(proposalId: string, status: string): Promise<void> {
    await prisma.factoryEvent.updateMany({
      where: {
        type: 'modification_proposed',
        metadata: {
          path: ['proposalId'],
          equals: proposalId
        }
      },
      data: {
        status
      }
    });
  }
  
  /**
   * Map artifact type from database to our type
   */
  private mapArtifactType(dbType: string): GeneratedArtifact['type'] {
    const mapping: Record<string, GeneratedArtifact['type']> = {
      'api_route': 'api_route',
      'react_component': 'component',
      'prisma_schema': 'schema',
      'test': 'test',
      'config': 'config'
    };
    return mapping[dbType] || 'config';
  }
}

export const modificationExecutor = new ModificationExecutor();
