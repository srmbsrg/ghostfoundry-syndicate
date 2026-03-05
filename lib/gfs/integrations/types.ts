// GFS Integrations - Type Definitions

export interface IntegrationConfig {
  name: string;
  type: 'telegram' | 'twilio' | 'github' | 'webhook' | 'email';
  enabled: boolean;
  credentials?: Record<string, string>;
  settings?: Record<string, unknown>;
}

export interface MessagePayload {
  to: string;
  content: string;
  format?: 'text' | 'markdown' | 'html';
  metadata?: Record<string, unknown>;
}

export interface IntegrationResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  raw?: unknown;
}

export interface TelegramMessage {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
      title?: string;
      username?: string;
    };
    date: number;
    text?: string;
  };
}

export interface TwilioMessage {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia?: string;
}

export interface GitHubWebhookPayload {
  action?: string;
  repository?: {
    full_name: string;
    name: string;
  };
  sender?: {
    login: string;
  };
  [key: string]: unknown;
}
