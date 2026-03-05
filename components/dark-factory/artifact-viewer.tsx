'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileCode,
  Database,
  Code,
  TestTube,
  FileText,
  Loader2,
  Copy,
  Check,
  Rocket,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface Artifact {
  id: string;
  type: string;
  path: string;
  content?: string;
  deployed?: boolean;
}

interface ArtifactViewerProps {
  taskId: string | null;
}

export function ArtifactViewer({ taskId }: ArtifactViewerProps) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{ success: boolean; message: string } | null>(null);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);

  useEffect(() => {
    if (taskId) {
      fetchTaskArtifacts();
    } else {
      setArtifacts([]);
      setSelectedArtifact(null);
    }
  }, [taskId]);

  const fetchTaskArtifacts = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/dark-factory/status/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setArtifacts(data.artifacts || []);
        setTaskStatus(data.status);
        if (data.artifacts?.length > 0 && !selectedArtifact) {
          loadArtifactContent(data.artifacts[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching artifacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadArtifactContent = async (artifact: Artifact) => {
    setLoadingContent(true);
    try {
      const response = await fetch(`/api/dark-factory/artifacts/${artifact.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedArtifact(data);
      }
    } catch (error) {
      console.error('Error fetching artifact content:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleCopy = () => {
    if (selectedArtifact?.content) {
      navigator.clipboard.writeText(selectedArtifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeploy = async () => {
    if (!taskId) return;
    setDeploying(true);
    setDeployResult(null);
    try {
      const response = await fetch('/api/dark-factory/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          environment: 'dev',
        }),
      });
      const data = await response.json();
      setDeployResult({
        success: data.success,
        message: data.success
          ? `Deployed ${data.deployed} artifact(s) successfully!`
          : data.error || 'Deployment failed',
      });
      if (data.success) {
        fetchTaskArtifacts();
      }
    } catch (error) {
      setDeployResult({
        success: false,
        message: error instanceof Error ? error.message : 'Deployment failed',
      });
    } finally {
      setDeploying(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prisma_model':
        return <Database className="w-4 h-4" />;
      case 'api_route':
        return <Code className="w-4 h-4" />;
      case 'typescript_type':
        return <FileText className="w-4 h-4" />;
      case 'test_file':
        return <TestTube className="w-4 h-4" />;
      default:
        return <FileCode className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prisma_model':
        return 'text-purple-400';
      case 'api_route':
        return 'text-cyan-400';
      case 'typescript_type':
        return 'text-blue-400';
      case 'test_file':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  if (!taskId) {
    return (
      <div className="text-center py-12">
        <FileCode className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">Select a task to view its artifacts</p>
        <p className="text-gray-500 text-sm mt-1">Go to the Tasks tab and click on a task</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileCode className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-semibold text-white">Generated Artifacts</h2>
          <span className="text-gray-500 text-sm">({artifacts.length} files)</span>
        </div>

        {taskStatus === 'awaiting_approval' && artifacts.length > 0 && (
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/25"
          >
            {deploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                Deploy All
              </>
            )}
          </button>
        )}
      </div>

      {deployResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            deployResult.success
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {deployResult.success ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {deployResult.message}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File List */}
        <div className="lg:col-span-1 space-y-2">
          {artifacts.map((artifact) => (
            <button
              key={artifact.id}
              onClick={() => loadArtifactContent(artifact)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                selectedArtifact?.id === artifact.id
                  ? 'bg-cyan-500/20 border border-cyan-500/30'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              <div className={getTypeColor(artifact.type)}>
                {getTypeIcon(artifact.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {artifact.path.split('/').pop()}
                </div>
                <div className="text-xs text-gray-500 truncate">{artifact.path}</div>
              </div>
              {artifact.deployed && (
                <Check className="w-4 h-4 text-green-400" />
              )}
            </button>
          ))}
        </div>

        {/* Code Preview */}
        <div className="lg:col-span-2">
          {loadingContent ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          ) : selectedArtifact?.content ? (
            <div className="relative">
              <div className="flex items-center justify-between p-3 bg-gray-900 rounded-t-xl border border-white/10 border-b-0">
                <div className="flex items-center gap-2">
                  <div className={getTypeColor(selectedArtifact.type)}>
                    {getTypeIcon(selectedArtifact.type)}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {selectedArtifact.path}
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-gray-950 rounded-b-xl border border-white/10 overflow-x-auto max-h-[500px] overflow-y-auto">
                <code className="text-sm text-gray-300 whitespace-pre">
                  {selectedArtifact.content}
                </code>
              </pre>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a file to view its content
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
