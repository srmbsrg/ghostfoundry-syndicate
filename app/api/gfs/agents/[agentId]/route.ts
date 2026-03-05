/**
 * Agent Instance API
 * GET/POST /api/gfs/agents/[agentId]
 * 
 * Get agent details or send commands.
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentSpawner } from '@/lib/gfs/agent-spawner';
import type { AgentCommand } from '@/lib/gfs/agent-spawner';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  
  const agent = agentSpawner.get(agentId);
  
  if (!agent) {
    return NextResponse.json(
      { error: 'Agent not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ agent });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = await request.json() as { command: AgentCommand };
    
    if (!body.command) {
      return NextResponse.json(
        { error: 'command is required' },
        { status: 400 }
      );
    }

    const result = await agentSpawner.command(agentId, body.command);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Get updated agent
    const agent = agentSpawner.get(agentId);

    return NextResponse.json({
      success: true,
      agent,
    });
  } catch (error) {
    console.error('Agent command error:', error);
    return NextResponse.json(
      { error: 'Failed to execute command' },
      { status: 500 }
    );
  }
}
