// GFS Event Bus - Subscription Manager

import prisma from '@/lib/db';
import { EventSubscription, HandlerType, EventFilter } from './types';

export class SubscriptionManager {
  /**
   * Register a subscription to an event type
   */
  async subscribe(
    eventType: string,
    handlerType: HandlerType,
    handlerId: string,
    config?: Record<string, unknown>,
    filter?: EventFilter
  ): Promise<EventSubscription> {
    const subscription = await prisma.subscription.create({
      data: {
        eventType,
        handlerType,
        handlerId,
        isActive: true,
        config: config ? JSON.parse(JSON.stringify(config)) : undefined,
      },
    });

    console.log(`[SubscriptionManager] Created subscription: ${eventType} -> ${handlerType}:${handlerId}`);

    return {
      id: subscription.id,
      eventType: subscription.eventType,
      handlerType: subscription.handlerType as HandlerType,
      handlerId: subscription.handlerId,
      isActive: subscription.isActive,
      config: subscription.config as Record<string, unknown> | undefined,
      filter,
    };
  }

  /**
   * Get all active subscriptions for an event type
   */
  async getSubscriptions(eventType: string): Promise<EventSubscription[]> {
    // Also match wildcard subscriptions (e.g., 'agent.*' matches 'agent.created')
    const parts = eventType.split('.');
    const wildcardPatterns = parts.map((_, i) => 
      parts.slice(0, i + 1).join('.') + (i < parts.length - 1 ? '.*' : '')
    ).filter(p => p.endsWith('.*'));

    const subscriptions = await prisma.subscription.findMany({
      where: {
        isActive: true,
        OR: [
          { eventType },
          { eventType: { in: wildcardPatterns } },
          { eventType: '*' }, // Global wildcard
        ],
      },
    });

    return subscriptions.map((s: typeof subscriptions[0]) => ({
      id: s.id,
      eventType: s.eventType,
      handlerType: s.handlerType as HandlerType,
      handlerId: s.handlerId,
      isActive: s.isActive,
      config: s.config as Record<string, unknown> | undefined,
    }));
  }

  /**
   * Unsubscribe from an event type
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { isActive: false },
    });

    console.log(`[SubscriptionManager] Deactivated subscription: ${subscriptionId}`);
  }

  /**
   * Pause a subscription temporarily
   */
  async pause(subscriptionId: string): Promise<void> {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { isActive: false },
    });
  }

  /**
   * Resume a paused subscription
   */
  async resume(subscriptionId: string): Promise<void> {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { isActive: true },
    });
  }

  /**
   * List all subscriptions with optional filtering
   */
  async listSubscriptions(options?: {
    handlerType?: HandlerType;
    eventType?: string;
    isActive?: boolean;
  }): Promise<EventSubscription[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        ...(options?.handlerType && { handlerType: options.handlerType }),
        ...(options?.eventType && { eventType: options.eventType }),
        ...(options?.isActive !== undefined && { isActive: options.isActive }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return subscriptions.map((s: typeof subscriptions[0]) => ({
      id: s.id,
      eventType: s.eventType,
      handlerType: s.handlerType as HandlerType,
      handlerId: s.handlerId,
      isActive: s.isActive,
      config: s.config as Record<string, unknown> | undefined,
    }));
  }
}

// Singleton instance
export const subscriptionManager = new SubscriptionManager();
