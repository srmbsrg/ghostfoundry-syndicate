// GFS Event Bus API - Publish & List Events

import { NextRequest, NextResponse } from 'next/server';
import { EventBus } from '@/lib/gfs/event-bus';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/gfs/events - Publish an event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, type, payload } = body;

    if (!source || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: source, type' },
        { status: 400 }
      );
    }

    const event = await EventBus.emit(source, type, payload || {});

    return NextResponse.json({
      success: true,
      eventId: event.id,
      event: {
        id: event.id,
        source: event.source,
        type: event.type,
        timestamp: event.timestamp,
      },
    });
  } catch (error) {
    console.error('Event publish error:', error);
    return NextResponse.json(
      { error: 'Failed to publish event' },
      { status: 500 }
    );
  }
}

// GET /api/gfs/events - List recent events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const processed = searchParams.get('processed');
    const type = searchParams.get('type');
    const source = searchParams.get('source');

    const events = await prisma.event.findMany({
      where: {
        ...(processed !== null && { processed: processed === 'true' }),
        ...(type && { type }),
        ...(source && { source }),
      },
      orderBy: { timestamp: 'desc' },
      take: Math.min(limit, 100),
    });

    return NextResponse.json({
      events,
      count: events.length,
    });
  } catch (error) {
    console.error('Event list error:', error);
    return NextResponse.json(
      { error: 'Failed to list events' },
      { status: 500 }
    );
  }
}
