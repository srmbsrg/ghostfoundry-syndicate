'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Sparkles, Zap, Bot, RefreshCw, Shield, LineChart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const solutions = [
  {
    icon: Zap,
    title: 'Deploy in Weeks, Not Years',
    description: 'Connect your existing systems. Syndicate maps your workflows automatically and spins up agents in days.',
    color: 'cyan'
  },
  {
    icon: Bot,
    title: 'AI That Actually Works For You',
    description: 'Not bolted-on features. AI agents that understand your business, speak your language, and take action.',
    color: 'purple'
  },
  {
    icon: RefreshCw,
    title: 'Evolves With Your Business',
    description: 'New department? New workflow? New compliance requirement? Syndicate adapts automatically.',
    color: 'cyan'
  },
  {
    icon: Shield,
    title: 'Enterprise Control, Startup Speed',
    description: 'Full audit trails, RBAC, and compliance—without the bureaucracy that slows you down.',
    color: 'purple'
  },
  {
    icon: LineChart,
    title: 'Proactive, Not Reactive',
    description: 'Weekly Syndicate Briefs surface insights and fixes before problems become crises.',
    color: 'cyan'
  },
  {
    icon: Sparkles,
    title: 'No Consultant Required',
    description: 'The system configures itself. Add new agents, workflows, and integrations without outside help.',
    color: 'purple'
  }
];

export function VsErpSolution() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-20 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 inline mr-2" />
            The Post-ERP Era
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">There's a </span>
            <span className="gradient-text">Better Way</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            GhostFoundry-Syndicate delivers everything ERPs promised—without the pain
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 hover:border-cyan-500/40 transition-colors group"
            >
              <div className={`p-3 rounded-lg ${solution.color === 'cyan' ? 'bg-cyan-500/20' : 'bg-purple-500/20'} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                <solution.icon className={`w-6 h-6 ${solution.color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'}`} />
              </div>
              <h3 className="font-semibold text-white mb-2">{solution.title}</h3>
              <p className="text-gray-400 text-sm">{solution.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Link 
            href="/#design-partner"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Join the Post-ERP Revolution
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
