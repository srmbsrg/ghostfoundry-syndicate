// GFS Integrations API - Broadcast Alert

import { NextRequest, NextResponse } from 'next/server';
import { Integrations } from '@/lib/gfs/integrations';

export const dynamic = 'force-dynamic';

// POST /api/gfs/integrations/alert - Send alert through all channels
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, severity, telegramChatIds, smsRecipients } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: title, message' },
        { status: 400 }
      );
    }

    const results = await Integrations.broadcastAlert(title, message, {
      severity: severity || 'info',
      telegramChatIds,
      smsRecipients,
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Alert broadcast error:', error);
    return NextResponse.json(
      { error: 'Failed to broadcast alert' },
      { status: 500 }
    );
  }
}
