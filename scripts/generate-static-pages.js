import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate static HTML pages for dynamic routes using exact API URLs
 * This creates actual HTML files that search engines can crawl using the 
 * exact URL structure from the API data
 */
async function generateStaticPages() {
  console.log('🔧 Generating static pages using API URL structure...');
  
  try {
    // Load the content data
    const contentPath = path.join(__dirname, '..', 'client', 'src', 'data', 'webspark-raw.json');
    
    if (!fs.existsSync(contentPath)) {
      console.error('❌ Content file not found:', contentPath);
      return;
    }
    
    const rawData = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    const content = rawData.data;
    const baseTemplate = fs.readFileSync(
      path.join(__dirname, '..', 'target', 'index.html'), 
      'utf8'
    );
    
    let totalGenerated = 0;
    
    // Generate pages for all menu items that have URLs
    if (content.menu && Array.isArray(content.menu)) {
      for (const item of content.menu) {
        if (!item.url || item.url === '/' || item.isHomePage) {
          continue; // Skip home page and items without URLs
        }
        
        const pageHtml = generatePageHTML(baseTemplate, item);
        // Use the exact URL from API, removing leading slash for directory path
        const urlPath = item.url.startsWith('/') ? item.url.slice(1) : item.url;
        const pageDir = path.join(__dirname, '..', 'target', urlPath);
        
        if (!fs.existsSync(pageDir)) {
          fs.mkdirSync(pageDir, { recursive: true });
        }
        
        fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml);
        console.log(`✅ Generated: ${item.url}/index.html`);
        totalGenerated++;
      }
    }
    
    console.log(`🎉 Static page generation complete! Generated ${totalGenerated} pages total.`);
    console.log('ℹ️  Using exact API URL structure for all pages.');
    
  } catch (error) {
    console.error('❌ Error generating static pages:', error);
    process.exit(1);
  }
}

/**
 * Generate SEO-optimized HTML for any page using API data
 */
function generatePageHTML(baseTemplate, item) {
  const title = `${item.title || item.argument} - Economic Analysis | TexEcon`;
  const description = item.description || `Expert analysis and insights on ${item.title || item.argument} from TexEcon's Texas economic experts.`;
  const canonicalUrl = `https://texecon.com${item.url}`;
  
  // Generate content-specific keywords
  const keywords = generateContentKeywords(item);
  
  let html = updateMetaTags(baseTemplate, title, description, canonicalUrl, keywords);
  
  // Determine content type for structured data
  const isPersonPage = item.argument && item.argument.includes('hazleton');
  
  if (isPersonPage) {
    // Enhanced structured data for person
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": item.title,
      "jobTitle": item.description || "Economic Analysis Expert",
      "description": description,
      "url": canonicalUrl,
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
    
    html = addStructuredData(html, structuredData);
  } else {
    // Enhanced structured data for article/content
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": item.title || item.argument,
      "description": description,
      "url": canonicalUrl,
      "datePublished": item.modified_w3c || new Date().toISOString(),
      "dateModified": item.modified_w3c || new Date().toISOString(),
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
        "name": item.title || item.argument,
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
          "name": item.title || item.argument,
          "item": canonicalUrl
        }
      ]
    };
    
    html = addStructuredData(html, structuredData);
    html = addStructuredData(html, breadcrumbData);
  }
  
  return html;
}

/**
 * Generate relevant keywords for content pages based on content analysis
 */
function generateContentKeywords(item) {
  const baseKeywords = [
    "economic analysis",
    "economic development", 
    "business growth",
    "economic trends",
    "market analysis"
  ];
  
  // Extract location-based keywords
  const locationKeywords = extractLocationKeywords(item.title || item.argument, item.content);
  
  // Extract industry-based keywords  
  const industryKeywords = extractIndustryKeywords(item.content);
  
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
