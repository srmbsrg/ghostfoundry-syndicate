/**
 * Self-Modification Proposals API
 * 
 * List and manage modification proposals.
 */

import { NextRequest, NextResponse } from 'next/server';
import { selfModificationEngine } from '@/lib/gfs/self-mod';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gfs/self-mod/proposals
 * 
 * List all proposals with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const history = await selfModificationEngine.getModificationHistory(limit);
    
    // Filter to just proposal events
    let proposals = history.filter(e => e.type === 'modification_proposed');
    
    // Filter by status if provided
    if (status) {
      proposals = proposals.filter(e => e.status === status);
    }
    
    return NextResponse.json({
      success: true,
      count: proposals.length,
      proposals: proposals.map(e => {
        const metadata = e.metadata;
        return {
          id: metadata.proposalId,
          title: e.description,
          type: metadata.modificationType,
          riskLevel: metadata.riskLevel,
          status: e.status,
          createdAt: e.createdAt,
          requiredApprovers: metadata.requiredApprovers,
          changesCount: metadata.changesCount,
          executionSteps: metadata.executionSteps
        };
      })
    });
    
  } catch (error) {
    console.error('List proposals error:', error);
    return NextResponse.json(
      { error: 'Failed to list proposals' },
      { status: 500 }
    );
  }
}
