/**
 * Dark Factory Dashboard
 * The command center for the code generation pipeline
 */

import { Metadata } from 'next';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { DarkFactoryDashboard } from '@/components/dark-factory/dashboard';

export const metadata: Metadata = {
  title: 'Dark Factory | GhostFoundry-Syndicate',
  description: 'The code generation pipeline that builds itself',
};

export default function DarkFactoryPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      <Header />
      <div className="pt-24">
        <DarkFactoryDashboard />
      </div>
      <Footer />
    </main>
  );
}
