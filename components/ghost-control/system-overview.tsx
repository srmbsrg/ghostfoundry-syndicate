'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Bot, RefreshCw, Database, Eye, Cog, Network,
  CheckCircle, AlertTriangle, XCircle, Zap, Clock,
  TrendingUp, Activity, Server, Cpu, HardDrive
} from 'lucide-react';

interface SystemHealth {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  metrics: { label: string; value: string }[];
  icon: React.ReactNode;
  description: string;
}

interface QuickStat {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

export function SystemOverview() {
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [systems, setSystems] = useState<SystemHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from APIs
    // For now, show representative data
    setStats([
      { label: 'Active Agents', value: '12', trend: 'up', icon: <Bot className="w-5 h-5" /> },
      { label: 'Tasks Today', value: '847', trend: 'up', icon: <CheckCircle className="w-5 h-5" /> },
      { label: 'Self-Mods Pending', value: '3', trend: 'stable', icon: <RefreshCw className="w-5 h-5" /> },
      { label: 'Memories', value: '2.4K', trend: 'up', icon: <Brain className="w-5 h-5" /> },
      { label: 'Events/min', value: '156', trend: 'up', icon: <Network className="w-5 h-5" /> },
      { label: 'Uptime', value: '99.9%', trend: 'stable', icon: <Activity className="w-5 h-5" /> },
    ]);

    setSystems([
      {
        name: 'Event Bus',
        status: 'healthy',
        icon: <Network className="w-6 h-6" />,
        description: 'Nervous system for inter-component communication',
        metrics: [
          { label: 'Events/min', value: '156' },
          { label: 'Subscriptions', value: '47' },
          { label: 'Queue depth', value: '12' },
        ],
      },
      {
        name: 'Self-Modification',
        status: 'healthy',
        icon: <RefreshCw className="w-6 h-6" />,
        description: 'Recursive self-improvement engine',
        metrics: [
          { label: 'Proposals', value: '3 pending' },
          { label: 'Modifications today', value: '7' },
          { label: 'Success rate', value: '98%' },
        ],
      },
      {
        name: 'Memory System',
        status: 'healthy',
        icon: <Brain className="w-6 h-6" />,
        description: 'Episodic and semantic memory stores',
        metrics: [
          { label: 'Total memories', value: '2,412' },
          { label: 'Consolidated', value: '1,847' },
          { label: 'Retrieval latency', value: '45ms' },
        ],
      },
      {
        name: 'Perception Layer',
        status: 'healthy',
        icon: <Eye className="w-6 h-6" />,
        description: 'Document understanding and anomaly detection',
        metrics: [
          { label: 'Docs processed', value: '234' },
          { label: 'Anomalies detected', value: '3' },
          { label: 'Signals captured', value: '89' },
        ],
      },
      {
        name: 'Dark Factory',
        status: 'healthy',
        icon: <Cog className="w-6 h-6" />,
        description: 'Code generation and deployment pipeline',
        metrics: [
          { label: 'Generations today', value: '14' },
          { label: 'Deployed', value: '12' },
          { label: 'Success rate', value: '86%' },
        ],
      },
      {
        name: 'Agent Registry',
        status: 'healthy',
        icon: <Bot className="w-6 h-6" />,
        description: 'Agent management and orchestration',
        metrics: [
          { label: 'Active agents', value: '12' },
          { label: 'Tasks queued', value: '34' },
          { label: 'Completion rate', value: '94%' },
        ],
      },
    ]);

    setLoading(false);
  }, []);

  const getStatusColor = (status: SystemHealth['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'offline': return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: SystemHealth['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'offline': return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-4 rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-cyan-400">{stat.icon}</div>
              {getTrendIcon(stat.trend)}
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* System Health Grid */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-400" />
          System Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systems.map((system, index) => (
            <motion.div
              key={system.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-5 rounded-xl hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-cyan-400">{system.icon}</div>
                  <div>
                    <h3 className="font-semibold text-white">{system.name}</h3>
                    <p className="text-xs text-gray-500">{system.description}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full flex items-center gap-1 text-xs ${getStatusColor(system.status)}`}>
                  {getStatusIcon(system.status)}
                  <span className="capitalize">{system.status}</span>
                </div>
              </div>
              <div className="space-y-2">
                {system.metrics.map((metric) => (
                  <div key={metric.label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{metric.label}</span>
                    <span className="text-white font-medium">{metric.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Real-time Activity Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-6 rounded-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Live Activity Pulse
          </h2>
          <div className="flex items-center gap-2 text-sm text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Real-time
          </div>
        </div>
        <div className="h-24 flex items-end gap-1">
          {Array.from({ length: 60 }).map((_, i) => {
            const height = 20 + Math.random() * 80;
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
                className="flex-1 bg-gradient-to-t from-cyan-500/50 to-purple-500/50 rounded-t"
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>60 seconds ago</span>
          <span>Now</span>
        </div>
      </motion.div>
    </div>
  );
}
