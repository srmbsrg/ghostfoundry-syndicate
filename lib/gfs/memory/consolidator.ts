// =============================================================================
// GHOST MEMORY CONSOLIDATOR
// Processes short-term memories into long-term storage
// Identifies patterns, clusters related memories, and prunes low-value data
// =============================================================================

import { prisma } from '@/lib/db';
import { memoryStore } from './store';
import {
  Memory,
  MemoryType,
  ImportanceLevel,
  ConsolidationResult,
  MemoryCluster,
  IMPORTANCE_WEIGHTS,
} from './types';

// =============================================================================
// CONSOLIDATION CONFIG
// =============================================================================

const CONSOLIDATION_CONFIG = {
  // How old a memory must be before consolidation (in hours)
  minAgeHours: 1,
  
  // Max memories to process per consolidation run
  batchSize: 100,
  
  // Similarity threshold for clustering (0-1)
  clusterThreshold: 0.7,
  
  // TTL for different memory types (in days)
  ttlByType: {
    working: 1,       // Working memory expires fast
    episodic: 90,     // Experiences last 3 months
    semantic: 365,    // Knowledge lasts a year
    procedural: 730,  // Skills last 2 years
  } as Record<MemoryType, number>,
  
  // Importance decay - low importance memories decay faster
  decayMultiplier: {
    critical: 0,      // Critical never decays
    high: 0.1,
    medium: 0.3,
    low: 0.6,
    trivial: 1.0,
  } as Record<ImportanceLevel, number>,
};

// =============================================================================
// CONSOLIDATOR CLASS
// =============================================================================

export class MemoryConsolidator {
  // ---------------------------------------------------------------------------
  // MAIN CONSOLIDATION LOOP
  // ---------------------------------------------------------------------------
  
  async consolidate(): Promise<ConsolidationResult> {
    const result: ConsolidationResult = {
      processedCount: 0,
      consolidatedCount: 0,
      deletedCount: 0,
      clustersFormed: 0,
      errors: [],
    };
    
    try {
      // Step 1: Delete expired memories
      result.deletedCount += await memoryStore.deleteExpired();
      
      // Step 2: Prune low-value old memories
      result.deletedCount += await memoryStore.deleteLowValue();
      
      // Step 3: Get unconsolidated memories
      const cutoffTime = new Date(Date.now() - CONSOLIDATION_CONFIG.minAgeHours * 60 * 60 * 1000);
      const pending = await prisma.memory.findMany({
        where: {
          consolidated: false,
          createdAt: { lt: cutoffTime },
        },
        take: CONSOLIDATION_CONFIG.batchSize,
        orderBy: { createdAt: 'asc' },
      });
      
      result.processedCount = pending.length;
      
      // Step 4: Process each memory
      for (const record of pending) {
        try {
          await this.processMemory(record as unknown as Memory);
          result.consolidatedCount++;
        } catch (error) {
          result.errors.push(`Failed to consolidate ${record.id}: ${error}`);
        }
      }
      
      // Step 5: Form clusters from related memories
      const clusters = await this.formClusters();
      result.clustersFormed = clusters.length;
      
    } catch (error) {
      result.errors.push(`Consolidation failed: ${error}`);
    }
    
    return result;
  }

  // ---------------------------------------------------------------------------
  // PROCESS INDIVIDUAL MEMORY
  // ---------------------------------------------------------------------------
  
  private async processMemory(memory: Memory): Promise<void> {
    // Calculate new expiration based on type and importance
    const baseTTL = CONSOLIDATION_CONFIG.ttlByType[memory.type] || 90;
    const decayMultiplier = CONSOLIDATION_CONFIG.decayMultiplier[memory.importance] || 0.3;
    
    // Critical memories don't expire
    let expiresAt: Date | undefined;
    if (memory.importance !== 'critical') {
      const ttlDays = baseTTL * (1 - decayMultiplier * 0.5);
      expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
    }
    
    // Find and link related memories
    const related = await this.findRelatedMemories(memory);
    const associations = [...new Set([...memory.associations, ...related.map(m => m.id)])];
    
    // Mark as consolidated
    await prisma.memory.update({
      where: { id: memory.id },
      data: {
        consolidated: true,
        associations,
        expiresAt,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // FIND RELATED MEMORIES
  // ---------------------------------------------------------------------------
  
  private async findRelatedMemories(memory: Memory): Promise<Memory[]> {
    // For now, use simple text matching
    // TODO: Use embeddings for semantic similarity
    
    const keywords = memory.content
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 4)
      .slice(0, 10);
    
    if (keywords.length === 0) return [];
    
    // Find memories with overlapping content
    const related: Memory[] = [];
    
    for (const keyword of keywords) {
      const matches = await prisma.memory.findMany({
        where: {
          id: { not: memory.id },
          content: { contains: keyword, mode: 'insensitive' },
        },
        take: 5,
      });
      
      for (const match of matches) {
        if (!related.some(r => r.id === match.id)) {
          related.push(match as unknown as Memory);
        }
      }
      
      if (related.length >= 10) break;
    }
    
    return related.slice(0, 10);
  }

  // ---------------------------------------------------------------------------
  // CLUSTER FORMATION
  // ---------------------------------------------------------------------------
  
  private async formClusters(): Promise<MemoryCluster[]> {
    // Get recent consolidated memories that might form clusters
    const recent = await prisma.memory.findMany({
      where: {
        consolidated: true,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      take: 200,
      orderBy: { accessCount: 'desc' },
    });
    
    if (recent.length < 5) return [];
    
    // Group by common associations
    const associationGroups = new Map<string, Set<string>>();
    
    for (const memory of recent) {
      const associations = (memory.associations as string[]) || [];
      for (const assocId of associations) {
        if (!associationGroups.has(assocId)) {
          associationGroups.set(assocId, new Set());
        }
        associationGroups.get(assocId)!.add(memory.id);
      }
    }
    
    // Find clusters (groups with 3+ members)
    const clusters: MemoryCluster[] = [];
    const usedMemories = new Set<string>();
    
    for (const [_, memberIds] of associationGroups) {
      if (memberIds.size >= 3) {
        const newMembers = [...memberIds].filter(id => !usedMemories.has(id));
        if (newMembers.length >= 3) {
          const cluster: MemoryCluster = {
            id: `cluster_${Date.now()}_${clusters.length}`,
            theme: 'Auto-detected pattern',  // TODO: Use LLM to generate theme
            memoryIds: newMembers.slice(0, 20),
            summary: `Cluster of ${newMembers.length} related memories`,
            importance: 'medium',
            createdAt: new Date(),
          };
          clusters.push(cluster);
          newMembers.forEach(id => usedMemories.add(id));
        }
      }
    }
    
    return clusters;
  }

  // ---------------------------------------------------------------------------
  // IMPORTANCE RE-EVALUATION
  // ---------------------------------------------------------------------------
  
  async reevaluateImportance(): Promise<number> {
    // Boost importance of frequently accessed memories
    const highAccess = await prisma.memory.findMany({
      where: {
        accessCount: { gte: 10 },
        importance: { in: ['low', 'medium'] },
      },
    });
    
    let upgraded = 0;
    for (const memory of highAccess) {
      const newImportance = memory.importance === 'low' ? 'medium' : 'high';
      await prisma.memory.update({
        where: { id: memory.id },
        data: { importance: newImportance },
      });
      upgraded++;
    }
    
    return upgraded;
  }

  // ---------------------------------------------------------------------------
  // CLEANUP ORPHANED ASSOCIATIONS
  // ---------------------------------------------------------------------------
  
  async cleanupOrphanedAssociations(): Promise<number> {
    const allMemories = await prisma.memory.findMany({
      where: {
        associations: { not: { equals: [] } },
      },
      select: { id: true, associations: true },
    });
    
    const allIds = new Set(allMemories.map(m => m.id));
    let cleaned = 0;
    
    for (const memory of allMemories) {
      const associations = (memory.associations as string[]) || [];
      const validAssociations = associations.filter(id => allIds.has(id));
      
      if (validAssociations.length !== associations.length) {
        await prisma.memory.update({
          where: { id: memory.id },
          data: { associations: validAssociations },
        });
        cleaned++;
      }
    }
    
    return cleaned;
  }
}

// Singleton instance
export const memoryConsolidator = new MemoryConsolidator();
