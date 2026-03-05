'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Ghost, Menu, X, Calculator, Home, Swords, Newspaper, FolderOpen, Book, Brain } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0a0f1a]/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Ghost className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <div className="absolute inset-0 bg-cyan-400/30 blur-lg group-hover:blur-xl transition-all" />
            </div>
            <span className="text-xl font-bold text-white">
              GhostFoundry<span className="text-cyan-400">-Syndicate</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/vs-erp"
              className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
            >
              <Swords className="w-4 h-4" />
              vs ERP
            </Link>
            <Link
              href="/roi-calculator"
              className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
            >
              <Calculator className="w-4 h-4" />
              ROI Calculator
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
            >
              <Newspaper className="w-4 h-4" />
              Blog
            </Link>
            <Link
              href="/press-kit"
              className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              Press Kit
            </Link>
            <Link
              href="/docs"
              className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
            >
              <Book className="w-4 h-4" />
              Docs
            </Link>
            <Link
              href="/ghost-control"
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Brain className="w-4 h-4" />
              Control
            </Link>
            <a
              href="#design-partner"
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-purple-500 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
            >
              Join Design Partners
            </a>
          </nav>

          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 pb-4 flex flex-col gap-4"
          >
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/vs-erp"
              className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Swords className="w-4 h-4" />
              vs ERP
            </Link>
            <Link
              href="/roi-calculator"
              className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Calculator className="w-4 h-4" />
              ROI Calculator
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Newspaper className="w-4 h-4" />
              Blog
            </Link>
            <Link
              href="/press-kit"
              className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FolderOpen className="w-4 h-4" />
              Press Kit
            </Link>
            <Link
              href="/docs"
              className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Book className="w-4 h-4" />
              Docs
            </Link>
            <Link
              href="/ghost-control"
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Brain className="w-4 h-4" />
              Ghost Control
            </Link>
            <a
              href="#design-partner"
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Join Design Partners
            </a>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
}
