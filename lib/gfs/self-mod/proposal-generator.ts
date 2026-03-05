/**
 * Proposal Generator
 * 
 * Takes detected gaps and generates detailed modification proposals
 * that can be reviewed, approved, and executed by the Dark Factory.
 */

import { prisma } from '@/lib/db';
import {
  GapAnalysis,
  ModificationProposal,
  ModificationType,
  ProposedChange,
  ExecutionStep,
  RollbackStep
} from './types';
import { riskAssessor } from './risk-assessor';

const LLM_API_URL = 'https://routellm.abacus.ai/v1/chat/completions';

async function callLLM(
  messages: Array<{role: string; content: string}>, 
  temperature = 0.3, 
  jsonMode = false
): Promise<string> {
  try {
    const response = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY || ''}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        messages,
        temperature,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
      })
    });
    
    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('LLM call failed:', error);
    return '';
  }
}

export class ProposalGenerator {
  /**
   * Generate a modification proposal from a detected gap
   */
  async generateProposal(gap: GapAnalysis): Promise<ModificationProposal> {
    // Determine modification type based on gap type
    const modificationType = this.mapGapToModificationType(gap.type);
    
    // Use LLM to generate detailed proposal
    const proposalDetails = await this.generateProposalDetails(gap, modificationType);
    
    // Create proposed changes
    const changes = await this.generateProposedChanges(gap, proposalDetails);
    
    // Generate execution and rollback plans
    const executionPlan = this.generateExecutionPlan(changes);
    const rollbackPlan = this.generateRollbackPlan(changes);
    
    // Create the proposal
    const proposal: ModificationProposal = {
      id: `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gapId: gap.id,
      type: modificationType,
      title: proposalDetails.title,
      description: proposalDetails.description,
      rationale: proposalDetails.rationale,
      changes,
      riskLevel: 'low', // Will be assessed
      riskFactors: [],  // Will be assessed
      impact: {
        affectedUsers: 0,
        affectedWorkflows: gap.affectedComponents,
        downtime: 0,
        reversibility: 'instant',
        testCoverage: 80,
        confidenceScore: 85
      },
      requiredApprovers: [],
      approvals: [],
      executionPlan,
      rollbackPlan,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Assess risk and update proposal
    const riskAssessment = await riskAssessor.assessRisk(proposal);
    proposal.riskLevel = riskAssessment.level;
    proposal.riskFactors = riskAssessment.factors;
    proposal.requiredApprovers = riskAssessment.requiredApprovers;
    proposal.impact.confidenceScore = riskAssessment.confidenceScore;
    
    // Store proposal in database
    await this.storeProposal(proposal);
    
    return proposal;
  }
  
  /**
   * Map gap type to modification type
   */
  private mapGapToModificationType(gapType: string): ModificationType {
    const mapping: Record<string, ModificationType> = {
      'missing_capability': 'capability_extend',
      'failed_task': 'bugfix',
      'performance_bottleneck': 'optimization',
      'integration_gap': 'new_integration',
      'user_feedback': 'capability_extend',
      'pattern_detected': 'workflow_update',
      'security_vulnerability': 'security_patch',
      'compliance_gap': 'capability_extend'
    };
    
    return mapping[gapType] || 'capability_extend';
  }
  
  /**
   * Use LLM to generate proposal details
   */
  private async generateProposalDetails(
    gap: GapAnalysis,
    modificationType: ModificationType
  ): Promise<{ title: string; description: string; rationale: string }> {
    const prompt = `You are a senior software architect analyzing a system gap that needs to be addressed.

Gap Analysis:
- Type: ${gap.type}
- Severity: ${gap.severity}
- Title: ${gap.title}
- Description: ${gap.description}
- Suggested Fix: ${gap.suggestedFix || 'None provided'}
- Affected Components: ${gap.affectedComponents.join(', ')}

Modification Type: ${modificationType}

Generate a detailed proposal to address this gap. Respond with JSON:
{
  "title": "Brief action-oriented title",
  "description": "Detailed description of what will be done",
  "rationale": "Why this approach was chosen and what benefits it provides"
}`;

    try {
      const content = await callLLM(
        [{ role: 'user', content: prompt }],
        0.3,
        true
      );
      
      if (content) {
        return JSON.parse(content);
      }
      
      // Fallback to basic proposal
      return {
        title: `Address: ${gap.title}`,
        description: gap.description,
        rationale: gap.suggestedFix || 'Automated gap resolution'
      };
    } catch {
      // Fallback to basic proposal
      return {
        title: `Address: ${gap.title}`,
        description: gap.description,
        rationale: gap.suggestedFix || 'Automated gap resolution'
      };
    }
  }
  
  /**
   * Generate proposed changes based on gap analysis
   */
  private async generateProposedChanges(
    gap: GapAnalysis,
    proposalDetails: { title: string; description: string; rationale: string }
  ): Promise<ProposedChange[]> {
    const changes: ProposedChange[] = [];
    
    // Generate Dark Factory spec for the changes
    const darkFactorySpec = await this.generateDarkFactorySpec(gap, proposalDetails);
    
    switch (gap.type) {
      case 'missing_capability':
        changes.push({
          component: 'capabilities',
          changeType: 'create',
          after: `New capability: ${gap.title}`,
          darkFactorySpec
        });
        break;
        
      case 'failed_task':
        changes.push({
          component: 'task_handlers',
          changeType: 'modify',
          before: 'Current implementation with errors',
          after: 'Fixed implementation with proper error handling',
          darkFactorySpec
        });
        break;
        
      case 'performance_bottleneck':
        changes.push({
          component: gap.affectedComponents[0] || 'performance',
          changeType: 'modify',
          before: 'Current slow implementation',
          after: 'Optimized implementation',
          darkFactorySpec
        });
        break;
        
      case 'integration_gap':
        changes.push({
          component: 'integrations',
          changeType: 'create',
          after: `New integration: ${gap.title}`,
          darkFactorySpec
        });
        break;
        
      case 'pattern_detected':
        changes.push({
          component: 'workflow_rules',
          changeType: 'create',
          after: 'New automation rule',
          darkFactorySpec
        });
        break;
        
      default:
        changes.push({
          component: 'system',
          changeType: 'modify',
          after: proposalDetails.description,
          darkFactorySpec
        });
    }
    
    return changes;
  }
  
  /**
   * Generate Dark Factory specification for implementing the change
   */
  private async generateDarkFactorySpec(
    gap: GapAnalysis,
    proposalDetails: { title: string; description: string; rationale: string }
  ): Promise<string> {
    const prompt = `You are specifying a change for an AI-powered code generation system (Dark Factory).

Gap to address:
- Title: ${gap.title}
- Description: ${gap.description}
- Type: ${gap.type}
- Affected Components: ${gap.affectedComponents.join(', ')}

Proposal:
- Title: ${proposalDetails.title}
- Description: ${proposalDetails.description}

Write a clear, natural language specification that the Dark Factory can use to generate the necessary code. Be specific about:
1. What to create/modify
2. Expected behavior
3. Error handling requirements
4. Testing requirements

Keep it concise but complete.`;

    try {
      const content = await callLLM(
        [{ role: 'user', content: prompt }],
        0.3
      );
      
      return content || proposalDetails.description;
    } catch {
      return proposalDetails.description;
    }
  }
  
  /**
   * Generate execution plan
   */
  private generateExecutionPlan(changes: ProposedChange[]): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    let order = 1;
    
    // Step 1: Backup current state
    steps.push({
      order: order++,
      action: 'backup',
      description: 'Create backup of affected components',
      status: 'pending'
    });
    
    // Step 2: Generate code via Dark Factory
    for (const change of changes) {
      steps.push({
        order: order++,
        action: 'generate',
        description: `Generate code for ${change.component}`,
        status: 'pending'
      });
    }
    
    // Step 3: Validate generated code
    steps.push({
      order: order++,
      action: 'validate',
      description: 'Run validation and tests on generated code',
      status: 'pending'
    });
    
    // Step 4: Deploy changes
    steps.push({
      order: order++,
      action: 'deploy',
      description: 'Deploy changes to the system',
      status: 'pending'
    });
    
    // Step 5: Verify deployment
    steps.push({
      order: order++,
      action: 'verify',
      description: 'Verify changes are working correctly',
      status: 'pending'
    });
    
    return steps;
  }
  
  /**
   * Generate rollback plan
   */
  private generateRollbackPlan(changes: ProposedChange[]): RollbackStep[] {
    const steps: RollbackStep[] = [];
    let order = 1;
    
    // Restore from backup
    steps.push({
      order: order++,
      action: 'restore_backup',
      description: 'Restore components from backup',
      automated: true
    });
    
    // Remove deployed artifacts
    for (const change of changes) {
      if (change.changeType === 'create') {
        steps.push({
          order: order++,
          action: 'remove_artifact',
          description: `Remove created ${change.component}`,
          automated: true
        });
      }
    }
    
    // Restart affected services
    steps.push({
      order: order++,
      action: 'restart_services',
      description: 'Restart affected services',
      automated: true
    });
    
    // Verify rollback
    steps.push({
      order: order++,
      action: 'verify_rollback',
      description: 'Verify system is restored to previous state',
      automated: false
    });
    
    return steps;
  }
  
  /**
   * Store proposal in database
   */
  private async storeProposal(proposal: ModificationProposal): Promise<void> {
    await prisma.factoryEvent.create({
      data: {
        type: 'modification_proposed',
        description: proposal.title,
        metadata: JSON.parse(JSON.stringify({
          proposalId: proposal.id,
          gapId: proposal.gapId,
          modificationType: proposal.type,
          riskLevel: proposal.riskLevel,
          status: proposal.status,
          changesCount: proposal.changes.length,
          requiredApprovers: proposal.requiredApprovers,
          executionSteps: proposal.executionPlan.length,
          proposal: proposal
        })),
        status: 'pending'
      }
    });
  }
}

export const proposalGenerator = new ProposalGenerator();
