import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate static HTML pages for PRIMARY dynamic routes only to avoid duplicate content
 * This creates actual HTML files that search engines can crawl for:
 * - /:sectionSlug (team members only - primary route, no 'section' prefix)
 * - /:contentSlug (main content pages only - primary route, no 'content' prefix)
 * 
 * We avoid generating /topic/ and /page/ routes to prevent duplicate content SEO issues
 * URLs are shortened by removing the first segment (section/content) for cleaner SEO
 */
async function generateStaticPages() {
  console.log('🔧 Generating static pages with shortened URLs (no section/content prefix)...');
  
  try {
    // Load the content data
    const contentPath = path.join(__dirname, '..', 'client', 'src', 'data', 'texecon-content.json');
    
    if (!fs.existsSync(contentPath)) {
      console.error('❌ Content file not found:', contentPath);
      return;
    }
    
    const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    const baseTemplate = fs.readFileSync(
      path.join(__dirname, '..', 'target', 'index.html'), 
      'utf8'
    );
    
    let totalGenerated = 0;
    
    // Generate /:sectionSlug pages (team members) - PRIMARY route without 'section' prefix
    totalGenerated += await generateSectionPages(content, baseTemplate);
    
    // Generate /:contentSlug pages (main content) - PRIMARY route without 'content' prefix
    totalGenerated += await generateContentPages(content, baseTemplate);
    
    console.log(`🎉 Static page generation complete! Generated ${totalGenerated} pages total.`);
    console.log('ℹ️  Skipped /topic/ and /page/ routes to avoid duplicate content issues.');
    console.log('ℹ️  Using shortened URLs without section/content prefixes for better SEO.');
    
  } catch (error) {
    console.error('❌ Error generating static pages:', error);
    process.exit(1);
  }
}

/**
 * Generate /:sectionSlug pages for team members ONLY
 * This is the primary route for team member profiles (no 'section' prefix)
 */
async function generateSectionPages(content, baseTemplate) {
  const targetDir = path.join(__dirname, '..', 'target');
  
  let count = 0;
  
  if (content.team && Array.isArray(content.team)) {
    for (const member of content.team) {
      const slug = member.page_url?.replace('/section/', '') || 
                  member.name?.toLowerCase().replace(/\s+/g, '-');
      
      if (!slug) continue;
      
      const memberHtml = generateMemberHTML(baseTemplate, member);
      const memberDir = path.join(targetDir, slug);
      
      if (!fs.existsSync(memberDir)) {
        fs.mkdirSync(memberDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(memberDir, 'index.html'), memberHtml);
      console.log(`✅ Generated: /${slug}/index.html`);
      count++;
    }
  }
  
  return count;
}

/**
 * Generate /:contentSlug pages for main content ONLY
 * This is the primary route for content pages (no 'content' prefix)
 */
async function generateContentPages(content, baseTemplate) {
  const targetDir = path.join(__dirname, '..', 'target');
  
  let count = 0;
  
  // Process analysis pages - these should use /:slug as primary route
  if (content.pages?.analysis && Array.isArray(content.pages.analysis)) {
    for (const page of content.pages.analysis) {
      if (!page.argument) continue;
      
      const slug = page.argument;
      const pageHtml = generateContentHTML(baseTemplate, page, 'analysis');
      const pageDir = path.join(targetDir, slug);
      
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml);
      console.log(`✅ Generated: /${slug}/index.html`);
      count++;
    }
  }
  
  // Process main content pages (excluding team member pages which use /:member)
  if (content.pages?.all && Array.isArray(content.pages.all)) {
    for (const page of content.pages.all) {
      if (!page.argument || page.argument === 'home' || page.isHomePage) continue;
      
      // Skip if already processed in analysis
      const alreadyProcessed = content.pages?.analysis?.some(
        analysisPage => analysisPage.argument === page.argument
      );
      if (alreadyProcessed) continue;
      
      // Skip team member pages - they use /:member as primary route
      const isTeamMemberPage = content.team?.some(member => 
        page.argument === member.name?.toLowerCase().replace(/\s+/g, '-') ||
        page.argument.includes('hazleton')
      );
      if (isTeamMemberPage) {
        console.log(`⏭️  Skipped: /${page.argument}/ (team member uses /:member route)`);
        continue;
      }
      
      const slug = page.argument;
      const pageHtml = generateContentHTML(baseTemplate, page, 'content');
      const pageDir = path.join(targetDir, slug);
      
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml);
      console.log(`✅ Generated: /${slug}/index.html`);
      count++;
    }
  }
  
  return count;
}

/**
 * Generate SEO-optimized HTML for team member pages
 */
function generateMemberHTML(baseTemplate, member) {
  const title = `${member.name} - ${member.title} | TexEcon Team`;
  const description = member.description || `Learn about ${member.name}, ${member.title} at TexEcon providing expert Texas economic analysis and insights.`;
  const canonicalUrl = `https://texecon.com/${member.page_url?.replace('/section/', '') || member.name?.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Extract relevant keywords from member profile
  const keywords = generateMemberKeywords(member);
  
  let html = updateMetaTags(baseTemplate, title, description, canonicalUrl, keywords);
  
  // Enhanced structured data for person with more SEO details
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": member.name,
    "jobTitle": member.title,
    "description": description,
    "url": canonicalUrl,
    "image": member.image,
    "sameAs": Object.values(member.social || {}).filter(link => link !== '#'),
    "worksFor": {
      "@type": "Organization",
      "name": "TexEcon",
      "url": "https://texecon.com",
      "description": "Texas Economic Analysis and Commentary Platform"
    },
    "memberOf": {
      "@type": "Organization",
      "name": "TexEcon"
    },
    "knowsAbout": [
      "Texas Economy",
      "Economic Analysis", 
      "Economic Forecasting",
      "Business Development",
      "Economic Commentary"
    ]
  };
  
  return addStructuredData(html, structuredData);
}

/**
 * Generate relevant keywords for team member pages
 */
function generateMemberKeywords(member) {
  const baseKeywords = [
    "Texas economist",
    "economic analysis",
    "Texas economy expert",
    "economic forecasting",
    "business analysis Texas"
  ];
  
  // Add role-specific keywords
  if (member.title?.toLowerCase().includes('economist')) {
    baseKeywords.push("professional economist", "economic research", "economic trends");
  }
  
  if (member.title?.toLowerCase().includes('technology')) {
    baseKeywords.push("economic technology", "data analysis", "economic modeling");
  }
  
  return baseKeywords.join(', ');
}

/**
 * Generate SEO-optimized HTML for content pages
 */
function generateContentHTML(baseTemplate, page, type) {
  const title = `${page.title || page.argument} - Economic Analysis | TexEcon`;
  const description = page.description || `Expert analysis and insights on ${page.title || page.argument} from TexEcon's Texas economic experts.`;
  const canonicalUrl = `https://texecon.com/${page.argument}`;
  
  // Generate content-specific keywords
  const keywords = generateContentKeywords(page);
  
  let html = updateMetaTags(baseTemplate, title, description, canonicalUrl, keywords);
  
  // Enhanced structured data for article with rich SEO information
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": page.title || page.argument,
    "description": description,
    "url": canonicalUrl,
    "datePublished": page.modified_w3c || new Date().toISOString(),
    "dateModified": page.modified_w3c || new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "TexEcon",
      "url": "https://texecon.com"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "TexEcon",
      "url": "https://texecon.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://texecon.com/favicon-192x192.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "articleSection": "Economic Analysis",
    "keywords": keywords.split(', '),
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "about": {
      "@type": "Thing",
      "name": page.title || page.argument,
      "description": description
    }
  };
  
  // Add breadcrumb structured data for better navigation understanding
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://texecon.com"
      },
      {
        "@type": "ListItem", 
        "position": 2,
        "name": "Economic Analysis",
        "item": "https://texecon.com"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": page.title || page.argument,
        "item": canonicalUrl
      }
    ]
  };
  
  html = addStructuredData(html, structuredData);
  html = addStructuredData(html, breadcrumbData);
  
  return html;
}

/**
 * Generate relevant keywords for content pages based on content analysis
 */
function generateContentKeywords(page) {
  const baseKeywords = [
    "economic analysis",
    "economic development", 
    "business growth",
    "economic trends",
    "market analysis"
  ];
  
  // Extract location-based keywords
  const locationKeywords = extractLocationKeywords(page.title || page.argument, page.content);
  
  // Extract industry-based keywords  
  const industryKeywords = extractIndustryKeywords(page.content);
  
  return [...baseKeywords, ...locationKeywords, ...industryKeywords].join(', ');
}

/**
 * Extract location-based keywords from content
 */
function extractLocationKeywords(title, content = '') {
  const keywords = [];
  const locations = ['texas', 'arizona', 'phoenix', 'austin', 'dallas', 'houston', 'kansas', 'wichita'];
  
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  
  locations.forEach(location => {
    if (titleLower.includes(location) || contentLower.includes(location)) {
      keywords.push(`${location} economy`);
      keywords.push(`${location} business`);
      if (location !== 'texas') {
        keywords.push(`${location} economic development`);
      }
    }
  });
  
  return keywords;
}

/**
 * Extract industry-based keywords from content
 */
function extractIndustryKeywords(content = '') {
  const keywords = [];
  const industries = {
    'manufacturing': ['manufacturing', 'production', 'industrial'],
    'technology': ['technology', 'tech', 'software', 'innovation'],
    'healthcare': ['healthcare', 'medical', 'health'],
    'tourism': ['tourism', 'hospitality', 'travel'],
    'aerospace': ['aerospace', 'defense', 'aviation'],
    'energy': ['energy', 'oil', 'gas', 'renewable']
  };
  
  const contentLower = content.toLowerCase();
  
  Object.entries(industries).forEach(([industry, terms]) => {
    if (terms.some(term => contentLower.includes(term))) {
      keywords.push(`${industry} sector`);
      keywords.push(`${industry} analysis`);
    }
  });
  
  return keywords;
}

/**
 * Update meta tags in HTML template with enhanced SEO optimization
 */
function updateMetaTags(html, title, description, canonicalUrl, keywords = null) {
  // Update basic meta tags
  let updatedHtml = html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"/, `<meta name="description" content="${description}"`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"/, `<link rel="canonical" href="${canonicalUrl}"`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"/, `<meta property="og:title" content="${title}"`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"/, `<meta property="og:description" content="${description}"`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"/, `<meta property="og:url" content="${canonicalUrl}"`);
  
  // Update keywords if provided
  if (keywords) {
    updatedHtml = updatedHtml.replace(
      /<meta\s+name="keywords"\s+content="[^"]*"/,
      `<meta name="keywords" content="${keywords}"`
    );
  }
  
  // Update Twitter Card meta tags to match page content
  updatedHtml = updatedHtml
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"/, `<meta name="twitter:title" content="${title}"`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"/, `<meta name="twitter:description" content="${description}"`);
  
  // Add additional SEO meta tags for better optimization
  const additionalMetaTags = `
    <meta name="format-detection" content="telephone=no">
    <meta name="msapplication-tap-highlight" content="no">
    <meta property="article:publisher" content="https://texecon.com">
    <meta property="og:locale" content="en_US">
    <meta property="og:type" content="article">
    <meta name="twitter:creator" content="@TexEcon">
    <meta name="twitter:site" content="@TexEcon">`;
  
  // Insert additional meta tags before the closing head tag
  updatedHtml = updatedHtml.replace(
    /<link rel="canonical"/,
    `${additionalMetaTags}\n    <link rel="canonical"`
  );
  
  return updatedHtml;
}

/**
 * Add structured data to HTML with enhanced organization context
 */
function addStructuredData(html, structuredData) {
  // Check if we need to add organization structured data as well
  let organizationData = null;
  
  if (!html.includes('"@type": "Organization"') || structuredData['@type'] === 'Person') {
    organizationData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "TexEcon", 
      "url": "https://texecon.com",
      "description": "Leading Texas economic analysis and commentary platform providing expert insights on economic trends, data analysis, and forecasting.",
      "logo": {
        "@type": "ImageObject",
        "url": "https://texecon.com/favicon-192x192.png"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "url": "https://texecon.com"
      },
      "sameAs": [
        "https://texecon.com"
      ],
      "areaServed": {
        "@type": "Place",
        "name": "Texas",
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "31.9686",
          "longitude": "-99.9018"
        }
      },
      "knowsAbout": [
        "Texas Economy",
        "Economic Analysis",
        "Economic Forecasting", 
        "Business Development",
        "Market Research",
        "Economic Commentary"
      ]
    };
  }
  
  let structuredDataScript = `    <script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>`;
  
  if (organizationData) {
    structuredDataScript += `\n    <script type="application/ld+json">${JSON.stringify(organizationData, null, 2)}</script>`;
  }
  
  return html.replace(
    '</head>',
    `${structuredDataScript}\n  </head>`
  );
}

generateStaticPages().catch(console.error);
