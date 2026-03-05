'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Ghost, Home, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function InternalHeader() {
  const pathname = usePathname();
  const isGhostControl = pathname?.startsWith('/ghost-control');
  const isDarkFactory = pathname?.startsWith('/dark-factory');

  const title = isGhostControl ? 'Ghost Control' : isDarkFactory ? 'Dark Factory' : 'Internal';
  const Icon = isGhostControl ? Brain : Ghost;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/90 backdrop-blur-xl border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="w-8 h-8 text-cyan-400" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold gradient-text">{title}</h1>
              <p className="text-xs text-gray-500">GhostFoundry-Syndicate</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
