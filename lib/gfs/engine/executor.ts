/**
 * GFS Agent Executor - Makes agents think and act
 */

import { prisma } from '@/lib/db';
import { callLLM, buildAgentSystemPrompt, LLMMessage } from './llm-client';

export interface ExecutionResult {
  success: boolean;
  output: unknown;
  error?: string;
  metrics: {
    startedAt: Date;
    completedAt: Date;
    durationMs: number;
    tokensUsed: number;
  };
}

export async function executeTask(taskId: string): Promise<ExecutionResult> {
  const startedAt = new Date();

  try {
    // Load task with agent
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { agent: true },
    });

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (!task.agent) {
      throw new Error(`Task ${taskId} has no assigned agent`);
    }

    // Update task status to running
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'running', startedAt },
    });

    // Build messages
    const systemPrompt = buildAgentSystemPrompt(task.agent);
    const taskInput = task.input as Record<string, unknown> || {};

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Execute the following task:\n\nTask Type: ${task.type}\nInput: ${JSON.stringify(taskInput, null, 2)}\n\nProvide your response in a structured format.`,
      },
    ];

    // Call LLM
    const response = await callLLM(messages, {
      temperature: 0.5,
      maxTokens: 2000,
    });

    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();

    // Parse output (try JSON first, fall back to text)
    let output: unknown;
    try {
      output = JSON.parse(response.content);
    } catch {
      output = { response: response.content };
    }

    // Update task as completed
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'completed',
        output: JSON.parse(JSON.stringify(output)),
        completedAt,
      },
    });

    // Update agent metrics
    const agentMetrics = (task.agent.metrics as Record<string, number>) || {};
    await prisma.agent.update({
      where: { id: task.agent.id },
      data: {
        status: 'idle',
        metrics: JSON.parse(JSON.stringify({
          ...agentMetrics,
          tasksCompleted: (agentMetrics.tasksCompleted || 0) + 1,
          totalTokens: (agentMetrics.totalTokens || 0) + response.usage.totalTokens,
          avgResponseTime: Math.round(
            ((agentMetrics.avgResponseTime || 0) * (agentMetrics.tasksCompleted || 0) + durationMs) /
              ((agentMetrics.tasksCompleted || 0) + 1)
          ),
        })),
      },
    });

    return {
      success: true,
      output,
      metrics: {
        startedAt,
        completedAt,
        durationMs,
        tokensUsed: response.usage.totalTokens,
      },
    };
  } catch (error) {
    const completedAt = new Date();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update task as failed
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'failed',
        output: JSON.parse(JSON.stringify({ error: errorMessage })),
        completedAt,
      },
    });

    return {
      success: false,
      output: null,
      error: errorMessage,
      metrics: {
        startedAt,
        completedAt,
        durationMs: completedAt.getTime() - startedAt.getTime(),
        tokensUsed: 0,
      },
    };
  }
}

export async function spawnAgentFromTemplate(
  templateId: string,
  overrides?: { name?: string; config?: Record<string, unknown> }
) {
  const template = await prisma.agentTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  const capabilities = template.capabilities as unknown[];
  const personalityConfig = template.personalityConfig as Record<string, unknown>;
  const defaultConfig = template.defaultConfig as Record<string, unknown> | null;

  const agent = await prisma.agent.create({
    data: {
      name: overrides?.name || `${template.name}-${Date.now()}`,
      description: template.description,
      type: template.type.toLowerCase(),
      capabilities: JSON.parse(JSON.stringify(capabilities)),
      personality: JSON.parse(JSON.stringify(personalityConfig)),
      config: overrides?.config 
        ? JSON.parse(JSON.stringify(overrides.config)) 
        : (defaultConfig ? JSON.parse(JSON.stringify(defaultConfig)) : undefined),
      status: 'idle',
      createdBy: 'factory',
    },
  });

  return agent;
}
