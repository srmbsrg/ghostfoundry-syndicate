// GFS Integrations API - Telegram Webhook

import { NextRequest, NextResponse } from 'next/server';
import { telegramConnector } from '@/lib/gfs/integrations';
import { TelegramMessage } from '@/lib/gfs/integrations/types';

export const dynamic = 'force-dynamic';

// POST /api/gfs/integrations/telegram/webhook - Receive Telegram updates
export async function POST(request: NextRequest) {
  try {
    const update: TelegramMessage = await request.json();

    console.log('[Telegram Webhook] Received update:', update.update_id);

    // Process the update
    await telegramConnector.processUpdate(update);

    // Telegram expects 200 OK
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    // Still return 200 to prevent Telegram from retrying
    return NextResponse.json({ ok: true });
  }
}
