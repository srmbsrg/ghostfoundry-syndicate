'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://cdn.abacus.ai/images/673ad142-4674-43a5-adc4-cb1e7a02b1db.jpg"
          alt="Ethereal AI network visualization"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a]/80 via-[#0a0f1a]/60 to-[#0a0f1a]" />
      </div>
      
      {/* Animated gradient overlays */}
      <div className="absolute inset-0 hero-gradient z-0" />
      
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Tagline badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Full-stack operations brain that expands itself</span>
          </motion.div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            <span className="text-white">Let the Syndicate </span>
            <span className="gradient-text">clone your best operators</span>
            <span className="text-white">—and then invent the ones you forgot you needed.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            GhostFoundry-Syndicate is your AI control center that auto-generates custom agents 
            for every workflow. Connect your systems, and watch intelligent lieutenants emerge 
            for each department—continuously learning, adapting, and expanding.
          </p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#design-partner"
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-purple-500 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center gap-2"
            >
              Join Design Partner Program
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/roi-calculator"
              className="px-8 py-4 glass-card text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
            >
              Calculate Your ROI
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8"
          >
            <div className="flex items-center gap-2 text-gray-400">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-sm">Auto-generates AI agents</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Shield className="w-5 h-5 text-purple-400" />
              <span className="text-sm">Compliance-grade transparency</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="text-sm">Continuous learning</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
