/**
 * Email Analyzer
 * 
 * Understands email intent, extracts action items, and suggests responses.
 */

import OpenAI from 'openai';
import type { EmailPerception, EmailIntent, ExtractedEntity } from './types';
import { ghostMemory } from '../memory';

const client = new OpenAI({
  apiKey: process.env.ABACUSAI_API_KEY,
  baseURL: 'https://routellm.abacus.ai/v1'
});

export class EmailAnalyzer {
  /**
   * Analyze an email
   */
  async analyze(params: {
    from: string;
    to: string[];
    cc?: string[];
    subject: string;
    body: string;
    receivedAt?: Date;
    threadId?: string;
    context?: string;  // Previous context about this sender/thread
  }): Promise<EmailPerception> {
    const {
      from,
      to,
      cc,
      subject,
      body,
      receivedAt = new Date(),
      threadId,
      context
    } = params;

    // Get context from memory about this sender
    const senderContext = await this.getSenderContext(from);

    // Analyze with LLM
    const analysis = await this.analyzeWithLLM({
      from,
      subject,
      body,
      context: context || senderContext
    });

    const perception: EmailPerception = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'email',
      timestamp: receivedAt,
      source: 'email',
      confidence: analysis.confidence,
      rawInput: body.substring(0, 1000),
      processed: true,
      email: {
        from,
        to,
        cc,
        subject,
        receivedAt,
        threadId
      },
      analysis: {
        intent: analysis.intent,
        sentiment: analysis.sentiment,
        priority: analysis.priority,
        actionRequired: analysis.actionRequired,
        suggestedActions: analysis.suggestedActions,
        entities: analysis.entities,
        summary: analysis.summary,
        replyDraft: analysis.replyDraft
      }
    };

    // Store as memory
    await this.storeAsMemory(perception);

    return perception;
  }

  /**
   * Get context about a sender from memory
   */
  private async getSenderContext(email: string): Promise<string | undefined> {
    try {
      const memories = await ghostMemory.recall(`emails from ${email}`, { limit: 5 });
      
      if (memories.length === 0) return undefined;

      const context = memories
        .map((m: { memory: { content: string } }) => m.memory.content)
        .join('\n');

      return `Previous interactions with ${email}:\n${context}`;
    } catch {
      return undefined;
    }
  }

  /**
   * Analyze email with LLM
   */
  private async analyzeWithLLM(params: {
    from: string;
    subject: string;
    body: string;
    context?: string;
  }): Promise<{
    intent: EmailIntent;
    sentiment: 'positive' | 'negative' | 'neutral' | 'urgent';
    priority: 'high' | 'medium' | 'low';
    actionRequired: boolean;
    suggestedActions?: string[];
    entities: ExtractedEntity[];
    summary: string;
    replyDraft?: string;
    confidence: number;
  }> {
    const prompt = `You are an expert email analyst. Analyze this email and extract actionable insights.

${params.context ? `Context:\n${params.context}\n\n` : ''}From: ${params.from}
Subject: ${params.subject}

Body:
---
${params.body.substring(0, 4000)}
---

Extract and return a JSON object with:
1. intent: one of [request, question, complaint, information, confirmation, followup, introduction, negotiation, unknown]
2. sentiment: positive/negative/neutral/urgent
3. priority: high/medium/low
4. actionRequired: boolean - does this need a response or action?
5. suggestedActions: array of specific actions to take (if any)
6. entities: array of {type, value, confidence} where type is [person, company, product, date, amount, reference]
7. summary: 1-2 sentence summary of the email
8. replyDraft: A brief professional reply draft (if action is required)
9. confidence: overall analysis confidence (0-1)

Respond ONLY with valid JSON.`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4.1',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return this.getDefaultAnalysis(params);
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.getDefaultAnalysis(params);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        intent: parsed.intent || 'unknown',
        sentiment: parsed.sentiment || 'neutral',
        priority: parsed.priority || 'medium',
        actionRequired: parsed.actionRequired || false,
        suggestedActions: parsed.suggestedActions,
        entities: parsed.entities || [],
        summary: parsed.summary || 'Email from ' + params.from,
        replyDraft: parsed.replyDraft,
        confidence: parsed.confidence || 0.7
      };
    } catch (error) {
      console.error('Email analysis error:', error);
      return this.getDefaultAnalysis(params);
    }
  }

  /**
   * Default analysis when LLM fails
   */
  private getDefaultAnalysis(params: { from: string; subject: string; body: string }) {
    const urgencyWords = ['urgent', 'asap', 'immediately', 'critical', 'emergency'];
    const questionWords = ['?', 'how', 'what', 'when', 'where', 'why', 'could you', 'can you'];
    
    const isUrgent = urgencyWords.some(w => 
      params.subject.toLowerCase().includes(w) || params.body.toLowerCase().includes(w)
    );
    const isQuestion = questionWords.some(w => params.body.toLowerCase().includes(w));

    return {
      intent: (isQuestion ? 'question' : 'information') as EmailIntent,
      sentiment: (isUrgent ? 'urgent' : 'neutral') as 'positive' | 'negative' | 'neutral' | 'urgent',
      priority: (isUrgent ? 'high' : 'medium') as 'high' | 'medium' | 'low',
      actionRequired: isQuestion || isUrgent,
      entities: [] as ExtractedEntity[],
      summary: `Email from ${params.from}: ${params.subject}`,
      confidence: 0.4
    };
  }

  /**
   * Store email perception as memory
   */
  private async storeAsMemory(perception: EmailPerception): Promise<void> {
    const entities = perception.analysis.entities.map(e => ({
      type: e.type as 'person' | 'company' | 'product' | 'location',
      name: e.value
    }));

    // Add sender as entity
    entities.push({
      type: 'person' as const,
      name: perception.email.from
    });

    await ghostMemory.remember({
      type: 'episodic',
      source: 'external_integration',
      content: `Email from ${perception.email.from}: ${perception.email.subject}. ${perception.analysis.summary}`,
      importance: perception.analysis.priority === 'high' ? 'high' : 'medium',
      metadata: {
        tags: ['email', perception.analysis.intent, perception.analysis.priority],
        sourceData: {
          emailFrom: perception.email.from,
          emailSubject: perception.email.subject,
          actionRequired: perception.analysis.actionRequired,
          suggestedActions: perception.analysis.suggestedActions,
          entities: entities.map(e => ({ type: e.type, name: e.name })),
        },
      },
    });
  }

  /**
   * Batch analyze multiple emails
   */
  async batchAnalyze(emails: Array<{
    from: string;
    to: string[];
    subject: string;
    body: string;
    receivedAt?: Date;
  }>): Promise<EmailPerception[]> {
    const results = await Promise.all(
      emails.map(email => this.analyze(email))
    );

    // Sort by priority
    results.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.analysis.priority] - priorityOrder[b.analysis.priority];
    });

    return results;
  }

  /**
   * Get email statistics
   */
  getStatistics(perceptions: EmailPerception[]): {
    total: number;
    byPriority: Record<string, number>;
    byIntent: Record<string, number>;
    actionRequired: number;
    avgConfidence: number;
  } {
    const byPriority: Record<string, number> = { high: 0, medium: 0, low: 0 };
    const byIntent: Record<string, number> = {};
    let actionRequired = 0;
    let totalConfidence = 0;

    for (const p of perceptions) {
      byPriority[p.analysis.priority] = (byPriority[p.analysis.priority] || 0) + 1;
      byIntent[p.analysis.intent] = (byIntent[p.analysis.intent] || 0) + 1;
      if (p.analysis.actionRequired) actionRequired++;
      totalConfidence += p.confidence;
    }

    return {
      total: perceptions.length,
      byPriority,
      byIntent,
      actionRequired,
      avgConfidence: perceptions.length > 0 ? totalConfidence / perceptions.length : 0
    };
  }
}

export const emailAnalyzer = new EmailAnalyzer();
