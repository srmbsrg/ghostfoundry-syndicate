/**
 * Self-Modification Config API
 * 
 * Get and update self-modification engine configuration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { selfModificationEngine, DEFAULT_SELF_MOD_CONFIG } from '@/lib/gfs/self-mod';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gfs/self-mod/config
 * 
 * Get current configuration
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    config: DEFAULT_SELF_MOD_CONFIG
  });
}

/**
 * PUT /api/gfs/self-mod/config
 * 
 * Update configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate config values
    const validKeys = Object.keys(DEFAULT_SELF_MOD_CONFIG);
    const invalidKeys = Object.keys(body).filter(k => !validKeys.includes(k));
    
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { error: `Invalid config keys: ${invalidKeys.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Update config
    selfModificationEngine.updateConfig(body);
    
    return NextResponse.json({
      success: true,
      message: 'Configuration updated',
      config: { ...DEFAULT_SELF_MOD_CONFIG, ...body }
    });
    
  } catch (error) {
    console.error('Update config error:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
