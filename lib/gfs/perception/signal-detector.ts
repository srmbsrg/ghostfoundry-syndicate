/**
 * Signal Detector
 * 
 * Monitors external signals: market trends, competitor moves, industry news.
 * Delivers actionable intelligence to stay ahead.
 */

import OpenAI from 'openai';
import type { SignalPerception, SignalStrength } from './types';
import { ghostMemory } from '../memory';
import { EventBus as eventBus } from '../event-bus';

const client = new OpenAI({
  apiKey: process.env.ABACUSAI_API_KEY,
  baseURL: 'https://routellm.abacus.ai/v1'
});

export interface SignalSource {
  id: string;
  name: string;
  type: 'rss' | 'api' | 'webhook' | 'manual';
  categories: string[];
  url?: string;
  isActive: boolean;
}

export interface RawSignal {
  source: string;
  headline: string;
  content: string;
  url?: string;
  publishedAt?: Date;
  metadata?: Record<string, unknown>;
}

export class SignalDetector {
  private sources: Map<string, SignalSource> = new Map();
  private businessContext: string = '';
  private competitors: string[] = [];
  private industryKeywords: string[] = [];

  /**
   * Configure business context for relevance scoring
   */
  configure(config: {
    businessDescription?: string;
    competitors?: string[];
    industryKeywords?: string[];
  }): void {
    if (config.businessDescription) {
      this.businessContext = config.businessDescription;
    }
    if (config.competitors) {
      this.competitors = config.competitors;
    }
    if (config.industryKeywords) {
      this.industryKeywords = config.industryKeywords;
    }
  }

  /**
   * Add a signal source
   */
  addSource(source: SignalSource): void {
    this.sources.set(source.id, source);
  }

  /**
   * Process a raw signal
   */
  async processSignal(raw: RawSignal): Promise<SignalPerception | null> {
    // First, check if this is relevant to our business
    const relevance = this.calculateRelevance(raw);
    
    if (relevance < 0.3) {
      return null;  // Not relevant enough
    }

    // Analyze the signal with LLM
    const analysis = await this.analyzeWithLLM(raw);

    if (!analysis) {
      return null;
    }

    const perception: SignalPerception = {
      id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'signal',
      timestamp: raw.publishedAt || new Date(),
      source: raw.source,
      confidence: analysis.confidence,
      rawInput: raw.content.substring(0, 500),
      processed: true,
      signal: {
        category: analysis.category,
        headline: raw.headline,
        description: analysis.description,
        strength: analysis.strength,
        sources: [raw.source],
        relevanceScore: relevance
      },
      implications: {
        opportunities: analysis.opportunities,
        threats: analysis.threats,
        suggestedActions: analysis.suggestedActions,
        affectedAreas: analysis.affectedAreas
      }
    };

    // Store as memory
    await this.storeAsMemory(perception);

    // Publish event if significant
    if (analysis.strength === 'strong' || relevance > 0.7) {
      await eventBus.emit(
        'system',
        'gfs.perception.signal_detected',
        {
          signalId: perception.id,
          category: analysis.category,
          headline: raw.headline,
          strength: analysis.strength,
          relevance
        }
      );
    }

    return perception;
  }

  /**
   * Calculate relevance score for a signal
   */
  private calculateRelevance(raw: RawSignal): number {
    const text = `${raw.headline} ${raw.content}`.toLowerCase();
    let score = 0;
    let factors = 0;

    // Check for competitor mentions
    for (const competitor of this.competitors) {
      if (text.includes(competitor.toLowerCase())) {
        score += 0.4;
        factors++;
      }
    }

    // Check for industry keywords
    let keywordMatches = 0;
    for (const keyword of this.industryKeywords) {
      if (text.includes(keyword.toLowerCase())) {
        keywordMatches++;
      }
    }
    if (this.industryKeywords.length > 0) {
      score += (keywordMatches / this.industryKeywords.length) * 0.3;
      factors++;
    }

    // Check for high-impact words
    const impactWords = ['acquisition', 'merger', 'lawsuit', 'bankruptcy', 'layoff', 
                         'funding', 'ipo', 'partnership', 'breach', 'outage',
                         'regulation', 'compliance', 'disruption', 'innovation'];
    let impactMatches = 0;
    for (const word of impactWords) {
      if (text.includes(word)) {
        impactMatches++;
      }
    }
    if (impactMatches > 0) {
      score += Math.min(0.3, impactMatches * 0.1);
      factors++;
    }

    return factors > 0 ? score / factors : 0.2;
  }

  /**
   * Analyze signal with LLM
   */
  private async analyzeWithLLM(raw: RawSignal): Promise<{
    category: SignalPerception['signal']['category'];
    description: string;
    strength: SignalStrength;
    opportunities?: string[];
    threats?: string[];
    suggestedActions?: string[];
    affectedAreas?: string[];
    confidence: number;
  } | null> {
    try {
      const prompt = `You are a business intelligence analyst. Analyze this external signal for a company in the following context:

${this.businessContext ? `Business Context: ${this.businessContext}\n` : ''}${this.competitors.length > 0 ? `Key Competitors: ${this.competitors.join(', ')}\n` : ''}${this.industryKeywords.length > 0 ? `Industry Keywords: ${this.industryKeywords.join(', ')}\n` : ''}
Signal:
Headline: ${raw.headline}
Source: ${raw.source}
Content: ${raw.content.substring(0, 2000)}

Analyze and return JSON with:
1. category: one of [market, competitor, industry, regulatory, technology, customer]
2. description: 1-2 sentence summary of the signal's significance
3. strength: strong/moderate/weak based on potential impact
4. opportunities: array of potential opportunities (if any)
5. threats: array of potential threats (if any)
6. suggestedActions: array of recommended actions (1-3)
7. affectedAreas: array of business areas this might affect
8. confidence: your confidence in this analysis (0-1)

Respond with valid JSON only.`;

      const response = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 800
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Signal analysis error:', error);
      return null;
    }
  }

  /**
   * Store signal as memory
   */
  private async storeAsMemory(perception: SignalPerception): Promise<void> {
    const importance = perception.signal.strength === 'strong' ? 'high' :
                       perception.signal.strength === 'moderate' ? 'medium' : 'low';

    await ghostMemory.remember({
      type: 'semantic',
      source: 'observation',
      content: `External signal: ${perception.signal.headline}. ${perception.signal.description}. Suggested actions: ${perception.implications.suggestedActions?.join('; ') || 'None'}`,
      importance,
      metadata: {
        tags: ['signal', perception.signal.category, perception.signal.strength],
        sourceData: {
          source: perception.source,
          threats: perception.implications.threats,
          opportunities: perception.implications.opportunities,
        },
      },
    });
  }

  /**
   * Batch process signals
   */
  async batchProcess(signals: RawSignal[]): Promise<SignalPerception[]> {
    const results: SignalPerception[] = [];

    for (const signal of signals) {
      const perception = await this.processSignal(signal);
      if (perception) {
        results.push(perception);
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.signal.relevanceScore - a.signal.relevanceScore);

    return results;
  }

  /**
   * Generate intelligence brief from recent signals
   */
  async generateBrief(signals: SignalPerception[]): Promise<{
    summary: string;
    topSignals: SignalPerception[];
    keyThemes: string[];
    recommendations: string[];
  }> {
    if (signals.length === 0) {
      return {
        summary: 'No significant signals detected in this period.',
        topSignals: [],
        keyThemes: [],
        recommendations: []
      };
    }

    const topSignals = signals.slice(0, 5);
    
    // Collect themes and recommendations
    const allThreats = signals.flatMap(s => s.implications.threats || []);
    const allOpportunities = signals.flatMap(s => s.implications.opportunities || []);
    const allActions = signals.flatMap(s => s.implications.suggestedActions || []);

    // Use LLM to synthesize
    try {
      const prompt = `Synthesize these business intelligence signals into a brief executive summary.

Signals:
${topSignals.map(s => `- [${s.signal.category}] ${s.signal.headline}: ${s.signal.description}`).join('\n')}

Key Threats: ${allThreats.slice(0, 5).join(', ')}
Key Opportunities: ${allOpportunities.slice(0, 5).join(', ')}

Provide JSON with:
1. summary: 2-3 sentence executive summary
2. keyThemes: array of 3-5 key themes emerging from these signals
3. recommendations: array of 3-5 prioritized action recommendations

Respond with valid JSON only.`;

      const response = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 600
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            summary: parsed.summary,
            topSignals,
            keyThemes: parsed.keyThemes,
            recommendations: parsed.recommendations
          };
        }
      }
    } catch (error) {
      console.error('Brief generation error:', error);
    }

    // Fallback
    return {
      summary: `Detected ${signals.length} signals across ${new Set(signals.map(s => s.signal.category)).size} categories.`,
      topSignals,
      keyThemes: [...new Set(signals.map(s => s.signal.category))],
      recommendations: [...new Set(allActions)].slice(0, 5)
    };
  }
}

export const signalDetector = new SignalDetector();
