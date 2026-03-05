import { Ghost, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#060a12] border-t border-white/5">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Ghost className="w-6 h-6 text-cyan-400" />
            <span className="text-lg font-bold text-white">
              GhostFoundry<span className="text-cyan-400">-Syndicate</span>
            </span>
          </div>
          
          <nav className="flex items-center gap-8">
            <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
              Home
            </Link>
            <Link href="/roi-calculator" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
              ROI Calculator
            </Link>
            <a href="#design-partner" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
              Design Partners
            </a>
          </nav>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} GhostFoundry-Syndicate. Full-stack operations brain that expands itself as your business mutates.
          </p>
        </div>
      </div>
    </footer>
  );
}
