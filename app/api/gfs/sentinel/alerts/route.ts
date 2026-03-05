// GFS Sentinel Alerts API
import { NextRequest, NextResponse } from 'next/server';
import { sentinelService } from '@/lib/gfs/sentinel';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gfs/sentinel/alerts - Get alerts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const type = searchParams.get('type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');

    const alerts = await sentinelService.getAlerts({
      status,
      severity,
      type,
      limit,
    });

    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error('[Sentinel Alerts API] Error:', error);
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
 * POST /api/gfs/sentinel/alerts - Create a manual alert
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      severity,
      category,
      title,
      description,
      targetType,
      targetId,
      targetName,
      evidence,
    } = body;

    if (!type || !severity || !category || !title || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'type, severity, category, title, and description are required',
        },
        { status: 400 }
      );
    }

    const alertId = await sentinelService.createAlert({
      type,
      severity,
      category,
      source: 'manual',
      title,
      description,
      targetType,
      targetId,
      targetName,
      evidence,
    });

    return NextResponse.json({
      success: true,
      alertId,
      message: 'Alert created',
    });
  } catch (error) {
    console.error('[Sentinel Alerts API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
