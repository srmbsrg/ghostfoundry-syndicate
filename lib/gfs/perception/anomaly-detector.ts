/**
 * Anomaly Detector
 * 
 * Monitors business metrics and operations for unusual patterns.
 * Detects outliers, trend changes, and unexpected behaviors.
 */

import { prisma } from '@/lib/db';
import OpenAI from 'openai';
import type { AnomalyPerception, AnomalyType } from './types';
import { ghostMemory } from '../memory';
import { EventBus as eventBus } from '../event-bus';

const client = new OpenAI({
  apiKey: process.env.ABACUSAI_API_KEY,
  baseURL: 'https://routellm.abacus.ai/v1'
});

export interface MetricDataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface AnomalyThreshold {
  metric: string;
  type: 'absolute' | 'percent_change' | 'std_deviation';
  value: number;
  direction?: 'above' | 'below' | 'both';
}

export class AnomalyDetector {
  private thresholds: Map<string, AnomalyThreshold[]> = new Map();
  private history: Map<string, MetricDataPoint[]> = new Map();
  private maxHistorySize = 1000;

  /**
   * Set threshold for a metric
   */
  setThreshold(threshold: AnomalyThreshold): void {
    const existing = this.thresholds.get(threshold.metric) || [];
    existing.push(threshold);
    this.thresholds.set(threshold.metric, existing);
  }

  /**
   * Record a metric value and check for anomalies
   */
  async recordMetric(
    metric: string,
    value: number,
    metadata?: Record<string, unknown>
  ): Promise<AnomalyPerception | null> {
    // Add to history
    const history = this.history.get(metric) || [];
    const dataPoint: MetricDataPoint = {
      timestamp: new Date(),
      value,
      metadata
    };
    history.push(dataPoint);

    // Trim history
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
    this.history.set(metric, history);

    // Check for anomalies
    const anomaly = await this.detectAnomaly(metric, value, history);
    
    if (anomaly) {
      // Publish event
      await eventBus.emit(
        'system',
        'gfs.perception.anomaly_detected',
        {
          anomalyId: anomaly.id,
          metric,
          severity: anomaly.anomaly.severity,
          description: anomaly.anomaly.description
        }
      );

      // Store as memory
      await this.storeAsMemory(anomaly);
    }

    return anomaly;
  }

  /**
   * Detect anomaly in metric
   */
  private async detectAnomaly(
    metric: string,
    value: number,
    history: MetricDataPoint[]
  ): Promise<AnomalyPerception | null> {
    if (history.length < 10) {
      return null;  // Not enough data
    }

    const anomalies: Array<{
      type: AnomalyType;
      deviation: number;
      description: string;
    }> = [];

    // Calculate statistics
    const values = history.map(h => h.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const previousValue = history[history.length - 2]?.value;

    // Check standard deviation threshold
    const zScore = stdDev > 0 ? (value - mean) / stdDev : 0;
    if (Math.abs(zScore) > 3) {
      anomalies.push({
        type: 'outlier',
        deviation: zScore,
        description: `${metric} value ${value} is ${Math.abs(zScore).toFixed(1)} standard deviations from mean ${mean.toFixed(2)}`
      });
    }

    // Check percent change from previous
    if (previousValue && previousValue !== 0) {
      const percentChange = ((value - previousValue) / Math.abs(previousValue)) * 100;
      if (Math.abs(percentChange) > 50) {  // 50% change threshold
        anomalies.push({
          type: 'pattern_break',
          deviation: percentChange,
          description: `${metric} changed ${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}% from previous value`
        });
      }
    }

    // Check custom thresholds
    const customThresholds = this.thresholds.get(metric) || [];
    for (const threshold of customThresholds) {
      const breach = this.checkThreshold(value, previousValue, mean, stdDev, threshold);
      if (breach) {
        anomalies.push({
          type: 'threshold_breach',
          deviation: breach.deviation,
          description: breach.description
        });
      }
    }

    // Detect trend changes
    if (history.length >= 20) {
      const trendChange = this.detectTrendChange(values);
      if (trendChange) {
        anomalies.push({
          type: 'trend_change',
          deviation: trendChange.magnitude,
          description: trendChange.description
        });
      }
    }

    if (anomalies.length === 0) {
      return null;
    }

    // Take the most severe anomaly
    const mostSevere = anomalies.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation))[0];

    // Determine severity
    const severity = Math.abs(mostSevere.deviation) > 5 ? 'critical' :
                     Math.abs(mostSevere.deviation) > 3 ? 'warning' : 'info';

    // Get possible causes and actions from LLM
    const analysis = await this.analyzeAnomaly(metric, value, mean, mostSevere);

    return {
      id: `anom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'anomaly',
      timestamp: new Date(),
      source: metric,
      confidence: 0.8,
      processed: true,
      anomaly: {
        anomalyType: mostSevere.type,
        severity,
        description: mostSevere.description,
        affectedMetric: metric,
        expectedValue: mean,
        actualValue: value,
        deviation: mostSevere.deviation
      },
      analysis: {
        possibleCauses: analysis.possibleCauses,
        suggestedActions: analysis.suggestedActions,
        confidence: analysis.confidence
      }
    };
  }

  /**
   * Check a specific threshold
   */
  private checkThreshold(
    value: number,
    previousValue: number | undefined,
    mean: number,
    stdDev: number,
    threshold: AnomalyThreshold
  ): { deviation: number; description: string } | null {
    switch (threshold.type) {
      case 'absolute': {
        const direction = threshold.direction || 'both';
        if (direction === 'above' && value > threshold.value) {
          return {
            deviation: value - threshold.value,
            description: `${threshold.metric} exceeded threshold ${threshold.value} (actual: ${value})`
          };
        }
        if (direction === 'below' && value < threshold.value) {
          return {
            deviation: threshold.value - value,
            description: `${threshold.metric} below threshold ${threshold.value} (actual: ${value})`
          };
        }
        if (direction === 'both' && Math.abs(value - threshold.value) > threshold.value * 0.1) {
          return {
            deviation: Math.abs(value - threshold.value),
            description: `${threshold.metric} deviated from expected ${threshold.value} (actual: ${value})`
          };
        }
        break;
      }
      case 'percent_change': {
        if (previousValue && previousValue !== 0) {
          const change = Math.abs((value - previousValue) / previousValue) * 100;
          if (change > threshold.value) {
            return {
              deviation: change,
              description: `${threshold.metric} changed ${change.toFixed(1)}% (threshold: ${threshold.value}%)`
            };
          }
        }
        break;
      }
      case 'std_deviation': {
        if (stdDev > 0) {
          const zScore = (value - mean) / stdDev;
          if (Math.abs(zScore) > threshold.value) {
            return {
              deviation: zScore,
              description: `${threshold.metric} is ${Math.abs(zScore).toFixed(1)} std devs from mean (threshold: ${threshold.value})`
            };
          }
        }
        break;
      }
    }
    return null;
  }

  /**
   * Detect trend changes
   */
  private detectTrendChange(values: number[]): { magnitude: number; description: string } | null {
    const n = values.length;
    const midpoint = Math.floor(n / 2);
    
    const firstHalf = values.slice(0, midpoint);
    const secondHalf = values.slice(midpoint);

    const firstMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const meanChange = secondMean - firstMean;
    const percentChange = firstMean !== 0 ? (meanChange / Math.abs(firstMean)) * 100 : 0;

    if (Math.abs(percentChange) > 30) {
      return {
        magnitude: percentChange,
        description: `Trend shifted ${percentChange > 0 ? 'upward' : 'downward'} by ${Math.abs(percentChange).toFixed(1)}%`
      };
    }

    return null;
  }

  /**
   * Analyze anomaly with LLM
   */
  private async analyzeAnomaly(
    metric: string,
    value: number,
    mean: number,
    anomaly: { type: AnomalyType; deviation: number; description: string }
  ): Promise<{
    possibleCauses: string[];
    suggestedActions: string[];
    confidence: number;
  }> {
    try {
      const prompt = `An anomaly was detected in a business metric. Analyze and suggest causes and actions.

Metric: ${metric}
Current Value: ${value}
Expected (Mean): ${mean.toFixed(2)}
Anomaly Type: ${anomaly.type}
Description: ${anomaly.description}

Provide JSON with:
1. possibleCauses: array of 2-4 likely causes
2. suggestedActions: array of 2-3 recommended actions
3. confidence: your confidence in this analysis (0-1)

Respond with valid JSON only.`;

      const response = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (error) {
      console.error('Anomaly analysis error:', error);
    }

    // Default response
    return {
      possibleCauses: ['Unusual activity', 'Data quality issue', 'External factor'],
      suggestedActions: ['Investigate the data source', 'Review recent changes'],
      confidence: 0.5
    };
  }

  /**
   * Store anomaly as memory
   */
  private async storeAsMemory(anomaly: AnomalyPerception): Promise<void> {
    await ghostMemory.remember({
      type: 'episodic',
      source: 'observation',
      content: `Anomaly detected: ${anomaly.anomaly.description}. Suggested actions: ${anomaly.analysis.suggestedActions?.join('; ') || 'None'}`,
      importance: anomaly.anomaly.severity === 'critical' ? 'critical' :
                  anomaly.anomaly.severity === 'warning' ? 'high' : 'medium',
      metadata: {
        tags: ['anomaly', anomaly.anomaly.anomalyType, anomaly.anomaly.severity],
        sourceData: { source: anomaly.source },
      },
    });
  }

  /**
   * Get recent anomalies
   */
  async getRecentAnomalies(hours: number = 24): Promise<AnomalyPerception[]> {
    const events = await prisma.factoryEvent.findMany({
      where: {
        type: 'anomaly_detected',
        timestamp: {
          gte: new Date(Date.now() - hours * 60 * 60 * 1000)
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    return events.map(e => e.metadata as unknown as AnomalyPerception);
  }

  /**
   * Get metric history
   */
  getMetricHistory(metric: string): MetricDataPoint[] {
    return this.history.get(metric) || [];
  }

  /**
   * Clear history (for testing)
   */
  clearHistory(): void {
    this.history.clear();
  }
}

export const anomalyDetector = new AnomalyDetector();
