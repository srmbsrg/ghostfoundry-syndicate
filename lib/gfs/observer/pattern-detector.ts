// GFS Pattern Observer - Pattern Detection Engine

import prisma from '@/lib/db';
import {
  PatternType,
  PatternSeverity,
  DetectedPattern,
  PatternEvidence,
  SuggestedAction,
  ObserverConfig,
  DEFAULT_OBSERVER_CONFIG,
} from './types';
import { v4 as uuidv4 } from 'uuid';

export class PatternDetector {
  private config: ObserverConfig;

  constructor(config: Partial<ObserverConfig> = {}) {
    this.config = { ...DEFAULT_OBSERVER_CONFIG, ...config };
  }

  /**
   * Analyze recent events and detect patterns
   */
  async analyze(): Promise<DetectedPattern[]> {
    const windowStart = new Date(
      Date.now() - this.config.windowSizeMinutes * 60 * 1000
    );

    // Fetch recent events from the database
    const events = await prisma.factoryEvent.findMany({
      where: {
        timestamp: { gte: windowStart },
      },
      orderBy: { timestamp: 'desc' },
      take: 1000,
    });

    const patterns: DetectedPattern[] = [];

    // Run each pattern detector
    patterns.push(...this.detectRepetitions(events));
    patterns.push(...this.detectErrorClusters(events));
    patterns.push(...this.detectAnomalies(events));
    patterns.push(...this.detectBottlenecks(events));
    patterns.push(...this.detectOpportunities(events));

    // Filter by minimum confidence
    return patterns.filter(p => p.confidence >= this.config.minConfidence);
  }

  /**
   * Detect repetitive patterns (same action happening repeatedly)
   */
  private detectRepetitions(events: Array<{ id: string; type: string; timestamp: Date; description: string | null; metadata: unknown }>): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const typeCounts = new Map<string, typeof events>();

    // Group events by type
    for (const event of events) {
      const existing = typeCounts.get(event.type) || [];
      existing.push(event);
      typeCounts.set(event.type, existing);
    }

    // Find repetitive patterns
    for (const [type, typeEvents] of typeCounts) {
      if (typeEvents.length >= this.config.repetitionThreshold) {
        const evidence: PatternEvidence[] = typeEvents.slice(0, 10).map(e => ({
          eventId: e.id,
          eventType: e.type,
          timestamp: e.timestamp,
          relevance: 1.0,
          snippet: e.description || undefined,
        }));

        // Check if this might indicate an automation opportunity
        const isManualTask = type.includes('manual') || type.includes('user_action');
        const suggestedAction: SuggestedAction | undefined = isManualTask ? {
          type: 'self_mod',
          specification: `Automate the repeated task: ${type}. This task has occurred ${typeEvents.length} times in the last ${this.config.windowSizeMinutes} minutes.`,
          confidence: 0.8,
          reasoning: `This manual task is performed frequently and may benefit from automation.`,
        } : undefined;

        patterns.push({
          id: uuidv4(),
          type: 'repetition',
          severity: isManualTask ? 'warning' : 'info',
          title: `Repetitive Pattern: ${type}`,
          description: `The event "${type}" has occurred ${typeEvents.length} times in the analysis window.`,
          evidence,
          confidence: Math.min(typeEvents.length / 10, 1.0),
          firstDetected: typeEvents[typeEvents.length - 1].timestamp,
          lastSeen: typeEvents[0].timestamp,
          occurrences: typeEvents.length,
          suggestedAction,
        });
      }
    }

    return patterns;
  }

  /**
   * Detect clusters of related errors
   */
  private detectErrorClusters(events: Array<{ id: string; type: string; timestamp: Date; description: string | null; status: string | null; metadata: unknown }>): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    // Find error events
    const errorEvents = events.filter(e => 
      e.type.includes('error') || 
      e.type.includes('failed') || 
      e.status === 'failed'
    );

    if (errorEvents.length < this.config.minOccurrences) {
      return patterns;
    }

    // Cluster errors by time proximity
    const clusters: typeof errorEvents[] = [];
    let currentCluster: typeof errorEvents = [];

    for (const event of errorEvents) {
      if (currentCluster.length === 0) {
        currentCluster.push(event);
      } else {
        const lastEvent = currentCluster[currentCluster.length - 1];
        const timeDiff = Math.abs(
          event.timestamp.getTime() - lastEvent.timestamp.getTime()
        ) / 60000;

        if (timeDiff <= this.config.errorClusterWindow) {
          currentCluster.push(event);
        } else {
          if (currentCluster.length >= this.config.minOccurrences) {
            clusters.push(currentCluster);
          }
          currentCluster = [event];
        }
      }
    }
    if (currentCluster.length >= this.config.minOccurrences) {
      clusters.push(currentCluster);
    }

    // Create patterns for each cluster
    for (const cluster of clusters) {
      const evidence: PatternEvidence[] = cluster.map(e => ({
        eventId: e.id,
        eventType: e.type,
        timestamp: e.timestamp,
        relevance: 1.0,
        snippet: e.description || undefined,
      }));

      const errorTypes = [...new Set(cluster.map(e => e.type))];
      const severity: PatternSeverity = cluster.length >= 10 ? 'critical' : 
                                        cluster.length >= 5 ? 'alert' : 'warning';

      patterns.push({
        id: uuidv4(),
        type: 'error_cluster',
        severity,
        title: `Error Cluster Detected`,
        description: `${cluster.length} related errors occurred within ${this.config.errorClusterWindow} minutes. Error types: ${errorTypes.join(', ')}`,
        evidence,
        confidence: Math.min(0.5 + cluster.length * 0.05, 0.95),
        firstDetected: cluster[cluster.length - 1].timestamp,
        lastSeen: cluster[0].timestamp,
        occurrences: cluster.length,
        suggestedAction: {
          type: 'human_review',
          confidence: 0.9,
          reasoning: 'Multiple errors in quick succession often indicate a systemic issue requiring investigation.',
        },
      });
    }

    return patterns;
  }

  /**
   * Detect anomalies (deviations from normal patterns)
   */
  private detectAnomalies(events: Array<{ id: string; type: string; timestamp: Date; description: string | null; metadata: unknown }>): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];

    // Calculate event frequency by hour
    const hourCounts = new Map<number, number>();
    for (const event of events) {
      const hour = event.timestamp.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }

    // Calculate mean and std dev
    const counts = Array.from(hourCounts.values());
    if (counts.length < 3) return patterns;

    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const stdDev = Math.sqrt(
      counts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / counts.length
    );

    // Find anomalous hours
    for (const [hour, count] of hourCounts) {
      const zScore = (count - mean) / (stdDev || 1);
      if (Math.abs(zScore) > this.config.anomalyStdDevs) {
        const isHigh = zScore > 0;
        patterns.push({
          id: uuidv4(),
          type: 'anomaly',
          severity: Math.abs(zScore) > 4 ? 'alert' : 'warning',
          title: `${isHigh ? 'High' : 'Low'} Activity Anomaly at ${hour}:00`,
          description: `Activity at ${hour}:00 was ${isHigh ? 'significantly higher' : 'significantly lower'} than normal. Z-score: ${zScore.toFixed(2)}`,
          evidence: [],
          confidence: Math.min(0.5 + Math.abs(zScore) * 0.1, 0.95),
          firstDetected: new Date(),
          lastSeen: new Date(),
          occurrences: count,
          metadata: { hour, count, mean, stdDev, zScore },
        });
      }
    }

    return patterns;
  }

  /**
   * Detect bottlenecks (slow or blocked processes)
   */
  private detectBottlenecks(events: Array<{ id: string; type: string; timestamp: Date; status: string | null; metadata: unknown }>): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];

    // Find pending/queued events that have been waiting too long
    const pendingEvents = events.filter(e => 
      e.status === 'pending' || e.status === 'queued'
    );

    const now = Date.now();
    const stuckEvents = pendingEvents.filter(e => 
      now - e.timestamp.getTime() > 30 * 60 * 1000 // Stuck for > 30 min
    );

    if (stuckEvents.length >= 3) {
      const evidence: PatternEvidence[] = stuckEvents.slice(0, 10).map(e => ({
        eventId: e.id,
        eventType: e.type,
        timestamp: e.timestamp,
        relevance: 1.0,
      }));

      patterns.push({
        id: uuidv4(),
        type: 'bottleneck',
        severity: stuckEvents.length >= 10 ? 'critical' : 'alert',
        title: `Processing Bottleneck Detected`,
        description: `${stuckEvents.length} tasks have been pending for over 30 minutes, indicating a potential processing bottleneck.`,
        evidence,
        confidence: 0.85,
        firstDetected: stuckEvents[stuckEvents.length - 1].timestamp,
        lastSeen: new Date(),
        occurrences: stuckEvents.length,
        suggestedAction: {
          type: 'self_mod',
          specification: `Investigate and resolve the processing bottleneck. ${stuckEvents.length} tasks are stuck. Consider increasing concurrency or identifying the blocking resource.`,
          confidence: 0.7,
          reasoning: 'Long-pending tasks often indicate resource constraints or processing issues.',
        },
      });
    }

    return patterns;
  }

  /**
   * Detect optimization opportunities
   */
  private detectOpportunities(events: Array<{ id: string; type: string; timestamp: Date; description: string | null; metadata: unknown }>): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];

    // Look for successful completions that could be templates
    const completedEvents = events.filter(e => 
      e.type.includes('completed') || e.type.includes('success')
    );

    // Group by type to find repeatable successes
    const typeGroups = new Map<string, typeof events>();
    for (const event of completedEvents) {
      const base = event.type.replace('_completed', '').replace('_success', '');
      const existing = typeGroups.get(base) || [];
      existing.push(event);
      typeGroups.set(base, existing);
    }

    for (const [baseType, typeEvents] of typeGroups) {
      if (typeEvents.length >= 5) {
        patterns.push({
          id: uuidv4(),
          type: 'opportunity',
          severity: 'info',
          title: `Template Opportunity: ${baseType}`,
          description: `"${baseType}" has completed successfully ${typeEvents.length} times. Consider creating a reusable template or workflow.`,
          evidence: typeEvents.slice(0, 5).map(e => ({
            eventId: e.id,
            eventType: e.type,
            timestamp: e.timestamp,
            relevance: 1.0,
            snippet: e.description || undefined,
          })),
          confidence: 0.6,
          firstDetected: typeEvents[typeEvents.length - 1].timestamp,
          lastSeen: typeEvents[0].timestamp,
          occurrences: typeEvents.length,
          suggestedAction: {
            type: 'self_mod',
            specification: `Create a reusable template for: ${baseType}. This pattern has been successfully executed ${typeEvents.length} times.`,
            confidence: 0.6,
            reasoning: 'Repeated successful patterns are candidates for automation and standardization.',
          },
        });
      }
    }

    return patterns;
  }
}

// Singleton instance
export const patternDetector = new PatternDetector();
