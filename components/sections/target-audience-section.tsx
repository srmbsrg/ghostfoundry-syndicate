'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Rocket, Building2, TrendingUp, Users, Shield, Cog } from 'lucide-react';

const audiences = [
  {
    icon: Rocket,
    title: 'VC-Backed Startups',
    subtitle: '20-200 employees',
    description: 'Drowning in SaaS tools but lacking ops headcount? Syndicate becomes your invisible operations team—scaling with you from Series A to IPO.',
    benefits: ['Replace 3-5 ops hires', 'Instant scalability', 'Investor-ready reporting'],
    color: 'cyan',
  },
  {
    icon: Building2,
    title: 'Mature SMBs',
    subtitle: 'Heavy compliance needs',
    description: 'Fractional CFOs, RevOps teams, and MSPs trust Syndicate for audit-ready automation with human oversight baked in.',
    benefits: ['Compliance automation', 'Audit trail built-in', 'Multi-tenant ready'],
    color: 'purple',
  },
];

export default function TargetAudienceSection() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section className="py-24 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
      
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Built For <span className="gradient-text">Growth-Stage Companies</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Whether you're scaling fast or navigating complexity, Syndicate adapts to your reality.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="glass-card rounded-2xl p-8 hover:border-white/20 transition-all group"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${audience.color === 'cyan' ? 'from-cyan-500/30 to-cyan-500/10' : 'from-purple-500/30 to-purple-500/10'} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <audience.icon className={`w-8 h-8 ${audience.color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'}`} />
              </div>
              
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-white">{audience.title}</h3>
                <p className={`text-sm ${audience.color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'}`}>{audience.subtitle}</p>
              </div>
              
              <p className="text-gray-400 mb-6">{audience.description}</p>
              
              <ul className="space-y-2">
                {audience.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-gray-300">
                    <div className={`w-1.5 h-1.5 rounded-full ${audience.color === 'cyan' ? 'bg-cyan-400' : 'bg-purple-400'}`} />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
