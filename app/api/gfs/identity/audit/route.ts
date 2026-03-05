// =============================================================================
// GFS IDENTITY - AUDIT & SECURITY API
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { ghostIdentity, AuditLogEntry, SecurityEventInput } from '@/lib/gfs/identity';

export const dynamic = 'force-dynamic';

// =============================================================================
// POST - Log actions or create security events
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'log': {
        const entry: AuditLogEntry = {
          userId: data.userId,
          agentId: data.agentId,
          sessionId: data.sessionId,
          action: data.logAction,
          resource: data.resource,
          resourceId: data.resourceId,
          details: data.details,
          previousState: data.previousState,
          newState: data.newState,
          success: data.success ?? true,
          errorMessage: data.errorMessage,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        };
        await ghostIdentity.logAction(entry);
        return NextResponse.json({ success: true });
      }

      case 'securityEvent': {
        const input: SecurityEventInput = {
          type: data.type,
          severity: data.severity,
          userId: data.userId,
          ipAddress: data.ipAddress,
          description: data.description,
          details: data.details,
          riskScore: data.riskScore,
        };
        await ghostIdentity.createSecurityEvent(input);
        return NextResponse.json({ success: true });
      }

      case 'resolveEvent': {
        await ghostIdentity.resolveSecurityEvent(
          data.eventId,
          data.resolution,
          data.resolvedBy
        );
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET - Retrieve audit logs and security events
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'logs';
    const hours = parseInt(searchParams.get('hours') || '24');

    switch (type) {
      case 'logs': {
        const userId = searchParams.get('userId') || undefined;
        const action = searchParams.get('action') || undefined;
        const resource = searchParams.get('resource') || undefined;
        const limit = parseInt(searchParams.get('limit') || '100');
        
        const logs = await ghostIdentity.getAuditLogs({
          userId,
          action,
          resource,
          limit,
        });
        return NextResponse.json({ success: true, logs });
      }

      case 'failed': {
        const logs = await ghostIdentity.getFailedActions(hours);
        return NextResponse.json({ success: true, logs });
      }

      case 'securityEvents': {
        const events = await ghostIdentity.getOpenSecurityEvents();
        return NextResponse.json({ success: true, events });
      }

      case 'securityStats': {
        const stats = await ghostIdentity.getSecurityStats(hours);
        return NextResponse.json({ success: true, stats });
      }

      case 'highRiskUsers': {
        const threshold = parseInt(searchParams.get('threshold') || '70');
        const users = await ghostIdentity.getHighRiskUsers(threshold);
        return NextResponse.json({ success: true, users });
      }

      default:
        return NextResponse.json(
          { error: `Unknown type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}
