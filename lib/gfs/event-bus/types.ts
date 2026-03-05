// GFS Event Bus - Type Definitions

export type EventSource = 'system' | 'webhook' | 'schedule' | 'user' | 'agent' | 'factory' | 'integration' | 'observer';

export type EventPriority = 'critical' | 'high' | 'normal' | 'low';

export interface EventPayload {
  [key: string]: unknown;
}

export interface GFSEvent {
  id: string;
  source: EventSource;
  type: string;
  payload: EventPayload;
  timestamp: Date;
  priority?: EventPriority;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, unknown>;
}

export type HandlerType = 'workflow' | 'agent' | 'webhook' | 'function' | 'factory';

export interface EventSubscription {
  id: string;
  eventType: string;
  handlerType: HandlerType;
  handlerId: string;
  isActive: boolean;
  config?: Record<string, unknown>;
  filter?: EventFilter;
}

export interface EventFilter {
  source?: EventSource[];
  priority?: EventPriority[];
  payloadMatch?: Record<string, unknown>;
}

export interface EventHandler {
  type: HandlerType;
  id: string;
  execute: (event: GFSEvent) => Promise<EventHandlerResult>;
}

export interface EventHandlerResult {
  success: boolean;
  output?: unknown;
  error?: string;
  duration?: number;
  emittedEvents?: GFSEvent[];
}

// Standard event types for the GFS ecosystem
export const GFS_EVENT_TYPES = {
  // Agent events
  AGENT_CREATED: 'agent.created',
  AGENT_STARTED: 'agent.started',
  AGENT_COMPLETED: 'agent.completed',
  AGENT_FAILED: 'agent.failed',
  AGENT_PAUSED: 'agent.paused',
  
  // Workflow events
  WORKFLOW_STARTED: 'workflow.started',
  WORKFLOW_STEP_COMPLETED: 'workflow.step.completed',
  WORKFLOW_COMPLETED: 'workflow.completed',
  WORKFLOW_FAILED: 'workflow.failed',
  WORKFLOW_APPROVAL_REQUIRED: 'workflow.approval.required',
  
  // Task events
  TASK_CREATED: 'task.created',
  TASK_ASSIGNED: 'task.assigned',
  TASK_COMPLETED: 'task.completed',
  TASK_FAILED: 'task.failed',
  
  // Factory events
  FACTORY_GENERATION_STARTED: 'factory.generation.started',
  FACTORY_GENERATION_COMPLETED: 'factory.generation.completed',
  FACTORY_DEPLOYMENT_STARTED: 'factory.deployment.started',
  FACTORY_DEPLOYMENT_COMPLETED: 'factory.deployment.completed',
  
  // Integration events
  TELEGRAM_MESSAGE_RECEIVED: 'integration.telegram.message',
  TWILIO_SMS_RECEIVED: 'integration.twilio.sms',
  GITHUB_WEBHOOK_RECEIVED: 'integration.github.webhook',
  
  // Human gate events
  HUMAN_GATE_OPENED: 'humangate.opened',
  HUMAN_GATE_APPROVED: 'humangate.approved',
  HUMAN_GATE_REJECTED: 'humangate.rejected',
  
  // Self-modification events
  SELF_MOD_PROPOSED: 'selfmod.proposed',
  SELF_MOD_APPROVED: 'selfmod.approved',
  SELF_MOD_EXECUTED: 'selfmod.executed',
  SELF_MOD_ROLLED_BACK: 'selfmod.rolledback',
  
  // Intelligence events
  BRIEF_GENERATED: 'intelligence.brief.generated',
  ANOMALY_DETECTED: 'intelligence.anomaly.detected',
  INSIGHT_DISCOVERED: 'intelligence.insight.discovered',
  
  // Heartbeat events
  HEARTBEAT_PULSE: 'heartbeat.pulse',
  HEARTBEAT_STATUS_CHANGE: 'heartbeat.status_change',
  HEARTBEAT_FLATLINE: 'heartbeat.flatline',
  HEARTBEAT_RECOVERY: 'heartbeat.recovery',
  
  // Sentinel events
  SENTINEL_ALERT_CREATED: 'sentinel.alert.created',
  SENTINEL_ALERT_ACKNOWLEDGED: 'sentinel.alert.acknowledged',
  SENTINEL_ALERT_RESOLVED: 'sentinel.alert.resolved',
  SENTINEL_USER_LOCKED: 'sentinel.user_locked',
  SENTINEL_AGENT_SUSPENDED: 'sentinel.agent_suspended',
  SENTINEL_WORKFLOW_RESTARTED: 'sentinel.workflow_restarted',
  SENTINEL_ESCALATED: 'sentinel.escalated',
  SENTINEL_NOTIFICATION: 'sentinel.notification',
} as const;

export type GFSEventType = typeof GFS_EVENT_TYPES[keyof typeof GFS_EVENT_TYPES];
