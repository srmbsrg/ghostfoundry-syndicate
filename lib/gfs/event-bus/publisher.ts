// GFS Event Bus - Event Publisher

import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/db';
import { GFSEvent, EventSource, EventPayload, EventPriority } from './types';

export interface PublishOptions {
  priority?: EventPriority;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, unknown>;
}

export class EventPublisher {
  /**
   * Publish an event to the GFS event bus
   */
  async publish(
    source: EventSource,
    type: string,
    payload: EventPayload,
    options: PublishOptions = {}
  ): Promise<GFSEvent> {
    const event: GFSEvent = {
      id: uuidv4(),
      source,
      type,
      payload,
      timestamp: new Date(),
      priority: options.priority || 'normal',
      correlationId: options.correlationId,
      causationId: options.causationId,
      metadata: options.metadata,
    };

    // Persist event to database
    await prisma.event.create({
      data: {
        id: event.id,
        source: event.source,
        type: event.type,
        payload: JSON.parse(JSON.stringify(event.payload)),
        timestamp: event.timestamp,
        processed: false,
      },
    });

    console.log(`[EventBus] Published: ${type} from ${source}`, { eventId: event.id });

    return event;
  }

  /**
   * Publish multiple events atomically
   */
  async publishBatch(events: Array<{
    source: EventSource;
    type: string;
    payload: EventPayload;
    options?: PublishOptions;
  }>): Promise<GFSEvent[]> {
    const gfsEvents: GFSEvent[] = events.map(e => ({
      id: uuidv4(),
      source: e.source,
      type: e.type,
      payload: e.payload,
      timestamp: new Date(),
      priority: e.options?.priority || 'normal',
      correlationId: e.options?.correlationId,
      causationId: e.options?.causationId,
      metadata: e.options?.metadata,
    }));

    await prisma.event.createMany({
      data: gfsEvents.map(event => ({
        id: event.id,
        source: event.source,
        type: event.type,
        payload: JSON.parse(JSON.stringify(event.payload)),
        timestamp: event.timestamp,
        processed: false,
      })),
    });

    console.log(`[EventBus] Published batch: ${gfsEvents.length} events`);

    return gfsEvents;
  }

  /**
   * Publish a derived event (with causation chain)
   */
  async publishDerived(
    causingEvent: GFSEvent,
    source: EventSource,
    type: string,
    payload: EventPayload,
    options: Omit<PublishOptions, 'causationId' | 'correlationId'> = {}
  ): Promise<GFSEvent> {
    return this.publish(source, type, payload, {
      ...options,
      causationId: causingEvent.id,
      correlationId: causingEvent.correlationId || causingEvent.id,
    });
  }
}

// Singleton instance
export const eventPublisher = new EventPublisher();
