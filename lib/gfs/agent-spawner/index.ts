/**
 * GhostFoundry-Syndicate Agent Spawner
 * 
 * Dynamic agent instantiation and lifecycle management.
 * Allows the Ghost to create new workers on demand without restart.
 * 
 * ## Architecture
 * 
 * ```
 * ┌──────────────────────────────────────────────────────┐
 * │                  AGENT SPAWNER                       │
 * ├──────────────────────────────────────────────────────┤
 * │  TEMPLATES           │    REGISTRY                  │
 * │  ┌────────────────┐  │  ┌──────────────────────┐    │
 * │  │ Document Proc  │  │  │ Active Agents        │    │
 * │  │ Data Analyzer  │─►│  │ ├─ Agent-001 (active)│    │
 * │  │ Communication  │  │  │ ├─ Agent-002 (idle)  │    │
 * │  │ Report Gen     │  │  │ └─ Agent-003 (paused)│    │
 * │  │ Integration    │  │  └──────────────────────┘    │
 * │  │ Orchestrator   │  │                              │
 * │  └────────────────┘  │  LIFECYCLE                   │
 * │                      │  ┌──────────────────────┐    │
 * │  SPAWNER             │  │ spawn → start →      │    │
 * │  ┌────────────────┐  │  │ pause → resume →     │    │
 * │  │ Create Instance│  │  │ terminate            │    │
 * │  │ Config Merge   │  │  └──────────────────────┘    │
 * │  │ Capability     │  │                              │
 * │  │ Inheritance    │  │                              │
 * │  └────────────────┘  │                              │
 * └──────────────────────────────────────────────────────┘
 * ```
 * 
 * ## Usage
 * 
 * ```typescript
 * import { agentSpawner } from '@/lib/gfs/agent-spawner';
 * 
 * // Spawn a new agent
 * const result = await agentSpawner.spawn({
 *   templateId: 'tpl-document-processor',
 *   name: 'Invoice Processor',
 *   config: {
 *     documentTypes: ['invoice'],
 *     extractionConfidence: 0.9,
 *   },
 *   autoStart: true,
 * });
 * 
 * // Send command to agent
 * await agentSpawner.command(result.agentId, { type: 'pause' });
 * 
 * // Get all active agents
 * const agents = agentSpawner.getAll();
 * 
 * // Get agents with specific capability
 * const docAgents = agentSpawner.getByCapability('document_extraction');
 * ```
 */

import {
  spawnAgent,
  startAgent,
  pauseAgent,
  terminateAgent,
  sendCommand,
  getAgent,
  getAllAgents,
  getAgentsByStatus,
  getAgentsByCapability,
  loadAgentsFromDatabase,
} from './spawner';
import { builtInTemplates, getTemplate, getTemplatesByType, getTemplateIds } from './templates';
import type {
  AgentTemplate,
  AgentInstance,
  SpawnRequest,
  SpawnResult,
  AgentCommand,
  AgentStatus,
  CapabilityType,
  AgentPool,
} from './types';

export const agentSpawner = {
  // Lifecycle
  spawn: spawnAgent,
  start: startAgent,
  pause: pauseAgent,
  terminate: terminateAgent,
  command: sendCommand,
  
  // Query
  get: getAgent,
  getAll: getAllAgents,
  getByStatus: getAgentsByStatus,
  getByCapability: getAgentsByCapability,
  
  // Templates
  templates: {
    getAll: () => builtInTemplates,
    get: getTemplate,
    getByType: getTemplatesByType,
    getIds: getTemplateIds,
  },
  
  // Initialization
  loadFromDatabase: loadAgentsFromDatabase,
};

// Re-export types
export type {
  AgentTemplate,
  AgentInstance,
  SpawnRequest,
  SpawnResult,
  AgentCommand,
  AgentStatus,
  CapabilityType,
  AgentPool,
};

// Re-export template utilities
export { builtInTemplates, getTemplate, getTemplatesByType, getTemplateIds };
