'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Factory,
  Sparkles,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Code,
  Database,
  FileCode,
  TestTube,
  Loader2,
  Send,
  RefreshCw,
  Eye,
  Rocket,
  HelpCircle,
  Keyboard,
  ArrowRight,
  Info,
  X,
} from 'lucide-react';
import { GenerationForm } from './generation-form';
import { TaskList } from './task-list';
import { ArtifactViewer } from './artifact-viewer';

interface Stats {
  totalTasks: number;
  completed: number;
  inProgress: number;
  failed: number;
  awaitingApproval: number;
}

interface TaskSummary {
  id: string;
  status: string;
  prompt: string;
}

export function DarkFactoryDashboard() {
  const [activeTab, setActiveTab] = useState<'generate' | 'tasks' | 'artifacts'>('generate');
  const [stats, setStats] = useState<Stats>({ totalTasks: 0, completed: 0, inProgress: 0, failed: 0, awaitingApproval: 0 });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [latestAwaitingTask, setLatestAwaitingTask] = useState<TaskSummary | null>(null);

  // Keyboard shortcut for help (?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const activeElement = document.activeElement;
        const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
        if (!isInput) {
          e.preventDefault();
          setShowHelp(prev => !prev);
        }
      }
      if (e.key === 'Escape') {
        setShowHelp(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dark-factory/tasks?limit=100');
      if (response.ok) {
        const data = await response.json();
        const tasks = data.data || [];
        const awaitingTasks = tasks.filter((t: { status: string }) => t.status === 'awaiting_approval');
        setStats({
          totalTasks: data.pagination?.total || tasks.length,
          completed: tasks.filter((t: { status: string }) => t.status === 'completed').length,
          inProgress: tasks.filter((t: { status: string }) => ['parsing', 'generating', 'validating', 'testing', 'deploying'].includes(t.status)).length,
          failed: tasks.filter((t: { status: string }) => t.status === 'failed').length,
          awaitingApproval: awaitingTasks.length,
        });
        // Get the most recent awaiting approval task
        if (awaitingTasks.length > 0) {
          const latest = awaitingTasks[0];
          setLatestAwaitingTask({
            id: latest.id,
            status: latest.status,
            prompt: latest.request?.prompt || 'Unknown task',
          });
        } else {
          setLatestAwaitingTask(null);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
    setActiveTab('artifacts');
  };

  const handleGenerationComplete = () => {
    handleRefresh();
    setActiveTab('tasks');
  };

  // Determine what's next based on current state
  const getWhatsNext = () => {
    if (stats.awaitingApproval > 0) {
      return {
        type: 'approval',
        message: `${stats.awaitingApproval} task(s) awaiting your approval`,
        action: 'Review & Deploy',
        color: 'orange',
      };
    }
    if (stats.inProgress > 0) {
      return {
        type: 'progress',
        message: `${stats.inProgress} task(s) currently processing`,
        action: 'View Progress',
        color: 'cyan',
      };
    }
    if (activeTab === 'generate') {
      return {
        type: 'generate',
        message: 'Describe what you want to build',
        action: 'Start Here',
        color: 'purple',
      };
    }
    return {
      type: 'idle',
      message: 'Ready to generate new code',
      action: 'Generate',
      color: 'green',
    };
  };

  const whatsNext = getWhatsNext();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0d1321] border border-cyan-500/30 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-bold text-white">Dark Factory Help</h2>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Quick Start</h3>
                  <ol className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">1</span>
                      <span><strong>Generate:</strong> Describe what you want to build in plain English</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold">2</span>
                      <span><strong>Tasks:</strong> Watch the pipeline process your request</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm font-bold">3</span>
                      <span><strong>Review:</strong> When status shows "awaiting approval", click to review code</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-bold">4</span>
                      <span><strong>Deploy:</strong> Approve and deploy artifacts to your codebase</span>
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Keyboard Shortcuts</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">?</kbd>
                      <span>Toggle help</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Esc</kbd>
                      <span>Close modal</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/docs/dark-factory"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all"
                  onClick={() => setShowHelp(false)}
                >
                  <FileCode className="w-5 h-5" />
                  View Full Documentation
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
              <Factory className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                <span className="gradient-text">Dark Factory</span>
              </h1>
              <p className="text-gray-400 mt-1">The code generation pipeline that builds itself</p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
            title="Press ? for help"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Help</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono">?</kbd>
          </button>
        </div>
      </motion.div>

      {/* What's Next Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8"
      >
        <WhatsNextBreadcrumb
          whatsNext={whatsNext}
          latestAwaitingTask={latestAwaitingTask}
          onTaskSelect={handleTaskSelect}
          setActiveTab={setActiveTab}
        />
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <StatCard
          icon={<Code className="w-5 h-5" />}
          label="Total Tasks"
          value={stats.totalTasks}
          color="cyan"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Completed"
          value={stats.completed}
          color="green"
        />
        <StatCard
          icon={<Loader2 className="w-5 h-5 animate-spin" />}
          label="In Progress"
          value={stats.inProgress}
          color="yellow"
        />
        <StatCard
          icon={<XCircle className="w-5 h-5" />}
          label="Failed"
          value={stats.failed}
          color="red"
        />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 mb-6"
      >
        <TabButton
          active={activeTab === 'generate'}
          onClick={() => setActiveTab('generate')}
          icon={<Sparkles className="w-4 h-4" />}
          label="Generate"
        />
        <TabButton
          active={activeTab === 'tasks'}
          onClick={() => setActiveTab('tasks')}
          icon={<Clock className="w-4 h-4" />}
          label="Tasks"
        />
        <TabButton
          active={activeTab === 'artifacts'}
          onClick={() => setActiveTab('artifacts')}
          icon={<FileCode className="w-4 h-4" />}
          label="Artifacts"
        />
        <div className="ml-auto">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="glass-card rounded-2xl p-6"
      >
        {activeTab === 'generate' && (
          <GenerationForm onComplete={handleGenerationComplete} />
        )}
        {activeTab === 'tasks' && (
          <TaskList
            refreshKey={refreshKey}
            onTaskSelect={handleTaskSelect}
          />
        )}
        {activeTab === 'artifacts' && (
          <ArtifactViewer taskId={selectedTaskId} />
        )}
      </motion.div>

      {/* Pipeline Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Pipeline Stages</h3>
        <div className="flex flex-wrap items-center gap-4">
          <PipelineStage icon={<Send />} label="Intent Parser" description="NL → Spec" />
          <ChevronRight className="w-5 h-5 text-gray-600 hidden md:block" />
          <PipelineStage icon={<Database />} label="Schema Generator" description="Spec → Schema" />
          <ChevronRight className="w-5 h-5 text-gray-600 hidden md:block" />
          <PipelineStage icon={<Code />} label="Code Generator" description="Schema → Code" />
          <ChevronRight className="w-5 h-5 text-gray-600 hidden md:block" />
          <PipelineStage icon={<TestTube />} label="Validator" description="Code → Tests" />
          <ChevronRight className="w-5 h-5 text-gray-600 hidden md:block" />
          <PipelineStage icon={<Rocket />} label="Deployer" description="Tests → Deploy" />
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'cyan' | 'green' | 'yellow' | 'red';
}) {
  const colors = {
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
    yellow: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400',
    red: 'from-red-500/20 to-pink-500/20 border-red-500/30 text-red-400',
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${colors[color]} border backdrop-blur-sm`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-sm text-gray-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        active
          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25'
          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PipelineStage({ icon, label, description }: {
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-cyan-400">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
    </div>
  );
}

// What's Next Breadcrumb Component
function WhatsNextBreadcrumb({ 
  whatsNext, 
  latestAwaitingTask, 
  onTaskSelect,
  setActiveTab 
}: {
  whatsNext: { type: string; message: string; action: string; color: string };
  latestAwaitingTask: { id: string; status: string; prompt: string } | null;
  onTaskSelect: (taskId: string) => void;
  setActiveTab: (tab: 'generate' | 'tasks' | 'artifacts') => void;
}) {
  const colorClasses = {
    orange: 'from-orange-500/20 to-yellow-500/20 border-orange-500/40 text-orange-400',
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-400',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-400',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/40 text-green-400',
  };

  const iconMap = {
    approval: <Clock className="w-5 h-5" />,
    progress: <Loader2 className="w-5 h-5 animate-spin" />,
    generate: <Sparkles className="w-5 h-5" />,
    idle: <Sparkles className="w-5 h-5" />,
  };

  const handleAction = () => {
    if (whatsNext.type === 'approval' && latestAwaitingTask) {
      onTaskSelect(latestAwaitingTask.id);
    } else if (whatsNext.type === 'progress') {
      setActiveTab('tasks');
    } else {
      setActiveTab('generate');
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${colorClasses[whatsNext.color as keyof typeof colorClasses]} border p-4`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10">
            {iconMap[whatsNext.type as keyof typeof iconMap]}
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Info className="w-4 h-4" />
              What's Next
            </div>
            <div className="text-sm text-gray-300 mt-0.5">
              {whatsNext.message}
              {latestAwaitingTask && whatsNext.type === 'approval' && (
                <span className="block text-xs text-gray-400 mt-1 truncate max-w-md">
                  "{latestAwaitingTask.prompt.slice(0, 60)}..."
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleAction}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all whitespace-nowrap"
        >
          {whatsNext.action}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Pipeline Progress Indicator */}
      <div className="flex items-center gap-1 mt-4 pt-4 border-t border-white/10">
        <PipelineStep label="Generate" active={whatsNext.type === 'generate' || whatsNext.type === 'idle'} completed={whatsNext.type === 'progress' || whatsNext.type === 'approval'} />
        <div className="flex-1 h-0.5 bg-white/10" />
        <PipelineStep label="Process" active={whatsNext.type === 'progress'} completed={whatsNext.type === 'approval'} />
        <div className="flex-1 h-0.5 bg-white/10" />
        <PipelineStep label="Review" active={whatsNext.type === 'approval'} completed={false} />
        <div className="flex-1 h-0.5 bg-white/10" />
        <PipelineStep label="Deploy" active={false} completed={false} />
      </div>
    </div>
  );
}

function PipelineStep({ label, active, completed }: { label: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-3 h-3 rounded-full transition-all ${
        completed ? 'bg-green-400' :
        active ? 'bg-cyan-400 ring-2 ring-cyan-400/50 animate-pulse' :
        'bg-white/20'
      }`} />
      <span className={`text-xs ${active ? 'text-white font-medium' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}
