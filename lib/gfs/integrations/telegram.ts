// GFS Integrations - Telegram Bot Connector
// The Ghost's voice - communicate via Telegram

import { getSecret } from './secrets';
import { IntegrationResponse, TelegramMessage } from './types';
import { EventBus, GFS_EVENT_TYPES } from '@/lib/gfs/event-bus';
import prisma from '@/lib/db';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

// In-memory admin chat registry (persists across requests in serverless)
let adminChatIds: Set<number> = new Set();

export class TelegramConnector {
  private botToken: string | null = null;

  constructor() {
    this.botToken = getSecret('telegram', 'bot_token');
  }

  /**
   * Check if Telegram is configured
   */
  isConfigured(): boolean {
    return !!this.botToken;
  }

  /**
   * Register a chat as admin (receives notifications)
   */
  registerAdminChat(chatId: number): void {
    adminChatIds.add(chatId);
    console.log(`[Telegram] Registered admin chat: ${chatId}`);
  }

  /**
   * Get all registered admin chats
   */
  getAdminChats(): number[] {
    return Array.from(adminChatIds);
  }

  /**
   * Get bot info
   */
  async getMe(): Promise<IntegrationResponse> {
    if (!this.botToken) {
      return { success: false, error: 'Telegram bot token not configured' };
    }

    try {
      const response = await fetch(`${TELEGRAM_API_BASE}${this.botToken}/getMe`);
      const data = await response.json();

      return {
        success: data.ok,
        raw: data.result,
        error: data.ok ? undefined : data.description,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(
    chatId: string | number,
    text: string,
    options?: {
      parseMode?: 'Markdown' | 'HTML';
      replyMarkup?: unknown;
    }
  ): Promise<IntegrationResponse> {
    if (!this.botToken) {
      return { success: false, error: 'Telegram bot token not configured' };
    }

    try {
      const response = await fetch(`${TELEGRAM_API_BASE}${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: options?.parseMode,
          reply_markup: options?.replyMarkup,
        }),
      });

      const data = await response.json();

      return {
        success: data.ok,
        messageId: data.result?.message_id?.toString(),
        raw: data.result,
        error: data.ok ? undefined : data.description,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Send notification to all admin chats
   */
  async notifyAdmins(
    title: string,
    message: string,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
  ): Promise<IntegrationResponse> {
    const emoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      critical: '🚨',
    }[severity];

    const text = `${emoji} *${title}*\n\n${message}`;
    const admins = this.getAdminChats();

    if (admins.length === 0) {
      console.log('[Telegram] No admin chats registered');
      return { success: false, error: 'No admin chats registered' };
    }

    let successCount = 0;
    for (const chatId of admins) {
      const result = await this.sendMessage(chatId, text, { parseMode: 'Markdown' });
      if (result.success) successCount++;
    }

    return {
      success: successCount > 0,
      messageId: `notified-${successCount}-admins`,
    };
  }

  /**
   * Send human gate notification with inline approve/reject buttons
   */
  async notifyHumanGate(
    gateId: string,
    title: string,
    description: string,
    riskLevel: string
  ): Promise<IntegrationResponse> {
    const riskEmoji = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    }[riskLevel] || '⚪';

    const text = 
      `🚪 *Human Gate Requires Approval*\n\n` +
      `*Title:* ${title}\n` +
      `*Risk:* ${riskEmoji} ${riskLevel.toUpperCase()}\n\n` +
      `${description}\n\n` +
      `_Gate ID: ${gateId.slice(0, 8)}_\n\n` +
      `Reply with:\n` +
      `/approve ${gateId.slice(0, 8)} - Approve\n` +
      `/reject ${gateId.slice(0, 8)} - Reject`;

    return this.notifyAdmins('Action Required', text, 'warning');
  }

  /**
   * Process an incoming webhook update
   */
  async processUpdate(update: TelegramMessage): Promise<void> {
    if (!update.message?.text) {
      return;
    }

    const { message } = update;
    const text = message.text || '';
    const chatId = message.chat.id;

    // Emit event to the event bus
    await EventBus.emit('integration', GFS_EVENT_TYPES.TELEGRAM_MESSAGE_RECEIVED, {
      messageId: message.message_id,
      chatId,
      chatType: message.chat.type,
      fromId: message.from.id,
      fromUsername: message.from.username,
      text,
      timestamp: message.date,
    });

    // Check if it's a command
    if (text.startsWith('/')) {
      await this.handleCommand(chatId, text, message.from.username, message.from.id);
    }
  }

  /**
   * Handle bot commands
   */
  private async handleCommand(
    chatId: number,
    command: string,
    username?: string,
    userId?: number
  ): Promise<void> {
    const [cmd, ...args] = command.split(' ');
    const arg = args.join(' ').trim();

    switch (cmd.toLowerCase().split('@')[0]) { // Handle @botname suffix
      case '/start':
        // Register this chat for notifications
        this.registerAdminChat(chatId);
        await this.sendMessage(
          chatId,
          `👻 *Welcome to GhostFoundry-Syndicate*\n\n` +
          `I'm the Ghost - your AI Operations Agent.\n\n` +
          `✅ You're now registered for notifications.\n\n` +
          `*Commands:*\n` +
          `├ /status - System health\n` +
          `├ /pending - Awaiting approval\n` +
          `├ /approve <id> - Approve gate\n` +
          `├ /reject <id> - Reject gate\n` +
          `├ /analyze - Run pattern analysis\n` +
          `├ /events - Recent events\n` +
          `└ /help - All commands\n\n` +
          `_Your chat ID: ${chatId}_`,
          { parseMode: 'Markdown' }
        );
        break;

      case '/status':
        await this.handleStatus(chatId);
        break;

      case '/pending':
        await this.handlePending(chatId);
        break;

      case '/approve':
        await this.handleApprove(chatId, arg, username);
        break;

      case '/reject':
        await this.handleReject(chatId, arg, username);
        break;

      case '/analyze':
        await this.handleAnalyze(chatId);
        break;

      case '/events':
        await this.handleEvents(chatId);
        break;

      case '/help':
        await this.sendMessage(
          chatId,
          `📚 *Ghost Commands*\n\n` +
          `*Status & Monitoring*\n` +
          `├ /status - System health & metrics\n` +
          `├ /events - Recent 5 events\n` +
          `└ /analyze - Run pattern analysis\n\n` +
          `*Approvals*\n` +
          `├ /pending - List pending gates\n` +
          `├ /approve <id> - Approve a gate\n` +
          `└ /reject <id> - Reject a gate\n\n` +
          `*Info*\n` +
          `├ /chatid - Show your chat ID\n` +
          `└ /help - This message`,
          { parseMode: 'Markdown' }
        );
        break;

      case '/chatid':
        await this.sendMessage(chatId, `Your chat ID: \`${chatId}\``, { parseMode: 'Markdown' });
        break;

      default:
        await this.sendMessage(
          chatId,
          `❓ Unknown command: ${cmd}\n\nUse /help to see available commands.`
        );
    }
  }

  /**
   * /status - Show system status
   */
  private async handleStatus(chatId: number): Promise<void> {
    try {
      // Get real metrics from database
      const [eventCount, pendingGates, recentProposals] = await Promise.all([
        prisma.event.count(),
        prisma.humanGate.count({ where: { status: 'pending' } }),
        prisma.factoryEvent.count({ where: { type: 'self_mod_proposed' } }),
      ]);

      const admins = this.getAdminChats().length;

      await this.sendMessage(
        chatId,
        `📊 *Ghost System Status*\n\n` +
        `*Services*\n` +
        `├ 🟢 Event Bus: Online\n` +
        `├ 🟢 Dark Factory: Ready\n` +
        `├ 🟢 Self-Mod Engine: Active\n` +
        `└ 🟢 Observer: Running\n\n` +
        `*Metrics*\n` +
        `├ Events processed: ${eventCount}\n` +
        `├ Pending gates: ${pendingGates}\n` +
        `├ Proposals created: ${recentProposals}\n` +
        `└ Admin chats: ${admins}\n\n` +
        `_Updated: ${new Date().toLocaleString()}_`,
        { parseMode: 'Markdown' }
      );
    } catch (error) {
      await this.sendMessage(chatId, `❌ Error fetching status: ${error}`);
    }
  }

  /**
   * /pending - Show pending human gates
   */
  private async handlePending(chatId: number): Promise<void> {
    try {
      const gates = await prisma.humanGate.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      if (gates.length === 0) {
        await this.sendMessage(chatId, `✅ No pending approvals! All clear.`);
        return;
      }

      let msg = `🚪 *Pending Human Gates*\n\n`;
      
      for (const gate of gates) {
        const riskEmoji = {
          low: '🟢',
          medium: '🟡', 
          high: '🟠',
          critical: '🔴',
        }[(gate.context as { riskLevel?: string })?.riskLevel || 'medium'] || '⚪';
        
        const shortId = gate.id.slice(0, 8);
        const title = gate.description?.slice(0, 40) || 'Unnamed gate';
        
        msg += `${riskEmoji} \`${shortId}\`\n`;
        msg += `└ ${title}${title.length >= 40 ? '...' : ''}\n\n`;
      }

      msg += `_Reply /approve <id> or /reject <id>_`;

      await this.sendMessage(chatId, msg, { parseMode: 'Markdown' });
    } catch (error) {
      await this.sendMessage(chatId, `❌ Error fetching pending gates: ${error}`);
    }
  }

  /**
   * /approve <id> - Approve a human gate
   */
  private async handleApprove(chatId: number, gateIdPrefix: string, username?: string): Promise<void> {
    if (!gateIdPrefix) {
      await this.sendMessage(chatId, `⚠️ Usage: /approve <gate_id>\n\nUse /pending to see pending gates.`);
      return;
    }

    try {
      // Find gate by prefix
      const gate = await prisma.humanGate.findFirst({
        where: {
          id: { startsWith: gateIdPrefix },
          status: 'pending',
        },
      });

      if (!gate) {
        await this.sendMessage(chatId, `❌ No pending gate found with ID starting with: ${gateIdPrefix}`);
        return;
      }

      // Get existing context
      const existingContext = (gate.context as Record<string, unknown>) || {};
      
      // Update gate to approved
      await prisma.humanGate.update({
        where: { id: gate.id },
        data: {
          status: 'approved',
          resolvedAt: new Date(),
          context: {
            ...existingContext,
            resolution: `Approved via Telegram by @${username || 'unknown'} at ${new Date().toISOString()}`,
          },
        },
      });

      // Emit approval event
      await EventBus.emit('system', 'gfs.human_gate.approved', {
        gateId: gate.id,
        approvedBy: username || 'telegram_user',
        approvedAt: new Date().toISOString(),
      });

      await this.sendMessage(
        chatId,
        `✅ *Gate Approved*\n\n` +
        `ID: \`${gate.id.slice(0, 8)}\`\n` +
        `By: @${username || 'unknown'}\n\n` +
        `The Ghost will now proceed with the action.`,
        { parseMode: 'Markdown' }
      );
    } catch (error) {
      await this.sendMessage(chatId, `❌ Error approving gate: ${error}`);
    }
  }

  /**
   * /reject <id> - Reject a human gate
   */
  private async handleReject(chatId: number, gateIdPrefix: string, username?: string): Promise<void> {
    if (!gateIdPrefix) {
      await this.sendMessage(chatId, `⚠️ Usage: /reject <gate_id>\n\nUse /pending to see pending gates.`);
      return;
    }

    try {
      const gate = await prisma.humanGate.findFirst({
        where: {
          id: { startsWith: gateIdPrefix },
          status: 'pending',
        },
      });

      if (!gate) {
        await this.sendMessage(chatId, `❌ No pending gate found with ID starting with: ${gateIdPrefix}`);
        return;
      }

      // Get existing context
      const existingContext = (gate.context as Record<string, unknown>) || {};
      
      await prisma.humanGate.update({
        where: { id: gate.id },
        data: {
          status: 'rejected',
          resolvedAt: new Date(),
          context: {
            ...existingContext,
            resolution: `Rejected via Telegram by @${username || 'unknown'} at ${new Date().toISOString()}`,
          },
        },
      });

      await EventBus.emit('system', 'gfs.human_gate.rejected', {
        gateId: gate.id,
        rejectedBy: username || 'telegram_user',
        rejectedAt: new Date().toISOString(),
      });

      await this.sendMessage(
        chatId,
        `🛑 *Gate Rejected*\n\n` +
        `ID: \`${gate.id.slice(0, 8)}\`\n` +
        `By: @${username || 'unknown'}\n\n` +
        `The action has been cancelled.`,
        { parseMode: 'Markdown' }
      );
    } catch (error) {
      await this.sendMessage(chatId, `❌ Error rejecting gate: ${error}`);
    }
  }

  /**
   * /analyze - Trigger pattern analysis
   */
  private async handleAnalyze(chatId: number): Promise<void> {
    await this.sendMessage(chatId, `🔍 Running pattern analysis...`);

    try {
      // Call the observer API
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/gfs/observer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze' }),
      });

      const data = await response.json();

      if (data.success) {
        await this.sendMessage(
          chatId,
          `✅ *Analysis Complete*\n\n` +
          `Patterns detected: ${data.patternsDetected || 0}\n\n` +
          `${data.patternsDetected > 0 ? 'Check /pending for any new proposals.' : 'No actionable patterns found.'}`,
          { parseMode: 'Markdown' }
        );
      } else {
        await this.sendMessage(chatId, `⚠️ Analysis returned: ${data.error || 'unknown error'}`);
      }
    } catch (error) {
      await this.sendMessage(chatId, `❌ Error running analysis: ${error}`);
    }
  }

  /**
   * /events - Show recent events
   */
  private async handleEvents(chatId: number): Promise<void> {
    try {
      const events = await prisma.event.findMany({
        orderBy: { timestamp: 'desc' },
        take: 5,
      });

      if (events.length === 0) {
        await this.sendMessage(chatId, `📭 No events recorded yet.`);
        return;
      }

      let msg = `📡 *Recent Events*\n\n`;

      for (const event of events) {
        const timeAgo = this.getTimeAgo(event.timestamp);
        msg += `• \`${event.type}\`\n`;
        msg += `  _${timeAgo} via ${event.source}_\n\n`;
      }

      await this.sendMessage(chatId, msg, { parseMode: 'Markdown' });
    } catch (error) {
      await this.sendMessage(chatId, `❌ Error fetching events: ${error}`);
    }
  }

  /**
   * Helper: Format time ago
   */
  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  /**
   * Set up webhook for receiving updates
   */
  async setWebhook(url: string): Promise<IntegrationResponse> {
    if (!this.botToken) {
      return { success: false, error: 'Telegram bot token not configured' };
    }

    try {
      const response = await fetch(`${TELEGRAM_API_BASE}${this.botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      return {
        success: data.ok,
        error: data.ok ? undefined : data.description,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Delete webhook (switch to polling mode)
   */
  async deleteWebhook(): Promise<IntegrationResponse> {
    if (!this.botToken) {
      return { success: false, error: 'Telegram bot token not configured' };
    }

    try {
      const response = await fetch(`${TELEGRAM_API_BASE}${this.botToken}/deleteWebhook`);
      const data = await response.json();

      return {
        success: data.ok,
        error: data.ok ? undefined : data.description,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// Singleton instance
export const telegramConnector = new TelegramConnector();
