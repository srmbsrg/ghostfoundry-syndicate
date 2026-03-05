'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Bot, Brain, Shield, FileText, Sparkles, Zap, Eye, RefreshCw } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'Auto-Generated Department Agents',
    description: 'Syndicate automatically spins up specialized AI lieutenants for Email, Finance, Help Desk, Strategy, and more—each tuned specifically to your data and workflows.',
    color: 'cyan',
    gradient: 'from-cyan-500/20 to-cyan-500/5',
  },
  {
    icon: Brain,
    title: 'Continuous Learning & Customization',
    description: 'New policies, tone adjustments, or workflow changes are mapped and deployed automatically. The system evolves as your business mutates.',
    color: 'purple',
    gradient: 'from-purple-500/20 to-purple-500/5',
  },
  {
    icon: Shield,
    title: 'Compliance-Grade Transparency',
    description: 'Built-in audit trails, bias checks, and RBAC controls without slowing teams down. Every AI decision is explainable with human override always available.',
    color: 'cyan',
    gradient: 'from-cyan-500/20 to-cyan-500/5',
  },
  {
    icon: FileText,
    title: 'Weekly Syndicate Briefs',
    description: 'Automated intelligence reports blending market intel, operations health, and proactive fixes—delivered to stakeholders every week.',
    color: 'purple',
    gradient: 'from-purple-500/20 to-purple-500/5',
  },
];

export default function FeaturesSection() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section className="py-24 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
      
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Four Pillars of <span className="gradient-text">Intelligent Automation</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Every capability designed to transform how your business operates—automatically.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative glass-card rounded-2xl p-8 h-full hover:border-white/20 transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color === 'cyan' ? 'from-cyan-500/30 to-cyan-500/10' : 'from-purple-500/30 to-purple-500/10'} flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-7 h-7 ${feature.color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'}`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
