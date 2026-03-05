// GFS Sentinel Rules API
import { NextRequest, NextResponse } from 'next/server';
import { ruleEngine } from '@/lib/gfs/sentinel';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gfs/sentinel/rules - Get all rules
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const enabledParam = searchParams.get('enabled');
    const enabled = enabledParam === 'true' ? true : enabledParam === 'false' ? false : undefined;

    const rules = await ruleEngine.getRules(enabled);

    return NextResponse.json({
      success: true,
      rules,
      count: rules.length,
    });
  } catch (error) {
    console.error('[Sentinel Rules API] Error:', error);
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
 * POST /api/gfs/sentinel/rules - Create a new rule
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      type,
      category,
      condition,
      threshold,
      pattern,
      triggerOn,
      eventTypes,
      severity,
      autoRespond,
      responseActions,
    } = body;

    if (!name || !type || !category || !condition || !triggerOn || !severity) {
      return NextResponse.json(
        {
          success: false,
          error: 'name, type, category, condition, triggerOn, and severity are required',
        },
        { status: 400 }
      );
    }

    const ruleId = await ruleEngine.createRule({
      name,
      description,
      type,
      category,
      condition,
      threshold,
      pattern,
      triggerOn,
      eventTypes,
      severity,
      autoRespond,
      responseActions,
    });

    return NextResponse.json({
      success: true,
      ruleId,
      message: 'Rule created',
    });
  } catch (error) {
    console.error('[Sentinel Rules API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
