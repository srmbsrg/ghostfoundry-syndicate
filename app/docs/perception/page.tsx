'use client';

import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { motion } from 'framer-motion';
import { Eye, FileText, Mail, AlertTriangle, Radio, Zap, Search, Shield } from 'lucide-react';
import Link from 'next/link';

export default function PerceptionDocs() {
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
                <Eye className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-4xl font-bold text-white">Perception System</h1>
            </div>
            <p className="text-xl text-gray-400">
              The Ghost's senses - understanding documents, analyzing emails, detecting anomalies,
              and monitoring external signals.
            </p>
          </motion.div>

          {/* Components */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <div className="glass-card p-6 rounded-2xl">
              <FileText className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Document Processing</h3>
              <p className="text-gray-400 text-sm mb-4">
                Intelligent extraction from invoices, contracts, reports. No templates needed.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Entity extraction (people, companies, amounts)</li>
                <li>• Key phrase identification</li>
                <li>• Sentiment and urgency detection</li>
                <li>• Action item extraction</li>
              </ul>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <Mail className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Email Analysis</h3>
              <p className="text-gray-400 text-sm mb-4">
                Understands intent, extracts actions, suggests replies.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Intent classification (request, question, complaint)</li>
                <li>• Priority scoring</li>
                <li>• Action item extraction</li>
                <li>• Smart reply drafts</li>
              </ul>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Anomaly Detection</h3>
              <p className="text-gray-400 text-sm mb-4">
                Spots unusual patterns in metrics before they become problems.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Statistical outlier detection</li>
                <li>• Trend change alerts</li>
                <li>• Threshold monitoring</li>
                <li>• Root cause suggestions</li>
              </ul>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <Radio className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Signal Intelligence</h3>
              <p className="text-gray-400 text-sm mb-4">
                Monitors market, competitor, and industry signals.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Relevance scoring</li>
                <li>• Opportunity/threat classification</li>
                <li>• Intelligence briefing generation</li>
                <li>• Action recommendations</li>
              </ul>
            </div>
          </motion.section>

          {/* Usage Examples */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 rounded-2xl mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Zap className="w-6 h-6 text-green-400" />
              Usage Examples
            </h2>

            <div className="space-y-6">
              <div className="border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Process an Invoice</h3>
                <div className="bg-gray-900/50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre className="text-green-400">{`const result = await perception.processInvoice(invoiceText);

// Returns:
// - Invoice number, vendor, amounts
// - Due date, line items
// - Extracted entities
// - Auto-stored in memory`}</pre>
                </div>
              </div>

              <div className="border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">Analyze Email</h3>
                <div className="bg-gray-900/50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre className="text-green-400">{`const email = await perception.analyzeEmail({
  from: 'client@example.com',
  to: ['team@company.com'],
  subject: 'Urgent: Contract Review',
  body: emailBody
});

// Returns: intent, priority, action items, reply draft`}</pre>
                </div>
              </div>

              <div className="border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Record Metric & Detect Anomalies</h3>
                <div className="bg-gray-900/50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre className="text-green-400">{`// Record metric (auto-detects anomalies)
const anomaly = await perception.recordMetric(
  'daily_revenue',
  15000
);

if (anomaly) {
  console.log('Anomaly detected:', anomaly.description);
  console.log('Suggested actions:', anomaly.analysis.suggestedActions);
}`}</pre>
                </div>
              </div>
            </div>
          </motion.section>

          {/* API Reference */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8 rounded-2xl mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Search className="w-6 h-6 text-cyan-400" />
              API Reference
            </h2>

            <div className="space-y-4">
              <div className="border border-white/10 rounded-lg p-4">
                <code className="text-cyan-400">POST /api/gfs/perception</code>
                <p className="text-gray-400 text-sm mt-2">Process various perception types</p>
                <div className="text-xs text-gray-500 mt-2">
                  Types: document, invoice, contract, email, emails, metric, signal, signals
                </div>
              </div>

              <div className="border border-white/10 rounded-lg p-4">
                <code className="text-cyan-400">GET /api/gfs/perception?action=anomalies</code>
                <p className="text-gray-400 text-sm mt-2">Get recent anomalies</p>
              </div>

              <div className="border border-white/10 rounded-lg p-4">
                <code className="text-cyan-400">GET /api/gfs/perception?action=metric_history&metric=revenue</code>
                <p className="text-gray-400 text-sm mt-2">Get metric history for analysis</p>
              </div>
            </div>
          </motion.section>

          {/* Integration */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-8 rounded-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-purple-400" />
              System Integration
            </h2>
            <p className="text-gray-400 mb-6">
              All perceptions automatically integrate with other GFS systems:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 p-4 rounded-xl text-center">
                <div className="text-2xl mb-2">🧠</div>
                <div className="text-white font-semibold">Memory</div>
                <div className="text-xs text-gray-400">All perceptions stored as memories</div>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-xl text-center">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-white font-semibold">Event Bus</div>
                <div className="text-xs text-gray-400">Significant events published</div>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-xl text-center">
                <div className="text-2xl mb-2">🔄</div>
                <div className="text-white font-semibold">Workflows</div>
                <div className="text-xs text-gray-400">Can trigger automated workflows</div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
