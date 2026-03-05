// =============================================================================
// GHOST MEMORY API
// Endpoints for memory operations
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { ghostMemory, MemoryInput, MemoryQuery } from '@/lib/gfs/memory';

export const dynamic = 'force-dynamic';

// =============================================================================
// POST - Create a new memory
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'remember': {
        const input: MemoryInput = {
          type: data.type,
          source: data.source,
          content: data.content,
          importance: data.importance,
          metadata: data.metadata,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        };
        const memory = await ghostMemory.remember(input);
        return NextResponse.json({ success: true, memory });
      }

      case 'rememberInteraction': {
        const memory = await ghostMemory.rememberInteraction(
          data.content,
          data.context || {},
          data.importance
        );
        return NextResponse.json({ success: true, memory });
      }

      case 'rememberFact': {
        const memory = await ghostMemory.rememberFact(
          data.content,
          data.tags,
          data.importance
        );
        return NextResponse.json({ success: true, memory });
      }

      case 'rememberProcedure': {
        const memory = await ghostMemory.rememberProcedure(
          data.content,
          data.metadata
        );
        return NextResponse.json({ success: true, memory });
      }

      case 'recall': {
        const results = await ghostMemory.recall(data.prompt, {
          limit: data.limit,
          types: data.types,
          minImportance: data.minImportance,
          context: data.context,
        });
        return NextResponse.json({ success: true, results });
      }

      case 'query': {
        const query: MemoryQuery = data;
        const results = await ghostMemory.query(query);
        return NextResponse.json({ success: true, results });
      }

      case 'associate': {
        const success = await ghostMemory.associate(data.memoryId, data.relatedId);
        return NextResponse.json({ success });
      }

      case 'consolidate': {
        const result = await ghostMemory.consolidate();
        return NextResponse.json({ success: true, result });
      }

      case 'buildContext': {
        const context = await ghostMemory.buildContext(
          data.prompt,
          {
            maxMemories: data.maxMemories,
            types: data.types,
            context: data.context,
          }
        );
        return NextResponse.json({ success: true, context });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Memory API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Memory operation failed' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET - Retrieve memories and stats
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stats';

    switch (action) {
      case 'stats': {
        const stats = await ghostMemory.getStats();
        return NextResponse.json({ success: true, stats });
      }

      case 'get': {
        const id = searchParams.get('id');
        if (!id) {
          return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        const memory = await ghostMemory.get(id);
        if (!memory) {
          return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, memory });
      }

      case 'recent': {
        const limit = parseInt(searchParams.get('limit') || '10');
        const types = searchParams.get('types')?.split(',') as any;
        const results = await ghostMemory.getRecent(limit, types);
        return NextResponse.json({ success: true, results });
      }

      case 'mostAccessed': {
        const limit = parseInt(searchParams.get('limit') || '10');
        const results = await ghostMemory.getMostAccessed(limit);
        return NextResponse.json({ success: true, results });
      }

      case 'critical': {
        const results = await ghostMemory.getCritical();
        return NextResponse.json({ success: true, results });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Memory API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Memory retrieval failed' },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE - Forget memories
// =============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'single';

    switch (action) {
      case 'single': {
        const id = searchParams.get('id');
        if (!id) {
          return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        const success = await ghostMemory.forget(id);
        return NextResponse.json({ success });
      }

      case 'expired': {
        const count = await ghostMemory.forgetExpired();
        return NextResponse.json({ success: true, deleted: count });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Memory API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Memory deletion failed' },
      { status: 500 }
    );
  }
}
