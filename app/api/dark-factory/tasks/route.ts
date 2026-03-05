/**
 * Dark Factory - Tasks List API
 * GET /api/dark-factory/tasks
 * 
 * Returns a list of all generation tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [tasks, total] = await Promise.all([
      prisma.generationTask.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          request: {
            select: {
              prompt: true,
              priority: true,
              requestedBy: true,
            },
          },
          _count: {
            select: {
              artifacts: true,
            },
          },
        },
      }),
      prisma.generationTask.count({ where }),
    ]);

    return NextResponse.json({
      data: tasks.map(task => ({
        id: task.id,
        status: task.status,
        prompt: task.request.prompt.slice(0, 100) + (task.request.prompt.length > 100 ? '...' : ''),
        priority: task.request.priority,
        requestedBy: task.request.requestedBy,
        artifactCount: task._count.artifacts,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
        error: task.error,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
