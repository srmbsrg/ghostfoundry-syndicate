'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { Download, FileText, Image as ImageIcon, Presentation, Share2, Ghost, ExternalLink } from 'lucide-react';

const pitchDeckSlides = [
  { name: 'Slide 10: Weekly Briefs', file: 'slide-10-weekly-briefs.png' },
  { name: 'Slide 11: Target Audience', file: 'slide-11-target-audience.png' },
  { name: 'Slide 12: Design Partner', file: 'slide-12-design-partner.png' },
  { name: 'Slide 13: Call to Action', file: 'slide-13-cta.png' },
];

const socialMediaAssets = [
  { name: 'LinkedIn Banner', file: 'linkedin-banner.png', dimensions: '1584×396' },
  { name: 'Twitter/X Announcement', file: 'twitter-announcement.png', dimensions: '1200×675' },
  { name: 'Instagram Post', file: 'instagram-post.png', dimensions: '1080×1080' },
  { name: 'LinkedIn Company Post', file: 'linkedin-company-post.png', dimensions: '1200×627' },
];

const documents = [
  { name: 'Compliance One-Pager', file: 'compliance-onepager.html', description: 'SOC2, HIPAA, GDPR readiness overview' },
  { name: 'Syndicate Brief Template', file: 'syndicate-brief-template.html', description: 'Weekly executive summary format' },
  { name: 'Design Partner Welcome Kit', file: 'design-partner-welcome.html', description: 'Onboarding guide for partners' },
  { name: 'Case Study Template', file: 'case-study-template.html', description: 'Co-branded success story format' },
  { name: 'Channel Partner Kit', file: 'channel-partner-kit.html', description: 'Revenue share and partnership details' },
  { name: 'Blog: Why ERP is Dead', file: 'blog-why-erp-is-dead.html', description: 'Thought leadership article' },
];

const brandAssets = {
  logo: 'https://cdn.abacus.ai/images/4c895725-4ccf-4e8e-bb47-ef6ebdb2a708.png',
  animatedLogo: '', // Animated logo coming soon
  colors: [
    { name: 'Deep Blue-Black', hex: '#0a0f1a' },
    { name: 'Midnight Blue', hex: '#1a1f35' },
    { name: 'Cyan', hex: '#00d4ff' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'White', hex: '#ffffff' },
  ],
};

export function PressKitContent() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-20 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-medium mb-6">
            <Share2 className="w-4 h-4" />
            Brand Resources
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Press </span>
            <span className="gradient-text">Kit</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Download official GhostFoundry-Syndicate brand assets, pitch materials, and marketing resources.
          </p>
        </motion.div>

        {/* Brand Assets */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Ghost className="w-6 h-6 text-cyan-400" />
            Brand Identity
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Logo */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Primary Logo</h3>
              <div className="relative aspect-video bg-[#0a0f1a] rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                <Image
                  src={brandAssets.logo}
                  alt="GhostFoundry-Syndicate Logo"
                  width={300}
                  height={150}
                  className="object-contain"
                />
              </div>
              <a
                href={brandAssets.logo}
                download="ghostfoundry-syndicate-logo.png"
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </a>
            </div>

            {/* Animated Logo */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Animated Logo</h3>
              <div className="relative aspect-video bg-[#0a0f1a] rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                {brandAssets.animatedLogo ? (
                  <video
                    src={brandAssets.animatedLogo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                      <span className="text-3xl">👻</span>
                    </div>
                    <p className="text-gray-400 text-sm">Coming Soon</p>
                  </div>
                )}
              </div>
              {brandAssets.animatedLogo ? (
                <a
                  href={brandAssets.animatedLogo}
                  download="ghostfoundry-syndicate-animated.mp4"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download MP4
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg cursor-not-allowed">
                  <Download className="w-4 h-4" />
                  Coming Soon
                </span>
              )}
            </div>
          </div>

          {/* Brand Colors */}
          <div className="glass-card p-6 mt-6">
            <h3 className="font-semibold text-white mb-4">Brand Colors</h3>
            <div className="flex flex-wrap gap-4">
              {brandAssets.colors.map((color) => (
                <div key={color.hex} className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg border border-white/20"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <p className="text-white text-sm font-medium">{color.name}</p>
                    <p className="text-gray-500 text-xs font-mono">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Pitch Deck */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Presentation className="w-6 h-6 text-purple-400" />
            Pitch Deck Slides
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pitchDeckSlides.map((slide, index) => (
              <motion.div
                key={slide.file}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="glass-card p-4 group hover:border-purple-500/40 transition-colors"
              >
                <div className="relative aspect-video bg-[#0a0f1a] rounded-lg overflow-hidden mb-3">
                  <Image
                    src={`/press-kit/pitch-deck/${slide.file}`}
                    alt={slide.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm text-white mb-2">{slide.name}</p>
                <a
                  href={`/press-kit/pitch-deck/${slide.file}`}
                  download
                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Download
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-cyan-400" />
            Social Media Graphics
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {socialMediaAssets.map((asset, index) => (
              <motion.div
                key={asset.file}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="glass-card p-4 hover:border-cyan-500/40 transition-colors"
              >
                <div className="relative aspect-video bg-[#0a0f1a] rounded-lg overflow-hidden mb-3">
                  <Image
                    src={`/press-kit/social-media/${asset.file}`}
                    alt={asset.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{asset.name}</p>
                    <p className="text-xs text-gray-500">{asset.dimensions}</p>
                  </div>
                  <a
                    href={`/press-kit/social-media/${asset.file}`}
                    download
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Documents */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FileText className="w-6 h-6 text-green-400" />
            Marketing Documents
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.file}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.05 * index }}
                className="glass-card p-5 hover:border-green-500/40 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <FileText className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/press-kit/documents/${doc.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors text-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Preview
                  </a>
                  <a
                    href={`/press-kit/documents/${doc.file}`}
                    download
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Usage Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 glass-card p-8 text-center"
        >
          <h3 className="text-xl font-bold text-white mb-4">Usage Guidelines</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            These assets are provided for press, partner, and marketing purposes. Please maintain brand integrity by using assets as provided without modification to colors, proportions, or effects. For custom requests or high-resolution files, contact us at <a href="mailto:press@spookysoftwaresyndicate.com" className="text-cyan-400 hover:underline">press@spookysoftwaresyndicate.com</a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
