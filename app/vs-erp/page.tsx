import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { VsErpHero } from '@/components/sections/vs-erp-hero';
import { VsErpVisual } from '@/components/sections/vs-erp-visual';
import { VsErpPainPoints } from '@/components/sections/vs-erp-pain-points';
import { VsErpComparison } from '@/components/sections/vs-erp-comparison';
import { VsErpSolution } from '@/components/sections/vs-erp-solution';
import { VsErpQuote } from '@/components/sections/vs-erp-quote';
import DesignPartnerSection from '@/components/sections/design-partner-section';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GhostFoundry-Syndicate vs Traditional ERP | Why AI-Native Wins',
  description: 'Compare GhostFoundry-Syndicate to legacy ERP systems. See why growth companies are choosing self-expanding AI over rigid, expensive enterprise software.',
};

export default function VsErpPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      <Header />
      <div className="pt-16">
        <VsErpHero />
        <VsErpVisual />
        <VsErpPainPoints />
        <VsErpComparison />
        <VsErpSolution />
        <VsErpQuote />
        <DesignPartnerSection />
      </div>
      <Footer />
    </main>
  );
}
