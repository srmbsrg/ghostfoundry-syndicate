'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Factory,
  ArrowRight,
  MessageSquare,
  Brain,
  Code,
  TestTube,
  CheckCircle,
  Rocket,
  Clock,
  AlertCircle,
  Play,
  Pause,
  XCircle,
  FileCode,
  Database,
  Layers,
  GitBranch,
  Shield,
  Eye,
  Sparkles,
  Home,
  ChevronRight,
} from 'lucide-react';
import { InternalHeader } from '@/components/ui/internal-header';

const PIPELINE_STAGES = [
  {
    id: 1,
    name: 'Intent Parsing',
    icon: <Brain className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    description: 'GPT-4.1 analyzes your natural language request and extracts structured specifications.',
    details: [
      'Identifies intent type (create API, model, component, etc.)',
      'Extracts entities, properties, and relationships',
      'Determines confidence score',
      'Maps dependencies to existing system components',
    ],
    output: 'ParsedIntent object with entities, actions, and confidence',
  },
  {
    id: 2,
    name: 'Schema Generation',
    icon: <Database className="w-6 h-6" />,
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30',
    description: 'Converts parsed intent into database schemas and API specifications.',
    details: [
      'Generates Prisma model definitions',
      'Creates REST API endpoint specs',
      'Defines TypeScript interfaces',
      'Maps entity relationships',
    ],
    output: 'GeneratedSchema with Prisma models and API specs',
  },
  {
    id: 3,
    name: 'Code Generation',
    icon: <Code className="w-6 h-6" />,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    description: 'Produces production-ready code files from the schemas.',
    details: [
      'Prisma model files (prisma/generated-models.prisma)',
      'API route handlers (app/api/**/route.ts)',
      'TypeScript type definitions (lib/types/generated.ts)',
      'Test files (__tests__/*.test.ts)',
    ],
    output: 'Array of GeneratedArtifact objects',
  },
  {
    id: 4,
    name: 'Validation',
    icon: <TestTube className="w-6 h-6" />,
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    description: 'Validates generated code for syntax errors and basic quality checks.',
    details: [
      'TypeScript syntax validation',
      'Undefined reference detection',
      'Empty content checks',
      'Schema consistency verification',
    ],
    output: 'Validation result with issues list',
  },
  {
    id: 5,
    name: 'Awaiting Approval',
    icon: <Clock className="w-6 h-6" />,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    description: 'Human review checkpoint - you decide whether to deploy the generated code.',
    details: [
      'Review all generated artifacts',
      'Inspect code quality and correctness',
      'Approve all or select specific artifacts',
      'Reject and regenerate if needed',
    ],
    output: 'Human approval to proceed to deployment',
  },
  {
    id: 6,
    name: 'Deployment',
    icon: <Rocket className="w-6 h-6" />,
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/30',
    description: 'Writes approved artifacts to the actual codebase.',
    details: [
      'Creates directories if needed',
      'Writes files to target paths',
      'Updates deployment records',
      'Logs all deployment actions',
    ],
    output: 'Deployed code files in the project',
  },
];

const STATUS_DEFINITIONS = [
  {
    status: 'parsing',
    icon: <Brain className="w-5 h-5" />,
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    description: 'Analyzing your natural language request',
  },
  {
    status: 'generating',
    icon: <Code className="w-5 h-5" />,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    description: 'Creating schemas and code files',
  },
  {
    status: 'validating',
    icon: <TestTube className="w-5 h-5" />,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    description: 'Checking code for errors',
  },
  {
    status: 'awaiting_approval',
    icon: <Clock className="w-5 h-5" />,
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    description: 'Ready for human review and approval',
  },
  {
    status: 'deploying',
    icon: <Rocket className="w-5 h-5" />,
    color: 'text-pink-400',
    bg: 'bg-pink-500/20',
    description: 'Writing files to codebase',
  },
  {
    status: 'completed',
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    description: 'Successfully deployed',
  },
  {
    status: 'failed',
    icon: <XCircle className="w-5 h-5" />,
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    description: 'Generation or deployment failed',
  },
];

const ARTIFACT_TYPES = [
  { type: 'prisma_model', icon: <Database className="w-4 h-4" />, label: 'Prisma Model', path: 'prisma/' },
  { type: 'api_route', icon: <GitBranch className="w-4 h-4" />, label: 'API Route', path: 'app/api/' },
  { type: 'typescript_type', icon: <FileCode className="w-4 h-4" />, label: 'TypeScript Types', path: 'lib/types/' },
  { type: 'test_file', icon: <TestTube className="w-4 h-4" />, label: 'Test File', path: '__tests__/' },
  { type: 'react_component', icon: <Layers className="w-4 h-4" />, label: 'React Component', path: 'components/' },
];

export default function DarkFactoryDocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <InternalHeader />
      
      <main className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/docs" className="hover:text-cyan-400 transition-colors">Documentation</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-cyan-400">Dark Factory</span>
          </div>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                <Factory className="w-10 h-10 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Dark Factory</h1>
                <p className="text-gray-400">The code generation pipeline that builds itself</p>
              </div>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl">
              The Dark Factory is GhostFoundry-Syndicate's autonomous code generation system. 
              Tell it what you want to build in plain English, and it will parse your intent, 
              generate schemas, write production code, validate it, and deploy—all with human 
              oversight at the critical "approval" checkpoint.
            </p>
          </motion.div>

          {/* How It Works */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              How It Works: The 6-Stage Pipeline
            </h2>

            <div className="relative">
              {/* Connection Line */}
              <div className="absolute left-8 top-16 bottom-16 w-0.5 bg-gradient-to-b from-purple-500 via-cyan-500 to-pink-500 hidden lg:block" />

              <div className="space-y-8">
                {PIPELINE_STAGES.map((stage, index) => (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="relative"
                  >
                    <div className="flex gap-6">
                      {/* Stage Number */}
                      <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${stage.color} flex items-center justify-center text-white shadow-lg`}>
                        {stage.icon}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 glass-card rounded-xl p-6 ${stage.borderColor} border`}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-2 py-1 rounded-full text-xs font-mono bg-white/10 text-gray-300">
                            Stage {stage.id}
                          </span>
                          <h3 className="text-xl font-semibold text-white">{stage.name}</h3>
                        </div>
                        
                        <p className="text-gray-400 mb-4">{stage.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">What happens:</h4>
                            <ul className="space-y-1">
                              {stage.details.map((detail, i) => (
                                <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
                                  <ArrowRight className="w-3 h-3 mt-1 text-cyan-500 flex-shrink-0" />
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className={`p-3 rounded-lg ${stage.bgColor}`}>
                            <h4 className="text-sm font-medium text-gray-300 mb-1">Output:</h4>
                            <p className="text-sm text-gray-400 font-mono">{stage.output}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* What is "Awaiting Approval"? */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-orange-400" />
              What Does "Awaiting Approval" Mean?
            </h2>

            <div className="glass-card rounded-xl p-8 border border-orange-500/30">
              <div className="flex items-start gap-6">
                <div className="p-4 rounded-xl bg-orange-500/20 flex-shrink-0">
                  <Clock className="w-8 h-8 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Human-in-the-Loop Checkpoint</h3>
                  <p className="text-gray-400 mb-4">
                    "Awaiting Approval" is the <strong className="text-orange-400">critical safety checkpoint</strong> in the Dark Factory pipeline. 
                    After the system generates and validates code, it <strong>pauses and waits for human review</strong> before 
                    deploying anything to your codebase.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="p-4 rounded-lg bg-white/5">
                      <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-cyan-400" />
                        What You Can Do
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Review all generated code artifacts</li>
                        <li>• Inspect the code quality and logic</li>
                        <li>• See exactly which files will be created</li>
                        <li>• Approve all or select specific artifacts</li>
                        <li>• Reject and request regeneration</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-400" />
                        Why This Matters
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Prevents auto-deployment of bad code</li>
                        <li>• Maintains human oversight of AI actions</li>
                        <li>• Allows review before production impact</li>
                        <li>• Audit trail of all approvals</li>
                        <li>• Constitutional AI compliance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Status Reference */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Layers className="w-6 h-6 text-cyan-400" />
              Task Status Reference
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STATUS_DEFINITIONS.map((item) => (
                <div key={item.status} className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${item.bg}`}>
                      <span className={item.color}>{item.icon}</span>
                    </div>
                    <code className="text-sm font-mono text-white">{item.status}</code>
                  </div>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Artifact Types */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FileCode className="w-6 h-6 text-green-400" />
              Generated Artifact Types
            </h2>

            <div className="glass-card rounded-xl p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ARTIFACT_TYPES.map((artifact) => (
                  <div key={artifact.type} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                      {artifact.icon}
                    </div>
                    <div>
                      <div className="text-white font-medium">{artifact.label}</div>
                      <div className="text-xs text-gray-500 font-mono">{artifact.path}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Step-by-Step Guide */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Play className="w-6 h-6 text-purple-400" />
              Step-by-Step: Building Something
            </h2>

            <div className="glass-card rounded-xl p-8">
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">1</span>
                  <div>
                    <h4 className="text-white font-medium">Go to Dark Factory Dashboard</h4>
                    <p className="text-gray-400 text-sm">Navigate to <code className="text-cyan-400">/dark-factory</code> and click the "Generate" tab.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">2</span>
                  <div>
                    <h4 className="text-white font-medium">Describe What You Want</h4>
                    <p className="text-gray-400 text-sm">Type a natural language description like: "Create an API to track customer orders with status updates, shipping info, and order history"</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold">3</span>
                  <div>
                    <h4 className="text-white font-medium">Watch the Pipeline Run</h4>
                    <p className="text-gray-400 text-sm">The system parses intent → generates schemas → writes code → validates. You'll see real-time progress in the Tasks tab.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">4</span>
                  <div>
                    <h4 className="text-white font-medium">Review at "Awaiting Approval"</h4>
                    <p className="text-gray-400 text-sm">Click on the task to expand it. Review all generated artifacts in the Artifacts tab. Read the code!</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">5</span>
                  <div>
                    <h4 className="text-white font-medium">Deploy to Codebase</h4>
                    <p className="text-gray-400 text-sm">If satisfied, click "Deploy All Artifacts". Files are written to your project. Status changes to "completed".</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold">6</span>
                  <div>
                    <h4 className="text-white font-medium">Done!</h4>
                    <p className="text-gray-400 text-sm">Your new API, models, and tests are now part of the codebase. Run <code className="text-cyan-400">yarn prisma generate</code> if needed.</p>
                  </div>
                </li>
              </ol>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <Link
              href="/dark-factory"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-purple-400 transition-all shadow-lg shadow-cyan-500/25"
            >
              <Factory className="w-5 h-5" />
              Open Dark Factory Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
