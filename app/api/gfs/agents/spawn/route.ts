/**
 * Agent Spawn API
 * POST /api/gfs/agents/spawn
 * 
 * Spawns a new agent from a template.
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentSpawner } from '@/lib/gfs/agent-spawner';
import type { SpawnRequest } from '@/lib/gfs/agent-spawner';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SpawnRequest;
    
    if (!body.templateId) {
      return NextResponse.json(
        { error: 'templateId is required' },
        { status: 400 }
      );
    }

    const result = await agentSpawner.spawn(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      agentId: result.agentId,
      agent: result.agent,
    });
  } catch (error) {
    console.error('Agent spawn error:', error);
    return NextResponse.json(
      { error: 'Failed to spawn agent' },
      { status: 500 }
    );
  }
}
