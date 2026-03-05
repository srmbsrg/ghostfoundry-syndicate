// Documentation Hub
import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { Factory, Ghost, Book, Cpu, Shield, Zap, ArrowRight, FileCode, TestTube, Settings, Brain, Eye, GitBranch } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documentation | GhostFoundry-Syndicate',
  description: 'Complete documentation for Dark Factory and GFS systems',
};

const docs = [
  {
    title: 'Dark Factory',
    description: 'The self-building software factory that generates code from natural language specs',
    href: '/docs/dark-factory',
    icon: Factory,
    color: 'from-purple-500 to-pink-500',
    sections: [
      { name: 'Spec Format', icon: FileCode },
      { name: 'Testing Scenarios', icon: TestTube },
      { name: 'Deployment', icon: Zap },
    ],
  },
  {
    title: 'GFS (Ghost Foundry System)',
    description: 'The nervous system - agents, workflows, self-modification, and operational consciousness',
    href: '/docs/gfs',
    icon: Ghost,
    color: 'from-cyan-500 to-blue-500',
    sections: [
      { name: 'Setup Guide', icon: Settings },
      { name: 'Event Bus', icon: GitBranch },
      { name: 'Self-Mod Engine', icon: Brain },
      { name: 'Observer', icon: Eye },
    ],
  },
  {
    title: 'Memory System',
    description: 'Persistent mind - episodic experiences, semantic knowledge, and learning consolidation',
    href: '/docs/memory',
    icon: Brain,
    color: 'from-yellow-500 to-orange-500',
    sections: [
      { name: 'Episodic Store', icon: Book },
      { name: 'Semantic Store', icon: Cpu },
      { name: 'Consolidation', icon: Zap },
    ],
  },
  {
    title: 'Perception System',
    description: 'The Ghost\'s senses - document understanding, email analysis, anomaly detection',
    href: '/docs/perception',
    icon: Eye,
    color: 'from-green-500 to-teal-500',
    sections: [
      { name: 'Document Processing', icon: FileCode },
      { name: 'Email Analysis', icon: Settings },
      { name: 'Anomaly Detection', icon: Shield },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Book className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-300">Documentation</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              System <span className="gradient-text">Documentation</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Complete guides for building with the Dark Factory and operating the Ghost Foundry System
            </p>
          </div>

          {/* Doc Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {docs.map((doc) => (
              <Link key={doc.title} href={doc.href}>
                <div className="glass-card p-8 rounded-2xl h-full hover:border-cyan-500/50 transition-all group">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${doc.color} flex items-center justify-center mb-6`}>
                    <doc.icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                    {doc.title}
                  </h2>
                  <p className="text-gray-400 mb-6">{doc.description}</p>
                  <div className="space-y-2">
                    {doc.sections.map((section) => (
                      <div key={section.name} className="flex items-center gap-2 text-sm text-gray-500">
                        <section.icon className="w-4 h-4" />
                        <span>{section.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-cyan-400 group-hover:gap-3 transition-all">
                    <span>Read Documentation</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Links */}
          <div className="glass-card p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Quick Reference</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/docs/dark-factory#spec-format" className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <FileCode className="w-5 h-5 text-purple-400 mb-2" />
                <div className="text-white font-medium">Spec Format</div>
                <div className="text-sm text-gray-500">How to write generation specs</div>
              </Link>
              <Link href="/docs/dark-factory#testing" className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <TestTube className="w-5 h-5 text-green-400 mb-2" />
                <div className="text-white font-medium">Testing Guide</div>
                <div className="text-sm text-gray-500">Add external test scenarios</div>
              </Link>
              <Link href="/docs/gfs#setup" className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <Settings className="w-5 h-5 text-cyan-400 mb-2" />
                <div className="text-white font-medium">GFS Setup</div>
                <div className="text-sm text-gray-500">Initialize the nervous system</div>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
