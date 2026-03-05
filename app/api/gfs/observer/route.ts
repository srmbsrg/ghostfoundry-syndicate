// Observer API - Main endpoints
import { NextRequest, NextResponse } from 'next/server';
import { GhostObserver } from '@/lib/gfs/observer';

export const dynamic = 'force-dynamic';

// GET - Get observer state and recent patterns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'state';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (action === 'patterns') {
      const patterns = await GhostObserver.getRecentPatterns(limit);
      return NextResponse.json({
        success: true,
        patterns,
        count: patterns.length,
      });
    }

    // Default: return state with defaults for any missing values
    const state = GhostObserver.getState();
    return NextResponse.json({
      success: true,
      state: {
        isRunning: state?.isRunning ?? false,
        lastAnalysis: state?.lastAnalysis ?? null,
        patternsDetected: state?.patternsDetected ?? 0,
        proposalsGenerated: state?.proposalsGenerated ?? 0,
        alertsSent: state?.alertsSent ?? 0,
      },
    });
  } catch (error) {
    console.error('Observer API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get observer data' },
      { status: 500 }
    );
  }
}

// POST - Run analysis or control observer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'analyze': {
        const patterns = await GhostObserver.analyze();
        return NextResponse.json({
          success: true,
          message: 'Analysis complete',
          patternsDetected: patterns.length,
          patterns: patterns.slice(0, 10), // Return first 10
        });
      }

      case 'start': {
        const interval = body.intervalMinutes || 15;
        GhostObserver.start(interval);
        return NextResponse.json({
          success: true,
          message: `Observer started with ${interval} minute interval`,
          state: GhostObserver.getState(),
        });
      }

      case 'stop': {
        GhostObserver.stop();
        return NextResponse.json({
          success: true,
          message: 'Observer stopped',
          state: GhostObserver.getState(),
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: analyze, start, stop' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Observer API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute observer action' },
      { status: 500 }
    );
  }
}
