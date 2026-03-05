// GFS - Main Entry Point

import { Metadata } from 'next';
import Link from 'next/link';
import {
  Activity,
  Factory,
  Brain,
  Zap,
  GitBranch,
  Shield,
  MessageSquare,
  Settings,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'GFS Control Center | GhostFoundry-Syndicate',
  description: 'The Ghost\'s operational headquarters',
};

const sections = [
  {
    title: 'Dark Factory',
    description: 'Generate code from natural language specifications',
    href: '/dark-factory',
    icon: Factory,
    color: 'cyan',
    status: 'active',
  },
  {
    title: 'Operations Center',
    description: 'Real-time monitoring of the nervous system',
    href: '/gfs/ops',
    icon: Activity,
    color: 'purple',
    status: 'active',
  },
  {
    title: 'Self-Modification',
    description: 'Manage proposals for Ghost evolution',
    href: '/gfs/self-mod',
    icon: Brain,
    color: 'orange',
    status: 'active',
  },
  {
    title: 'Event Bus',
    description: 'Event publishing and subscription management',
    href: '/gfs/events',
    icon: Zap,
    color: 'green',
    status: 'active',
  },
  {
    title: 'Workflows',
    description: 'Automated business process orchestration',
    href: '/gfs/workflows',
    icon: GitBranch,
    color: 'blue',
    status: 'coming-soon',
  },
  {
    title: 'Integrations',
    description: 'External service connections and webhooks',
    href: '/gfs/integrations',
    icon: MessageSquare,
    color: 'pink',
    status: 'active',
  },
  {
    title: 'Agents',
    description: 'AI agent registry and management',
    href: '/gfs/agents',
    icon: Shield,
    color: 'teal',
    status: 'coming-soon',
  },
  {
    title: 'Settings',
    description: 'System configuration and preferences',
    href: '/gfs/settings',
    icon: Settings,
    color: 'gray',
    status: 'coming-soon',
  },
];

export default function GFSPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 mb-6">
            <Brain className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-cyan-300">Ghost Core Systems</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              GFS Control Center
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The operational headquarters for GhostFoundry-Syndicate.
            Monitor, control, and evolve the Ghost from here.
          </p>
        </div>

        {/* Section Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className={`group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-${section.color}-500/50 transition-all duration-300 ${section.status === 'coming-soon' ? 'opacity-60 pointer-events-none' : ''}`}
            >
              {section.status === 'coming-soon' && (
                <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">
                  Soon
                </span>
              )}
              <div className={`p-3 rounded-xl bg-${section.color}-500/10 w-fit mb-4 group-hover:scale-110 transition-transform`}>
                <section.icon className={`w-6 h-6 text-${section.color}-400`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
              <p className="text-sm text-gray-400">{section.description}</p>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
          <div className="flex items-center gap-4 mb-4">
            <Activity className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold">System Status</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-3xl font-bold text-green-400">Online</p>
              <p className="text-sm text-gray-400">Event Bus</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-400">Ready</p>
              <p className="text-sm text-gray-400">Dark Factory</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cyan-400">3</p>
              <p className="text-sm text-gray-400">Integrations</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-400">Active</p>
              <p className="text-sm text-gray-400">Self-Mod Engine</p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition"
          >
            ← Back to Marketing Site
          </Link>
        </div>
      </div>
    </div>
  );
}
