'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bot, Play, Pause, CheckCircle, XCircle, Clock, AlertTriangle,
  MoreVertical, ChevronRight, Zap, Target, BarChart3, RefreshCw
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'paused' | 'error';
  currentTask?: string;
  completedTasks: number;
  successRate: number;
  lastActive: Date;
  capabilities: string[];
}

interface Task {
  id: string;
  agentId: string;
  agentName: string;
  description: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  startedAt: Date;
  completedAt?: Date;
  progress?: number;
}

export function AgentActivityPanel() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<'agents' | 'tasks'>('agents');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Representative data - in production, fetch from /api/gfs/agents
    setAgents([
      {
        id: 'agent-001',
        name: 'Invoice Processor',
        type: 'document_processor',
        status: 'active',
        currentTask: 'Processing batch of 23 invoices',
        completedTasks: 1247,
        successRate: 98.2,
        lastActive: new Date(),
        capabilities: ['invoice_extraction', 'data_validation', 'erp_sync'],
      },
      {
        id: 'agent-002',
        name: 'Contract Analyzer',
        type: 'document_processor',
        status: 'idle',
        completedTasks: 456,
        successRate: 95.8,
        lastActive: new Date(Date.now() - 300000),
        capabilities: ['contract_parsing', 'risk_detection', 'term_extraction'],
      },
      {
        id: 'agent-003',
        name: 'Anomaly Hunter',
        type: 'monitoring',
        status: 'active',
        currentTask: 'Monitoring Q4 financial metrics',
        completedTasks: 8934,
        successRate: 99.1,
        lastActive: new Date(),
        capabilities: ['metric_analysis', 'trend_detection', 'alert_generation'],
      },
      {
        id: 'agent-004',
        name: 'Report Generator',
        type: 'content_creator',
        status: 'active',
        currentTask: 'Generating weekly intelligence brief',
        completedTasks: 312,
        successRate: 97.4,
        lastActive: new Date(),
        capabilities: ['data_aggregation', 'narrative_generation', 'chart_creation'],
      },
      {
        id: 'agent-005',
        name: 'Email Responder',
        type: 'communication',
        status: 'paused',
        completedTasks: 2134,
        successRate: 94.2,
        lastActive: new Date(Date.now() - 600000),
        capabilities: ['email_analysis', 'response_drafting', 'sentiment_detection'],
      },
      {
        id: 'agent-006',
        name: 'Data Reconciler',
        type: 'data_ops',
        status: 'error',
        completedTasks: 567,
        successRate: 89.3,
        lastActive: new Date(Date.now() - 120000),
        capabilities: ['data_matching', 'discrepancy_detection', 'reconciliation'],
      },
    ]);

    setTasks([
      {
        id: 'task-001',
        agentId: 'agent-001',
        agentName: 'Invoice Processor',
        description: 'Process batch of 23 invoices from Acme Corp',
        status: 'running',
        startedAt: new Date(Date.now() - 45000),
        progress: 65,
      },
      {
        id: 'task-002',
        agentId: 'agent-003',
        agentName: 'Anomaly Hunter',
        description: 'Monitor Q4 financial metrics for anomalies',
        status: 'running',
        startedAt: new Date(Date.now() - 3600000),
        progress: 100, // Continuous task
      },
      {
        id: 'task-003',
        agentId: 'agent-004',
        agentName: 'Report Generator',
        description: 'Generate weekly intelligence brief',
        status: 'running',
        startedAt: new Date(Date.now() - 120000),
        progress: 42,
      },
      {
        id: 'task-004',
        agentId: 'agent-001',
        agentName: 'Invoice Processor',
        description: 'Validate extracted data against ERP',
        status: 'queued',
        startedAt: new Date(),
      },
      {
        id: 'task-005',
        agentId: 'agent-002',
        agentName: 'Contract Analyzer',
        description: 'Analyze vendor contract renewal terms',
        status: 'completed',
        startedAt: new Date(Date.now() - 900000),
        completedAt: new Date(Date.now() - 300000),
      },
      {
        id: 'task-006',
        agentId: 'agent-006',
        agentName: 'Data Reconciler',
        description: 'Reconcile bank statements with ledger',
        status: 'failed',
        startedAt: new Date(Date.now() - 600000),
        completedAt: new Date(Date.now() - 120000),
      },
    ]);

    setLoading(false);
  }, []);

  const getStatusColor = (status: Agent['status'] | Task['status']) => {
    switch (status) {
      case 'active':
      case 'running': return 'text-green-400 bg-green-500/10';
      case 'idle':
      case 'queued': return 'text-blue-400 bg-blue-500/10';
      case 'paused': return 'text-yellow-400 bg-yellow-500/10';
      case 'error':
      case 'failed': return 'text-red-400 bg-red-500/10';
      case 'completed': return 'text-cyan-400 bg-cyan-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: Agent['status'] | Task['status']) => {
    switch (status) {
      case 'active':
      case 'running': return <Play className="w-3.5 h-3.5" />;
      case 'idle':
      case 'queued': return <Clock className="w-3.5 h-3.5" />;
      case 'paused': return <Pause className="w-3.5 h-3.5" />;
      case 'error':
      case 'failed': return <XCircle className="w-3.5 h-3.5" />;
      case 'completed': return <CheckCircle className="w-3.5 h-3.5" />;
      default: return null;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <Play className="w-4 h-4" />
            <span className="text-sm">Active</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {agents.filter(a => a.status === 'active').length}
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Idle</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {agents.filter(a => a.status === 'idle').length}
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Target className="w-4 h-4" />
            <span className="text-sm">Tasks Running</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {tasks.filter(t => t.status === 'running').length}
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm">Avg Success</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {(agents.reduce((acc, a) => acc + a.successRate, 0) / agents.length).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('agents')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'agents'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-gray-400 hover:bg-white/5'
          }`}
        >
          <Bot className="w-4 h-4 inline mr-2" />
          Agents ({agents.length})
        </button>
        <button
          onClick={() => setView('tasks')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'tasks'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-gray-400 hover:bg-white/5'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Tasks ({tasks.length})
        </button>
      </div>

      {/* Agent List */}
      {view === 'agents' && (
        <div className="space-y-3">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-4 rounded-xl hover:border-cyan-500/30 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Bot className="w-10 h-10 text-cyan-400" />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
                      agent.status === 'active' ? 'bg-green-500 animate-pulse' :
                      agent.status === 'error' ? 'bg-red-500' :
                      agent.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{agent.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${getStatusColor(agent.status)}`}>
                        {getStatusIcon(agent.status)}
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{agent.type}</p>
                    {agent.currentTask && (
                      <p className="text-sm text-cyan-400 mt-1">
                        <Zap className="w-3 h-3 inline mr-1" />
                        {agent.currentTask}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white">{agent.completedTasks.toLocaleString()} tasks</div>
                  <div className="text-sm text-gray-400">{agent.successRate}% success</div>
                  <div className="text-xs text-gray-500 mt-1">{formatTime(agent.lastActive)}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {agent.capabilities.slice(0, 4).map(cap => (
                  <span key={cap} className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-400">
                    {cap.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Task List */}
      {view === 'tasks' && (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-4 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    {task.status}
                  </span>
                  <span className="text-sm text-gray-400">{task.agentName}</span>
                </div>
                <span className="text-xs text-gray-500">{formatTime(task.startedAt)}</span>
              </div>
              <p className="text-white">{task.description}</p>
              {task.progress !== undefined && task.status === 'running' && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
