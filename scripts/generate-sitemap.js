// Script to generate dynamic sitemap for SEO
// Run this with: node scripts/generate-sitemap.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Since we can't import from client src directly in Node.js, we'll simulate the structure
// In a real implementation, you'd load your actual content data

function getBaseUrl() {
  // Prefer explicit SITE_BASE_URL; fallback to production domain
  const explicit = process.env.SITE_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  return 'https://texecon.com';
}

function generateSiteMapFromData() {
  const baseUrl = getBaseUrl();
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages = [
    { url: baseUrl, priority: '1.0', changefreq: 'daily' },
  ];

  // Dynamic pages patterns (these would come from your actual menu data)
  const dynamicPatterns = [
    '/page/:pageId',
    '/content/:contentSlug', 
    '/topic/:topicId',
    '/section/:sectionSlug'
  ];

  // Example dynamic URLs (in practice, these would be generated from your actual data)
  const dynamicPages = [
    { url: `${baseUrl}/content/texas-economy`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/content/economic-team`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/section/regional-analysis`, priority: '0.6', changefreq: 'weekly' },
    { url: `${baseUrl}/topic/economic-data`, priority: '0.7', changefreq: 'weekly' },
  ];

  const allPages = [...staticPages, ...dynamicPages];

  const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemapXML;
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
const sitemap = generateSiteMapFromData();
const robotsTxt = generateRobotsTxt(baseUrl);

// Write to public directory
const publicDir = path.join(__dirname, '..', 'client', 'public');

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);

console.log('Generated sitemap.xml and robots.txt for dynamic routing');
console.log('Sitemap includes routes for:');
console.log('  - Static pages (home)');
console.log('  - Dynamic content pages (/content/:slug)');
console.log('  - Topic pages (/topic/:id)');
console.log('  - Section pages (/section/:slug)');
console.log('  - Page ID routes (/page/:id)');
