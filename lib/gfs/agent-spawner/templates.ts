/**
 * Built-in Agent Templates
 * 
 * Pre-defined templates for common agent types.
 * New templates can be added via the Dark Factory or API.
 */

import { AgentTemplate, AgentType } from './types';

// Base template that others extend
const baseTemplate: Omit<AgentTemplate, 'id' | 'name' | 'type' | 'description' | 'capabilities' | 'configSchema'> = {
  version: '1.0.0',
  defaultConfig: {},
  resources: {
    maxConcurrentTasks: 5,
    memoryMB: 512,
    cpuPercent: 25,
    timeoutSeconds: 300,
    retryAttempts: 3,
  },
  tags: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-03-05'),
};

export const builtInTemplates: AgentTemplate[] = [
  // Document Processor
  {
    ...baseTemplate,
    id: 'tpl-document-processor',
    name: 'Document Processor',
    type: 'document_processor',
    description: 'Processes documents including invoices, contracts, and reports. Extracts structured data and validates content.',
    capabilities: [
      'document_extraction',
      'data_validation',
      'llm_reasoning',
      'memory_access',
      'event_publishing',
    ],
    configSchema: {
      type: 'object',
      properties: {
        documentTypes: {
          type: 'array',
          description: 'Types of documents this agent can process',
          items: { type: 'string', description: 'Document type' },
          default: ['invoice', 'contract', 'report'],
        },
        extractionConfidence: {
          type: 'number',
          description: 'Minimum confidence threshold for extraction (0-1)',
          default: 0.85,
        },
        autoValidate: {
          type: 'boolean',
          description: 'Automatically validate extracted data',
          default: true,
        },
      },
      required: ['documentTypes'],
    },
    defaultConfig: {
      documentTypes: ['invoice', 'contract', 'report'],
      extractionConfidence: 0.85,
      autoValidate: true,
    },
    resources: {
      maxConcurrentTasks: 10,
      memoryMB: 1024,
      cpuPercent: 40,
      timeoutSeconds: 120,
      retryAttempts: 3,
    },
    tags: ['documents', 'extraction', 'validation'],
  },

  // Data Analyzer
  {
    ...baseTemplate,
    id: 'tpl-data-analyzer',
    name: 'Data Analyzer',
    type: 'data_analyzer',
    description: 'Analyzes data patterns, detects anomalies, and generates insights. Monitors metrics and trends.',
    capabilities: [
      'metric_analysis',
      'anomaly_detection',
      'llm_reasoning',
      'memory_access',
      'event_publishing',
    ],
    configSchema: {
      type: 'object',
      properties: {
        dataSource: {
          type: 'string',
          description: 'Primary data source to analyze',
        },
        anomalyThreshold: {
          type: 'number',
          description: 'Standard deviations for anomaly detection',
          default: 2.5,
        },
        monitoringInterval: {
          type: 'number',
          description: 'Seconds between monitoring checks',
          default: 60,
        },
      },
      required: ['dataSource'],
    },
    defaultConfig: {
      anomalyThreshold: 2.5,
      monitoringInterval: 60,
    },
    tags: ['data', 'analytics', 'monitoring'],
  },

  // Communication Agent
  {
    ...baseTemplate,
    id: 'tpl-communication',
    name: 'Communication Agent',
    type: 'communication',
    description: 'Handles email analysis, response drafting, and communication workflows.',
    capabilities: [
      'email_analysis',
      'response_drafting',
      'llm_reasoning',
      'memory_access',
      'event_publishing',
      'human_escalation',
    ],
    configSchema: {
      type: 'object',
      properties: {
        channels: {
          type: 'array',
          description: 'Communication channels to monitor',
          items: { type: 'string', description: 'Item' },
          default: ['email'],
        },
        autoReply: {
          type: 'boolean',
          description: 'Automatically send drafted responses',
          default: false,
        },
        escalationThreshold: {
          type: 'string',
          description: 'When to escalate to human',
          enum: ['never', 'low_confidence', 'sensitive', 'always'],
          default: 'low_confidence',
        },
      },
      required: ['channels'],
    },
    defaultConfig: {
      channels: ['email'],
      autoReply: false,
      escalationThreshold: 'low_confidence',
    },
    tags: ['communication', 'email', 'drafting'],
  },

  // Report Generator
  {
    ...baseTemplate,
    id: 'tpl-report-generator',
    name: 'Report Generator',
    type: 'content_creator',
    description: 'Generates reports, summaries, and documentation. Creates formatted outputs from data.',
    capabilities: [
      'report_generation',
      'llm_reasoning',
      'memory_access',
      'event_publishing',
    ],
    configSchema: {
      type: 'object',
      properties: {
        reportTypes: {
          type: 'array',
          description: 'Types of reports to generate',
          items: { type: 'string', description: 'Item' },
          default: ['weekly_summary', 'intelligence_brief'],
        },
        outputFormats: {
          type: 'array',
          description: 'Output formats to support',
          items: { type: 'string', description: 'Item' },
          default: ['html', 'pdf', 'markdown'],
        },
        includeCharts: {
          type: 'boolean',
          description: 'Include data visualizations',
          default: true,
        },
      },
      required: ['reportTypes'],
    },
    defaultConfig: {
      reportTypes: ['weekly_summary', 'intelligence_brief'],
      outputFormats: ['html', 'pdf', 'markdown'],
      includeCharts: true,
    },
    tags: ['reports', 'content', 'documentation'],
  },

  // Integration Agent
  {
    ...baseTemplate,
    id: 'tpl-integration',
    name: 'Integration Agent',
    type: 'integration',
    description: 'Handles external API integrations, data sync, and system connections.',
    capabilities: [
      'api_integration',
      'data_validation',
      'event_publishing',
    ],
    configSchema: {
      type: 'object',
      properties: {
        integrations: {
          type: 'array',
          description: 'External systems to integrate with',
          items: { type: 'string', description: 'Item' },
        },
        syncInterval: {
          type: 'number',
          description: 'Seconds between sync operations',
          default: 300,
        },
        retryOnFailure: {
          type: 'boolean',
          description: 'Retry failed operations',
          default: true,
        },
      },
      required: ['integrations'],
    },
    defaultConfig: {
      syncInterval: 300,
      retryOnFailure: true,
    },
    tags: ['integration', 'api', 'sync'],
  },

  // Orchestrator Agent
  {
    ...baseTemplate,
    id: 'tpl-orchestrator',
    name: 'Orchestrator Agent',
    type: 'orchestrator',
    description: 'Coordinates workflows, manages agent collaboration, and handles complex multi-step processes.',
    capabilities: [
      'workflow_execution',
      'llm_reasoning',
      'memory_access',
      'event_publishing',
      'human_escalation',
    ],
    configSchema: {
      type: 'object',
      properties: {
        workflows: {
          type: 'array',
          description: 'Workflows this orchestrator manages',
          items: { type: 'string', description: 'Item' },
        },
        parallelExecution: {
          type: 'boolean',
          description: 'Allow parallel step execution',
          default: true,
        },
        maxParallelSteps: {
          type: 'number',
          description: 'Maximum concurrent steps',
          default: 5,
        },
      },
      required: ['workflows'],
    },
    defaultConfig: {
      parallelExecution: true,
      maxParallelSteps: 5,
    },
    resources: {
      maxConcurrentTasks: 3,
      memoryMB: 1024,
      cpuPercent: 30,
      timeoutSeconds: 600,
      retryAttempts: 2,
    },
    tags: ['orchestration', 'workflow', 'coordination'],
  },
];

/**
 * Get a template by ID
 */
export function getTemplate(templateId: string): AgentTemplate | undefined {
  return builtInTemplates.find(t => t.id === templateId);
}

/**
 * Get templates by type
 */
export function getTemplatesByType(type: AgentType): AgentTemplate[] {
  return builtInTemplates.filter(t => t.type === type);
}

/**
 * Get all template IDs
 */
export function getTemplateIds(): string[] {
  return builtInTemplates.map(t => t.id);
}
