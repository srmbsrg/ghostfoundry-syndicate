/**
 * GhostFoundry-Syndicate Marketing Features
 * 
 * This file consolidates all marketing-worthy features from the GFS systems.
 * Use this for website copy, pitch decks, and sales materials.
 * 
 * Last Updated: March 2026
 */

export interface MarketingFeature {
  feature: string;
  tagline: string;
  description: string;
  benefits: string[];
  category: 'memory' | 'perception' | 'dark-factory' | 'self-mod' | 'event-bus' | 'core';
  tier: 'headline' | 'key' | 'supporting';  // For prioritization in marketing
}

/**
 * MEMORY SYSTEM FEATURES
 */
export const MEMORY_FEATURES: MarketingFeature[] = [
  {
    feature: 'Contextual Learning',
    tagline: 'Remembers every interaction, learns from every outcome',
    description: 'Unlike traditional automation, GhostFoundry-Syndicate builds persistent memory of your business operations, learning patterns and preferences over time.',
    benefits: ['No repeated training', 'Improves with use', 'Institutional knowledge preservation'],
    category: 'memory',
    tier: 'headline'
  },
  {
    feature: 'Pattern Recognition',
    tagline: 'Automatically discovers hidden patterns in your operations',
    description: 'The system consolidates individual experiences into semantic knowledge, identifying patterns humans might miss.',
    benefits: ['Proactive optimization', 'Anomaly detection', 'Process improvement suggestions'],
    category: 'memory',
    tier: 'key'
  },
  {
    feature: 'Associative Memory',
    tagline: 'Connects the dots across your entire operation',
    description: 'Every memory is linked to related experiences, enabling the system to recall relevant context instantly.',
    benefits: ['Faster decision-making', 'Cross-functional insights', 'Reduced information silos'],
    category: 'memory',
    tier: 'key'
  },
  {
    feature: 'Institutional Memory',
    tagline: 'Your best practices, preserved forever',
    description: "Knowledge doesn't walk out the door when employees leave. The Ghost remembers how your best operators handled every situation.",
    benefits: ['Knowledge retention', 'Onboarding acceleration', 'Consistent execution'],
    category: 'memory',
    tier: 'headline'
  },
  {
    feature: 'Adaptive Procedures',
    tagline: 'Workflows that evolve based on what works',
    description: 'Procedural memory tracks success rates and automatically refines processes based on actual outcomes.',
    benefits: ['Continuous improvement', 'Self-optimizing workflows', 'Data-driven process design'],
    category: 'memory',
    tier: 'key'
  }
];

/**
 * PERCEPTION SYSTEM FEATURES
 */
export const PERCEPTION_FEATURES: MarketingFeature[] = [
  {
    feature: 'Intelligent Document Processing',
    tagline: 'Understands documents like a human, processes them like a machine',
    description: 'Automatically extracts key information from invoices, contracts, reports, and emails. No templates needed - the system learns your document formats.',
    benefits: ['90%+ reduction in manual data entry', 'Zero template configuration', 'Learns from corrections'],
    category: 'perception',
    tier: 'headline'
  },
  {
    feature: 'Email Intelligence',
    tagline: 'Every email analyzed, prioritized, and actionable',
    description: 'Understands email intent, extracts action items, and suggests responses. Never miss an important email buried in your inbox.',
    benefits: ['Automatic prioritization', 'Action item extraction', 'Smart reply suggestions'],
    category: 'perception',
    tier: 'key'
  },
  {
    feature: 'Anomaly Detection',
    tagline: 'Spots problems before they become crises',
    description: 'Continuously monitors your operations for unusual patterns. Detects issues before they impact your business.',
    benefits: ['Proactive problem detection', 'Early warning system', 'Reduced downtime'],
    category: 'perception',
    tier: 'headline'
  },
  {
    feature: 'Market Signal Intelligence',
    tagline: 'Your 24/7 competitive intelligence analyst',
    description: 'Monitors market signals, competitor moves, and industry trends. Delivers actionable insights to stay ahead.',
    benefits: ['Real-time market awareness', 'Competitive intelligence', 'Strategic early warning'],
    category: 'perception',
    tier: 'key'
  },
  {
    feature: 'Unified Business Perception',
    tagline: 'One brain seeing your entire operation',
    description: 'Correlates signals across all sources - documents, emails, metrics, external data - to provide a unified view of your business.',
    benefits: ['Cross-functional visibility', 'Pattern detection', 'Holistic insights'],
    category: 'perception',
    tier: 'key'
  }
];

/**
 * DARK FACTORY FEATURES
 */
export const DARK_FACTORY_FEATURES: MarketingFeature[] = [
  {
    feature: 'Natural Language to Code',
    tagline: 'Describe what you need, watch it build itself',
    description: 'The Dark Factory transforms plain English specs into production-ready code - APIs, UIs, database schemas, and tests.',
    benefits: ['No coding required', '10x faster development', 'Consistent architecture'],
    category: 'dark-factory',
    tier: 'headline'
  },
  {
    feature: 'Recursive Self-Building',
    tagline: 'The factory that builds factories',
    description: 'The Dark Factory uses itself to extend itself. Every capability it builds becomes a building block for the next.',
    benefits: ['Exponential capability growth', 'Self-improving system', 'Compound automation'],
    category: 'dark-factory',
    tier: 'headline'
  },
  {
    feature: 'Automatic Testing',
    tagline: 'Every generated component comes tested',
    description: 'The factory automatically generates tests for everything it builds, ensuring reliability from day one.',
    benefits: ['Built-in quality', 'Reduced QA burden', 'Reliable automation'],
    category: 'dark-factory',
    tier: 'key'
  }
];

/**
 * SELF-MODIFICATION ENGINE FEATURES
 */
export const SELF_MOD_FEATURES: MarketingFeature[] = [
  {
    feature: 'Gap Detection',
    tagline: 'Knows what it doesn\'t know, and fixes it',
    description: 'The system continuously analyzes itself for missing capabilities, performance issues, and improvement opportunities.',
    benefits: ['Proactive improvement', 'Self-healing systems', 'Continuous optimization'],
    category: 'self-mod',
    tier: 'headline'
  },
  {
    feature: 'Autonomous Evolution',
    tagline: 'Grows capabilities without human intervention',
    description: 'When a gap is detected, the system automatically generates proposals, validates them, and implements improvements.',
    benefits: ['Hands-off optimization', 'Reduced maintenance burden', 'Ever-improving platform'],
    category: 'self-mod',
    tier: 'headline'
  },
  {
    feature: 'Human-in-the-Loop Safety',
    tagline: 'Autonomous but not unsupervised',
    description: 'Risk-based approval requirements ensure humans stay in control of high-impact changes while routine improvements flow automatically.',
    benefits: ['Safe automation', 'Audit compliance', 'Peace of mind'],
    category: 'self-mod',
    tier: 'key'
  }
];

/**
 * ALL FEATURES COMBINED
 */
export const ALL_MARKETING_FEATURES: MarketingFeature[] = [
  ...MEMORY_FEATURES,
  ...PERCEPTION_FEATURES,
  ...DARK_FACTORY_FEATURES,
  ...SELF_MOD_FEATURES
];

/**
 * Get headline features for main marketing
 */
export function getHeadlineFeatures(): MarketingFeature[] {
  return ALL_MARKETING_FEATURES.filter(f => f.tier === 'headline');
}

/**
 * Get features by category
 */
export function getFeaturesByCategory(category: MarketingFeature['category']): MarketingFeature[] {
  return ALL_MARKETING_FEATURES.filter(f => f.category === category);
}

/**
 * Generate marketing copy for a feature
 */
export function generateFeatureCopy(feature: MarketingFeature): string {
  return `
### ${feature.feature}

**${feature.tagline}**

${feature.description}

**Key Benefits:**
${feature.benefits.map(b => `- ${b}`).join('\n')}
  `.trim();
}

/**
 * MARKETING ONE-LINERS (for social, ads, etc.)
 */
export const MARKETING_ONE_LINERS = [
  'Stop configuring. Start commanding.',
  'Clone your best operators. Invent the ones you need.',
  'The ERP killer that builds itself.',
  'AI that remembers everything, forgets nothing.',
  'Your operations brain, running 24/7.',
  'Software that learns your business, not the other way around.',
  'Deploy in weeks, not years.',
  'The last operations platform you\'ll ever need.',
  'Self-evolving AI for businesses that won\'t stop growing.',
  'Because your best operators can\'t be everywhere at once.'
];

/**
 * COMPARISON TALKING POINTS (vs ERP, vs RPA, vs custom)
 */
export const COMPARISON_POINTS = {
  vsERP: [
    'Deploys in weeks vs years',
    'Learns and adapts vs rigid configuration',
    'AI-native vs AI as afterthought',
    'Grows with you vs fights every change',
    '90% less implementation cost'
  ],
  vsRPA: [
    'Understands intent, not just clicks',
    'Handles exceptions intelligently',
    'Improves over time automatically',
    'No brittle scripts to maintain',
    'Works across your entire operation'
  ],
  vsCustomDev: [
    'No development team required',
    'Self-maintaining codebase',
    'Builds what you need, when you need it',
    'Fraction of the cost and time',
    'Enterprise-grade from day one'
  ]
};
