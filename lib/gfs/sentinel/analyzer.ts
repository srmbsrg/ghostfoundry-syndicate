// GFS Sentinel - Behavioral Analyzer

import prisma from '@/lib/db';
import {
  AnomalyDetectionResult,
  AnomalyFactor,
  AlertSeverity,
  BehavioralProfile,
} from './types';

export class BehavioralAnalyzer {
  /**
   * Analyze a user action for anomalies
   */
  async analyzeUserAction(params: {
    userId: string;
    action: string;
    resource: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp?: Date;
  }): Promise<AnomalyDetectionResult> {
    const factors: AnomalyFactor[] = [];
    let totalRiskScore = 0;
    const timestamp = params.timestamp || new Date();

    // Get user's behavioral fingerprint
    const fingerprint = await prisma.behavioralFingerprint.findUnique({
      where: { userId: params.userId },
    });

    if (!fingerprint) {
      // First time user - can't detect anomalies yet
      return {
        isAnomaly: false,
        confidence: 0.3,
        riskScore: 20,
        factors: [],
        recommendation: 'Building behavioral profile. Continue monitoring.',
      };
    }

    // Check login hours
    const hour = timestamp.getHours();
    const typicalHours = fingerprint.typicalLoginHours as number[];
    if (typicalHours.length > 0 && !this.isWithinRange(hour, typicalHours)) {
      factors.push({
        factor: 'unusual_time',
        description: `Login at ${hour}:00 is outside typical hours`,
        severity: 'medium',
        contribution: 0.3,
      });
      totalRiskScore += 25;
    }

    // Check day of week
    const day = timestamp.getDay();
    const typicalDays = fingerprint.typicalDays as number[];
    if (typicalDays.length > 0 && !typicalDays.includes(day)) {
      factors.push({
        factor: 'unusual_day',
        description: `Activity on day ${day} is unusual`,
        severity: 'low',
        contribution: 0.15,
      });
      totalRiskScore += 15;
    }

    // Check IP range
    if (params.ipAddress) {
      const typicalIpRanges = fingerprint.typicalIpRanges as string[];
      if (
        typicalIpRanges.length > 0 &&
        !this.isInIpRange(params.ipAddress, typicalIpRanges)
      ) {
        factors.push({
          factor: 'new_ip_address',
          description: `IP ${params.ipAddress} not in typical ranges`,
          severity: 'high',
          contribution: 0.4,
        });
        totalRiskScore += 35;
      }
    }

    // Check for unusual action
    const commonActions = fingerprint.commonActions as string[];
    if (commonActions.length > 0 && !commonActions.includes(params.action)) {
      factors.push({
        factor: 'unusual_action',
        description: `Action "${params.action}" is not typical for this user`,
        severity: 'medium',
        contribution: 0.25,
      });
      totalRiskScore += 20;
    }

    // Check for unusual resource access
    const commonResources = fingerprint.commonResources as string[];
    if (commonResources.length > 0 && !commonResources.includes(params.resource)) {
      factors.push({
        factor: 'unusual_resource',
        description: `Resource "${params.resource}" is not typically accessed`,
        severity: 'low',
        contribution: 0.2,
      });
      totalRiskScore += 15;
    }

    // Determine if this is an anomaly
    const isAnomaly = totalRiskScore >= 50 || factors.some((f) => f.severity === 'high');
    const confidence = Math.min(0.95, 0.5 + factors.length * 0.1);

    return {
      isAnomaly,
      confidence,
      riskScore: Math.min(100, totalRiskScore),
      factors,
      recommendation: this.getRecommendation(isAnomaly, factors),
    };
  }

  /**
   * Update user's behavioral fingerprint based on their actions
   */
  async updateProfile(params: {
    userId: string;
    action: string;
    resource: string;
    ipAddress?: string;
    timestamp?: Date;
  }): Promise<void> {
    const timestamp = params.timestamp || new Date();

    const existing = await prisma.behavioralFingerprint.findUnique({
      where: { userId: params.userId },
    });

    if (!existing) {
      // Create new profile
      await prisma.behavioralFingerprint.create({
        data: {
          userId: params.userId,
          typicalLoginHours: [timestamp.getHours()],
          typicalDays: [timestamp.getDay()],
          typicalLocations: [],
          typicalIpRanges: params.ipAddress ? [this.getIpPrefix(params.ipAddress)] : [],
          typicalUserAgents: [],
          commonResources: [params.resource],
          commonActions: [params.action],
          avgDailyActions: 1,
          avgSessionDuration: 0,
          baselineRiskScore: 0,
        },
      });
    } else {
      // Update existing profile with new data (running average)
      const hours = existing.typicalLoginHours as number[];
      const days = existing.typicalDays as number[];
      const ipRanges = existing.typicalIpRanges as string[];
      const resources = existing.commonResources as string[];
      const actions = existing.commonActions as string[];

      // Add to arrays if not present (keep top 10)
      const newHours = this.addToArray(hours, timestamp.getHours(), 5);
      const newDays = this.addToArray(days, timestamp.getDay(), 7);
      const newResources = this.addToArray(resources, params.resource, 10);
      const newActions = this.addToArray(actions, params.action, 10);
      const newIpRanges = params.ipAddress
        ? this.addToArray(ipRanges, this.getIpPrefix(params.ipAddress), 5)
        : ipRanges;

      await prisma.behavioralFingerprint.update({
        where: { userId: params.userId },
        data: {
          typicalLoginHours: newHours,
          typicalDays: newDays,
          typicalIpRanges: newIpRanges,
          commonResources: newResources,
          commonActions: newActions,
          avgDailyActions: existing.avgDailyActions + 1,
          lastUpdated: new Date(),
        },
      });
    }
  }

  /**
   * Get a user's behavioral profile
   */
  async getProfile(userId: string): Promise<BehavioralProfile | null> {
    const fingerprint = await prisma.behavioralFingerprint.findUnique({
      where: { userId },
    });

    if (!fingerprint) return null;

    return {
      userId,
      typicalHours: fingerprint.typicalLoginHours as number[],
      typicalDays: fingerprint.typicalDays as number[],
      typicalLocations: fingerprint.typicalLocations as string[],
      typicalActions: fingerprint.commonActions as string[],
      averageSessionDuration: fingerprint.avgSessionDuration,
      riskBaseline: fingerprint.baselineRiskScore,
    };
  }

  private isWithinRange(value: number, ranges: number[]): boolean {
    // Treat ranges as min/max or individual values
    if (ranges.length === 2) {
      return value >= ranges[0] && value <= ranges[1];
    }
    return ranges.includes(value);
  }

  private isInIpRange(ip: string, ranges: string[]): boolean {
    const prefix = this.getIpPrefix(ip);
    return ranges.some((range) => prefix.startsWith(range));
  }

  private getIpPrefix(ip: string): string {
    // Get first 3 octets for IPv4
    const parts = ip.split('.');
    if (parts.length >= 3) {
      return `${parts[0]}.${parts[1]}.${parts[2]}`;
    }
    return ip;
  }

  private addToArray<T>(arr: T[], value: T, maxLength: number): T[] {
    if (arr.includes(value)) return arr;
    const newArr = [...arr, value];
    return newArr.slice(-maxLength);
  }

  private getRecommendation(isAnomaly: boolean, factors: AnomalyFactor[]): string {
    if (!isAnomaly) {
      return 'Activity within normal parameters. No action required.';
    }

    const hasHighSeverity = factors.some((f) => f.severity === 'high');
    if (hasHighSeverity) {
      return 'High-risk anomaly detected. Recommend immediate investigation and potential session termination.';
    }

    const hasMediumSeverity = factors.some((f) => f.severity === 'medium');
    if (hasMediumSeverity) {
      return 'Moderate anomaly detected. Recommend additional authentication verification.';
    }

    return 'Low-risk anomaly detected. Continue monitoring.';
  }
}

export const behavioralAnalyzer = new BehavioralAnalyzer();
