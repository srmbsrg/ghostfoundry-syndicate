/**
 * Ghost Control Center
 * The unified command center for the GFS consciousness
 */

import { Metadata } from 'next';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { GhostControlDashboard } from '@/components/ghost-control/dashboard';

export const metadata: Metadata = {
  title: 'Ghost Control | GhostFoundry-Syndicate',
  description: 'The unified command center for the GFS consciousness',
};

export default function GhostControlPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      <Header />
      <div className="pt-24">
        <GhostControlDashboard />
      </div>
      <Footer />
    </main>
  );
}
