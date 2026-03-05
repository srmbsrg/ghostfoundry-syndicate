import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { PressKitContent } from '@/components/sections/press-kit-content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Press Kit | GhostFoundry-Syndicate',
  description: 'Download brand assets, pitch deck slides, social media graphics, and marketing materials for GhostFoundry-Syndicate.',
};

export default function PressKitPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      <Header />
      <div className="pt-24">
        <PressKitContent />
      </div>
      <Footer />
    </main>
  );
}
