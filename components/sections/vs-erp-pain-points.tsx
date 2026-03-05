'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { AlertTriangle, Clock, DollarSign, Users, Wrench, Brain, TrendingDown } from 'lucide-react';

const painPoints = [
  {
    icon: Clock,
    title: '18-Month Implementation Hell',
    description: 'By the time your ERP goes live, your business has already changed. You\'re implementing yesterday\'s processes.',
    stat: '70%',
    statLabel: 'of ERP projects exceed timeline'
  },
  {
    icon: DollarSign,
    title: 'Budget Black Hole',
    description: 'Initial quotes are just the beginning. Customization, training, integrations, and "unexpected requirements" multiply costs.',
    stat: '3x',
    statLabel: 'average cost overrun'
  },
  {
    icon: Users,
    title: 'User Adoption Nightmare',
    description: 'Your team didn\'t sign up to learn a new system. Resistance, workarounds, and shadow IT become the norm.',
    stat: '43%',
    statLabel: 'of users avoid the ERP'
  },
  {
    icon: Wrench,
    title: 'Consultant Dependency',
    description: 'Every change requires expensive consultants. Your operations become hostage to their availability and rates.',
    stat: '$150-400/hr',
    statLabel: 'typical consultant rate'
  },
  {
    icon: Brain,
    title: 'AI Afterthought',
    description: 'Legacy vendors bolt on "AI features" that don\'t actually learn your business. It\'s marketing, not intelligence.',
    stat: '12%',
    statLabel: 'actually use ERP "AI" features'
  },
  {
    icon: TrendingDown,
    title: 'Innovation Anchor',
    description: 'Once locked in, switching is nearly impossible. Your competitors move fast while you\'re stuck maintaining legacy.',
    stat: '7-10 yrs',
    statLabel: 'average ERP lifecycle'
  }
];

export function VsErpPainPoints() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-[#0a0f1a] to-[#1a1f35]" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium mb-6">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            The Hidden Costs of Legacy ERP
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Why Companies Are Abandoning Traditional ERPs
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The ERP promise of "one system to rule them all" has become a trap for growth companies
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {painPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 border-red-500/20 hover:border-red-500/40 transition-colors"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-red-500/20">
                  <point.icon className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{point.title}</h3>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">{point.description}</p>
              <div className="flex items-baseline gap-2 pt-4 border-t border-white/10">
                <span className="text-2xl font-bold text-red-400">{point.stat}</span>
                <span className="text-sm text-gray-500">{point.statLabel}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
