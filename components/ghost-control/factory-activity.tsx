'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cog, Code, Database, Bot, FileText, CheckCircle,
  XCircle, Clock, Play, Rocket, Eye, Copy, Download,
  ChevronRight, Zap, Layers, GitBranch
} from 'lucide-react';

type GenerationType = 'api_route' | 'agent' | 'schema' | 'workflow' | 'ui_component';
type GenerationStatus = 'queued' | 'generating' | 'validating' | 'completed' | 'failed' | 'deployed';

interface Generation {
  id: string;
  type: GenerationType;
  title: string;
  description: string;
  status: GenerationStatus;
  source: string;
  startedAt: Date;
  completedAt?: Date;
  artifacts: string[];
  stats?: {
    linesGenerated: number;
    filesCreated: number;
    testsPass: number;
    testsFail: number;
  };
}

interface FactoryStats {
  totalGenerations: number;
  successRate: number;
  deploymentsToday: number;
  linesGeneratedToday: number;
  averageGenerationTime: string;
}

export function FactoryActivity() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [stats, setStats] = useState<FactoryStats | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | GenerationStatus>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStats({
      totalGenerations: 247,
      successRate: 94.3,
      deploymentsToday: 12,
      linesGeneratedToday: 3456,
      averageGenerationTime: '2.4s',
    });

    setGenerations([
      {
        id: 'gen-001',
        type: 'api_route',
        title: 'Bulk Invoice Upload Endpoint',
        description: 'POST /api/invoices/bulk-upload - Handles CSV/Excel file uploads for batch invoice processing',
        status: 'generating',
        source: 'Self-Modification Engine',
        startedAt: new Date(Date.now() - 45000),
        artifacts: ['app/api/invoices/bulk-upload/route.ts'],
        stats: {
          linesGenerated: 127,
          filesCreated: 1,
          testsPass: 0,
          testsFail: 0,
        },
      },
      {
        id: 'gen-002',
        type: 'agent',
        title: 'Vendor Onboarding Agent',
        description: 'Specialized agent for automated vendor onboarding workflows',
        status: 'validating',
        source: 'Self-Modification Engine',
        startedAt: new Date(Date.now() - 120000),
        artifacts: [
          'lib/gfs/agents/vendor-onboarding/index.ts',
          'lib/gfs/agents/vendor-onboarding/capabilities.ts',
          'lib/gfs/agents/vendor-onboarding/workflows.ts',
        ],
        stats: {
          linesGenerated: 456,
          filesCreated: 3,
          testsPass: 8,
          testsFail: 1,
        },
      },
      {
        id: 'gen-003',
        type: 'schema',
        title: 'Vendor Compliance Fields',
        description: 'Extended vendor schema with compliance tracking capabilities',
        status: 'deployed',
        source: 'Self-Modification Engine',
        startedAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 3500000),
        artifacts: [
          'prisma/schema.prisma',
          'prisma/migrations/20260305_add_compliance_fields/',
        ],
        stats: {
          linesGenerated: 45,
          filesCreated: 2,
          testsPass: 5,
          testsFail: 0,
        },
      },
      {
        id: 'gen-004',
        type: 'workflow',
        title: 'Payment Terms Validation Workflow',
        description: 'Workflow step for validating payment terms and flagging early payment discount opportunities',
        status: 'completed',
        source: 'Manual Request',
        startedAt: new Date(Date.now() - 7200000),
        completedAt: new Date(Date.now() - 7100000),
        artifacts: [
          'lib/gfs/workflows/payment-terms-validation.ts',
        ],
        stats: {
          linesGenerated: 89,
          filesCreated: 1,
          testsPass: 4,
          testsFail: 0,
        },
      },
      {
        id: 'gen-005',
        type: 'ui_component',
        title: 'Invoice Dashboard Widget',
        description: 'React component for displaying invoice processing status and metrics',
        status: 'deployed',
        source: 'Manual Request',
        startedAt: new Date(Date.now() - 86400000),
        completedAt: new Date(Date.now() - 86300000),
        artifacts: [
          'components/invoices/dashboard-widget.tsx',
          'components/invoices/invoice-list.tsx',
        ],
        stats: {
          linesGenerated: 234,
          filesCreated: 2,
          testsPass: 6,
          testsFail: 0,
        },
      },
      {
        id: 'gen-006',
        type: 'api_route',
        title: 'Vendor Search Endpoint',
        description: 'GET /api/vendors/search - Full-text search across vendor database',
        status: 'failed',
        source: 'Self-Modification Engine',
        startedAt: new Date(Date.now() - 14400000),
        completedAt: new Date(Date.now() - 14300000),
        artifacts: [],
        stats: {
          linesGenerated: 67,
          filesCreated: 1,
          testsPass: 2,
          testsFail: 3,
        },
      },
    ]);

    setLoading(false);
  }, []);

  const getTypeIcon = (type: GenerationType) => {
    switch (type) {
      case 'api_route': return <Code className="w-5 h-5" />;
      case 'agent': return <Bot className="w-5 h-5" />;
      case 'schema': return <Database className="w-5 h-5" />;
      case 'workflow': return <GitBranch className="w-5 h-5" />;
      case 'ui_component': return <Layers className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: GenerationType) => {
    switch (type) {
      case 'api_route': return 'text-cyan-400 bg-cyan-500/10';
      case 'agent': return 'text-purple-400 bg-purple-500/10';
      case 'schema': return 'text-green-400 bg-green-500/10';
      case 'workflow': return 'text-orange-400 bg-orange-500/10';
      case 'ui_component': return 'text-pink-400 bg-pink-500/10';
    }
  };

  const getStatusColor = (status: GenerationStatus) => {
    switch (status) {
      case 'queued': return 'text-gray-400 bg-gray-500/10';
      case 'generating': return 'text-cyan-400 bg-cyan-500/10';
      case 'validating': return 'text-yellow-400 bg-yellow-500/10';
      case 'completed': return 'text-green-400 bg-green-500/10';
      case 'failed': return 'text-red-400 bg-red-500/10';
      case 'deployed': return 'text-purple-400 bg-purple-500/10';
    }
  };

  const getStatusIcon = (status: GenerationStatus) => {
    switch (status) {
      case 'queued': return <Clock className="w-4 h-4" />;
      case 'generating': return <Cog className="w-4 h-4 animate-spin" />;
      case 'validating': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'deployed': return <Rocket className="w-4 h-4" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredGenerations = generations.filter(g =>
    statusFilter === 'all' || g.status === statusFilter
  );

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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Cog className="w-4 h-4" />
            <span className="text-sm">Total</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.totalGenerations}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.successRate}%</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Rocket className="w-4 h-4" />
            <span className="text-sm">Deployed Today</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.deploymentsToday}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <Code className="w-4 h-4" />
            <span className="text-sm">Lines Today</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.linesGeneratedToday.toLocaleString()}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-pink-400 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm">Avg Time</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.averageGenerationTime}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'generating', 'validating', 'completed', 'deployed', 'failed'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              statusFilter === status
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Generation List */}
      <div className="space-y-4">
        {filteredGenerations.map((gen, index) => (
          <motion.div
            key={gen.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5 rounded-xl hover:border-cyan-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getTypeColor(gen.type)}`}>
                  {getTypeIcon(gen.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{gen.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${getStatusColor(gen.status)}`}>
                      {getStatusIcon(gen.status)}
                      {gen.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{gen.description}</p>
                </div>
              </div>
              <div className="text-right text-xs text-gray-500">
                <div>Started: {formatTime(gen.startedAt)}</div>
                {gen.completedAt && (
                  <div className="text-green-400">Completed: {formatTime(gen.completedAt)}</div>
                )}
              </div>
            </div>

            {/* Stats */}
            {gen.stats && (
              <div className="grid grid-cols-4 gap-4 mb-3 p-3 bg-black/30 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{gen.stats.linesGenerated}</div>
                  <div className="text-xs text-gray-400">Lines</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{gen.stats.filesCreated}</div>
                  <div className="text-xs text-gray-400">Files</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{gen.stats.testsPass}</div>
                  <div className="text-xs text-gray-400">Tests Pass</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${gen.stats.testsFail > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {gen.stats.testsFail}
                  </div>
                  <div className="text-xs text-gray-400">Tests Fail</div>
                </div>
              </div>
            )}

            {/* Artifacts */}
            {gen.artifacts.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-2">Generated Artifacts:</div>
                <div className="flex flex-wrap gap-2">
                  {gen.artifacts.map((artifact, i) => (
                    <span key={i} className="px-2 py-1 rounded text-xs bg-black/30 text-cyan-400 font-mono">
                      {artifact}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
              <span className="text-xs text-gray-500">Source: {gen.source}</span>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  View Code
                </button>
                {gen.status === 'completed' && (
                  <button className="px-3 py-1.5 rounded-lg text-xs bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all flex items-center gap-1">
                    <Rocket className="w-3 h-3" />
                    Deploy
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
