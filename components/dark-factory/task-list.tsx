'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  FileCode,
  Play,
  Pause,
} from 'lucide-react';

interface Task {
  id: string;
  status: string;
  prompt: string;
  priority: string;
  requestedBy: string;
  artifactCount: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

interface TaskListProps {
  refreshKey: number;
  onTaskSelect: (taskId: string) => void;
}

export function TaskList({ refreshKey, onTaskSelect }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [refreshKey, page, statusFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
      });
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/dark-factory/tasks?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'awaiting_approval':
        return <Pause className="w-5 h-5 text-yellow-400" />;
      case 'queued':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'awaiting_approval':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'queued':
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const statusOptions = [
    { value: null, label: 'All' },
    { value: 'queued', label: 'Queued' },
    { value: 'parsing', label: 'Parsing' },
    { value: 'generating', label: 'Generating' },
    { value: 'validating', label: 'Validating' },
    { value: 'awaiting_approval', label: 'Awaiting Approval' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-semibold text-white">Generation Tasks</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Filter:</span>
          <select
            value={statusFilter || ''}
            onChange={(e) => {
              setStatusFilter(e.target.value || null);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            {statusOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value || ''} className="bg-gray-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <FileCode className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No generation tasks yet</p>
          <p className="text-gray-500 text-sm mt-1">Create your first generation request to see tasks here</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onTaskSelect(task.id)}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getStatusIcon(task.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(task.createdAt)}
                      </span>
                    </div>
                    <p className="text-white mt-2 line-clamp-2">{task.prompt}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{task.artifactCount} artifacts</span>
                      <span>Priority: {task.priority}</span>
                      <span>By: {task.requestedBy}</span>
                    </div>
                    {task.error && (
                      <p className="text-red-400 text-sm mt-2">Error: {task.error}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-400 text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
