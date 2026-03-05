// GFS Event Bus API - Manage Subscriptions

import { NextRequest, NextResponse } from 'next/server';
import { EventBus, subscriptionManager } from '@/lib/gfs/event-bus';
import { HandlerType } from '@/lib/gfs/event-bus/types';

export const dynamic = 'force-dynamic';

// POST /api/gfs/subscriptions - Create a subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, handlerType, handlerId, config } = body;

    if (!eventType || !handlerType || !handlerId) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, handlerType, handlerId' },
        { status: 400 }
      );
    }

    const validHandlerTypes: HandlerType[] = ['workflow', 'agent', 'webhook', 'function', 'factory'];
    if (!validHandlerTypes.includes(handlerType)) {
      return NextResponse.json(
        { error: `Invalid handlerType. Must be one of: ${validHandlerTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const subscriptionId = await EventBus.on(eventType, handlerType, handlerId, config);

    return NextResponse.json({
      success: true,
      subscriptionId,
      eventType,
      handlerType,
      handlerId,
    });
  } catch (error) {
    console.error('Subscription create error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// GET /api/gfs/subscriptions - List subscriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handlerType = searchParams.get('handlerType') as HandlerType | null;
    const eventType = searchParams.get('eventType');
    const isActive = searchParams.get('isActive');

    const subscriptions = await subscriptionManager.listSubscriptions({
      ...(handlerType && { handlerType }),
      ...(eventType && { eventType }),
      ...(isActive !== null && { isActive: isActive === 'true' }),
    });

    return NextResponse.json({
      subscriptions,
      count: subscriptions.length,
    });
  } catch (error) {
    console.error('Subscription list error:', error);
    return NextResponse.json(
      { error: 'Failed to list subscriptions' },
      { status: 500 }
    );
  }
}

// DELETE /api/gfs/subscriptions - Unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscription id' },
        { status: 400 }
      );
    }

    await EventBus.off(subscriptionId);

    return NextResponse.json({
      success: true,
      message: `Subscription ${subscriptionId} deactivated`,
    });
  } catch (error) {
    console.error('Subscription delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
