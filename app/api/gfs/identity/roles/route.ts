// =============================================================================
// GFS IDENTITY - ROLES API
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { ghostIdentity, RoleInput } from '@/lib/gfs/identity';

export const dynamic = 'force-dynamic';

// =============================================================================
// POST - Create role or perform role actions
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action || 'create') {
      case 'create': {
        const input: RoleInput = {
          name: data.name,
          displayName: data.displayName,
          description: data.description,
          type: data.type,
          isDefault: data.isDefault,
          parentId: data.parentId,
          metadata: data.metadata,
        };
        const role = await ghostIdentity.createRole(input);
        return NextResponse.json({ success: true, role });
      }

      case 'assignPermission': {
        await ghostIdentity.assignPermissionToRole(data.roleId, data.permissionId);
        return NextResponse.json({ success: true });
      }

      case 'removePermission': {
        await ghostIdentity.removePermissionFromRole(data.roleId, data.permissionId);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Role API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET - List roles or get by ID/name
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');

    if (id) {
      const role = await ghostIdentity.getRole(id);
      if (!role) {
        return NextResponse.json({ error: 'Role not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, role });
    }

    if (name) {
      const role = await ghostIdentity.getRoleByName(name);
      if (!role) {
        return NextResponse.json({ error: 'Role not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, role });
    }

    // List all roles
    const roles = await ghostIdentity.listRoles();
    return NextResponse.json({ success: true, roles });
  } catch (error) {
    console.error('Role API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}
