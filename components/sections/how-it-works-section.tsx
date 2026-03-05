'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Plug, Scan, Bot, LineChart, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const steps = [
  {
    number: '01',
    icon: Plug,
    title: 'Connect Your Systems',
    description: 'Integrate with email, finance tools, CRM, support platforms, and more. One-click connectors for popular SaaS tools.',
  },
  {
    number: '02',
    icon: Scan,
    title: 'Syndicate Analyzes',
    description: 'Our AI scans your workflows, data patterns, and operational needs to understand your unique business context.',
  },
  {
    number: '03',
    icon: Bot,
    title: 'Agents Auto-Generate',
    description: 'Custom AI lieutenants spin up automatically—compliance officers, finance chiefs, support specialists, and more.',
  },
  {
    number: '04',
    icon: LineChart,
    title: 'Continuous Evolution',
    description: 'Agents learn, adapt, and multiply. New needs detected? New agents deployed. Your operations brain grows with you.',
  },
];

export default function HowItWorksSection() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section className="py-24 relative" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How the <span className="gradient-text">Syndicate</span> Works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From connection to continuous optimization in four seamless steps.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group flex gap-6 p-6 glass-card rounded-xl hover:border-cyan-500/30 transition-all"
              >
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-cyan-400">{step.number}</span>
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl" />
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
              <Image
                src="https://cdn.abacus.ai/images/2f1907a0-9c29-47fd-a43e-a99137c05e8e.png"
                alt="GhostFoundry-Syndicate dashboard showing AI agent cards"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
