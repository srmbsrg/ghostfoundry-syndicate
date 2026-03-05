/**
 * Agent Spawner
 * 
 * Creates and manages agent instances from templates.
 * Handles lifecycle, configuration merging, and capability inheritance.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  AgentTemplate,
  AgentInstance,
  SpawnRequest,
  SpawnResult,
  AgentCommand,
  AgentStatus,
  AgentMetrics,
  AgentHealth,
  CapabilityType,
} from './types';
import { getTemplate, builtInTemplates } from './templates';
import { prisma } from '@/lib/db';
import { EventBus } from '@/lib/gfs/event-bus';

// In-memory agent registry (would be Redis in production)
const activeAgents = new Map<string, AgentInstance>();

/**
 * Spawn a new agent from a template
 */
export async function spawnAgent(request: SpawnRequest): Promise<SpawnResult> {
  try {
    // Get template
    const template = getTemplate(request.templateId);
    if (!template) {
      return { success: false, error: `Template not found: ${request.templateId}` };
    }

    // Resolve inherited capabilities
    const capabilities = resolveCapabilities(template);

    // Merge configuration
    const config = {
      ...template.defaultConfig,
      ...(request.config || {}),
    };

    // Validate configuration
    const validationError = validateConfig(config, template.configSchema);
    if (validationError) {
      return { success: false, error: validationError };
    }

    // Create agent instance
    const agentId = `agent-${uuidv4().slice(0, 8)}`;
    const now = new Date();

    const agent: AgentInstance = {
      id: agentId,
      templateId: template.id,
      name: request.name || `${template.name}-${agentId.slice(-4)}`,
      status: request.autoStart ? 'initializing' : 'idle',
      config,
      capabilities,
      metrics: initializeMetrics(),
      health: initializeHealth(),
      createdAt: now,
    };

    // Store in database
    await prisma.agent.create({
      data: {
        id: agentId,
        name: agent.name,
        type: template.type,
        status: agent.status,
        capabilities: capabilities,
        config: JSON.parse(JSON.stringify(config)),
        metrics: JSON.parse(JSON.stringify(agent.metrics)),
        personality: JSON.parse(JSON.stringify({
          templateId: template.id,
          templateVersion: template.version,
          tags: [...(template.tags || []), ...(request.tags || [])],
        })),
      },
    });

    // Register in memory
    activeAgents.set(agentId, agent);

    // Publish spawn event
    await EventBus.emit(
      'agent',
      'gfs.agent.spawned',
      {
        agentId,
        templateId: template.id,
        name: agent.name,
        capabilities,
      }
    );

    // Auto-start if requested
    if (request.autoStart) {
      await startAgent(agentId);
    }

    return { success: true, agentId, agent };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Start an agent
 */
export async function startAgent(agentId: string): Promise<{ success: boolean; error?: string }> {
  const agent = activeAgents.get(agentId);
  if (!agent) {
    return { success: false, error: `Agent not found: ${agentId}` };
  }

  if (agent.status === 'active') {
    return { success: true }; // Already running
  }

  agent.status = 'active';
  agent.startedAt = new Date();
  agent.lastActiveAt = new Date();

  // Update database
  await prisma.agent.update({
    where: { id: agentId },
    data: { status: 'active' },
  });

  // Publish event
  await EventBus.emit('agent', 'gfs.agent.started', { agentId, name: agent.name });

  return { success: true };
}

/**
 * Pause an agent
 */
export async function pauseAgent(agentId: string): Promise<{ success: boolean; error?: string }> {
  const agent = activeAgents.get(agentId);
  if (!agent) {
    return { success: false, error: `Agent not found: ${agentId}` };
  }

  agent.status = 'paused';

  await prisma.agent.update({
    where: { id: agentId },
    data: { status: 'paused' },
  });

  await EventBus.emit('agent', 'gfs.agent.paused', { agentId, name: agent.name });

  return { success: true };
}

/**
 * Terminate an agent
 */
export async function terminateAgent(agentId: string): Promise<{ success: boolean; error?: string }> {
  const agent = activeAgents.get(agentId);
  if (!agent) {
    return { success: false, error: `Agent not found: ${agentId}` };
  }

  agent.status = 'terminated';
  agent.terminatedAt = new Date();

  // Update database
  await prisma.agent.update({
    where: { id: agentId },
    data: { status: 'terminated' },
  });

  // Remove from active registry
  activeAgents.delete(agentId);

  // Publish event
  await EventBus.emit('agent', 'gfs.agent.terminated', { agentId, name: agent.name });

  return { success: true };
}

/**
 * Send command to agent
 */
export async function sendCommand(
  agentId: string,
  command: AgentCommand
): Promise<{ success: boolean; error?: string }> {
  switch (command.type) {
    case 'start':
      return startAgent(agentId);
    case 'pause':
      return pauseAgent(agentId);
    case 'terminate':
      return terminateAgent(agentId);
    case 'restart': {
      await terminateAgent(agentId);
      // Re-spawn would need template info - simplified for now
      return { success: true };
    }
    case 'updateConfig': {
      const agent = activeAgents.get(agentId);
      if (!agent) {
        return { success: false, error: `Agent not found: ${agentId}` };
      }
      agent.config = { ...agent.config, ...command.config };
      await prisma.agent.update({
        where: { id: agentId },
        data: { config: JSON.parse(JSON.stringify(agent.config)) },
      });
      return { success: true };
    }
    case 'assignTask': {
      const agent = activeAgents.get(agentId);
      if (!agent) {
        return { success: false, error: `Agent not found: ${agentId}` };
      }
      if (agent.status !== 'active' && agent.status !== 'idle') {
        return { success: false, error: `Agent not ready: ${agent.status}` };
      }
      agent.currentTask = {
        id: command.task.id,
        description: command.task.description,
        startedAt: new Date(),
        progress: 0,
        metadata: command.task.payload,
      };
      agent.status = 'active';
      agent.lastActiveAt = new Date();
      
      await EventBus.emit('agent', 'gfs.agent.task_started', {
        agentId,
        agentName: agent.name,
        taskId: command.task.id,
        description: command.task.description,
      });
      return { success: true };
    }
    default:
      return { success: false, error: 'Unknown command' };
  }
}

/**
 * Get agent by ID
 */
export function getAgent(agentId: string): AgentInstance | undefined {
  return activeAgents.get(agentId);
}

/**
 * Get all active agents
 */
export function getAllAgents(): AgentInstance[] {
  return Array.from(activeAgents.values());
}

/**
 * Get agents by status
 */
export function getAgentsByStatus(status: AgentStatus): AgentInstance[] {
  return getAllAgents().filter(a => a.status === status);
}

/**
 * Get agents by capability
 */
export function getAgentsByCapability(capability: CapabilityType): AgentInstance[] {
  return getAllAgents().filter(a => a.capabilities.includes(capability));
}

/**
 * Load agents from database on startup
 */
export async function loadAgentsFromDatabase(): Promise<number> {
  const dbAgents = await prisma.agent.findMany({
    where: {
      status: { in: ['active', 'idle', 'paused'] },
    },
  });

  for (const dbAgent of dbAgents) {
    const personality = dbAgent.personality as Record<string, unknown> | null;
    const agent: AgentInstance = {
      id: dbAgent.id,
      templateId: personality?.templateId as string || 'unknown',
      name: dbAgent.name,
      status: dbAgent.status as AgentStatus,
      config: (dbAgent.config as Record<string, unknown>) || {},
      capabilities: (Array.isArray(dbAgent.capabilities) ? dbAgent.capabilities : []) as CapabilityType[],
      metrics: ((dbAgent.metrics as unknown) as AgentMetrics) || initializeMetrics(),
      health: initializeHealth(),
      createdAt: dbAgent.createdAt,
      lastActiveAt: dbAgent.updatedAt,
    };
    activeAgents.set(dbAgent.id, agent);
  }

  return dbAgents.length;
}

// Helper functions

function resolveCapabilities(template: AgentTemplate): CapabilityType[] {
  const capabilities = [...template.capabilities];
  
  // If extends another template, merge capabilities
  if (template.extendsTemplate) {
    const parentTemplate = getTemplate(template.extendsTemplate);
    if (parentTemplate) {
      const parentCaps = resolveCapabilities(parentTemplate);
      for (const cap of parentCaps) {
        if (!capabilities.includes(cap)) {
          capabilities.push(cap);
        }
      }
    }
  }
  
  return capabilities;
}

function validateConfig(
  config: Record<string, unknown>,
  schema: AgentTemplate['configSchema']
): string | null {
  // Check required fields
  for (const required of schema.required) {
    if (config[required] === undefined) {
      return `Missing required config: ${required}`;
    }
  }
  
  // Basic type validation
  for (const [key, prop] of Object.entries(schema.properties)) {
    const value = config[key];
    if (value === undefined) continue;
    
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== prop.type) {
      return `Invalid type for ${key}: expected ${prop.type}, got ${actualType}`;
    }
    
    if (prop.enum && !prop.enum.includes(value)) {
      return `Invalid value for ${key}: must be one of ${prop.enum.join(', ')}`;
    }
  }
  
  return null;
}

function initializeMetrics(): AgentMetrics {
  return {
    tasksCompleted: 0,
    tasksFailed: 0,
    successRate: 100,
    averageTaskDuration: 0,
    totalRuntime: 0,
    memoryUsageMB: 0,
  };
}

function initializeHealth(): AgentHealth {
  return {
    status: 'healthy',
    lastCheck: new Date(),
    issues: [],
  };
}
