// GFS Integrations API - Send SMS via Twilio

import { NextRequest, NextResponse } from 'next/server';
import { twilioConnector } from '@/lib/gfs/integrations';

export const dynamic = 'force-dynamic';

// POST /api/gfs/integrations/twilio/send - Send SMS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      );
    }

    if (!twilioConnector.isConfigured()) {
      return NextResponse.json(
        { error: 'Twilio not configured' },
        { status: 503 }
      );
    }

    const result = await twilioConnector.sendSMS(to, message);

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
    console.error('Twilio send error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}
