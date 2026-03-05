/**
 * Gap Detector
 * 
 * Analyzes the system to detect missing capabilities, failed patterns,
 * performance issues, and other gaps that the Ghost should address.
 */

import { prisma } from '@/lib/db';
import { GapAnalysis, GapType, GapEvidence } from './types';

export class GapDetector {
  /**
   * Run comprehensive gap analysis across the system
   */
  async analyzeSystem(): Promise<GapAnalysis[]> {
    const gaps: GapAnalysis[] = [];
    
    // Run all detection methods in parallel
    const [
      failedTasks,
      missingCapabilities,
      performanceGaps,
      integrationGaps,
      patternGaps
    ] = await Promise.all([
      this.detectFailedTasks(),
      this.detectMissingCapabilities(),
      this.detectPerformanceBottlenecks(),
      this.detectIntegrationGaps(),
      this.detectRecurringPatterns()
    ]);
    
    gaps.push(
      ...failedTasks,
      ...missingCapabilities,
      ...performanceGaps,
      ...integrationGaps,
      ...patternGaps
    );
    
    // Store gaps in database
    await this.storeGaps(gaps);
    
    return gaps;
  }
  
  /**
   * Detect tasks that failed due to missing functionality
   */
  private async detectFailedTasks(): Promise<GapAnalysis[]> {
    const gaps: GapAnalysis[] = [];
    
    // Find failed tasks from the last 24 hours
    const failedTasks = await prisma.task.findMany({
      where: {
        status: 'failed',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      include: {
        agent: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    
    // Group by error type
    const errorGroups = new Map<string, typeof failedTasks>();
    
    for (const task of failedTasks) {
      const output = task.output as { error?: string } | null;
      const errorKey = output?.error || 'unknown_error';
      const group = errorGroups.get(errorKey) || [];
      group.push(task);
      errorGroups.set(errorKey, group);
    }
    
    // Create gap for each error pattern
    for (const [errorType, tasks] of errorGroups) {
      if (tasks.length >= 3) { // At least 3 occurrences
        gaps.push({
          id: `gap_failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'failed_task',
          severity: tasks.length >= 10 ? 'high' : tasks.length >= 5 ? 'medium' : 'low',
          title: `Recurring task failure: ${errorType.substring(0, 50)}`,
          description: `${tasks.length} tasks have failed with similar error patterns in the last 24 hours`,
          evidence: tasks.slice(0, 5).map(t => ({
            type: 'failed_task' as const,
            data: { taskId: t.id, taskType: t.type, error: errorType },
            timestamp: t.createdAt,
            frequency: tasks.length
          })),
          suggestedFix: this.suggestFixForError(errorType),
          affectedComponents: [...new Set(tasks.map(t => t.type))],
          detectedAt: new Date(),
          source: 'automated'
        });
      }
    }
    
    return gaps;
  }
  
  /**
   * Detect capabilities that agents need but don't have
   */
  private async detectMissingCapabilities(): Promise<GapAnalysis[]> {
    const gaps: GapAnalysis[] = [];
    
    // Find agents with their capabilities
    const agents = await prisma.agent.findMany({
      where: { status: 'active' }
    });
    
    // Get all registered capabilities
    const registeredCapabilities = await prisma.capability.findMany({
      where: { status: 'active' }
    });
    
    // Check for common capability patterns that should exist
    const commonCapabilities = [
      'data_extraction',
      'report_generation',
      'notification_send',
      'external_api_call',
      'data_validation'
    ];
    
    // Get existing capability names from registered capabilities
    const existingCapNames = new Set(
      registeredCapabilities.map(c => c.name)
    );
    
    // Also check agent capability arrays (JSON field)
    for (const agent of agents) {
      const agentCaps = agent.capabilities as string[] || [];
      agentCaps.forEach(cap => existingCapNames.add(cap));
    }
    
    for (const capName of commonCapabilities) {
      if (!existingCapNames.has(capName)) {
        gaps.push({
          id: `gap_cap_${Date.now()}_${capName}`,
          type: 'missing_capability',
          severity: 'medium',
          title: `Missing common capability: ${capName}`,
          description: `No agent has the '${capName}' capability, which is commonly needed for operations`,
          evidence: [{
            type: 'pattern' as const,
            data: { missingCapability: capName, agentsChecked: agents.length },
            timestamp: new Date()
          }],
          suggestedFix: `Create a new capability '${capName}' and assign it to appropriate agents`,
          affectedComponents: ['agent_capabilities'],
          detectedAt: new Date(),
          source: 'automated'
        });
      }
    }
    
    return gaps;
  }
  
  /**
   * Detect performance bottlenecks
   */
  private async detectPerformanceBottlenecks(): Promise<GapAnalysis[]> {
    const gaps: GapAnalysis[] = [];
    
    // Find slow workflow executions
    const slowExecutions = await prisma.workflowExecution.findMany({
      where: {
        status: 'completed',
        completedAt: { not: undefined }
      },
      orderBy: { completedAt: 'desc' },
      take: 100
    });
    
    // Group by workflow and check for slow patterns
    const workflowDurations = new Map<string, number[]>();
    
    for (const exec of slowExecutions) {
      if (exec.completedAt && exec.startedAt) {
        const duration = exec.completedAt.getTime() - exec.startedAt.getTime();
        const durations = workflowDurations.get(exec.workflowId) || [];
        durations.push(duration);
        workflowDurations.set(exec.workflowId, durations);
      }
    }
    
    for (const [workflowId, durations] of workflowDurations) {
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const slowThreshold = 60000; // 1 minute
      
      if (avgDuration > slowThreshold) {
        // Get workflow name separately
        const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
        gaps.push({
          id: `gap_perf_${Date.now()}_${workflowId}`,
          type: 'performance_bottleneck',
          severity: avgDuration > 300000 ? 'high' : 'medium',
          title: `Slow workflow: ${workflow?.name || workflowId}`,
          description: `Average execution time is ${Math.round(avgDuration / 1000)}s, exceeding the 60s threshold`,
          evidence: [{
            type: 'metric' as const,
            data: { 
              workflowId, 
              avgDuration: Math.round(avgDuration), 
              sampleSize: durations.length 
            },
            timestamp: new Date()
          }],
          suggestedFix: 'Analyze workflow steps, parallelize where possible, or optimize slow queries',
          affectedComponents: [workflow?.name || workflowId],
          detectedAt: new Date(),
          source: 'monitoring'
        });
      }
    }
    
    return gaps;
  }
  
  /**
   * Detect missing integrations
   */
  private async detectIntegrationGaps(): Promise<GapAnalysis[]> {
    const gaps: GapAnalysis[] = [];
    
    // Get active integrations
    const activeIntegrations = await prisma.integration.findMany({
      where: { status: 'active' }
    });
    
    const activeTypes = new Set(activeIntegrations.map(i => i.type));
    
    // Core integrations that should typically exist
    const coreIntegrations = [
      { type: 'email', name: 'Email Integration' },
      { type: 'webhook', name: 'Webhook Integration' },
      { type: 'slack', name: 'Slack Integration' },
      { type: 'calendar', name: 'Calendar Integration' }
    ];
    
    // Check for missing core integrations
    for (const core of coreIntegrations) {
      if (!activeTypes.has(core.type)) {
        gaps.push({
          id: `gap_int_${Date.now()}_${core.type}`,
          type: 'integration_gap',
          severity: 'low',
          title: `Missing integration: ${core.name}`,
          description: `The ${core.name} is not configured but is commonly needed`,
          evidence: [{
            type: 'pattern' as const,
            data: { missingType: core.type },
            timestamp: new Date()
          }],
          suggestedFix: `Configure ${core.name} to enable automated ${core.type} communications`,
          affectedComponents: ['integrations'],
          detectedAt: new Date(),
          source: 'automated'
        });
      }
    }
    
    return gaps;
  }
  
  /**
   * Detect recurring manual patterns that could be automated
   */
  private async detectRecurringPatterns(): Promise<GapAnalysis[]> {
    const gaps: GapAnalysis[] = [];
    
    // Find human gates that are frequently approved with similar patterns
    const recentGates = await prisma.humanGate.findMany({
      where: {
        status: 'approved',
        resolvedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: { resolvedAt: 'desc' },
      take: 200
    });
    
    // Group by description pattern (first 50 chars as key)
    const gateGroups = new Map<string, typeof recentGates>();
    
    for (const gate of recentGates) {
      // Use first part of description as pattern key
      const patternKey = gate.description.substring(0, 50).replace(/[0-9]/g, '#');
      const group = gateGroups.get(patternKey) || [];
      group.push(gate);
      gateGroups.set(patternKey, group);
    }
    
    // If same pattern is frequently approved, suggest automation
    for (const [patternKey, gates] of gateGroups) {
      if (gates.length >= 10) {
        gaps.push({
          id: `gap_pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'pattern_detected',
          severity: 'medium',
          title: `Automatable pattern: ${patternKey.substring(0, 30)}...`,
          description: `${gates.length} similar human gates were approved in the last 7 days. Consider auto-approval.`,
          evidence: [{
            type: 'pattern' as const,
            data: { 
              patternKey, 
              totalGates: gates.length,
              sampleDescriptions: gates.slice(0, 3).map(g => g.description)
            },
            timestamp: new Date(),
            frequency: gates.length
          }],
          suggestedFix: `Add auto-approval rule for gates matching pattern '${patternKey}'`,
          affectedComponents: ['human_gates', 'workflows'],
          detectedAt: new Date(),
          source: 'automated'
        });
      }
    }
    
    return gaps;
  }
  
  /**
   * Suggest a fix based on error type
   */
  private suggestFixForError(errorType: string): string {
    const errorLower = errorType.toLowerCase();
    
    if (errorLower.includes('not found') || errorLower.includes('404')) {
      return 'Create the missing endpoint or resource';
    }
    if (errorLower.includes('timeout')) {
      return 'Increase timeout limits or optimize the slow operation';
    }
    if (errorLower.includes('permission') || errorLower.includes('unauthorized')) {
      return 'Review and update access permissions';
    }
    if (errorLower.includes('validation')) {
      return 'Improve input validation or add data transformation';
    }
    if (errorLower.includes('connection')) {
      return 'Check external service connectivity and add retry logic';
    }
    
    return 'Analyze error pattern and implement appropriate fix';
  }
  
  /**
   * Store detected gaps in the database
   */
  private async storeGaps(gaps: GapAnalysis[]): Promise<void> {
    for (const gap of gaps) {
      await prisma.factoryEvent.create({
        data: {
          type: 'gap_detected',
          description: gap.title,
          metadata: JSON.parse(JSON.stringify({
            gapId: gap.id,
            gapType: gap.type,
            severity: gap.severity,
            description: gap.description,
            suggestedFix: gap.suggestedFix,
            affectedComponents: gap.affectedComponents,
            evidenceCount: gap.evidence.length,
            source: gap.source
          })),
          status: 'pending'
        }
      });
    }
  }
}

export const gapDetector = new GapDetector();
