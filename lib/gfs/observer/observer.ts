// GFS Pattern Observer - Main Observer Service
// The "eye" that watches the event stream and identifies patterns

import prisma from '@/lib/db';
import { EventBus, GFS_EVENT_TYPES } from '@/lib/gfs/event-bus';
import { selfModificationEngine, GapAnalysis } from '@/lib/gfs/self-mod';
import { patternDetector, PatternDetector } from './pattern-detector';
import { actionRecommender, ActionRecommender } from './action-recommender';
import { DetectedPattern, ObserverState, ObserverConfig, DEFAULT_OBSERVER_CONFIG } from './types';

export class Observer {
  private config: ObserverConfig;
  private detector: PatternDetector;
  private recommender: ActionRecommender;
  private state: ObserverState;
  private analysisInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<ObserverConfig> = {}) {
    this.config = { ...DEFAULT_OBSERVER_CONFIG, ...config };
    this.detector = patternDetector;
    this.recommender = actionRecommender;
    this.state = {
      isRunning: false,
      lastAnalysis: null,
      patternsDetected: 0,
      proposalsGenerated: 0,
      alertsSent: 0,
    };
  }

  /**
   * Run a single analysis cycle
   */
  async analyze(): Promise<DetectedPattern[]> {
    console.log('[Observer] Starting analysis cycle...');

    try {
      // Detect patterns
      const patterns = await this.detector.analyze();
      console.log(`[Observer] Detected ${patterns.length} patterns`);

      // Process each pattern
      for (const pattern of patterns) {
        await this.processPattern(pattern);
      }

      // Update state
      this.state.lastAnalysis = new Date();
      this.state.patternsDetected += patterns.length;

      // Store patterns for dashboard visibility
      await this.storePatterns(patterns);

      // Emit analysis complete event
      await EventBus.emit('observer', 'observer.analysis_complete', {
        patternsDetected: patterns.length,
        timestamp: new Date().toISOString(),
      });

      return patterns;
    } catch (error) {
      console.error('[Observer] Analysis error:', error);
      return [];
    }
  }

  /**
   * Process a detected pattern
   */
  private async processPattern(pattern: DetectedPattern): Promise<void> {
    console.log(`[Observer] Processing pattern: ${pattern.title}`);

    // Get action recommendation
    const action = await this.recommender.recommend(pattern);
    pattern.suggestedAction = action;

    // Take action based on recommendation
    switch (action.type) {
      case 'self_mod':
        await this.createSelfModProposal(pattern, action);
        break;

      case 'alert':
        await this.sendAlert(pattern);
        break;

      case 'workflow':
        await this.triggerWorkflow(pattern);
        break;

      case 'human_review':
        await this.requestHumanReview(pattern);
        break;

      case 'ignore':
        console.log(`[Observer] Ignoring pattern: ${pattern.title}`);
        break;
    }
  }

  /**
   * Create a self-modification proposal for a pattern
   */
  private async createSelfModProposal(
    pattern: DetectedPattern, 
    action: NonNullable<DetectedPattern['suggestedAction']>
  ): Promise<void> {
    // Only auto-propose for low-risk patterns if configured
    const isLowRisk = pattern.severity === 'info' || 
                      (pattern.severity === 'warning' && action.confidence >= 0.8);

    if (!isLowRisk && !this.config.autoProposeLowRisk) {
      console.log(`[Observer] Skipping auto-proposal for non-low-risk pattern`);
      return;
    }

    // Convert pattern to gap analysis format
    const gap: GapAnalysis = {
      id: pattern.id,
      type: this.mapPatternToGapType(pattern.type),
      severity: pattern.severity === 'critical' || pattern.severity === 'alert' ? 'high' : 
                pattern.severity === 'warning' ? 'medium' : 'low',
      title: `Auto: ${pattern.title}`,
      description: pattern.description,
      evidence: pattern.evidence.slice(0, 5).map(e => ({
        type: 'pattern' as const,
        data: e as unknown as Record<string, unknown>,
        timestamp: new Date()
      })),
      suggestedFix: action.specification || action.reasoning,
      affectedComponents: [pattern.type],
      detectedAt: new Date(),
      source: 'automated' as const
    };

    try {
      const proposal = await selfModificationEngine.generateProposal(gap);
      this.state.proposalsGenerated++;
      console.log(`[Observer] Created proposal: ${proposal.id}`);
    } catch (error) {
      console.error('[Observer] Failed to create proposal:', error);
    }
  }

  /**
   * Map pattern type to gap type
   */
  private mapPatternToGapType(patternType: string): GapAnalysis['type'] {
    switch (patternType) {
      case 'error_cluster':
        return 'failed_task';
      case 'bottleneck':
        return 'performance_bottleneck';
      case 'repetition':
        return 'pattern_detected';
      case 'opportunity':
        return 'missing_capability';
      default:
        return 'user_feedback';
    }
  }

  /**
   * Send an alert for a critical pattern
   */
  private async sendAlert(pattern: DetectedPattern): Promise<void> {
    console.log(`[Observer] Sending alert for: ${pattern.title}`);

    // Emit alert event
    await EventBus.emit('observer', 'observer.alert', {
      patternId: pattern.id,
      severity: pattern.severity,
      title: pattern.title,
      description: pattern.description,
    });

    // Store alert
    await prisma.factoryEvent.create({
      data: {
        type: 'observer:alert',
        description: pattern.title,
        status: 'pending',
        metadata: JSON.parse(JSON.stringify({
          patternId: pattern.id,
          severity: pattern.severity,
          description: pattern.description,
          suggestedAction: pattern.suggestedAction,
        })),
      },
    });

    this.state.alertsSent++;
  }

  /**
   * Trigger a workflow for a pattern
   */
  private async triggerWorkflow(pattern: DetectedPattern): Promise<void> {
    console.log(`[Observer] Triggering workflow for: ${pattern.title}`);

    // Create a workflow execution request
    await EventBus.emit('observer', 'observer.workflow_trigger', {
      patternId: pattern.id,
      patternType: pattern.type,
      title: pattern.title,
      context: {
        description: pattern.description,
        evidence: pattern.evidence.slice(0, 5),
        suggestedAction: pattern.suggestedAction,
      },
    });
  }

  /**
   * Request human review for a pattern
   */
  private async requestHumanReview(pattern: DetectedPattern): Promise<void> {
    console.log(`[Observer] Requesting human review for: ${pattern.title}`);

    // Create a human gate
    await prisma.humanGate.create({
      data: {
        stepId: `pattern:${pattern.id}`,
        description: `Review pattern: ${pattern.title}`,
        requiredApprovers: 1,
        approvedBy: [],
        context: JSON.parse(JSON.stringify({
          pattern: {
            id: pattern.id,
            type: pattern.type,
            severity: pattern.severity,
            title: pattern.title,
            description: pattern.description,
            confidence: pattern.confidence,
            occurrences: pattern.occurrences,
            suggestedAction: pattern.suggestedAction,
          },
          evidence: pattern.evidence.slice(0, 10),
        })),
        status: 'pending',
      },
    });

    // Emit event for notifications
    await EventBus.emit('observer', 'observer.human_review_requested', {
      patternId: pattern.id,
      title: pattern.title,
      severity: pattern.severity,
    });
  }

  /**
   * Store patterns in the database for dashboard visibility
   */
  private async storePatterns(patterns: DetectedPattern[]): Promise<void> {
    for (const pattern of patterns) {
      await prisma.factoryEvent.upsert({
        where: { id: pattern.id },
        create: {
          id: pattern.id,
          type: `observer:pattern:${pattern.type}`,
          description: pattern.title,
          status: pattern.suggestedAction?.type === 'ignore' ? 'resolved' : 'pending',
          metadata: JSON.parse(JSON.stringify(pattern)),
        },
        update: {
          description: pattern.title,
          metadata: JSON.parse(JSON.stringify(pattern)),
        },
      });
    }
  }

  /**
   * Start continuous observation
   */
  start(intervalMinutes: number = 15): void {
    if (this.state.isRunning) {
      console.log('[Observer] Already running');
      return;
    }

    this.state.isRunning = true;
    console.log(`[Observer] Starting with ${intervalMinutes} minute interval`);

    // Run initial analysis
    this.analyze();

    // Set up interval
    this.analysisInterval = setInterval(
      () => this.analyze(),
      intervalMinutes * 60 * 1000
    );
  }

  /**
   * Stop continuous observation
   */
  stop(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    this.state.isRunning = false;
    console.log('[Observer] Stopped');
  }

  /**
   * Get observer state
   */
  getState(): ObserverState {
    return { ...this.state };
  }

  /**
   * Get recent patterns from database
   */
  async getRecentPatterns(limit: number = 50): Promise<DetectedPattern[]> {
    const events = await prisma.factoryEvent.findMany({
      where: {
        type: { startsWith: 'observer:pattern:' },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return events.map(e => e.metadata as unknown as DetectedPattern);
  }
}

// Singleton instance
export const observer = new Observer();
