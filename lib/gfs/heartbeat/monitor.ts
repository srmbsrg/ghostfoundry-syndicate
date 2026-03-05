// GFS Heartbeat - Component Monitor

import prisma from '@/lib/db';
import {
  ComponentType,
  HealthStatus,
  ComponentHealth,
  HeartbeatConfig,
  DEFAULT_HEARTBEAT_CONFIG,
} from './types';

export class ComponentMonitor {
  private config: HeartbeatConfig;

  constructor(config: Partial<HeartbeatConfig> = {}) {
    this.config = { ...DEFAULT_HEARTBEAT_CONFIG, ...config };
  }

  /**
   * Record a heartbeat from a component
   */
  async recordHeartbeat(
    component: ComponentType,
    componentId: string | null,
    metrics: Partial<ComponentHealth>
  ): Promise<ComponentHealth> {
    const existing = await prisma.healthMetric.findFirst({
      where: {
        component,
        componentId: componentId ?? undefined,
      },
      orderBy: { timestamp: 'desc' },
    });

    // Reset missed beats on successful heartbeat
    const healthData: {
      component: ComponentType;
      componentId: string | null;
      componentName: string | undefined;
      status: HealthStatus;
      statusMessage: string | undefined;
      latency: number | undefined;
      uptime: number | undefined;
      memoryUsage: number | undefined;
      cpuUsage: number | undefined;
      errorRate: number | undefined;
      requestCount: number | undefined;
      customMetrics: Record<string, number | string>;
      lastHeartbeat: Date;
      missedBeats: number;
      consecutiveFails: number;
    } = {
      component,
      componentId,
      componentName: metrics.componentName,
      status: 'healthy' as HealthStatus,
      statusMessage: metrics.statusMessage,
      latency: metrics.latency,
      uptime: metrics.uptime,
      memoryUsage: metrics.memoryUsage,
      cpuUsage: metrics.cpuUsage,
      errorRate: metrics.errorRate,
      requestCount: metrics.requestCount,
      customMetrics: metrics.customMetrics || {},
      lastHeartbeat: new Date(),
      missedBeats: 0,
      consecutiveFails: 0,
    };

    // Determine health status based on metrics
    healthData.status = this.calculateStatus({
      errorRate: healthData.errorRate,
      latency: healthData.latency,
      memoryUsage: healthData.memoryUsage,
      cpuUsage: healthData.cpuUsage,
    });

    if (existing) {
      const updated = await prisma.healthMetric.update({
        where: { id: existing.id },
        data: healthData,
      });
      return this.mapToComponentHealth(updated);
    } else {
      const created = await prisma.healthMetric.create({
        data: healthData,
      });
      return this.mapToComponentHealth(created);
    }
  }

  /**
   * Check all components and update their status based on missed heartbeats
   */
  async checkAllComponents(): Promise<ComponentHealth[]> {
    const now = new Date();
    const threshold = new Date(now.getTime() - this.config.intervalMs);

    // Get all latest metrics grouped by component
    const metrics = await prisma.healthMetric.findMany({
      orderBy: { timestamp: 'desc' },
    });

    // Group by component + componentId
    const componentMap = new Map<string, typeof metrics[0]>();
    for (const metric of metrics) {
      const key = `${metric.component}:${metric.componentId || 'system'}`;
      if (!componentMap.has(key)) {
        componentMap.set(key, metric);
      }
    }

    const results: ComponentHealth[] = [];

    for (const [, metric] of componentMap) {
      const lastBeat = new Date(metric.lastHeartbeat);
      const missedIntervals = Math.floor(
        (now.getTime() - lastBeat.getTime()) / this.config.intervalMs
      );

      if (missedIntervals > 0 && metric.status !== 'offline') {
        // Update missed beats
        const newMissedBeats = metric.missedBeats + missedIntervals;
        let newStatus: HealthStatus = metric.status as HealthStatus;

        if (newMissedBeats >= this.config.offlineThreshold) {
          newStatus = 'offline';
        } else if (newMissedBeats >= this.config.criticalThreshold) {
          newStatus = 'critical';
        } else if (newMissedBeats >= this.config.maxMissedBeats) {
          newStatus = 'degraded';
        }

        const updated = await prisma.healthMetric.update({
          where: { id: metric.id },
          data: {
            missedBeats: newMissedBeats,
            consecutiveFails: metric.consecutiveFails + 1,
            status: newStatus,
            statusMessage: `Missed ${newMissedBeats} heartbeats`,
          },
        });

        results.push(this.mapToComponentHealth(updated));
      } else {
        results.push(this.mapToComponentHealth(metric));
      }
    }

    return results;
  }

  /**
   * Get health status for a specific component
   */
  async getComponentHealth(
    component: ComponentType,
    componentId?: string
  ): Promise<ComponentHealth | null> {
    const metric = await prisma.healthMetric.findFirst({
      where: {
        component,
        componentId: componentId ?? undefined,
      },
      orderBy: { timestamp: 'desc' },
    });

    return metric ? this.mapToComponentHealth(metric) : null;
  }

  /**
   * Get all agent health statuses
   */
  async getAgentHealth(): Promise<ComponentHealth[]> {
    const agents = await prisma.agent.findMany();
    const results: ComponentHealth[] = [];

    for (const agent of agents) {
      const metric = await this.getComponentHealth('agent', agent.id);
      if (metric) {
        results.push(metric);
      } else {
        // No heartbeat recorded yet - create initial entry
        results.push({
          component: 'agent',
          componentId: agent.id,
          componentName: agent.name,
          status: agent.status === 'active' ? 'healthy' : 'unknown',
          lastHeartbeat: new Date(),
          missedBeats: 0,
          consecutiveFails: 0,
        });
      }
    }

    return results;
  }

  /**
   * Calculate health status based on metrics
   */
  private calculateStatus(metrics: Partial<ComponentHealth>): HealthStatus {
    // Critical if error rate > 50%
    if (metrics.errorRate && metrics.errorRate > 50) {
      return 'critical';
    }

    // Degraded if error rate > 20% or latency > 5000ms
    if (
      (metrics.errorRate && metrics.errorRate > 20) ||
      (metrics.latency && metrics.latency > 5000)
    ) {
      return 'degraded';
    }

    // Degraded if memory or CPU > 90%
    if (
      (metrics.memoryUsage && metrics.memoryUsage > 90) ||
      (metrics.cpuUsage && metrics.cpuUsage > 90)
    ) {
      return 'degraded';
    }

    return 'healthy';
  }

  private mapToComponentHealth(metric: {
    component: string;
    componentId: string | null;
    componentName: string | null;
    status: string;
    statusMessage: string | null;
    latency: number | null;
    uptime: number | null;
    memoryUsage: number | null;
    cpuUsage: number | null;
    errorRate: number | null;
    requestCount: number | null;
    customMetrics: unknown;
    lastHeartbeat: Date;
    missedBeats: number;
    consecutiveFails: number;
  }): ComponentHealth {
    return {
      component: metric.component as ComponentType,
      componentId: metric.componentId ?? undefined,
      componentName: metric.componentName ?? undefined,
      status: metric.status as HealthStatus,
      statusMessage: metric.statusMessage ?? undefined,
      latency: metric.latency ?? undefined,
      uptime: metric.uptime ?? undefined,
      memoryUsage: metric.memoryUsage ?? undefined,
      cpuUsage: metric.cpuUsage ?? undefined,
      errorRate: metric.errorRate ?? undefined,
      requestCount: metric.requestCount ?? undefined,
      customMetrics: (metric.customMetrics as Record<string, number | string>) ?? {},
      lastHeartbeat: metric.lastHeartbeat,
      missedBeats: metric.missedBeats,
      consecutiveFails: metric.consecutiveFails,
    };
  }
}

export const componentMonitor = new ComponentMonitor();
