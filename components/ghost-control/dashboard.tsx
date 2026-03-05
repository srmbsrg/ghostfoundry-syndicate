'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Brain, Activity, Cog, Database, Eye, Zap, Shield,
  AlertTriangle, CheckCircle, Clock, Server, Bot,
  FileText, TrendingUp, RefreshCw, Terminal, Cpu,
  BarChart3, Network, MessageSquare, Layers, Scale
} from 'lucide-react';
import { SystemOverview } from './system-overview';
import { AgentActivityPanel } from './agent-activity';
import { SelfModQueue } from './self-mod-queue';
import { MemoryInsights } from './memory-insights';
import { PerceptionFeed } from './perception-feed';
import { FactoryActivity } from './factory-activity';
import { EventStream } from './event-stream';
import { TestingPanel } from './testing-panel';
import { ConstitutionViewer } from './constitution-viewer';

type TabId = 'overview' | 'agents' | 'self-mod' | 'memory' | 'perception' | 'factory' | 'events' | 'testing' | 'heartbeat' | 'constitution';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  description: string;
  href?: string;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" />, description: 'System health & status' },
  { id: 'heartbeat', label: 'Heartbeat', icon: <Shield className="w-4 h-4" />, description: 'Pulse monitoring & security', href: '/ghost-control/heartbeat' },
  { id: 'constitution', label: 'Constitution', icon: <Scale className="w-4 h-4" />, description: 'Baseline rules & laws' },
  { id: 'agents', label: 'Agents', icon: <Bot className="w-4 h-4" />, description: 'Active agents & tasks' },
  { id: 'self-mod', label: 'Self-Mod', icon: <RefreshCw className="w-4 h-4" />, description: 'Modification proposals' },
  { id: 'memory', label: 'Memory', icon: <Brain className="w-4 h-4" />, description: 'Ghost memories' },
  { id: 'perception', label: 'Perception', icon: <Eye className="w-4 h-4" />, description: 'Document & signal processing' },
  { id: 'factory', label: 'Factory', icon: <Cog className="w-4 h-4" />, description: 'Code generation activity' },
  { id: 'events', label: 'Events', icon: <Network className="w-4 h-4" />, description: 'Live event stream' },
  { id: 'testing', label: 'Testing', icon: <Zap className="w-4 h-4" />, description: 'Run system tests' },
];

export function GhostControlDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('--:--:--');
  const [mounted, setMounted] = useState(false);

  // Hydration-safe time display
  useEffect(() => {
    setMounted(true);
    setLastUpdate(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setLastUpdate(new Date().toLocaleTimeString());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-[#0a0f1a]/80 backdrop-blur-xl sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Brain className="w-10 h-10 text-cyan-400" />
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Ghost Control Center</h1>
                <p className="text-gray-400 text-sm">The GFS Consciousness Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Last sync: {lastUpdate}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isConnected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-cyan-500/10 bg-[#0a0f1a]/50 backdrop-blur-sm sticky top-[7.5rem] z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {tabs.map((tab) => (
              tab.href ? (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all duration-200 text-gray-400 hover:text-white hover:bg-white/5 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20"
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </Link>
              ) : (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <SystemOverview />}
            {activeTab === 'constitution' && <ConstitutionViewer />}
            {activeTab === 'agents' && <AgentActivityPanel />}
            {activeTab === 'self-mod' && <SelfModQueue />}
            {activeTab === 'memory' && <MemoryInsights />}
            {activeTab === 'perception' && <PerceptionFeed />}
            {activeTab === 'factory' && <FactoryActivity />}
            {activeTab === 'events' && <EventStream />}
            {activeTab === 'testing' && <TestingPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
