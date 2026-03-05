'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock,
  Shield, Zap, Code, Database, Bot, ChevronRight,
  ThumbsUp, ThumbsDown, Eye, Play, FileText
} from 'lucide-react';

interface Proposal {
  id: string;
  type: string;
  title: string;
  description: string;
  riskLevel: 'minimal' | 'low' | 'medium' | 'high' | 'critical';
  status: 'proposed' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
  source: string;
  createdAt: Date;
  approvals: { user: string; approved: boolean; at: Date }[];
  requiredApprovals: number;
  darkFactorySpec?: string;
  estimatedImpact: string;
}

export function SelfModQueue() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Representative data - in production, fetch from /api/gfs/self-mod/proposals
    setProposals([
      {
        id: 'mod-001',
        type: 'new_endpoint',
        title: 'Add Bulk Invoice Upload Endpoint',
        description: 'Create API endpoint to handle bulk invoice uploads via CSV/Excel files. Detected pattern: users frequently upload multiple invoices manually.',
        riskLevel: 'low',
        status: 'proposed',
        source: 'pattern_detected',
        createdAt: new Date(Date.now() - 3600000),
        approvals: [],
        requiredApprovals: 1,
        darkFactorySpec: 'POST /api/invoices/bulk-upload - Accepts multipart form data, processes CSV/Excel, returns batch results',
        estimatedImpact: 'Reduce manual upload time by 85%',
      },
      {
        id: 'mod-002',
        type: 'new_agent',
        title: 'Spawn Vendor Onboarding Agent',
        description: 'Create specialized agent for vendor onboarding workflows. Gap detected: no automated handling of new vendor setup process.',
        riskLevel: 'medium',
        status: 'proposed',
        source: 'missing_capability',
        createdAt: new Date(Date.now() - 7200000),
        approvals: [{ user: 'system', approved: true, at: new Date() }],
        requiredApprovals: 2,
        darkFactorySpec: 'Agent: vendor_onboarding - capabilities: [document_collection, compliance_check, erp_registration]',
        estimatedImpact: 'Automate 70% of vendor onboarding tasks',
      },
      {
        id: 'mod-003',
        type: 'workflow_update',
        title: 'Add Payment Terms Validation Step',
        description: 'Insert payment terms validation into invoice approval workflow. User feedback: missed early payment discounts due to late processing.',
        riskLevel: 'low',
        status: 'proposed',
        source: 'user_feedback',
        createdAt: new Date(Date.now() - 1800000),
        approvals: [],
        requiredApprovals: 1,
        darkFactorySpec: 'Workflow step: validate_payment_terms - check for early payment discounts, flag urgent items',
        estimatedImpact: 'Capture estimated $12K/month in early payment discounts',
      },
      {
        id: 'mod-004',
        type: 'schema_change',
        title: 'Add Compliance Tracking Fields',
        description: 'Extend vendor schema with compliance tracking fields. Compliance gap: no audit trail for vendor certifications.',
        riskLevel: 'high',
        status: 'approved',
        source: 'compliance_gap',
        createdAt: new Date(Date.now() - 86400000),
        approvals: [
          { user: 'admin', approved: true, at: new Date(Date.now() - 43200000) },
          { user: 'compliance_officer', approved: true, at: new Date(Date.now() - 21600000) },
        ],
        requiredApprovals: 2,
        darkFactorySpec: 'Schema: vendors - add fields: compliance_status, certifications[], last_audit_date, next_review_date',
        estimatedImpact: 'Enable audit compliance tracking, reduce compliance risk',
      },
      {
        id: 'mod-005',
        type: 'capability_extend',
        title: 'Add Multi-Currency Support to Invoice Processor',
        description: 'Extend invoice processor to handle multi-currency invoices with real-time conversion.',
        riskLevel: 'medium',
        status: 'completed',
        source: 'user_feedback',
        createdAt: new Date(Date.now() - 172800000),
        approvals: [
          { user: 'admin', approved: true, at: new Date(Date.now() - 86400000) },
        ],
        requiredApprovals: 1,
        darkFactorySpec: 'Agent capability: multi_currency_processing - integrate forex API, auto-convert to base currency',
        estimatedImpact: 'Support 15 additional currencies',
      },
    ]);
    setLoading(false);
  }, []);

  const getRiskColor = (risk: Proposal['riskLevel']) => {
    switch (risk) {
      case 'minimal': return 'text-green-400 bg-green-500/10';
      case 'low': return 'text-blue-400 bg-blue-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'high': return 'text-orange-400 bg-orange-500/10';
      case 'critical': return 'text-red-400 bg-red-500/10';
    }
  };

  const getStatusColor = (status: Proposal['status']) => {
    switch (status) {
      case 'proposed': return 'text-purple-400 bg-purple-500/10';
      case 'approved': return 'text-green-400 bg-green-500/10';
      case 'rejected': return 'text-red-400 bg-red-500/10';
      case 'executing': return 'text-cyan-400 bg-cyan-500/10';
      case 'completed': return 'text-green-400 bg-green-500/10';
      case 'failed': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_endpoint': return <Code className="w-5 h-5" />;
      case 'new_agent': return <Bot className="w-5 h-5" />;
      case 'schema_change': return <Database className="w-5 h-5" />;
      case 'workflow_update': return <RefreshCw className="w-5 h-5" />;
      case 'capability_extend': return <Zap className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const filteredProposals = proposals.filter(p => {
    if (filter === 'pending') return ['proposed', 'approved', 'executing'].includes(p.status);
    if (filter === 'completed') return ['completed', 'rejected', 'failed'].includes(p.status);
    return true;
  });

  const handleApprove = async (proposalId: string) => {
    // In production, call API
    setProposals(proposals.map(p => 
      p.id === proposalId 
        ? { ...p, approvals: [...p.approvals, { user: 'current_user', approved: true, at: new Date() }] }
        : p
    ));
  };

  const handleReject = async (proposalId: string) => {
    setProposals(proposals.map(p => 
      p.id === proposalId ? { ...p, status: 'rejected' as const } : p
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Pending Review</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {proposals.filter(p => p.status === 'proposed').length}
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Approved</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {proposals.filter(p => p.status === 'approved').length}
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm">Executing</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {proposals.filter(p => p.status === 'executing').length}
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Completed</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {proposals.filter(p => p.status === 'completed').length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['pending', 'completed', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            {f} ({f === 'all' ? proposals.length : filteredProposals.length})
          </button>
        ))}
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.map((proposal, index) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5 rounded-xl hover:border-cyan-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="text-cyan-400 mt-1">
                  {getTypeIcon(proposal.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{proposal.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(proposal.status)}`}>
                      {proposal.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${getRiskColor(proposal.riskLevel)}`}>
                      <Shield className="w-3 h-3" />
                      {proposal.riskLevel} risk
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{proposal.description}</p>
                </div>
              </div>
              <div className="text-right text-xs text-gray-500">
                <div>{new Date(proposal.createdAt).toLocaleDateString()}</div>
                <div className="text-purple-400">{proposal.source.replace(/_/g, ' ')}</div>
              </div>
            </div>

            {/* Dark Factory Spec */}
            {proposal.darkFactorySpec && (
              <div className="mb-3 p-3 bg-black/30 rounded-lg border border-cyan-500/20">
                <div className="text-xs text-cyan-400 mb-1">Dark Factory Spec:</div>
                <code className="text-xs text-gray-300">{proposal.darkFactorySpec}</code>
              </div>
            )}

            {/* Impact */}
            <div className="mb-3">
              <span className="text-xs text-gray-500">Estimated Impact: </span>
              <span className="text-sm text-green-400">{proposal.estimatedImpact}</span>
            </div>

            {/* Approval Progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  Approvals: {proposal.approvals.filter(a => a.approved).length}/{proposal.requiredApprovals}
                </span>
                <div className="flex -space-x-2">
                  {proposal.approvals.map((approval, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full border-2 border-[#0a0f1a] flex items-center justify-center text-xs ${
                        approval.approved ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {approval.user[0].toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {proposal.status === 'proposed' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedProposal(proposal)}
                    className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </button>
                  <button
                    onClick={() => handleApprove(proposal.id)}
                    className="px-3 py-1.5 rounded-lg text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all flex items-center gap-1"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(proposal.id)}
                    className="px-3 py-1.5 rounded-lg text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-1"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}

              {proposal.status === 'approved' && (
                <button
                  className="px-3 py-1.5 rounded-lg text-sm bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all flex items-center gap-1"
                >
                  <Play className="w-4 h-4" />
                  Execute Now
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
