// SEO utilities for dynamic routing and sitemap generation

import { buildMenuHierarchy, MenuItem } from "./menu-utils";

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: string;
}

// Generate SEO-friendly URL path for a menu item
export function generateSEOPath(item: MenuItem): string {
  const slug = item.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();

  // Use different URL patterns based on content type
  if (item.parent_page) {
    return `/section/${slug}`;
  } else if (item.argument) {
    return `/topic/${item.argument}`;
  } else if (item.url && item.url !== "/") {
    return `/content/${slug}`;
  } else {
    return `/page/${item.id}`;
  }
}

// Generate canonical URL for a menu item
export function generateCanonicalUrl(
  item: MenuItem,
  baseUrl: string = "https://texecon.com"
): string {
  const path = generateSEOPath(item);
  return `${baseUrl}${path}`;
}

// Generate dynamic sitemap entries from menu items
export function generateSitemapEntries(
  baseUrl: string = "https://texecon.com"
): SitemapEntry[] {
  const hierarchy = buildMenuHierarchy();
  const entries: SitemapEntry[] = [];

  // Add home page
  entries.push({
    url: baseUrl,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: "1.0",
  });

  // Add all navigation pages
  Object.values(hierarchy.byId).forEach((item) => {
    if (item.display_navigation) {
      const priority = item.isHomePage
        ? "1.0"
        : item.parent_page
        ? "0.6"
        : "0.8";

      entries.push({
        url: generateCanonicalUrl(item, baseUrl),
        lastModified: new Date().toISOString(),
        changeFrequency: "weekly",
        priority,
      });
    }
  });

  return entries;
}

// Generate XML sitemap content
export function generateSitemapXML(entries: SitemapEntry[]): string {
  const xmlEntries = entries
    .map(
      (entry) => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;
}

// Generate robots.txt content with dynamic sitemap reference
export function generateRobotsTxt(
  baseUrl: string = "https://texecon.com"
): string {
  return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

# Block development and admin routes
Disallow: /admin/
Disallow: /_dev/
Disallow: /*.json$
Disallow: /*.map$
`;
}

// Extract keywords from menu item content
export function extractKeywords(item: MenuItem): string[] {
  const keywords = [
    "Texas economy",
    "economic analysis",
    item.title.toLowerCase(),
  ];

  // Add keywords based on content type
  if (item.description) {
    const words = item.description
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3);

    keywords.push(...words.slice(0, 3));
  }

  // Add category-specific keywords
  if (item.parent_page) {
    keywords.push("Texas economic trends", "regional analysis");
  }

  if (item.argument) {
    keywords.push("economic topic", "economic data");
  }

  return Array.from(new Set(keywords)); // Remove duplicates
}

// Generate meta description for menu item
export function generateMetaDescription(item: MenuItem): string {
  if (item.description && item.description.length > 50) {
    return item.description.length > 160
      ? item.description.substring(0, 157) + "..."
      : item.description;
  }

  const baseDescription = "Texas Economic Analysis & Insights";
  return `${item.title} - ${baseDescription}. Expert analysis and commentary on the Texas economy.`;
}

// Get structured data for a menu item
export function getStructuredData(item: MenuItem) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: generateMetaDescription(item),
    author: {
      "@type": "Organization",
      name: "TexEcon",
      url: "https://texecon.com",
    },
    publisher: {
      "@type": "Organization",
      name: "TexEcon",
      url: "https://texecon.com",
      logo: {
        "@type": "ImageObject",
        url: "https://texecon.com/favicon-192x192.png",
      },
    },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": generateCanonicalUrl(item),
    },
  };
}
