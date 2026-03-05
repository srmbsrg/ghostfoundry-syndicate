'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { XCircle, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';

const comparisonData = [
  {
    category: 'Implementation',
    erp: {
      value: '6-18 months',
      description: 'Lengthy discovery, configuration, data migration, testing, training',
      isNegative: true
    },
    syndicate: {
      value: '3 weeks',
      description: 'Connect systems, auto-analyze, agents spin up and start learning',
      isNegative: false
    }
  },
  {
    category: 'Setup Cost',
    erp: {
      value: '$100K - $1M+',
      description: 'Consultants, licenses, customization, training, ongoing support',
      isNegative: true
    },
    syndicate: {
      value: '90% Less',
      description: 'No implementation consultants, no complex configuration needed',
      isNegative: false
    }
  },
  {
    category: 'Adaptability',
    erp: {
      value: 'Rigid',
      description: 'Business changes = expensive reconfiguration projects',
      isNegative: true
    },
    syndicate: {
      value: 'Self-Adapting',
      description: 'Automatically learns new workflows, policies, and terminology',
      isNegative: false
    }
  },
  {
    category: 'AI Capabilities',
    erp: {
      value: 'Bolted-On',
      description: 'AI features added as afterthoughts, limited integration',
      isNegative: true
    },
    syndicate: {
      value: 'AI-Native',
      description: 'Built from the ground up as an intelligent, learning system',
      isNegative: false
    }
  },
  {
    category: 'User Experience',
    erp: {
      value: 'Train Your Team',
      description: 'Weeks of training to use complex interfaces',
      isNegative: true
    },
    syndicate: {
      value: 'System Learns You',
      description: 'Adapts to your terminology, tone, and workflows automatically',
      isNegative: false
    }
  },
  {
    category: 'Proactive Intelligence',
    erp: {
      value: 'Reactive Dashboards',
      description: 'You query the system, hope you asked the right question',
      isNegative: true
    },
    syndicate: {
      value: 'Proactive Briefs',
      description: 'Surfaces insights, anomalies, and fixes before you ask',
      isNegative: false
    }
  },
  {
    category: 'Scaling',
    erp: {
      value: 'More Licenses',
      description: 'Growth = more seats, more modules, more cost',
      isNegative: true
    },
    syndicate: {
      value: 'Auto-Expand',
      description: 'New agents spin up automatically as your business grows',
      isNegative: false
    }
  },
  {
    category: 'Vendor Lock-in',
    erp: {
      value: 'High',
      description: 'Massive switching costs after years of customization',
      isNegative: true
    },
    syndicate: {
      value: 'Low',
      description: 'Your data stays yours, integrates with existing tools',
      isNegative: false
    }
  }
];

export function VsErpComparison() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="comparison" className="py-20 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">The </span>
            <span className="gradient-text">Complete Comparison</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            See how GhostFoundry-Syndicate stacks up against traditional ERP systems
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/10 bg-white/5">
            <div className="font-semibold text-gray-400">Category</div>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                Traditional ERP
              </span>
            </div>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 font-semibold">
                <Sparkles className="w-4 h-4" />
                GhostFoundry-Syndicate
              </span>
            </div>
          </div>

          {/* Rows */}
          {comparisonData.map((row, index) => (
            <motion.div
              key={row.category}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className={`grid grid-cols-3 gap-4 p-6 ${index !== comparisonData.length - 1 ? 'border-b border-white/10' : ''} hover:bg-white/5 transition-colors`}
            >
              <div className="font-semibold text-white flex items-center">
                {row.category}
              </div>
              
              {/* ERP Column */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="font-bold text-red-400">{row.erp.value}</span>
                </div>
                <p className="text-sm text-gray-500">{row.erp.description}</p>
              </div>
              
              {/* Syndicate Column */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-cyan-400">{row.syndicate.value}</span>
                </div>
                <p className="text-sm text-gray-400">{row.syndicate.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
