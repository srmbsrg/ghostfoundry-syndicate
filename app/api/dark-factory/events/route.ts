/**
 * Dark Factory - Events API
 * GET /api/dark-factory/events
 * 
 * Returns factory events for monitoring/debugging
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get('taskId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (taskId) where.taskId = taskId;
    if (type) where.type = type;

    const events = await prisma.factoryEvent.findMany({
      where,
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({
      data: events.map(event => ({
        id: event.id,
        type: event.type,
        taskId: event.taskId,
        payload: event.payload,
        timestamp: event.timestamp,
      })),
      count: events.length,
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
