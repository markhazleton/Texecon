import { useState } from 'react';
import Navigation from '@/components/navigation';
import Hero from '@/components/hero';
import Mission from '@/components/mission';
import Team from '@/components/team';
import Insights from '@/components/insights';
import Dashboard from '@/components/dashboard';
import Newsletter from '@/components/newsletter';
import Footer from '@/components/footer';
import ContentDisplay from '@/components/content-display';
import { MenuItem } from '@/lib/menu-utils';

export default function Home() {
  const [selectedContent, setSelectedContent] = useState<MenuItem | null>(null);
  
  const handleMenuItemSelect = (item: MenuItem) => {
    setSelectedContent(item);
    // Scroll to content area
    const contentSection = document.getElementById('content-area');
    if (contentSection) {
      contentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation onMenuItemSelect={handleMenuItemSelect} />
      <main>
        <Hero />
        
        {/* Dynamic Content Area */}
        {selectedContent && (
          <section 
            id="content-area" 
            className="py-16 bg-background"
            data-testid="dynamic-content-area"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ContentDisplay menuItem={selectedContent} />
            </div>
          </section>
        )}
        
        <Mission />
        <Team />
        <Insights />
        <Dashboard />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
