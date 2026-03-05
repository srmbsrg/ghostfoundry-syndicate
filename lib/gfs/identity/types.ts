// =============================================================================
// GHOST IDENTITY & RBAC - TYPE DEFINITIONS
// User, Role, Permission types for the security layer
// =============================================================================

// =============================================================================
// USER TYPES
// =============================================================================

export type UserStatus = 'active' | 'suspended' | 'deactivated';

export type FederationProvider = 'azure_ad' | 'google' | 'okta' | 'local';

export interface GfsUser {
  id: string;
  email: string;
  name?: string;
  status: UserStatus;
  
  // Federation
  federationProvider?: FederationProvider;
  federationId?: string;
  
  // Profile
  avatar?: string;
  department?: string;
  title?: string;
  timezone: string;
  
  // Security
  mfaEnabled: boolean;
  lastLogin?: Date;
  failedAttempts: number;
  lockedUntil?: Date;
  
  // Metadata
  preferences: Record<string, unknown>;
  metadata: Record<string, unknown>;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Computed
  roles?: Role[];
  permissions?: Permission[];
}

export interface UserInput {
  email: string;
  name?: string;
  passwordHash?: string;
  federationProvider?: FederationProvider;
  federationId?: string;
  department?: string;
  title?: string;
  timezone?: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// ROLE TYPES
// =============================================================================

export type RoleType = 'system' | 'custom';

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type: RoleType;
  isDefault: boolean;
  parentId?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed
  permissions?: Permission[];
  inheritedPermissions?: Permission[];
}

export interface RoleInput {
  name: string;
  displayName: string;
  description?: string;
  type?: RoleType;
  isDefault?: boolean;
  parentId?: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// PERMISSION TYPES
// =============================================================================

export type PermissionAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'execute'
  | 'approve'
  | 'admin';

export type PermissionScope = 'all' | 'own' | 'team' | 'department';

export type PermissionResource =
  | 'user'
  | 'role'
  | 'permission'
  | 'agent'
  | 'workflow'
  | 'memory'
  | 'factory'
  | 'integration'
  | 'brief'
  | 'system';

export interface Permission {
  id: string;
  name: string;  // e.g., "agent:create:all"
  displayName: string;
  description?: string;
  resource: PermissionResource;
  action: PermissionAction;
  scope: PermissionScope;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface PermissionInput {
  name?: string;  // Auto-generated if not provided
  displayName: string;
  description?: string;
  resource: PermissionResource;
  action: PermissionAction;
  scope?: PermissionScope;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// AUTHORIZATION CHECK TYPES
// =============================================================================

export interface AuthorizationContext {
  userId: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  
  // For scope checking
  targetUserId?: string;  // For "own" scope
  teamId?: string;        // For "team" scope
  department?: string;    // For "department" scope
}

export interface AuthorizationRequest {
  resource: PermissionResource;
  action: PermissionAction;
  resourceId?: string;
  context: AuthorizationContext;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  matchedPermission?: Permission;
  riskScore?: number;  // For Sentinel to evaluate
}

// =============================================================================
// AUDIT TYPES
// =============================================================================

export type AuditAction =
  | 'login'
  | 'logout'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'execute'
  | 'approve'
  | 'deny'
  | 'grant'
  | 'revoke';

export interface AuditLogEntry {
  userId?: string;
  agentId?: string;
  sessionId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  previousState?: unknown;
  newState?: unknown;
  success: boolean;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

// =============================================================================
// SECURITY EVENT TYPES
// =============================================================================

export type SecurityEventType =
  | 'failed_login'
  | 'suspicious_activity'
  | 'permission_violation'
  | 'anomaly_detected'
  | 'brute_force'
  | 'session_hijack'
  | 'privilege_escalation';

export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type SecurityEventStatus = 'open' | 'investigating' | 'resolved' | 'false_positive';

export interface SecurityEventInput {
  type: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  ipAddress?: string;
  description: string;
  details?: Record<string, unknown>;
  riskScore?: number;
}

// =============================================================================
// DEFAULT ROLES
// =============================================================================

export const DEFAULT_ROLES: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Full system access - can do anything',
    type: 'system',
    isDefault: false,
    metadata: {},
  },
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Administrative access to manage users and roles',
    type: 'system',
    isDefault: false,
    metadata: {},
  },
  {
    name: 'operator',
    displayName: 'Operator',
    description: 'Can manage agents, workflows, and day-to-day operations',
    type: 'system',
    isDefault: false,
    metadata: {},
  },
  {
    name: 'viewer',
    displayName: 'Viewer',
    description: 'Read-only access to view system state',
    type: 'system',
    isDefault: true,
    metadata: {},
  },
];

// =============================================================================
// DEFAULT PERMISSIONS
// =============================================================================

export const RESOURCES: PermissionResource[] = [
  'user', 'role', 'permission', 'agent', 'workflow', 
  'memory', 'factory', 'integration', 'brief', 'system'
];

export const ACTIONS: PermissionAction[] = [
  'create', 'read', 'update', 'delete', 'execute', 'approve', 'admin'
];

export function generatePermissionName(
  resource: PermissionResource,
  action: PermissionAction,
  scope: PermissionScope = 'all'
): string {
  return `${resource}:${action}:${scope}`;
}
