/**
 * GFS Constitution API
 * 
 * Endpoints for viewing and interacting with the Ghost's constitutional rules.
 */

import { NextRequest, NextResponse } from 'next/server';
import { constitutionEnforcer, ActionRequest } from '@/lib/gfs/constitution/enforcer';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gfs/constitution
 * Get the current constitution and circuit breaker states
 */
export async function GET() {
  try {
    const constitution = constitutionEnforcer.getConstitution();
    const circuitBreakers = constitutionEnforcer.getCircuitBreakerStates();
    
    return NextResponse.json({
      success: true,
      data: {
        constitution: {
          version: constitution.version,
          effectiveDate: constitution.effectiveDate,
          stats: {
            zoneRules: constitution.zoneRules.length,
            greenRules: constitution.zoneRules.filter(r => r.zone === 'green').length,
            yellowRules: constitution.zoneRules.filter(r => r.zone === 'yellow').length,
            redRules: constitution.zoneRules.filter(r => r.zone === 'red').length,
            circuitBreakers: constitution.circuitBreakers.length,
            inviolableLaws: constitution.inviolableLaws.length,
            memoryMandates: constitution.memoryMandates.length,
            learningConstraints: constitution.learningConstraints.length
          },
          zoneRules: constitution.zoneRules,
          inviolableLaws: constitution.inviolableLaws,
          memoryMandates: constitution.memoryMandates,
          learningConstraints: constitution.learningConstraints
        },
        circuitBreakers
      }
    });
  } catch (error) {
    console.error('Constitution GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve constitution' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gfs/constitution
 * Evaluate an action against the constitution
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, actor, target, operation, context } = body;
    
    if (!action || !actor || !target || !operation) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: action, actor, target, operation' },
        { status: 400 }
      );
    }
    
    const actionRequest: ActionRequest = {
      id: `action-${Date.now()}`,
      type: action,
      actor,
      target,
      operation,
      context: context || {},
      timestamp: new Date()
    };
    
    const result = await constitutionEnforcer.evaluate(actionRequest);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Constitution POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to evaluate action' },
      { status: 500 }
    );
  }
}
