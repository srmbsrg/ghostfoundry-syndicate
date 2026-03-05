'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Tag, Newspaper } from 'lucide-react';

const blogPosts = [
  {
    slug: 'why-erp-is-dead',
    title: "Why I'll Never Implement Another ERP",
    excerpt: "A founder's journey from ERP hell to AI-native operations—and why you should skip the legacy trap entirely.",
    category: 'Thought Leadership',
    readTime: '8 min read',
    image: 'https://cdn.abacus.ai/images/673ad142-4674-43a5-adc4-cb1e7a02b1db.jpg',
    featured: true
  },
  {
    slug: '#',
    title: 'The Post-ERP Era: Operations for the AI Age',
    excerpt: 'How modern companies are replacing rigid enterprise software with adaptive AI systems that learn and evolve.',
    category: 'Industry Trends',
    readTime: '6 min read',
    image: 'https://cdn.abacus.ai/images/2f1907a0-9c29-47fd-a43e-a99137c05e8e.png',
    featured: false,
    comingSoon: true
  },
  {
    slug: '#',
    title: 'Building Trust with Explainable AI',
    excerpt: 'Why audit trails, bias detection, and human override controls are non-negotiable for enterprise AI adoption.',
    category: 'Compliance',
    readTime: '5 min read',
    image: 'https://cdn.abacus.ai/images/8ab01774-62ef-4ffe-8d74-51eb9861b345.jpg',
    featured: false,
    comingSoon: true
  }
];

export function BlogList() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-20 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-6">
            <Newspaper className="w-4 h-4" />
            Insights & Analysis
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">The </span>
            <span className="gradient-text">Syndicate Blog</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Perspectives on AI-native operations, the post-ERP revolution, and building the future of business automation.
          </p>
        </motion.div>

        {/* Featured Post */}
        {blogPosts.filter(p => p.featured).map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <Link href={`/blog/${post.slug}`} className="block group">
              <div className="glass-card overflow-hidden hover:border-cyan-500/40 transition-colors">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative aspect-video md:aspect-auto">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0f1a]/80 md:block hidden" />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
                        Featured
                      </span>
                      <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <Tag className="w-3 h-3" />
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-400 mb-6">{post.excerpt}</p>
                    <div className="flex items-center gap-2 text-cyan-400 font-medium">
                      Read Article
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {/* Other Posts */}
        <div className="grid md:grid-cols-2 gap-6">
          {blogPosts.filter(p => !p.featured).map((post, index) => (
            <motion.div
              key={post.slug + index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <div className={`glass-card overflow-hidden h-full ${post.comingSoon ? '' : 'hover:border-cyan-500/40'} transition-colors`}>
                <div className="relative aspect-video">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className={`object-cover ${post.comingSoon ? 'opacity-50' : ''}`}
                  />
                  {post.comingSoon && (
                    <div className="absolute inset-0 bg-[#0a0f1a]/60 flex items-center justify-center">
                      <span className="px-4 py-2 rounded-full bg-gray-500/30 text-gray-300 text-sm font-medium">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <span className={`flex items-center gap-1 text-sm ${post.comingSoon ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Tag className="w-3 h-3" />
                      {post.category}
                    </span>
                    <span className={`flex items-center gap-1 text-sm ${post.comingSoon ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${post.comingSoon ? 'text-gray-300' : 'text-white'}`}>{post.title}</h3>
                  <p className={`text-sm ${post.comingSoon ? 'text-gray-400' : 'text-gray-400'}`}>{post.excerpt}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
