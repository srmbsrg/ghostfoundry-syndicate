/**
 * Ghost Control Center
 * The unified command center for the GFS consciousness
 */

import { Metadata } from 'next';
import { InternalHeader } from '@/components/ui/internal-header';
import { GhostControlDashboard } from '@/components/ghost-control/dashboard';

export const metadata: Metadata = {
  title: 'Ghost Control | GhostFoundry-Syndicate',
  description: 'The unified command center for the GFS consciousness',
};

export default function GhostControlPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      <InternalHeader />
      <div className="pt-16">
        <GhostControlDashboard />
      </div>
    </main>
  );
}
