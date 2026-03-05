// GFS Documentation
import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { Ghost, ArrowLeft, Settings, GitBranch, Brain, Eye, Terminal, CheckCircle, AlertTriangle, Code, Zap, Shield, Bell, MessageSquare, Mail, Webhook, Play } from 'lucide-react';

export const metadata: Metadata = {
  title: 'GFS Documentation | GhostFoundry-Syndicate',
  description: 'Complete guide to the Ghost Foundry System - agents, workflows, self-modification, and operational consciousness',
};

export default function GFSDocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back Link */}
          <Link href="/docs" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Docs</span>
          </Link>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Ghost className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">GFS</h1>
            </div>
            <p className="text-xl text-gray-400">
              The Ghost Foundry System - the nervous system that enables operational consciousness, 
              self-modification, and autonomous operation.
            </p>
          </div>

          {/* Table of Contents */}
          <nav className="glass-card p-6 rounded-xl mb-12">
            <h2 className="text-lg font-semibold text-white mb-4">Contents</h2>
            <ul className="space-y-2">
              <li><a href="#overview" className="text-cyan-400 hover:underline">Overview</a></li>
              <li><a href="#setup" className="text-cyan-400 hover:underline">Setup Guide</a></li>
              <li><a href="#architecture" className="text-cyan-400 hover:underline">Architecture</a></li>
              <li><a href="#event-bus" className="text-cyan-400 hover:underline">Event Bus</a></li>
              <li><a href="#self-mod" className="text-cyan-400 hover:underline">Self-Modification Engine</a></li>
              <li><a href="#observer" className="text-cyan-400 hover:underline">Pattern Observer</a></li>
              <li><a href="#integrations" className="text-cyan-400 hover:underline">Integrations</a></li>
              <li><a href="#api-reference" className="text-cyan-400 hover:underline">API Reference</a></li>
            </ul>
          </nav>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            
            {/* Overview */}
            <section id="overview" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Ghost className="w-6 h-6 text-cyan-400" />
                Overview
              </h2>
              <div className="glass-card p-6 rounded-xl">
                <p className="text-gray-300 mb-4">
                  GFS is the "Ghost" - an operational consciousness layer that sits on top of your business systems. 
                  It consists of several interconnected components:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <GitBranch className="w-5 h-5 text-purple-400 mb-2" />
                    <h4 className="text-white font-medium">Event Bus</h4>
                    <p className="text-sm text-gray-500">Central nervous system for all events</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <Eye className="w-5 h-5 text-yellow-400 mb-2" />
                    <h4 className="text-white font-medium">Observer</h4>
                    <p className="text-sm text-gray-500">Pattern detection and analysis</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <Brain className="w-5 h-5 text-pink-400 mb-2" />
                    <h4 className="text-white font-medium">Self-Mod Engine</h4>
                    <p className="text-sm text-gray-500">Propose and execute self-improvements</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <Shield className="w-5 h-5 text-green-400 mb-2" />
                    <h4 className="text-white font-medium">Human Gates</h4>
                    <p className="text-sm text-gray-500">Approval checkpoints for safety</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Setup */}
            <section id="setup" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Settings className="w-6 h-6 text-green-400" />
                Setup Guide
              </h2>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Prerequisites</h3>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>PostgreSQL database (already configured via Prisma)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>LLM API access (for intent parsing and pattern analysis)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Optional: Telegram Bot token for notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Optional: Twilio credentials for SMS alerts</span>
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">1. Environment Variables</h3>
              <div className="bg-[#1a1f2e] rounded-lg overflow-hidden mb-6">
                <div className="flex items-center justify-between px-4 py-2 bg-[#252b3b] border-b border-white/10">
                  <span className="text-sm text-gray-400">.env</span>
                </div>
                <pre className="p-4 text-sm text-cyan-400 overflow-x-auto">
{`# Required
DATABASE_URL="postgresql://..."
ABACUSAI_API_KEY="your-api-key"  # For LLM

# Optional - Telegram
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_CHAT_ID="your-chat-id"

# Optional - Twilio
TWILIO_ACCOUNT_SID="your-sid"
TWILIO_AUTH_TOKEN="your-token"
TWILIO_PHONE_NUMBER="+1234567890"`}</pre>
              </div>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">2. Database Migration</h3>
              <div className="bg-[#1a1f2e] rounded-lg p-4 mb-6">
                <pre className="text-sm text-cyan-400">
{`cd nextjs_space
yarn prisma migrate dev --name gfs_setup
yarn prisma generate`}</pre>
              </div>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">3. Initialize the System</h3>
              <div className="bg-[#1a1f2e] rounded-lg p-4 mb-6">
                <pre className="text-sm text-cyan-400">
{`# Start the Observer (pattern detection)
curl -X POST http://localhost:3000/api/gfs/observer \\
  -H "Content-Type: application/json" \\
  -d '{"action": "start", "intervalMinutes": 15}'

# Verify status
curl http://localhost:3000/api/gfs/observer`}</pre>
              </div>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">4. Test the Connection</h3>
              <div className="bg-[#1a1f2e] rounded-lg p-4">
                <pre className="text-sm text-cyan-400">
{`# Publish a test event
curl -X POST http://localhost:3000/api/gfs/events \\
  -H "Content-Type: application/json" \\
  -d '{
    "source": "system",
    "type": "gfs.system.initialized",
    "payload": {"version": "1.0"}
  }'

# Expected: {"success": true, "eventId": "uuid"}`}</pre>
              </div>
            </section>

            {/* Architecture */}
            <section id="architecture" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-400" />
                Architecture
              </h2>

              <div className="glass-card p-6 rounded-xl mb-6">
                <pre className="text-sm text-gray-400 overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                    GFS - Ghost Foundry System                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────┐        │
│  │  EVENT BUS   │─────│  OBSERVER   │─────│   SELF-MOD      │        │
│  │  (Pub/Sub)   │     │  (Patterns) │     │   ENGINE        │        │
│  └──────┬──────┘     └──────┬──────┘     └────────┬────────┘        │
│         │                   │                      │                 │
│         └─────────┬─────────┴──────────────────┘                 │
│                   │                                              │
│         ┌─────────┴─────────┐                                      │
│         │   HUMAN GATES     │                                      │
│         │   (Approvals)     │                                      │
│         └─────────┬─────────┘                                      │
│                   │                                              │
│  ┌─────────────┐  │  ┌─────────────┐   ┌─────────────┐         │
│  │  TELEGRAM   │  │  │   TWILIO    │   │   EMAIL     │         │
│  └─────────────┘  │  └─────────────┘   └─────────────┘         │
│         └─────────┴─────────┴──────────────────┘                 │
│                  INTEGRATIONS                                    │
└─────────────────────────────────────────────────────────────────┘`}</pre>
              </div>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Data Flow</h3>
              <ol className="space-y-3 text-gray-300">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/30 text-cyan-400 flex items-center justify-center text-sm flex-shrink-0">1</span>
                  <span><strong>Events</strong> are published to the Event Bus from any source</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/30 text-cyan-400 flex items-center justify-center text-sm flex-shrink-0">2</span>
                  <span><strong>Observer</strong> analyzes event patterns periodically</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/30 text-cyan-400 flex items-center justify-center text-sm flex-shrink-0">3</span>
                  <span><strong>Self-Mod Engine</strong> proposes improvements based on patterns</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/30 text-cyan-400 flex items-center justify-center text-sm flex-shrink-0">4</span>
                  <span><strong>Human Gates</strong> require approval for high-risk changes</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/30 text-cyan-400 flex items-center justify-center text-sm flex-shrink-0">5</span>
                  <span><strong>Integrations</strong> send notifications for alerts and approvals</span>
                </li>
              </ol>
            </section>

            {/* Event Bus */}
            <section id="event-bus" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <GitBranch className="w-6 h-6 text-purple-400" />
                Event Bus
              </h2>

              <p className="text-gray-300 mb-6">
                The Event Bus is the central nervous system. All events flow through it, enabling 
                loose coupling between components.
              </p>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Event Structure</h3>
              <div className="bg-[#1a1f2e] rounded-lg p-4 mb-6">
                <pre className="text-sm text-cyan-400">
{`interface Event {
  id: string;           // Auto-generated UUID
  source: string;       // e.g., "system", "agent", "user", "webhook"
  type: string;         // e.g., "gfs.workflow.started"
  payload: object;      // Event-specific data
  timestamp: Date;      // Auto-generated
  priority: string;     // "low" | "normal" | "high" | "critical"
  correlationId?: string; // Links related events
  causationId?: string;   // What caused this event
}`}</pre>
              </div>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Standard Event Types</h3>
              <div className="space-y-3">
                <div className="bg-white/5 p-4 rounded-lg">
                  <code className="text-cyan-400">gfs.system.initialized</code>
                  <p className="text-sm text-gray-500 mt-1">System startup event</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <code className="text-cyan-400">gfs.workflow.started | .completed | .failed</code>
                  <p className="text-sm text-gray-500 mt-1">Workflow lifecycle events</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <code className="text-cyan-400">gfs.agent.task_completed | .needs_human_input</code>
                  <p className="text-sm text-gray-500 mt-1">Agent activity events</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <code className="text-cyan-400">dark_factory.artifact.deployed</code>
                  <p className="text-sm text-gray-500 mt-1">Code deployment events</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <code className="text-cyan-400">gfs.self_mod.proposed | .approved | .executed</code>
                  <p className="text-sm text-gray-500 mt-1">Self-modification lifecycle</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Publishing Events</h3>
              <div className="bg-[#1a1f2e] rounded-lg p-4">
                <pre className="text-sm text-cyan-400">
{`// Via API
curl -X POST http://localhost:3000/api/gfs/events \\
  -H "Content-Type: application/json" \\
  -d '{
    "source": "my_integration",
    "type": "custom.event.name",
    "payload": {
      "key": "value",
      "data": {...}
    },
    "priority": "high"
  }'

// Via Code
import { EventBus } from '@/lib/gfs/event-bus';

await EventBus.emit('my_integration', 'custom.event.name', {
  key: 'value',
  data: {...}
});`}</pre>
              </div>
            </section>

            {/* Self-Mod Engine */}
            <section id="self-mod" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Brain className="w-6 h-6 text-pink-400" />
                Self-Modification Engine
              </h2>

              <p className="text-gray-300 mb-6">
                The Self-Mod Engine enables the Ghost to propose and execute changes to itself. 
                All modifications go through a safety-gated approval process.
              </p>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Proposal Types</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                  <h4 className="text-green-400 font-medium">fix_bug (Low Risk)</h4>
                  <p className="text-sm text-gray-400 mt-1">Auto-approved, 0 human approvals</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                  <h4 className="text-yellow-400 font-medium">extend_api (Medium Risk)</h4>
                  <p className="text-sm text-gray-400 mt-1">1 human approval required</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg">
                  <h4 className="text-orange-400 font-medium">new_capability (High Risk)</h4>
                  <p className="text-sm text-gray-400 mt-1">2 human approvals required</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                  <h4 className="text-red-400 font-medium">update_schema (Critical Risk)</h4>
                  <p className="text-sm text-gray-400 mt-1">3 human approvals required</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Creating a Proposal</h3>
              <div className="bg-[#1a1f2e] rounded-lg p-4 mb-6">
                <pre className="text-sm text-cyan-400">
{`curl -X POST http://localhost:3000/api/gfs/self-mod/propose \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "extend_api",
    "title": "Add batch processing endpoint",
    "description": "Enable processing multiple items in a single API call",
    "specification": "Create POST /api/batch with array input and parallel processing"
  }'

// Response
{
  "success": true,
  "proposal": {
    "id": "uuid",
    "status": "pending_approval",  // or "approved" for low-risk
    "riskLevel": "medium",
    "requiredApprovals": 1,
    "currentApprovals": 0,
    "gateId": "uuid"  // Human gate for approval
  }
}`}</pre>
              </div>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Approving Proposals</h3>
              <div className="bg-[#1a1f2e] rounded-lg p-4 mb-6">
                <pre className="text-sm text-cyan-400">
{`curl -X POST http://localhost:3000/api/gfs/self-mod/approve \\
  -H "Content-Type: application/json" \\
  -d '{
    "proposalId": "uuid",
    "decision": "approve",  // or "reject"
    "notes": "Looks good, proceed"
  }'`}</pre>
              </div>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Risk Detection</h3>
              <p className="text-gray-400 mb-4">The engine automatically escalates risk for:</p>
              <ul className="space-y-2 text-gray-300">
                <li>• <strong>Destructive keywords:</strong> DELETE, DROP, TRUNCATE, REMOVE</li>
                <li>• <strong>Schema changes:</strong> Any modification to database structure</li>
                <li>• <strong>Auth/security changes:</strong> Modifications affecting authentication</li>
                <li>• <strong>Payment/financial:</strong> Changes to billing or payment flows</li>
              </ul>
            </section>

            {/* Observer */}
            <section id="observer" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Eye className="w-6 h-6 text-yellow-400" />
                Pattern Observer
              </h2>

              <p className="text-gray-300 mb-6">
                The Observer watches the event stream, detects patterns, and recommends actions. 
                It's the "eye" that gives the Ghost awareness.
              </p>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Pattern Types Detected</h3>
              <div className="space-y-3 mb-6">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-white font-medium">Repeated Failures</h4>
                  <p className="text-sm text-gray-500">Same operation failing multiple times</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-white font-medium">Usage Spikes</h4>
                  <p className="text-sm text-gray-500">Unusual increases in certain event types</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-white font-medium">Inefficiencies</h4>
                  <p className="text-sm text-gray-500">Long execution times or resource waste</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-white font-medium">Anomalies</h4>
                  <p className="text-sm text-gray-500">Events outside normal patterns</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Controlling the Observer</h3>
              <div className="bg-[#1a1f2e] rounded-lg p-4">
                <pre className="text-sm text-cyan-400">
{`# Start observer with 15-minute interval
curl -X POST http://localhost:3000/api/gfs/observer \\
  -H "Content-Type: application/json" \\
  -d '{"action": "start", "intervalMinutes": 15}'

# Stop observer
curl -X POST http://localhost:3000/api/gfs/observer \\
  -H "Content-Type: application/json" \\
  -d '{"action": "stop"}'

# Trigger manual analysis
curl -X POST http://localhost:3000/api/gfs/observer \\
  -H "Content-Type: application/json" \\
  -d '{"action": "analyze"}'

# Get recent patterns
curl "http://localhost:3000/api/gfs/observer?action=patterns&limit=10"`}</pre>
              </div>
            </section>

            {/* Integrations */}
            <section id="integrations" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Bell className="w-6 h-6 text-orange-400" />
                Integrations
              </h2>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="glass-card p-4 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-400 mb-2" />
                  <h4 className="text-white font-medium">Telegram</h4>
                  <p className="text-sm text-gray-500">Bot notifications and approvals</p>
                </div>
                <div className="glass-card p-4 rounded-lg">
                  <Bell className="w-6 h-6 text-green-400 mb-2" />
                  <h4 className="text-white font-medium">Twilio</h4>
                  <p className="text-sm text-gray-500">SMS alerts for critical events</p>
                </div>
                <div className="glass-card p-4 rounded-lg">
                  <Mail className="w-6 h-6 text-purple-400 mb-2" />
                  <h4 className="text-white font-medium">Email</h4>
                  <p className="text-sm text-gray-500">Detailed reports and summaries</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Sending Alerts</h3>
              <div className="bg-[#1a1f2e] rounded-lg p-4">
                <pre className="text-sm text-cyan-400">
{`// Send alert to all configured channels
curl -X POST http://localhost:3000/api/gfs/integrations/alert \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Critical: Database backup failed",
    "message": "The scheduled backup at 02:00 failed with error: Connection timeout",
    "severity": "critical",
    "channels": ["telegram", "sms"]
  }'`}</pre>
              </div>
            </section>

            {/* API Reference */}
            <section id="api-reference" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Terminal className="w-6 h-6 text-green-400" />
                API Reference
              </h2>

              <div className="space-y-4">
                {/* Events */}
                <div className="glass-card p-4 rounded-xl">
                  <h4 className="text-white font-semibold mb-3">Event Bus</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-mono rounded">POST</span>
                      <code className="text-gray-300">/api/gfs/events</code>
                      <span className="text-gray-500">- Publish event</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-mono rounded">GET</span>
                      <code className="text-gray-300">/api/gfs/events</code>
                      <span className="text-gray-500">- List events</span>
                    </div>
                  </div>
                </div>

                {/* Observer */}
                <div className="glass-card p-4 rounded-xl">
                  <h4 className="text-white font-semibold mb-3">Observer</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-mono rounded">GET</span>
                      <code className="text-gray-300">/api/gfs/observer</code>
                      <span className="text-gray-500">- Get state</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-mono rounded">POST</span>
                      <code className="text-gray-300">/api/gfs/observer</code>
                      <span className="text-gray-500">- Start/stop/analyze</span>
                    </div>
                  </div>
                </div>

                {/* Self-Mod */}
                <div className="glass-card p-4 rounded-xl">
                  <h4 className="text-white font-semibold mb-3">Self-Modification</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-mono rounded">POST</span>
                      <code className="text-gray-300">/api/gfs/self-mod/propose</code>
                      <span className="text-gray-500">- Create proposal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-mono rounded">GET</span>
                      <code className="text-gray-300">/api/gfs/self-mod/pending</code>
                      <span className="text-gray-500">- List pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-mono rounded">POST</span>
                      <code className="text-gray-300">/api/gfs/self-mod/approve</code>
                      <span className="text-gray-500">- Approve/reject</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-mono rounded">POST</span>
                      <code className="text-gray-300">/api/gfs/self-mod/execute</code>
                      <span className="text-gray-500">- Execute approved</span>
                    </div>
                  </div>
                </div>

                {/* Integrations */}
                <div className="glass-card p-4 rounded-xl">
                  <h4 className="text-white font-semibold mb-3">Integrations</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-mono rounded">POST</span>
                      <code className="text-gray-300">/api/gfs/integrations/alert</code>
                      <span className="text-gray-500">- Send alert</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-mono rounded">POST</span>
                      <code className="text-gray-300">/api/gfs/integrations/telegram/send</code>
                      <span className="text-gray-500">- Telegram message</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-mono rounded">POST</span>
                      <code className="text-gray-300">/api/gfs/integrations/twilio/send</code>
                      <span className="text-gray-500">- SMS message</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
