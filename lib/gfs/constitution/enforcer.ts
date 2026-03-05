/**
 * Constitution Enforcer
 * 
 * The component that ensures the Ghost obeys its constitutional rules.
 * This is the judge, jury, and (sometimes) executioner.
 */

import { prisma } from '@/lib/db';
import { EventBus } from '../event-bus';
import {
  GFSConstitution,
  ZoneRule,
  CircuitBreaker,
  InviolableLaw,
  AutonomyZone,
  RuleCondition
} from './types';
import { GFS_CONSTITUTION_V1 } from './baseline-rules';

export interface ActionRequest {
  id: string;
  type: string;
  actor: string;           // Who/what is requesting
  target: string;          // What's being acted upon
  operation: string;       // What's being done
  context: Record<string, unknown>;
  timestamp: Date;
}

export interface EnforcementResult {
  allowed: boolean;
  zone: AutonomyZone;
  requiresApproval: boolean;
  approversNeeded?: string[];
  blockedBy?: string[];     // IDs of rules/laws that blocked
  warnings?: string[];      // Non-blocking concerns
  logRequired: boolean;
  auditEntry: AuditEntry;
}

export interface AuditEntry {
  actionId: string;
  timestamp: Date;
  actor: string;
  action: string;
  target: string;
  result: 'allowed' | 'blocked' | 'pending_approval';
  zone: AutonomyZone;
  rulesEvaluated: string[];
  blockingRules?: string[];
  context: Record<string, unknown>;
}

export class ConstitutionEnforcer {
  private constitution: GFSConstitution;
  private circuitBreakerStates: Map<string, CircuitBreaker>;
  
  constructor(constitution: GFSConstitution = GFS_CONSTITUTION_V1) {
    this.constitution = constitution;
    this.circuitBreakerStates = new Map(
      constitution.circuitBreakers.map(cb => [cb.id, { ...cb }])
    );
  }
  
  /**
   * Evaluate whether an action is allowed
   */
  async evaluate(request: ActionRequest): Promise<EnforcementResult> {
    const rulesEvaluated: string[] = [];
    const blockingRules: string[] = [];
    const warnings: string[] = [];
    
    // Step 1: Check circuit breakers first
    const breakerResult = this.checkCircuitBreakers(request);
    if (breakerResult.tripped) {
      return this.createBlockedResult(request, breakerResult.trippedBreakers, rulesEvaluated);
    }
    
    // Step 2: Check inviolable laws
    for (const law of this.constitution.inviolableLaws) {
      rulesEvaluated.push(law.id);
      if (this.violatesLaw(request, law)) {
        blockingRules.push(law.id);
        await this.recordViolationAttempt(law.id, request);
        
        if (law.enforcement.level === 'hard') {
          return this.createBlockedResult(request, blockingRules, rulesEvaluated);
        } else {
          warnings.push(`Soft law violation: ${law.name}`);
        }
      }
    }
    
    // Step 3: Determine autonomy zone
    let determinedZone: AutonomyZone = 'green';
    
    // Check red zone rules first
    for (const rule of this.constitution.zoneRules.filter(r => r.zone === 'red')) {
      rulesEvaluated.push(rule.id);
      if (this.matchesRule(request, rule)) {
        determinedZone = 'red';
        break;
      }
    }
    
    // Check yellow zone rules if not red
    if (determinedZone !== 'red') {
      for (const rule of this.constitution.zoneRules.filter(r => r.zone === 'yellow')) {
        rulesEvaluated.push(rule.id);
        if (this.matchesRule(request, rule)) {
          determinedZone = 'yellow';
          break;
        }
      }
    }
    
    // Create result based on zone
    const result: EnforcementResult = {
      allowed: determinedZone !== 'red',
      zone: determinedZone,
      requiresApproval: determinedZone === 'red',
      approversNeeded: determinedZone === 'red' ? this.determineApprovers(request) : undefined,
      blockedBy: blockingRules.length > 0 ? blockingRules : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      logRequired: determinedZone !== 'green',
      auditEntry: {
        actionId: request.id,
        timestamp: new Date(),
        actor: request.actor,
        action: request.operation,
        target: request.target,
        result: determinedZone === 'red' ? 'pending_approval' : 'allowed',
        zone: determinedZone,
        rulesEvaluated,
        blockingRules: blockingRules.length > 0 ? blockingRules : undefined,
        context: request.context
      }
    };
    
    // Log the audit entry
    await this.logAudit(result.auditEntry);
    
    // Emit event for monitoring
    await EventBus.emit(
      'system',
      'gfs.constitution.action_evaluated',
      {
        actionId: request.id,
        zone: determinedZone,
        allowed: result.allowed,
        requiresApproval: result.requiresApproval
      }
    );
    
    return result;
  }
  
  /**
   * Check if action violates an inviolable law
   */
  private violatesLaw(request: ActionRequest, law: InviolableLaw): boolean {
    const actionType = request.operation.toLowerCase();
    const context = request.context;
    
    // Check if the action is in the prohibited list
    const actionProhibited = law.prohibits.actions.some(prohibited => 
      actionType.includes(prohibited.toLowerCase())
    );
    
    if (!actionProhibited) return false;
    
    // Check context if specified
    if (law.prohibits.contexts && law.prohibits.contexts.length > 0) {
      const contextMatch = law.prohibits.contexts.some(ctx => {
        const contextValue = String(context.context || context.target || '').toLowerCase();
        return contextValue.includes(ctx.toLowerCase());
      });
      return contextMatch;
    }
    
    return true;
  }
  
  /**
   * Check if action matches a zone rule
   */
  private matchesRule(request: ActionRequest, rule: ZoneRule): boolean {
    return rule.conditions.every(condition => 
      this.evaluateCondition(request, condition)
    );
  }
  
  /**
   * Evaluate a single rule condition
   */
  private evaluateCondition(request: ActionRequest, condition: RuleCondition): boolean {
    const fieldValue = this.getFieldValue(request, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'matches':
        return new RegExp(String(condition.value)).test(String(fieldValue));
      case 'excludes':
        return !String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      default:
        return false;
    }
  }
  
  /**
   * Get field value from request
   */
  private getFieldValue(request: ActionRequest, field: string): unknown {
    // Check direct properties first
    if (field in request) {
      return (request as unknown as Record<string, unknown>)[field];
    }
    
    // Check context
    if (request.context && field in request.context) {
      return request.context[field];
    }
    
    return undefined;
  }
  
  /**
   * Check circuit breakers
   */
  private checkCircuitBreakers(request: ActionRequest): {
    tripped: boolean;
    trippedBreakers: string[];
  } {
    const trippedBreakers: string[] = [];
    
    for (const [id, breaker] of this.circuitBreakerStates) {
      if (breaker.state === 'tripped' || breaker.state === 'cooldown') {
        trippedBreakers.push(id);
      }
    }
    
    return {
      tripped: trippedBreakers.length > 0,
      trippedBreakers
    };
  }
  
  /**
   * Determine required approvers based on action
   */
  private determineApprovers(request: ActionRequest): string[] {
    const context = request.context;
    
    // High-stakes actions need multiple approvers
    if (context.affects_compliance || context.domain === 'financial') {
      return ['admin', 'compliance_officer', 'executive'];
    }
    
    if (context.affects_production || context.change_type === 'schema') {
      return ['admin', 'architect'];
    }
    
    // Default: single admin approval
    return ['admin'];
  }
  
  /**
   * Create a blocked result
   */
  private createBlockedResult(
    request: ActionRequest,
    blockingRules: string[],
    rulesEvaluated: string[]
  ): EnforcementResult {
    const auditEntry: AuditEntry = {
      actionId: request.id,
      timestamp: new Date(),
      actor: request.actor,
      action: request.operation,
      target: request.target,
      result: 'blocked',
      zone: 'red',
      rulesEvaluated,
      blockingRules,
      context: request.context
    };
    
    // Log blocked attempt
    this.logAudit(auditEntry);
    
    return {
      allowed: false,
      zone: 'red',
      requiresApproval: false, // Blocked, not pending
      blockedBy: blockingRules,
      logRequired: true,
      auditEntry
    };
  }
  
  /**
   * Record a law violation attempt
   */
  private async recordViolationAttempt(lawId: string, request: ActionRequest): Promise<void> {
    await EventBus.emit(
      'system',
      'gfs.constitution.law_violation_attempt',
      {
        lawId,
        actionId: request.id,
        actor: request.actor,
        operation: request.operation,
        timestamp: new Date().toISOString()
      }
    );
  }
  
  /**
   * Log audit entry
   */
  private async logAudit(entry: AuditEntry): Promise<void> {
    try {
      await prisma.factoryEvent.create({
        data: {
          type: 'constitution_audit',
          description: `Action ${entry.result}: ${entry.action} on ${entry.target}`,
          status: entry.result,
          metadata: JSON.parse(JSON.stringify(entry))
        }
      });
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  }
  
  /**
   * Trip a circuit breaker
   */
  async tripBreaker(breakerId: string, reason: string): Promise<void> {
    const breaker = this.circuitBreakerStates.get(breakerId);
    if (!breaker) return;
    
    breaker.state = 'tripped';
    breaker.lastTripped = new Date();
    breaker.tripCount++;
    
    await EventBus.emit(
      'system',
      'gfs.constitution.circuit_breaker_tripped',
      {
        breakerId,
        reason,
        response: breaker.response,
        tripCount: breaker.tripCount
      }
    );
  }
  
  /**
   * Reset a circuit breaker
   */
  async resetBreaker(breakerId: string, resetBy: string): Promise<void> {
    const breaker = this.circuitBreakerStates.get(breakerId);
    if (!breaker) return;
    
    breaker.state = 'armed';
    
    await EventBus.emit(
      'system',
      'gfs.constitution.circuit_breaker_reset',
      {
        breakerId,
        resetBy,
        timestamp: new Date().toISOString()
      }
    );
  }
  
  /**
   * Get current constitution
   */
  getConstitution(): GFSConstitution {
    return this.constitution;
  }
  
  /**
   * Get circuit breaker states
   */
  getCircuitBreakerStates(): CircuitBreaker[] {
    return Array.from(this.circuitBreakerStates.values());
  }
}

export const constitutionEnforcer = new ConstitutionEnforcer();
