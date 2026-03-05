'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

export function VsErpVisual() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-16 px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-500/10"
        >
          <div className="relative aspect-video">
            <Image
              src="https://cdn.abacus.ai/images/fe853b51-4b13-4605-845c-fed5e60e1644.png"
              alt="The Old Way vs The New Way - Traditional hiring is expensive and slow, while GhostFoundry-Syndicate offers a self-expanding AI workforce that is instant and scalable"
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-gray-400 text-sm mt-6"
        >
          The paradigm shift from manual operations to AI-native intelligence
        </motion.p>
      </div>
    </section>
  );
}
