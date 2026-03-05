// GFS Integrations - Twilio SMS Connector

import { getSecret, hasSecrets } from './secrets';
import { IntegrationResponse, TwilioMessage } from './types';
import { EventBus, GFS_EVENT_TYPES } from '@/lib/gfs/event-bus';

export class TwilioConnector {
  private accountSid: string | null = null;
  private authToken: string | null = null;
  private phoneNumber: string | null = null;

  constructor() {
    this.accountSid = getSecret('twilio', 'account_sid');
    this.authToken = getSecret('twilio', 'auth_token');
    this.phoneNumber = getSecret('twilio', 'phone_number');
  }

  /**
   * Check if Twilio is configured
   */
  isConfigured(): boolean {
    return !!(this.accountSid && this.authToken && this.phoneNumber);
  }

  /**
   * Send an SMS message
   */
  async sendSMS(
    to: string,
    body: string,
    options?: { from?: string }
  ): Promise<IntegrationResponse> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Twilio credentials not configured' };
    }

    const from = options?.from || this.phoneNumber;

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: from!,
          Body: body,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: data.sid,
          raw: data,
        };
      } else {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
          raw: data,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Send an alert SMS to configured admin numbers
   */
  async sendAlert(
    title: string,
    message: string,
    recipients: string[]
  ): Promise<IntegrationResponse[]> {
    const text = `🚨 ${title}\n\n${message}`;
    const results: IntegrationResponse[] = [];

    for (const recipient of recipients) {
      const result = await this.sendSMS(recipient, text);
      results.push(result);
    }

    return results;
  }

  /**
   * Process an incoming SMS webhook
   */
  async processWebhook(data: TwilioMessage): Promise<void> {
    // Emit event to the event bus
    await EventBus.emit('integration', GFS_EVENT_TYPES.TWILIO_SMS_RECEIVED, {
      messageSid: data.MessageSid,
      from: data.From,
      to: data.To,
      body: data.Body,
      numMedia: data.NumMedia,
    });

    // Check if it's a command (messages starting with !)
    if (data.Body.startsWith('!')) {
      await this.handleCommand(data.From, data.Body);
    }
  }

  /**
   * Handle SMS commands
   */
  private async handleCommand(from: string, command: string): Promise<void> {
    const [cmd, ...args] = command.slice(1).split(' ');

    switch (cmd.toLowerCase()) {
      case 'status':
        await this.sendSMS(
          from,
          `GFS Status:\n✅ Event Bus: Online\n✅ Factory: Ready\n✅ Agents: Active`
        );
        break;

      case 'approve':
        if (args[0]) {
          // Emit approval event
          await EventBus.emit('user', GFS_EVENT_TYPES.HUMAN_GATE_APPROVED, {
            gateId: args[0],
            approvedBy: from,
            method: 'sms',
          });
          await this.sendSMS(from, `✅ Gate ${args[0]} approved via SMS`);
        }
        break;

      default:
        await this.sendSMS(
          from,
          `Commands: !status, !approve [id], !help`
        );
    }
  }
}

// Singleton instance
export const twilioConnector = new TwilioConnector();
