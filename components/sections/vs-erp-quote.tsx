'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Quote } from 'lucide-react';

export function VsErpQuote() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-20 px-6 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="glass-card p-10 text-center relative"
        >
          <Quote className="w-12 h-12 text-cyan-500/30 absolute top-6 left-6" />
          
          <blockquote className="text-2xl md:text-3xl font-medium text-white mb-8 leading-relaxed">
            "ERPs were built for a world where software couldn't learn. 
            <span className="gradient-text"> That world is over.</span> 
            The question isn't whether AI will run your operations—it's whether you'll lead or follow."
          </blockquote>
          
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              GF
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">GhostFoundry-Syndicate</p>
              <p className="text-gray-400 text-sm">The Post-ERP Operations Platform</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
