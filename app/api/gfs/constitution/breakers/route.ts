/**
 * Circuit Breaker Management API
 */

import { NextRequest, NextResponse } from 'next/server';
import { constitutionEnforcer } from '@/lib/gfs/constitution/enforcer';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gfs/constitution/breakers
 * Get all circuit breaker states
 */
export async function GET() {
  try {
    const breakers = constitutionEnforcer.getCircuitBreakerStates();
    
    return NextResponse.json({
      success: true,
      data: breakers
    });
  } catch (error) {
    console.error('Breakers GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get circuit breakers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gfs/constitution/breakers
 * Trip or reset a circuit breaker
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { breakerId, action, reason, resetBy } = body;
    
    if (!breakerId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: breakerId, action' },
        { status: 400 }
      );
    }
    
    if (action === 'trip') {
      await constitutionEnforcer.tripBreaker(breakerId, reason || 'Manual trip');
    } else if (action === 'reset') {
      await constitutionEnforcer.resetBreaker(breakerId, resetBy || 'unknown');
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "trip" or "reset"' },
        { status: 400 }
      );
    }
    
    const breakers = constitutionEnforcer.getCircuitBreakerStates();
    
    return NextResponse.json({
      success: true,
      data: breakers
    });
  } catch (error) {
    console.error('Breakers POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update circuit breaker' },
      { status: 500 }
    );
  }
}
