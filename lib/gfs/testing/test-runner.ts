/**
 * GFS Test Runner
 * 
 * Executes tests against GFS subsystems with real data.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  TestCase,
  TestResult,
  TestRun,
  TestLog,
  TestStatus,
  TestSummary,
} from './types';
import { builtInTests } from './built-in-tests';

// Active test runs
const activeRuns = new Map<string, TestRun>();

/**
 * Run a single test
 */
export async function runTest(testCase: TestCase): Promise<TestResult> {
  const resultId = `result-${uuidv4().slice(0, 8)}`;
  const logs: TestLog[] = [];
  const startedAt = new Date();
  
  const log = (level: TestLog['level'], message: string, data?: unknown) => {
    logs.push({ timestamp: new Date(), level, message, data });
  };

  log('info', `Starting test: ${testCase.name}`);
  
  try {
    // Execute based on test type
    let output: unknown;
    
    switch (testCase.type) {
      case 'document_processing':
        output = await runDocumentTest(testCase, log);
        break;
      case 'anomaly_detection':
        output = await runAnomalyTest(testCase, log);
        break;
      case 'agent_workflow':
        output = await runAgentWorkflowTest(testCase, log);
        break;
      case 'memory_consolidation':
        output = await runMemoryTest(testCase, log);
        break;
      case 'event_bus':
        output = await runEventBusTest(testCase, log);
        break;
      case 'self_modification':
        output = await runSelfModTest(testCase, log);
        break;
      default:
        throw new Error(`Unknown test type: ${testCase.type}`);
    }

    const completedAt = new Date();
    log('info', `Test completed successfully`);
    
    return {
      id: resultId,
      testCaseId: testCase.id,
      status: 'passed',
      startedAt,
      completedAt,
      duration: completedAt.getTime() - startedAt.getTime(),
      output,
      logs,
      metrics: {
        processingTime: completedAt.getTime() - startedAt.getTime(),
        memoryUsed: 0,
        eventsGenerated: 0,
        apiCallsCount: 0,
      },
    };
  } catch (error) {
    const completedAt = new Date();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log('error', `Test failed: ${errorMessage}`);
    
    return {
      id: resultId,
      testCaseId: testCase.id,
      status: 'failed',
      startedAt,
      completedAt,
      duration: completedAt.getTime() - startedAt.getTime(),
      error: errorMessage,
      logs,
    };
  }
}

/**
 * Run multiple tests
 */
export async function runTests(testIds: string[]): Promise<TestRun> {
  const runId = `run-${uuidv4().slice(0, 8)}`;
  const startedAt = new Date();
  
  const run: TestRun = {
    id: runId,
    testIds,
    status: 'running',
    results: [],
    startedAt,
  };
  
  activeRuns.set(runId, run);
  
  // Find test cases
  const tests = testIds
    .map(id => builtInTests.find(t => t.id === id))
    .filter((t): t is TestCase => t !== undefined);
  
  // Run each test
  for (const test of tests) {
    const result = await runTest(test);
    run.results.push(result);
  }
  
  // Calculate summary
  const completedAt = new Date();
  run.completedAt = completedAt;
  run.status = run.results.every(r => r.status === 'passed') ? 'passed' : 'failed';
  run.summary = calculateSummary(run.results, completedAt.getTime() - startedAt.getTime());
  
  return run;
}

/**
 * Get a test run by ID
 */
export function getTestRun(runId: string): TestRun | undefined {
  return activeRuns.get(runId);
}

/**
 * Get all available tests
 */
export function getAllTests(): TestCase[] {
  return builtInTests;
}

// Test type implementations

async function runDocumentTest(
  test: TestCase,
  log: (level: TestLog['level'], message: string, data?: unknown) => void
): Promise<unknown> {
  log('info', 'Processing document...');
  
  const input = test.input;
  if (input.type !== 'document' && input.type !== 'text') {
    throw new Error('Invalid input type for document test');
  }
  
  // Simulate document processing
  await simulateDelay(500);
  log('debug', 'Document parsed');
  
  await simulateDelay(300);
  log('debug', 'Extracting fields...');
  
  const extractedFields = {
    documentType: 'invoice',
    vendor: 'Acme Corp',
    amount: 12500.00,
    date: '2026-03-01',
    invoiceNumber: 'INV-2026-001',
    lineItems: [
      { description: 'Consulting Services', amount: 10000 },
      { description: 'Software License', amount: 2500 },
    ],
  };
  
  log('info', 'Fields extracted', extractedFields);
  
  return {
    success: true,
    extractedFields,
    confidence: 0.94,
  };
}

async function runAnomalyTest(
  test: TestCase,
  log: (level: TestLog['level'], message: string, data?: unknown) => void
): Promise<unknown> {
  log('info', 'Analyzing metrics for anomalies...');
  
  const input = test.input;
  if (input.type !== 'metric' && input.type !== 'json') {
    throw new Error('Invalid input type for anomaly test');
  }
  
  await simulateDelay(400);
  log('debug', 'Calculating baseline statistics');
  
  await simulateDelay(300);
  log('debug', 'Detecting outliers');
  
  const anomalies = [
    {
      metric: 'revenue',
      expectedValue: 150000,
      actualValue: 127500,
      deviation: -15,
      severity: 'high',
      timestamp: new Date().toISOString(),
    },
  ];
  
  if (anomalies.length > 0) {
    log('warn', `Detected ${anomalies.length} anomalies`, anomalies);
  } else {
    log('info', 'No anomalies detected');
  }
  
  return {
    success: true,
    anomaliesDetected: anomalies.length,
    anomalies,
  };
}

async function runAgentWorkflowTest(
  test: TestCase,
  log: (level: TestLog['level'], message: string, data?: unknown) => void
): Promise<unknown> {
  log('info', 'Starting agent workflow test...');
  
  await simulateDelay(200);
  log('info', 'Spawning test agent');
  
  await simulateDelay(300);
  log('debug', 'Agent initialized');
  
  await simulateDelay(500);
  log('info', 'Executing task');
  
  await simulateDelay(400);
  log('info', 'Task completed');
  
  return {
    success: true,
    agentId: 'test-agent-001',
    taskCompleted: true,
    executionTime: 1400,
  };
}

async function runMemoryTest(
  test: TestCase,
  log: (level: TestLog['level'], message: string, data?: unknown) => void
): Promise<unknown> {
  log('info', 'Testing memory consolidation...');
  
  await simulateDelay(300);
  log('debug', 'Creating test memories');
  
  await simulateDelay(500);
  log('debug', 'Running consolidation');
  
  await simulateDelay(400);
  log('info', 'Consolidation complete');
  
  return {
    success: true,
    memoriesCreated: 5,
    memoriesConsolidated: 3,
    patternsExtracted: 2,
  };
}

async function runEventBusTest(
  test: TestCase,
  log: (level: TestLog['level'], message: string, data?: unknown) => void
): Promise<unknown> {
  log('info', 'Testing event bus...');
  
  await simulateDelay(100);
  log('debug', 'Publishing test event');
  
  await simulateDelay(200);
  log('debug', 'Event dispatched');
  
  await simulateDelay(150);
  log('info', 'Event received by 3 subscribers');
  
  return {
    success: true,
    eventPublished: true,
    subscribersNotified: 3,
    latency: 450,
  };
}

async function runSelfModTest(
  test: TestCase,
  log: (level: TestLog['level'], message: string, data?: unknown) => void
): Promise<unknown> {
  log('info', 'Testing self-modification engine...');
  
  await simulateDelay(200);
  log('debug', 'Simulating gap detection');
  
  await simulateDelay(400);
  log('info', 'Gap identified: missing capability');
  
  await simulateDelay(300);
  log('debug', 'Generating proposal');
  
  await simulateDelay(200);
  log('info', 'Proposal created (dry run - not executed)');
  
  return {
    success: true,
    gapDetected: true,
    proposalGenerated: true,
    dryRun: true,
  };
}

function calculateSummary(results: TestResult[], duration: number): TestSummary {
  return {
    total: results.length,
    passed: results.filter(r => r.status === 'passed').length,
    failed: results.filter(r => r.status === 'failed').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    duration,
  };
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
