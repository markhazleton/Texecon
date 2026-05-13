import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Ensure a URL path has a trailing slash (except root).
 */
function withTrailingSlash(url) {
  if (!url || url === '/') return '/';
  return url.endsWith('/') ? url : `${url}/`;
}

/**
 * Build a menu hierarchy (mirrors menu-utils.ts buildMenuHierarchy).
 * Returns { topLevel, byId, byParent }.
 */
function buildMenuHierarchy(menuItems) {
  const filtered = menuItems
    .filter((item) => item.display_navigation)
    .sort((a, b) => a.order - b.order);

  const byId = {};
  const byParent = {};

  filtered.forEach((item) => {
    byId[item.id] = { ...item, children: [] };
    if (item.parent_page) {
      if (!byParent[item.parent_page]) byParent[item.parent_page] = [];
      byParent[item.parent_page].push(item.id);
    }
  });

  filtered.forEach((item) => {
    if (byParent[item.id]) {
      byId[item.id].children = byParent[item.id]
        .map((id) => byId[id])
        .filter(Boolean)
        .sort((a, b) => a.order - b.order);
    }
  });

  const topLevel = filtered
    .filter((item) => !item.parent_page || !byId[item.parent_page])
    .map((item) => byId[item.id]);

  return { topLevel, byId, byParent };
}

/**
 * Render top-level navigation bar HTML with real <a href> links.
 */
function generateNavHTML(hierarchy, currentUrl) {
  let nav =
    `<nav style="background:#1e3a5f;padding:12px 24px;display:flex;` +
    `align-items:center;gap:20px;flex-wrap:wrap;font-family:system-ui,sans-serif;">` +
    `<a href="/" style="color:#fff;font-weight:700;font-size:1.15em;text-decoration:none;` +
    `margin-right:8px;">TexEcon</a>`;

  hierarchy.topLevel.forEach((item) => {
    if (item.isHomePage) return;
    const isActive = currentUrl === item.url;
    const color = isActive ? '#60a5fa' : '#e2e8f0';
    const suffix = item.children && item.children.length > 0 ? ' ▾' : '';
    nav +=
      `<a href="${escapeHtmlAttr(withTrailingSlash(item.url))}" style="color:${color};text-decoration:none;` +
      `font-size:0.95em;" aria-current="${isActive ? 'page' : 'false'}">${escapeHtml(item.title)}${suffix}</a>`;
  });

  nav += `</nav>`;
  return nav;
}

/**
 * Render breadcrumb trail HTML with real <a href> links.
 */
function generateBreadcrumbHTML(item, byId) {
  // Build trail from root → current
  const trail = [];
  let cur = item;
  while (cur) {
    trail.unshift(cur);
    cur = cur.parent_page ? byId[cur.parent_page] : null;
  }

  let html =
    `<nav aria-label="Breadcrumb" style="padding:8px 24px;background:#f8fafc;` +
    `border-bottom:1px solid #e2e8f0;font-family:system-ui,sans-serif;">` +
    `<ol style="list-style:none;display:flex;flex-wrap:wrap;gap:4px;margin:0;` +
    `padding:0;font-size:0.875em;" itemscope itemtype="https://schema.org/BreadcrumbList">` +
    `<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">` +
    `<a href="/" itemprop="item" style="color:#1e3a5f;text-decoration:none;">` +
    `<span itemprop="name">Home</span></a>` +
    `<meta itemprop="position" content="1"/></li>`;

  trail.forEach((bc, i) => {
    const isLast = i === trail.length - 1;
    html += `<li aria-hidden="true" style="color:#9ca3af;">›</li>`;
    html +=
      `<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">`;
    if (isLast) {
      html +=
        `<span itemprop="name" aria-current="page" style="color:#374151;">${escapeHtml(bc.title)}</span>` +
        `<meta itemprop="item" content="https://texecon.com${escapeHtmlAttr(withTrailingSlash(bc.url))}"/>`;
    } else {
      html +=
        `<a href="${escapeHtmlAttr(withTrailingSlash(bc.url))}" itemprop="item" style="color:#1e3a5f;text-decoration:none;">` +
        `<span itemprop="name">${escapeHtml(bc.title)}</span></a>`;
    }
    html += `<meta itemprop="position" content="${i + 2}"/></li>`;
  });

  html += `</ol></nav>`;
  return html;
}

/**
 * Render a full nested site-map section so crawlers can discover every page.
 */
function generateSiteNavHTML(hierarchy) {
  function renderItems(items, depth) {
    if (!items || items.length === 0) return '';
    const indent = depth === 0
      ? 'list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:16px;'
      : 'list-style:none;padding-left:16px;margin:4px 0 0 0;';
    let html = `<ul style="${indent}">`;
    items.forEach((item) => {
      if (item.isHomePage) return;
      html +=
        `<li style="margin-bottom:2px;">` +
        `<a href="${escapeHtmlAttr(withTrailingSlash(item.url))}" ` +
        `style="color:#1e3a5f;text-decoration:none;font-size:0.9em;">${escapeHtml(item.title)}</a>`;
      if (item.children && item.children.length > 0) {
        html += renderItems(item.children, depth + 1);
      }
      html += `</li>`;
    });
    html += `</ul>`;
    return html;
  }

  return (
    `<section style="background:#f1f5f9;padding:24px;border-top:1px solid #e2e8f0;` +
    `font-family:system-ui,sans-serif;">` +
    `<h2 style="font-size:1em;font-weight:600;color:#1e3a5f;margin:0 0 12px;">Site Navigation</h2>` +
    renderItems(hierarchy.topLevel, 0) +
    `</section>`
  );
}

/**
 * Render a minimal but complete footer HTML.
 */
function generateFooterHTML() {
  const year = new Date().getFullYear();
  return (
    `<footer style="background:#1e3a5f;color:#e2e8f0;padding:28px 24px;text-align:center;` +
    `font-family:system-ui,sans-serif;">` +
    `<p style="margin:0 0 8px;font-size:0.9em;">© ${year} TexEcon. All rights reserved.</p>` +
    `<p style="margin:0;font-size:0.85em;">` +
    `<a href="/texas/" style="color:#93c5fd;text-decoration:none;">Texas</a> · ` +
    `<a href="/arizona/" style="color:#93c5fd;text-decoration:none;">Arizona</a> · ` +
    `<a href="/kansas/" style="color:#93c5fd;text-decoration:none;">Kansas</a> · ` +
    `<a href="/texecon/mark-hazleton/" style="color:#93c5fd;text-decoration:none;">About Mark</a> · ` +
    `<a href="/sitemap.xml" style="color:#93c5fd;text-decoration:none;">Sitemap</a>` +
    `</p></footer>`
  );
}

/**
 * Build the full static body to be placed inside <div id="root"> before React loads.
 * Crawlers read this; React replaces it when JS executes.
 */
function buildStaticRoot(item, hierarchy) {
  const navHTML = generateNavHTML(hierarchy, item ? item.url : '/');
  const footerHTML = generateFooterHTML();
  const siteNavHTML = generateSiteNavHTML(hierarchy);

  if (!item) {
    // Home page: list all top-level sections
    let sectionsHTML = '';
    hierarchy.topLevel.forEach((sec) => {
      if (sec.isHomePage) return;
      sectionsHTML +=
        `<article style="margin-bottom:24px;padding:16px;border:1px solid #e2e8f0;border-radius:8px;">` +
        `<h2 style="margin:0 0 8px;"><a href="${escapeHtmlAttr(sec.url)}" ` +
        `style="color:#1e3a5f;text-decoration:none;">${escapeHtml(sec.title)}</a></h2>` +
        `<p style="margin:0;color:#4b5563;font-size:0.95em;">${escapeHtml(sec.description || '')}</p>`;
      if (sec.children && sec.children.length > 0) {
        sectionsHTML += `<ul style="margin:8px 0 0 16px;padding:0;list-style:disc;">`;
        sec.children.forEach((child) => {
          sectionsHTML +=
            `<li><a href="${escapeHtmlAttr(child.url)}" ` +
            `style="color:#1e3a5f;text-decoration:none;">${escapeHtml(child.title)}</a></li>`;
        });
        sectionsHTML += `</ul>`;
      }
      sectionsHTML += `</article>`;
    });

    return (
      `<div id="static-content" style="font-family:system-ui,sans-serif;">` +
      navHTML +
      `<main style="max-width:1200px;margin:0 auto;padding:32px 24px;">` +
      `<h1 style="color:#1e3a5f;margin:0 0 8px;">Texas Economic Analysis &amp; Insights</h1>` +
      `<p style="color:#4b5563;margin:0 0 32px;">Expert insights on Texas economy trends, ` +
      `data analysis, and economic forecasting.</p>` +
      sectionsHTML +
      `</main>` +
      siteNavHTML +
      footerHTML +
      `</div>`
    );
  }

  const breadcrumbHTML = generateBreadcrumbHTML(item, hierarchy.byId);

  return (
    `<div id="static-content" style="font-family:system-ui,sans-serif;">` +
    navHTML +
    breadcrumbHTML +
    `<main style="max-width:1200px;margin:0 auto;padding:32px 24px;">` +
    (item.content || `<h1>${escapeHtml(item.title)}</h1>`) +
    `</main>` +
    siteNavHTML +
    footerHTML +
    `</div>`
  );
}

/**
 * Inject the static root content into the base template's <div id="root">.
 */
function injectStaticRoot(baseTemplate, item, hierarchy) {
  const staticRoot = buildStaticRoot(item, hierarchy);
  return baseTemplate.replace(
    '<div id="root"></div>',
    `<div id="root">${staticRoot}</div>`
  );
}

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
    const baseTemplatePath = path.join(__dirname, '..', 'target', 'index.html');
    const baseTemplate = fs.readFileSync(baseTemplatePath, 'utf8');

    if (!content.menu || !Array.isArray(content.menu)) {
      console.error('❌ No menu data found in content file.');
      return;
    }

    const hierarchy = buildMenuHierarchy(content.menu);
    let totalGenerated = 0;

    // Update the home page (target/index.html) with static nav + site map
    const homeHtml = injectStaticRoot(baseTemplate, null, hierarchy);
    fs.writeFileSync(baseTemplatePath, homeHtml);
    console.log('✅ Updated home page: /index.html');
    totalGenerated++;

    // Generate pages for all menu items that have URLs
    for (const item of content.menu) {
      if (!item.url || item.url === '/' || item.isHomePage) {
        continue; // Skip home page and items without URLs
      }

      const pageHtml = generatePageHTML(injectStaticRoot(baseTemplate, hierarchy.byId[item.id] || item, hierarchy), item);
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
    
    console.log(`🎉 Static page generation complete! Generated ${totalGenerated} pages total.`);
    console.log('ℹ️  All pages now contain real <a href> links and pre-rendered content for crawlers.');
    
  } catch (error) {
    console.error('❌ Error generating static pages:', error);
    process.exit(1);
  }
}

/**
 * Generate SEO-optimized HTML for any page using API data
 */
function generatePageHTML(baseTemplate, item) {
  const contentText = stripHtml(item.content || "");
  const title = `${item.title || item.argument} - Economic Analysis | TexEcon`;
  const description = buildMetaDescription(item, contentText);
  const canonicalUrl = `https://texecon.com${withTrailingSlash(item.url)}`;
  
  // Generate content-specific keywords
  const keywords = generateContentKeywords(item, contentText);
  
  const isPersonPage = Boolean(item.argument && item.argument.includes('hazleton'));
  const ogType = isPersonPage ? "profile" : "article";
  const breadcrumbData = generateBreadcrumbData(item, canonicalUrl);

  let html = baseTemplate;
  
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
    
    html = addStructuredData(html, structuredData);
  }

  html = updateMetaTags(html, title, description, canonicalUrl, keywords, ogType);
  html = addStructuredData(html, breadcrumbData);
  
  return html;
}

/**
 * Generate relevant keywords for content pages based on content analysis
 */
function generateContentKeywords(item, content = "") {
  const baseKeywords = [
    "economic analysis",
    "economic trends",
    "texas economy",
    "market analysis"
  ];
  const apiKeywords = (item.keywords || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  
  // Extract location-based keywords
  const locationKeywords = extractLocationKeywords(item.title || item.argument, content);
  
  // Extract industry-based keywords  
  const industryKeywords = extractIndustryKeywords(content);
  
  const merged = [...baseKeywords, ...apiKeywords, ...locationKeywords, ...industryKeywords];
  const unique = Array.from(new Set(merged.map((value) => value.toLowerCase())));
  return unique.slice(0, 20).join(", ");
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
function updateMetaTags(html, title, description, canonicalUrl, keywords = null, ogType = "article") {
  const safeTitle = escapeHtmlAttr(title);
  const safeDescription = escapeHtmlAttr(description);
  const safeCanonicalUrl = escapeHtmlAttr(canonicalUrl);
  const safeKeywords = keywords ? escapeHtmlAttr(keywords) : null;

  // Update basic meta tags
  let updatedHtml = html
    .replace(/<title>.*?<\/title>/, `<title>${safeTitle}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"/, `<meta name="description" content="${safeDescription}"`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"/, `<link rel="canonical" href="${safeCanonicalUrl}"`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"/, `<meta property="og:title" content="${safeTitle}"`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"/, `<meta property="og:description" content="${safeDescription}"`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"/, `<meta property="og:url" content="${safeCanonicalUrl}"`)
    .replace(/<meta\s+property="og:type"\s+content="[^"]*"/, `<meta property="og:type" content="${ogType}"`);
  
  // Update keywords if provided
  if (safeKeywords) {
    updatedHtml = updatedHtml.replace(
      /<meta\s+name="keywords"\s+content="[^"]*"/,
      `<meta name="keywords" content="${safeKeywords}"`
    );
  }
  
  // Update Twitter Card meta tags to match page content
  updatedHtml = updatedHtml
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"/, `<meta name="twitter:title" content="${safeTitle}"`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"/, `<meta name="twitter:description" content="${safeDescription}"`);
  
  return updatedHtml;
}

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildMetaDescription(item, contentText) {
  const fallback = `Expert analysis and insights on ${item.title || item.argument} from TexEcon's Texas economic experts.`;
  const base = item.description && item.description.trim() ? item.description.trim() : (contentText || fallback);
  return base.length > 160 ? `${base.slice(0, 157).trim()}...` : base;
}

function escapeHtmlAttr(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatPathSegment(segment = "") {
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function generateBreadcrumbData(item, canonicalUrl) {
  const segments = (item.url || "/")
    .split("/")
    .filter(Boolean);

  const itemListElement = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://texecon.com",
    },
  ];

  segments.forEach((segment, index) => {
    const url = `https://texecon.com/${segments.slice(0, index + 1).join("/")}/`;
    itemListElement.push({
      "@type": "ListItem",
      position: index + 2,
      name: index === segments.length - 1 ? (item.title || formatPathSegment(segment)) : formatPathSegment(segment),
      item: url,
    });
  });

  if (segments.length === 0) {
    itemListElement.push({
      "@type": "ListItem",
      position: 2,
      name: item.title || item.argument || "Page",
      item: canonicalUrl,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
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
