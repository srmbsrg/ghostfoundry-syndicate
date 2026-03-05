/**
 * GFS Intelligence Brief Generator
 */

import { prisma } from '@/lib/db';
import { callLLM, LLMMessage } from './llm-client';

export interface BriefData {
  period: 'daily' | 'weekly' | 'monthly';
  taskMetrics: {
    total: number;
    completed: number;
    failed: number;
    avgDuration: number;
  };
  agentMetrics: {
    active: number;
    totalTasks: number;
    topPerformers: { name: string; completed: number }[];
  };
  workflowMetrics: {
    executed: number;
    completed: number;
    humanGatesPending: number;
  };
}

export async function gatherBriefData(period: 'daily' | 'weekly' | 'monthly'): Promise<BriefData> {
  const now = new Date();
  const periodStart = new Date();

  switch (period) {
    case 'daily':
      periodStart.setDate(now.getDate() - 1);
      break;
    case 'weekly':
      periodStart.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      periodStart.setMonth(now.getMonth() - 1);
      break;
  }

  // Task metrics
  const tasks = await prisma.task.findMany({
    where: { createdAt: { gte: periodStart } },
  });

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const failedTasks = tasks.filter((t) => t.status === 'failed');

  const durations = completedTasks
    .filter((t) => t.startedAt && t.completedAt)
    .map((t) => t.completedAt!.getTime() - t.startedAt!.getTime());

  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  // Agent metrics
  const agents = await prisma.agent.findMany({
    where: { status: { not: 'terminated' } },
    include: { tasks: { where: { createdAt: { gte: periodStart } } } },
  });

  const activeAgents = agents.filter((a) => a.status === 'active' || a.status === 'busy');
  const topPerformers = agents
    .map((a) => ({
      name: a.name,
      completed: a.tasks.filter((t) => t.status === 'completed').length,
    }))
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 3);

  // Workflow metrics
  const executions = await prisma.workflowExecution.findMany({
    where: { startedAt: { gte: periodStart } },
  });

  const humanGates = await prisma.humanGate.findMany({
    where: { status: 'pending' },
  });

  return {
    period,
    taskMetrics: {
      total: tasks.length,
      completed: completedTasks.length,
      failed: failedTasks.length,
      avgDuration: Math.round(avgDuration / 1000), // seconds
    },
    agentMetrics: {
      active: activeAgents.length,
      totalTasks: tasks.length,
      topPerformers,
    },
    workflowMetrics: {
      executed: executions.length,
      completed: executions.filter((e) => e.status === 'completed').length,
      humanGatesPending: humanGates.length,
    },
  };
}

export async function generateBrief(period: 'daily' | 'weekly' | 'monthly') {
  const data = await gatherBriefData(period);

  const messages: LLMMessage[] = [
    {
      role: 'system',
      content: `You are the GhostFoundry-Syndicate Intelligence Analyst. Generate executive briefings for operations leadership. Be concise, actionable, and highlight both wins and concerns.`,
    },
    {
      role: 'user',
      content: `Generate a ${period} intelligence brief based on this data:\n\n${JSON.stringify(data, null, 2)}\n\nProvide:\n1. Executive Summary (2-3 sentences)\n2. Top 3 Wins\n3. Top 3 Concerns\n4. Recommended Actions (with priority: high/medium/low)\n\nFormat as JSON with keys: executiveSummary, wins, concerns, recommendations`,
    },
  ];

  const response = await callLLM(messages, { temperature: 0.3 });

  let parsed;
  try {
    // Try to extract JSON from response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { executiveSummary: response.content };
  } catch {
    parsed = { executiveSummary: response.content, wins: [], concerns: [], recommendations: [] };
  }

  // Create brief record
  const brief = await prisma.intelligenceBrief.create({
    data: {
      period,
      executiveSummary: parsed.executiveSummary || 'Brief generated successfully.',
      marketIntel: JSON.parse(JSON.stringify(parsed.wins || [])),
      opsHealth: JSON.parse(JSON.stringify(data.taskMetrics)),
      proactiveFixes: JSON.parse(JSON.stringify(parsed.concerns || [])),
      recommendations: JSON.parse(JSON.stringify(parsed.recommendations || [])),
    },
  });

  return { brief, data, analysis: parsed };
}
