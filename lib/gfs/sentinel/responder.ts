// GFS Sentinel - Auto-Responder

import prisma from '@/lib/db';
import { eventBus } from '../event-bus';
import { ResponseAction, AlertSeverity } from './types';

export class AutoResponder {
  /**
   * Execute automated response actions
   */
  async executeResponse(
    alertId: string,
    actions: ResponseAction[],
    context: {
      targetType?: string;
      targetId?: string;
      severity: AlertSeverity;
    }
  ): Promise<{ success: boolean; results: ActionResult[] }> {
    const results: ActionResult[] = [];

    for (const action of actions) {
      try {
        const result = await this.executeAction(action, context);
        results.push(result);
      } catch (error) {
        results.push({
          action: action.type,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Update alert with auto-response results
    await prisma.sentinelAlert.update({
      where: { id: alertId },
      data: {
        autoResponse: JSON.parse(JSON.stringify(results)),
        status: results.every((r) => r.success) ? 'mitigated' : 'investigating',
      },
    });

    return {
      success: results.every((r) => r.success),
      results,
    };
  }

  /**
   * Execute a single response action
   */
  private async executeAction(
    action: ResponseAction,
    context: {
      targetType?: string;
      targetId?: string;
      severity: AlertSeverity;
    }
  ): Promise<ActionResult> {
    switch (action.type) {
      case 'notify':
        return this.notifyAction(action.config, context);
      case 'lock_user':
        return this.lockUserAction(action.config, context);
      case 'suspend_agent':
        return this.suspendAgentAction(action.config, context);
      case 'restart_workflow':
        return this.restartWorkflowAction(action.config, context);
      case 'escalate':
        return this.escalateAction(action.config, context);
      default:
        return {
          action: action.type,
          success: false,
          error: `Unknown action type: ${action.type}`,
        };
    }
  }

  private async notifyAction(
    config: Record<string, unknown>,
    context: { severity: AlertSeverity }
  ): Promise<ActionResult> {
    const channels = (config.channels as string[]) || ['system'];
    const message = config.message as string || 'Security alert triggered';

    // Emit notification event
    await eventBus.publish({
      source: 'system',
      type: 'sentinel.notification',
      priority: context.severity === 'critical' ? 'critical' : 'high',
      payload: {
        channels,
        message,
        severity: context.severity,
      },
    });

    return {
      action: 'notify',
      success: true,
      details: { channels, message },
    };
  }

  private async lockUserAction(
    config: Record<string, unknown>,
    context: { targetType?: string; targetId?: string }
  ): Promise<ActionResult> {
    if (context.targetType !== 'user' || !context.targetId) {
      return {
        action: 'lock_user',
        success: false,
        error: 'No user target specified',
      };
    }

    // Lock the user account
    await prisma.gfsUser.update({
      where: { id: context.targetId },
      data: {
        status: 'suspended',
        lockedUntil: new Date(Date.now() + (config.duration as number || 3600000)), // 1 hour default
      },
    });

    // Emit event
    await eventBus.publish({
      source: 'system',
      type: 'sentinel.user_locked',
      priority: 'high',
      payload: {
        userId: context.targetId,
        reason: config.reason || 'Automated security response',
        duration: config.duration || 3600000,
      },
    });

    return {
      action: 'lock_user',
      success: true,
      details: { userId: context.targetId },
    };
  }

  private async suspendAgentAction(
    config: Record<string, unknown>,
    context: { targetType?: string; targetId?: string }
  ): Promise<ActionResult> {
    if (context.targetType !== 'agent' || !context.targetId) {
      return {
        action: 'suspend_agent',
        success: false,
        error: 'No agent target specified',
      };
    }

    // Suspend the agent
    await prisma.agent.update({
      where: { id: context.targetId },
      data: {
        status: 'suspended',
      },
    });

    // Emit event
    await eventBus.publish({
      source: 'system',
      type: 'sentinel.agent_suspended',
      priority: 'high',
      payload: {
        agentId: context.targetId,
        reason: config.reason || 'Automated security response',
      },
    });

    return {
      action: 'suspend_agent',
      success: true,
      details: { agentId: context.targetId },
    };
  }

  private async restartWorkflowAction(
    config: Record<string, unknown>,
    context: { targetType?: string; targetId?: string }
  ): Promise<ActionResult> {
    if (context.targetType !== 'workflow' || !context.targetId) {
      return {
        action: 'restart_workflow',
        success: false,
        error: 'No workflow target specified',
      };
    }

    // Get the failed execution
    const execution = await prisma.workflowExecution.findUnique({
      where: { id: context.targetId },
    });

    if (!execution) {
      return {
        action: 'restart_workflow',
        success: false,
        error: 'Workflow execution not found',
      };
    }

    // Create a new execution
    const existingContext = execution.context as Record<string, unknown> || {};
    const newExecution = await prisma.workflowExecution.create({
      data: {
        workflowId: execution.workflowId,
        status: 'running',
        context: {
          ...existingContext,
          restartedFrom: execution.id,
          restartReason: config.reason || 'Automated recovery',
        },
      },
    });

    // Emit event
    await eventBus.publish({
      source: 'system',
      type: 'sentinel.workflow_restarted',
      priority: 'normal',
      payload: {
        originalExecutionId: execution.id,
        newExecutionId: newExecution.id,
        workflowId: execution.workflowId,
      },
    });

    return {
      action: 'restart_workflow',
      success: true,
      details: {
        originalId: execution.id,
        newId: newExecution.id,
      },
    };
  }

  private async escalateAction(
    config: Record<string, unknown>,
    context: { severity: AlertSeverity }
  ): Promise<ActionResult> {
    const escalateTo = (config.escalateTo as string[]) || ['admin'];
    const message = config.message as string || 'Alert requires human attention';

    // Create a human gate for escalation
    await prisma.humanGate.create({
      data: {
        description: `[Security Escalation] ${message}`,
        status: 'pending',
        requiredApprovers: 1,
        context: {
          escalateTo,
          severity: context.severity,
          timestamp: new Date().toISOString(),
          type: 'security_escalation',
        },
      },
    });

    // Emit event
    await eventBus.publish({
      source: 'system',
      type: 'sentinel.escalated',
      priority: 'critical',
      payload: {
        escalateTo,
        message,
        severity: context.severity,
      },
    });

    return {
      action: 'escalate',
      success: true,
      details: { escalateTo, message },
    };
  }
}

interface ActionResult {
  action: string;
  success: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

export const autoResponder = new AutoResponder();
