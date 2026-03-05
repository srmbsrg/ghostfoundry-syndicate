/**
 * Memory Item API
 * 
 * GET /api/gfs/memory/[id] - Get specific memory
 * GET /api/gfs/memory/[id]?action=similar - Find similar memories
 * GET /api/gfs/memory/[id]?action=associations - Get memory associations
 */

import { NextRequest, NextResponse } from 'next/server';
import { ghostMemory } from '@/lib/gfs/memory';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get specific memory
    const mem = await ghostMemory.get(id);

    if (!mem) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, memory: mem });
  } catch (error) {
    console.error('Memory fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch memory' },
      { status: 500 }
    );
  }
}
