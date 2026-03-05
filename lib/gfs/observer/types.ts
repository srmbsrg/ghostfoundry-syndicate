// GFS Pattern Observer - Type Definitions

export type PatternType =
  | 'repetition'       // Same action happening repeatedly
  | 'anomaly'          // Deviation from normal behavior
  | 'bottleneck'       // Slow or blocked processes
  | 'error_cluster'    // Multiple related errors
  | 'opportunity'      // Potential optimization
  | 'risk'             // Emerging risk pattern
  | 'correlation'      // Related events across systems
  | 'trend';           // Directional change over time

export type PatternSeverity = 'info' | 'warning' | 'alert' | 'critical';

export interface DetectedPattern {
  id: string;
  type: PatternType;
  severity: PatternSeverity;
  title: string;
  description: string;
  evidence: PatternEvidence[];
  confidence: number;          // 0-1 confidence score
  firstDetected: Date;
  lastSeen: Date;
  occurrences: number;
  suggestedAction?: SuggestedAction;
  metadata?: Record<string, unknown>;
}

export interface PatternEvidence {
  eventId: string;
  eventType: string;
  timestamp: Date;
  relevance: number;           // 0-1 how relevant to the pattern
  snippet?: string;
}

export interface SuggestedAction {
  type: 'self_mod' | 'alert' | 'workflow' | 'human_review' | 'ignore';
  specification?: string;     // For self_mod: the spec to execute
  confidence: number;
  reasoning: string;
}

export interface ObserverConfig {
  // Pattern detection thresholds
  minConfidence: number;       // Minimum confidence to report (0-1)
  minOccurrences: number;      // Minimum occurrences before pattern is significant
  windowSizeMinutes: number;   // Time window for analysis
  
  // Pattern-specific settings
  repetitionThreshold: number; // How many repeats = pattern
  anomalyStdDevs: number;      // Standard deviations for anomaly detection
  errorClusterWindow: number;  // Minutes to cluster errors
  
  // Auto-actions
  autoProposeLowRisk: boolean; // Auto-create self-mod proposals for low-risk patterns
  alertOnCritical: boolean;    // Auto-alert on critical patterns
}

export const DEFAULT_OBSERVER_CONFIG: ObserverConfig = {
  minConfidence: 0.7,
  minOccurrences: 3,
  windowSizeMinutes: 60,
  repetitionThreshold: 5,
  anomalyStdDevs: 2.5,
  errorClusterWindow: 15,
  autoProposeLowRisk: true,
  alertOnCritical: true,
};

export interface ObserverState {
  isRunning: boolean;
  lastAnalysis: Date | null;
  patternsDetected: number;
  proposalsGenerated: number;
  alertsSent: number;
}
