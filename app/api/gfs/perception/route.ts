/**
 * Perception System API
 * 
 * POST /api/gfs/perception - Process various perception types
 * GET /api/gfs/perception - Get perception status and recent data
 */

import { NextRequest, NextResponse } from 'next/server';
import { perception } from '@/lib/gfs/perception';

export const dynamic = 'force-dynamic';

/**
 * Process perceptions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...params } = body;

    switch (type) {
      case 'document': {
        const result = await perception.processDocument({
          content: params.content,
          source: params.source,
          context: params.context,
          expectedType: params.expectedType
        });
        return NextResponse.json({ success: true, perception: result });
      }

      case 'invoice': {
        const result = await perception.processInvoice(params.content, params.source);
        return NextResponse.json({ success: true, perception: result });
      }

      case 'contract': {
        const result = await perception.processContract(params.content, params.source);
        return NextResponse.json({ success: true, perception: result });
      }

      case 'email': {
        const result = await perception.analyzeEmail({
          from: params.from,
          to: params.to || [],
          cc: params.cc,
          subject: params.subject,
          body: params.body,
          receivedAt: params.receivedAt ? new Date(params.receivedAt) : undefined,
          threadId: params.threadId,
          context: params.context
        });
        return NextResponse.json({ success: true, perception: result });
      }

      case 'emails': {
        const results = await perception.analyzeEmails(params.emails);
        return NextResponse.json({ 
          success: true, 
          perceptions: results,
          summary: {
            total: results.length,
            highPriority: results.filter(r => r.analysis.priority === 'high').length,
            actionRequired: results.filter(r => r.analysis.actionRequired).length
          }
        });
      }

      case 'metric': {
        const anomaly = await perception.recordMetric(
          params.metric,
          params.value,
          params.metadata
        );
        return NextResponse.json({ 
          success: true, 
          anomalyDetected: !!anomaly,
          anomaly
        });
      }

      case 'signal': {
        const result = await perception.processSignal({
          source: params.source,
          headline: params.headline,
          content: params.content,
          url: params.url,
          publishedAt: params.publishedAt ? new Date(params.publishedAt) : undefined,
          metadata: params.metadata
        });
        return NextResponse.json({ 
          success: true, 
          relevant: !!result,
          perception: result
        });
      }

      case 'signals': {
        const results = await perception.processSignals(params.signals);
        const brief = await perception.generateIntelligenceBrief(results);
        return NextResponse.json({ 
          success: true, 
          perceptions: results,
          brief
        });
      }

      case 'configure_signals': {
        perception.configureSignals({
          businessDescription: params.businessDescription,
          competitors: params.competitors,
          industryKeywords: params.industryKeywords
        });
        return NextResponse.json({ success: true, message: 'Signal detector configured' });
      }

      case 'set_threshold': {
        perception.setAnomalyThreshold({
          metric: params.metric,
          type: params.thresholdType,
          value: params.value,
          direction: params.direction
        });
        return NextResponse.json({ success: true, message: 'Threshold set' });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: document, invoice, contract, email, emails, metric, signal, signals, configure_signals, set_threshold' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Perception API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Perception processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Get perception status and data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    switch (action) {
      case 'anomalies': {
        const hours = parseInt(searchParams.get('hours') || '24');
        const anomalies = await perception.getRecentAnomalies(hours);
        return NextResponse.json({ success: true, anomalies });
      }

      case 'metric_history': {
        const metric = searchParams.get('metric');
        if (!metric) {
          return NextResponse.json({ error: 'Metric name required' }, { status: 400 });
        }
        const history = perception.getMetricHistory(metric);
        return NextResponse.json({ success: true, history });
      }

      default:
        return NextResponse.json({
          success: true,
          capabilities: [
            'document processing',
            'email analysis',
            'anomaly detection',
            'signal intelligence'
          ],
          actions: ['anomalies', 'metric_history']
        });
    }
  } catch (error) {
    console.error('Perception GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get perception data' },
      { status: 500 }
    );
  }
}
