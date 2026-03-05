/**
 * Risk Assessor
 * 
 * Evaluates the risk level of proposed modifications and determines
 * what approvals are needed before execution.
 */

import {
  ModificationProposal,
  RiskLevel,
  RiskFactor,
  DEFAULT_SELF_MOD_CONFIG
} from './types';

export interface RiskAssessment {
  level: RiskLevel;
  score: number;  // 0-100
  factors: RiskFactor[];
  requiredApprovers: string[];
  confidenceScore: number;
  warnings: string[];
  recommendations: string[];
}

export class RiskAssessor {
  private config = DEFAULT_SELF_MOD_CONFIG;
  
  /**
   * Assess the risk of a modification proposal
   */
  async assessRisk(proposal: ModificationProposal): Promise<RiskAssessment> {
    const factors: RiskFactor[] = [];
    let riskScore = 0;
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Assess each risk dimension
    riskScore += this.assessModificationType(proposal, factors);
    riskScore += this.assessChangeScope(proposal, factors);
    riskScore += this.assessDataIntegrity(proposal, factors);
    riskScore += this.assessSecurityImpact(proposal, factors);
    riskScore += this.assessAvailabilityImpact(proposal, factors);
    riskScore += this.assessCompliance(proposal, factors);
    
    // Determine risk level based on score
    const level = this.scoreToLevel(riskScore);
    
    // Determine required approvers
    const requiredApprovers = this.determineApprovers(level, proposal);
    
    // Calculate confidence score
    const confidenceScore = this.calculateConfidence(proposal, factors);
    
    // Generate warnings
    if (riskScore > 60) {
      warnings.push('High risk modification - extra scrutiny recommended');
    }
    if (proposal.changes.some(c => c.changeType === 'delete')) {
      warnings.push('Includes destructive changes');
    }
    if (proposal.type === 'schema_change') {
      warnings.push('Database schema changes may require migration');
    }
    
    // Generate recommendations
    if (level !== 'minimal') {
      recommendations.push('Deploy during low-traffic window');
    }
    if (confidenceScore < 80) {
      recommendations.push('Consider additional testing before deployment');
    }
    if (factors.some(f => f.category === 'security')) {
      recommendations.push('Security review recommended');
    }
    
    return {
      level,
      score: riskScore,
      factors,
      requiredApprovers,
      confidenceScore,
      warnings,
      recommendations
    };
  }
  
  /**
   * Assess risk based on modification type
   */
  private assessModificationType(
    proposal: ModificationProposal,
    factors: RiskFactor[]
  ): number {
    const typeRiskMap: Record<string, number> = {
      'new_endpoint': 15,
      'new_agent': 20,
      'new_integration': 25,
      'schema_change': 40,
      'workflow_update': 20,
      'capability_extend': 15,
      'bugfix': 10,
      'optimization': 15,
      'security_patch': 30
    };
    
    const risk = typeRiskMap[proposal.type] || 20;
    
    if (risk >= 30) {
      factors.push({
        category: 'availability',
        description: `High-impact modification type: ${proposal.type}`,
        severity: risk >= 35 ? 'high' : 'medium',
        mitigation: 'Deploy with staged rollout'
      });
    }
    
    return risk;
  }
  
  /**
   * Assess risk based on change scope
   */
  private assessChangeScope(
    proposal: ModificationProposal,
    factors: RiskFactor[]
  ): number {
    const changeCount = proposal.changes.length;
    const affectedComponents = proposal.impact.affectedWorkflows.length;
    
    let risk = 0;
    
    // More changes = more risk
    if (changeCount > 3) {
      risk += 15;
      factors.push({
        category: 'availability',
        description: `Large change scope: ${changeCount} changes`,
        severity: 'medium',
        mitigation: 'Consider breaking into smaller changes'
      });
    }
    
    // More affected components = more risk
    if (affectedComponents > 5) {
      risk += 20;
      factors.push({
        category: 'availability',
        description: `Wide blast radius: ${affectedComponents} components affected`,
        severity: 'high',
        mitigation: 'Comprehensive testing required'
      });
    }
    
    return risk;
  }
  
  /**
   * Assess data integrity risk
   */
  private assessDataIntegrity(
    proposal: ModificationProposal,
    factors: RiskFactor[]
  ): number {
    let risk = 0;
    
    // Check for database-related changes
    const hasDbChanges = proposal.changes.some(
      c => c.component.includes('schema') || 
           c.component.includes('database') ||
           proposal.type === 'schema_change'
    );
    
    if (hasDbChanges) {
      risk += 25;
      factors.push({
        category: 'data_integrity',
        description: 'Modifies database schema or data',
        severity: 'high',
        mitigation: 'Ensure data migration plan and backups'
      });
    }
    
    // Check for delete operations
    const hasDeletes = proposal.changes.some(c => c.changeType === 'delete');
    if (hasDeletes) {
      risk += 15;
      factors.push({
        category: 'data_integrity',
        description: 'Includes delete operations',
        severity: 'medium',
        mitigation: 'Verify deletion targets before execution'
      });
    }
    
    return risk;
  }
  
  /**
   * Assess security impact
   */
  private assessSecurityImpact(
    proposal: ModificationProposal,
    factors: RiskFactor[]
  ): number {
    let risk = 0;
    
    // Security-related modifications
    if (proposal.type === 'security_patch') {
      risk += 10; // Security patches are actually lower risk (fixing issues)
    }
    
    // Check for auth/permission related changes
    const authRelated = proposal.changes.some(
      c => c.component.toLowerCase().includes('auth') ||
           c.component.toLowerCase().includes('permission') ||
           c.component.toLowerCase().includes('access')
    );
    
    if (authRelated) {
      risk += 20;
      factors.push({
        category: 'security',
        description: 'Modifies authentication or authorization',
        severity: 'high',
        mitigation: 'Security review required'
      });
    }
    
    // Check for external integration changes
    if (proposal.type === 'new_integration') {
      risk += 10;
      factors.push({
        category: 'security',
        description: 'Adds external integration',
        severity: 'medium',
        mitigation: 'Verify API security and data handling'
      });
    }
    
    return risk;
  }
  
  /**
   * Assess availability impact
   */
  private assessAvailabilityImpact(
    proposal: ModificationProposal,
    factors: RiskFactor[]
  ): number {
    let risk = 0;
    
    // Check reversibility
    if (proposal.impact.reversibility === 'complex') {
      risk += 15;
    } else if (proposal.impact.reversibility === 'irreversible') {
      risk += 30;
      factors.push({
        category: 'availability',
        description: 'Changes are difficult or impossible to reverse',
        severity: 'high',
        mitigation: 'Ensure thorough testing and staged rollout'
      });
    }
    
    // Check expected downtime
    if (proposal.impact.downtime > 0) {
      risk += Math.min(proposal.impact.downtime / 2, 20);
      factors.push({
        category: 'availability',
        description: `Expected downtime: ${proposal.impact.downtime} minutes`,
        severity: proposal.impact.downtime > 10 ? 'high' : 'medium',
        mitigation: 'Schedule during maintenance window'
      });
    }
    
    return risk;
  }
  
  /**
   * Assess compliance impact
   */
  private assessCompliance(
    proposal: ModificationProposal,
    factors: RiskFactor[]
  ): number {
    let risk = 0;
    
    // Check if compliance-related
    const complianceRelated = proposal.changes.some(
      c => c.component.toLowerCase().includes('audit') ||
           c.component.toLowerCase().includes('compliance') ||
           c.component.toLowerCase().includes('log')
    );
    
    if (complianceRelated) {
      risk += 10;
      factors.push({
        category: 'compliance',
        description: 'Affects audit or compliance systems',
        severity: 'medium',
        mitigation: 'Ensure changes maintain compliance requirements'
      });
    }
    
    return risk;
  }
  
  /**
   * Convert risk score to risk level
   */
  private scoreToLevel(score: number): RiskLevel {
    if (score <= 15) return 'minimal';
    if (score <= 35) return 'low';
    if (score <= 55) return 'medium';
    if (score <= 75) return 'high';
    return 'critical';
  }
  
  /**
   * Determine required approvers based on risk level
   */
  private determineApprovers(level: RiskLevel, proposal: ModificationProposal): string[] {
    const approvers: string[] = [];
    const count = this.config.approvalRequirements[level];
    
    // Assign approvers based on count and change type
    if (count >= 1) {
      approvers.push('tech_lead');
    }
    if (count >= 2) {
      approvers.push('senior_engineer');
    }
    if (count >= 3) {
      approvers.push('engineering_manager');
    }
    if (count >= 4) {
      approvers.push('cto');
    }
    if (count >= 5) {
      approvers.push('ceo');
    }
    
    // Add security approver for security-related changes
    const hasSecurityFactor = proposal.riskFactors.some(
      f => f.category === 'security'
    );
    if (hasSecurityFactor && !approvers.includes('security_officer')) {
      approvers.push('security_officer');
    }
    
    return approvers;
  }
  
  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    proposal: ModificationProposal,
    factors: RiskFactor[]
  ): number {
    let confidence = 90; // Base confidence
    
    // Reduce for high-severity factors
    const highSeverityCount = factors.filter(f => f.severity === 'high').length;
    confidence -= highSeverityCount * 10;
    
    // Reduce for many changes
    if (proposal.changes.length > 3) {
      confidence -= 5;
    }
    
    // Reduce for complex rollback
    if (proposal.impact.reversibility === 'complex') {
      confidence -= 10;
    } else if (proposal.impact.reversibility === 'irreversible') {
      confidence -= 20;
    }
    
    // Minimum confidence
    return Math.max(confidence, 30);
  }
}

export const riskAssessor = new RiskAssessor();
