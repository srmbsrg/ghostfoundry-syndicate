/**
 * GFS (Ghost Factory Syndicate) Type Definitions
 * The self-aware, self-extending AI operations platform
 */

// ============================================
// SELF-MODEL (The Ghost's Self-Knowledge)
// ============================================

export interface SelfModel {
  id: string;
  version: number;
  lastUpdated: Date;
  capabilities: Capability[];
  knowledgeGraph: KnowledgeNode[];
  businessContext: BusinessContext;
  systemArchitecture: SystemArchitecture;
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  type: CapabilityType;
  status: 'active' | 'degraded' | 'offline';
  dependencies: string[];            // Other capability IDs
  metrics: CapabilityMetrics;
  learnedAt: Date;
}

export type CapabilityType = 
  | 'data_processing'
  | 'decision_making'
  | 'integration'
  | 'generation'
  | 'analysis'
  | 'communication'
  | 'workflow_execution';

export interface CapabilityMetrics {
  invocations: number;
  successRate: number;
  avgLatencyMs: number;
  lastUsed: Date;
}

export interface KnowledgeNode {
  id: string;
  type: 'entity' | 'concept' | 'process' | 'rule' | 'relationship';
  name: string;
  properties: Record<string, unknown>;
  connections: KnowledgeEdge[];
  confidence: number;
  source: 'learned' | 'configured' | 'inferred';
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeEdge {
  targetId: string;
  relationship: string;
  weight: number;
  bidirectional: boolean;
}

export interface BusinessContext {
  companyName: string;
  industry: string;
  departments: Department[];
  processes: BusinessProcess[];
  metrics: BusinessMetric[];
  goals: BusinessGoal[];
}

export interface Department {
  id: string;
  name: string;
  headcount: number;
  systems: string[];
  keyMetrics: string[];
}

export interface BusinessProcess {
  id: string;
  name: string;
  owner: string;
  steps: ProcessStep[];
  automationLevel: number;           // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ProcessStep {
  id: string;
  name: string;
  type: 'manual' | 'automated' | 'hybrid';
  assignedAgent?: string;
  avgDurationMinutes: number;
}

export interface BusinessMetric {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export interface BusinessGoal {
  id: string;
  description: string;
  deadline: Date;
  progress: number;                  // 0-100
  linkedMetrics: string[];
}

export interface SystemArchitecture {
  endpoints: EndpointDefinition[];
  models: ModelDefinition[];
  integrations: IntegrationDefinition[];
  agents: AgentDefinition[];
}

export interface EndpointDefinition {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  createdBy: 'human' | 'factory';
}

export interface ModelDefinition {
  name: string;
  fields: Record<string, string>;
  relationships: string[];
  createdBy: 'human' | 'factory';
}

export interface IntegrationDefinition {
  id: string;
  name: string;
  type: 'telegram' | 'twilio' | 'email' | 'webhook' | 'api';
  status: 'active' | 'inactive' | 'error';
  config: Record<string, unknown>;
}

// ============================================
// AGENTS
// ============================================

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: string[];            // Capability IDs
  personality: AgentPersonality;
  config: AgentConfig;
  metrics: AgentMetrics;
  createdAt: Date;
  createdBy: 'human' | 'factory' | string; // Agent ID if spawned by another agent
}

export type AgentType = 
  | 'operator'          // Executes tasks
  | 'analyst'           // Analyzes data, provides insights
  | 'coordinator'       // Orchestrates other agents
  | 'specialist'        // Domain-specific expertise
  | 'guardian'          // Security, compliance monitoring
  | 'architect'         // Designs/modifies system
  | 'communicator';     // Handles external communications

export type AgentStatus = 
  | 'initializing'
  | 'active'
  | 'busy'
  | 'idle'
  | 'suspended'
  | 'terminated';

export interface AgentPersonality {
  communicationStyle: 'formal' | 'casual' | 'technical';
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  autonomyLevel: number;             // 0-100
  escalationThreshold: number;       // Confidence level below which to escalate
}

export interface AgentConfig {
  maxConcurrentTasks: number;
  timeoutSeconds: number;
  retryPolicy: RetryPolicy;
  permissions: Permission[];
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelayMs: number;
}

export interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete' | 'execute')[];
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  avgTaskDurationMs: number;
  uptime: number;
  lastActive: Date;
}

// ============================================
// OPS ENGINE
// ============================================

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  status: 'draft' | 'active' | 'paused' | 'archived';
  createdBy: string;
  createdAt: Date;
}

export interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'event' | 'condition';
  config: Record<string, unknown>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'agent_task' | 'human_gate' | 'condition' | 'parallel' | 'loop';
  config: Record<string, unknown>;
  onSuccess: string | null;          // Next step ID
  onFailure: string | null;
}

export interface Task {
  id: string;
  workflowId?: string;
  agentId: string;
  type: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface HumanGate {
  id: string;
  taskId: string;
  type: 'approval' | 'review' | 'input';
  prompt: string;
  options?: string[];
  response?: unknown;
  respondedBy?: string;
  respondedAt?: Date;
  deadline?: Date;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
}

// ============================================
// INTELLIGENCE
// ============================================

export interface IntelligenceBrief {
  id: string;
  generatedAt: Date;
  period: 'daily' | 'weekly' | 'monthly';
  executiveSummary: string;
  marketIntel: MarketInsight[];
  opsHealth: OpsHealthMetric[];
  proactiveFixes: ProactiveFix[];
  recommendations: Recommendation[];
}

export interface MarketInsight {
  type: 'competitor' | 'trend' | 'risk' | 'opportunity';
  title: string;
  description: string;
  source: string;
  confidence: number;
  actionable: boolean;
}

export interface OpsHealthMetric {
  name: string;
  value: number;
  change: number;                    // vs previous period
  status: 'healthy' | 'warning' | 'critical';
}

export interface ProactiveFix {
  id: string;
  issue: string;
  resolution: string;
  appliedAt: Date;
  impactScore: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: string;
  requiredApproval: boolean;
}
