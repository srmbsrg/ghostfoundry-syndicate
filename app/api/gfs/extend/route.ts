/**
 * GFS Self-Extension API - Request new capabilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { requestCapability, executeModifications } from '@/lib/gfs/engine/self-modifier';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// POST - Request new capability
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, priority, context, gateId, action } = body;

    // Handle gate approval and execute
    if (action === 'approve' && gateId) {
      const gate = await prisma.humanGate.findUnique({
        where: { id: gateId },
      });

      if (!gate) {
        return NextResponse.json({ error: 'Gate not found' }, { status: 404 });
      }

      const gateContext = gate.context as { request: unknown; plans: unknown[] };

      // Mark gate as approved
      await prisma.humanGate.update({
        where: { id: gateId },
        data: {
          status: 'approved',
          resolvedAt: new Date(),
          approvedBy: JSON.parse(JSON.stringify([body.approver || 'api']))  ,
        },
      });

      // Execute the modifications
      const result = await executeModifications(
        gateContext.plans as Parameters<typeof executeModifications>[0],
        gateContext.request as Parameters<typeof executeModifications>[1]
      );

      return NextResponse.json(result);
    }

    // New capability request
    if (!description) {
      return NextResponse.json(
        { error: 'description is required' },
        { status: 400 }
      );
    }

    const result = await requestCapability({
      description,
      requestedBy: body.requestedBy || 'api',
      priority: priority || 'medium',
      context,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Self-extension error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Extension failed' },
      { status: 500 }
    );
  }
}

// GET - List pending modification requests
export async function GET() {
  try {
    const pendingGates = await prisma.humanGate.findMany({
      where: {
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
    });

    const recentEvents = await prisma.factoryEvent.findMany({
      where: {
        type: { in: ['capability_request', 'modification_executed'] },
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      pendingRequests: pendingGates,
      recentActivity: recentEvents,
    });
  } catch (error) {
    console.error('Error fetching extension data:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
