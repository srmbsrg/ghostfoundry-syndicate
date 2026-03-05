/**
 * GFS Constitution Types
 * 
 * The immutable rules that govern the Ghost's operational consciousness.
 * These are the baseline laws - the Asimov Rules of self-adapting AI.
 */

// ============================================================================
// AUTONOMY ZONES
// ============================================================================

export type AutonomyZone = 'green' | 'yellow' | 'red';

export interface ZoneRule {
  id: string;
  zone: AutonomyZone;
  category: RuleCategory;
  name: string;
  description: string;
  conditions: RuleCondition[];
  exceptions?: string[];
  enforcedAt: Date;
  immutable: boolean; // Cannot be changed without full restart
}

export type RuleCategory = 
  | 'data_access'        // Reading/writing data
  | 'data_modification'  // Changing/deleting data
  | 'code_generation'    // Creating new code
  | 'code_modification'  // Changing existing code
  | 'agent_management'   // Creating/modifying agents
  | 'workflow_control'   // Managing workflows
  | 'integration'        // External system interactions
  | 'communication'      // External communications
  | 'resource_usage'     // Cost-incurring operations
  | 'security'           // Auth/access control
  | 'compliance'         // Regulatory/legal
  | 'self_modification'; // Changes to the Ghost itself

export interface RuleCondition {
  type: 'scope' | 'threshold' | 'pattern' | 'context' | 'time';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'matches' | 'excludes';
  field: string;
  value: unknown;
}

// ============================================================================
// CIRCUIT BREAKERS
// ============================================================================

export interface CircuitBreaker {
  id: string;
  name: string;
  description: string;
  
  // Trigger conditions
  trigger: {
    metric: string;           // What to measure
    threshold: number;        // When to trip
    window: number;           // Time window in minutes
    operator: 'greater_than' | 'less_than' | 'equals';
  };
  
  // Response when tripped
  response: {
    action: 'pause' | 'throttle' | 'alert' | 'rollback' | 'shutdown';
    duration?: number;        // How long to maintain response
    notifyRoles: string[];    // Who to notify
    autoReset: boolean;       // Can reset automatically?
    resetConditions?: RuleCondition[];
  };
  
  // Current state
  state: 'armed' | 'tripped' | 'cooldown' | 'disabled';
  lastTripped?: Date;
  tripCount: number;
}

// ============================================================================
// INVIOLABLE LAWS
// ============================================================================

export interface InviolableLaw {
  id: string;
  order: number;           // Priority (lower = higher priority)
  name: string;
  description: string;
  rationale: string;       // Why this law exists
  
  // What this law prohibits
  prohibits: {
    actions: string[];     // Prohibited actions
    contexts?: string[];   // Specific contexts where prohibited
  };
  
  // Enforcement
  enforcement: {
    level: 'hard' | 'soft'; // Hard = system enforced, Soft = logged + alerted
    canOverride: boolean;   // Can humans override?
    overrideRequires?: string[]; // Who can override?
  };
  
  // Tracking
  violationAttempts: number;
  lastViolationAttempt?: Date;
}

// ============================================================================
// MEMORY MANDATES
// ============================================================================

export interface MemoryMandate {
  id: string;
  category: MemoryCategory;
  name: string;
  description: string;
  
  // Retention rules
  retention: {
    type: 'forever' | 'duration' | 'conditional';
    duration?: number;        // Days to retain
    condition?: RuleCondition;
  };
  
  // What to remember
  captures: {
    dataTypes: string[];     // Types of data to capture
    events: string[];        // Events that trigger capture
    granularity: 'full' | 'summary' | 'reference';
  };
  
  // Privacy/compliance
  privacy: {
    anonymize: boolean;       // Strip PII before storing
    encrypt: boolean;         // Encrypt at rest
    accessRestricted: boolean; // Limit who can read
  };
}

export type MemoryCategory = 
  | 'decisions'        // All decisions made and outcomes
  | 'feedback'         // Human feedback received
  | 'gaps'             // Gaps detected and resolutions
  | 'performance'      // Performance metrics over time
  | 'preferences'      // User/org preferences
  | 'errors'           // Errors and failures
  | 'interactions'     // External interactions
  | 'audit';           // Compliance audit trail

// ============================================================================
// LEARNING CONSTRAINTS
// ============================================================================

export interface LearningConstraint {
  id: string;
  name: string;
  description: string;
  
  // What can be learned from
  sources: {
    allowedTypes: LearningSource[];
    excludedContexts?: string[];
  };
  
  // How learning is applied
  application: {
    requiresValidation: boolean;  // Must validate before applying
    minConfidence: number;        // Minimum confidence to apply
    stagingRequired: boolean;     // Must stage before production
    humanReviewThreshold: number; // Confidence below this triggers review
  };
  
  // Guardrails
  guardrails: {
    maxChangePerCycle: number;    // Max % change in single cycle
    cooldownBetweenChanges: number; // Minutes between learning applications
    rollbackWindow: number;       // Minutes to auto-rollback if issues
  };
}

export type LearningSource =
  | 'successful_modifications' // Learn from what worked
  | 'failed_modifications'     // Learn from what didn't work
  | 'human_feedback'           // Explicit human input
  | 'user_behavior'            // Implicit user patterns
  | 'performance_metrics'      // System performance data
  | 'external_knowledge';      // External data sources

// ============================================================================
// CONSTITUTION AGGREGATE
// ============================================================================

export interface GFSConstitution {
  version: string;
  effectiveDate: Date;
  lastAmended?: Date;
  
  // The rules
  zoneRules: ZoneRule[];
  circuitBreakers: CircuitBreaker[];
  inviolableLaws: InviolableLaw[];
  memoryMandates: MemoryMandate[];
  learningConstraints: LearningConstraint[];
  
  // Meta
  amendmentHistory: ConstitutionAmendment[];
}

export interface ConstitutionAmendment {
  id: string;
  date: Date;
  description: string;
  changedBy: string;
  previousValue?: unknown;
  newValue: unknown;
  rationale: string;
}
