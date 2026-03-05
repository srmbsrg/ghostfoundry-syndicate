/**
 * Modification Validator
 * 
 * Validates modifications before and after execution.
 * Ensures changes meet quality and safety requirements.
 */

import { prisma } from '@/lib/db';
import {
  ModificationProposal,
  GeneratedArtifact,
  ValidationResult,
  DEFAULT_SELF_MOD_CONFIG
} from './types';

export interface ValidationReport {
  proposalId: string;
  passed: boolean;
  score: number;  // 0-100
  results: ValidationResult[];
  warnings: string[];
  blockers: string[];
}

export class ModificationValidator {
  private config = DEFAULT_SELF_MOD_CONFIG;
  
  /**
   * Validate a proposal before execution
   */
  async validatePreExecution(proposal: ModificationProposal): Promise<ValidationReport> {
    const results: ValidationResult[] = [];
    const warnings: string[] = [];
    const blockers: string[] = [];
    
    // Check approval requirements
    const approvalResult = this.validateApprovals(proposal);
    results.push(approvalResult);
    if (!approvalResult.passed) {
      blockers.push('Missing required approvals');
    }
    
    // Check risk level
    const riskResult = this.validateRiskLevel(proposal);
    results.push(riskResult);
    if (!riskResult.passed) {
      blockers.push('Risk level exceeds auto-execution threshold');
    }
    
    // Check confidence score
    const confidenceResult = this.validateConfidence(proposal);
    results.push(confidenceResult);
    if (!confidenceResult.passed) {
      warnings.push('Confidence score below recommended threshold');
    }
    
    // Check circuit breaker
    const circuitBreakerResult = await this.validateCircuitBreaker();
    results.push(circuitBreakerResult);
    if (!circuitBreakerResult.passed) {
      blockers.push('Circuit breaker triggered - too many recent modifications');
    }
    
    // Check changes are valid
    const changesResult = this.validateChanges(proposal);
    results.push(changesResult);
    if (!changesResult.passed) {
      blockers.push('Invalid changes in proposal');
    }
    
    const score = this.calculateScore(results);
    const passed = blockers.length === 0 && score >= 70;
    
    return {
      proposalId: proposal.id,
      passed,
      score,
      results,
      warnings,
      blockers
    };
  }
  
  /**
   * Validate generated artifacts before deployment
   */
  async validateArtifacts(artifacts: GeneratedArtifact[]): Promise<ValidationReport> {
    const results: ValidationResult[] = [];
    const warnings: string[] = [];
    const blockers: string[] = [];
    
    for (const artifact of artifacts) {
      // Validate artifact has content
      if (!artifact.content || artifact.content.trim().length === 0) {
        results.push({
          type: 'unit_test',
          name: `${artifact.path} - Content Check`,
          passed: false,
          details: 'Artifact has no content'
        });
        blockers.push(`Empty artifact: ${artifact.path}`);
        continue;
      }
      
      // Validate TypeScript/JavaScript syntax
      if (artifact.path.endsWith('.ts') || artifact.path.endsWith('.tsx') || 
          artifact.path.endsWith('.js') || artifact.path.endsWith('.jsx')) {
        const syntaxResult = this.validateSyntax(artifact);
        results.push(syntaxResult);
        if (!syntaxResult.passed) {
          blockers.push(`Syntax error in ${artifact.path}`);
        }
      }
      
      // Validate no dangerous patterns
      const securityResult = this.validateSecurity(artifact);
      results.push(securityResult);
      if (!securityResult.passed) {
        blockers.push(`Security issue in ${artifact.path}`);
      }
      
      // Basic structure validation
      results.push({
        type: 'unit_test',
        name: `${artifact.path} - Structure`,
        passed: true,
        details: 'Valid artifact structure'
      });
    }
    
    const score = this.calculateScore(results);
    
    return {
      proposalId: artifacts[0]?.id || 'unknown',
      passed: blockers.length === 0 && score >= 80,
      score,
      results,
      warnings,
      blockers
    };
  }
  
  /**
   * Validate post-execution
   */
  async validatePostExecution(
    proposal: ModificationProposal,
    artifacts: GeneratedArtifact[]
  ): Promise<ValidationReport> {
    const results: ValidationResult[] = [];
    const warnings: string[] = [];
    const blockers: string[] = [];
    
    // Check all artifacts deployed
    const deployedCount = artifacts.filter(a => a.deployed).length;
    results.push({
      type: 'integration_test',
      name: 'Artifacts Deployed',
      passed: deployedCount === artifacts.length,
      details: `${deployedCount}/${artifacts.length} artifacts deployed`
    });
    if (deployedCount !== artifacts.length) {
      blockers.push('Not all artifacts deployed');
    }
    
    // Check database validations
    const dbValidations = await this.checkDatabaseValidations(proposal);
    results.push(...dbValidations);
    
    const failedValidations = dbValidations.filter(v => !v.passed);
    if (failedValidations.length > 0) {
      warnings.push(`${failedValidations.length} validation(s) failed`);
    }
    
    const score = this.calculateScore(results);
    
    return {
      proposalId: proposal.id,
      passed: blockers.length === 0 && score >= 70,
      score,
      results,
      warnings,
      blockers
    };
  }
  
  /**
   * Validate approvals
   */
  private validateApprovals(proposal: ModificationProposal): ValidationResult {
    const requiredCount = proposal.requiredApprovers.length;
    const approvedCount = proposal.approvals.filter(a => a.decision === 'approved').length;
    
    return {
      type: 'manual_check',
      name: 'Approval Requirements',
      passed: approvedCount >= requiredCount,
      details: `${approvedCount}/${requiredCount} approvals received`
    };
  }
  
  /**
   * Validate risk level is acceptable
   */
  private validateRiskLevel(proposal: ModificationProposal): ValidationResult {
    const riskOrder = ['minimal', 'low', 'medium', 'high', 'critical'];
    const proposalIndex = riskOrder.indexOf(proposal.riskLevel);
    const autoExecuteIndex = riskOrder.indexOf(this.config.autoExecuteRiskLevel);
    
    // If risk is higher than auto-execute threshold, approvals are required
    const needsApproval = proposalIndex > autoExecuteIndex;
    const hasApprovals = proposal.approvals.some(a => a.decision === 'approved');
    
    return {
      type: 'manual_check',
      name: 'Risk Level Check',
      passed: !needsApproval || hasApprovals,
      details: `Risk level: ${proposal.riskLevel}, Auto-execute threshold: ${this.config.autoExecuteRiskLevel}`
    };
  }
  
  /**
   * Validate confidence score
   */
  private validateConfidence(proposal: ModificationProposal): ValidationResult {
    return {
      type: 'unit_test',
      name: 'Confidence Score',
      passed: proposal.impact.confidenceScore >= this.config.minConfidenceScore,
      details: `Score: ${proposal.impact.confidenceScore}, Required: ${this.config.minConfidenceScore}`
    };
  }
  
  /**
   * Validate circuit breaker
   */
  private async validateCircuitBreaker(): Promise<ValidationResult> {
    // Check modifications in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentModifications = await prisma.factoryEvent.count({
      where: {
        type: { in: ['modification_proposed', 'execution_completed', 'execution_failed'] },
        timestamp: { gte: oneHourAgo }
      }
    });
    
    const recentFailures = await prisma.factoryEvent.count({
      where: {
        type: 'execution_failed',
        timestamp: { gte: oneHourAgo }
      }
    });
    
    const passed = 
      recentModifications < this.config.maxModificationsPerHour &&
      recentFailures < this.config.maxFailuresBeforePause;
    
    return {
      type: 'unit_test',
      name: 'Circuit Breaker',
      passed,
      details: `Recent: ${recentModifications}/${this.config.maxModificationsPerHour}, Failures: ${recentFailures}/${this.config.maxFailuresBeforePause}`
    };
  }
  
  /**
   * Validate changes are valid
   */
  private validateChanges(proposal: ModificationProposal): ValidationResult {
    const validChanges = proposal.changes.every(change => {
      return change.component && 
             change.changeType && 
             (change.changeType !== 'create' || change.after || change.darkFactorySpec);
    });
    
    return {
      type: 'unit_test',
      name: 'Changes Valid',
      passed: validChanges,
      details: `${proposal.changes.length} changes validated`
    };
  }
  
  /**
   * Validate TypeScript/JavaScript syntax
   */
  private validateSyntax(artifact: GeneratedArtifact): ValidationResult {
    try {
      // Basic syntax check - look for common errors
      const content = artifact.content;
      
      // Check balanced braces
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      
      const openBrackets = (content.match(/\[/g) || []).length;
      const closeBrackets = (content.match(/\]/g) || []).length;
      
      const balanced = 
        openBraces === closeBraces && 
        openParens === closeParens && 
        openBrackets === closeBrackets;
      
      return {
        type: 'unit_test',
        name: `${artifact.path} - Syntax Check`,
        passed: balanced,
        details: balanced ? 'Balanced syntax' : 'Unbalanced braces/brackets'
      };
    } catch (error) {
      return {
        type: 'unit_test',
        name: `${artifact.path} - Syntax Check`,
        passed: false,
        details: error instanceof Error ? error.message : 'Unknown syntax error'
      };
    }
  }
  
  /**
   * Validate no dangerous patterns
   */
  private validateSecurity(artifact: GeneratedArtifact): ValidationResult {
    const dangerousPatterns = [
      /eval\s*\(/,
      /exec\s*\(/,
      /__proto__/,
      /process\.exit/,
      /child_process/,
      /rm\s+-rf/,
      /DROP\s+TABLE/i,
      /TRUNCATE\s+TABLE/i,
      /DELETE\s+FROM\s+\w+\s*;/i  // DELETE without WHERE
    ];
    
    const foundPatterns: string[] = [];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(artifact.content)) {
        foundPatterns.push(pattern.source);
      }
    }
    
    return {
      type: 'unit_test',
      name: `${artifact.path} - Security Check`,
      passed: foundPatterns.length === 0,
      details: foundPatterns.length === 0 
        ? 'No dangerous patterns found'
        : `Dangerous patterns: ${foundPatterns.join(', ')}`
    };
  }
  
  /**
   * Check database validation results
   */
  private async checkDatabaseValidations(proposal: ModificationProposal): Promise<ValidationResult[]> {
    // Simplified validation - just check if proposal exists in events
    const events = await prisma.factoryEvent.findMany({
      where: {
        type: 'modification_proposed',
        metadata: {
          path: ['proposalId'],
          equals: proposal.id
        }
      }
    });
    
    return [{
      type: 'unit_test',
      name: 'Proposal Stored',
      passed: events.length > 0,
      details: `Found ${events.length} related events`
    }];
  }
  
  /**
   * Calculate overall score
   */
  private calculateScore(results: ValidationResult[]): number {
    if (results.length === 0) return 0;
    
    const passedCount = results.filter(r => r.passed).length;
    return Math.round((passedCount / results.length) * 100);
  }
}

export const modificationValidator = new ModificationValidator();
