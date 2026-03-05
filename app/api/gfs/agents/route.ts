/**
 * Agents List API
 * GET /api/gfs/agents
 * 
 * List all agents with optional filtering.
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentSpawner } from '@/lib/gfs/agent-spawner';
import type { AgentStatus, CapabilityType } from '@/lib/gfs/agent-spawner';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as AgentStatus | null;
  const capability = searchParams.get('capability') as CapabilityType | null;
  
  let agents;
  
  if (status) {
    agents = agentSpawner.getByStatus(status);
  } else if (capability) {
    agents = agentSpawner.getByCapability(capability);
  } else {
    agents = agentSpawner.getAll();
  }

  return NextResponse.json({
    count: agents.length,
    agents,
  });
}
