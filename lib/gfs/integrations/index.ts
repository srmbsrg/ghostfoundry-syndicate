// GFS Integrations - Main Entry Point

export * from './types';
export { getSecret, hasSecrets, getSecretNames, clearSecretsCache } from './secrets';
export { telegramConnector, TelegramConnector } from './telegram';
export { twilioConnector, TwilioConnector } from './twilio';
export { githubConnector, GitHubConnector } from './github';

import { telegramConnector } from './telegram';
import { twilioConnector } from './twilio';
import { githubConnector } from './github';
import { hasSecrets } from './secrets';

/**
 * GFS Integrations Manager
 * 
 * Centralized access to all external integrations.
 * The Ghost's interface to the outside world.
 */
export const Integrations = {
  /**
   * Telegram Bot
   */
  telegram: telegramConnector,

  /**
   * Twilio SMS
   */
  twilio: twilioConnector,

  /**
   * GitHub
   */
  github: githubConnector,

  /**
   * Get integration status
   */
  getStatus(): Record<string, { configured: boolean; type: string }> {
    return {
      telegram: {
        configured: telegramConnector.isConfigured(),
        type: 'bot',
      },
      twilio: {
        configured: twilioConnector.isConfigured(),
        type: 'sms',
      },
      github: {
        configured: githubConnector.isConfigured(),
        type: 'api',
      },
    };
  },

  /**
   * Send an alert through all configured channels
   */
  async broadcastAlert(
    title: string,
    message: string,
    options?: {
      telegramChatIds?: number[];
      smsRecipients?: string[];
      severity?: 'info' | 'warning' | 'error' | 'critical';
    }
  ): Promise<{
    telegram?: { success: boolean; error?: string };
    sms?: { success: boolean; sent: number; failed: number };
  }> {
    const results: {
      telegram?: { success: boolean; error?: string };
      sms?: { success: boolean; sent: number; failed: number };
    } = {};

    // Send via Telegram if configured
    if (telegramConnector.isConfigured()) {
      const telegramResult = await telegramConnector.notifyAdmins(
        title,
        message,
        options?.severity
      );
      results.telegram = {
        success: telegramResult.success,
        error: telegramResult.error,
      };
    }

    // Send via SMS if configured and recipients provided
    if (twilioConnector.isConfigured() && options?.smsRecipients?.length) {
      const smsResults = await twilioConnector.sendAlert(
        title,
        message,
        options.smsRecipients
      );
      const sent = smsResults.filter(r => r.success).length;
      const failed = smsResults.length - sent;
      results.sms = { success: sent > 0, sent, failed };
    }

    return results;
  },
};

export default Integrations;
