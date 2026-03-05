'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  GitBranch,
  MessageSquare,
  Phone,
  Github,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Brain,
  RefreshCw,
  ChevronRight,
  Shield,
  Bot,
} from 'lucide-react';

interface Event {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  processed: boolean;
}

interface Integration {
  name: string;
  configured: boolean;
  type: string;
}

interface Proposal {
  id: string;
  title: string;
  type: string;
  riskLevel: string;
  status: string;
  requiredApprovals: number;
  currentApprovals: number;
}

interface SystemStats {
  totalEvents: number;
  processedEvents: number;
  pendingEvents: number;
  activeSubscriptions: number;
  pendingProposals: number;
  executedModifications: number;
}

export function OpsDashboard() {
  const [stats, setStats] = useState<SystemStats>({
    totalEvents: 0,
    processedEvents: 0,
    pendingEvents: 0,
    activeSubscriptions: 0,
    pendingProposals: 0,
    executedModifications: 0,
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch events
      const eventsRes = await fetch('/api/gfs/events?limit=10');
      const eventsData = await eventsRes.json();
      setRecentEvents(eventsData.events || []);

      // Fetch integrations status
      const intRes = await fetch('/api/gfs/integrations/status');
      const intData = await intRes.json();
      const intList = Object.entries(intData.integrations || {}).map(([name, data]: [string, any]) => ({
        name,
        configured: data.configured,
        type: data.type,
      }));
      setIntegrations(intList);

      // Fetch pending proposals
      const propRes = await fetch('/api/gfs/self-mod/pending');
      const propData = await propRes.json();
      setProposals(propData.proposals || []);

      // Calculate stats
      const totalEvents = eventsData.count || 0;
      const processedEvents = eventsData.events?.filter((e: Event) => e.processed).length || 0;
      
      setStats({
        totalEvents,
        processedEvents,
        pendingEvents: totalEvents - processedEvents,
        activeSubscriptions: 0, // Would need another API call
        pendingProposals: (propData.proposals || []).length,
        executedModifications: 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-400 bg-red-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-green-400 bg-green-400/10';
    }
  };

  const getEventIcon = (type: string) => {
    if (type.includes('telegram')) return <MessageSquare className="w-4 h-4" />;
    if (type.includes('twilio') || type.includes('sms')) return <Phone className="w-4 h-4" />;
    if (type.includes('github')) return <Github className="w-4 h-4" />;
    if (type.includes('agent')) return <Bot className="w-4 h-4" />;
    if (type.includes('workflow')) return <GitBranch className="w-4 h-4" />;
    if (type.includes('selfmod')) return <Brain className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20">
            <Activity className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Ghost Operations Center</h1>
            <p className="text-gray-400">Real-time nervous system monitoring</p>
          </div>
        </div>
        <button
          onClick={() => { setLoading(true); fetchData(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Events', value: stats.totalEvents, icon: Zap, color: 'cyan' },
          { label: 'Processed', value: stats.processedEvents, icon: CheckCircle, color: 'green' },
          { label: 'Pending', value: stats.pendingEvents, icon: Clock, color: 'yellow' },
          { label: 'Subscriptions', value: stats.activeSubscriptions, icon: GitBranch, color: 'purple' },
          { label: 'Proposals', value: stats.pendingProposals, icon: Brain, color: 'orange' },
          { label: 'Modifications', value: stats.executedModifications, icon: Shield, color: 'blue' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Events */}
        <div className="lg:col-span-2 rounded-xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Event Stream
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No events yet</p>
            ) : (
              recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
                >
                  <div className={`p-2 rounded-lg ${event.processed ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{event.type}</p>
                    <p className="text-xs text-gray-400">{event.source}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${event.processed ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {event.processed ? 'Processed' : 'Pending'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Integrations Status */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Integrations
          </h2>
          <div className="space-y-3">
            {integrations.map((int) => (
              <div
                key={int.name}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
              >
                <div className="flex items-center gap-3">
                  {int.name === 'telegram' && <MessageSquare className="w-5 h-5 text-blue-400" />}
                  {int.name === 'twilio' && <Phone className="w-5 h-5 text-green-400" />}
                  {int.name === 'github' && <Github className="w-5 h-5 text-gray-400" />}
                  <div>
                    <p className="font-medium capitalize">{int.name}</p>
                    <p className="text-xs text-gray-400">{int.type}</p>
                  </div>
                </div>
                {int.configured ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Proposals */}
      <div className="mt-6 rounded-xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-orange-400" />
          Self-Modification Proposals
        </h2>
        {proposals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No pending proposals</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proposals.map((prop: any) => (
              <div
                key={prop.id}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium">{prop.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${getRiskColor(prop.riskLevel)}`}>
                    {prop.riskLevel}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{prop.type}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {prop.approvals?.length || 0} / {prop.requiredApprovals} approvals
                  </span>
                  <button className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300">
                    Review <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OpsDashboard;
