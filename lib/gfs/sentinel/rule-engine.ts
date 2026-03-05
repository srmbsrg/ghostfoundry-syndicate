// GFS Sentinel - Rule Engine

import prisma from '@/lib/db';
import {
  SentinelRuleConfig,
  RuleCondition,
  AlertSeverity,
  SentinelAlertData,
} from './types';

export class RuleEngine {
  /**
   * Evaluate all active rules against an event
   */
  async evaluateEvent(event: {
    type: string;
    payload: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<SentinelAlertData[]> {
    const alerts: SentinelAlertData[] = [];

    // Get all enabled rules that match this event type
    const rules = await prisma.sentinelRule.findMany({
      where: {
        enabled: true,
        triggerOn: 'event',
      },
    });

    for (const rule of rules) {
      const eventTypes = rule.eventTypes as string[];
      
      // Check if this rule applies to this event type
      if (eventTypes.length > 0 && !eventTypes.includes(event.type)) {
        continue;
      }

      // Evaluate the rule condition
      const condition = rule.condition as unknown as RuleCondition;
      const matches = this.evaluateCondition(condition, event.payload);

      if (matches) {
        // Rule triggered!
        alerts.push({
          type: this.mapRuleTypeToAlertType(rule.type),
          severity: rule.severity as AlertSeverity,
          category: rule.category as 'security' | 'performance' | 'compliance' | 'operational',
          source: 'rule_engine',
          triggerId: rule.id,
          title: `Rule Triggered: ${rule.name}`,
          description: rule.description || `Sentinel rule "${rule.name}" was triggered`,
          evidence: {
            ruleName: rule.name,
            ruleType: rule.type,
            eventType: event.type,
            matchedCondition: condition,
            payload: event.payload,
          },
          riskScore: this.calculateRiskScore(rule.severity as AlertSeverity),
          confidence: 1.0, // Rule-based detection = high confidence
        });

        // Update rule trigger count
        await prisma.sentinelRule.update({
          where: { id: rule.id },
          data: {
            lastTriggered: new Date(),
            triggerCount: { increment: 1 },
          },
        });
      }
    }

    return alerts;
  }

  /**
   * Create a new sentinel rule
   */
  async createRule(config: SentinelRuleConfig): Promise<string> {
    const rule = await prisma.sentinelRule.create({
      data: {
        name: config.name,
        description: config.description,
        type: config.type,
        category: config.category,
        condition: JSON.parse(JSON.stringify(config.condition)),
        threshold: config.threshold ? JSON.parse(JSON.stringify(config.threshold)) : undefined,
        pattern: config.pattern,
        triggerOn: config.triggerOn,
        eventTypes: config.eventTypes || [],
        severity: config.severity,
        autoRespond: config.autoRespond || false,
        responseActions: config.responseActions ? JSON.parse(JSON.stringify(config.responseActions)) : [],
        enabled: true,
      },
    });

    return rule.id;
  }

  /**
   * Get all rules
   */
  async getRules(enabled?: boolean) {
    return prisma.sentinelRule.findMany({
      where: enabled !== undefined ? { enabled } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Toggle rule enabled status
   */
  async toggleRule(ruleId: string, enabled: boolean): Promise<void> {
    await prisma.sentinelRule.update({
      where: { id: ruleId },
      data: { enabled },
    });
  }

  /**
   * Evaluate a condition against data
   */
  private evaluateCondition(
    condition: RuleCondition,
    data: Record<string, unknown>
  ): boolean {
    const fieldValue = this.getNestedValue(data, condition.field);

    let matches = false;

    switch (condition.operator) {
      case 'eq':
        matches = fieldValue === condition.value;
        break;
      case 'ne':
        matches = fieldValue !== condition.value;
        break;
      case 'gt':
        matches = Number(fieldValue) > Number(condition.value);
        break;
      case 'gte':
        matches = Number(fieldValue) >= Number(condition.value);
        break;
      case 'lt':
        matches = Number(fieldValue) < Number(condition.value);
        break;
      case 'lte':
        matches = Number(fieldValue) <= Number(condition.value);
        break;
      case 'contains':
        matches = String(fieldValue).includes(String(condition.value));
        break;
      case 'matches':
        matches = new RegExp(String(condition.value)).test(String(fieldValue));
        break;
      case 'in':
        matches = Array.isArray(condition.value) && condition.value.includes(fieldValue);
        break;
    }

    // Handle AND conditions
    if (condition.and && condition.and.length > 0) {
      matches = matches && condition.and.every((c) => this.evaluateCondition(c, data));
    }

    // Handle OR conditions
    if (condition.or && condition.or.length > 0) {
      matches = matches || condition.or.some((c) => this.evaluateCondition(c, data));
    }

    return matches;
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  private mapRuleTypeToAlertType(
    ruleType: string
  ): 'anomaly' | 'threat' | 'policy_violation' | 'system_failure' | 'suspicious_activity' {
    switch (ruleType) {
      case 'anomaly':
        return 'anomaly';
      case 'policy':
        return 'policy_violation';
      case 'pattern':
        return 'suspicious_activity';
      default:
        return 'threat';
    }
  }

  private calculateRiskScore(severity: AlertSeverity): number {
    switch (severity) {
      case 'critical':
        return 90;
      case 'high':
        return 75;
      case 'medium':
        return 50;
      case 'low':
        return 25;
      default:
        return 50;
    }
  }
}

export const ruleEngine = new RuleEngine();
