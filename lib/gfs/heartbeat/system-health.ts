// GFS Heartbeat - System Health Aggregator

import prisma from '@/lib/db';
import { ComponentMonitor, componentMonitor } from './monitor';
import {
  HealthStatus,
  SystemHealthSummary,
  ComponentHealthSummary,
  ComponentType,
} from './types';

export class SystemHealthAggregator {
  private monitor: ComponentMonitor;

  constructor(monitor: ComponentMonitor = componentMonitor) {
    this.monitor = monitor;
  }

  /**
   * Get comprehensive system health snapshot
   */
  async getSystemHealth(): Promise<SystemHealthSummary> {
    // Check all components and update statuses
    const componentHealth = await this.monitor.checkAllComponents();

    // Get agent stats
    const agents = await prisma.agent.findMany();
    const activeAgents = agents.filter((a) => a.status === 'active' || a.status === 'busy');
    const agentHealth = componentHealth.filter((c) => c.component === 'agent');
    const healthyAgents = agentHealth.filter((a) => a.status === 'healthy');

    // Get workflow stats
    const workflows = await prisma.workflowExecution.findMany({
      where: {
        status: { in: ['running', 'pending'] },
      },
    });
    const failedWorkflows = await prisma.workflowExecution.count({
      where: {
        status: 'failed',
        completedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    // Get task stats
    const queuedTasks = await prisma.task.count({
      where: { status: 'pending' },
    });
    const failedTasks = await prisma.task.count({
      where: {
        status: 'failed',
        completedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    // Get alert counts
    const criticalAlerts = await prisma.sentinelAlert.count({
      where: { severity: 'critical', status: 'open' },
    });
    const warningAlerts = await prisma.sentinelAlert.count({
      where: { severity: { in: ['high', 'medium'] }, status: 'open' },
    });

    // Calculate component summaries
    const componentSummaries = this.aggregateByComponent(componentHealth);

    // Calculate overall health score
    const healthScore = this.calculateHealthScore({
      componentHealth,
      criticalAlerts,
      warningAlerts,
      failedWorkflows,
      failedTasks,
    });

    // Determine overall status
    const overallStatus = this.determineOverallStatus(healthScore, componentHealth);

    // Calculate average latency
    const latencies = componentHealth
      .filter((c) => c.latency !== undefined)
      .map((c) => c.latency as number);
    const avgLatency =
      latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : undefined;

    // Calculate error rate
    const errorRates = componentHealth
      .filter((c) => c.errorRate !== undefined)
      .map((c) => c.errorRate as number);
    const errorRate =
      errorRates.length > 0
        ? errorRates.reduce((a, b) => a + b, 0) / errorRates.length
        : undefined;

    const summary: SystemHealthSummary = {
      overallStatus,
      healthScore,
      components: componentSummaries,
      alerts: {
        critical: criticalAlerts,
        warning: warningAlerts,
      },
      metrics: {
        agentCount: agents.length,
        activeAgents: activeAgents.length,
        healthyAgents: healthyAgents.length,
        workflowsActive: workflows.length,
        workflowsFailed: failedWorkflows,
        tasksQueued: queuedTasks,
        tasksFailed: failedTasks,
        avgLatency,
        errorRate,
      },
      lastUpdate: new Date(),
    };

    // Save snapshot
    await this.saveSnapshot(summary);

    return summary;
  }

  /**
   * Get recent health history
   */
  async getHealthHistory(hours: number = 24): Promise<SystemHealthSummary[]> {
    const snapshots = await prisma.systemHealthSnapshot.findMany({
      where: {
        timestamp: { gte: new Date(Date.now() - hours * 60 * 60 * 1000) },
      },
      orderBy: { timestamp: 'asc' },
      take: 100,
    });

    return snapshots.map((s) => ({
      overallStatus: s.overallStatus as HealthStatus,
      healthScore: s.healthScore,
      components: [], // Simplified for history
      alerts: {
        critical: s.criticalAlerts,
        warning: s.warningAlerts,
      },
      metrics: {
        agentCount: s.agentCount,
        activeAgents: s.activeAgents,
        healthyAgents: s.healthyAgents,
        workflowsActive: s.workflowsActive,
        workflowsFailed: s.workflowsFailed,
        tasksQueued: s.tasksQueued,
        tasksFailed: s.tasksFailed,
        avgLatency: s.avgLatency ?? undefined,
        errorRate: s.errorRate ?? undefined,
      },
      lastUpdate: s.timestamp,
    }));
  }

  private aggregateByComponent(
    health: { component: ComponentType; status: HealthStatus }[]
  ): ComponentHealthSummary[] {
    const componentTypes: ComponentType[] = [
      'system',
      'agent',
      'database',
      'api',
      'integration',
      'workflow',
      'factory',
    ];

    return componentTypes.map((component) => {
      const items = health.filter((h) => h.component === component);
      return {
        component,
        status: this.worstStatus(items.map((i) => i.status)),
        count: items.length,
        healthy: items.filter((i) => i.status === 'healthy').length,
        degraded: items.filter((i) => i.status === 'degraded').length,
        critical: items.filter((i) => i.status === 'critical').length,
        offline: items.filter((i) => i.status === 'offline').length,
      };
    });
  }

  private worstStatus(statuses: HealthStatus[]): HealthStatus {
    if (statuses.includes('offline')) return 'offline';
    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('degraded')) return 'degraded';
    if (statuses.includes('unknown')) return 'unknown';
    return 'healthy';
  }

  private calculateHealthScore(params: {
    componentHealth: { status: HealthStatus }[];
    criticalAlerts: number;
    warningAlerts: number;
    failedWorkflows: number;
    failedTasks: number;
  }): number {
    let score = 100;

    // Deduct for component health
    for (const c of params.componentHealth) {
      if (c.status === 'offline') score -= 15;
      else if (c.status === 'critical') score -= 10;
      else if (c.status === 'degraded') score -= 5;
    }

    // Deduct for alerts
    score -= params.criticalAlerts * 10;
    score -= params.warningAlerts * 3;

    // Deduct for failures
    score -= params.failedWorkflows * 2;
    score -= params.failedTasks * 1;

    return Math.max(0, Math.min(100, score));
  }

  private determineOverallStatus(
    score: number,
    health: { status: HealthStatus }[]
  ): HealthStatus {
    // Any offline = overall offline
    if (health.some((h) => h.status === 'offline')) return 'offline';

    // Score-based
    if (score >= 80) return 'healthy';
    if (score >= 50) return 'degraded';
    return 'critical';
  }

  private async saveSnapshot(summary: SystemHealthSummary): Promise<void> {
    await prisma.systemHealthSnapshot.create({
      data: {
        overallStatus: summary.overallStatus,
        healthScore: summary.healthScore,
        agentCount: summary.metrics.agentCount,
        activeAgents: summary.metrics.activeAgents,
        healthyAgents: summary.metrics.healthyAgents,
        workflowsActive: summary.metrics.workflowsActive,
        workflowsFailed: summary.metrics.workflowsFailed,
        tasksQueued: summary.metrics.tasksQueued,
        tasksFailed: summary.metrics.tasksFailed,
        avgLatency: summary.metrics.avgLatency,
        errorRate: summary.metrics.errorRate,
        criticalAlerts: summary.alerts.critical,
        warningAlerts: summary.alerts.warning,
        componentHealth: JSON.parse(JSON.stringify(summary.components)),
      },
    });
  }
}

export const systemHealthAggregator = new SystemHealthAggregator();
