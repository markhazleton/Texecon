// Script to generate dynamic sitemap for SEO
// Run this with: node scripts/generate-sitemap.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the actual content data generated from the API
function loadContentData() {
  const contentPath = path.join(__dirname, '..', 'client', 'src', 'data', 'webspark-raw.json');
  try {
    const rawData = fs.readFileSync(contentPath, 'utf8');
    const data = JSON.parse(rawData);
    return data.data; // Return the data object containing the menu
  } catch (error) {
    console.warn('Could not load content data:', error.message);
    return { menu: [] };
  }
}

// Use the exact URL from the API data
function generateSEOPath(item) {
  return item.url || '/';
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
  
  // Add dynamic pages from API menu data
  if (contentData.menu && Array.isArray(contentData.menu)) {
    contentData.menu
      .filter(item => item.display_navigation && !item.isHomePage && item.url && item.url !== '/') // Only include navigable non-home pages with URLs
      .forEach(item => {
        const seoPath = generateSEOPath(item);
        const fullUrl = `${baseUrl}${seoPath}`;
        
        // Set priority based on content type
        let priority = '0.7'; // default for content pages
        let changefreq = 'weekly'; // default
        
        // Team member pages get higher priority
        if (item.argument && item.argument.includes('hazleton')) {
          priority = '0.8';
          changefreq = 'monthly';
        }
        
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

console.log('Generated sitemap.xml and robots.txt using exact API URL structure');
console.log(`Sitemap includes ${pageCount} total URLs (${dynamicPageCount} from API menu):`);
console.log('  - Static pages (home)');
console.log('  - Dynamic pages using exact API URLs');
console.log(`Base URL: ${baseUrl}`);
