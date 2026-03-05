'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Shield, FileCheck, Users, Eye, Lock, History, Activity } from 'lucide-react';
import Image from 'next/image';

const complianceFeatures = [
  {
    icon: FileCheck,
    title: 'Complete Audit Trails',
    description: 'Every AI decision logged with full context, reasoning, and outcomes.',
  },
  {
    icon: Eye,
    title: 'Explainable AI',
    description: 'Understand exactly why each agent made its decision—no black boxes.',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Granular RBAC controls ensure the right people see the right data.',
  },
  {
    icon: Lock,
    title: 'Bias Checks',
    description: 'Built-in monitoring for fairness and consistency in AI outputs.',
  },
  {
    icon: History,
    title: 'Human Override',
    description: 'One-click human takeover on any AI decision, anytime.',
  },
  {
    icon: Shield,
    title: 'Guardrails Built-In',
    description: 'Safety boundaries that adapt to your industry requirements.',
  },
  {
    icon: Activity,
    title: 'Heartbeat',
    description: 'Continuous pulse monitoring—if it stops, we know before you do.',
  },
];

export default function ComplianceSection() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section className="py-24 relative" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl" />
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10">
              <Image
                src="https://cdn.abacus.ai/images/8ab01774-62ef-4ffe-8d74-51eb9861b345.jpg"
                alt="AI agents connecting securely to business systems"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Enterprise-Grade <span className="gradient-text">Compliance</span>
            </h2>
            <p className="text-gray-400 mb-10">
              Powerful AI automation without sacrificing control. Every guardrail you need, 
              built in from day one—so you can move fast without breaking trust.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {complianceFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                  className="flex gap-3 p-4 glass-card rounded-xl"
                >
                  <feature.icon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-medium text-sm">{feature.title}</h4>
                    <p className="text-gray-500 text-xs mt-1">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sentinel Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-8 p-5 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-cyan-900/20"
            >
              <p className="text-center text-lg font-medium">
                <span className="text-purple-400">The Sentinel is now watching.</span>{' '}
                <span className="text-cyan-400">The Ghost remembers.</span>{' '}
                <span className="text-white">And it knows who you are.</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
