// GFS Event Bus - Event Processor (Background Worker)

import prisma from '@/lib/db';
import { GFSEvent, EventPriority } from './types';
import { eventDispatcher } from './dispatcher';

const BATCH_SIZE = 10;
const POLL_INTERVAL_MS = 1000;

export class EventProcessor {
  private isRunning = false;
  private pollTimeout: NodeJS.Timeout | null = null;

  /**
   * Start the event processor
   */
  start(): void {
    if (this.isRunning) {
      console.log('[EventProcessor] Already running');
      return;
    }

    this.isRunning = true;
    console.log('[EventProcessor] Started');
    this.poll();
  }

  /**
   * Stop the event processor
   */
  stop(): void {
    this.isRunning = false;
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
      this.pollTimeout = null;
    }
    console.log('[EventProcessor] Stopped');
  }

  /**
   * Process a single batch of events
   */
  async processBatch(): Promise<number> {
    // Fetch unprocessed events, prioritized
    const events = await prisma.event.findMany({
      where: { processed: false },
      orderBy: [
        { timestamp: 'asc' },
      ],
      take: BATCH_SIZE,
    });

    if (events.length === 0) {
      return 0;
    }

    // Sort by priority (critical first)
    const priorityOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      normal: 2,
      low: 3,
    };

    const sortedEvents = events.sort((a: typeof events[0], b: typeof events[0]) => {
      const payload = a.payload as Record<string, unknown>;
      const payloadB = b.payload as Record<string, unknown>;
      const priorityA = (payload?.priority as EventPriority) || 'normal';
      const priorityB = (payloadB?.priority as EventPriority) || 'normal';
      return priorityOrder[priorityA] - priorityOrder[priorityB];
    });

    console.log(`[EventProcessor] Processing ${sortedEvents.length} events`);

    for (const dbEvent of sortedEvents) {
      const event: GFSEvent = {
        id: dbEvent.id,
        source: dbEvent.source as GFSEvent['source'],
        type: dbEvent.type,
        payload: dbEvent.payload as GFSEvent['payload'],
        timestamp: dbEvent.timestamp,
      };

      try {
        await eventDispatcher.dispatch(event);
      } catch (error) {
        console.error(`[EventProcessor] Failed to dispatch event ${event.id}:`, error);
        // Mark as processed anyway to avoid infinite retry
        await prisma.event.update({
          where: { id: event.id },
          data: { processed: true },
        });
      }
    }

    return sortedEvents.length;
  }

  /**
   * Poll for new events
   */
  private async poll(): Promise<void> {
    if (!this.isRunning) return;

    try {
      const processed = await this.processBatch();
      
      // If we processed a full batch, immediately poll again
      // Otherwise, wait for the poll interval
      const delay = processed === BATCH_SIZE ? 0 : POLL_INTERVAL_MS;
      
      this.pollTimeout = setTimeout(() => this.poll(), delay);
    } catch (error) {
      console.error('[EventProcessor] Poll error:', error);
      this.pollTimeout = setTimeout(() => this.poll(), POLL_INTERVAL_MS * 5);
    }
  }

  /**
   * Process events triggered by a specific correlation ID
   */
  async processCorrelatedEvents(correlationId: string): Promise<number> {
    const events = await prisma.event.findMany({
      where: {
        processed: false,
        // We'd need to store correlationId in the payload or add to schema
      },
    });

    for (const dbEvent of events) {
      const payload = dbEvent.payload as Record<string, unknown>;
      if (payload?.correlationId === correlationId) {
        const event: GFSEvent = {
          id: dbEvent.id,
          source: dbEvent.source as GFSEvent['source'],
          type: dbEvent.type,
          payload: dbEvent.payload as GFSEvent['payload'],
          timestamp: dbEvent.timestamp,
          correlationId: payload.correlationId as string,
        };
        await eventDispatcher.dispatch(event);
      }
    }

    return events.length;
  }
}

// Singleton instance
export const eventProcessor = new EventProcessor();
