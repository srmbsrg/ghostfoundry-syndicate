/**
 * Agent Templates API
 * GET /api/gfs/agents/templates
 * 
 * List available agent templates.
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentSpawner } from '@/lib/gfs/agent-spawner';
import type { AgentType } from '@/lib/gfs/agent-spawner/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as AgentType | null;
  
  let templates;
  
  if (type) {
    templates = agentSpawner.templates.getByType(type);
  } else {
    templates = agentSpawner.templates.getAll();
  }

  return NextResponse.json({
    count: templates.length,
    templates,
  });
}
