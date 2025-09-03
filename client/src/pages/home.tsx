import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRoute, useLocation } from 'wouter';
import Navigation from '@/components/navigation';
import Hero from '@/components/hero';
import Mission from '@/components/mission';
import Team from '@/components/team';
import Newsletter from '@/components/newsletter';
import Footer from '@/components/footer';
import ContentDisplay from '@/components/content-display';
import SEOHead from '@/components/seo-head';
import StructuredData from '@/components/structured-data';
import PerformanceMonitor from '@/components/performance-monitor';
import AdminDashboard from '@/components/admin-dashboard';
import RouteDebugger from '@/components/route-debugger';
import { MenuItem, findMenuItem, buildMenuHierarchy } from '@/lib/menu-utils';
import { generateSEOPath, generateMetaDescription, extractKeywords, generateCanonicalUrlForPath } from '@/lib/seo-utils';
import { teamMembers } from '@/lib/data';

export default function Home() {
  const [selectedContent, setSelectedContent] = useState<MenuItem | null>(null);
  const [location, setLocation] = useLocation();
  
  // Route matching for different URL patterns
  const [, pageParams] = useRoute('/page/:pageId');
  const [, contentParams] = useRoute('/content/:contentSlug');
  const [, topicParams] = useRoute('/topic/:topicId');
  const [, sectionParams] = useRoute('/section/:sectionSlug');

  // Memoize the menu hierarchy to prevent constant rebuilding
  const hierarchy = useMemo(() => buildMenuHierarchy(), []);

  const handleMenuItemSelect = useCallback((item: MenuItem | null) => {
    if (!item) {
      setSelectedContent(null);
      if (location !== '/') {
        setLocation('/');
      }
      return;
    }

    setSelectedContent(item);
    
    // Update URL using wouter's setLocation (don't use pushState)
    const path = generateSEOPath(item);
    if (location !== path) {
      setLocation(path);
    }
    
    // Scroll to content area after a brief delay to ensure content is rendered
    setTimeout(() => {
      const contentSection = document.getElementById('content-area');
      if (contentSection) {
        contentSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, [location, setLocation]);

  // Generate SEO-friendly URL path for a menu item (using utility function)

  // Find content based on URL parameters - memoize to prevent constant recalculation
  const findContentFromUrl = useCallback((): MenuItem | null => {
    if (pageParams?.pageId) {
      const pageId = parseInt(pageParams.pageId);
      return hierarchy.byId[pageId] || null;
    }
    
    if (contentParams?.contentSlug || topicParams?.topicId || sectionParams?.sectionSlug) {
      const searchTerm = contentParams?.contentSlug || topicParams?.topicId || sectionParams?.sectionSlug;
      
      // Search by slug (title match)
      const byTitle = Object.values(hierarchy.byId).find(item => {
        const itemSlug = item.title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        return itemSlug === searchTerm;
      });
      
      if (byTitle) return byTitle;
      
      // Search by argument
      const byArgument = Object.values(hierarchy.byId).find(item => 
        item.argument === searchTerm
      );
      
      if (byArgument) return byArgument;
      
      // Search by URL
      return searchTerm ? findMenuItem(searchTerm) : null;
    }
    
    return null;
  }, [hierarchy, pageParams, contentParams, topicParams, sectionParams]);

  // Load content based on URL on mount and URL changes
  useEffect(() => {
    const contentFromUrl = findContentFromUrl();
    
    // Only update if content actually changed
    if (contentFromUrl && contentFromUrl.id !== selectedContent?.id) {
      setSelectedContent(contentFromUrl);
    } else if (!contentFromUrl && selectedContent && location !== '/') {
      // If URL doesn't match any content and we're not on home, redirect to home
      setLocation('/');
      setSelectedContent(null);
    } else if (!contentFromUrl && !selectedContent && location === '/') {
      // Ensure we're on home page with no content selected
      setSelectedContent(null);
    }
  }, [findContentFromUrl, selectedContent, location, setLocation]);

  // Handle navigation from footer links
  useEffect(() => {
    const handleFooterNavigation = (event: CustomEvent) => {
      const { menuItem } = event.detail;
      if (menuItem) {
        handleMenuItemSelect(menuItem);
      }
    };

    window.addEventListener('navigateToPage', handleFooterNavigation as EventListener);
    return () => window.removeEventListener('navigateToPage', handleFooterNavigation as EventListener);
  }, [handleMenuItemSelect]);

  // Generate dynamic SEO data based on selected content - memoize to prevent recalculation
  const seoData = useMemo(() => {
    if (selectedContent) {
      const currentPath = generateSEOPath(selectedContent);
      
      return {
        title: `${selectedContent.title} - TexEcon`,
        description: generateMetaDescription(selectedContent),
        keywords: extractKeywords(selectedContent),
        url: generateCanonicalUrlForPath(currentPath),
        type: 'article' as const
      };
    }
    
    return {
      title: 'TexEcon - Texas Economic Analysis & Insights',
      description: 'Leading Texas economic analysis and commentary. Expert insights on Texas economy trends, data analysis, and economic forecasting from experienced economists and data analysts.',
      keywords: ['Texas economy', 'economic analysis', 'Texas economic trends', 'economic forecasting', 'Texas business', 'economic data', 'economic commentary', 'Texas economics', 'economic dashboard', 'Texas GDP'],
      url: 'https://texecon.com',
      type: 'website' as const
    };
  }, [selectedContent]);

  // Convert team members to structured data format - memoize static data
  // Convert team members to structured data format - memoize static data
  const structuredPeople = useMemo(() => teamMembers.map((member: any) => ({
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
  })), []);

  // Generate breadcrumbs for selected content - memoize based on selectedContent
  const breadcrumbs = useMemo(() => {
    // Use canonical domain for breadcrumbs to match SEO data
    const siteBase = 'https://texecon.com/';
    const breadcrumbs = [
      { name: 'Home', url: siteBase }
    ];
    
    if (selectedContent) {
      breadcrumbs.push({
        name: selectedContent.title,
        url: generateCanonicalUrlForPath(generateSEOPath(selectedContent))
      });
    }
    
    return breadcrumbs;
  }, [selectedContent]);

  return (
    <div className="min-h-screen">
      <SEOHead 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        image={`${(typeof window !== 'undefined' ? window.location.origin : 'https://texecon.com')}${(import.meta.env.BASE_URL || '/')}assets/texecon-og-image.jpg`}
        url={seoData.url}
        type={seoData.type}
      />
      
      <StructuredData 
        people={structuredPeople}
        breadcrumbs={breadcrumbs}
      />
      
      <PerformanceMonitor />
      
      {/* Admin Dashboard - Only in development */}
      {process.env.NODE_ENV === 'development' && <AdminDashboard />}
      
      {/* Route Debugger - Only in development */}
      {process.env.NODE_ENV === 'development' && <RouteDebugger />}
      
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
          </>
        )}
        
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
