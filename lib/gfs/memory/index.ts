// =============================================================================
// GHOST MEMORY SYSTEM - PUBLIC API
// High-level interface for memory operations
// =============================================================================

import { memoryStore, MemoryStore } from './store';
import { memoryConsolidator, MemoryConsolidator } from './consolidator';
import {
  Memory,
  MemoryInput,
  MemoryQuery,
  MemorySearchResult,
  MemoryStats,
  MemoryType,
  MemorySource,
  ImportanceLevel,
  MemoryMetadata,
  ConsolidationResult,
} from './types';

// Re-export types
export type {
  Memory,
  MemoryInput,
  MemoryQuery,
  MemorySearchResult,
  MemoryStats,
  MemoryType,
  MemorySource,
  ImportanceLevel,
  MemoryMetadata,
  ConsolidationResult,
};

// =============================================================================
// MEMORY SYSTEM CLASS
// =============================================================================

class GhostMemory {
  private store: MemoryStore;
  private consolidator: MemoryConsolidator;

  constructor() {
    this.store = memoryStore;
    this.consolidator = memoryConsolidator;
  }

  // ---------------------------------------------------------------------------
  // REMEMBER - Store new memories
  // ---------------------------------------------------------------------------
  
  /**
   * Remember a new piece of information
   */
  async remember(input: MemoryInput): Promise<Memory> {
    return this.store.create(input);
  }

  /**
   * Remember multiple pieces of information at once
   */
  async rememberAll(inputs: MemoryInput[]): Promise<Memory[]> {
    return this.store.createMany(inputs);
  }

  /**
   * Quick helper to remember an interaction
   */
  async rememberInteraction(
    content: string,
    context: {
      userId?: string;
      agentId?: string;
      sessionId?: string;
    },
    importance: ImportanceLevel = 'medium'
  ): Promise<Memory> {
    return this.remember({
      type: 'episodic',
      source: 'user_interaction',
      content,
      importance,
      metadata: { context },
    });
  }

  /**
   * Quick helper to remember a learned fact
   */
  async rememberFact(
    content: string,
    tags: string[] = [],
    importance: ImportanceLevel = 'medium'
  ): Promise<Memory> {
    return this.remember({
      type: 'semantic',
      source: 'learning',
      content,
      importance,
      metadata: { tags },
    });
  }

  /**
   * Quick helper to remember a procedure/skill
   */
  async rememberProcedure(
    content: string,
    metadata: MemoryMetadata = {}
  ): Promise<Memory> {
    return this.remember({
      type: 'procedural',
      source: 'learning',
      content,
      importance: 'high',  // Procedures are important
      metadata,
    });
  }

  // ---------------------------------------------------------------------------
  // RECALL - Retrieve memories
  // ---------------------------------------------------------------------------
  
  /**
   * Recall memories relevant to a prompt/query
   */
  async recall(
    prompt: string,
    options?: {
      limit?: number;
      types?: MemoryType[];
      minImportance?: ImportanceLevel;
      context?: {
        userId?: string;
        agentId?: string;
        sessionId?: string;
      };
    }
  ): Promise<MemorySearchResult[]> {
    return this.store.recall(prompt, options);
  }

  /**
   * Get a specific memory by ID
   */
  async get(id: string): Promise<Memory | null> {
    return this.store.getById(id);
  }

  /**
   * Query memories with filters
   */
  async query(query: MemoryQuery): Promise<MemorySearchResult[]> {
    return this.store.query(query);
  }

  /**
   * Get recent memories
   */
  async getRecent(limit: number = 10, types?: MemoryType[]): Promise<MemorySearchResult[]> {
    return this.query({
      types,
      limit,
      sortBy: 'recency',
      sortDirection: 'desc',
    });
  }

  /**
   * Get most accessed memories
   */
  async getMostAccessed(limit: number = 10): Promise<MemorySearchResult[]> {
    return this.query({
      limit,
      sortBy: 'access_count',
      sortDirection: 'desc',
    });
  }

  /**
   * Get critical memories
   */
  async getCritical(): Promise<MemorySearchResult[]> {
    return this.query({
      minImportance: 'critical',
      sortBy: 'recency',
    });
  }

  // ---------------------------------------------------------------------------
  // ASSOCIATE - Link memories
  // ---------------------------------------------------------------------------
  
  /**
   * Link two memories together
   */
  async associate(memoryId: string, relatedId: string): Promise<boolean> {
    const success1 = await this.store.addAssociation(memoryId, relatedId);
    const success2 = await this.store.addAssociation(relatedId, memoryId);
    return success1 && success2;
  }

  // ---------------------------------------------------------------------------
  // FORGET - Remove memories
  // ---------------------------------------------------------------------------
  
  /**
   * Forget a specific memory
   */
  async forget(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  /**
   * Forget all expired memories
   */
  async forgetExpired(): Promise<number> {
    return this.store.deleteExpired();
  }

  // ---------------------------------------------------------------------------
  // CONSOLIDATE - Process and organize memories
  // ---------------------------------------------------------------------------
  
  /**
   * Run memory consolidation (should be called periodically)
   */
  async consolidate(): Promise<ConsolidationResult> {
    return this.consolidator.consolidate();
  }

  /**
   * Re-evaluate importance of memories based on access patterns
   */
  async reevaluateImportance(): Promise<number> {
    return this.consolidator.reevaluateImportance();
  }

  // ---------------------------------------------------------------------------
  // INTROSPECTION - Memory system stats
  // ---------------------------------------------------------------------------
  
  /**
   * Get statistics about the memory system
   */
  async getStats(): Promise<MemoryStats> {
    return this.store.getStats();
  }

  /**
   * Build context from memories for an agent prompt
   */
  async buildContext(
    prompt: string,
    options?: {
      maxMemories?: number;
      types?: MemoryType[];
      context?: { userId?: string; agentId?: string };
    }
  ): Promise<string> {
    const memories = await this.recall(prompt, {
      limit: options?.maxMemories || 5,
      types: options?.types,
      context: options?.context,
    });

    if (memories.length === 0) {
      return '';
    }

    const contextParts = memories.map((result, index) => {
      const m = result.memory;
      const typeLabel = m.type.charAt(0).toUpperCase() + m.type.slice(1);
      return `[${typeLabel} Memory ${index + 1}]: ${m.content}`;
    });

    return `\n--- Relevant Memories ---\n${contextParts.join('\n')}\n--- End Memories ---\n`;
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const ghostMemory = new GhostMemory();

// Also export class for testing
export { GhostMemory };
