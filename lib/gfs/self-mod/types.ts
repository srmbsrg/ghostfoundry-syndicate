/**
 * Self-Modification Engine Types
 * 
 * The recursive self-improvement system that allows the Ghost to:
 * 1. Detect gaps in its own capabilities
 * 2. Propose modifications to fill those gaps
 * 3. Route proposals through human gates when needed
 * 4. Execute changes via the Dark Factory
 * 5. Validate and rollback if something breaks
 */

export type GapType = 
  | 'missing_capability'      // Capability that should exist but doesn't
  | 'failed_task'             // Task that failed due to missing functionality
  | 'performance_bottleneck'  // Slow or inefficient operation
  | 'integration_gap'         // Missing external integration
  | 'user_feedback'           // User requested feature/fix
  | 'pattern_detected'        // Recurring manual workaround detected
  | 'security_vulnerability'  // Security issue identified
  | 'compliance_gap';         // Compliance requirement not met

export type RiskLevel = 
  | 'minimal'     // No approval needed, auto-execute
  | 'low'         // Single reviewer approval
  | 'medium'      // Multiple reviewer approval
  | 'high'        // Executive approval + staged rollout
  | 'critical';   // Full board approval, sandbox testing required

export type ModificationType =
  | 'new_endpoint'       // Create new API endpoint
  | 'new_agent'          // Spawn new agent type
  | 'new_integration'    // Add external integration
  | 'schema_change'      // Modify database schema
  | 'workflow_update'    // Modify existing workflow
  | 'capability_extend'  // Extend existing capability
  | 'bugfix'             // Fix identified bug
  | 'optimization'       // Performance improvement
  | 'security_patch';    // Security fix

export type ProposalStatus =
  | 'draft'           // Initial creation
  | 'analyzing'       // Risk assessment in progress
  | 'pending_review'  // Awaiting human approval
  | 'approved'        // Approved, ready to execute
  | 'rejected'        // Rejected by reviewer
  | 'executing'       // Currently being implemented
  | 'validating'      // Post-execution validation
  | 'completed'       // Successfully deployed
  | 'failed'          // Execution failed
  | 'rolled_back';    // Changes reverted

export interface GapAnalysis {
  id: string;
  type: GapType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence: GapEvidence[];
  suggestedFix?: string;
  affectedComponents: string[];
  detectedAt: Date;
  source: 'automated' | 'user_feedback' | 'monitoring' | 'audit';
}

export interface GapEvidence {
  type: 'error_log' | 'failed_task' | 'user_request' | 'metric' | 'pattern';
  data: Record<string, unknown>;
  timestamp: Date;
  frequency?: number; // How often this evidence occurs
}

export interface ModificationProposal {
  id: string;
  gapId?: string; // Link to the gap this addresses
  type: ModificationType;
  title: string;
  description: string;
  rationale: string;
  
  // What will be changed
  changes: ProposedChange[];
  
  // Risk assessment
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  
  // Impact analysis
  impact: ImpactAnalysis;
  
  // Approval workflow
  requiredApprovers: string[];
  approvals: Approval[];
  
  // Execution plan
  executionPlan: ExecutionStep[];
  rollbackPlan: RollbackStep[];
  
  // Status tracking
  status: ProposalStatus;
  createdAt: Date;
  updatedAt: Date;
  executedAt?: Date;
  completedAt?: Date;
}

export interface ProposedChange {
  component: string;       // What's being changed
  changeType: 'create' | 'modify' | 'delete';
  before?: string;         // Current state (if modify/delete)
  after?: string;          // New state (if create/modify)
  darkFactorySpec?: string; // Natural language spec for Dark Factory
}

export interface RiskFactor {
  category: 'data_integrity' | 'security' | 'availability' | 'compliance' | 'performance' | 'cost';
  description: string;
  severity: 'low' | 'medium' | 'high';
  mitigation?: string;
}

export interface ImpactAnalysis {
  affectedUsers: number;       // Estimated users impacted
  affectedWorkflows: string[]; // Workflows that will be affected
  downtime: number;            // Expected downtime in minutes
  reversibility: 'instant' | 'quick' | 'complex' | 'irreversible';
  testCoverage: number;        // Percentage of test coverage
  confidenceScore: number;     // 0-100 confidence in success
}

export interface Approval {
  approverId: string;
  approverName: string;
  decision: 'approved' | 'rejected' | 'pending';
  comments?: string;
  timestamp?: Date;
}

export interface ExecutionStep {
  order: number;
  action: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  output?: string;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface RollbackStep {
  order: number;
  action: string;
  description: string;
  automated: boolean; // Can be rolled back automatically
}

export interface ModificationResult {
  proposalId: string;
  success: boolean;
  executedSteps: ExecutionStep[];
  validationResults: ValidationResult[];
  artifacts: GeneratedArtifact[];
  rollbackRequired: boolean;
  rollbackExecuted?: boolean;
  completedAt: Date;
}

export interface ValidationResult {
  type: 'unit_test' | 'integration_test' | 'regression_test' | 'manual_check';
  name: string;
  passed: boolean;
  details?: string;
  duration?: number;
}

export interface GeneratedArtifact {
  id: string;
  type: 'api_route' | 'component' | 'schema' | 'test' | 'config';
  path: string;
  content: string;
  deployed: boolean;
}

// Self-modification configuration
export interface SelfModConfig {
  // Auto-execution thresholds
  autoExecuteRiskLevel: RiskLevel; // Auto-execute below this risk
  
  // Approval requirements by risk level
  approvalRequirements: Record<RiskLevel, number>;
  
  // Circuit breaker settings
  maxModificationsPerHour: number;
  maxFailuresBeforePause: number;
  cooldownMinutes: number;
  
  // Validation requirements
  minTestCoverage: number;
  minConfidenceScore: number;
  
  // Notification settings
  notifyOnProposal: boolean;
  notifyOnExecution: boolean;
  notifyOnFailure: boolean;
}

export const DEFAULT_SELF_MOD_CONFIG: SelfModConfig = {
  autoExecuteRiskLevel: 'minimal',
  approvalRequirements: {
    minimal: 0,
    low: 1,
    medium: 2,
    high: 3,
    critical: 5
  },
  maxModificationsPerHour: 10,
  maxFailuresBeforePause: 3,
  cooldownMinutes: 30,
  minTestCoverage: 80,
  minConfidenceScore: 85,
  notifyOnProposal: true,
  notifyOnExecution: true,
  notifyOnFailure: true
};
