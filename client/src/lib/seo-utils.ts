// SEO utilities for dynamic routing and sitemap generation

import { buildMenuHierarchy, MenuItem } from "./menu-utils";

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: string;
}

// Generate SEO-friendly URL path for a menu item
export function generateSEOPath(item: MenuItem): string {
  // Use the URL directly from the data if available (already optimized)
  if (item.url && item.url !== "/") {
    return item.url;
  }

  // Fallback to generating from argument if no URL
  if (item.argument) {
    return `/${item.argument}`;
  }

  // Final fallback to page ID
  return `/page/${item.id}`;
}

// Generate canonical URL for a menu item
export function generateCanonicalUrl(
  item: MenuItem,
  baseUrl: string = "https://texecon.com"
): string {
  const path = generateSEOPath(item);
  // Ensure baseUrl doesn't end with slash to avoid double slashes
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  return `${cleanBaseUrl}${path}`;
}

// Generate canonical URL for any path
export function generateCanonicalUrlForPath(
  path: string,
  baseUrl: string = "https://texecon.com"
): string {
  // Ensure baseUrl doesn't end with slash and path starts with slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBaseUrl}${cleanPath}`;
}

// Generate dynamic sitemap entries from menu items
export function generateSitemapEntries(baseUrl: string = "https://texecon.com"): SitemapEntry[] {
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
      const priority = item.isHomePage ? "1.0" : item.parent_page ? "0.6" : "0.8";

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
export function generateRobotsTxt(baseUrl: string = "https://texecon.com"): string {
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
export function extractKeywords(item: MenuItem): string[];
// Extract keywords from string content
// eslint-disable-next-line no-redeclare
export function extractKeywords(content: string): string[];
// eslint-disable-next-line no-redeclare
export function extractKeywords(input: string | MenuItem): string[] {
  if (typeof input === "string") {
    const content = input;
    let keywords = ["Texas economy", "economic analysis"];

    if (content) {
      const stopWords = new Set([
        "the",
        "and",
        "or",
        "but",
        "a",
        "an",
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
        "by",
      ]);

      const words = content
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 3 && !stopWords.has(word));

      keywords.push(...words.slice(0, 10));
    }

    const uniqueKeywords = Array.from(new Set(keywords));
    return uniqueKeywords.slice(0, 20);
  } else {
    const item = input;
    const keywords = ["Texas economy", "economic analysis", item.title.toLowerCase()];

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
}

// Generate meta description for menu item
export function generateMetaDescription(item: MenuItem): string;
// Generate meta description for string content
// eslint-disable-next-line no-redeclare
export function generateMetaDescription(description: string, content?: string): string;
// eslint-disable-next-line no-redeclare
export function generateMetaDescription(input: string | MenuItem, content?: string): string {
  if (typeof input === "string") {
    const description = input;
    if (description && description.trim() && description !== "undefined") {
      return description.length > 160 ? description.substring(0, 157) + "..." : description;
    }

    if (content && content.trim()) {
      const truncated = content.length > 160 ? content.substring(0, 157) + "..." : content;
      return truncated;
    }

    return "Texas Economic Analysis & Insights. Expert analysis and commentary on the Texas economic analysis.";
  } else {
    const item = input;
    if (item.description && item.description.length > 50) {
      return item.description.length > 160
        ? item.description.substring(0, 157) + "..."
        : item.description;
    }

    const baseDescription = "Texas Economic Analysis & Insights";
    return `${item.title} - ${baseDescription}. Expert analysis and commentary on the Texas economy.`;
  }
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
        url: `${import.meta.env.BASE_URL}favicon-192x192.png`,
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

// Generate page title with TexEcon branding
export function generatePageTitle(title: string): string {
  if (!title || title.trim() === "") {
    return "TexEcon - Texas Economic Analysis & Insights";
  }
  return `${title} | TexEcon`;
}
