// =============================================================================
// GHOST AUDIT LOGGER
// Comprehensive logging for all system actions
// =============================================================================

import { prisma } from '@/lib/db';
import {
  AuditLogEntry,
  SecurityEventInput,
  SecuritySeverity,
} from './types';

// =============================================================================
// AUDIT LOGGER
// =============================================================================

export class AuditLogger {
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: entry.userId,
          agentId: entry.agentId,
          sessionId: entry.sessionId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          details: JSON.parse(JSON.stringify(entry.details || {})),
          previousState: entry.previousState ? JSON.parse(JSON.stringify(entry.previousState)) : null,
          newState: entry.newState ? JSON.parse(JSON.stringify(entry.newState)) : null,
          success: entry.success,
          errorMessage: entry.errorMessage,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });
    } catch (error) {
      // Don't let audit logging failures break the system
      console.error('Audit log failed:', error);
    }
  }

  async getRecentLogs(options: {
    userId?: string;
    action?: string;
    resource?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<any[]> {
    const where: any = {};
    
    if (options.userId) where.userId = options.userId;
    if (options.action) where.action = options.action;
    if (options.resource) where.resource = options.resource;
    
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: options.limit || 100,
      skip: options.offset || 0,
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
    
    return logs;
  }

  async getLogsByTimeRange(
    startTime: Date,
    endTime: Date,
    filters: { userId?: string; action?: string; resource?: string } = {}
  ): Promise<any[]> {
    const where: any = {
      timestamp: {
        gte: startTime,
        lte: endTime,
      },
    };
    
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;
    
    return prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });
  }

  async getFailedActions(hours: number = 24): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return prisma.auditLog.findMany({
      where: {
        success: false,
        timestamp: { gte: since },
      },
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  async getActionCounts(
    hours: number = 24,
    groupBy: 'action' | 'resource' | 'user' = 'action'
  ): Promise<Record<string, number>> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const grouped = await prisma.auditLog.groupBy({
      by: [groupBy === 'user' ? 'userId' : groupBy],
      where: {
        timestamp: { gte: since },
      },
      _count: true,
    });
    
    const result: Record<string, number> = {};
    for (const g of grouped) {
      const key = groupBy === 'user' ? (g.userId || 'unknown') : (g as any)[groupBy];
      result[key] = g._count;
    }
    
    return result;
  }
}

// =============================================================================
// SECURITY EVENT MANAGER
// =============================================================================

export class SecurityEventManager {
  async create(input: SecurityEventInput): Promise<void> {
    await prisma.securityEvent.create({
      data: {
        type: input.type,
        severity: input.severity,
        userId: input.userId,
        ipAddress: input.ipAddress,
        description: input.description,
        details: JSON.parse(JSON.stringify(input.details || {})),
        riskScore: input.riskScore || 50,
      },
    });
  }

  async getOpenEvents(): Promise<any[]> {
    return prisma.securityEvent.findMany({
      where: {
        status: { in: ['open', 'investigating'] },
      },
      orderBy: [
        { severity: 'asc' },  // Critical first
        { timestamp: 'desc' },
      ],
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  async getEventsBySeverity(severity: SecuritySeverity, limit: number = 50): Promise<any[]> {
    return prisma.securityEvent.findMany({
      where: { severity },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async resolveEvent(
    eventId: string,
    resolution: string,
    resolvedBy: string,
    status: 'resolved' | 'false_positive' = 'resolved'
  ): Promise<void> {
    await prisma.securityEvent.update({
      where: { id: eventId },
      data: {
        status,
        resolution,
        resolvedBy,
        resolvedAt: new Date(),
      },
    });
  }

  async getEventStats(hours: number = 24): Promise<{
    total: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    avgRiskScore: number;
  }> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const [total, bySeverity, byType, avgRisk] = await Promise.all([
      prisma.securityEvent.count({ where: { timestamp: { gte: since } } }),
      prisma.securityEvent.groupBy({
        by: ['severity'],
        where: { timestamp: { gte: since } },
        _count: true,
      }),
      prisma.securityEvent.groupBy({
        by: ['type'],
        where: { timestamp: { gte: since } },
        _count: true,
      }),
      prisma.securityEvent.aggregate({
        where: { timestamp: { gte: since } },
        _avg: { riskScore: true },
      }),
    ]);
    
    return {
      total,
      bySeverity: bySeverity.reduce((acc, g) => {
        acc[g.severity] = g._count;
        return acc;
      }, {} as Record<string, number>),
      byType: byType.reduce((acc, g) => {
        acc[g.type] = g._count;
        return acc;
      }, {} as Record<string, number>),
      avgRiskScore: avgRisk._avg.riskScore || 0,
    };
  }

  async getHighRiskUsers(threshold: number = 70): Promise<any[]> {
    const recentEvents = await prisma.securityEvent.findMany({
      where: {
        riskScore: { gte: threshold },
        status: 'open',
        userId: { not: null },
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, status: true },
        },
      },
    });
    
    // Group by user
    const userRisks = new Map<string, { user: any; events: any[]; totalRisk: number }>();
    
    for (const event of recentEvents) {
      if (!event.userId) continue;
      
      if (!userRisks.has(event.userId)) {
        userRisks.set(event.userId, {
          user: event.user,
          events: [],
          totalRisk: 0,
        });
      }
      
      const entry = userRisks.get(event.userId)!;
      entry.events.push(event);
      entry.totalRisk += event.riskScore;
    }
    
    return Array.from(userRisks.values())
      .sort((a, b) => b.totalRisk - a.totalRisk);
  }
}

// =============================================================================
// SINGLETON EXPORTS
// =============================================================================

export const auditLogger = new AuditLogger();
export const securityEventManager = new SecurityEventManager();
