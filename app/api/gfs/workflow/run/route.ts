/**
 * GFS Workflow Runtime API
 */

import { NextRequest, NextResponse } from 'next/server';
import { startWorkflow, approveHumanGate } from '@/lib/gfs/engine/workflow-runtime';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// POST - Start workflow or approve gate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, workflowId, gateId, context, approver } = body;

    if (action === 'start' && workflowId) {
      const execution = await startWorkflow(workflowId, context || {});
      return NextResponse.json({ execution }, { status: 201 });
    }

    if (action === 'approve' && gateId) {
      const result = await approveHumanGate(gateId, approver || 'anonymous');
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: start (with workflowId) or approve (with gateId)' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Workflow runtime error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Workflow execution failed' },
      { status: 500 }
    );
  }
}

// GET - Get workflow execution status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const executionId = searchParams.get('executionId');
  const workflowId = searchParams.get('workflowId');

  try {
    if (executionId) {
      const execution = await prisma.workflowExecution.findUnique({
        where: { id: executionId },
        include: {
          workflow: true,
          tasks: { orderBy: { createdAt: 'asc' } },
          humanGates: { orderBy: { createdAt: 'asc' } },
        },
      });
      return NextResponse.json({ execution });
    }

    if (workflowId) {
      const executions = await prisma.workflowExecution.findMany({
        where: { workflowId },
        orderBy: { startedAt: 'desc' },
        take: 10,
      });
      return NextResponse.json({ executions });
    }

    // Return recent executions
    const executions = await prisma.workflowExecution.findMany({
      orderBy: { startedAt: 'desc' },
      take: 20,
      include: { workflow: { select: { id: true, name: true } } },
    });

    const pendingGates = await prisma.humanGate.findMany({
      where: { status: 'pending' },
      include: { execution: { select: { id: true, workflow: { select: { name: true } } } } },
    });

    return NextResponse.json({ executions, pendingGates });
  } catch (error) {
    console.error('Error fetching workflow data:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
