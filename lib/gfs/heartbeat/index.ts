// GFS Heartbeat - Main Entry Point
// "Continuous pulse monitoring—if it stops, we know before you do."

export * from './types';
export * from './monitor';
export * from './system-health';

import { componentMonitor } from './monitor';
import { systemHealthAggregator } from './system-health';
import { eventBus } from '../event-bus';
import { ComponentType, HealthStatus, HeartbeatEvent } from './types';

/**
 * The Heartbeat Service - The Ghost's Pulse
 * 
 * Monitors all system components, tracks health, and emits events
 * when something flatlines.
 */
export class HeartbeatService {
  private isRunning = false;
  private intervalHandle?: NodeJS.Timeout;

  /**
   * Record a heartbeat from a component
   */
  async pulse(
    component: ComponentType,
    componentId?: string,
    metrics?: {
      componentName?: string;
      latency?: number;
      errorRate?: number;
      memoryUsage?: number;
      cpuUsage?: number;
      customMetrics?: Record<string, number | string>;
    }
  ): Promise<void> {
    const previousHealth = await componentMonitor.getComponentHealth(
      component,
      componentId
    );

    const currentHealth = await componentMonitor.recordHeartbeat(
      component,
      componentId ?? null,
      metrics || {}
    );

    // Emit event if status changed
    if (previousHealth && previousHealth.status !== currentHealth.status) {
      const event: HeartbeatEvent = {
        type: currentHealth.status === 'healthy' ? 'recovery' : 'status_change',
        component,
        componentId,
        previousStatus: previousHealth.status,
        currentStatus: currentHealth.status,
        timestamp: new Date(),
        details: { metrics },
      };

      await this.emitHeartbeatEvent(event);
    }
  }

  /**
   * Get current system health
   */
  async getHealth() {
    return systemHealthAggregator.getSystemHealth();
  }

  /**
   * Get health history
   */
  async getHistory(hours: number = 24) {
    return systemHealthAggregator.getHealthHistory(hours);
  }

  /**
   * Check all components for missed heartbeats
   * This should be called periodically (e.g., every 30 seconds)
   */
  async checkPulse(): Promise<void> {
    const health = await componentMonitor.checkAllComponents();

    // Emit flatline events for critical/offline components
    for (const component of health) {
      if (component.status === 'critical' || component.status === 'offline') {
        const event: HeartbeatEvent = {
          type: 'flatline',
          component: component.component,
          componentId: component.componentId,
          currentStatus: component.status,
          timestamp: new Date(),
          details: {
            missedBeats: component.missedBeats,
            consecutiveFails: component.consecutiveFails,
            lastHeartbeat: component.lastHeartbeat,
          },
        };

        await this.emitHeartbeatEvent(event);
      }
    }
  }

  /**
   * Start automatic pulse checking
   */
  start(intervalMs: number = 30000): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.intervalHandle = setInterval(() => {
      this.checkPulse().catch(console.error);
    }, intervalMs);

    console.log(`[Heartbeat] Started with ${intervalMs}ms interval`);
  }

  /**
   * Stop automatic pulse checking
   */
  stop(): void {
    if (!this.isRunning) return;

    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }
    this.isRunning = false;

    console.log('[Heartbeat] Stopped');
  }

  private async emitHeartbeatEvent(event: HeartbeatEvent): Promise<void> {
    const eventType = `heartbeat.${event.type}`;
    const priority =
      event.type === 'flatline'
        ? 'critical'
        : event.type === 'recovery'
        ? 'normal'
        : 'high';

    await eventBus.publish({
      source: 'system',
      type: eventType,
      priority,
      payload: {
        component: event.component,
        componentId: event.componentId,
        previousStatus: event.previousStatus,
        currentStatus: event.currentStatus,
        details: event.details,
      },
    });
  }
}

export const heartbeatService = new HeartbeatService();
