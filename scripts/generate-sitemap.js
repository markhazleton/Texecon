// Script to generate dynamic sitemap for SEO
// Run this with: node scripts/generate-sitemap.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the actual content data generated from the API
function loadContentData() {
  const contentPath = path.join(__dirname, '..', 'client', 'src', 'data', 'texecon-content.json');
  try {
    const rawData = fs.readFileSync(contentPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.warn('Could not load content data:', error.message);
    return { pages: { all: [] } };
  }
}

// Generate SEO-friendly URL path for PRIMARY routes only (avoiding duplicate content)
function generateSEOPath(item) {
  // Team members use /section/ as primary route
  if (item.argument && item.argument.includes('hazleton')) {
    const slug = item.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return `/section/${slug}`;
  }
  
  // All other content uses /content/ as primary route
  if (item.argument && item.argument !== 'home') {
    return `/content/${item.argument}`;
  }
  
  // Default to homepage for home content
  return '/';
}

function getBaseUrl() {
  // Prefer explicit SITE_BASE_URL; fallback to production domain
  const explicit = process.env.SITE_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  return 'https://texecon.com';
}

function generateSiteMapFromData() {
  const baseUrl = getBaseUrl();
  const currentDate = new Date().toISOString();
  const contentData = loadContentData();

  // Static pages
  const staticPages = [
    { url: baseUrl, priority: '1.0', changefreq: 'daily' },
  ];

  // Generate dynamic pages from actual content data
  const dynamicPages = [];
  
  // Add team member pages from /section/ routes
  if (contentData.team && Array.isArray(contentData.team)) {
    contentData.team.forEach(member => {
      const slug = member.page_url?.replace('/section/', '') || 
                  member.name?.toLowerCase().replace(/\s+/g, '-');
      if (slug) {
        const fullUrl = `${baseUrl}/section/${slug}`;
        dynamicPages.push({
          url: fullUrl,
          priority: '0.8',
          changefreq: 'monthly',
          title: `${member.name} - TexEcon Team`,
          lastModified: currentDate
        });
      }
    });
  }
  
  // Add content pages from /content/ routes  
  if (contentData.pages && contentData.pages.all) {
    contentData.pages.all
      .filter(item => item.display_navigation && !item.isHomePage) // Only include navigable non-home pages
      .forEach(item => {
        // Skip team member pages - they're handled above
        if (item.argument && item.argument.includes('hazleton')) {
          return;
        }
        
        const seoPath = generateSEOPath(item);
        if (seoPath === '/') return; // Skip home page duplicates
        
        const fullUrl = `${baseUrl}${seoPath}`;
        
        // Set priority based on content type
        let priority = '0.7'; // default for content pages
        let changefreq = 'weekly'; // default
        
        dynamicPages.push({
          url: fullUrl,
          priority,
          changefreq,
          title: item.title,
          lastModified: item.modified_w3c || currentDate
        });
      });
  }

  // Sort pages by priority (highest first) then by URL
  const allPages = [...staticPages, ...dynamicPages].sort((a, b) => {
    const priorityDiff = parseFloat(b.priority) - parseFloat(a.priority);
    if (priorityDiff !== 0) return priorityDiff;
    return a.url.localeCompare(b.url);
  });

  const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified || currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return { sitemapXML, pageCount: allPages.length, dynamicPageCount: dynamicPages.length };
}

function generateRobotsTxt(baseUrl) {
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

// Generate sitemap and robots.txt
const baseUrl = getBaseUrl();
const { sitemapXML, pageCount, dynamicPageCount } = generateSiteMapFromData();
const robotsTxt = generateRobotsTxt(baseUrl);

// Write to public directory
const publicDir = path.join(__dirname, '..', 'client', 'public');

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXML);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);

console.log('Generated sitemap.xml and robots.txt for dynamic routing');
console.log(`Sitemap includes ${pageCount} total URLs (${dynamicPageCount} dynamic pages):`);
console.log('  - Static pages (home)');
console.log('  - Dynamic content pages (/content/:slug)');
console.log('  - Topic pages (/topic/:id)');
console.log('  - Section pages (/section/:slug)');
console.log('  - Page ID routes (/page/:id)');
console.log(`Base URL: ${baseUrl}`);
