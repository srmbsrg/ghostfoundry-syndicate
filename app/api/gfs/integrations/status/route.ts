// GFS Integrations API - Status

import { NextRequest, NextResponse } from 'next/server';
import { Integrations } from '@/lib/gfs/integrations';

export const dynamic = 'force-dynamic';

// GET /api/gfs/integrations/status - Get integration status
export async function GET(request: NextRequest) {
  try {
    const status = Integrations.getStatus();

    return NextResponse.json({
      integrations: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Integration status error:', error);
    return NextResponse.json(
      { error: 'Failed to get integration status' },
      { status: 500 }
    );
  }
}
