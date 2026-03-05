/**
 * GFS Telegram Webhook Handler
 * NOTE: This route is superseded by /api/gfs/integrations/telegram/webhook
 * Keeping for backwards compatibility
 */

import { NextRequest, NextResponse } from 'next/server';
import { telegramConnector } from '@/lib/gfs/integrations';
import { TelegramMessage } from '@/lib/gfs/integrations/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const update: TelegramMessage = await request.json();
    await telegramConnector.processUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    // Always return 200 to Telegram to prevent retries
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook active' });
}
