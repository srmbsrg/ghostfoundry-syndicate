/**
 * GFS Self-Modification Engine - The Ghost extending itself
 */

import { prisma } from '@/lib/db';
import { callLLM, LLMMessage } from './llm-client';

export interface CapabilityRequest {
  description: string;
  requestedBy: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
}

export interface ModificationPlan {
  type: 'api_endpoint' | 'agent_template' | 'workflow' | 'integration' | 'schema_change';
  description: string;
  code?: string;
  schemaChanges?: string;
  risks: string[];
  requiresHumanApproval: boolean;
}

export async function analyzeCapabilityRequest(
  request: CapabilityRequest
): Promise<ModificationPlan[]> {
  const messages: LLMMessage[] = [
    {
      role: 'system',
      content: `You are the GhostFoundry-Syndicate Self-Modification Analyst. 
Analyze capability requests and propose implementation plans.

You can propose:
1. api_endpoint - New API routes
2. agent_template - New agent types
3. workflow - New automated workflows
4. integration - New external service connections
5. schema_change - Database model changes

Always identify risks and whether human approval is required.
Destructive operations (deleting data, modifying critical paths) ALWAYS require human approval.`,
    },
    {
      role: 'user',
      content: `Analyze this capability request and propose implementation plans:

Request: ${request.description}
Priority: ${request.priority}
Context: ${JSON.stringify(request.context || {})}

Provide a JSON array of modification plans with structure:
[
  {
    "type": "api_endpoint|agent_template|workflow|integration|schema_change",
    "description": "What this modification does",
    "risks": ["List of potential risks"],
    "requiresHumanApproval": true/false
  }
]`,
    },
  ];

  const response = await callLLM(messages, { temperature: 0.3 });

  try {
    const jsonMatch = response.content.match(/\[([\s\S]*?)\]/);
    if (jsonMatch) {
      return JSON.parse(`[${jsonMatch[1]}]`);
    }
  } catch {
    // Fall back to single plan
  }

  return [
    {
      type: 'api_endpoint',
      description: request.description,
      risks: ['Unable to fully analyze request'],
      requiresHumanApproval: true,
    },
  ];
}

export async function requestCapability(request: CapabilityRequest) {
  // Analyze the request
  const plans = await analyzeCapabilityRequest(request);

  // Log the request
  await prisma.factoryEvent.create({
    data: {
      type: 'capability_request',
      payload: JSON.parse(JSON.stringify({
        request,
        plans,
        timestamp: new Date().toISOString(),
      })),
    },
  });

  // Check if any plan requires human approval
  const requiresApproval = plans.some((p) => p.requiresHumanApproval);

  if (requiresApproval) {
    // Create human gate for approval
    const gate = await prisma.humanGate.create({
      data: {
        status: 'pending',
        description: `Self-Modification Request: ${request.description}\n\nPlans: ${plans.map((p) => `- ${p.type}: ${p.description}`).join('\n')}\n\nRisks: ${plans.flatMap((p) => p.risks).join(', ')}`,
        requiredApprovers: request.priority === 'critical' ? 2 : 1,
        context: JSON.parse(JSON.stringify({ request, plans })),
      },
    });

    return {
      status: 'pending_approval',
      gateId: gate.id,
      plans,
      message: 'Modification requires human approval before proceeding.',
    };
  }

  // Auto-approve low-risk modifications
  return executeModifications(plans, request);
}

export async function executeModifications(
  plans: ModificationPlan[],
  request: CapabilityRequest
) {
  const results = [];

  for (const plan of plans) {
    try {
      switch (plan.type) {
        case 'agent_template': {
          // Use Dark Factory to generate agent template
          const template = await prisma.agentTemplate.create({
            data: {
              name: `Auto-${Date.now()}`,
              description: plan.description,
              type: 'specialist',
              capabilities: JSON.parse(JSON.stringify(['auto_generated'])),
              personalityConfig: JSON.parse(JSON.stringify({ style: 'professional' })),
            },
          });
          results.push({ type: plan.type, success: true, id: template.id });
          break;
        }

        case 'workflow': {
          const workflow = await prisma.workflow.create({
            data: {
              name: `Auto-Workflow-${Date.now()}`,
              description: plan.description,
              trigger: JSON.parse(JSON.stringify({ type: 'MANUAL' })),
              status: 'draft', // Requires activation
            },
          });
          results.push({ type: plan.type, success: true, id: workflow.id });
          break;
        }

        case 'integration': {
          const integration = await prisma.integration.create({
            data: {
              name: `Auto-Integration-${Date.now()}`,
              type: 'webhook',
              status: 'inactive', // Requires configuration
              config: JSON.parse(JSON.stringify({ description: plan.description })),
            },
          });
          results.push({ type: plan.type, success: true, id: integration.id });
          break;
        }

        default:
          results.push({
            type: plan.type,
            success: false,
            error: `Modification type ${plan.type} requires manual implementation`,
          });
      }
    } catch (error) {
      results.push({
        type: plan.type,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Log execution
  await prisma.factoryEvent.create({
    data: {
      type: 'modification_executed',
      payload: JSON.parse(JSON.stringify({
        request,
        results,
        timestamp: new Date().toISOString(),
      })),
    },
  });

  return { status: 'executed', results };
}
