// GFS Pattern Observer - Action Recommender
// Uses LLM to generate intelligent action recommendations

import { DetectedPattern, SuggestedAction } from './types';
import { callLLM, LLMMessage } from '@/lib/gfs/engine/llm-client';

const SYSTEM_PROMPT = `You are the GhostFoundry-Syndicate Pattern Analyzer.
You analyze detected patterns and recommend actions for the autonomous operations system.

Your recommendations should be:
1. Actionable and specific
2. Prioritized by impact and urgency
3. Aligned with system safety (prefer human_review for high-risk actions)
4. Optimized for automation where safe

Response format:
{
  "type": "self_mod" | "alert" | "workflow" | "human_review" | "ignore",
  "specification": "<detailed spec for self_mod, or null>",
  "confidence": <0-1>,
  "reasoning": "<explanation>"
}`;

export class ActionRecommender {
  /**
   * Analyze a pattern and recommend an action
   */
  async recommend(pattern: DetectedPattern): Promise<SuggestedAction> {
    // If pattern already has a suggestion with high confidence, use it
    if (pattern.suggestedAction && pattern.suggestedAction.confidence >= 0.8) {
      return pattern.suggestedAction;
    }

    try {
      const prompt = `Analyze this detected pattern and recommend an action:

Pattern Type: ${pattern.type}
Severity: ${pattern.severity}
Title: ${pattern.title}
Description: ${pattern.description}
Confidence: ${(pattern.confidence * 100).toFixed(1)}%
Occurrences: ${pattern.occurrences}

Evidence (first 5):
${pattern.evidence.slice(0, 5).map(e => `- ${e.eventType}: ${e.snippet || 'No description'}`).join('\n')}

${pattern.suggestedAction ? `Initial suggestion: ${JSON.stringify(pattern.suggestedAction)}` : ''}

Provide your recommendation as JSON.`;

      const messages: LLMMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ];

      const response = await callLLM(messages, {
        model: 'gpt-4.1-mini',
        temperature: 0.3,
        maxTokens: 500,
      });

      const content = response.content;
      
      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as SuggestedAction;
        return {
          type: parsed.type || 'human_review',
          specification: parsed.specification || undefined,
          confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
          reasoning: parsed.reasoning || 'LLM-generated recommendation',
        };
      }

      // Fallback if parsing fails
      return {
        type: 'human_review',
        confidence: 0.5,
        reasoning: 'Unable to parse LLM response, defaulting to human review.',
      };
    } catch (error) {
      console.error('Action recommender error:', error);
      
      // Return existing suggestion or default
      return pattern.suggestedAction || {
        type: 'human_review',
        confidence: 0.5,
        reasoning: 'Error during analysis, defaulting to human review.',
      };
    }
  }

  /**
   * Batch analyze multiple patterns
   */
  async recommendBatch(patterns: DetectedPattern[]): Promise<Map<string, SuggestedAction>> {
    const results = new Map<string, SuggestedAction>();

    // Process in parallel with a concurrency limit
    const BATCH_SIZE = 5;
    for (let i = 0; i < patterns.length; i += BATCH_SIZE) {
      const batch = patterns.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (pattern) => {
        const action = await this.recommend(pattern);
        results.set(pattern.id, action);
      });
      await Promise.all(promises);
    }

    return results;
  }

  /**
   * Generate a self-modification specification from a pattern
   */
  async generateSpec(pattern: DetectedPattern): Promise<string> {
    try {
      const prompt = `Generate a detailed specification for a self-modification to address this pattern:

Pattern: ${pattern.title}
Description: ${pattern.description}
Type: ${pattern.type}
Occurrences: ${pattern.occurrences}

Generate a specification that the Dark Factory can execute. Be specific about:
1. What code/capability needs to be created or modified
2. What database changes (if any) are needed
3. What API endpoints should be added
4. How this solves the pattern

Provide only the specification text, no JSON wrapper.`;

      const messages: LLMMessage[] = [
        { 
          role: 'system', 
          content: 'You are a senior software architect generating specifications for an AI-powered code generation system.' 
        },
        { role: 'user', content: prompt },
      ];

      const response = await callLLM(messages, {
        model: 'gpt-4.1',
        temperature: 0.4,
        maxTokens: 1000,
      });

      return response.content || pattern.description;
    } catch (error) {
      console.error('Spec generation error:', error);
      return pattern.description;
    }
  }
}

// Singleton instance
export const actionRecommender = new ActionRecommender();
