// GFS Heartbeat API
import { NextRequest, NextResponse } from 'next/server';
import { heartbeatService } from '@/lib/gfs/heartbeat';
import { ComponentType } from '@/lib/gfs/heartbeat/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gfs/heartbeat - Get system health
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const history = searchParams.get('history');

    if (history) {
      const hours = parseInt(history) || 24;
      const healthHistory = await heartbeatService.getHistory(hours);
      return NextResponse.json({
        success: true,
        history: healthHistory,
      });
    }

    const health = await heartbeatService.getHealth();

    return NextResponse.json({
      success: true,
      health,
    });
  } catch (error) {
    console.error('[Heartbeat API] Error:', error);
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
 * POST /api/gfs/heartbeat - Record a heartbeat
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      component,
      componentId,
      componentName,
      latency,
      errorRate,
      memoryUsage,
      cpuUsage,
      customMetrics,
    } = body;

    if (!component) {
      return NextResponse.json(
        { success: false, error: 'Component is required' },
        { status: 400 }
      );
    }

    const validComponents: ComponentType[] = [
      'system',
      'agent',
      'database',
      'api',
      'integration',
      'workflow',
      'factory',
    ];

    if (!validComponents.includes(component)) {
      return NextResponse.json(
        { success: false, error: `Invalid component. Must be one of: ${validComponents.join(', ')}` },
        { status: 400 }
      );
    }

    await heartbeatService.pulse(component, componentId, {
      componentName,
      latency,
      errorRate,
      memoryUsage,
      cpuUsage,
      customMetrics,
    });

    return NextResponse.json({
      success: true,
      message: 'Heartbeat recorded',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Heartbeat API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
