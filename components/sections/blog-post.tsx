'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag, Quote, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface BlogPostProps {
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  author: string;
  heroImage: string;
  content: string;
}

export function BlogPost({ title, subtitle, category, readTime, author, heroImage, content }: BlogPostProps) {
  return (
    <article>
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px]">
        <Image
          src={heroImage}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/70 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-6 pb-12 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/blog" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium">
                  {category}
                </span>
                <span className="flex items-center gap-1 text-gray-400 text-sm">
                  <Clock className="w-3 h-3" />
                  {readTime}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{title}</h1>
              <p className="text-xl text-gray-300 mb-6">{subtitle}</p>
              
              <p className="text-gray-400">
                By <span className="text-cyan-400">{author}</span>
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-3xl mx-auto px-6 py-16"
      >
        <div className="prose prose-invert prose-lg max-w-none
          prose-headings:text-white prose-headings:font-bold
          prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
          prose-h3:text-xl prose-h3:text-cyan-400 prose-h3:mt-8 prose-h3:mb-4
          prose-p:text-gray-300 prose-p:leading-relaxed
          prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white
          prose-blockquote:border-l-cyan-500 prose-blockquote:bg-cyan-500/10 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-xl prose-blockquote:text-white
          prose-ul:text-gray-300 prose-ol:text-gray-300
          prose-li:marker:text-cyan-400
          prose-table:border-collapse
          prose-th:bg-cyan-500/10 prose-th:p-4 prose-th:text-left prose-th:border-b prose-th:border-cyan-500/20
          prose-td:p-4 prose-td:border-b prose-td:border-white/10
          prose-code:text-cyan-400 prose-code:bg-cyan-500/10 prose-code:px-2 prose-code:py-1 prose-code:rounded
        ">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        {/* CTA */}
        <div className="mt-16 glass-card p-8 text-center bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to skip the ERP trap?</h3>
          <p className="text-gray-400 mb-6">Join our Design Partner Program and see what AI-native operations actually looks like.</p>
          <Link 
            href="/#design-partner"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Apply Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </article>
  );
}
