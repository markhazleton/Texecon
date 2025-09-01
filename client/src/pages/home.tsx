import { useState, useEffect } from 'react';
import Navigation from '@/components/navigation';
import Hero from '@/components/hero';
import Mission from '@/components/mission';
import Team from '@/components/team';
import Insights from '@/components/insights';
import Dashboard from '@/components/dashboard';
import Newsletter from '@/components/newsletter';
import Footer from '@/components/footer';
import ContentDisplay from '@/components/content-display';
import SEOHead from '@/components/seo-head';
import StructuredData from '@/components/structured-data';
import PerformanceMonitor from '@/components/performance-monitor';
import AdminDashboard from '@/components/admin-dashboard';
import { MenuItem } from '@/lib/menu-utils';
import { teamMembers, realContent } from '@/lib/data';

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

  // Handle navigation from footer links
  useEffect(() => {
    const handleFooterNavigation = (event: CustomEvent) => {
      const { pageId } = event.detail;
      // Find the corresponding navigation item from raw data
      const rawNavItem = realContent.navigation?.find((item: any) => item.id === pageId);
      if (rawNavItem) {
        // Convert to MenuItem format expected by handleMenuItemSelect
        const menuItem: MenuItem = {
          id: parseInt(rawNavItem.id) || 0,
          title: rawNavItem.label || rawNavItem.description,
          description: rawNavItem.description,
          url: rawNavItem.href,
          argument: null,
          icon: 'document',
          order: 0,
          content: rawNavItem.description,
          display_navigation: true,
          isHomePage: false,
          parent_page: null,
          parent_title: '',
          children: []
        };
        handleMenuItemSelect(menuItem);
      }
    };

    window.addEventListener('navigateToPage', handleFooterNavigation as EventListener);
    return () => window.removeEventListener('navigateToPage', handleFooterNavigation as EventListener);
  }, []);

  // Convert team members to structured data format
  const structuredPeople = teamMembers.map((member: any) => ({
    name: member.name,
    jobTitle: member.title,
    description: member.description,
    image: member.image,
    url: member.social.website,
    sameAs: [
      member.social.linkedin,
      member.social.github,
      member.social.twitter
    ].filter(Boolean)
  }));

  return (
    <div className="min-h-screen">
      <SEOHead 
        title="TexEcon - Texas Economic Analysis & Insights"
        description="Leading Texas economic analysis and commentary. Expert insights on Texas economy trends, data analysis, and economic forecasting from experienced economists and data analysts."
        keywords={['Texas economy', 'economic analysis', 'Texas economic trends', 'economic forecasting', 'Texas business', 'economic data', 'economic commentary', 'Texas economics', 'economic dashboard', 'Texas GDP']}
        image="https://texecon.com/assets/texecon-og-image.jpg"
        url="https://texecon.com"
        type="website"
      />
      
      <StructuredData 
        people={structuredPeople}
        breadcrumbs={[
          { name: 'Home', url: 'https://texecon.com' }
        ]}
      />
      
      <PerformanceMonitor />
      
      {/* Admin Dashboard - Only in development */}
      {process.env.NODE_ENV === 'development' && <AdminDashboard />}
      
      <Navigation onMenuItemSelect={handleMenuItemSelect} />
      <main>
        {/* Show Hero only on home page (no content selected) */}
        {!selectedContent && <Hero />}
        
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
        
        {/* Show default sections only when no specific content is selected */}
        {!selectedContent && (
          <>
            <Mission />
            <Team />
            <Insights />
            <Dashboard />
          </>
        )}
        
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
