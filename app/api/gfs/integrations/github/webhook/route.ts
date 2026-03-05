// GFS Integrations API - GitHub Webhook

import { NextRequest, NextResponse } from 'next/server';
import { githubConnector } from '@/lib/gfs/integrations';
import { GitHubWebhookPayload } from '@/lib/gfs/integrations/types';

export const dynamic = 'force-dynamic';

// POST /api/gfs/integrations/github/webhook - Receive GitHub webhooks
export async function POST(request: NextRequest) {
  try {
    const event = request.headers.get('X-GitHub-Event') || 'unknown';
    const signature = request.headers.get('X-Hub-Signature-256');
    const delivery = request.headers.get('X-GitHub-Delivery');

    const payload: GitHubWebhookPayload = await request.json();

    console.log(`[GitHub Webhook] Event: ${event}, Delivery: ${delivery}`);

    // Process the webhook
    await githubConnector.processWebhook(event, payload);

    return NextResponse.json({ received: true, event, delivery });
  } catch (error) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
