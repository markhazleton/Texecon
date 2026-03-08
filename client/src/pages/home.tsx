import { useState, useEffect, useCallback, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import Navigation from "@/components/navigation";
import Hero from "@/components/hero";
import TexeconAbout from "@/components/texecon-about";
import Team from "@/components/team";
import Newsletter from "@/components/newsletter";
import Footer from "@/components/footer";
import ContentDisplay from "@/components/content-display";
import SEOHead from "@/components/seo-head";
import StructuredData from "@/components/structured-data";
import PerformanceMonitor from "@/components/performance-monitor";
import AdminDashboard from "@/components/admin-dashboard";
import RouteDebugger from "@/components/route-debugger";
import SiteNavigationTree from "@/components/site-navigation-tree";
import NotFound from "@/pages/not-found";
import { MenuItem, findMenuItem, buildMenuHierarchy } from "@/lib/menu-utils";
import {
  generateSEOPath,
  generateMetaDescription,
  extractKeywords,
  generateCanonicalUrlForPath,
} from "@/lib/seo-utils";
import { teamMembers } from "@/lib/data";

export default function Home() {
  const [selectedContent, setSelectedContent] = useState<MenuItem | null>(null);
  const [isRouteNotFound, setIsRouteNotFound] = useState(false);
  const [location, setLocation] = useLocation();

  // Normalize paths like /index.html and /foo/index.html to canonical route paths.
  const normalizedLocation = useMemo(() => {
    const pathOnly = location.split("?")[0].split("#")[0] || "/";

    if (pathOnly === "/index.html") {
      return "/";
    }

    if (pathOnly.endsWith("/index.html")) {
      const withoutIndex = pathOnly.slice(0, -"/index.html".length);
      return withoutIndex || "/";
    }

    if (pathOnly.length > 1 && pathOnly.endsWith("/")) {
      return pathOnly.slice(0, -1);
    }

    return pathOnly;
  }, [location]);

  // Route matching for different URL patterns
  const [, pageParams] = useRoute("/page/:pageId");
  const [, contentParams] = useRoute("/content/:contentSlug");
  const [, topicParams] = useRoute("/topic/:topicId");
  const [, sectionParams] = useRoute("/section/:sectionSlug");

  // New shortened URL routes
  const [, singleSlugParams] = useRoute("/:slug");
  const [, categorySlugParams] = useRoute("/:category/:slug");

  // Memoize the menu hierarchy to prevent constant rebuilding
  const hierarchy = useMemo(() => buildMenuHierarchy(), []);

  const handleMenuItemSelect = useCallback(
    (item: MenuItem | null) => {
      if (!item) {
        setSelectedContent(null);
        setIsRouteNotFound(false);
        if (normalizedLocation !== "/") {
          setLocation("/");
        }
        return;
      }

      setSelectedContent(item);
      setIsRouteNotFound(false);

      // Update URL using wouter's setLocation (don't use pushState)
      const path = generateSEOPath(item);
      if (normalizedLocation !== path) {
        setLocation(path);
      }

      // Scroll to content area after a brief delay to ensure content is rendered
      setTimeout(() => {
        const contentSection = document.getElementById("content-area");
        if (contentSection) {
          contentSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    },
    [normalizedLocation, setLocation]
  );

  // Generate SEO-friendly URL path for a menu item (using utility function)

  // Find content based on URL parameters - memoize to prevent constant recalculation
  const findContentFromUrl = useCallback((): MenuItem | null => {
    // Handle static-file routes produced by static hosts and Lighthouse URLs.
    if (normalizedLocation !== "/") {
      const byNormalizedUrl = Object.values(hierarchy.byId).find(
        (item) => item.url === normalizedLocation
      );

      if (byNormalizedUrl) return byNormalizedUrl;
    }

    if (pageParams?.pageId) {
      const pageId = parseInt(pageParams.pageId);
      return hierarchy.byId[pageId] || null;
    }

    if (contentParams?.contentSlug || topicParams?.topicId || sectionParams?.sectionSlug) {
      const searchTerm =
        contentParams?.contentSlug || topicParams?.topicId || sectionParams?.sectionSlug;

      // Search by slug (title match)
      const byTitle = Object.values(hierarchy.byId).find((item) => {
        const itemSlug = item.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();
        return itemSlug === searchTerm;
      });

      if (byTitle) return byTitle;

      // Search by argument
      const byArgument = Object.values(hierarchy.byId).find((item) => item.argument === searchTerm);

      if (byArgument) return byArgument;

      // Search by URL
      return searchTerm ? findMenuItem(searchTerm) : null;
    }

    // Handle new shortened URL patterns
    if (categorySlugParams?.category && categorySlugParams?.slug) {
      const fullPath = `/${categorySlugParams.category}/${categorySlugParams.slug}`;

      // First try to find by exact URL match
      const byUrl = Object.values(hierarchy.byId).find((item) => item.url === fullPath);

      if (byUrl) return byUrl;

      // Try to find by argument match
      const argument = `${categorySlugParams.category}/${categorySlugParams.slug}`;
      const byArgument = Object.values(hierarchy.byId).find((item) => item.argument === argument);

      if (byArgument) return byArgument;
    }

    if (singleSlugParams?.slug) {
      const slug = singleSlugParams.slug;

      // First try to find by exact URL match
      const byUrl = Object.values(hierarchy.byId).find((item) => item.url === `/${slug}`);

      if (byUrl) return byUrl;

      // Try to find by argument match
      const byArgument = Object.values(hierarchy.byId).find((item) => item.argument === slug);

      if (byArgument) return byArgument;

      // Try to find by slug from title
      const byTitle = Object.values(hierarchy.byId).find((item) => {
        const itemSlug = item.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();
        return itemSlug === slug;
      });

      if (byTitle) return byTitle;
    }

    return null;
  }, [
    hierarchy,
    pageParams,
    contentParams,
    topicParams,
    sectionParams,
    singleSlugParams,
    categorySlugParams,
    normalizedLocation,
  ]);

  // Load content based on URL on mount and URL changes
  useEffect(() => {
    const contentFromUrl = findContentFromUrl();

    // Schedule state updates for next render to avoid synchronous updates in effect
    const scheduleUpdate = () => {
      // Only update if content actually changed
      if (contentFromUrl && contentFromUrl.id !== selectedContent?.id) {
        setTimeout(() => {
          setSelectedContent(contentFromUrl);
          setIsRouteNotFound(false);
        }, 0);
      } else if (!contentFromUrl && normalizedLocation !== "/") {
        // Unknown route: render 404 UI instead of redirecting to home.
        setTimeout(() => {
          setSelectedContent(null);
          setIsRouteNotFound(true);
        }, 0);
      } else if (!contentFromUrl && normalizedLocation === "/") {
        // Ensure we're on home page with no content selected
        setTimeout(() => {
          setSelectedContent(null);
          setIsRouteNotFound(false);
        }, 0);
      }
    };

    scheduleUpdate();
  }, [findContentFromUrl, selectedContent, normalizedLocation]);

  // Handle navigation from footer links
  useEffect(() => {
    const handleFooterNavigation = (event: CustomEvent) => {
      const { menuItem } = event.detail;
      if (menuItem) {
        handleMenuItemSelect(menuItem);
      }
    };

    window.addEventListener("navigateToPage", handleFooterNavigation as EventListener);
    return () =>
      window.removeEventListener("navigateToPage", handleFooterNavigation as EventListener);
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
        type: "article" as const,
        robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      };
    }

    if (isRouteNotFound) {
      return {
        title: "Page Not Found | TexEcon",
        description:
          "The requested page could not be found. Browse Texas economic analysis and expert insights from TexEcon.",
        keywords: ["404", "page not found", "TexEcon", "Texas economic analysis"],
        url: generateCanonicalUrlForPath(normalizedLocation),
        type: "website" as const,
        robots: "noindex, nofollow",
      };
    }

    return {
      title: "TexEcon - Texas Economic Analysis & Insights",
      description:
        "Leading Texas economic analysis and commentary. Expert insights on Texas economy trends, data analysis, and economic forecasting from experienced economists and data analysts.",
      keywords: [
        "Texas economy",
        "economic analysis",
        "Texas economic trends",
        "economic forecasting",
        "Texas business",
        "economic data",
        "economic commentary",
        "Texas economics",
        "economic dashboard",
        "Texas GDP",
      ],
      url: "https://texecon.com",
      type: "website" as const,
      robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    };
  }, [selectedContent, isRouteNotFound, normalizedLocation]);

  // Convert team members to structured data format - memoize static data
  // Convert team members to structured data format - memoize static data
  const structuredPeople = useMemo(
    () =>
      teamMembers.map((member) => ({
        name: member.name,
        jobTitle: member.title,
        description: member.description,
        image: member.image,
        url: member.social.website || member.page_url || "",
        sameAs: [member.social.linkedin, member.social.github, member.social.twitter].filter(
          (link): link is string => Boolean(link)
        ),
      })),
    []
  );

  // Generate breadcrumbs for selected content - memoize based on selectedContent
  const breadcrumbs = useMemo(() => {
    // Use canonical domain for breadcrumbs to match SEO data
    const siteBase = "https://texecon.com/";
    const breadcrumbs = [{ name: "Home", url: siteBase }];

    if (selectedContent) {
      breadcrumbs.push({
        name: selectedContent.title,
        url: generateCanonicalUrlForPath(generateSEOPath(selectedContent)),
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
        image={`${typeof window !== "undefined" ? window.location.origin : "https://texecon.com"}${import.meta.env.BASE_URL || "/"}assets/texecon-og-image.jpg`}
        url={seoData.url}
        type={seoData.type}
        robots={seoData.robots}
      />

      <StructuredData people={structuredPeople} breadcrumbs={breadcrumbs} />

      <PerformanceMonitor />

      {/* Admin Dashboard - Only in development */}
      {process.env.NODE_ENV === "development" && <AdminDashboard />}

      {/* Route Debugger - Only in development */}
      {process.env.NODE_ENV === "development" && <RouteDebugger />}

      <Navigation onMenuItemSelect={handleMenuItemSelect} />
      <main>
        {isRouteNotFound && <NotFound />}

        {/* Show Hero only on home page (no content selected) */}
        {!selectedContent && !isRouteNotFound && <Hero />}

        {/* Dynamic Content Area */}
        {selectedContent && (
          <section
            id="content-area"
            className="py-16 bg-background"
            data-testid="dynamic-content-area"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ContentDisplay menuItem={selectedContent} onNavigate={handleMenuItemSelect} />
            </div>
          </section>
        )}

        {/* Show default sections only when no specific content is selected */}
        {!selectedContent && !isRouteNotFound && (
          <>
            <TexeconAbout />
            <Team />

            {/* Site Navigation Section for Crawlers */}
            <section className="py-16 bg-muted/30" data-testid="site-navigation">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-center mb-8">Explore Our Content</h2>
                <div className="max-w-4xl mx-auto">
                  <SiteNavigationTree
                    items={hierarchy.topLevel}
                    onItemSelect={handleMenuItemSelect}
                  />
                </div>
              </div>
            </section>
          </>
        )}

        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
