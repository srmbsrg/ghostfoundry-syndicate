import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { BlogList } from '@/components/sections/blog-list';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | GhostFoundry-Syndicate',
  description: 'Insights on AI-native operations, the post-ERP era, and building the future of business automation.',
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      <Header />
      <div className="pt-24">
        <BlogList />
      </div>
      <Footer />
    </main>
  );
}
