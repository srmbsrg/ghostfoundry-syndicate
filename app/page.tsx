import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import HeroSection from '@/components/sections/hero-section';
import FeaturesSection from '@/components/sections/features-section';
import HowItWorksSection from '@/components/sections/how-it-works-section';
import TargetAudienceSection from '@/components/sections/target-audience-section';
import ComplianceSection from '@/components/sections/compliance-section';
import DesignPartnerSection from '@/components/sections/design-partner-section';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TargetAudienceSection />
      <ComplianceSection />
      <DesignPartnerSection />
      <Footer />
    </main>
  );
}
