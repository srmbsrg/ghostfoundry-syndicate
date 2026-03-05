/**
 * Document Processor
 * 
 * Understands and extracts information from various document types.
 * Uses LLM for intelligent document understanding.
 */

import OpenAI from 'openai';
import type { 
  DocumentPerception, 
  DocumentType, 
  ExtractedEntity, 
  ExtractedAmount,
  ExtractedDate
} from './types';
import { ghostMemory } from '../memory';

const client = new OpenAI({
  apiKey: process.env.ABACUSAI_API_KEY,
  baseURL: 'https://routellm.abacus.ai/v1'
});

export class DocumentProcessor {
  /**
   * Process a document and extract structured information
   */
  async process(params: {
    content: string;
    source?: string;
    context?: string;
    expectedType?: DocumentType;
  }): Promise<DocumentPerception> {
    const { content, source = 'unknown', context, expectedType } = params;

    // Use LLM to analyze the document
    const analysis = await this.analyzeWithLLM(content, context, expectedType);

    const perception: DocumentPerception = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'document',
      timestamp: new Date(),
      source,
      confidence: analysis.confidence,
      rawInput: content.substring(0, 1000),  // Store first 1000 chars
      processed: true,
      documentType: analysis.documentType,
      extracted: {
        entities: analysis.entities,
        amounts: analysis.amounts,
        dates: analysis.dates,
        keyPhrases: analysis.keyPhrases,
        summary: analysis.summary,
        sentiment: analysis.sentiment,
        urgency: analysis.urgency,
        actionItems: analysis.actionItems
      },
      structuredData: analysis.structuredData,
      classification: analysis.classification
    };

    // Store as episodic memory
    await this.storeAsMemory(perception);

    return perception;
  }

  /**
   * Analyze document with LLM
   */
  private async analyzeWithLLM(
    content: string,
    context?: string,
    expectedType?: DocumentType
  ): Promise<{
    documentType: DocumentType;
    entities: ExtractedEntity[];
    amounts: ExtractedAmount[];
    dates: ExtractedDate[];
    keyPhrases: string[];
    summary: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
    urgency?: 'high' | 'medium' | 'low';
    actionItems?: string[];
    structuredData?: Record<string, unknown>;
    classification?: { category: string; subcategory?: string; confidence: number };
    confidence: number;
  }> {
    const prompt = `You are an expert document analyst. Analyze the following document and extract structured information.

${context ? `Context: ${context}\n\n` : ''}${expectedType ? `Expected document type: ${expectedType}\n\n` : ''}Document Content:
---
${content.substring(0, 6000)}
---

Extract and return a JSON object with:
1. documentType: one of [invoice, contract, report, email, form, receipt, proposal, memo, spreadsheet, unknown]
2. entities: array of {type, value, normalizedValue?, confidence, context?} where type is [person, company, product, location, date, amount, reference]
3. amounts: array of {value, currency, label?, confidence} for any monetary values
4. dates: array of {value (ISO string), type, confidence} where type is [due_date, invoice_date, event_date, deadline, reference]
5. keyPhrases: array of important phrases (max 10)
6. summary: 2-3 sentence summary
7. sentiment: positive/negative/neutral
8. urgency: high/medium/low
9. actionItems: array of action items mentioned (if any)
10. structuredData: key-value pairs of important structured fields specific to this document type
11. classification: {category, subcategory?, confidence}
12. confidence: overall confidence in the extraction (0-1)

Respond ONLY with valid JSON.`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4.1',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 2000
      });

      const responseContent = response.choices[0]?.message?.content;
      if (!responseContent) {
        return this.getDefaultAnalysis(content);
      }

      // Parse JSON from response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.getDefaultAnalysis(content);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Convert date strings to Date objects
      if (parsed.dates) {
        parsed.dates = parsed.dates.map((d: { value: string; type: string; confidence: number }) => ({
          ...d,
          value: new Date(d.value)
        }));
      }

      return {
        documentType: parsed.documentType || 'unknown',
        entities: parsed.entities || [],
        amounts: parsed.amounts || [],
        dates: parsed.dates || [],
        keyPhrases: parsed.keyPhrases || [],
        summary: parsed.summary || 'Unable to generate summary',
        sentiment: parsed.sentiment,
        urgency: parsed.urgency,
        actionItems: parsed.actionItems,
        structuredData: parsed.structuredData,
        classification: parsed.classification,
        confidence: parsed.confidence || 0.7
      };
    } catch (error) {
      console.error('Document analysis error:', error);
      return this.getDefaultAnalysis(content);
    }
  }

  /**
   * Default analysis when LLM fails
   */
  private getDefaultAnalysis(content: string) {
    // Basic extraction without LLM
    const emails = content.match(/[\w.-]+@[\w.-]+\.[\w.-]+/g) || [];
    const amounts = content.match(/\$[\d,]+\.?\d*/g) || [];
    const dates = content.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g) || [];

    return {
      documentType: 'unknown' as DocumentType,
      entities: emails.map(e => ({
        type: 'person' as const,
        value: e,
        confidence: 0.8
      })),
      amounts: amounts.map(a => ({
        value: parseFloat(a.replace(/[$,]/g, '')),
        currency: 'USD',
        confidence: 0.7
      })),
      dates: dates.map(d => ({
        value: new Date(d),
        type: 'reference' as const,
        confidence: 0.6
      })),
      keyPhrases: [],
      summary: content.substring(0, 200) + '...',
      confidence: 0.4
    };
  }

  /**
   * Store document perception as memory
   */
  private async storeAsMemory(perception: DocumentPerception): Promise<void> {
    await ghostMemory.remember({
      type: 'semantic',
      source: 'observation',
      content: `Processed ${perception.documentType}: ${perception.extracted.summary}. Extracted ${perception.extracted.entities.length} entities, ${perception.extracted.amounts?.length || 0} amounts.`,
      importance: perception.extracted.urgency === 'high' ? 'high' : 'medium',
      metadata: {
        tags: ['document', perception.documentType, ...perception.extracted.keyPhrases.slice(0, 5)],
        sourceData: {
          source: perception.source,
          structuredData: perception.structuredData,
          entities: perception.extracted.entities,
        },
      },
    });
  }

  /**
   * Process invoice specifically
   */
  async processInvoice(content: string, source?: string): Promise<DocumentPerception & {
    invoice: {
      invoiceNumber?: string;
      vendor?: string;
      total?: number;
      tax?: number;
      dueDate?: Date;
      lineItems?: Array<{ description: string; quantity?: number; amount: number }>;
    };
  }> {
    const perception = await this.process({
      content,
      source,
      expectedType: 'invoice',
      context: 'This is an invoice document. Extract invoice number, vendor, amounts, due date, and line items.'
    });

    // Extract invoice-specific fields
    const structuredData = perception.structuredData || {};
    
    return {
      ...perception,
      invoice: {
        invoiceNumber: structuredData.invoiceNumber as string,
        vendor: structuredData.vendor as string,
        total: perception.extracted.amounts?.find(a => a.label === 'total')?.value ||
               perception.extracted.amounts?.[0]?.value,
        tax: perception.extracted.amounts?.find(a => a.label === 'tax')?.value,
        dueDate: perception.extracted.dates?.find(d => d.type === 'due_date')?.value,
        lineItems: structuredData.lineItems as Array<{ description: string; quantity?: number; amount: number }>
      }
    };
  }

  /**
   * Process contract specifically
   */
  async processContract(content: string, source?: string): Promise<DocumentPerception & {
    contract: {
      parties?: string[];
      effectiveDate?: Date;
      terminationDate?: Date;
      keyTerms?: string[];
      obligations?: string[];
      value?: number;
    };
  }> {
    const perception = await this.process({
      content,
      source,
      expectedType: 'contract',
      context: 'This is a contract document. Extract parties involved, dates, key terms, obligations, and contract value.'
    });

    const structuredData = perception.structuredData || {};
    const companyEntities = perception.extracted.entities
      .filter(e => e.type === 'company')
      .map(e => e.value);

    return {
      ...perception,
      contract: {
        parties: companyEntities.length > 0 ? companyEntities : structuredData.parties as string[],
        effectiveDate: perception.extracted.dates?.find(d => d.type === 'event_date')?.value,
        terminationDate: perception.extracted.dates?.find(d => d.type === 'deadline')?.value,
        keyTerms: structuredData.keyTerms as string[],
        obligations: structuredData.obligations as string[],
        value: perception.extracted.amounts?.[0]?.value
      }
    };
  }
}

export const documentProcessor = new DocumentProcessor();
