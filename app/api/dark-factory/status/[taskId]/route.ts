/**
 * Dark Factory - Task Status API
 * GET /api/dark-factory/status/[taskId]
 * 
 * Returns the current status of a generation task
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTaskStatus } from '@/lib/dark-factory';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ taskId: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { taskId } = await context.params;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const task = await getTaskStatus(taskId);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: task.id,
      status: task.status,
      stages: task.stages,
      artifactCount: task.artifacts?.length || 0,
      artifacts: task.artifacts?.map(a => ({
        id: a.id,
        type: a.type,
        path: a.path,
      })),
      startedAt: task.startedAt,
      completedAt: task.completedAt,
      error: task.error,
    });

  } catch (error) {
    console.error('Error fetching task status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task status' },
      { status: 500 }
    );
  }
}
