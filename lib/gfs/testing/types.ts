/**
 * GFS Testing Infrastructure Types
 * 
 * Real-world testing capabilities for all GFS subsystems.
 */

export type TestType = 
  | 'document_processing'
  | 'anomaly_detection'
  | 'agent_workflow'
  | 'memory_consolidation'
  | 'event_bus'
  | 'self_modification';

export type TestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';

export interface TestCase {
  id: string;
  name: string;
  type: TestType;
  description: string;
  input: TestInput;
  expectedOutcome: string;
  timeout: number; // seconds
}

export interface TestInput {
  type: 'document' | 'metric' | 'event' | 'text' | 'json';
  data: unknown;
  metadata?: Record<string, unknown>;
}

export interface TestResult {
  id: string;
  testCaseId: string;
  status: TestStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
  output?: unknown;
  error?: string;
  logs: TestLog[];
  metrics?: TestMetrics;
}

export interface TestLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: unknown;
}

export interface TestMetrics {
  processingTime: number;
  memoryUsed: number;
  eventsGenerated: number;
  apiCallsCount: number;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  tests: TestCase[];
  createdAt: Date;
}

export interface TestRun {
  id: string;
  suiteId?: string;
  testIds: string[];
  status: TestStatus;
  results: TestResult[];
  startedAt: Date;
  completedAt?: Date;
  summary?: TestSummary;
}

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}
