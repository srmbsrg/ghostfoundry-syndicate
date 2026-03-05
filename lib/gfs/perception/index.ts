/**
 * GhostFoundry-Syndicate Perception System
 * 
 * The Ghost's senses - understanding documents, analyzing emails,
 * detecting anomalies, and monitoring external signals.
 * 
 * ## Architecture
 * 
 * ```
 * ┌───────────────────────────────────────────────────────────┐
 * │                  PERCEPTION SYSTEM                        │
 * ├──────────────┬──────────────┬──────────────┬──────────────┤
 * │  DOCUMENTS    │    EMAILS     │   ANOMALIES   │   SIGNALS    │
 * │  - Invoices   │  - Intent     │  - Outliers   │  - Market    │
 * │  - Contracts  │  - Priority   │  - Trends     │  - Competitor│
 * │  - Reports    │  - Actions    │  - Patterns   │  - Industry  │
 * ├──────────────┴──────────────┴──────────────┴──────────────┤
 * │                                                           │
 * │              ↓ All perceptions stored as ↓                │
 * │                      MEMORY                               │
 * │                                                           │
 * ├───────────────────────────────────────────────────────────┤
 * │              ↓ Significant events ↓                       │
 * │                    EVENT BUS                              │
 * └───────────────────────────────────────────────────────────┘
 * ```
 * 
 * ## Usage
 * 
 * ```typescript
 * import { perception } from '@/lib/gfs/perception';
 * 
 * // Process a document
 * const doc = await perception.processDocument({
 *   content: invoiceText,
 *   expectedType: 'invoice'
 * });
 * 
 * // Analyze an email
 * const email = await perception.analyzeEmail({
 *   from: 'client@example.com',
 *   subject: 'Urgent: Contract Review',
 *   body: emailBody
 * });
 * 
 * // Record a metric (auto-detects anomalies)
 * await perception.recordMetric('daily_revenue', 15000);
 * 
 * // Process an external signal
 * const signal = await perception.processSignal({
 *   source: 'industry_news',
 *   headline: 'Major competitor announces layoffs',
 *   content: articleContent
 * });
 * ```
 */

import { documentProcessor } from './document-processor';
import { emailAnalyzer } from './email-analyzer';
import { anomalyDetector, AnomalyThreshold } from './anomaly-detector';
import { signalDetector, RawSignal, SignalSource } from './signal-detector';
import type {
  Perception,
  DocumentPerception,
  EmailPerception,
  MetricPerception,
  AnomalyPerception,
  SignalPerception,
  DocumentType,
  PERCEPTION_MARKETING_FEATURES
} from './types';

/**
 * Main Perception System Interface
 */
export const perception = {
  /**
   * Process a document
   */
  async processDocument(params: {
    content: string;
    source?: string;
    context?: string;
    expectedType?: DocumentType;
  }): Promise<DocumentPerception> {
    return documentProcessor.process(params);
  },

  /**
   * Process an invoice specifically
   */
  async processInvoice(content: string, source?: string) {
    return documentProcessor.processInvoice(content, source);
  },

  /**
   * Process a contract specifically
   */
  async processContract(content: string, source?: string) {
    return documentProcessor.processContract(content, source);
  },

  /**
   * Analyze an email
   */
  async analyzeEmail(params: {
    from: string;
    to: string[];
    cc?: string[];
    subject: string;
    body: string;
    receivedAt?: Date;
    threadId?: string;
    context?: string;
  }): Promise<EmailPerception> {
    return emailAnalyzer.analyze(params);
  },

  /**
   * Batch analyze emails
   */
  async analyzeEmails(emails: Array<{
    from: string;
    to: string[];
    subject: string;
    body: string;
    receivedAt?: Date;
  }>): Promise<EmailPerception[]> {
    return emailAnalyzer.batchAnalyze(emails);
  },

  /**
   * Record a metric value (auto-detects anomalies)
   */
  async recordMetric(
    metric: string,
    value: number,
    metadata?: Record<string, unknown>
  ): Promise<AnomalyPerception | null> {
    return anomalyDetector.recordMetric(metric, value, metadata);
  },

  /**
   * Set anomaly detection threshold
   */
  setAnomalyThreshold(threshold: AnomalyThreshold): void {
    anomalyDetector.setThreshold(threshold);
  },

  /**
   * Get recent anomalies
   */
  async getRecentAnomalies(hours?: number): Promise<AnomalyPerception[]> {
    return anomalyDetector.getRecentAnomalies(hours);
  },

  /**
   * Configure signal detector
   */
  configureSignals(config: {
    businessDescription?: string;
    competitors?: string[];
    industryKeywords?: string[];
  }): void {
    signalDetector.configure(config);
  },

  /**
   * Add a signal source
   */
  addSignalSource(source: SignalSource): void {
    signalDetector.addSource(source);
  },

  /**
   * Process an external signal
   */
  async processSignal(signal: RawSignal): Promise<SignalPerception | null> {
    return signalDetector.processSignal(signal);
  },

  /**
   * Batch process signals
   */
  async processSignals(signals: RawSignal[]): Promise<SignalPerception[]> {
    return signalDetector.batchProcess(signals);
  },

  /**
   * Generate intelligence brief from signals
   */
  async generateIntelligenceBrief(signals: SignalPerception[]) {
    return signalDetector.generateBrief(signals);
  },

  /**
   * Get metric history
   */
  getMetricHistory(metric: string) {
    return anomalyDetector.getMetricHistory(metric);
  }
};

// Re-export components and types
export {
  documentProcessor,
  emailAnalyzer,
  anomalyDetector,
  signalDetector
};

export type {
  Perception,
  DocumentPerception,
  EmailPerception,
  MetricPerception,
  AnomalyPerception,
  SignalPerception,
  DocumentType,
  AnomalyThreshold,
  RawSignal,
  SignalSource
};

export { PERCEPTION_MARKETING_FEATURES } from './types';
