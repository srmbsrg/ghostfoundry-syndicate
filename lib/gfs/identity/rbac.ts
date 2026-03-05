// =============================================================================
// GHOST RBAC ENGINE
// Role-Based Access Control with hierarchy and scope support
// =============================================================================

import { prisma } from '@/lib/db';
import {
  GfsUser,
  UserInput,
  Role,
  RoleInput,
  Permission,
  PermissionInput,
  AuthorizationContext,
  AuthorizationRequest,
  AuthorizationResult,
  PermissionResource,
  PermissionAction,
  PermissionScope,
  generatePermissionName,
} from './types';
import { auditLogger } from './audit';

// =============================================================================
// USER MANAGEMENT
// =============================================================================

export class UserManager {
  async create(input: UserInput): Promise<GfsUser> {
    const user = await prisma.gfsUser.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash,
        federationProvider: input.federationProvider,
        federationId: input.federationId,
        department: input.department,
        title: input.title,
        timezone: input.timezone || 'UTC',
        metadata: JSON.parse(JSON.stringify(input.metadata || {})),
      },
    });
    
    // Assign default roles
    const defaultRoles = await prisma.role.findMany({
      where: { isDefault: true },
    });
    
    for (const role of defaultRoles) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });
    }
    
    await auditLogger.log({
      action: 'create',
      resource: 'user',
      resourceId: user.id,
      details: { email: user.email },
      success: true,
    });
    
    return user as unknown as GfsUser;
  }

  async getById(id: string): Promise<GfsUser | null> {
    const user = await prisma.gfsUser.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });
    
    return user as unknown as GfsUser;
  }

  async getByEmail(email: string): Promise<GfsUser | null> {
    const user = await prisma.gfsUser.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });
    
    return user as unknown as GfsUser;
  }

  async getByFederation(provider: string, federationId: string): Promise<GfsUser | null> {
    const user = await prisma.gfsUser.findFirst({
      where: {
        federationProvider: provider,
        federationId: federationId,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
    
    return user as unknown as GfsUser;
  }

  async update(id: string, updates: Partial<UserInput>): Promise<GfsUser | null> {
    const user = await prisma.gfsUser.update({
      where: { id },
      data: updates as any,
    });
    
    await auditLogger.log({
      action: 'update',
      resource: 'user',
      resourceId: id,
      details: updates,
      success: true,
    });
    
    return user as unknown as GfsUser;
  }

  async assignRole(userId: string, roleId: string, grantedBy?: string): Promise<void> {
    await prisma.userRole.create({
      data: {
        userId,
        roleId,
        grantedBy,
      },
    });
    
    await auditLogger.log({
      action: 'grant',
      resource: 'role',
      resourceId: roleId,
      details: { userId, grantedBy },
      success: true,
    });
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    await prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });
    
    await auditLogger.log({
      action: 'revoke',
      resource: 'role',
      resourceId: roleId,
      details: { userId },
      success: true,
    });
  }

  async recordLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await prisma.gfsUser.update({
      where: { id: userId },
      data: {
        lastLogin: new Date(),
        failedAttempts: 0,
      },
    });
    
    await auditLogger.log({
      userId,
      action: 'login',
      resource: 'session',
      ipAddress,
      userAgent,
      success: true,
    });
  }

  async recordFailedLogin(email: string, ipAddress?: string): Promise<void> {
    const user = await prisma.gfsUser.findUnique({ where: { email } });
    
    if (user) {
      const newAttempts = user.failedAttempts + 1;
      const lockUntil = newAttempts >= 5 
        ? new Date(Date.now() + 15 * 60 * 1000)  // Lock for 15 minutes
        : null;
      
      await prisma.gfsUser.update({
        where: { id: user.id },
        data: {
          failedAttempts: newAttempts,
          lockedUntil: lockUntil,
        },
      });
      
      await auditLogger.log({
        userId: user.id,
        action: 'login',
        resource: 'session',
        ipAddress,
        success: false,
        errorMessage: 'Invalid credentials',
      });
    }
  }
}

// =============================================================================
// ROLE MANAGEMENT
// =============================================================================

export class RoleManager {
  async create(input: RoleInput): Promise<Role> {
    const role = await prisma.role.create({
      data: {
        name: input.name,
        displayName: input.displayName,
        description: input.description,
        type: input.type || 'custom',
        isDefault: input.isDefault || false,
        parentId: input.parentId,
        metadata: JSON.parse(JSON.stringify(input.metadata || {})),
      },
    });
    
    await auditLogger.log({
      action: 'create',
      resource: 'role',
      resourceId: role.id,
      details: { name: role.name },
      success: true,
    });
    
    return role as unknown as Role;
  }

  async getById(id: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
        parent: true,
        children: true,
      },
    });
    
    return role as unknown as Role;
  }

  async getByName(name: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({
      where: { name },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
    
    return role as unknown as Role;
  }

  async list(): Promise<Role[]> {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    });
    
    return roles as unknown as Role[];
  }

  async assignPermission(roleId: string, permissionId: string): Promise<void> {
    await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
    
    await auditLogger.log({
      action: 'grant',
      resource: 'permission',
      resourceId: permissionId,
      details: { roleId },
      success: true,
    });
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    await prisma.rolePermission.deleteMany({
      where: { roleId, permissionId },
    });
    
    await auditLogger.log({
      action: 'revoke',
      resource: 'permission',
      resourceId: permissionId,
      details: { roleId },
      success: true,
    });
  }

  async getInheritedPermissions(roleId: string): Promise<Permission[]> {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { parent: true },
    });
    
    if (!role?.parentId) return [];
    
    const parentPermissions = await prisma.rolePermission.findMany({
      where: { roleId: role.parentId },
      include: { permission: true },
    });
    
    const inherited = parentPermissions.map(rp => rp.permission);
    const ancestorPermissions = await this.getInheritedPermissions(role.parentId);
    
    return [...inherited, ...ancestorPermissions] as unknown as Permission[];
  }
}

// =============================================================================
// PERMISSION MANAGEMENT
// =============================================================================

export class PermissionManager {
  async create(input: PermissionInput): Promise<Permission> {
    const name = input.name || generatePermissionName(input.resource, input.action, input.scope);
    
    const permission = await prisma.permission.create({
      data: {
        name,
        displayName: input.displayName,
        description: input.description,
        resource: input.resource,
        action: input.action,
        scope: input.scope || 'all',
        metadata: JSON.parse(JSON.stringify(input.metadata || {})),
      },
    });
    
    return permission as unknown as Permission;
  }

  async getById(id: string): Promise<Permission | null> {
    const permission = await prisma.permission.findUnique({ where: { id } });
    return permission as unknown as Permission;
  }

  async getByName(name: string): Promise<Permission | null> {
    const permission = await prisma.permission.findUnique({ where: { name } });
    return permission as unknown as Permission;
  }

  async list(): Promise<Permission[]> {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
    return permissions as unknown as Permission[];
  }

  async getForResource(resource: PermissionResource): Promise<Permission[]> {
    const permissions = await prisma.permission.findMany({
      where: { resource },
      orderBy: { action: 'asc' },
    });
    return permissions as unknown as Permission[];
  }
}

// =============================================================================
// AUTHORIZATION ENGINE
// =============================================================================

export class AuthorizationEngine {
  private userManager: UserManager;
  private roleManager: RoleManager;

  constructor() {
    this.userManager = new UserManager();
    this.roleManager = new RoleManager();
  }

  async authorize(request: AuthorizationRequest): Promise<AuthorizationResult> {
    const user = await this.userManager.getById(request.context.userId);
    
    if (!user) {
      return {
        allowed: false,
        reason: 'User not found',
        riskScore: 100,
      };
    }
    
    // Check if user is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return {
        allowed: false,
        reason: 'Account is locked',
        riskScore: 80,
      };
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      return {
        allowed: false,
        reason: `Account is ${user.status}`,
        riskScore: 70,
      };
    }
    
    // Collect all permissions from roles
    const permissions = await this.collectUserPermissions(request.context.userId);
    
    // Check for matching permission
    for (const permission of permissions) {
      if (this.permissionMatches(permission, request)) {
        // Check scope
        if (this.scopeMatches(permission, request.context)) {
          return {
            allowed: true,
            matchedPermission: permission,
            riskScore: 0,
          };
        }
      }
    }
    
    // No matching permission found
    await auditLogger.log({
      userId: request.context.userId,
      action: 'deny',
      resource: request.resource,
      resourceId: request.resourceId,
      details: { requestedAction: request.action },
      success: false,
      errorMessage: 'Permission denied',
      ipAddress: request.context.ipAddress,
      userAgent: request.context.userAgent,
    });
    
    return {
      allowed: false,
      reason: 'Permission denied',
      riskScore: 50,
    };
  }

  async collectUserPermissions(userId: string): Promise<Permission[]> {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });
    
    const allPermissions: Permission[] = [];
    const seen = new Set<string>();
    
    for (const userRole of userRoles) {
      // Direct permissions
      for (const rp of userRole.role.permissions) {
        if (!seen.has(rp.permission.id)) {
          allPermissions.push(rp.permission as unknown as Permission);
          seen.add(rp.permission.id);
        }
      }
      
      // Inherited permissions
      const inherited = await this.roleManager.getInheritedPermissions(userRole.role.id);
      for (const p of inherited) {
        if (!seen.has(p.id)) {
          allPermissions.push(p);
          seen.add(p.id);
        }
      }
    }
    
    return allPermissions;
  }

  private permissionMatches(permission: Permission, request: AuthorizationRequest): boolean {
    // Admin permission grants everything for that resource
    if (permission.action === 'admin' && permission.resource === request.resource) {
      return true;
    }
    
    // System admin grants everything
    if (permission.resource === 'system' && permission.action === 'admin') {
      return true;
    }
    
    // Exact match
    return permission.resource === request.resource && 
           permission.action === request.action;
  }

  private scopeMatches(permission: Permission, context: AuthorizationContext): boolean {
    const scope = permission.scope as PermissionScope;
    
    switch (scope) {
      case 'all':
        return true;
        
      case 'own':
        return context.targetUserId === context.userId;
        
      case 'team':
        // Would need to check team membership
        return !!context.teamId;
        
      case 'department':
        // Would need to check department membership
        return !!context.department;
        
      default:
        return false;
    }
  }

  async hasPermission(
    userId: string,
    resource: PermissionResource,
    action: PermissionAction
  ): Promise<boolean> {
    const result = await this.authorize({
      resource,
      action,
      context: { userId },
    });
    return result.allowed;
  }
}

// =============================================================================
// SINGLETON EXPORTS
// =============================================================================

export const userManager = new UserManager();
export const roleManager = new RoleManager();
export const permissionManager = new PermissionManager();
export const authorizationEngine = new AuthorizationEngine();
