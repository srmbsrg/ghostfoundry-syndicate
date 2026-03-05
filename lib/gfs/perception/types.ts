/**
 * GhostFoundry-Syndicate Perception System Types
 * 
 * The Ghost's senses - document understanding, signal detection,
 * anomaly recognition, and environmental awareness.
 */

export type PerceptionType = 
  | 'document'
  | 'email'
  | 'metric'
  | 'event'
  | 'anomaly'
  | 'signal'
  | 'notification';

export type DocumentType = 
  | 'invoice'
  | 'contract'
  | 'report'
  | 'email'
  | 'form'
  | 'receipt'
  | 'proposal'
  | 'memo'
  | 'spreadsheet'
  | 'unknown';

export type SignalStrength = 'strong' | 'moderate' | 'weak';

export type AnomalyType = 
  | 'outlier'
  | 'trend_change'
  | 'pattern_break'
  | 'threshold_breach'
  | 'missing_expected'
  | 'unexpected_occurrence';

/**
 * Base perception result
 */
export interface Perception {
  id: string;
  type: PerceptionType;
  timestamp: Date;
  source: string;
  confidence: number;  // 0-1
  rawInput?: string;
  processed: boolean;
}

/**
 * Document understanding result
 */
export interface DocumentPerception extends Perception {
  type: 'document';
  documentType: DocumentType;
  extracted: {
    entities: ExtractedEntity[];
    amounts?: ExtractedAmount[];
    dates?: ExtractedDate[];
    keyPhrases: string[];
    summary: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
    urgency?: 'high' | 'medium' | 'low';
    actionItems?: string[];
  };
  structuredData?: Record<string, unknown>;
  classification?: {
    category: string;
    subcategory?: string;
    confidence: number;
  };
}

export interface ExtractedEntity {
  type: 'person' | 'company' | 'product' | 'location' | 'date' | 'amount' | 'reference';
  value: string;
  normalizedValue?: string;
  confidence: number;
  context?: string;
}

export interface ExtractedAmount {
  value: number;
  currency: string;
  label?: string;  // e.g., "total", "tax", "subtotal"
  confidence: number;
}

export interface ExtractedDate {
  value: Date;
  type: 'due_date' | 'invoice_date' | 'event_date' | 'deadline' | 'reference';
  confidence: number;
}

/**
 * Email perception result
 */
export interface EmailPerception extends Perception {
  type: 'email';
  email: {
    from: string;
    to: string[];
    cc?: string[];
    subject: string;
    receivedAt: Date;
    threadId?: string;
  };
  analysis: {
    intent: EmailIntent;
    sentiment: 'positive' | 'negative' | 'neutral' | 'urgent';
    priority: 'high' | 'medium' | 'low';
    actionRequired: boolean;
    suggestedActions?: string[];
    entities: ExtractedEntity[];
    summary: string;
    replyDraft?: string;
  };
}

export type EmailIntent = 
  | 'request'
  | 'question'
  | 'complaint'
  | 'information'
  | 'confirmation'
  | 'followup'
  | 'introduction'
  | 'negotiation'
  | 'unknown';

/**
 * Metric observation
 */
export interface MetricPerception extends Perception {
  type: 'metric';
  metric: {
    name: string;
    value: number;
    unit?: string;
    previousValue?: number;
    changePercent?: number;
    trend?: 'up' | 'down' | 'stable';
  };
  context: {
    source: string;
    period?: string;
    comparison?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  };
  significance: {
    isSignificant: boolean;
    reason?: string;
    relatedMetrics?: string[];
  };
}

/**
 * Anomaly detection result
 */
export interface AnomalyPerception extends Perception {
  type: 'anomaly';
  anomaly: {
    anomalyType: AnomalyType;
    severity: 'critical' | 'warning' | 'info';
    description: string;
    affectedMetric?: string;
    affectedProcess?: string;
    expectedValue?: number | string;
    actualValue?: number | string;
    deviation?: number;  // Standard deviations from normal
  };
  analysis: {
    possibleCauses: string[];
    suggestedActions: string[];
    relatedAnomalies?: string[];  // IDs of related anomalies
    confidence: number;
  };
}

/**
 * External signal detection
 */
export interface SignalPerception extends Perception {
  type: 'signal';
  signal: {
    category: 'market' | 'competitor' | 'industry' | 'regulatory' | 'technology' | 'customer';
    headline: string;
    description: string;
    strength: SignalStrength;
    sources: string[];
    relevanceScore: number;  // How relevant to the business
  };
  implications: {
    opportunities?: string[];
    threats?: string[];
    suggestedActions?: string[];
    affectedAreas?: string[];
  };
}

/**
 * Perception processing pipeline
 */
export interface PerceptionPipeline {
  id: string;
  name: string;
  inputTypes: string[];
  processors: ProcessorConfig[];
  outputActions: OutputAction[];
  isActive: boolean;
}

export interface ProcessorConfig {
  type: 'document' | 'email' | 'metric' | 'anomaly' | 'signal';
  config: Record<string, unknown>;
  order: number;
}

export interface OutputAction {
  type: 'memory' | 'event' | 'workflow' | 'notification' | 'agent';
  targetId?: string;
  condition?: string;
}

/**
 * Marketing Feature: Perception Capabilities
 */
export const PERCEPTION_MARKETING_FEATURES = [
  {
    feature: 'Intelligent Document Processing',
    tagline: 'Understands documents like a human, processes them like a machine',
    description: 'Automatically extracts key information from invoices, contracts, reports, and emails. No templates needed - the system learns your document formats.',
    benefits: ['90%+ reduction in manual data entry', 'Zero template configuration', 'Learns from corrections']
  },
  {
    feature: 'Email Intelligence',
    tagline: 'Every email analyzed, prioritized, and actionable',
    description: 'Understands email intent, extracts action items, and suggests responses. Never miss an important email buried in your inbox.',
    benefits: ['Automatic prioritization', 'Action item extraction', 'Smart reply suggestions']
  },
  {
    feature: 'Anomaly Detection',
    tagline: 'Spots problems before they become crises',
    description: 'Continuously monitors your operations for unusual patterns. Detects issues before they impact your business.',
    benefits: ['Proactive problem detection', 'Early warning system', 'Reduced downtime']
  },
  {
    feature: 'Market Signal Intelligence',
    tagline: 'Your 24/7 competitive intelligence analyst',
    description: 'Monitors market signals, competitor moves, and industry trends. Delivers actionable insights to stay ahead.',
    benefits: ['Real-time market awareness', 'Competitive intelligence', 'Strategic early warning']
  },
  {
    feature: 'Unified Business Perception',
    tagline: 'One brain seeing your entire operation',
    description: 'Correlates signals across all sources - documents, emails, metrics, external data - to provide a unified view of your business.',
    benefits: ['Cross-functional visibility', 'Pattern detection', 'Holistic insights']
  }
];
