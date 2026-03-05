/**
 * Self-Modification Analysis API
 * 
 * Triggers gap analysis and optionally generates proposals.
 */

import { NextRequest, NextResponse } from 'next/server';
import { selfModificationEngine } from '@/lib/gfs/self-mod';

export const dynamic = 'force-dynamic';

/**
 * POST /api/gfs/self-mod/analyze
 * 
 * Trigger system gap analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { generateProposals = false, autoExecute = false } = body;
    
    if (autoExecute) {
      // Run full cycle with auto-execution
      const result = await selfModificationEngine.runAnalysisCycle();
      
      return NextResponse.json({
        success: true,
        gapsDetected: result.gapsDetected.length,
        proposalsGenerated: result.proposalsGenerated.length,
        autoExecuted: result.autoExecuted.length,
        gaps: result.gapsDetected,
        proposals: result.proposalsGenerated.map(p => ({
          id: p.id,
          title: p.title,
          type: p.type,
          riskLevel: p.riskLevel,
          status: p.status
        })),
        executions: result.autoExecuted.map(e => ({
          proposalId: e.proposalId,
          success: e.success
        }))
      });
    }
    
    // Just analyze gaps
    const gaps = await selfModificationEngine.analyzeGaps();
    
    let proposals: Array<{ id: string; title: string; type: string; riskLevel: string; status: string }> = [];
    
    if (generateProposals) {
      for (const gap of gaps) {
        const proposal = await selfModificationEngine.generateProposal(gap);
        proposals.push({
          id: proposal.id,
          title: proposal.title,
          type: proposal.type,
          riskLevel: proposal.riskLevel,
          status: proposal.status
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      gapsDetected: gaps.length,
      proposalsGenerated: proposals.length,
      gaps: gaps.map(g => ({
        id: g.id,
        type: g.type,
        severity: g.severity,
        title: g.title,
        description: g.description,
        suggestedFix: g.suggestedFix,
        affectedComponents: g.affectedComponents,
        source: g.source
      })),
      proposals
    });
    
  } catch (error) {
    console.error('Gap analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze system gaps' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gfs/self-mod/analyze
 * 
 * Get recent analysis history
 */
export async function GET() {
  try {
    const history = await selfModificationEngine.getModificationHistory(20);
    
    // Filter to just gap detection events
    const gapEvents = history.filter(e => e.type === 'gap_detected');
    
    return NextResponse.json({
      success: true,
      recentGaps: gapEvents.map(e => ({
        description: e.description,
        createdAt: e.createdAt,
        metadata: e.metadata
      }))
    });
    
  } catch (error) {
    console.error('Get analysis history error:', error);
    return NextResponse.json(
      { error: 'Failed to get analysis history' },
      { status: 500 }
    );
  }
}
