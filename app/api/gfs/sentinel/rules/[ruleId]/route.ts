// GFS Sentinel Rule Detail API
import { NextRequest, NextResponse } from 'next/server';
import { ruleEngine } from '@/lib/gfs/sentinel';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ ruleId: string }>;
}

/**
 * GET /api/gfs/sentinel/rules/[ruleId] - Get rule details
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { ruleId } = await context.params;

    const rule = await prisma.sentinelRule.findUnique({
      where: { id: ruleId },
    });

    if (!rule) {
      return NextResponse.json(
        { success: false, error: 'Rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      rule,
    });
  } catch (error) {
    console.error('[Sentinel Rule API] Error:', error);
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
 * PATCH /api/gfs/sentinel/rules/[ruleId] - Toggle rule enabled status
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { ruleId } = await context.params;
    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'enabled (boolean) is required' },
        { status: 400 }
      );
    }

    await ruleEngine.toggleRule(ruleId, enabled);

    return NextResponse.json({
      success: true,
      message: `Rule ${enabled ? 'enabled' : 'disabled'}`,
    });
  } catch (error) {
    console.error('[Sentinel Rule API] Error:', error);
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
 * DELETE /api/gfs/sentinel/rules/[ruleId] - Delete a rule
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { ruleId } = await context.params;

    await prisma.sentinelRule.delete({
      where: { id: ruleId },
    });

    return NextResponse.json({
      success: true,
      message: 'Rule deleted',
    });
  } catch (error) {
    console.error('[Sentinel Rule API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
