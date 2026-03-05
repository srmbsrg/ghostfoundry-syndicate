// =============================================================================
// GFS IDENTITY - AUTHORIZATION API
// Check permissions and authorize actions
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { ghostIdentity, AuthorizationRequest } from '@/lib/gfs/identity';

export const dynamic = 'force-dynamic';

// =============================================================================
// POST - Check authorization
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action || 'check') {
      case 'check': {
        const authRequest: AuthorizationRequest = {
          resource: data.resource,
          action: data.actionType,  // Using actionType to avoid conflict with 'action'
          resourceId: data.resourceId,
          context: {
            userId: data.userId,
            sessionId: data.sessionId,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            targetUserId: data.targetUserId,
            teamId: data.teamId,
            department: data.department,
          },
        };
        
        const result = await ghostIdentity.authorize(authRequest);
        return NextResponse.json({ success: true, result });
      }

      case 'hasPermission': {
        const allowed = await ghostIdentity.hasPermission(
          data.userId,
          data.resource,
          data.actionType
        );
        return NextResponse.json({ success: true, allowed });
      }

      case 'getUserPermissions': {
        const permissions = await ghostIdentity.getUserPermissions(data.userId);
        return NextResponse.json({ success: true, permissions });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Authorization API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}
