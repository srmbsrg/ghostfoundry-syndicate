// =============================================================================
// GHOST IDENTITY SYSTEM - PUBLIC API
// High-level interface for identity and RBAC operations
// =============================================================================

import { userManager, roleManager, permissionManager, authorizationEngine } from './rbac';
import { auditLogger, securityEventManager } from './audit';
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
  AuditLogEntry,
  SecurityEventInput,
  PermissionResource,
  PermissionAction,
  DEFAULT_ROLES,
  RESOURCES,
  ACTIONS,
  generatePermissionName,
} from './types';

// Re-export types
export type {
  GfsUser,
  UserInput,
  Role,
  RoleInput,
  Permission,
  PermissionInput,
  AuthorizationContext,
  AuthorizationRequest,
  AuthorizationResult,
  AuditLogEntry,
  SecurityEventInput,
  PermissionResource,
  PermissionAction,
};

export { DEFAULT_ROLES, RESOURCES, ACTIONS, generatePermissionName };

// =============================================================================
// GHOST IDENTITY CLASS
// =============================================================================

class GhostIdentity {
  // ---------------------------------------------------------------------------
  // USER OPERATIONS
  // ---------------------------------------------------------------------------
  
  async createUser(input: UserInput): Promise<GfsUser> {
    return userManager.create(input);
  }

  async getUser(id: string): Promise<GfsUser | null> {
    return userManager.getById(id);
  }

  async getUserByEmail(email: string): Promise<GfsUser | null> {
    return userManager.getByEmail(email);
  }

  async updateUser(id: string, updates: Partial<UserInput>): Promise<GfsUser | null> {
    return userManager.update(id, updates);
  }

  async assignRoleToUser(userId: string, roleId: string, grantedBy?: string): Promise<void> {
    return userManager.assignRole(userId, roleId, grantedBy);
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    return userManager.removeRole(userId, roleId);
  }

  async recordUserLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    return userManager.recordLogin(userId, ipAddress, userAgent);
  }

  async recordFailedLogin(email: string, ipAddress?: string): Promise<void> {
    return userManager.recordFailedLogin(email, ipAddress);
  }

  // ---------------------------------------------------------------------------
  // ROLE OPERATIONS
  // ---------------------------------------------------------------------------
  
  async createRole(input: RoleInput): Promise<Role> {
    return roleManager.create(input);
  }

  async getRole(id: string): Promise<Role | null> {
    return roleManager.getById(id);
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return roleManager.getByName(name);
  }

  async listRoles(): Promise<Role[]> {
    return roleManager.list();
  }

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    return roleManager.assignPermission(roleId, permissionId);
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    return roleManager.removePermission(roleId, permissionId);
  }

  // ---------------------------------------------------------------------------
  // PERMISSION OPERATIONS
  // ---------------------------------------------------------------------------
  
  async createPermission(input: PermissionInput): Promise<Permission> {
    return permissionManager.create(input);
  }

  async getPermission(id: string): Promise<Permission | null> {
    return permissionManager.getById(id);
  }

  async listPermissions(): Promise<Permission[]> {
    return permissionManager.list();
  }

  async getPermissionsForResource(resource: PermissionResource): Promise<Permission[]> {
    return permissionManager.getForResource(resource);
  }

  // ---------------------------------------------------------------------------
  // AUTHORIZATION
  // ---------------------------------------------------------------------------
  
  async authorize(request: AuthorizationRequest): Promise<AuthorizationResult> {
    return authorizationEngine.authorize(request);
  }

  async hasPermission(
    userId: string,
    resource: PermissionResource,
    action: PermissionAction
  ): Promise<boolean> {
    return authorizationEngine.hasPermission(userId, resource, action);
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    return authorizationEngine.collectUserPermissions(userId);
  }

  // ---------------------------------------------------------------------------
  // AUDIT & SECURITY
  // ---------------------------------------------------------------------------
  
  async logAction(entry: AuditLogEntry): Promise<void> {
    return auditLogger.log(entry);
  }

  async getAuditLogs(options?: {
    userId?: string;
    action?: string;
    resource?: string;
    limit?: number;
  }): Promise<any[]> {
    return auditLogger.getRecentLogs(options);
  }

  async getFailedActions(hours?: number): Promise<any[]> {
    return auditLogger.getFailedActions(hours);
  }

  async createSecurityEvent(input: SecurityEventInput): Promise<void> {
    return securityEventManager.create(input);
  }

  async getOpenSecurityEvents(): Promise<any[]> {
    return securityEventManager.getOpenEvents();
  }

  async resolveSecurityEvent(
    eventId: string,
    resolution: string,
    resolvedBy: string
  ): Promise<void> {
    return securityEventManager.resolveEvent(eventId, resolution, resolvedBy);
  }

  async getSecurityStats(hours?: number): Promise<{
    total: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    avgRiskScore: number;
  }> {
    return securityEventManager.getEventStats(hours);
  }

  async getHighRiskUsers(threshold?: number): Promise<any[]> {
    return securityEventManager.getHighRiskUsers(threshold);
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const ghostIdentity = new GhostIdentity();

// Also export class for testing
export { GhostIdentity };

// Export managers for advanced use
export { userManager, roleManager, permissionManager, authorizationEngine };
export { auditLogger, securityEventManager };
