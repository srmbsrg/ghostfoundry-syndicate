// GFS Sentinel - Main Entry Point
// "The Sentinel is now watching. The Ghost remembers. And it knows who you are."

export * from './types';
export * from './analyzer';
export * from './rule-engine';
export * from './responder';

import prisma from '@/lib/db';
import { eventBus } from '../event-bus';
import { behavioralAnalyzer } from './analyzer';
import { ruleEngine } from './rule-engine';
import { autoResponder } from './responder';
import { SentinelAlertData, AlertSeverity, ResponseAction } from './types';

/**
 * The Sentinel Service - The Ghost's Security Consciousness
 * 
 * Monitors for threats, detects anomalies, and responds automatically.
 * The Ghost remembers everything. And it knows who you are.
 */
export class SentinelService {
  /**
   * Process an event through the Sentinel
   */
  async processEvent(event: {
    type: string;
    payload: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    // Evaluate all rules against this event
    const alerts = await ruleEngine.evaluateEvent(event);

    // Create alerts and trigger auto-responses
    for (const alertData of alerts) {
      await this.createAlert(alertData);
    }

    // Special handling for user activity events
    if (event.type.startsWith('user.') && event.payload.userId) {
      await this.analyzeUserActivity(event);
    }
  }

  /**
   * Analyze user activity for anomalies
   */
  async analyzeUserActivity(event: {
    type: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    const userId = event.payload.userId as string;
    const action = event.payload.action as string || event.type;
    const resource = event.payload.resource as string || 'unknown';
    const ipAddress = event.payload.ipAddress as string | undefined;

    // Analyze for anomalies
    const result = await behavioralAnalyzer.analyzeUserAction({
      userId,
      action,
      resource,
      ipAddress,
    });

    if (result.isAnomaly) {
      // Create anomaly alert
      await this.createAlert({
        type: 'anomaly',
        severity: result.riskScore >= 75 ? 'high' : 'medium',
        category: 'security',
        source: 'behavioral_analysis',
        targetType: 'user',
        targetId: userId,
        title: 'Behavioral Anomaly Detected',
        description: result.recommendation,
        evidence: {
          factors: result.factors,
          riskScore: result.riskScore,
          confidence: result.confidence,
        },
        riskScore: result.riskScore,
        confidence: result.confidence,
      });
    } else {
      // Update behavioral profile with normal activity
      await behavioralAnalyzer.updateProfile({
        userId,
        action,
        resource,
        ipAddress,
      });
    }
  }

  /**
   * Create a new alert
   */
  async createAlert(data: SentinelAlertData): Promise<string> {
    // Check for existing similar alert (dedup)
    const existing = await prisma.sentinelAlert.findFirst({
      where: {
        type: data.type,
        targetType: data.targetType,
        targetId: data.targetId,
        status: { in: ['open', 'acknowledged', 'investigating'] },
        detectedAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
      },
    });

    if (existing) {
      // Increment occurrence count instead of creating new
      await prisma.sentinelAlert.update({
        where: { id: existing.id },
        data: {
          occurrenceCount: { increment: 1 },
          evidence: data.evidence ? JSON.parse(JSON.stringify(data.evidence)) : undefined,
          riskScore: Math.max(existing.riskScore, data.riskScore || 50),
        },
      });

      return existing.id;
    }

    // Create new alert
    const alert = await prisma.sentinelAlert.create({
      data: {
        type: data.type,
        severity: data.severity,
        category: data.category,
        source: data.source,
        triggerId: data.triggerId,
        targetType: data.targetType,
        targetId: data.targetId,
        targetName: data.targetName,
        title: data.title,
        description: data.description,
        evidence: data.evidence ? JSON.parse(JSON.stringify(data.evidence)) : {},
        riskScore: data.riskScore || 50,
        confidence: data.confidence || 0.8,
        status: 'open',
      },
    });

    // Emit alert event
    await eventBus.publish({
      source: 'system',
      type: 'sentinel.alert.created',
      priority: this.mapSeverityToPriority(data.severity),
      payload: {
        alertId: alert.id,
        type: data.type,
        severity: data.severity,
        title: data.title,
        targetType: data.targetType,
        targetId: data.targetId,
      },
    });

    // Check for auto-response rules
    const rule = data.triggerId
      ? await prisma.sentinelRule.findUnique({
          where: { id: data.triggerId },
        })
      : null;

    if (rule?.autoRespond && rule.responseActions) {
      const actions = rule.responseActions as unknown as ResponseAction[];
      await autoResponder.executeResponse(alert.id, actions, {
        targetType: data.targetType,
        targetId: data.targetId,
        severity: data.severity,
      });
    }

    return alert.id;
  }

  /**
   * Get open alerts
   */
  async getAlerts(params?: {
    status?: string;
    severity?: string;
    type?: string;
    limit?: number;
  }) {
    return prisma.sentinelAlert.findMany({
      where: {
        status: params?.status,
        severity: params?.severity,
        type: params?.type,
      },
      orderBy: [
        { severity: 'asc' }, // Critical first
        { detectedAt: 'desc' },
      ],
      take: params?.limit || 100,
    });
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy?: string): Promise<void> {
    await prisma.sentinelAlert.update({
      where: { id: alertId },
      data: {
        status: 'acknowledged',
        acknowledgedAt: new Date(),
        assignedTo: acknowledgedBy,
      },
    });

    await eventBus.publish({
      source: 'system',
      type: 'sentinel.alert.acknowledged',
      payload: { alertId, acknowledgedBy },
    });
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(
    alertId: string,
    resolution: string,
    resolvedBy?: string,
    isFalsePositive: boolean = false
  ): Promise<void> {
    await prisma.sentinelAlert.update({
      where: { id: alertId },
      data: {
        status: isFalsePositive ? 'false_positive' : 'resolved',
        resolvedAt: new Date(),
        resolvedBy,
        resolution,
      },
    });

    await eventBus.publish({
      source: 'system',
      type: 'sentinel.alert.resolved',
      payload: { alertId, resolution, resolvedBy, isFalsePositive },
    });
  }

  /**
   * Get alert statistics
   */
  async getAlertStats() {
    const [total, open, critical, resolved24h] = await Promise.all([
      prisma.sentinelAlert.count(),
      prisma.sentinelAlert.count({ where: { status: 'open' } }),
      prisma.sentinelAlert.count({ where: { severity: 'critical', status: 'open' } }),
      prisma.sentinelAlert.count({
        where: {
          status: 'resolved',
          resolvedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const bySeverity = await prisma.sentinelAlert.groupBy({
      by: ['severity'],
      where: { status: 'open' },
      _count: true,
    });

    const byType = await prisma.sentinelAlert.groupBy({
      by: ['type'],
      where: { status: 'open' },
      _count: true,
    });

    return {
      total,
      open,
      critical,
      resolved24h,
      bySeverity: Object.fromEntries(bySeverity.map((s) => [s.severity, s._count])),
      byType: Object.fromEntries(byType.map((t) => [t.type, t._count])),
    };
  }

  private mapSeverityToPriority(
    severity: AlertSeverity
  ): 'critical' | 'high' | 'normal' | 'low' {
    switch (severity) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'normal';
      case 'low':
        return 'low';
    }
  }
}

export const sentinelService = new SentinelService();

// Initialize default rules
export async function initializeSentinelRules() {
  const existingRules = await prisma.sentinelRule.count();
  if (existingRules > 0) return;

  const defaultRules = [
    {
      name: 'Failed Login Threshold',
      description: 'Alert on multiple failed login attempts',
      type: 'threshold',
      category: 'security',
      condition: {
        field: 'action',
        operator: 'eq',
        value: 'login_failed',
      },
      threshold: {
        metric: 'count',
        operator: 'gte',
        value: 5,
        duration: 300, // 5 minutes
      },
      triggerOn: 'event',
      eventTypes: ['user.login_failed'],
      severity: 'high',
      autoRespond: true,
      responseActions: [
        { type: 'notify', config: { channels: ['admin'] } },
        { type: 'lock_user', config: { duration: 1800000 } }, // 30 min
      ],
    },
    {
      name: 'Agent Failure',
      description: 'Alert when an agent fails',
      type: 'pattern',
      category: 'operational',
      condition: {
        field: 'status',
        operator: 'eq',
        value: 'failed',
      },
      triggerOn: 'event',
      eventTypes: ['agent.failed'],
      severity: 'high',
      autoRespond: false,
    },
    {
      name: 'Heartbeat Flatline',
      description: 'Alert when a component stops responding',
      type: 'pattern',
      category: 'operational',
      condition: {
        field: 'type',
        operator: 'eq',
        value: 'flatline',
      },
      triggerOn: 'event',
      eventTypes: ['heartbeat.flatline'],
      severity: 'critical',
      autoRespond: true,
      responseActions: [
        { type: 'notify', config: { channels: ['admin', 'ops'] } },
        { type: 'escalate', config: { escalateTo: ['admin'] } },
      ],
    },
    {
      name: 'Workflow Failure',
      description: 'Alert when a workflow fails',
      type: 'pattern',
      category: 'operational',
      condition: {
        field: 'status',
        operator: 'eq',
        value: 'failed',
      },
      triggerOn: 'event',
      eventTypes: ['workflow.failed'],
      severity: 'medium',
      autoRespond: false,
    },
  ];

  for (const rule of defaultRules) {
    await ruleEngine.createRule(rule as Parameters<typeof ruleEngine.createRule>[0]);
  }

  console.log('[Sentinel] Initialized default rules');
}
