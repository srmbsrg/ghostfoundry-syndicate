/**
 * GFS Brief Generation API
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateBrief, gatherBriefData } from '@/lib/gfs/engine/brief-generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// POST - Generate a new brief
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const period = body.period || 'weekly';

    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Use: daily, weekly, monthly' },
        { status: 400 }
      );
    }

    const result = await generateBrief(period);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Brief generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate brief' },
      { status: 500 }
    );
  }
}

// GET - Get brief data without generating
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') || 'weekly') as 'daily' | 'weekly' | 'monthly';

    const data = await gatherBriefData(period);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error gathering brief data:', error);
    return NextResponse.json({ error: 'Failed to gather data' }, { status: 500 });
  }
}
