'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Server,
  Bot,
  Database,
  Workflow,
  Zap,
  Eye,
  Bell,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import Link from 'next/link';

interface SystemHealth {
  overallStatus: 'healthy' | 'degraded' | 'critical' | 'offline';
  healthScore: number;
  components: ComponentHealthSummary[];
  alerts: {
    critical: number;
    warning: number;
  };
  metrics: {
    agentCount: number;
    activeAgents: number;
    healthyAgents: number;
    workflowsActive: number;
    workflowsFailed: number;
    tasksQueued: number;
    tasksFailed: number;
    avgLatency?: number;
    errorRate?: number;
  };
  lastUpdate: string;
}

interface ComponentHealthSummary {
  component: string;
  status: string;
  count: number;
  healthy: number;
  degraded: number;
  critical: number;
  offline: number;
}

interface SentinelAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  detectedAt: string;
  targetType?: string;
  targetName?: string;
}

interface AlertStats {
  total: number;
  open: number;
  critical: number;
  resolved24h: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
}

export default function HeartbeatDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<SentinelAlert[]>([]);
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [healthRes, alertsRes, statsRes] = await Promise.all([
        fetch('/api/gfs/heartbeat'),
        fetch('/api/gfs/sentinel/alerts?status=open&limit=10'),
        fetch('/api/gfs/sentinel'),
      ]);

      const healthData = await healthRes.json();
      const alertsData = await alertsRes.json();
      const statsData = await statsRes.json();

      if (healthData.success) setHealth(healthData.health);
      if (alertsData.success) setAlerts(alertsData.alerts);
      if (statsData.success) setAlertStats(statsData.stats);
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
      case 'offline':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/20 border-green-500/30';
      case 'degraded':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'critical':
        return 'bg-red-500/20 border-red-500/30';
      case 'offline':
        return 'bg-gray-500/20 border-gray-500/30';
      default:
        return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'agent':
        return Bot;
      case 'database':
        return Database;
      case 'workflow':
        return Workflow;
      case 'api':
        return Zap;
      case 'system':
        return Server;
      default:
        return Server;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Checking system pulse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0f1a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/ghost-control" className="text-gray-400 hover:text-white transition-colors">
                ← Back to Control
              </Link>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-cyan-400" />
                <h1 className="text-xl font-bold">Heartbeat & Sentinel</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  autoRefresh
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Live' : 'Paused'}
              </button>
              <span className="text-sm text-gray-500">
                Last: {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* System Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className={`p-6 rounded-xl border ${getStatusBg(health?.overallStatus || 'unknown')}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${getStatusBg(health?.overallStatus || 'unknown')}`}>
                  {health?.overallStatus === 'healthy' ? (
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  ) : health?.overallStatus === 'degraded' ? (
                    <AlertTriangle className="w-8 h-8 text-yellow-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold capitalize">
                    System {health?.overallStatus || 'Unknown'}
                  </h2>
                  <p className="text-gray-400">
                    Health Score: <span className={getStatusColor(health?.overallStatus || 'unknown')}>
                      {health?.healthScore || 0}%
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-cyan-400">
                  {health?.healthScore || 0}
                </div>
                <div className="text-gray-400 text-sm">Health Score</div>
              </div>
            </div>

            {/* Tagline */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <p className="text-lg font-medium">
                <span className="text-purple-400">The Sentinel is now watching.</span>{' '}
                <span className="text-cyan-400">The Ghost remembers.</span>{' '}
                <span className="text-white">And it knows who you are.</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Active Agents',
              value: health?.metrics.activeAgents || 0,
              total: health?.metrics.agentCount || 0,
              icon: Bot,
              color: 'text-cyan-400',
            },
            {
              label: 'Active Workflows',
              value: health?.metrics.workflowsActive || 0,
              icon: Workflow,
              color: 'text-purple-400',
            },
            {
              label: 'Open Alerts',
              value: alertStats?.open || 0,
              critical: alertStats?.critical || 0,
              icon: Bell,
              color: alertStats?.critical ? 'text-red-400' : 'text-yellow-400',
            },
            {
              label: 'Avg Latency',
              value: health?.metrics.avgLatency ? `${health.metrics.avgLatency}ms` : 'N/A',
              icon: Clock,
              color: 'text-green-400',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-4 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-gray-400 text-sm">{stat.label}</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                {stat.total !== undefined && (
                  <span className="text-gray-500 text-sm"> / {stat.total}</span>
                )}
                {stat.critical !== undefined && stat.critical > 0 && (
                  <span className="text-red-400 text-sm ml-2">({stat.critical} critical)</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Component Health */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold">Component Health</h3>
            </div>

            <div className="space-y-3">
              {health?.components.filter(c => c.count > 0).map((component) => {
                const Icon = getComponentIcon(component.component);
                return (
                  <div
                    key={component.component}
                    className={`p-4 rounded-lg border ${getStatusBg(component.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${getStatusColor(component.status)}`} />
                        <div>
                          <p className="font-medium capitalize">{component.component}</p>
                          <p className="text-xs text-gray-500">
                            {component.healthy} healthy, {component.degraded} degraded, {component.critical} critical
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusBg(component.status)} ${getStatusColor(component.status)}`}>
                        {component.status}
                      </div>
                    </div>
                  </div>
                );
              })}

              {(!health?.components || health.components.filter(c => c.count > 0).length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No component health data yet</p>
                  <p className="text-xs mt-1">Components will appear as they send heartbeats</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sentinel Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold">Sentinel Alerts</h3>
              </div>
              {alertStats && alertStats.open > 0 && (
                <span className="text-sm text-gray-400">
                  {alertStats.open} open
                </span>
              )}
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">{alert.type}</span>
                      </div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.detectedAt).toLocaleString()}
                        </span>
                        {alert.targetName && (
                          <span>Target: {alert.targetName}</span>
                        )}
                      </div>
                    </div>
                    <Eye className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors" />
                  </div>
                </div>
              ))}

              {alerts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No open alerts</p>
                  <p className="text-xs mt-1">The Ghost is watching. All clear.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Metrics Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          {[
            { label: 'Tasks Queued', value: health?.metrics.tasksQueued || 0, icon: Clock },
            { label: 'Tasks Failed (24h)', value: health?.metrics.tasksFailed || 0, icon: XCircle, bad: true },
            { label: 'Workflows Failed (24h)', value: health?.metrics.workflowsFailed || 0, icon: AlertTriangle, bad: true },
            { label: 'Alerts Resolved (24h)', value: alertStats?.resolved24h || 0, icon: CheckCircle, good: true },
            { label: 'Error Rate', value: health?.metrics.errorRate ? `${health.metrics.errorRate.toFixed(1)}%` : '0%', icon: TrendingDown },
          ].map((metric, i) => (
            <div
              key={metric.label}
              className="glass-card p-4 rounded-xl text-center"
            >
              <metric.icon className={`w-5 h-5 mx-auto mb-2 ${
                metric.bad && Number(metric.value) > 0 ? 'text-red-400' :
                metric.good ? 'text-green-400' : 'text-gray-400'
              }`} />
              <div className={`text-xl font-bold ${
                metric.bad && Number(metric.value) > 0 ? 'text-red-400' :
                metric.good ? 'text-green-400' : ''
              }`}>
                {metric.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{metric.label}</div>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
