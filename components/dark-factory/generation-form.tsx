'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Code,
  Database,
  Layers,
  Zap,
} from 'lucide-react';

interface GenerationFormProps {
  onComplete: () => void;
}

interface GenerationResult {
  success: boolean;
  taskId?: string;
  status?: string;
  artifactCount?: number;
  stages?: Array<{ name: string; status: string; duration?: number }>;
  error?: string;
}

const EXAMPLE_PROMPTS = [
  {
    icon: <Database className="w-4 h-4" />,
    label: 'Customer Orders',
    prompt: 'Create an API endpoint that tracks customer orders with status updates, order items, and shipping information',
  },
  {
    icon: <Layers className="w-4 h-4" />,
    label: 'Task Management',
    prompt: 'Create a task management system with projects, tasks, assignees, due dates, and priority levels',
  },
  {
    icon: <Code className="w-4 h-4" />,
    label: 'Inventory Tracker',
    prompt: 'Create an inventory management API with products, stock levels, suppliers, and low-stock alerts',
  },
];

export function GenerationForm({ onComplete }: GenerationFormProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [showExamples, setShowExamples] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setResult(null);
    setShowExamples(false);

    try {
      const response = await fetch('/api/dark-factory/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          priority: 'normal',
          requestedBy: 'human',
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    setShowExamples(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-semibold text-white">Generate Code</h2>
      </div>

      <p className="text-gray-400 mb-6">
        Describe what you want to build in natural language. The Dark Factory will parse your intent,
        generate schemas, write code, create tests, and prepare for deployment.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            What do you want to build?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create an API that tracks customer orders with status updates, shipping info, and order history..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none"
            disabled={isGenerating}
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/25"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate
              </>
            )}
          </button>

          {!isGenerating && prompt && (
            <button
              type="button"
              onClick={() => {
                setPrompt('');
                setResult(null);
                setShowExamples(true);
              }}
              className="px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Example Prompts */}
      {showExamples && !prompt && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <h3 className="text-sm font-medium text-gray-400 mb-4">Try an example:</h3>
          <div className="grid gap-3">
            {EXAMPLE_PROMPTS.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example.prompt)}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors group"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-cyan-400 group-hover:text-cyan-300">
                  {example.icon}
                </div>
                <div>
                  <div className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                    {example.label}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {example.prompt}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-4 rounded-xl border ${
            result.success
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            )}
            <div className="flex-1">
              <div className={`font-medium ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                {result.success ? 'Generation Complete!' : 'Generation Failed'}
              </div>
              {result.success ? (
                <div className="mt-2 space-y-1 text-sm text-gray-400">
                  <div>Task ID: <code className="text-cyan-400">{result.taskId}</code></div>
                  <div>Status: <span className="text-yellow-400">{result.status}</span></div>
                  <div>Artifacts Generated: <span className="text-white">{result.artifactCount}</span></div>
                  {result.stages && (
                    <div className="mt-3">
                      <div className="font-medium text-gray-300 mb-2">Pipeline Stages:</div>
                      <div className="space-y-1">
                        {result.stages.map((stage, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {stage.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : stage.status === 'failed' ? (
                              <AlertCircle className="w-4 h-4 text-red-400" />
                            ) : (
                              <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                            )}
                            <span className="text-gray-300">{stage.name}</span>
                            {stage.duration && (
                              <span className="text-gray-500 text-xs">({stage.duration}ms)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2 text-sm text-red-300">
                  {result.error || 'An unexpected error occurred'}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
