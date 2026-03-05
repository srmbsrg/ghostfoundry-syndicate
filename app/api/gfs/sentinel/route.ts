// GFS Sentinel API
import { NextRequest, NextResponse } from 'next/server';
import { sentinelService } from '@/lib/gfs/sentinel';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gfs/sentinel - Get alert statistics
 */
export async function GET() {
  try {
    const stats = await sentinelService.getAlertStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[Sentinel API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gfs/sentinel - Process an event through Sentinel
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, payload, metadata } = body;

    if (!type || !payload) {
      return NextResponse.json(
        { success: false, error: 'type and payload are required' },
        { status: 400 }
      );
    }

    await sentinelService.processEvent({ type, payload, metadata });

    return NextResponse.json({
      success: true,
      message: 'Event processed by Sentinel',
    });
  } catch (error) {
    console.error('[Sentinel API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
