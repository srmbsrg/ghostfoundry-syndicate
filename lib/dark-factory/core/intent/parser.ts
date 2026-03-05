/**
 * Intent Parser
 * Transforms natural language requests into structured specifications
 * using LLM-powered semantic analysis
 */

import {
  GenerationRequest,
  ParsedIntent,
  IntentType,
  ExtractedEntity,
  RequiredAction,
  EntityRelationship,
} from '@/lib/types/dark-factory';

const INTENT_PARSER_SYSTEM_PROMPT = `You are the Intent Parser for the Dark Factory, a code generation system.

Your task is to analyze natural language requests and extract structured specifications for code generation.

For each request, you must identify:
1. The primary intent type (what kind of code needs to be generated)
2. Entities involved (models, endpoints, components, etc.)
3. Properties and relationships between entities
4. Required actions to fulfill the request
5. Dependencies on existing system components

Intent Types:
- create_api_endpoint: Creating new REST API endpoints
- create_db_model: Creating new database models/tables
- create_ui_component: Creating React/UI components
- create_integration: Creating external service integrations
- create_agent: Creating AI agent definitions
- modify_existing: Modifying existing code
- create_workflow: Creating automated workflows
- unknown: Cannot determine intent

Entity Types:
- model: Database model/table
- endpoint: API endpoint
- component: React/UI component
- agent: AI agent
- workflow: Automated workflow

Relationship Types:
- has_many: One-to-many relationship
- belongs_to: Many-to-one relationship
- has_one: One-to-one relationship
- many_to_many: Many-to-many relationship

Action Types:
- generate: Create new code
- modify: Update existing code
- delete: Remove code
- test: Create tests
- deploy: Deploy to environment

Respond with a JSON object matching this exact schema:
{
  "type": "<intent_type>",
  "entities": [
    {
      "name": "<entity_name_PascalCase>",
      "type": "<entity_type>",
      "properties": { "<prop_name>": "<prop_type_or_description>" },
      "relationships": [
        { "targetEntity": "<name>", "type": "<relationship_type>" }
      ]
    }
  ],
  "actions": [
    {
      "type": "<action_type>",
      "target": "<what_to_act_on>",
      "params": {}
    }
  ],
  "dependencies": ["<existing_entity_or_system_names>"],
  "confidence": <0.0_to_1.0>
}

Be thorough in extracting all entities and their properties. Infer common fields (id, createdAt, updatedAt) automatically.`;

export async function parseIntent(
  request: GenerationRequest
): Promise<ParsedIntent> {
  const apiKey = process.env.ABACUSAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('ABACUSAI_API_KEY is not configured');
  }

  const userPrompt = buildUserPrompt(request);

  try {
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        messages: [
          { role: 'system', content: INTENT_PARSER_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
        temperature: 0.2, // Low temperature for consistent parsing
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in LLM response');
    }

    const parsed = JSON.parse(content);
    
    return {
      requestId: request.id,
      type: validated(parsed.type) as IntentType,
      entities: validateEntities(parsed.entities || []),
      actions: validateActions(parsed.actions || []),
      dependencies: parsed.dependencies || [],
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
      rawPrompt: request.prompt,
    };
  } catch (error) {
    console.error('Intent parsing failed:', error);
    
    // Return a fallback with unknown type
    return {
      requestId: request.id,
      type: 'unknown',
      entities: [],
      actions: [],
      dependencies: [],
      confidence: 0,
      rawPrompt: request.prompt,
    };
  }
}

function buildUserPrompt(request: GenerationRequest): string {
  let prompt = `Parse this code generation request:\n\n"${request.prompt}"`;
  
  if (request.context) {
    prompt += `\n\nContext:`;
    if (request.context.businessDomain) {
      prompt += `\n- Business Domain: ${request.context.businessDomain}`;
    }
    if (request.context.existingEntities?.length) {
      prompt += `\n- Existing Entities: ${request.context.existingEntities.join(', ')}`;
    }
    if (request.context.constraints?.length) {
      prompt += `\n- Constraints: ${request.context.constraints.join(', ')}`;
    }
    if (request.context.targetEnvironment) {
      prompt += `\n- Target Environment: ${request.context.targetEnvironment}`;
    }
  }
  
  return prompt;
}

function validated(intentType: string): IntentType {
  const validTypes: IntentType[] = [
    'create_api_endpoint',
    'create_db_model',
    'create_ui_component',
    'create_integration',
    'create_agent',
    'modify_existing',
    'create_workflow',
    'unknown',
  ];
  
  return validTypes.includes(intentType as IntentType) 
    ? (intentType as IntentType) 
    : 'unknown';
}

function validateEntities(entities: unknown[]): ExtractedEntity[] {
  if (!Array.isArray(entities)) return [];
  
  return entities.map((e: unknown) => {
    const entity = e as Record<string, unknown>;
    return {
      name: String(entity.name || 'Unknown'),
      type: (entity.type as ExtractedEntity['type']) || 'model',
      properties: (entity.properties as Record<string, unknown>) || {},
      relationships: validateRelationships(entity.relationships),
    };
  });
}

function validateRelationships(relationships: unknown): EntityRelationship[] {
  if (!Array.isArray(relationships)) return [];
  
  return relationships.map((r: unknown) => {
    const rel = r as Record<string, unknown>;
    return {
      targetEntity: String(rel.targetEntity || ''),
      type: (rel.type as EntityRelationship['type']) || 'has_many',
    };
  });
}

function validateActions(actions: unknown[]): RequiredAction[] {
  if (!Array.isArray(actions)) return [];
  
  return actions.map((a: unknown) => {
    const action = a as Record<string, unknown>;
    return {
      type: (action.type as RequiredAction['type']) || 'generate',
      target: String(action.target || ''),
      params: (action.params as Record<string, unknown>) || {},
    };
  });
}

export function estimateComplexity(intent: ParsedIntent): 'simple' | 'moderate' | 'complex' {
  const entityCount = intent.entities.length;
  const actionCount = intent.actions.length;
  const hasRelationships = intent.entities.some(e => e.relationships.length > 0);
  const hasDependencies = intent.dependencies.length > 0;
  
  const score = entityCount * 2 + actionCount + (hasRelationships ? 3 : 0) + (hasDependencies ? 2 : 0);
  
  if (score <= 4) return 'simple';
  if (score <= 10) return 'moderate';
  return 'complex';
}
