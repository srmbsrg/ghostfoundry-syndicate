/**
 * Self-Modification History API
 * 
 * Get the history of all self-modification events.
 */

import { NextRequest, NextResponse } from 'next/server';
import { selfModificationEngine } from '@/lib/gfs/self-mod';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gfs/self-mod/history
 * 
 * Get modification history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    
    let history = await selfModificationEngine.getModificationHistory(limit);
    
    // Filter by type if provided
    if (type) {
      history = history.filter(e => e.type === type);
    }
    
    // Group by type for summary
    const summary: Record<string, number> = {};
    for (const event of history) {
      summary[event.type] = (summary[event.type] || 0) + 1;
    }
    
    return NextResponse.json({
      success: true,
      count: history.length,
      summary,
      events: history.map(e => ({
        type: e.type,
        description: e.description,
        status: e.status,
        createdAt: e.createdAt,
        metadata: {
          proposalId: e.metadata?.proposalId,
          gapId: e.metadata?.gapId,
          riskLevel: e.metadata?.riskLevel,
          severity: e.metadata?.severity
        }
      }))
    });
    
  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json(
      { error: 'Failed to get modification history' },
      { status: 500 }
    );
  }
}
