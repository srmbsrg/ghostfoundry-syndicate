// GFS Sentinel - Type Definitions
// "The Sentinel is now watching. The Ghost remembers. And it knows who you are."

export type AlertType = 'anomaly' | 'threat' | 'policy_violation' | 'system_failure' | 'suspicious_activity';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export type AlertCategory = 'security' | 'performance' | 'compliance' | 'operational';

export type AlertStatus = 'open' | 'acknowledged' | 'investigating' | 'mitigated' | 'resolved' | 'false_positive';

export type RuleType = 'threshold' | 'pattern' | 'anomaly' | 'policy' | 'correlation';

export interface SentinelAlertData {
  type: AlertType;
  severity: AlertSeverity;
  category: AlertCategory;
  source: string;
  triggerId?: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  title: string;
  description: string;
  evidence?: Record<string, unknown>;
  riskScore?: number;
  confidence?: number;
}

export interface SentinelRuleConfig {
  name: string;
  description?: string;
  type: RuleType;
  category: AlertCategory;
  condition: RuleCondition;
  threshold?: ThresholdConfig;
  pattern?: string;
  triggerOn: 'event' | 'metric' | 'schedule' | 'manual';
  eventTypes?: string[];
  severity: AlertSeverity;
  autoRespond?: boolean;
  responseActions?: ResponseAction[];
}

export interface RuleCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'matches' | 'in';
  value: unknown;
  and?: RuleCondition[];
  or?: RuleCondition[];
}

export interface ThresholdConfig {
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte';
  value: number;
  duration?: number; // seconds
  count?: number;    // occurrences
}

export interface ResponseAction {
  type: 'notify' | 'lock_user' | 'suspend_agent' | 'restart_workflow' | 'rollback' | 'escalate' | 'custom';
  config: Record<string, unknown>;
}

export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  confidence: number;
  riskScore: number;
  factors: AnomalyFactor[];
  recommendation: string;
}

export interface AnomalyFactor {
  factor: string;
  description: string;
  severity: AlertSeverity;
  contribution: number; // 0-1 how much this contributes to anomaly score
}

export interface BehavioralProfile {
  userId: string;
  typicalHours: number[];
  typicalDays: number[];
  typicalLocations: string[];
  typicalActions: string[];
  averageSessionDuration: number;
  riskBaseline: number;
}
