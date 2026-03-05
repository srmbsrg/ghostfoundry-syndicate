/**
 * Dark Factory Type Definitions
 * The code generation pipeline that builds itself
 */

// ============================================
// INTENT PARSING
// ============================================

export interface GenerationRequest {
  id: string;
  prompt: string;                    // Natural language request
  context?: RequestContext;
  priority: 'low' | 'normal' | 'high' | 'critical';
  requestedBy: string;               // Agent ID or 'human'
  createdAt: Date;
}

export interface RequestContext {
  businessDomain?: string;           // e.g., 'finance', 'operations', 'sales'
  existingEntities?: string[];       // Related DB models/APIs
  constraints?: string[];            // Security, compliance requirements
  targetEnvironment?: 'dev' | 'staging' | 'prod';
}

export interface ParsedIntent {
  requestId: string;
  type: IntentType;
  entities: ExtractedEntity[];
  actions: RequiredAction[];
  dependencies: string[];
  confidence: number;                // 0-1 confidence score
  rawPrompt: string;
}

export type IntentType = 
  | 'create_api_endpoint'
  | 'create_db_model'
  | 'create_ui_component'
  | 'create_integration'
  | 'create_agent'
  | 'modify_existing'
  | 'create_workflow'
  | 'unknown';

export interface ExtractedEntity {
  name: string;
  type: 'model' | 'endpoint' | 'component' | 'agent' | 'workflow';
  properties: Record<string, unknown>;
  relationships: EntityRelationship[];
}

export interface EntityRelationship {
  targetEntity: string;
  type: 'has_many' | 'belongs_to' | 'has_one' | 'many_to_many';
}

export interface RequiredAction {
  type: 'generate' | 'modify' | 'delete' | 'test' | 'deploy';
  target: string;
  params: Record<string, unknown>;
}

// ============================================
// CODE GENERATION
// ============================================

export interface GenerationTask {
  id: string;
  requestId: string;
  intent: ParsedIntent;
  status: TaskStatus;
  stages: GenerationStage[];
  artifacts: GeneratedArtifact[];
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export type TaskStatus = 
  | 'queued'
  | 'parsing'
  | 'generating'
  | 'validating'
  | 'testing'
  | 'awaiting_approval'
  | 'deploying'
  | 'completed'
  | 'failed'
  | 'rolled_back';

export interface GenerationStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  output?: unknown;
  error?: string;
}

export interface GeneratedArtifact {
  id: string;
  taskId: string;
  type: ArtifactType;
  path: string;                      // File path relative to project root
  content: string;                   // Generated code
  checksum: string;                  // For integrity verification
  version: number;
  createdAt: Date;
}

export type ArtifactType = 
  | 'prisma_model'
  | 'api_route'
  | 'react_component'
  | 'typescript_type'
  | 'test_file'
  | 'integration'
  | 'agent_definition';

// ============================================
// VALIDATION
// ============================================

export interface ValidationResult {
  taskId: string;
  passed: boolean;
  checks: ValidationCheck[];
  score: number;                     // 0-100
  canDeploy: boolean;
  requiresHumanReview: boolean;
}

export interface ValidationCheck {
  name: string;
  type: 'syntax' | 'type' | 'security' | 'test' | 'lint' | 'custom';
  passed: boolean;
  message?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

// ============================================
// DEPLOYMENT
// ============================================

export interface DeploymentRequest {
  taskId: string;
  artifacts: string[];               // Artifact IDs to deploy
  environment: 'dev' | 'staging' | 'prod';
  approvedBy?: string;
  rollbackOnFailure: boolean;
}

export interface DeploymentResult {
  taskId: string;
  success: boolean;
  deployedArtifacts: string[];
  failedArtifacts: string[];
  rollbackPerformed: boolean;
  logs: string[];
}

// ============================================
// QUEUE & EVENTS
// ============================================

export interface QueuedJob {
  id: string;
  type: 'generation' | 'validation' | 'deployment';
  payload: unknown;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  processAfter?: Date;
}

export interface FactoryEvent {
  id: string;
  type: FactoryEventType;
  taskId?: string;
  payload: unknown;
  timestamp: Date;
}

export type FactoryEventType = 
  | 'request_received'
  | 'intent_parsed'
  | 'generation_started'
  | 'generation_completed'
  | 'validation_started'
  | 'validation_completed'
  | 'deployment_started'
  | 'deployment_completed'
  | 'error_occurred'
  | 'human_review_required';
