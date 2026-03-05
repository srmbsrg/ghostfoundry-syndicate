// GFS Pattern Observer - Main Entry Point

export * from './types';
export { patternDetector, PatternDetector } from './pattern-detector';
export { actionRecommender, ActionRecommender } from './action-recommender';
export { observer, Observer } from './observer';

import { observer } from './observer';
import { DetectedPattern, ObserverState, ObserverConfig } from './types';

/**
 * GFS Observer
 * 
 * The Ghost's "eye" - watches the event stream, detects patterns,
 * and recommends or triggers autonomous actions.
 * 
 * Capabilities:
 * - Pattern Detection: Identifies repetitions, anomalies, errors, bottlenecks
 * - Action Recommendation: Uses LLM to suggest responses
 * - Self-Modification Proposals: Can propose code changes to address patterns
 * - Alert Generation: Notifies humans of critical patterns
 * - Workflow Triggers: Can start automated responses
 */
export const GhostObserver = {
  /**
   * Run a single analysis cycle
   */
  async analyze(): Promise<DetectedPattern[]> {
    return observer.analyze();
  },

  /**
   * Start continuous observation
   * @param intervalMinutes How often to analyze (default: 15)
   */
  start(intervalMinutes?: number): void {
    observer.start(intervalMinutes);
  },

  /**
   * Stop continuous observation
   */
  stop(): void {
    observer.stop();
  },

  /**
   * Get current observer state
   */
  getState(): ObserverState {
    return observer.getState();
  },

  /**
   * Get recent detected patterns
   */
  async getRecentPatterns(limit?: number): Promise<DetectedPattern[]> {
    return observer.getRecentPatterns(limit);
  },
};

export default GhostObserver;
