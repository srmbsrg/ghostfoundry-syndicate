// GFS Event Bus - Event Dispatcher

import prisma from '@/lib/db';
import { GFSEvent, EventSubscription, EventHandlerResult, HandlerType } from './types';
import { subscriptionManager } from './subscription-manager';
import { eventPublisher } from './publisher';

// Handler registry for in-memory function handlers
const functionHandlers = new Map<string, (event: GFSEvent) => Promise<EventHandlerResult>>();

export class EventDispatcher {
  /**
   * Register a function handler
   */
  registerHandler(
    handlerId: string,
    handler: (event: GFSEvent) => Promise<EventHandlerResult>
  ): void {
    functionHandlers.set(handlerId, handler);
    console.log(`[EventDispatcher] Registered handler: ${handlerId}`);
  }

  /**
   * Dispatch an event to all matching subscribers
   */
  async dispatch(event: GFSEvent): Promise<EventHandlerResult[]> {
    const subscriptions = await subscriptionManager.getSubscriptions(event.type);
    
    if (subscriptions.length === 0) {
      console.log(`[EventDispatcher] No subscribers for: ${event.type}`);
      return [];
    }

    console.log(`[EventDispatcher] Dispatching ${event.type} to ${subscriptions.length} subscribers`);

    const results: EventHandlerResult[] = [];

    for (const subscription of subscriptions) {
      const startTime = Date.now();
      let result: EventHandlerResult;

      try {
        result = await this.executeHandler(subscription, event);
        result.duration = Date.now() - startTime;
      } catch (error) {
        result = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - startTime,
        };
      }

      results.push(result);

      // If handler emitted derived events, publish them
      if (result.emittedEvents && result.emittedEvents.length > 0) {
        for (const derivedEvent of result.emittedEvents) {
          await eventPublisher.publishDerived(
            event,
            derivedEvent.source,
            derivedEvent.type,
            derivedEvent.payload
          );
        }
      }
    }

    // Mark event as processed
    await prisma.event.update({
      where: { id: event.id },
      data: { processed: true },
    });

    return results;
  }

  /**
   * Execute a specific handler based on its type
   */
  private async executeHandler(
    subscription: EventSubscription,
    event: GFSEvent
  ): Promise<EventHandlerResult> {
    switch (subscription.handlerType) {
      case 'function':
        return this.executeFunctionHandler(subscription.handlerId, event);
      
      case 'agent':
        return this.executeAgentHandler(subscription.handlerId, event);
      
      case 'workflow':
        return this.executeWorkflowHandler(subscription.handlerId, event);
      
      case 'webhook':
        return this.executeWebhookHandler(subscription.handlerId, event, subscription.config);
      
      case 'factory':
        return this.executeFactoryHandler(subscription.handlerId, event);
      
      default:
        return {
          success: false,
          error: `Unknown handler type: ${subscription.handlerType}`,
        };
    }
  }

  private async executeFunctionHandler(
    handlerId: string,
    event: GFSEvent
  ): Promise<EventHandlerResult> {
    const handler = functionHandlers.get(handlerId);
    if (!handler) {
      return {
        success: false,
        error: `Function handler not found: ${handlerId}`,
      };
    }
    return handler(event);
  }

  private async executeAgentHandler(
    agentId: string,
    event: GFSEvent
  ): Promise<EventHandlerResult> {
    // Look up agent and trigger it
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return { success: false, error: `Agent not found: ${agentId}` };
    }

    // Create a task for the agent to process this event
    const task = await prisma.task.create({
      data: {
        type: `event:${event.type}`,
        status: 'pending',
        priority: event.priority === 'critical' ? 100 : 50,
        agentId: agent.id,
        input: JSON.parse(JSON.stringify({ event })),
      },
    });

    return {
      success: true,
      output: { taskId: task.id, agentId: agent.id },
    };
  }

  private async executeWorkflowHandler(
    workflowId: string,
    event: GFSEvent
  ): Promise<EventHandlerResult> {
    // Look up workflow and start execution
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return { success: false, error: `Workflow not found: ${workflowId}` };
    }

    // Create a new workflow execution
    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        status: 'running',
        currentStep: '0',
        context: JSON.parse(JSON.stringify({ triggerEvent: event })),
      },
    });

    return {
      success: true,
      output: { executionId: execution.id, workflowId: workflow.id },
    };
  }

  private async executeWebhookHandler(
    webhookUrl: string,
    event: GFSEvent,
    config?: Record<string, unknown>
  ): Promise<EventHandlerResult> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config?.headers as Record<string, string> || {}),
        },
        body: JSON.stringify(event),
      });

      return {
        success: response.ok,
        output: { status: response.status },
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async executeFactoryHandler(
    requestType: string,
    event: GFSEvent
  ): Promise<EventHandlerResult> {
    // Route to the Dark Factory for self-modification
    await prisma.factoryEvent.create({
      data: {
        type: `event_handler:${requestType}`,
        description: `Factory handler triggered by: ${event.type}`,
        metadata: JSON.parse(JSON.stringify({ event })),
        status: 'pending',
      },
    });

    return {
      success: true,
      output: { factoryRequestType: requestType },
    };
  }
}

// Singleton instance
export const eventDispatcher = new EventDispatcher();
