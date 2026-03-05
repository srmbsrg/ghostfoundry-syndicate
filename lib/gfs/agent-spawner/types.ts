/**
 * Agent Spawning System Types
 * 
 * Dynamic agent instantiation, lifecycle management, and capability inheritance.
 * Allows the Ghost to spawn new workers on demand without system restart.
 */

export type AgentStatus = 'initializing' | 'active' | 'idle' | 'paused' | 'terminated' | 'error';

export type AgentType = 
  | 'document_processor'
  | 'data_analyzer'
  | 'communication'
  | 'monitoring'
  | 'content_creator'
  | 'integration'
  | 'orchestrator'
  | 'custom';

export type CapabilityType =
  | 'document_extraction'
  | 'data_validation'
  | 'email_analysis'
  | 'response_drafting'
  | 'metric_analysis'
  | 'anomaly_detection'
  | 'report_generation'
  | 'api_integration'
  | 'workflow_execution'
  | 'llm_reasoning'
  | 'memory_access'
  | 'event_publishing'
  | 'human_escalation';

/**
 * Agent template - blueprint for creating agents
 */
export interface AgentTemplate {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  version: string;
  
  // Capabilities this agent type has
  capabilities: CapabilityType[];
  
  // Configuration schema
  configSchema: ConfigSchema;
  
  // Default configuration values
  defaultConfig: Record<string, unknown>;
  
  // Parent template ID for inheritance
  extendsTemplate?: string;
  
  // Required resources
  resources: AgentResources;
  
  // Initialization hooks
  hooks?: AgentHooks;
  
  // Tags for categorization
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfigSchema {
  type: 'object';
  properties: Record<string, ConfigProperty>;
  required: string[];
}

export interface ConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  default?: unknown;
  enum?: unknown[];
  items?: ConfigProperty;
}

export interface AgentResources {
  maxConcurrentTasks: number;
  memoryMB: number;
  cpuPercent: number;
  timeoutSeconds: number;
  retryAttempts: number;
}

export interface AgentHooks {
  onInit?: string;       // Function name to call on initialization
  onTaskStart?: string;  // Function name to call before each task
  onTaskEnd?: string;    // Function name to call after each task
  onError?: string;      // Function name to call on error
  onShutdown?: string;   // Function name to call on shutdown
}

/**
 * Agent instance - a running agent
 */
export interface AgentInstance {
  id: string;
  templateId: string;
  name: string;
  status: AgentStatus;
  
  // Runtime configuration
  config: Record<string, unknown>;
  
  // Inherited + own capabilities
  capabilities: CapabilityType[];
  
  // Current task (if any)
  currentTask?: TaskInfo;
  
  // Performance metrics
  metrics: AgentMetrics;
  
  // Health status
  health: AgentHealth;
  
  // Lifecycle timestamps
  createdAt: Date;
  startedAt?: Date;
  lastActiveAt?: Date;
  terminatedAt?: Date;
  
  // Error state (if status is 'error')
  error?: AgentError;
}

export interface TaskInfo {
  id: string;
  description: string;
  startedAt: Date;
  progress: number;
  metadata?: Record<string, unknown>;
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  successRate: number;
  averageTaskDuration: number; // seconds
  totalRuntime: number; // seconds
  memoryUsageMB: number;
  lastErrorAt?: Date;
}

export interface AgentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  issues: HealthIssue[];
}

export interface HealthIssue {
  type: 'memory' | 'performance' | 'errors' | 'timeout' | 'dependency';
  severity: 'warning' | 'critical';
  message: string;
  detectedAt: Date;
}

export interface AgentError {
  code: string;
  message: string;
  stack?: string;
  occurredAt: Date;
  recoverable: boolean;
}

/**
 * Spawn request - request to create a new agent
 */
export interface SpawnRequest {
  templateId: string;
  name?: string;  // Optional custom name
  config?: Record<string, unknown>;  // Override default config
  autoStart?: boolean;  // Start immediately after creation
  tags?: string[];  // Additional tags
}

/**
 * Spawn result
 */
export interface SpawnResult {
  success: boolean;
  agentId?: string;
  agent?: AgentInstance;
  error?: string;
}

/**
 * Agent command - control commands for running agents
 */
export type AgentCommand = 
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'terminate' }
  | { type: 'restart' }
  | { type: 'updateConfig'; config: Record<string, unknown> }
  | { type: 'assignTask'; task: TaskAssignment };

export interface TaskAssignment {
  id: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  payload: Record<string, unknown>;
  deadline?: Date;
  callbackUrl?: string;
}

/**
 * Agent pool - group of similar agents
 */
export interface AgentPool {
  id: string;
  name: string;
  templateId: string;
  minInstances: number;
  maxInstances: number;
  currentInstances: number;
  scalingPolicy: ScalingPolicy;
  agents: string[];  // Agent instance IDs
}

export interface ScalingPolicy {
  type: 'fixed' | 'auto';
  targetUtilization?: number;  // For auto-scaling (0-100)
  scaleUpThreshold?: number;
  scaleDownThreshold?: number;
  cooldownSeconds?: number;
}
