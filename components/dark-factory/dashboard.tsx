'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { GenerationForm } from './generation-form';
import { TaskList } from './task-list';
import { ArtifactViewer } from './artifact-viewer';

interface Stats {
  totalTasks: number;
  completed: number;
  inProgress: number;
  failed: number;
}

export function DarkFactoryDashboard() {
  const [activeTab, setActiveTab] = useState<'generate' | 'tasks' | 'artifacts'>('generate');
  const [stats, setStats] = useState<Stats>({ totalTasks: 0, completed: 0, inProgress: 0, failed: 0 });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dark-factory/tasks?limit=100');
      if (response.ok) {
        const data = await response.json();
        const tasks = data.data || [];
        setStats({
          totalTasks: data.pagination?.total || tasks.length,
          completed: tasks.filter((t: { status: string }) => t.status === 'completed').length,
          inProgress: tasks.filter((t: { status: string }) => ['parsing', 'generating', 'validating', 'testing', 'deploying'].includes(t.status)).length,
          failed: tasks.filter((t: { status: string }) => t.status === 'failed').length,
        });
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-4">
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
