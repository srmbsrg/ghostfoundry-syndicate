// =============================================================================
// GHOST MEMORY STORE
// Core storage operations for the memory system
// =============================================================================

import { prisma } from '@/lib/db';
import {
  Memory,
  MemoryInput,
  MemoryQuery,
  MemorySearchResult,
  MemoryStats,
  MemoryType,
  MemorySource,
  ImportanceLevel,
  isAtLeastImportance,
  IMPORTANCE_WEIGHTS,
} from './types';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function dbToMemory(dbRecord: {
  id: string;
  type: string;
  source: string;
  importance: string;
  content: string;
  embedding: string | null;
  metadata: unknown;
  associations: unknown;
  accessCount: number;
  lastAccessed: Date;
  createdAt: Date;
  expiresAt: Date | null;
  consolidated: boolean;
}): Memory {
  let embeddingArray: number[] | undefined;
  if (dbRecord.embedding) {
    try {
      embeddingArray = JSON.parse(dbRecord.embedding);
    } catch {
      embeddingArray = undefined;
    }
  }

  return {
    id: dbRecord.id,
    type: dbRecord.type as MemoryType,
    source: dbRecord.source as MemorySource,
    importance: dbRecord.importance as ImportanceLevel,
    content: dbRecord.content,
    embedding: embeddingArray,
    metadata: (dbRecord.metadata as Record<string, unknown>) || {},
    associations: (dbRecord.associations as string[]) || [],
    accessCount: dbRecord.accessCount,
    lastAccessed: dbRecord.lastAccessed,
    createdAt: dbRecord.createdAt,
    expiresAt: dbRecord.expiresAt || undefined,
    consolidated: dbRecord.consolidated,
  };
}

// =============================================================================
// MEMORY STORE CLASS
// =============================================================================

export class MemoryStore {
  // ---------------------------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------------------------
  
  async create(input: MemoryInput): Promise<Memory> {
    const record = await prisma.memory.create({
      data: {
        type: input.type,
        source: input.source,
        importance: input.importance || 'medium',
        content: input.content,
        metadata: JSON.parse(JSON.stringify(input.metadata || {})),
        associations: [],
        expiresAt: input.expiresAt,
      },
    });
    
    return dbToMemory(record);
  }

  async createMany(inputs: MemoryInput[]): Promise<Memory[]> {
    const results: Memory[] = [];
    for (const input of inputs) {
      const memory = await this.create(input);
      results.push(memory);
    }
    return results;
  }

  // ---------------------------------------------------------------------------
  // READ
  // ---------------------------------------------------------------------------
  
  async getById(id: string): Promise<Memory | null> {
    const record = await prisma.memory.findUnique({ where: { id } });
    if (!record) return null;
    
    // Update access stats
    await prisma.memory.update({
      where: { id },
      data: {
        accessCount: { increment: 1 },
        lastAccessed: new Date(),
      },
    });
    
    return dbToMemory(record);
  }

  async query(query: MemoryQuery): Promise<MemorySearchResult[]> {
    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (query.types?.length) {
      where.type = { in: query.types };
    }
    
    if (query.sources?.length) {
      where.source = { in: query.sources };
    }
    
    if (query.minImportance) {
      const minWeight = IMPORTANCE_WEIGHTS[query.minImportance];
      const validLevels = Object.entries(IMPORTANCE_WEIGHTS)
        .filter(([_, weight]) => weight >= minWeight)
        .map(([level]) => level);
      where.importance = { in: validLevels };
    }
    
    if (query.createdAfter) {
      where.createdAt = { ...(where.createdAt as object || {}), gte: query.createdAfter };
    }
    
    if (query.createdBefore) {
      where.createdAt = { ...(where.createdAt as object || {}), lte: query.createdBefore };
    }
    
    if (query.accessedAfter) {
      where.lastAccessed = { gte: query.accessedAfter };
    }
    
    if (query.textSearch) {
      where.content = { contains: query.textSearch, mode: 'insensitive' };
    }
    
    // Context filters via metadata JSONB
    const metadataFilters: Record<string, unknown>[] = [];
    
    if (query.userId) {
      metadataFilters.push({ path: ['context', 'userId'], equals: query.userId });
    }
    if (query.agentId) {
      metadataFilters.push({ path: ['context', 'agentId'], equals: query.agentId });
    }
    if (query.workflowId) {
      metadataFilters.push({ path: ['context', 'workflowId'], equals: query.workflowId });
    }
    if (query.sessionId) {
      metadataFilters.push({ path: ['context', 'sessionId'], equals: query.sessionId });
    }
    
    if (query.tags?.length) {
      metadataFilters.push({ path: ['tags'], array_contains: query.tags });
    }
    
    if (metadataFilters.length > 0) {
      where.AND = metadataFilters.map(f => ({ metadata: f }));
    }
    
    // Sorting
    let orderBy: Record<string, string> = {};
    switch (query.sortBy) {
      case 'recency':
        orderBy = { createdAt: query.sortDirection || 'desc' };
        break;
      case 'access_count':
        orderBy = { accessCount: query.sortDirection || 'desc' };
        break;
      case 'importance':
        // We'll sort in-memory for importance levels
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }
    
    // Execute query
    const records = await prisma.memory.findMany({
      where,
      orderBy,
      take: query.limit || 50,
      skip: query.offset || 0,
    });
    
    let results = records.map((r) => ({
      memory: dbToMemory(r),
      score: 1.0, // Base score, will be adjusted
      matchType: 'exact' as const,
    }));
    
    // Sort by importance if requested
    if (query.sortBy === 'importance') {
      results.sort((a, b) => {
        const diff = IMPORTANCE_WEIGHTS[b.memory.importance] - IMPORTANCE_WEIGHTS[a.memory.importance];
        return query.sortDirection === 'asc' ? -diff : diff;
      });
    }
    
    // Adjust scores based on various factors
    results = results.map((r) => {
      let score = 1.0;
      
      // Boost by importance
      score *= (IMPORTANCE_WEIGHTS[r.memory.importance] / 5);
      
      // Boost by recency (decay over 30 days)
      const ageInDays = (Date.now() - r.memory.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      score *= Math.max(0.1, 1 - (ageInDays / 30));
      
      // Boost by access frequency
      score *= (1 + Math.log10(r.memory.accessCount + 1) * 0.1);
      
      return { ...r, score: Math.min(1, score) };
    });
    
    return results;
  }

  // ---------------------------------------------------------------------------
  // RECALL - Intelligent memory retrieval
  // ---------------------------------------------------------------------------
  
  async recall(
    prompt: string,
    options: {
      limit?: number;
      types?: MemoryType[];
      minImportance?: ImportanceLevel;
      context?: {
        userId?: string;
        agentId?: string;
        sessionId?: string;
      };
    } = {}
  ): Promise<MemorySearchResult[]> {
    // For now, use text-based search
    // TODO: Implement semantic search with embeddings
    
    const query: MemoryQuery = {
      textSearch: prompt,
      types: options.types,
      minImportance: options.minImportance,
      userId: options.context?.userId,
      agentId: options.context?.agentId,
      sessionId: options.context?.sessionId,
      limit: options.limit || 10,
      sortBy: 'relevance',
    };
    
    const results = await this.query(query);
    
    // If no direct matches, try broader search
    if (results.length === 0) {
      // Extract keywords and search for any
      const keywords = prompt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      
      const broadResults: MemorySearchResult[] = [];
      for (const keyword of keywords.slice(0, 5)) {
        const matches = await this.query({
          ...query,
          textSearch: keyword,
          limit: 5,
        });
        broadResults.push(...matches);
      }
      
      // Deduplicate
      const seen = new Set<string>();
      return broadResults.filter((r) => {
        if (seen.has(r.memory.id)) return false;
        seen.add(r.memory.id);
        return true;
      }).slice(0, options.limit || 10);
    }
    
    return results;
  }

  // ---------------------------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------------------------
  
  async update(
    id: string,
    updates: Partial<Pick<Memory, 'content' | 'importance' | 'metadata' | 'expiresAt' | 'consolidated'>>
  ): Promise<Memory | null> {
    try {
      const data: Record<string, unknown> = {};
      if (updates.content !== undefined) data.content = updates.content;
      if (updates.importance !== undefined) data.importance = updates.importance;
      if (updates.metadata !== undefined) data.metadata = JSON.parse(JSON.stringify(updates.metadata));
      if (updates.expiresAt !== undefined) data.expiresAt = updates.expiresAt;
      if (updates.consolidated !== undefined) data.consolidated = updates.consolidated;
      
      const record = await prisma.memory.update({
        where: { id },
        data,
      });
      return dbToMemory(record);
    } catch {
      return null;
    }
  }

  async addAssociation(id: string, associatedId: string): Promise<boolean> {
    const memory = await prisma.memory.findUnique({ where: { id } });
    if (!memory) return false;
    
    const associations = (memory.associations as string[]) || [];
    if (!associations.includes(associatedId)) {
      associations.push(associatedId);
      await prisma.memory.update({
        where: { id },
        data: { associations },
      });
    }
    
    return true;
  }

  // ---------------------------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------------------------
  
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.memory.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.memory.deleteMany({
      where: {
        expiresAt: { lte: new Date() },
      },
    });
    return result.count;
  }

  async deleteLowValue(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    const cutoff = new Date(Date.now() - maxAge);
    const result = await prisma.memory.deleteMany({
      where: {
        importance: { in: ['trivial', 'low'] },
        accessCount: { lt: 3 },
        createdAt: { lt: cutoff },
        consolidated: true,
      },
    });
    return result.count;
  }

  // ---------------------------------------------------------------------------
  // STATISTICS
  // ---------------------------------------------------------------------------
  
  async getStats(): Promise<MemoryStats> {
    const [total, byType, bySource, byImportance, consolidated, pending, expiring, oldest, newest, avgAccess] = 
      await Promise.all([
        prisma.memory.count(),
        prisma.memory.groupBy({ by: ['type'], _count: true }),
        prisma.memory.groupBy({ by: ['source'], _count: true }),
        prisma.memory.groupBy({ by: ['importance'], _count: true }),
        prisma.memory.count({ where: { consolidated: true } }),
        prisma.memory.count({ where: { consolidated: false } }),
        prisma.memory.count({
          where: {
            expiresAt: {
              gte: new Date(),
              lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          },
        }),
        prisma.memory.findFirst({ orderBy: { createdAt: 'asc' }, select: { createdAt: true } }),
        prisma.memory.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
        prisma.memory.aggregate({ _avg: { accessCount: true } }),
      ]);
    
    return {
      totalCount: total,
      byType: byType.reduce((acc, { type, _count }) => {
        acc[type as MemoryType] = _count;
        return acc;
      }, {} as Record<MemoryType, number>),
      bySource: bySource.reduce((acc, { source, _count }) => {
        acc[source as MemorySource] = _count;
        return acc;
      }, {} as Record<MemorySource, number>),
      byImportance: byImportance.reduce((acc, { importance, _count }) => {
        acc[importance as ImportanceLevel] = _count;
        return acc;
      }, {} as Record<ImportanceLevel, number>),
      consolidatedCount: consolidated,
      pendingConsolidation: pending,
      expiringIn24Hours: expiring,
      oldestMemory: oldest?.createdAt,
      newestMemory: newest?.createdAt,
      averageAccessCount: avgAccess._avg.accessCount || 0,
    };
  }
}

// Singleton instance
export const memoryStore = new MemoryStore();
