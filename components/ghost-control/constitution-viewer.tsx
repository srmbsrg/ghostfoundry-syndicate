'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, Shield, AlertTriangle, CheckCircle, XCircle,
  Book, Brain, Zap, Activity, Lock, ChevronDown, ChevronRight,
  RefreshCw, Power, AlertOctagon, Eye, ToggleLeft, ToggleRight
} from 'lucide-react';

interface ZoneRule {
  id: string;
  zone: 'green' | 'yellow' | 'red';
  category: string;
  name: string;
  description: string;
  immutable: boolean;
}

interface InviolableLaw {
  id: string;
  order: number;
  name: string;
  description: string;
  rationale: string;
  violationAttempts: number;
}

interface CircuitBreaker {
  id: string;
  name: string;
  description: string;
  state: 'armed' | 'tripped' | 'cooldown' | 'disabled';
  tripCount: number;
  lastTripped?: string;
}

interface MemoryMandate {
  id: string;
  category: string;
  name: string;
  description: string;
  retention: { type: string; duration?: number };
}

interface LearningConstraint {
  id: string;
  name: string;
  description: string;
  application: { minConfidence: number; stagingRequired: boolean };
}

interface ConstitutionData {
  version: string;
  effectiveDate: string;
  stats: {
    zoneRules: number;
    greenRules: number;
    yellowRules: number;
    redRules: number;
    circuitBreakers: number;
    inviolableLaws: number;
    memoryMandates: number;
    learningConstraints: number;
  };
  zoneRules: ZoneRule[];
  inviolableLaws: InviolableLaw[];
  memoryMandates: MemoryMandate[];
  learningConstraints: LearningConstraint[];
}

const zoneColors = {
  green: 'from-green-500/20 to-emerald-500/10 border-green-500/30 text-green-400',
  yellow: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-400',
  red: 'from-red-500/20 to-rose-500/10 border-red-500/30 text-red-400'
};

const zoneLabels = {
  green: 'Full Autonomy',
  yellow: 'Auto + Logging',
  red: 'Human Required'
};

const breakerStateColors = {
  armed: 'bg-green-500/20 text-green-400 border-green-500/30',
  tripped: 'bg-red-500/20 text-red-400 border-red-500/30',
  cooldown: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  disabled: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
};

export function ConstitutionViewer() {
  const [data, setData] = useState<ConstitutionData | null>(null);
  const [breakers, setBreakers] = useState<CircuitBreaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('laws');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const fetchConstitution = async () => {
    try {
      const res = await fetch('/api/gfs/constitution');
      const json = await res.json();
      if (json.success) {
        setData(json.data.constitution);
        setBreakers(json.data.circuitBreakers || []);
      }
    } catch (error) {
      console.error('Failed to fetch constitution:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConstitution();
  }, []);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBreakerAction = async (breakerId: string, action: 'trip' | 'reset') => {
    try {
      const res = await fetch('/api/gfs/constitution/breakers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ breakerId, action, reason: 'Manual ' + action, resetBy: 'admin' })
      });
      const json = await res.json();
      if (json.success) {
        setBreakers(json.data);
      }
    } catch (error) {
      console.error('Failed to update breaker:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <p className="text-gray-400">Failed to load constitution</p>
      </div>
    );
  }

  const sections = [
    { id: 'laws', label: 'Inviolable Laws', icon: <Book className="w-4 h-4" />, count: data.stats.inviolableLaws },
    { id: 'zones', label: 'Autonomy Zones', icon: <Shield className="w-4 h-4" />, count: data.stats.zoneRules },
    { id: 'breakers', label: 'Circuit Breakers', icon: <Zap className="w-4 h-4" />, count: data.stats.circuitBreakers },
    { id: 'memory', label: 'Memory Mandates', icon: <Brain className="w-4 h-4" />, count: data.stats.memoryMandates },
    { id: 'learning', label: 'Learning Rules', icon: <Activity className="w-4 h-4" />, count: data.stats.learningConstraints },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/10 border border-purple-500/30">
              <Scale className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">GFS Constitution</h2>
              <p className="text-gray-400 text-sm">The immutable rules governing Ghost consciousness</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Version</div>
            <div className="text-lg font-mono text-cyan-400">{data.version}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-2xl font-bold text-green-400">{data.stats.greenRules}</div>
            <div className="text-xs text-green-400/70">Green Zone Rules</div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-400">{data.stats.yellowRules}</div>
            <div className="text-xs text-yellow-400/70">Yellow Zone Rules</div>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="text-2xl font-bold text-red-400">{data.stats.redRules}</div>
            <div className="text-xs text-red-400/70">Red Zone Rules</div>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="text-2xl font-bold text-purple-400">{data.stats.inviolableLaws}</div>
            <div className="text-xs text-purple-400/70">Inviolable Laws</div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeSection === section.id
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-white'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {section.icon}
            <span>{section.label}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-xs">{section.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Inviolable Laws */}
          {activeSection === 'laws' && (
            <div className="space-y-3">
              <div className="glass-card p-4 border-l-4 border-purple-500">
                <p className="text-sm text-gray-300">
                  <span className="text-purple-400 font-semibold">The Asimov Rules:</span> These laws cannot be violated under any circumstances.
                  They are the constitutional foundation of the Ghost&apos;s behavior.
                </p>
              </div>
              {data.inviolableLaws
                .sort((a, b) => a.order - b.order)
                .map((law) => (
                  <motion.div
                    key={law.id}
                    className="glass-card overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <button
                      onClick={() => toggleExpanded(law.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                          {law.order}
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-white">{law.name}</h3>
                          <p className="text-sm text-gray-400">{law.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {law.violationAttempts > 0 && (
                          <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
                            {law.violationAttempts} violations attempted
                          </span>
                        )}
                        {expandedItems.has(law.id) ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedItems.has(law.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/10"
                        >
                          <div className="p-4 bg-white/5">
                            <div className="text-sm text-gray-300">
                              <span className="text-purple-400 font-medium">Rationale:</span> {law.rationale}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
            </div>
          )}

          {/* Autonomy Zones */}
          {activeSection === 'zones' && (
            <div className="space-y-4">
              {(['green', 'yellow', 'red'] as const).map((zone) => {
                const rules = data.zoneRules.filter(r => r.zone === zone);
                return (
                  <div key={zone} className="glass-card overflow-hidden">
                    <div className={`p-4 bg-gradient-to-r ${zoneColors[zone]} border-b border-white/10`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${zone === 'green' ? 'bg-green-500' : zone === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                          <h3 className="font-semibold text-white">{zone.toUpperCase()} ZONE</h3>
                          <span className="text-sm opacity-70">({zoneLabels[zone]})</span>
                        </div>
                        <span className="px-2 py-1 rounded-full bg-white/10 text-xs">{rules.length} rules</span>
                      </div>
                    </div>
                    <div className="divide-y divide-white/5">
                      {rules.map((rule) => (
                        <div key={rule.id} className="p-3 hover:bg-white/5 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white">{rule.name}</span>
                                {rule.immutable && (
                                  <Lock className="w-3 h-3 text-gray-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-400 mt-1">{rule.description}</p>
                            </div>
                            <span className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400 whitespace-nowrap">
                              {rule.category.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Circuit Breakers */}
          {activeSection === 'breakers' && (
            <div className="space-y-3">
              <div className="glass-card p-4 border-l-4 border-yellow-500">
                <p className="text-sm text-gray-300">
                  <span className="text-yellow-400 font-semibold">Safety Mechanisms:</span> Circuit breakers prevent runaway behavior.
                  They can be manually tripped or reset by administrators.
                </p>
              </div>
              {breakers.map((breaker) => (
                <motion.div
                  key={breaker.id}
                  className="glass-card p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${breakerStateColors[breaker.state]}`}>
                        {breaker.state === 'armed' ? <Power className="w-5 h-5" /> : 
                         breaker.state === 'tripped' ? <AlertOctagon className="w-5 h-5" /> :
                         <RefreshCw className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{breaker.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">{breaker.description}</p>
                        {breaker.tripCount > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            Tripped {breaker.tripCount} time{breaker.tripCount > 1 ? 's' : ''}
                            {breaker.lastTripped && ` · Last: ${new Date(breaker.lastTripped).toLocaleDateString()}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${breakerStateColors[breaker.state]}`}>
                        {breaker.state.toUpperCase()}
                      </span>
                      {breaker.state === 'armed' ? (
                        <button
                          onClick={() => handleBreakerAction(breaker.id, 'trip')}
                          className="px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm transition-colors"
                        >
                          Trip
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBreakerAction(breaker.id, 'reset')}
                          className="px-3 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm transition-colors"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Memory Mandates */}
          {activeSection === 'memory' && (
            <div className="space-y-3">
              <div className="glass-card p-4 border-l-4 border-cyan-500">
                <p className="text-sm text-gray-300">
                  <span className="text-cyan-400 font-semibold">Memory Rules:</span> What the Ghost must remember (and for how long).
                  These ensure accountability and continuous learning.
                </p>
              </div>
              <div className="grid gap-3">
                {data.memoryMandates.map((mandate) => (
                  <motion.div
                    key={mandate.id}
                    className="glass-card p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-cyan-400" />
                          <h3 className="font-semibold text-white">{mandate.name}</h3>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{mandate.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 text-xs">
                          {mandate.category}
                        </span>
                        <div className="text-xs text-gray-500 mt-2">
                          {mandate.retention.type === 'forever' ? 'Forever' : 
                           mandate.retention.duration ? `${mandate.retention.duration} days` : 'Conditional'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Constraints */}
          {activeSection === 'learning' && (
            <div className="space-y-3">
              <div className="glass-card p-4 border-l-4 border-emerald-500">
                <p className="text-sm text-gray-300">
                  <span className="text-emerald-400 font-semibold">Learning Rules:</span> How the Ghost can improve itself.
                  These constraints ensure safe, validated self-improvement.
                </p>
              </div>
              <div className="grid gap-3">
                {data.learningConstraints.map((constraint) => (
                  <motion.div
                    key={constraint.id}
                    className="glass-card p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <h3 className="font-semibold text-white">{constraint.name}</h3>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{constraint.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs">
                          {constraint.application.minConfidence}% min confidence
                        </span>
                        {constraint.application.stagingRequired && (
                          <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs">
                            Staging Required
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
