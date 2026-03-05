/**
 * Self-Modification Engine
 * 
 * The recursive self-improvement system that allows the Ghost to:
 * 1. Detect gaps in its own capabilities
 * 2. Propose modifications to fill those gaps
 * 3. Route proposals through human gates when needed
 * 4. Execute changes via the Dark Factory
 * 5. Validate and rollback if something breaks
 * 
 * This is the core of the Ghost's operational consciousness -
 * the ability to understand itself, identify what's missing,
 * and autonomously improve.
 */

import { prisma } from '@/lib/db';
import { gapDetector } from './gap-detector';
import { proposalGenerator } from './proposal-generator';
import { riskAssessor, RiskAssessment } from './risk-assessor';
import { modificationExecutor } from './executor';
import { modificationValidator, ValidationReport } from './validator';
import { EventBus } from '../event-bus';
import {
  GapAnalysis,
  ModificationProposal,
  ModificationResult,
  DEFAULT_SELF_MOD_CONFIG,
  SelfModConfig
} from './types';

export class SelfModificationEngine {
  private config: SelfModConfig = DEFAULT_SELF_MOD_CONFIG;
  
  /**
   * Run the full self-modification cycle
   * 
   * This is the main loop where the Ghost:
   * 1. Analyzes itself for gaps
   * 2. Generates proposals to fix them
   * 3. Routes through approvals if needed
   * 4. Executes approved changes
   */
  async runAnalysisCycle(): Promise<{
    gapsDetected: GapAnalysis[];
    proposalsGenerated: ModificationProposal[];
    autoExecuted: ModificationResult[];
  }> {
    const result = {
      gapsDetected: [] as GapAnalysis[],
      proposalsGenerated: [] as ModificationProposal[],
      autoExecuted: [] as ModificationResult[]
    };
    
    // Emit cycle start event
    await EventBus.emit(
      'system',
      'gfs.self_mod.cycle_started',
      { timestamp: new Date().toISOString() }
    );
    
    try {
      // Step 1: Detect gaps
      result.gapsDetected = await gapDetector.analyzeSystem();
      
      // Step 2: Generate proposals for each gap
      for (const gap of result.gapsDetected) {
        const proposal = await proposalGenerator.generateProposal(gap);
        result.proposalsGenerated.push(proposal);
        
        // Step 3: Check if we can auto-execute
        if (await this.canAutoExecute(proposal)) {
          // Validate before execution
          const validation = await modificationValidator.validatePreExecution(proposal);
          
          if (validation.passed) {
            // Execute the modification
            const executionResult = await modificationExecutor.execute(proposal);
            result.autoExecuted.push(executionResult);
          }
        } else {
          // Requires human approval - emit event
          await EventBus.emit(
            'system',
            'gfs.self_mod.approval_required',
            {
              proposalId: proposal.id,
              title: proposal.title,
              riskLevel: proposal.riskLevel,
              requiredApprovers: proposal.requiredApprovers
            }
          );
        }
      }
      
      // Emit cycle complete event
      await EventBus.emit(
        'system',
        'gfs.self_mod.cycle_completed',
        {
          gapsDetected: result.gapsDetected.length,
          proposalsGenerated: result.proposalsGenerated.length,
          autoExecuted: result.autoExecuted.length
        }
      );
      
    } catch (error) {
      // Emit error event
      await EventBus.emit(
        'system',
        'gfs.self_mod.cycle_failed',
        {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );
      
      throw error;
    }
    
    return result;
  }
  
  /**
   * Manually trigger gap analysis
   */
  async analyzeGaps(): Promise<GapAnalysis[]> {
    return gapDetector.analyzeSystem();
  }
  
  /**
   * Generate a proposal for a specific gap
   */
  async generateProposal(gap: GapAnalysis): Promise<ModificationProposal> {
    return proposalGenerator.generateProposal(gap);
  }
  
  /**
   * Assess risk of a proposal
   */
  async assessRisk(proposal: ModificationProposal): Promise<RiskAssessment> {
    return riskAssessor.assessRisk(proposal);
  }
  
  /**
   * Validate a proposal
   */
  async validateProposal(proposal: ModificationProposal): Promise<ValidationReport> {
    return modificationValidator.validatePreExecution(proposal);
  }
  
  /**
   * Approve a proposal
   */
  async approveProposal(
    proposalId: string,
    approverId: string,
    approverName: string,
    comments?: string
  ): Promise<void> {
    // Update the proposal in the database
    await prisma.factoryEvent.updateMany({
      where: {
        type: 'modification_proposed',
        metadata: {
          path: ['proposalId'],
          equals: proposalId
        }
      },
      data: {
        status: 'approved',
        metadata: {
          approvals: [
            {
              approverId,
              approverName,
              decision: 'approved',
              comments,
              timestamp: new Date().toISOString()
            }
          ]
        }
      }
    });
    
    // Emit approval event
    await EventBus.emit(
      'system',
      'gfs.self_mod.proposal_approved',
      {
        proposalId,
        approverId,
        approverName
      }
    );
  }
  
  /**
   * Reject a proposal
   */
  async rejectProposal(
    proposalId: string,
    approverId: string,
    approverName: string,
    reason: string
  ): Promise<void> {
    // Update the proposal in the database
    await prisma.factoryEvent.updateMany({
      where: {
        type: 'modification_proposed',
        metadata: {
          path: ['proposalId'],
          equals: proposalId
        }
      },
      data: {
        status: 'rejected'
      }
    });
    
    // Emit rejection event
    await EventBus.emit(
      'system',
      'gfs.self_mod.proposal_rejected',
      {
        proposalId,
        approverId,
        reason
      }
    );
  }
  
  /**
   * Execute an approved proposal
   */
  async executeProposal(proposal: ModificationProposal): Promise<ModificationResult> {
    // Validate before execution
    const validation = await modificationValidator.validatePreExecution(proposal);
    
    if (!validation.passed) {
      throw new Error(`Validation failed: ${validation.blockers.join(', ')}`);
    }
    
    return modificationExecutor.execute(proposal);
  }
  
  /**
   * Get all pending proposals
   */
  async getPendingProposals(): Promise<ModificationProposal[]> {
    const events = await prisma.factoryEvent.findMany({
      where: {
        type: 'modification_proposed',
        status: { in: ['pending', 'pending_review'] }
      },
      orderBy: { timestamp: 'desc' }
    });
    
    return events
      .map(e => {
        const metadata = e.metadata as Record<string, unknown>;
        return metadata?.proposal as ModificationProposal;
      })
      .filter(Boolean);
  }
  
  /**
   * Get proposal by ID
   */
  async getProposal(proposalId: string): Promise<ModificationProposal | null> {
    const event = await prisma.factoryEvent.findFirst({
      where: {
        type: 'modification_proposed',
        metadata: {
          path: ['proposalId'],
          equals: proposalId
        }
      }
    });
    
    if (!event) return null;
    
    const metadata = event.metadata as Record<string, unknown>;
    return metadata?.proposal as ModificationProposal;
  }
  
  /**
   * Get recent modification history
   */
  async getModificationHistory(limit = 50): Promise<Array<{
    type: string;
    description: string;
    status: string;
    createdAt: Date;
    metadata: Record<string, unknown>;
  }>> {
    const events = await prisma.factoryEvent.findMany({
      where: {
        type: {
          in: [
            'gap_detected',
            'modification_proposed',
            'execution_started',
            'execution_completed',
            'execution_failed',
            'rollback_executed'
          ]
        }
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
    
    return events.map(e => ({
      type: e.type,
      description: e.description || '',
      status: e.status,
      createdAt: e.timestamp,
      metadata: e.metadata as Record<string, unknown>
    }));
  }
  
  /**
   * Check if a proposal can be auto-executed
   */
  private async canAutoExecute(proposal: ModificationProposal): Promise<boolean> {
    const riskOrder = ['minimal', 'low', 'medium', 'high', 'critical'];
    const proposalIndex = riskOrder.indexOf(proposal.riskLevel);
    const autoExecuteIndex = riskOrder.indexOf(this.config.autoExecuteRiskLevel);
    
    return proposalIndex <= autoExecuteIndex;
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SelfModConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export const selfModificationEngine = new SelfModificationEngine();

// Re-export types and sub-modules
export * from './types';
export { gapDetector } from './gap-detector';
export { proposalGenerator } from './proposal-generator';
export { riskAssessor } from './risk-assessor';
export { modificationExecutor } from './executor';
export { modificationValidator } from './validator';
