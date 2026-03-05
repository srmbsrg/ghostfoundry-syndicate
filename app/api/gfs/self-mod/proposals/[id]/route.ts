/**
 * Single Proposal API
 * 
 * Get, approve, reject, or execute a specific proposal.
 */

import { NextRequest, NextResponse } from 'next/server';
import { selfModificationEngine } from '@/lib/gfs/self-mod';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/gfs/self-mod/proposals/[id]
 * 
 * Get a specific proposal by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const proposal = await selfModificationEngine.getProposal(id);
    
    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      proposal
    });
    
  } catch (error) {
    console.error('Get proposal error:', error);
    return NextResponse.json(
      { error: 'Failed to get proposal' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gfs/self-mod/proposals/[id]
 * 
 * Perform an action on a proposal (approve, reject, execute)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, approverId, approverName, comments, reason } = body;
    
    const proposal = await selfModificationEngine.getProposal(id);
    
    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }
    
    switch (action) {
      case 'approve':
        if (!approverId || !approverName) {
          return NextResponse.json(
            { error: 'approverId and approverName are required' },
            { status: 400 }
          );
        }
        
        await selfModificationEngine.approveProposal(
          id,
          approverId,
          approverName,
          comments
        );
        
        return NextResponse.json({
          success: true,
          message: 'Proposal approved',
          proposalId: id
        });
        
      case 'reject':
        if (!approverId || !approverName || !reason) {
          return NextResponse.json(
            { error: 'approverId, approverName, and reason are required' },
            { status: 400 }
          );
        }
        
        await selfModificationEngine.rejectProposal(
          id,
          approverId,
          approverName,
          reason
        );
        
        return NextResponse.json({
          success: true,
          message: 'Proposal rejected',
          proposalId: id
        });
        
      case 'execute':
        // Validate before execution
        const validation = await selfModificationEngine.validateProposal(proposal);
        
        if (!validation.passed) {
          return NextResponse.json({
            success: false,
            error: 'Validation failed',
            blockers: validation.blockers,
            warnings: validation.warnings
          }, { status: 400 });
        }
        
        // Execute the proposal
        const result = await selfModificationEngine.executeProposal(proposal);
        
        return NextResponse.json({
          success: result.success,
          proposalId: id,
          executedSteps: result.executedSteps.map(s => ({
            action: s.action,
            status: s.status,
            error: s.error
          })),
          artifactsCreated: result.artifacts.length,
          rollbackRequired: result.rollbackRequired,
          rollbackExecuted: result.rollbackExecuted
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: approve, reject, or execute' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Proposal action error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process proposal action' },
      { status: 500 }
    );
  }
}
