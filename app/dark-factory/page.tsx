/**
 * Dark Factory Dashboard
 * The command center for the code generation pipeline
 */

import { Metadata } from 'next';
import { InternalHeader } from '@/components/ui/internal-header';
import { DarkFactoryDashboard } from '@/components/dark-factory/dashboard';

export const metadata: Metadata = {
  title: 'Dark Factory | GhostFoundry-Syndicate',
  description: 'The code generation pipeline that builds itself',
};

export default function DarkFactoryPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      <InternalHeader />
      <div className="pt-16">
        <DarkFactoryDashboard />
      </div>
    </main>
  );
}
