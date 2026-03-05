// GFS Heartbeat Check API
import { NextResponse } from 'next/server';
import { heartbeatService } from '@/lib/gfs/heartbeat';

export const dynamic = 'force-dynamic';

/**
 * POST /api/gfs/heartbeat/check - Trigger a pulse check
 * This should be called periodically (e.g., by a cron job)
 */
export async function POST() {
  try {
    await heartbeatService.checkPulse();
    const health = await heartbeatService.getHealth();

    return NextResponse.json({
      success: true,
      message: 'Pulse check completed',
      health: {
        status: health.overallStatus,
        score: health.healthScore,
        alerts: health.alerts,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Heartbeat Check API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
