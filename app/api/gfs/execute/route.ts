/**
 * GFS Execute API - Run tasks through agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeTask, spawnAgentFromTemplate } from '@/lib/gfs/engine/executor';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// POST - Execute a task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, templateId, taskType, input } = body;

    // If taskId provided, execute existing task
    if (taskId) {
      const result = await executeTask(taskId);
      return NextResponse.json(result);
    }

    // If templateId provided, spawn agent and create + execute task
    if (templateId && taskType) {
      // Spawn agent from template
      const agent = await spawnAgentFromTemplate(templateId);

      // Create task
      const task = await prisma.task.create({
        data: {
          agentId: agent.id,
          type: taskType,
          input: input ? JSON.parse(JSON.stringify(input)) : {},
          priority: body.priority || 50,
        },
      });

      // Execute
      const result = await executeTask(task.id);
      return NextResponse.json({
        ...result,
        agentId: agent.id,
        taskId: task.id,
      });
    }

    return NextResponse.json(
      { error: 'Provide taskId or (templateId + taskType)' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Execution failed' },
      { status: 500 }
    );
  }
}

// GET - Get execution status/history
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const agentId = searchParams.get('agentId');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const where: Record<string, unknown> = {};
    if (agentId) where.agentId = agentId;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: { agent: { select: { id: true, name: true, type: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const stats = await prisma.task.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({
      tasks,
      stats: Object.fromEntries(stats.map((s) => [s.status, s._count])),
    });
  } catch (error) {
    console.error('Error fetching executions:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
