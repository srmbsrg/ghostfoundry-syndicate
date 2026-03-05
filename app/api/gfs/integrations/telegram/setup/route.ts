// GFS Integrations API - Telegram Bot Setup
// Configure webhook, test connection, get bot info

import { NextRequest, NextResponse } from 'next/server';
import { telegramConnector } from '@/lib/gfs/integrations';

export const dynamic = 'force-dynamic';

// GET /api/gfs/integrations/telegram/setup - Get bot info and webhook status
export async function GET(request: NextRequest) {
  try {
    if (!telegramConnector.isConfigured()) {
      return NextResponse.json(
        { error: 'Telegram bot not configured. Set TELEGRAM_BOT_TOKEN.' },
        { status: 503 }
      );
    }

    const botInfo = await telegramConnector.getMe();
    const admins = telegramConnector.getAdminChats();

    return NextResponse.json({
      success: true,
      configured: true,
      bot: botInfo.success ? botInfo.raw : null,
      adminChats: admins,
      adminCount: admins.length,
    });
  } catch (error) {
    console.error('Telegram setup error:', error);
    return NextResponse.json(
      { error: 'Failed to get bot info' },
      { status: 500 }
    );
  }
}

// POST /api/gfs/integrations/telegram/setup - Configure webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, webhookUrl, chatId } = body;

    if (!telegramConnector.isConfigured()) {
      return NextResponse.json(
        { error: 'Telegram bot not configured' },
        { status: 503 }
      );
    }

    switch (action) {
      case 'set_webhook': {
        if (!webhookUrl) {
          return NextResponse.json(
            { error: 'Missing webhookUrl' },
            { status: 400 }
          );
        }
        const result = await telegramConnector.setWebhook(webhookUrl);
        return NextResponse.json({
          success: result.success,
          message: result.success
            ? `Webhook set to: ${webhookUrl}`
            : result.error,
        });
      }

      case 'delete_webhook': {
        const result = await telegramConnector.deleteWebhook();
        return NextResponse.json({
          success: result.success,
          message: result.success ? 'Webhook deleted' : result.error,
        });
      }

      case 'register_admin': {
        if (!chatId) {
          return NextResponse.json(
            { error: 'Missing chatId' },
            { status: 400 }
          );
        }
        telegramConnector.registerAdminChat(Number(chatId));
        return NextResponse.json({
          success: true,
          message: `Chat ${chatId} registered as admin`,
          adminChats: telegramConnector.getAdminChats(),
        });
      }

      case 'test_message': {
        if (!chatId) {
          return NextResponse.json(
            { error: 'Missing chatId' },
            { status: 400 }
          );
        }
        const result = await telegramConnector.sendMessage(
          chatId,
          `🧪 *Test Message*\n\nGhost connection verified!\n\n_Sent at: ${new Date().toISOString()}_`,
          { parseMode: 'Markdown' }
        );
        return NextResponse.json({
          success: result.success,
          messageId: result.messageId,
          error: result.error,
        });
      }

      case 'notify_test': {
        const result = await telegramConnector.notifyAdmins(
          'Test Notification',
          'This is a test notification from the Ghost.\n\nIf you received this, notifications are working!',
          'info'
        );
        return NextResponse.json({
          success: result.success,
          message: result.success
            ? 'Notification sent to all admins'
            : result.error,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: set_webhook, delete_webhook, register_admin, test_message, notify_test' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Telegram setup error:', error);
    return NextResponse.json(
      { error: 'Failed to configure Telegram' },
      { status: 500 }
    );
  }
}
