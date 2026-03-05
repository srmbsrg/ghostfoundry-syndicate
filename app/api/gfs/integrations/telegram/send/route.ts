// GFS Integrations API - Send Telegram Message

import { NextRequest, NextResponse } from 'next/server';
import { telegramConnector } from '@/lib/gfs/integrations';

export const dynamic = 'force-dynamic';

// POST /api/gfs/integrations/telegram/send - Send a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, message, parseMode } = body;

    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: chatId, message' },
        { status: 400 }
      );
    }

    if (!telegramConnector.isConfigured()) {
      return NextResponse.json(
        { error: 'Telegram bot not configured' },
        { status: 503 }
      );
    }

    const result = await telegramConnector.sendMessage(chatId, message, {
      parseMode: parseMode || 'Markdown',
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Telegram send error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
