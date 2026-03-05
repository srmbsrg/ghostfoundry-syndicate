// =============================================================================
// GFS IDENTITY - USERS API
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { ghostIdentity, UserInput } from '@/lib/gfs/identity';

export const dynamic = 'force-dynamic';

// =============================================================================
// POST - Create user or perform user actions
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create': {
        const input: UserInput = {
          email: data.email,
          name: data.name,
          passwordHash: data.passwordHash,
          federationProvider: data.federationProvider,
          federationId: data.federationId,
          department: data.department,
          title: data.title,
          timezone: data.timezone,
          metadata: data.metadata,
        };
        const user = await ghostIdentity.createUser(input);
        return NextResponse.json({ success: true, user });
      }

      case 'assignRole': {
        await ghostIdentity.assignRoleToUser(
          data.userId,
          data.roleId,
          data.grantedBy
        );
        return NextResponse.json({ success: true });
      }

      case 'removeRole': {
        await ghostIdentity.removeRoleFromUser(data.userId, data.roleId);
        return NextResponse.json({ success: true });
      }

      case 'recordLogin': {
        await ghostIdentity.recordUserLogin(
          data.userId,
          data.ipAddress,
          data.userAgent
        );
        return NextResponse.json({ success: true });
      }

      case 'recordFailedLogin': {
        await ghostIdentity.recordFailedLogin(data.email, data.ipAddress);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET - Get users
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (id) {
      const user = await ghostIdentity.getUser(id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, user });
    }

    if (email) {
      const user = await ghostIdentity.getUserByEmail(email);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json(
      { error: 'Provide id or email parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}

// =============================================================================
// PATCH - Update user
// =============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const body = await request.json();
    const user = await ghostIdentity.updateUser(id, body);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}
