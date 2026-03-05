'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, CheckCircle, XCircle, Clock, FileText, BarChart3,
  Bot, Brain, Network, RefreshCw, Loader2, ChevronRight,
  AlertTriangle, Zap, Filter
} from 'lucide-react';

type TestType = 'document_processing' | 'anomaly_detection' | 'agent_workflow' | 'memory_consolidation' | 'event_bus' | 'self_modification';
type TestStatus = 'pending' | 'running' | 'passed' | 'failed';

interface TestCase {
  id: string;
  name: string;
  type: TestType;
  description: string;
  expectedOutcome: string;
  timeout: number;
}

interface TestResult {
  id: string;
  testCaseId: string;
  status: TestStatus;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  output?: unknown;
  error?: string;
  logs: { timestamp: string; level: string; message: string }[];
}

export function TestingPanel() {
  const [tests, setTests] = useState<TestCase[]>([]);
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [running, setRunning] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<'all' | TestType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/gfs/testing');
      const data = await res.json();
      setTests(data.tests || []);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const runTest = async (testId: string) => {
    setRunning(prev => new Set(prev).add(testId));
    
    try {
      const res = await fetch('/api/gfs/testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId }),
      });
      const data = await res.json();
      
      if (data.result) {
        setResults(prev => ({
          ...prev,
          [testId]: data.result,
        }));
      }
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setRunning(prev => {
        const next = new Set(prev);
        next.delete(testId);
        return next;
      });
    }
  };

  const runAllTests = async () => {
    const testIds = filteredTests.map(t => t.id);
    testIds.forEach(id => setRunning(prev => new Set(prev).add(id)));
    
    try {
      const res = await fetch('/api/gfs/testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testIds }),
      });
      const data = await res.json();
      
      if (data.run?.results) {
        const newResults: Record<string, TestResult> = {};
        data.run.results.forEach((r: TestResult) => {
          newResults[r.testCaseId] = r;
        });
        setResults(prev => ({ ...prev, ...newResults }));
      }
    } catch (error) {
      console.error('Tests failed:', error);
    } finally {
      setRunning(new Set());
    }
  };

  const getTypeIcon = (type: TestType) => {
    switch (type) {
      case 'document_processing': return <FileText className="w-4 h-4" />;
      case 'anomaly_detection': return <BarChart3 className="w-4 h-4" />;
      case 'agent_workflow': return <Bot className="w-4 h-4" />;
      case 'memory_consolidation': return <Brain className="w-4 h-4" />;
      case 'event_bus': return <Network className="w-4 h-4" />;
      case 'self_modification': return <RefreshCw className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: TestType) => {
    switch (type) {
      case 'document_processing': return 'text-blue-400 bg-blue-500/10';
      case 'anomaly_detection': return 'text-red-400 bg-red-500/10';
      case 'agent_workflow': return 'text-purple-400 bg-purple-500/10';
      case 'memory_consolidation': return 'text-cyan-400 bg-cyan-500/10';
      case 'event_bus': return 'text-green-400 bg-green-500/10';
      case 'self_modification': return 'text-orange-400 bg-orange-500/10';
    }
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'running': return <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const filteredTests = tests.filter(t =>
    typeFilter === 'all' || t.type === typeFilter
  );

  const summary = {
    total: Object.keys(results).length,
    passed: Object.values(results).filter(r => r.status === 'passed').length,
    failed: Object.values(results).filter(r => r.status === 'failed').length,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            GFS Test Suite
          </h2>
          <p className="text-sm text-gray-400">Real-world testing for all subsystems</p>
        </div>
        <button
          onClick={runAllTests}
          disabled={running.size > 0}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {running.size > 0 ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Running...</>
          ) : (
            <><Play className="w-4 h-4" /> Run All Tests</>
          )}
        </button>
      </div>

      {/* Summary */}
      {summary.total > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm">Passed</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {summary.passed}/{summary.total}
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm">Failed</span>
            </div>
            <div className="text-2xl font-bold text-red-400">
              {summary.failed}
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0}%
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'document_processing', 'anomaly_detection', 'agent_workflow', 'memory_consolidation', 'event_bus', 'self_modification'] as const).map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              typeFilter === type
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            {type === 'all' ? 'All' : type.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Test List */}
      <div className="space-y-3">
        {filteredTests.map((test, index) => {
          const result = results[test.id];
          const isRunning = running.has(test.id);
          
          return (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="glass-card p-4 rounded-xl hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isRunning ? (
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  ) : result ? (
                    getStatusIcon(result.status)
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-gray-600" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">{test.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${getTypeColor(test.type)}`}>
                        {getTypeIcon(test.type)}
                        {test.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{test.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {result?.duration && (
                    <span className="text-xs text-gray-500">{result.duration}ms</span>
                  )}
                  <button
                    onClick={() => runTest(test.id)}
                    disabled={isRunning}
                    className="px-3 py-1.5 rounded-lg text-sm bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    Run
                  </button>
                </div>
              </div>

              {/* Result Details */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-800"
                  >
                    {result.error && (
                      <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <div className="flex items-center gap-2 text-red-400 mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">Error</span>
                        </div>
                        <p className="text-sm text-red-300">{result.error}</p>
                      </div>
                    )}
                    
                    {result.logs && result.logs.length > 0 && (
                      <div className="bg-black/30 rounded-lg p-3 max-h-40 overflow-y-auto">
                        <div className="text-xs text-gray-500 mb-2">Execution Logs</div>
                        {result.logs.map((log, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs font-mono">
                            <span className={`${
                              log.level === 'error' ? 'text-red-400' :
                              log.level === 'warn' ? 'text-yellow-400' :
                              log.level === 'info' ? 'text-cyan-400' : 'text-gray-500'
                            }`}>
                              [{log.level}]
                            </span>
                            <span className="text-gray-300">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
