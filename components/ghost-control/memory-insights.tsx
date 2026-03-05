'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Clock, Sparkles, Search, Filter, Tag,
  TrendingUp, AlertCircle, CheckCircle, Database,
  RefreshCw, ChevronRight, Eye, Star, Archive
} from 'lucide-react';

interface Memory {
  id: string;
  type: 'episodic' | 'semantic' | 'procedural';
  content: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  entities: { type: string; name: string }[];
  accessCount: number;
  createdAt: Date;
  consolidated: boolean;
}

interface MemoryStats {
  total: number;
  episodic: number;
  semantic: number;
  procedural: number;
  consolidated: number;
  recentAccesses: number;
}

export function MemoryInsights() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | Memory['type']>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Representative data - in production, fetch from /api/gfs/memory
    setStats({
      total: 2412,
      episodic: 1567,
      semantic: 623,
      procedural: 222,
      consolidated: 1847,
      recentAccesses: 456,
    });

    setMemories([
      {
        id: 'mem-001',
        type: 'episodic',
        content: 'Processed invoice #INV-2024-4521 from Acme Corp for $45,230. Applied early payment discount of 2%. Synced to ERP successfully.',
        importance: 'medium',
        source: 'agent_task',
        entities: [
          { type: 'company', name: 'Acme Corp' },
          { type: 'document', name: 'INV-2024-4521' },
        ],
        accessCount: 3,
        createdAt: new Date(Date.now() - 1800000),
        consolidated: false,
      },
      {
        id: 'mem-002',
        type: 'semantic',
        content: 'Acme Corp typically sends invoices on the 15th of each month. Payment terms are Net 30 with 2% early payment discount if paid within 10 days.',
        importance: 'high',
        source: 'inference',
        entities: [
          { type: 'company', name: 'Acme Corp' },
          { type: 'concept', name: 'Payment Terms' },
        ],
        accessCount: 45,
        createdAt: new Date(Date.now() - 86400000 * 30),
        consolidated: true,
      },
      {
        id: 'mem-003',
        type: 'procedural',
        content: 'Invoice approval workflow: 1) Extract data 2) Validate against PO 3) Check budget allocation 4) Route to approver based on amount threshold 5) Execute payment on approval',
        importance: 'critical',
        source: 'workflow_execution',
        entities: [
          { type: 'process', name: 'Invoice Approval' },
        ],
        accessCount: 892,
        createdAt: new Date(Date.now() - 86400000 * 90),
        consolidated: true,
      },
      {
        id: 'mem-004',
        type: 'episodic',
        content: 'Detected anomaly in Q3 expense reports: Marketing department exceeded budget by 23%. Flagged for review. Root cause: Unplanned campaign for product launch.',
        importance: 'high',
        source: 'observation',
        entities: [
          { type: 'department', name: 'Marketing' },
          { type: 'event', name: 'Q3 Budget Review' },
        ],
        accessCount: 12,
        createdAt: new Date(Date.now() - 86400000 * 7),
        consolidated: false,
      },
      {
        id: 'mem-005',
        type: 'semantic',
        content: 'Vendor payment scheduling: Critical vendors (Tier 1) get priority processing. Non-critical can be batched weekly. Emergency payments require dual approval.',
        importance: 'high',
        source: 'user_interaction',
        entities: [
          { type: 'concept', name: 'Vendor Tiers' },
          { type: 'process', name: 'Payment Scheduling' },
        ],
        accessCount: 234,
        createdAt: new Date(Date.now() - 86400000 * 60),
        consolidated: true,
      },
      {
        id: 'mem-006',
        type: 'episodic',
        content: 'Contract renewal negotiation with GlobalTech Inc completed. Achieved 12% cost reduction. New terms: 2-year commitment, quarterly billing, dedicated support.',
        importance: 'high',
        source: 'agent_task',
        entities: [
          { type: 'company', name: 'GlobalTech Inc' },
          { type: 'event', name: 'Contract Renewal' },
        ],
        accessCount: 8,
        createdAt: new Date(Date.now() - 86400000 * 3),
        consolidated: false,
      },
    ]);

    setLoading(false);
  }, []);

  const getTypeColor = (type: Memory['type']) => {
    switch (type) {
      case 'episodic': return 'text-blue-400 bg-blue-500/10';
      case 'semantic': return 'text-purple-400 bg-purple-500/10';
      case 'procedural': return 'text-green-400 bg-green-500/10';
    }
  };

  const getImportanceColor = (importance: Memory['importance']) => {
    switch (importance) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-gray-400';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredMemories = memories.filter(m => {
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (searchQuery && !m.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Brain className="w-4 h-4" />
            <span className="text-sm">Total</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.total.toLocaleString()}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Episodic</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.episodic.toLocaleString()}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Semantic</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.semantic.toLocaleString()}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <Database className="w-4 h-4" />
            <span className="text-sm">Procedural</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.procedural.toLocaleString()}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <Archive className="w-4 h-4" />
            <span className="text-sm">Consolidated</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.consolidated.toLocaleString()}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-pink-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Recent Access</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.recentAccesses.toLocaleString()}</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-cyan-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'episodic', 'semantic', 'procedural'] as const).map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                typeFilter === type
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Memory List */}
      <div className="space-y-4">
        {filteredMemories.map((memory, index) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5 rounded-xl hover:border-cyan-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(memory.type)}`}>
                  {memory.type}
                </span>
                <span className={`flex items-center gap-1 text-xs ${getImportanceColor(memory.importance)}`}>
                  <Star className="w-3 h-3" />
                  {memory.importance}
                </span>
                {memory.consolidated && (
                  <span className="px-2 py-1 rounded-full text-xs text-green-400 bg-green-500/10 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    consolidated
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Eye className="w-3 h-3" />
                {memory.accessCount} accesses
                <span className="text-gray-600">•</span>
                {formatTime(memory.createdAt)}
              </div>
            </div>

            <p className="text-white mb-3">{memory.content}</p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {memory.entities.map((entity, i) => (
                  <span key={i} className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-400">
                    {entity.type}: {entity.name}
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-500">
                Source: {memory.source.replace(/_/g, ' ')}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Memory Consolidation Info */}
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <RefreshCw className="w-6 h-6 text-cyan-400" />
          <div>
            <h3 className="font-semibold text-white">Memory Consolidation</h3>
            <p className="text-sm text-gray-400">Converting experiences into lasting knowledge</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{stats?.episodic}</div>
            <div className="text-xs text-gray-400">Episodes</div>
          </div>
          <div className="flex items-center justify-center">
            <ChevronRight className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats?.semantic}</div>
            <div className="text-xs text-gray-400">Patterns</div>
          </div>
        </div>
        <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
            style={{ width: `${((stats?.consolidated || 0) / (stats?.total || 1)) * 100}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-400 text-center">
          {Math.round(((stats?.consolidated || 0) / (stats?.total || 1)) * 100)}% consolidated
        </div>
      </div>
    </div>
  );
}
