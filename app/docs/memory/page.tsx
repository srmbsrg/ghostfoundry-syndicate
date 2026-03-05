'use client';

import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { motion } from 'framer-motion';
import { Brain, Database, Lightbulb, Network, Zap, RefreshCw, Search, Shield } from 'lucide-react';
import Link from 'next/link';

export default function MemoryDocs() {
  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Link 
              href="/docs"
              className="text-cyan-400 hover:text-cyan-300 text-sm mb-4 inline-block"
            >
              ← Back to Docs
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl">
                <Brain className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-4xl font-bold text-white">Memory System</h1>
            </div>
            <p className="text-xl text-gray-400">
              The Ghost's persistent mind - episodic experiences, semantic knowledge, and the
              consolidation process that transforms experience into wisdom.
            </p>
          </motion.div>

          {/* Architecture */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 rounded-2xl mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Network className="w-6 h-6 text-purple-400" />
              Architecture
            </h2>
            <div className="bg-gray-900/50 p-6 rounded-xl font-mono text-sm overflow-x-auto">
              <pre className="text-gray-300">{`
┌─────────────────────────────────────────────────────┐
│                    MEMORY SYSTEM                    │
├─────────────────┬─────────────────┬─────────────────┤
│  EPISODIC STORE  │  SEMANTIC STORE │   PROCEDURAL   │
│  (experiences)   │  (facts)        │   (skills)     │
├─────────────────┴─────────────────┴─────────────────┤
│                 CONSOLIDATION                       │
│    Episodes  ───>  Patterns  ───>  Knowledge        │
├─────────────────────────────────────────────────────┤
│                  RETRIEVAL                          │
│    Query  ───>  Embedding  ───>  Ranked Results    │
└─────────────────────────────────────────────────────┘
              `}</pre>
            </div>
          </motion.section>

          {/* Memory Types */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 rounded-2xl mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Database className="w-6 h-6 text-cyan-400" />
              Memory Types
            </h2>
            
            <div className="space-y-6">
              <div className="border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Episodic Memory</h3>
                <p className="text-gray-400 mb-4">
                  Specific experiences and events. "Last time we processed an invoice from Acme Corp,
                  field X was missing."
                </p>
                <div className="bg-gray-900/50 p-4 rounded-lg font-mono text-sm">
                  <code className="text-green-400">{`await memory.remember({
  what: 'Processed invoice from Acme Corp',
  outcome: 'Success - amount $5,432',
  entities: [{ type: 'company', name: 'Acme Corp' }]
});`}</code>
                </div>
              </div>

              <div className="border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Semantic Memory</h3>
                <p className="text-gray-400 mb-4">
                  Learned facts and patterns. "Acme Corp invoices always use format X."
                </p>
                <div className="bg-gray-900/50 p-4 rounded-lg font-mono text-sm">
                  <code className="text-green-400">{`await memory.learn({
  fact: 'Acme Corp invoices always include PO number in header',
  category: 'process',
  confidence: 0.95
});`}</code>
                </div>
              </div>

              <div className="border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Procedural Memory</h3>
                <p className="text-gray-400 mb-4">
                  Learned procedures and skills. "How to process an invoice from Acme Corp."
                </p>
              </div>
            </div>
          </motion.section>

          {/* Consolidation */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8 rounded-2xl mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
              Memory Consolidation
            </h2>
            <p className="text-gray-400 mb-6">
              The system automatically consolidates episodic memories into semantic knowledge.
              When enough similar experiences occur, patterns are extracted and stored as facts.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 p-4 rounded-xl text-center">
                <div className="text-4xl mb-2">3+</div>
                <div className="text-sm text-gray-400">Similar Episodes</div>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-xl text-center">
                <div className="text-4xl mb-2">→</div>
                <div className="text-sm text-gray-400">Pattern Detected</div>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-xl text-center">
                <div className="text-4xl mb-2">🧠</div>
                <div className="text-sm text-gray-400">New Knowledge</div>
              </div>
            </div>
          </motion.section>

          {/* API Reference */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-8 rounded-2xl mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Zap className="w-6 h-6 text-green-400" />
              API Reference
            </h2>

            <div className="space-y-4">
              <div className="border border-white/10 rounded-lg p-4">
                <code className="text-cyan-400">POST /api/gfs/memory</code>
                <p className="text-gray-400 text-sm mt-2">Record or learn memories</p>
                <div className="text-xs text-gray-500 mt-2">
                  Actions: remember, learn, consolidate, reinforce, contradict
                </div>
              </div>

              <div className="border border-white/10 rounded-lg p-4">
                <code className="text-cyan-400">GET /api/gfs/memory</code>
                <p className="text-gray-400 text-sm mt-2">Search and recall memories</p>
                <div className="text-xs text-gray-500 mt-2">
                  Params: query, entity, type, limit, action (stats, recent, facts, context)
                </div>
              </div>

              <div className="border border-white/10 rounded-lg p-4">
                <code className="text-cyan-400">GET /api/gfs/memory/[id]</code>
                <p className="text-gray-400 text-sm mt-2">Get specific memory or associations</p>
                <div className="text-xs text-gray-500 mt-2">
                  Actions: similar, associations
                </div>
              </div>
            </div>
          </motion.section>

          {/* Key Features */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-8 rounded-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-cyan-400" />
              Key Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Search, title: 'Vector Search', desc: 'Semantic similarity for intelligent recall' },
                { icon: RefreshCw, title: 'Auto-Consolidation', desc: 'Episodes become knowledge automatically' },
                { icon: Network, title: 'Associative Links', desc: 'Memories connected in a knowledge graph' },
                { icon: Brain, title: 'Context Building', desc: 'LLM-ready context from memories' }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-gray-900/30 rounded-xl">
                  <feature.icon className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">{feature.title}</h4>
                    <p className="text-sm text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
