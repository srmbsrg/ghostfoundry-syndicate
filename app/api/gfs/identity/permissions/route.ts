// =============================================================================
// GFS IDENTITY - PERMISSIONS API
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { ghostIdentity, PermissionInput } from '@/lib/gfs/identity';

export const dynamic = 'force-dynamic';

// =============================================================================
// POST - Create permission
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const input: PermissionInput = {
      name: body.name,
      displayName: body.displayName,
      description: body.description,
      resource: body.resource,
      action: body.action,
      scope: body.scope,
      metadata: body.metadata,
    };
    
    const permission = await ghostIdentity.createPermission(input);
    return NextResponse.json({ success: true, permission });
  } catch (error) {
    console.error('Permission API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET - List permissions or get by ID
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const resource = searchParams.get('resource');

    if (id) {
      const permission = await ghostIdentity.getPermission(id);
      if (!permission) {
        return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, permission });
    }

    if (resource) {
      const permissions = await ghostIdentity.getPermissionsForResource(resource as any);
      return NextResponse.json({ success: true, permissions });
    }

    // List all permissions
    const permissions = await ghostIdentity.listPermissions();
    return NextResponse.json({ success: true, permissions });
  } catch (error) {
    console.error('Permission API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}
