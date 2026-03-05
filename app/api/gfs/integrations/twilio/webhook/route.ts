// GFS Integrations API - Twilio SMS Webhook

import { NextRequest, NextResponse } from 'next/server';
import { twilioConnector } from '@/lib/gfs/integrations';
import { TwilioMessage } from '@/lib/gfs/integrations/types';

export const dynamic = 'force-dynamic';

// POST /api/gfs/integrations/twilio/webhook - Receive SMS via Twilio
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const message: TwilioMessage = {
      MessageSid: formData.get('MessageSid') as string,
      From: formData.get('From') as string,
      To: formData.get('To') as string,
      Body: formData.get('Body') as string,
      NumMedia: formData.get('NumMedia') as string,
    };

    console.log('[Twilio Webhook] Received SMS from:', message.From);

    // Process the message
    await twilioConnector.processWebhook(message);

    // Return TwiML response
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        headers: { 'Content-Type': 'application/xml' },
      }
    );
  } catch (error) {
    console.error('Twilio webhook error:', error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        headers: { 'Content-Type': 'application/xml' },
      }
    );
  }
}
