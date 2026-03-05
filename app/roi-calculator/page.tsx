import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import ROICalculator from '@/components/roi/roi-calculator';

export default function ROICalculatorPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      <Header />
      <div className="pt-24">
        <ROICalculator />
      </div>
      <Footer />
    </main>
  );
}
