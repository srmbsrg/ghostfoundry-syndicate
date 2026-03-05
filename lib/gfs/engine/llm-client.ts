/**
 * GFS LLM Client - The Ghost's connection to intelligence
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

export interface LLMConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

const DEFAULT_MODEL = 'gpt-4.1';
const API_URL = 'https://routellm.abacus.ai/v1/chat/completions';

export async function callLLM(
  messages: LLMMessage[],
  config: LLMConfig = {}
): Promise<LLMResponse> {
  const apiKey = process.env.ABACUSAI_API_KEY;
  if (!apiKey) {
    throw new Error('ABACUSAI_API_KEY not configured');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || DEFAULT_MODEL,
      messages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 2000,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LLM API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];

  return {
    content: choice?.message?.content || '',
    model: data.model,
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
    },
    finishReason: choice?.finish_reason || 'unknown',
  };
}

export function buildAgentSystemPrompt(agent: {
  name: string;
  type: string;
  description?: string | null;
  personality?: unknown;
  capabilities?: unknown;
}): string {
  const personality = agent.personality as Record<string, unknown> || {};
  const capabilities = Array.isArray(agent.capabilities) ? agent.capabilities : [];

  return `You are ${agent.name}, a ${agent.type} agent in the GhostFoundry-Syndicate system.

${agent.description || 'You assist with operations tasks.'}

Your capabilities: ${capabilities.join(', ') || 'general assistance'}

Personality traits:
- Communication style: ${personality.style || 'professional'}
- Verbosity: ${personality.verbosity || 'moderate'}
- Tone: ${personality.tone || 'helpful'}

Guidelines:
1. Be concise and actionable
2. If you need more information, ask specific questions
3. When completing tasks, provide structured output
4. Flag any concerns or risks you identify
5. Always explain your reasoning briefly

Respond in a structured format when appropriate.`;
}
