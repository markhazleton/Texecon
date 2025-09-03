import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate static HTML pages for PRIMARY dynamic routes only to avoid duplicate content
 * This creates actual HTML files that search engines can crawl for:
 * - /section/:sectionSlug (team members only - primary route)
 * - /content/:contentSlug (main content pages only - primary route)
 * 
 * We avoid generating /topic/ and /page/ routes to prevent duplicate content SEO issues
 */
async function generateStaticPages() {
  console.log('🔧 Generating static pages for PRIMARY dynamic routes only...');
  
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
    
    // Only generate /section/:sectionSlug pages (team members) - PRIMARY route
    totalGenerated += await generateSectionPages(content, baseTemplate);
    
    // Only generate /content/:contentSlug pages (main content) - PRIMARY route  
    totalGenerated += await generateContentPages(content, baseTemplate);
    
    console.log(`🎉 Static page generation complete! Generated ${totalGenerated} pages total.`);
    console.log('ℹ️  Skipped /topic/ and /page/ routes to avoid duplicate content issues.');
    
  } catch (error) {
    console.error('❌ Error generating static pages:', error);
    process.exit(1);
  }
}

/**
 * Generate /section/:sectionSlug pages for team members ONLY
 * This is the primary route for team member profiles
 */
async function generateSectionPages(content, baseTemplate) {
  const sectionDir = path.join(__dirname, '..', 'target', 'section');
  if (!fs.existsSync(sectionDir)) {
    fs.mkdirSync(sectionDir, { recursive: true });
  }
  
  let count = 0;
  
  if (content.team && Array.isArray(content.team)) {
    for (const member of content.team) {
      const slug = member.page_url?.replace('/section/', '') || 
                  member.name?.toLowerCase().replace(/\s+/g, '-');
      
      if (!slug) continue;
      
      const memberHtml = generateMemberHTML(baseTemplate, member);
      const memberDir = path.join(sectionDir, slug);
      
      if (!fs.existsSync(memberDir)) {
        fs.mkdirSync(memberDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(memberDir, 'index.html'), memberHtml);
      console.log(`✅ Generated: /section/${slug}/index.html`);
      count++;
    }
  }
  
  return count;
}

/**
 * Generate /content/:contentSlug pages for main content ONLY
 * This is the primary route for content pages (not topic or page ID routes)
 */
async function generateContentPages(content, baseTemplate) {
  const contentDir = path.join(__dirname, '..', 'target', 'content');
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }
  
  let count = 0;
  
  // Process analysis pages - these should use /content/ as primary route
  if (content.pages?.analysis && Array.isArray(content.pages.analysis)) {
    for (const page of content.pages.analysis) {
      if (!page.argument) continue;
      
      const slug = page.argument;
      const pageHtml = generateContentHTML(baseTemplate, page, 'analysis');
      const pageDir = path.join(contentDir, slug);
      
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml);
      console.log(`✅ Generated: /content/${slug}/index.html`);
      count++;
    }
  }
  
  // Process main content pages (excluding team member pages which use /section/)
  if (content.pages?.all && Array.isArray(content.pages.all)) {
    for (const page of content.pages.all) {
      if (!page.argument || page.argument === 'home' || page.isHomePage) continue;
      
      // Skip if already processed in analysis
      const alreadyProcessed = content.pages?.analysis?.some(
        analysisPage => analysisPage.argument === page.argument
      );
      if (alreadyProcessed) continue;
      
      // Skip team member pages - they use /section/ as primary route
      const isTeamMemberPage = content.team?.some(member => 
        page.argument === member.name?.toLowerCase().replace(/\s+/g, '-') ||
        page.argument.includes('hazleton')
      );
      if (isTeamMemberPage) {
        console.log(`⏭️  Skipped: /content/${page.argument}/ (team member uses /section/ route)`);
        continue;
      }
      
      const slug = page.argument;
      const pageHtml = generateContentHTML(baseTemplate, page, 'content');
      const pageDir = path.join(contentDir, slug);
      
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml);
      console.log(`✅ Generated: /content/${slug}/index.html`);
      count++;
    }
  }
  
  return count;
}

/**
 * Generate SEO-optimized HTML for team member pages
 */
function generateMemberHTML(baseTemplate, member) {
  const title = `${member.name} - TexEcon Team`;
  const description = member.bio || `Learn about ${member.name}, a key member of the TexEcon team providing expert Texas economic analysis and insights.`;
  const canonicalUrl = `https://texecon.com/section/${member.page_url?.replace('/section/', '') || member.name?.toLowerCase().replace(/\s+/g, '-')}`;
  
  let html = updateMetaTags(baseTemplate, title, description, canonicalUrl);
  
  // Add structured data for person
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": member.name,
    "description": description,
    "url": canonicalUrl,
    "memberOf": {
      "@type": "Organization",
      "name": "TexEcon"
    }
  };
  
  return addStructuredData(html, structuredData);
}

/**
 * Generate SEO-optimized HTML for content pages
 */
function generateContentHTML(baseTemplate, page, type) {
  const title = `${page.title || page.argument} - TexEcon`;
  const description = page.description || `Expert analysis and insights on ${page.title || page.argument} from TexEcon's Texas economic experts.`;
  const canonicalUrl = `https://texecon.com/content/${page.argument}`;
  
  let html = updateMetaTags(baseTemplate, title, description, canonicalUrl);
  
  // Add structured data for article
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": page.title || page.argument,
    "description": description,
    "url": canonicalUrl,
    "dateModified": page.modified_w3c || new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "TexEcon"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "TexEcon"
    }
  };
  
  return addStructuredData(html, structuredData);
}

/**
 * Update meta tags in HTML template
 */
function updateMetaTags(html, title, description, canonicalUrl) {
  return html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"/, `<meta name="description" content="${description}"`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"/, `<link rel="canonical" href="${canonicalUrl}"`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"/, `<meta property="og:title" content="${title}"`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"/, `<meta property="og:description" content="${description}"`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"/, `<meta property="og:url" content="${canonicalUrl}"`);
}

/**
 * Add structured data to HTML
 */
function addStructuredData(html, structuredData) {
  return html.replace(
    '</head>',
    `    <script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>\n  </head>`
  );
}

generateStaticPages().catch(console.error);
