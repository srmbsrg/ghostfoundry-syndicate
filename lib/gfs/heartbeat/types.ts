// GFS Heartbeat - Type Definitions

export type ComponentType = 'system' | 'agent' | 'database' | 'api' | 'integration' | 'workflow' | 'factory';

export type HealthStatus = 'healthy' | 'degraded' | 'critical' | 'offline' | 'unknown';

export interface ComponentHealth {
  component: ComponentType;
  componentId?: string;
  componentName?: string;
  status: HealthStatus;
  statusMessage?: string;
  latency?: number;
  uptime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  errorRate?: number;
  requestCount?: number;
  customMetrics?: Record<string, number | string>;
  lastHeartbeat: Date;
  missedBeats: number;
  consecutiveFails: number;
}

export interface HeartbeatConfig {
  intervalMs: number;        // How often to check (default: 30000)
  timeoutMs: number;         // How long to wait for response (default: 5000)
  maxMissedBeats: number;    // Before marking as degraded (default: 3)
  criticalThreshold: number; // Missed beats before critical (default: 5)
  offlineThreshold: number;  // Missed beats before offline (default: 10)
}

export interface SystemHealthSummary {
  overallStatus: HealthStatus;
  healthScore: number;  // 0-100
  components: ComponentHealthSummary[];
  alerts: {
    critical: number;
    warning: number;
  };
  metrics: {
    agentCount: number;
    activeAgents: number;
    healthyAgents: number;
    workflowsActive: number;
    workflowsFailed: number;
    tasksQueued: number;
    tasksFailed: number;
    avgLatency?: number;
    errorRate?: number;
  };
  lastUpdate: Date;
}

export interface ComponentHealthSummary {
  component: ComponentType;
  status: HealthStatus;
  count: number;
  healthy: number;
  degraded: number;
  critical: number;
  offline: number;
}

export interface HeartbeatEvent {
  type: 'pulse' | 'status_change' | 'flatline' | 'recovery';
  component: ComponentType;
  componentId?: string;
  previousStatus?: HealthStatus;
  currentStatus: HealthStatus;
  timestamp: Date;
  details?: Record<string, unknown>;
}

export const DEFAULT_HEARTBEAT_CONFIG: HeartbeatConfig = {
  intervalMs: 30000,        // 30 seconds
  timeoutMs: 5000,          // 5 seconds
  maxMissedBeats: 3,        // Degraded after 3 missed
  criticalThreshold: 5,     // Critical after 5 missed
  offlineThreshold: 10,     // Offline after 10 missed
};
