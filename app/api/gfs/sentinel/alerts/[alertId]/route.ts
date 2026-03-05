// GFS Sentinel Alert Detail API
import { NextRequest, NextResponse } from 'next/server';
import { sentinelService } from '@/lib/gfs/sentinel';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ alertId: string }>;
}

/**
 * GET /api/gfs/sentinel/alerts/[alertId] - Get alert details
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { alertId } = await context.params;

    const alert = await prisma.sentinelAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      alert,
    });
  } catch (error) {
    console.error('[Sentinel Alert API] Error:', error);
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
 * PATCH /api/gfs/sentinel/alerts/[alertId] - Update alert status
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { alertId } = await context.params;
    const body = await request.json();
    const { action, resolution, resolvedBy, isFalsePositive } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'action is required (acknowledge or resolve)' },
        { status: 400 }
      );
    }

    if (action === 'acknowledge') {
      await sentinelService.acknowledgeAlert(alertId, resolvedBy);
      return NextResponse.json({
        success: true,
        message: 'Alert acknowledged',
      });
    }

    if (action === 'resolve') {
      if (!resolution) {
        return NextResponse.json(
          { success: false, error: 'resolution is required for resolve action' },
          { status: 400 }
        );
      }

      await sentinelService.resolveAlert(
        alertId,
        resolution,
        resolvedBy,
        isFalsePositive || false
      );

      return NextResponse.json({
        success: true,
        message: isFalsePositive ? 'Alert marked as false positive' : 'Alert resolved',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Sentinel Alert API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
