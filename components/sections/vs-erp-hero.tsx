'use client';

import { motion } from 'framer-motion';
import { ArrowRight, XCircle, CheckCircle, Zap, Clock, DollarSign, Brain } from 'lucide-react';
import Link from 'next/link';

export function VsErpHero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0f1a]/50 to-[#0a0f1a]" />
      
      {/* Animated grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium mb-6">
            ⚠️ Why Legacy ERPs Are Holding You Back
          </span>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="text-white">Stop Configuring.</span>
            <br />
            <span className="gradient-text">Start Commanding.</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            Traditional ERPs were built for a world where software couldn't learn. 
            GhostFoundry-Syndicate is the AI-native operations brain that adapts to YOU.
          </p>

          {/* Quick comparison badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span className="text-sm"><strong className="text-white">3 weeks</strong> <span className="text-gray-400">vs 18 months</span></span>
            </div>
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-sm"><strong className="text-white">90% less</strong> <span className="text-gray-400">implementation cost</span></span>
            </div>
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-sm"><strong className="text-white">Self-adapting</strong> <span className="text-gray-400">vs rigid config</span></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/roi-calculator?compare=erp" className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              Calculate Your Savings
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#comparison" className="px-8 py-4 glass-card font-semibold text-white hover:bg-white/10 transition-colors">
              See Full Comparison
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
