'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, Zap, Bot, RefreshCw, Brain, Eye, Cog,
  AlertTriangle, CheckCircle, Clock, Play, Pause,
  Filter, ChevronRight, Activity
} from 'lucide-react';

type EventType = 
  | 'gfs.agent.task_started'
  | 'gfs.agent.task_completed'
  | 'gfs.agent.task_failed'
  | 'gfs.workflow.started'
  | 'gfs.workflow.completed'
  | 'gfs.self_mod.proposal_created'
  | 'gfs.self_mod.proposal_approved'
  | 'gfs.memory.consolidated'
  | 'gfs.perception.document_processed'
  | 'gfs.perception.anomaly_detected'
  | 'dark_factory.generation.started'
  | 'dark_factory.generation.completed'
  | 'dark_factory.deployment.success';

interface Event {
  id: string;
  type: EventType;
  source: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  correlationId?: string;
}

export function EventStream() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    eventsPerMinute: 156,
    activeSubscriptions: 47,
    queueDepth: 12,
  });
  const streamRef = useRef<HTMLDivElement>(null);

  // Simulate real-time events
  useEffect(() => {
    const eventTypes: EventType[] = [
      'gfs.agent.task_started',
      'gfs.agent.task_completed',
      'gfs.workflow.started',
      'gfs.workflow.completed',
      'gfs.perception.document_processed',
      'gfs.memory.consolidated',
      'dark_factory.generation.completed',
    ];

    const sources = [
      'invoice-processor',
      'anomaly-hunter',
      'contract-analyzer',
      'report-generator',
      'memory-system',
      'perception-layer',
      'dark-factory',
    ];

    // Initial events
    const initialEvents: Event[] = [
      {
        id: 'evt-001',
        type: 'gfs.agent.task_completed',
        source: 'invoice-processor',
        payload: { taskId: 'task-123', invoiceCount: 23, totalValue: 127450 },
        timestamp: new Date(Date.now() - 30000),
      },
      {
        id: 'evt-002',
        type: 'gfs.perception.anomaly_detected',
        source: 'anomaly-hunter',
        payload: { metric: 'revenue', deviation: -15, region: 'APAC' },
        timestamp: new Date(Date.now() - 45000),
      },
      {
        id: 'evt-003',
        type: 'gfs.self_mod.proposal_created',
        source: 'self-modification-engine',
        payload: { proposalId: 'mod-001', type: 'new_endpoint', title: 'Bulk Upload' },
        timestamp: new Date(Date.now() - 60000),
      },
      {
        id: 'evt-004',
        type: 'dark_factory.generation.completed',
        source: 'dark-factory',
        payload: { generationId: 'gen-003', type: 'schema', linesGenerated: 45 },
        timestamp: new Date(Date.now() - 90000),
      },
      {
        id: 'evt-005',
        type: 'gfs.memory.consolidated',
        source: 'memory-system',
        payload: { memoriesConsolidated: 12, patternsExtracted: 3 },
        timestamp: new Date(Date.now() - 120000),
      },
      {
        id: 'evt-006',
        type: 'gfs.workflow.completed',
        source: 'workflow-engine',
        payload: { workflowId: 'wf-456', duration: '2.4s', stepsCompleted: 5 },
        timestamp: new Date(Date.now() - 150000),
      },
    ];

    setEvents(initialEvents);

    // Add new events periodically
    const interval = setInterval(() => {
      if (!isPaused) {
        const newEvent: Event = {
          id: `evt-${Date.now()}`,
          type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          source: sources[Math.floor(Math.random() * sources.length)],
          payload: { timestamp: new Date().toISOString() },
          timestamp: new Date(),
        };

        setEvents(prev => [newEvent, ...prev.slice(0, 49)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const getEventIcon = (type: EventType) => {
    if (type.startsWith('gfs.agent')) return <Bot className="w-4 h-4" />;
    if (type.startsWith('gfs.workflow')) return <Activity className="w-4 h-4" />;
    if (type.startsWith('gfs.self_mod')) return <RefreshCw className="w-4 h-4" />;
    if (type.startsWith('gfs.memory')) return <Brain className="w-4 h-4" />;
    if (type.startsWith('gfs.perception')) return <Eye className="w-4 h-4" />;
    if (type.startsWith('dark_factory')) return <Cog className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const getEventColor = (type: EventType) => {
    if (type.includes('completed') || type.includes('success')) return 'text-green-400 bg-green-500/10';
    if (type.includes('failed') || type.includes('anomaly')) return 'text-red-400 bg-red-500/10';
    if (type.includes('started')) return 'text-cyan-400 bg-cyan-500/10';
    if (type.includes('proposal')) return 'text-purple-400 bg-purple-500/10';
    return 'text-blue-400 bg-blue-500/10';
  };

  const formatEventType = (type: EventType) => {
    return type.split('.').slice(1).join('.');
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const filteredEvents = events.filter(e => {
    if (typeFilter === 'all') return true;
    return e.type.includes(typeFilter);
  });

  const eventCategories = [
    { id: 'all', label: 'All' },
    { id: 'agent', label: 'Agents' },
    { id: 'workflow', label: 'Workflows' },
    { id: 'self_mod', label: 'Self-Mod' },
    { id: 'memory', label: 'Memory' },
    { id: 'perception', label: 'Perception' },
    { id: 'dark_factory', label: 'Factory' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm">Events/min</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.eventsPerMinute}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Network className="w-4 h-4" />
            <span className="text-sm">Subscriptions</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.activeSubscriptions}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Queue Depth</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.queueDepth}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {eventCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setTypeFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                typeFilter === cat.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
            isPaused
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {isPaused ? (
            <><Play className="w-4 h-4" /> Resume</>
          ) : (
            <><Pause className="w-4 h-4" /> Pause</>
          )}
        </button>
      </div>

      {/* Event Stream */}
      <div
        ref={streamRef}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
            <span className="text-sm text-gray-400">
              {isPaused ? 'Stream paused' : 'Live event stream'}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Showing {filteredEvents.length} events
          </span>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          <AnimatePresence>
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`p-4 border-b border-gray-800/50 hover:bg-white/5 transition-colors ${
                  index === 0 && !isPaused ? 'bg-cyan-500/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {formatEventType(event.type)}
                      </span>
                      <span className="text-xs text-gray-500">
                        from {event.source}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 font-mono truncate">
                      {JSON.stringify(event.payload)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTimestamp(event.timestamp)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Event Flow Visualization */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-cyan-400" />
          Event Flow Architecture
        </h3>
        <div className="flex items-center justify-between text-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-gray-400">Publishers</span>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-600" />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Network className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-gray-400">Event Bus</span>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-600" />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-gray-400">Dispatcher</span>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-600" />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-gray-400">Handlers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
