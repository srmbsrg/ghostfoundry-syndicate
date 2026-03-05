/**
 * Built-in Test Cases
 * 
 * Pre-defined tests for validating GFS functionality.
 */

import { TestCase } from './types';

export const builtInTests: TestCase[] = [
  // Document Processing Tests
  {
    id: 'test-doc-invoice',
    name: 'Invoice Processing',
    type: 'document_processing',
    description: 'Test invoice data extraction from a sample document',
    input: {
      type: 'document',
      data: {
        content: 'Invoice #INV-2026-001\nFrom: Acme Corp\nAmount: $12,500.00\nDate: March 1, 2026',
        format: 'text',
      },
    },
    expectedOutcome: 'Successfully extract vendor, amount, date, and invoice number',
    timeout: 30,
  },
  {
    id: 'test-doc-contract',
    name: 'Contract Analysis',
    type: 'document_processing',
    description: 'Test contract term extraction and risk identification',
    input: {
      type: 'document',
      data: {
        content: 'Service Agreement\nTerm: 24 months\nAuto-renewal: Yes\nTermination: 90 days notice',
        format: 'text',
      },
    },
    expectedOutcome: 'Extract contract terms and identify auto-renewal clause',
    timeout: 30,
  },
  
  // Anomaly Detection Tests
  {
    id: 'test-anomaly-revenue',
    name: 'Revenue Anomaly Detection',
    type: 'anomaly_detection',
    description: 'Detect revenue deviation from expected baseline',
    input: {
      type: 'metric',
      data: {
        metric: 'revenue',
        values: [150000, 155000, 148000, 127500, 151000],
        expected: 150000,
      },
    },
    expectedOutcome: 'Detect significant revenue drop in position 4',
    timeout: 20,
  },
  {
    id: 'test-anomaly-expense',
    name: 'Expense Spike Detection',
    type: 'anomaly_detection',
    description: 'Detect unusual expense patterns',
    input: {
      type: 'metric',
      data: {
        metric: 'expenses',
        department: 'IT',
        values: [45000, 47000, 46500, 78000, 45500],
        threshold: 2.0,
      },
    },
    expectedOutcome: 'Flag IT expense spike in position 4',
    timeout: 20,
  },
  
  // Agent Workflow Tests
  {
    id: 'test-agent-spawn',
    name: 'Agent Spawning',
    type: 'agent_workflow',
    description: 'Test dynamic agent creation and task assignment',
    input: {
      type: 'json',
      data: {
        templateId: 'tpl-document-processor',
        task: 'Process sample invoice',
      },
    },
    expectedOutcome: 'Agent spawns, accepts task, and completes execution',
    timeout: 45,
  },
  {
    id: 'test-agent-coordination',
    name: 'Multi-Agent Coordination',
    type: 'agent_workflow',
    description: 'Test multiple agents working on related tasks',
    input: {
      type: 'json',
      data: {
        workflow: 'invoice_approval',
        agents: ['processor', 'validator', 'approver'],
      },
    },
    expectedOutcome: 'Agents coordinate and complete workflow steps',
    timeout: 60,
  },
  
  // Memory Tests
  {
    id: 'test-memory-store',
    name: 'Memory Storage',
    type: 'memory_consolidation',
    description: 'Test episodic memory creation and retrieval',
    input: {
      type: 'json',
      data: {
        memories: [
          { content: 'Processed invoice from Acme Corp for $12,500' },
          { content: 'Detected anomaly in IT expenses' },
          { content: 'Completed contract renewal with GlobalTech' },
        ],
      },
    },
    expectedOutcome: 'Memories stored and retrievable via similarity search',
    timeout: 30,
  },
  {
    id: 'test-memory-consolidation',
    name: 'Memory Consolidation',
    type: 'memory_consolidation',
    description: 'Test conversion of episodes to semantic patterns',
    input: {
      type: 'json',
      data: {
        triggerConsolidation: true,
      },
    },
    expectedOutcome: 'Episodic memories consolidated into semantic patterns',
    timeout: 45,
  },
  
  // Event Bus Tests
  {
    id: 'test-event-pubsub',
    name: 'Event Pub/Sub',
    type: 'event_bus',
    description: 'Test event publishing and subscription delivery',
    input: {
      type: 'json',
      data: {
        eventType: 'gfs.test.ping',
        payload: { timestamp: Date.now() },
      },
    },
    expectedOutcome: 'Event published and received by all subscribers',
    timeout: 15,
  },
  {
    id: 'test-event-routing',
    name: 'Event Routing',
    type: 'event_bus',
    description: 'Test wildcard subscriptions and event routing',
    input: {
      type: 'json',
      data: {
        patterns: ['gfs.*', 'gfs.agent.*', 'dark_factory.artifact.*'],
      },
    },
    expectedOutcome: 'Events routed correctly to matching subscriptions',
    timeout: 20,
  },
  
  // Self-Modification Tests
  {
    id: 'test-selfmod-gap',
    name: 'Gap Detection',
    type: 'self_modification',
    description: 'Test capability gap detection in dry-run mode',
    input: {
      type: 'json',
      data: {
        scenario: 'missing_bulk_upload',
        dryRun: true,
      },
    },
    expectedOutcome: 'Gap detected and proposal generated (not executed)',
    timeout: 30,
  },
  {
    id: 'test-selfmod-proposal',
    name: 'Proposal Generation',
    type: 'self_modification',
    description: 'Test modification proposal generation',
    input: {
      type: 'json',
      data: {
        gap: 'missing_capability',
        description: 'Add CSV export functionality',
        dryRun: true,
      },
    },
    expectedOutcome: 'Valid Dark Factory spec generated',
    timeout: 45,
  },
];
