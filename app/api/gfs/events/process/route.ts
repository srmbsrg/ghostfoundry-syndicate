// GFS Event Bus API - Process Events

import { NextRequest, NextResponse } from 'next/server';
import { EventBus } from '@/lib/gfs/event-bus';

export const dynamic = 'force-dynamic';

// POST /api/gfs/events/process - Trigger event processing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { continuous = false, maxBatches = 1 } = body;

    let totalProcessed = 0;
    let batchCount = 0;

    if (continuous) {
      // Start the background processor
      EventBus.startProcessor();
      return NextResponse.json({
        success: true,
        message: 'Event processor started in background mode',
      });
    }

    // Process a limited number of batches
    while (batchCount < maxBatches) {
      const processed = await EventBus.processBatch();
      totalProcessed += processed;
      batchCount++;

      // If we didn't process any events, we're done
      if (processed === 0) break;
    }

    return NextResponse.json({
      success: true,
      processed: totalProcessed,
      batches: batchCount,
    });
  } catch (error) {
    console.error('Event process error:', error);
    return NextResponse.json(
      { error: 'Failed to process events' },
      { status: 500 }
    );
  }
}
