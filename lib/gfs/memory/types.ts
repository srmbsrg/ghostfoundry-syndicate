// =============================================================================
// GHOST MEMORY SYSTEM - TYPE DEFINITIONS
// The cognitive architecture for persistent memory across sessions
// =============================================================================

export type MemoryType = 'episodic' | 'semantic' | 'procedural' | 'working';

export type ImportanceLevel = 'critical' | 'high' | 'medium' | 'low' | 'trivial';

export type MemorySource =
  | 'user_interaction'
  | 'workflow_execution'
  | 'agent_task'
  | 'system_event'
  | 'external_integration'
  | 'self_reflection'
  | 'learning'
  | 'error_recovery'
  | 'observation'
  | 'perception';

// =============================================================================
// MEMORY STRUCTURE
// =============================================================================

export interface MemoryMetadata {
  // Context when memory was formed
  context?: {
    userId?: string;
    agentId?: string;
    workflowId?: string;
    sessionId?: string;
    environment?: string;
  };
  
  // Entities mentioned or involved
  entities?: {
    type: string;
    id: string;
    name: string;
  }[];
  
  // Emotional/sentiment markers (for behavioral analysis)
  sentiment?: {
    valence: number;  // -1 to 1 (negative to positive)
    arousal: number;  // 0 to 1 (calm to intense)
  };
  
  // Tags for categorization
  tags?: string[];
  
  // Source-specific metadata
  sourceData?: Record<string, unknown>;
  
  // Confidence in memory accuracy
  confidence?: number;
}

export interface Memory {
  id: string;
  type: MemoryType;
  source: MemorySource;
  importance: ImportanceLevel;
  content: string;
  embedding?: number[];  // Vector for semantic search
  metadata: MemoryMetadata;
  associations: string[];  // Related memory IDs
  accessCount: number;
  lastAccessed: Date;
  createdAt: Date;
  expiresAt?: Date;
  consolidated: boolean;  // Has been processed for long-term storage
}

// =============================================================================
// MEMORY OPERATIONS
// =============================================================================

export interface MemoryInput {
  type: MemoryType;
  source: MemorySource;
  content: string;
  importance?: ImportanceLevel;
  metadata?: MemoryMetadata;
  expiresAt?: Date;
}

export interface MemoryQuery {
  // Filter by type
  types?: MemoryType[];
  
  // Filter by source
  sources?: MemorySource[];
  
  // Filter by importance
  minImportance?: ImportanceLevel;
  
  // Semantic search (requires embedding)
  semanticQuery?: string;
  similarityThreshold?: number;
  
  // Text search in content
  textSearch?: string;
  
  // Time-based filters
  createdAfter?: Date;
  createdBefore?: Date;
  accessedAfter?: Date;
  
  // Entity filters
  entityId?: string;
  entityType?: string;
  
  // Context filters
  userId?: string;
  agentId?: string;
  workflowId?: string;
  sessionId?: string;
  
  // Tags
  tags?: string[];
  
  // Pagination
  limit?: number;
  offset?: number;
  
  // Sorting
  sortBy?: 'relevance' | 'recency' | 'importance' | 'access_count';
  sortDirection?: 'asc' | 'desc';
}

export interface MemorySearchResult {
  memory: Memory;
  score: number;  // Relevance score (0-1)
  matchType: 'semantic' | 'exact' | 'partial' | 'tag';
}

// =============================================================================
// MEMORY CONSOLIDATION
// =============================================================================

export interface ConsolidationResult {
  processedCount: number;
  consolidatedCount: number;
  deletedCount: number;  // Expired or low-value memories removed
  clustersFormed: number;
  errors: string[];
}

export interface MemoryCluster {
  id: string;
  theme: string;
  memoryIds: string[];
  summary: string;
  importance: ImportanceLevel;
  createdAt: Date;
}

// =============================================================================
// MEMORY STATISTICS
// =============================================================================

export interface MemoryStats {
  totalCount: number;
  byType: Record<MemoryType, number>;
  bySource: Record<MemorySource, number>;
  byImportance: Record<ImportanceLevel, number>;
  consolidatedCount: number;
  pendingConsolidation: number;
  expiringIn24Hours: number;
  oldestMemory?: Date;
  newestMemory?: Date;
  averageAccessCount: number;
}

// =============================================================================
// IMPORTANCE SCORING
// =============================================================================

export const IMPORTANCE_WEIGHTS: Record<ImportanceLevel, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  trivial: 1,
};

export function compareImportance(a: ImportanceLevel, b: ImportanceLevel): number {
  return IMPORTANCE_WEIGHTS[a] - IMPORTANCE_WEIGHTS[b];
}

export function isAtLeastImportance(
  memory: ImportanceLevel,
  minimum: ImportanceLevel
): boolean {
  return IMPORTANCE_WEIGHTS[memory] >= IMPORTANCE_WEIGHTS[minimum];
}
