// GFS Event Bus - Main Entry Point

export * from './types';
export { eventPublisher, EventPublisher } from './publisher';
export { subscriptionManager, SubscriptionManager } from './subscription-manager';
export { eventDispatcher, EventDispatcher } from './dispatcher';
export { eventProcessor, EventProcessor } from './processor';

import { eventPublisher } from './publisher';
import { subscriptionManager } from './subscription-manager';
import { eventDispatcher } from './dispatcher';
import { eventProcessor } from './processor';
import { GFSEvent, EventSource, EventPayload, HandlerType, GFS_EVENT_TYPES } from './types';

/**
 * GFS Event Bus - High-level API
 * 
 * The central nervous system of GhostFoundry-Syndicate.
 * Enables event-driven communication between all components:
 * agents, workflows, integrations, and the self-modification engine.
 */
export const EventBus = {
  /**
   * Publish an event to the bus
   */
  async emit(
    source: EventSource,
    type: string,
    payload: EventPayload
  ): Promise<GFSEvent> {
    return eventPublisher.publish(source, type, payload);
  },

  /**
   * Subscribe to events
   */
  async on(
    eventType: string,
    handlerType: HandlerType,
    handlerId: string,
    config?: Record<string, unknown>
  ): Promise<string> {
    const sub = await subscriptionManager.subscribe(eventType, handlerType, handlerId, config);
    return sub.id;
  },

  /**
   * Unsubscribe from events
   */
  async off(subscriptionId: string): Promise<void> {
    await subscriptionManager.unsubscribe(subscriptionId);
  },

  /**
   * Register a function handler for events
   */
  registerHandler(
    handlerId: string,
    handler: (event: GFSEvent) => Promise<{ success: boolean; output?: unknown; error?: string }>
  ): void {
    eventDispatcher.registerHandler(handlerId, handler);
  },

  /**
   * Start the event processor
   */
  startProcessor(): void {
    eventProcessor.start();
  },

  /**
   * Stop the event processor
   */
  stopProcessor(): void {
    eventProcessor.stop();
  },

  /**
   * Process a single batch of events (for API-driven processing)
   */
  async processBatch(): Promise<number> {
    return eventProcessor.processBatch();
  },

  /**
   * Standard event types
   */
  EVENTS: GFS_EVENT_TYPES,
};

// Alias for convenience
export const eventBus = {
  publish: async (event: { source: EventSource; type: string; priority?: 'critical' | 'high' | 'normal' | 'low'; payload: EventPayload }) => {
    return eventPublisher.publish(event.source, event.type, event.payload, { priority: event.priority });
  },
  subscribe: EventBus.on,
  unsubscribe: EventBus.off,
};

export default EventBus;
