'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye, FileText, Mail, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Search, Filter, ChevronRight,
  BarChart3, Globe, Newspaper, DollarSign, Users
} from 'lucide-react';

type PerceptionType = 'document' | 'email' | 'metric' | 'signal';

interface PerceptionEvent {
  id: string;
  type: PerceptionType;
  title: string;
  summary: string;
  source: string;
  confidence: number;
  entities: string[];
  actions?: string[];
  status: 'processed' | 'requires_attention' | 'anomaly_detected';
  timestamp: Date;
}

interface PerceptionStats {
  documentsProcessed: number;
  emailsAnalyzed: number;
  metricsTracked: number;
  signalsCaptured: number;
  anomaliesDetected: number;
}

export function PerceptionFeed() {
  const [events, setEvents] = useState<PerceptionEvent[]>([]);
  const [stats, setStats] = useState<PerceptionStats | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | PerceptionType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStats({
      documentsProcessed: 234,
      emailsAnalyzed: 1567,
      metricsTracked: 89,
      signalsCaptured: 45,
      anomaliesDetected: 7,
    });

    setEvents([
      {
        id: 'perc-001',
        type: 'document',
        title: 'Invoice Batch Processed',
        summary: 'Processed 23 invoices from Acme Corp. Total value: $127,450. All data extracted successfully. 2 invoices flagged for duplicate PO numbers.',
        source: 'Invoice Processor Agent',
        confidence: 98,
        entities: ['Acme Corp', 'INV-2024-4521', 'INV-2024-4522'],
        actions: ['Review flagged duplicates', 'Approve for payment'],
        status: 'requires_attention',
        timestamp: new Date(Date.now() - 900000),
      },
      {
        id: 'perc-002',
        type: 'email',
        title: 'Urgent Vendor Request',
        summary: 'GlobalTech Inc requesting expedited payment for invoice #GT-2024-789. Mentions cash flow concerns. Sentiment: Urgent, Formal.',
        source: 'Email Analyzer Agent',
        confidence: 94,
        entities: ['GlobalTech Inc', 'GT-2024-789'],
        actions: ['Review payment schedule', 'Draft response'],
        status: 'requires_attention',
        timestamp: new Date(Date.now() - 1800000),
      },
      {
        id: 'perc-003',
        type: 'metric',
        title: 'Revenue Anomaly Detected',
        summary: 'Q4 revenue tracking 15% below forecast in APAC region. Trend change detected starting week 45. Potential impact: $2.3M shortfall.',
        source: 'Anomaly Hunter Agent',
        confidence: 92,
        entities: ['APAC Region', 'Q4 Revenue'],
        actions: ['Investigate root cause', 'Update forecast', 'Schedule review meeting'],
        status: 'anomaly_detected',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: 'perc-004',
        type: 'signal',
        title: 'Competitor Product Launch',
        summary: 'CompetitorX announced new AI-powered automation product targeting SMB market. Pricing 20% below our current offering. Launch date: Q1 2026.',
        source: 'Market Intelligence',
        confidence: 88,
        entities: ['CompetitorX', 'SMB Market', 'AI Automation'],
        actions: ['Competitive analysis', 'Pricing review'],
        status: 'processed',
        timestamp: new Date(Date.now() - 7200000),
      },
      {
        id: 'perc-005',
        type: 'document',
        title: 'Contract Analysis Complete',
        summary: 'Vendor contract renewal analysis for TechSupply Co. Key findings: 5% price increase, reduced SLA (99.9% to 99.5%), auto-renewal clause added.',
        source: 'Contract Analyzer Agent',
        confidence: 96,
        entities: ['TechSupply Co', 'Contract Renewal'],
        actions: ['Negotiate terms', 'Review alternatives'],
        status: 'requires_attention',
        timestamp: new Date(Date.now() - 10800000),
      },
      {
        id: 'perc-006',
        type: 'metric',
        title: 'Expense Threshold Breach',
        summary: 'IT department cloud services spending exceeded monthly budget by 12%. Primary driver: Increased compute usage for ML training.',
        source: 'Budget Monitor',
        confidence: 99,
        entities: ['IT Department', 'Cloud Services'],
        actions: ['Review compute allocation', 'Budget reforecast'],
        status: 'anomaly_detected',
        timestamp: new Date(Date.now() - 14400000),
      },
      {
        id: 'perc-007',
        type: 'email',
        title: 'Customer Feedback Analyzed',
        summary: 'Weekly customer feedback digest: 45 responses analyzed. Sentiment: 78% positive, 15% neutral, 7% negative. Top request: Mobile app improvements.',
        source: 'Email Analyzer Agent',
        confidence: 91,
        entities: ['Customer Feedback', 'Mobile App'],
        status: 'processed',
        timestamp: new Date(Date.now() - 21600000),
      },
    ]);

    setLoading(false);
  }, []);

  const getTypeIcon = (type: PerceptionType) => {
    switch (type) {
      case 'document': return <FileText className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'metric': return <BarChart3 className="w-5 h-5" />;
      case 'signal': return <Globe className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: PerceptionType) => {
    switch (type) {
      case 'document': return 'text-blue-400 bg-blue-500/10';
      case 'email': return 'text-purple-400 bg-purple-500/10';
      case 'metric': return 'text-green-400 bg-green-500/10';
      case 'signal': return 'text-orange-400 bg-orange-500/10';
    }
  };

  const getStatusColor = (status: PerceptionEvent['status']) => {
    switch (status) {
      case 'processed': return 'text-green-400 bg-green-500/10';
      case 'requires_attention': return 'text-yellow-400 bg-yellow-500/10';
      case 'anomaly_detected': return 'text-red-400 bg-red-500/10';
    }
  };

  const getStatusIcon = (status: PerceptionEvent['status']) => {
    switch (status) {
      case 'processed': return <CheckCircle className="w-4 h-4" />;
      case 'requires_attention': return <Clock className="w-4 h-4" />;
      case 'anomaly_detected': return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredEvents = events.filter(e => 
    typeFilter === 'all' || e.type === typeFilter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Documents</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.documentsProcessed}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Mail className="w-4 h-4" />
            <span className="text-sm">Emails</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.emailsAnalyzed.toLocaleString()}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm">Metrics</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.metricsTracked}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <Globe className="w-4 h-4" />
            <span className="text-sm">Signals</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.signalsCaptured}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Anomalies</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.anomaliesDetected}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'document', 'email', 'metric', 'signal'] as const).map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              typeFilter === type
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            {type === 'all' ? 'All' : type + 's'}
          </button>
        ))}
      </div>

      {/* Events Feed */}
      <div className="space-y-4">
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5 rounded-xl hover:border-cyan-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getTypeColor(event.type)}`}>
                  {getTypeIcon(event.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{event.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)}
                      {event.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{event.summary}</p>
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="text-gray-500">{formatTime(event.timestamp)}</div>
                <div className="text-cyan-400 mt-1">{event.confidence}% confidence</div>
              </div>
            </div>

            {/* Entities */}
            <div className="flex flex-wrap gap-2 mb-3">
              {event.entities.map((entity, i) => (
                <span key={i} className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-400">
                  {entity}
                </span>
              ))}
            </div>

            {/* Actions */}
            {event.actions && event.actions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Suggested actions:</span>
                {event.actions.map((action, i) => (
                  <button
                    key={i}
                    className="px-3 py-1 rounded-lg text-xs bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all flex items-center gap-1"
                  >
                    <ChevronRight className="w-3 h-3" />
                    {action}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
              Source: {event.source}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
