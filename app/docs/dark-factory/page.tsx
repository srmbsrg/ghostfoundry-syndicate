// Dark Factory Documentation
import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { Factory, ArrowLeft, FileCode, Zap, TestTube, Settings, CheckCircle, AlertTriangle, Code, Terminal, Copy, Play, Eye } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dark Factory Documentation | GhostFoundry-Syndicate',
  description: 'Complete guide to using the Dark Factory code generation system',
};

export default function DarkFactoryDocsPage() {
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">Dark Factory</h1>
            </div>
            <p className="text-xl text-gray-400">
              The self-building software factory that generates production-ready code from natural language specifications.
            </p>
          </div>

          {/* Table of Contents */}
          <nav className="glass-card p-6 rounded-xl mb-12">
            <h2 className="text-lg font-semibold text-white mb-4">Contents</h2>
            <ul className="space-y-2">
              <li><a href="#overview" className="text-cyan-400 hover:underline">Overview</a></li>
              <li><a href="#spec-format" className="text-cyan-400 hover:underline">Spec Format</a></li>
              <li><a href="#api-reference" className="text-cyan-400 hover:underline">API Reference</a></li>
              <li><a href="#testing" className="text-cyan-400 hover:underline">Testing Scenarios</a></li>
              <li><a href="#deployment" className="text-cyan-400 hover:underline">Deployment</a></li>
              <li><a href="#examples" className="text-cyan-400 hover:underline">Examples</a></li>
            </ul>
          </nav>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            
            {/* Overview */}
            <section id="overview" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Eye className="w-6 h-6 text-purple-400" />
                Overview
              </h2>
              <div className="glass-card p-6 rounded-xl">
                <p className="text-gray-300 mb-4">
                  The Dark Factory is a recursive, self-referential code generation system. It takes natural language 
                  specifications and produces:
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Prisma schemas</strong> - Database models with relations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span><strong>API routes</strong> - Next.js API endpoints with full CRUD</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span><strong>TypeScript types</strong> - Type definitions matching schemas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Test files</strong> - Automated test suites</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <strong className="text-purple-300">Key Insight:</strong>
                    <p className="text-gray-400 mt-1">
                      The Dark Factory was built by itself. It's the first proof of its own capability - 
                      a system that can write systems.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Spec Format */}
            <section id="spec-format" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <FileCode className="w-6 h-6 text-cyan-400" />
                Spec Format
              </h2>
              
              <p className="text-gray-300 mb-6">
                Specs can be entered in two ways: <strong>Natural Language</strong> or <strong>Structured JSON</strong>.
              </p>

              {/* Natural Language */}
              <h3 className="text-xl font-semibold text-white mt-8 mb-4">1. Natural Language Specs</h3>
              <p className="text-gray-400 mb-4">Write plain English descriptions. The LLM parser will extract structure.</p>
              
              <div className="bg-[#1a1f2e] rounded-lg overflow-hidden mb-6">
                <div className="flex items-center justify-between px-4 py-2 bg-[#252b3b] border-b border-white/10">
                  <span className="text-sm text-gray-400">Natural Language Example</span>
                  <Code className="w-4 h-4 text-gray-500" />
                </div>
                <pre className="p-4 text-sm text-green-400 overflow-x-auto">
{`Create a customer support ticket system with:
- Tickets that have a title, description, priority (low/medium/high/urgent), 
  and status (open/in_progress/resolved/closed)
- Each ticket belongs to a customer (email, name)
- Tickets can have multiple comments with author and timestamp
- Support agents can be assigned to tickets
- Track time spent on each ticket`}</pre>
              </div>

              <h4 className="text-lg font-semibold text-white mt-6 mb-3">Best Practices for Natural Language:</h4>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li>• Be specific about field types (string, number, enum values)</li>
                <li>• Describe relationships explicitly ("belongs to", "has many")</li>
                <li>• Include constraints (required, unique, default values)</li>
                <li>• Mention any computed or derived fields</li>
              </ul>

              {/* Structured JSON */}
              <h3 className="text-xl font-semibold text-white mt-8 mb-4">2. Structured JSON Specs</h3>
              <p className="text-gray-400 mb-4">For precise control, use the structured format:</p>
              
              <div className="bg-[#1a1f2e] rounded-lg overflow-hidden mb-6">
                <div className="flex items-center justify-between px-4 py-2 bg-[#252b3b] border-b border-white/10">
                  <span className="text-sm text-gray-400">Structured JSON Format</span>
                  <Code className="w-4 h-4 text-gray-500" />
                </div>
                <pre className="p-4 text-sm text-cyan-400 overflow-x-auto">
{`{
  "name": "TicketSystem",
  "description": "Customer support ticket management",
  "entities": [
    {
      "name": "Ticket",
      "fields": [
        { "name": "title", "type": "String", "required": true },
        { "name": "description", "type": "String" },
        { "name": "priority", "type": "enum", "values": ["low", "medium", "high", "urgent"], "default": "medium" },
        { "name": "status", "type": "enum", "values": ["open", "in_progress", "resolved", "closed"], "default": "open" },
        { "name": "timeSpent", "type": "Int", "default": 0 }
      ],
      "relations": [
        { "name": "customer", "type": "Customer", "relation": "many-to-one" },
        { "name": "assignee", "type": "Agent", "relation": "many-to-one", "optional": true },
        { "name": "comments", "type": "Comment", "relation": "one-to-many" }
      ]
    },
    {
      "name": "Customer",
      "fields": [
        { "name": "email", "type": "String", "unique": true },
        { "name": "name", "type": "String" }
      ]
    },
    {
      "name": "Comment",
      "fields": [
        { "name": "content", "type": "String" },
        { "name": "author", "type": "String" }
      ]
    },
    {
      "name": "Agent",
      "fields": [
        { "name": "name", "type": "String" },
        { "name": "email", "type": "String", "unique": true }
      ]
    }
  ],
  "endpoints": [
    { "method": "GET", "path": "/api/tickets", "description": "List all tickets with filters" },
    { "method": "POST", "path": "/api/tickets", "description": "Create new ticket" },
    { "method": "PATCH", "path": "/api/tickets/:id", "description": "Update ticket" },
    { "method": "POST", "path": "/api/tickets/:id/assign", "description": "Assign agent to ticket" }
  ]
}`}</pre>
              </div>

              <h4 className="text-lg font-semibold text-white mt-6 mb-3">Field Types:</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <code className="text-cyan-400">String</code>
                  <p className="text-sm text-gray-500 mt-1">Text fields</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <code className="text-cyan-400">Int</code>
                  <p className="text-sm text-gray-500 mt-1">Integer numbers</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <code className="text-cyan-400">Float</code>
                  <p className="text-sm text-gray-500 mt-1">Decimal numbers</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <code className="text-cyan-400">Boolean</code>
                  <p className="text-sm text-gray-500 mt-1">True/false</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <code className="text-cyan-400">DateTime</code>
                  <p className="text-sm text-gray-500 mt-1">Timestamps</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <code className="text-cyan-400">Json</code>
                  <p className="text-sm text-gray-500 mt-1">Flexible JSON data</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <code className="text-cyan-400">enum</code>
                  <p className="text-sm text-gray-500 mt-1">Fixed set of values</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <code className="text-cyan-400">relation</code>
                  <p className="text-sm text-gray-500 mt-1">Links to other entities</p>
                </div>
              </div>
            </section>

            {/* API Reference */}
            <section id="api-reference" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Terminal className="w-6 h-6 text-green-400" />
                API Reference
              </h2>

              {/* Generate Endpoint */}
              <div className="glass-card p-6 rounded-xl mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded">POST</span>
                  <code className="text-white">/api/dark-factory/generate</code>
                </div>
                <p className="text-gray-400 mb-4">Submit a generation request</p>
                <div className="bg-[#1a1f2e] rounded-lg p-4">
                  <pre className="text-sm text-cyan-400">
{`// Request Body
{
  "prompt": "Create a blog system with posts and comments",
  "priority": "normal" // optional: "low" | "normal" | "high"
}

// Response
{
  "success": true,
  "requestId": "uuid",
  "status": "pending"
}`}</pre>
                </div>
              </div>

              {/* Status Endpoint */}
              <div className="glass-card p-6 rounded-xl mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-mono rounded">GET</span>
                  <code className="text-white">/api/dark-factory/status/[taskId]</code>
                </div>
                <p className="text-gray-400 mb-4">Check generation task status</p>
                <div className="bg-[#1a1f2e] rounded-lg p-4">
                  <pre className="text-sm text-cyan-400">
{`// Response
{
  "task": {
    "id": "uuid",
    "status": "completed", // pending | parsing | generating | validating | completed | failed
    "progress": 100,
    "artifacts": [
      { "id": "uuid", "type": "prisma_schema", "filename": "ticket.prisma" },
      { "id": "uuid", "type": "api_route", "filename": "tickets/route.ts" }
    ]
  }
}`}</pre>
                </div>
              </div>

              {/* Artifacts Endpoint */}
              <div className="glass-card p-6 rounded-xl mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-mono rounded">GET</span>
                  <code className="text-white">/api/dark-factory/artifacts/[artifactId]</code>
                </div>
                <p className="text-gray-400 mb-4">Retrieve generated code</p>
                <div className="bg-[#1a1f2e] rounded-lg p-4">
                  <pre className="text-sm text-cyan-400">
{`// Response
{
  "artifact": {
    "id": "uuid",
    "type": "api_route",
    "filename": "tickets/route.ts",
    "content": "// Generated API route code..."
  }
}`}</pre>
                </div>
              </div>

              {/* Deploy Endpoint */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded">POST</span>
                  <code className="text-white">/api/dark-factory/deploy</code>
                </div>
                <p className="text-gray-400 mb-4">Deploy artifacts to codebase</p>
                <div className="bg-[#1a1f2e] rounded-lg p-4">
                  <pre className="text-sm text-cyan-400">
{`// Request Body
{
  "artifactIds": ["uuid1", "uuid2"],
  "dryRun": false // optional: preview changes without deploying
}

// Response
{
  "success": true,
  "deployed": 2,
  "files": [
    { "path": "prisma/schema.prisma", "action": "modified" },
    { "path": "app/api/tickets/route.ts", "action": "created" }
  ]
}`}</pre>
                </div>
              </div>
            </section>

            {/* Testing */}
            <section id="testing" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <TestTube className="w-6 h-6 text-yellow-400" />
                Testing Scenarios
              </h2>

              <p className="text-gray-300 mb-6">
                External testing validates the system as a black box. Tests live <strong>outside</strong> the codebase 
                to prevent "cheating" - the system can't see its own test cases.
              </p>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Adding Test Scenarios</h3>
              
              <p className="text-gray-400 mb-4">Create test files in a separate directory outside your codebase (e.g., <code className="text-cyan-400">tests/external/</code>):</p>

              <div className="bg-[#1a1f2e] rounded-lg overflow-hidden mb-6">
                <div className="flex items-center justify-between px-4 py-2 bg-[#252b3b] border-b border-white/10">
                  <span className="text-sm text-gray-400">test_dark_factory.sh</span>
                  <Terminal className="w-4 h-4 text-gray-500" />
                </div>
                <pre className="p-4 text-sm text-green-400 overflow-x-auto">
{`#!/bin/bash
# External Test Suite for Dark Factory

BASE_URL="http://localhost:3000"

# Test 1: Submit a generation request
echo "TEST 1: Generation Request"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/dark-factory/generate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Create a simple todo list with tasks and categories"
  }')

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
REQUEST_ID=$(echo "$RESPONSE" | jq -r '.requestId')

if [ "$SUCCESS" = "true" ] && [ "$REQUEST_ID" != "null" ]; then
  echo "✓ PASS: Generation submitted, requestId=$REQUEST_ID"
else
  echo "✗ FAIL: Expected success=true with requestId"
fi

# Test 2: Check status
echo "TEST 2: Status Check"
sleep 5 # Wait for processing
STATUS=$(curl -s "$BASE_URL/api/dark-factory/status/$REQUEST_ID" | jq -r '.task.status')

if [ "$STATUS" = "completed" ] || [ "$STATUS" = "generating" ]; then
  echo "✓ PASS: Task is processing, status=$STATUS"
else
  echo "✗ FAIL: Unexpected status=$STATUS"
fi`}</pre>
              </div>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Test Scenario Format</h3>
              
              <div className="glass-card p-6 rounded-xl">
                <p className="text-gray-300 mb-4">Each test should follow this pattern:</p>
                <ol className="space-y-3 text-gray-300">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/30 text-purple-400 flex items-center justify-center text-sm flex-shrink-0">1</span>
                    <span><strong>Define inputs</strong> - What spec/request to send</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/30 text-purple-400 flex items-center justify-center text-sm flex-shrink-0">2</span>
                    <span><strong>Define expected outputs</strong> - What the response should contain</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/30 text-purple-400 flex items-center justify-center text-sm flex-shrink-0">3</span>
                    <span><strong>Execute the request</strong> - Call the API</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/30 text-purple-400 flex items-center justify-center text-sm flex-shrink-0">4</span>
                    <span><strong>Compare results</strong> - Verify actual matches expected</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/30 text-purple-400 flex items-center justify-center text-sm flex-shrink-0">5</span>
                    <span><strong>Report pass/fail</strong> - Log the result</span>
                  </li>
                </ol>
              </div>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Running Tests</h3>
              <div className="bg-[#1a1f2e] rounded-lg p-4">
                <pre className="text-sm text-cyan-400">
{`# Make executable
chmod +x tests/external/test_dark_factory.sh

# Run tests
./tests/external/test_dark_factory.sh`}</pre>
              </div>
            </section>

            {/* Deployment */}
            <section id="deployment" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Zap className="w-6 h-6 text-orange-400" />
                Deployment
              </h2>

              <p className="text-gray-300 mb-6">
                Generated artifacts can be deployed directly to the codebase or staged for review.
              </p>

              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Deployment Workflow</h3>
              
              <div className="space-y-4">
                <div className="glass-card p-4 rounded-lg flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Review Artifacts</h4>
                    <p className="text-gray-400 text-sm">Use the dashboard at /dark-factory to view generated code</p>
                  </div>
                </div>
                <div className="glass-card p-4 rounded-lg flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Dry Run (Optional)</h4>
                    <p className="text-gray-400 text-sm">Preview what files will be created/modified without deploying</p>
                  </div>
                </div>
                <div className="glass-card p-4 rounded-lg flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Deploy</h4>
                    <p className="text-gray-400 text-sm">Click deploy or call the API to write files to codebase</p>
                  </div>
                </div>
                <div className="glass-card p-4 rounded-lg flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Migrate Database</h4>
                    <p className="text-gray-400 text-sm">Run prisma migrate if schema was modified</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Examples */}
            <section id="examples" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Play className="w-6 h-6 text-green-400" />
                Examples
              </h2>

              <div className="space-y-6">
                {/* Example 1 */}
                <div className="glass-card p-6 rounded-xl">
                  <h4 className="text-white font-semibold mb-3">Invoice Management System</h4>
                  <div className="bg-[#1a1f2e] rounded-lg p-4">
                    <pre className="text-sm text-green-400">
{`Create an invoice management system with:
- Invoices with number, date, due date, status (draft/sent/paid/overdue)
- Line items with description, quantity, unit price
- Customers with name, email, address
- Payment records with date, amount, method
- Calculate totals automatically
- Track partial payments`}</pre>
                  </div>
                </div>

                {/* Example 2 */}
                <div className="glass-card p-6 rounded-xl">
                  <h4 className="text-white font-semibold mb-3">Project Management</h4>
                  <div className="bg-[#1a1f2e] rounded-lg p-4">
                    <pre className="text-sm text-green-400">
{`Build a project management system:
- Projects with name, description, start/end dates, budget
- Tasks with title, description, status, priority, estimated hours
- Team members with roles (owner/manager/member/viewer)
- Time entries for tracking work
- File attachments on tasks
- Comments and activity feed`}</pre>
                  </div>
                </div>

                {/* Example 3 */}
                <div className="glass-card p-6 rounded-xl">
                  <h4 className="text-white font-semibold mb-3">Inventory Tracking</h4>
                  <div className="bg-[#1a1f2e] rounded-lg p-4">
                    <pre className="text-sm text-green-400">
{`Create inventory tracking:
- Products with SKU, name, description, category, reorder point
- Warehouses/locations with address
- Stock levels per product per location
- Stock movements (in/out/transfer) with timestamp and reason
- Low stock alerts when below reorder point
- Suppliers with contact info and lead times`}</pre>
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
