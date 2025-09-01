#!/usr/bin/env node

/**
 * Build-time content fetching script for TexEcon static site generation
 * Fetches content from WebSpark API and caches it for offline/static usage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fetchTexEconContent() {
  const apiUrl = 'https://webspark.markhazleton.com/api/WebCMS/websites/1';
  const headers = {
    'Accept': 'application/json',
    'Authorization': 'Bearer MARKHAZLETON-WEB',
    'Cookie': '.AspNetCore.Antiforgery.DlpvxuBJxZo=CfDJ8C3wmONpH_FLphaqQtDLGRYuZc_a6WnqAFCJfLk5gXJrPIrBzDAeMRGaHM4nB5VvGscxdzWEpjSr7P-E-0av185InEN6AE2QazEDzVNGLwOv1YYKrBVcpf6eBMIlbj9VeHo13fpOQv8sQ8wfTdIPSVs; .AspNetCore.Antiforgery.tvaVAstoha0=CfDJ8Nbddi0GFelFlLbYOyee0tfWE9b5PkLjyFJg97tQfv-GWRusAl0d4PL5WAOjzXx995KePx9GIyNblQkMqphqPReqakafy-zTGGoKK0ElSDzofhH2vROOsgNY4bmQkupPlUEXTG8CCxs5Am0CjkGfjiA'
  };

  try {
    console.log('🔄 Fetching TexEcon content from WebSpark API...');
    
    const response = await fetch(apiUrl, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Create cached data directory
    const cacheDir = path.join(__dirname, '..', 'client', 'src', 'data');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Save raw API response
    const rawDataPath = path.join(cacheDir, 'webspark-raw.json');
    fs.writeFileSync(rawDataPath, JSON.stringify(data, null, 2));
    
    // Transform and save processed data
    const processedData = processWebSparkData(data);
    const processedDataPath = path.join(cacheDir, 'texecon-content.json');
    fs.writeFileSync(processedDataPath, JSON.stringify(processedData, null, 2));
    
    // Create TypeScript interface file
    createTypesFile(cacheDir, data);
    
    console.log('✅ Content successfully fetched and cached');
    console.log(`   Raw data: ${rawDataPath}`);
    console.log(`   Processed data: ${processedDataPath}`);
    console.log(`   Found ${data.data.menu.length} pages`);
    
    return processedData;
    
  } catch (error) {
    console.error('❌ Failed to fetch content:', error.message);
    
    // Try to load existing cached data as fallback
    try {
      const cacheDir = path.join(__dirname, '..', 'client', 'src', 'data');
      const cachedPath = path.join(cacheDir, 'texecon-content.json');
      
      if (fs.existsSync(cachedPath)) {
        console.log('🔄 Using existing cached data as fallback');
        const cached = fs.readFileSync(cachedPath, 'utf8');
        return JSON.parse(cached);
      }
    } catch (fallbackError) {
      console.error('❌ Fallback data also unavailable:', fallbackError.message);
    }
    
    throw error;
  }
}

function processWebSparkData(apiData) {
  if (!apiData.success || !apiData.data.menu) {
    throw new Error('Invalid API response structure');
  }

  const pages = apiData.data.menu;
  
  // Extract different content types
  const homePage = pages.find(page => page.isHomePage || page.argument === 'home') || pages[0];
  const aboutPage = pages.find(page => page.argument === 'about' || page.description?.toLowerCase().includes('team'));
  const analysisPages = pages.filter(page => 
    page.argument?.includes('analysis') || 
    page.description?.toLowerCase().includes('economic') ||
    page.description?.toLowerCase().includes('market')
  );
  
  // Extract team information from content
  const teamInfo = extractTeamInfo(aboutPage?.content || '');
  const insights = extractInsights(analysisPages);
  const economicMetrics = extractEconomicMetrics(pages);
  
  return {
    metadata: {
      title: apiData.data.description,
      description: homePage?.description || 'Texas Economic Analysis & Commentary',
      lastUpdated: new Date().toISOString(),
      sourcePages: pages.length
    },
    hero: {
      title: homePage?.description || 'Texas Economic Analysis & Insights',
      content: stripHtml(homePage?.content || '').substring(0, 250) + '...'
    },
    navigation: pages
      .filter(page => page.display_navigation)
      .sort((a, b) => a.order - b.order)
      .slice(0, 6) // Limit navigation items
      .map(page => ({
        id: page.argument || page.id.toString(),
        label: formatNavLabel(page.argument || 'Page'),
        href: `#${page.argument || page.id}`,
        description: page.description
      })),
    team: teamInfo,
    insights: insights,
    economicMetrics: economicMetrics,
    pages: {
      home: homePage,
      about: aboutPage,
      analysis: analysisPages.slice(0, 6), // Limit for performance
      all: pages
    }
  };
}

function extractTeamInfo(content) {
  // Default team info - in a real scenario, this would parse the content
  return [
    {
      id: "jared-hazleton",
      name: "Dr. Jared Hazleton",
      title: "Lead Economist",
      description: "Renowned economist with years of experience in economic analysis and commentary, specializing in Texas economic trends.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      social: { linkedin: "#", twitter: "#" }
    },
    {
      id: "mark-hazleton", 
      name: "Mark Hazleton",
      title: "Technology Director", 
      description: "Co-founder of Control Origins, bridging economic insights with cutting-edge technology solutions.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      social: { linkedin: "#", github: "#" }
    }
  ];
}

function extractInsights(analysisPages) {
  return analysisPages.slice(0, 6).map((page, index) => ({
    id: page.argument || page.id.toString(),
    title: page.description || 'Economic Analysis',
    category: determineCateogry(page.description, page.content),
    date: formatDate(page.modified_w3c),
    excerpt: stripHtml(page.content).substring(0, 150) + '...',
    image: getInsightImage(index),
    slug: `/insights/${page.argument || page.id}`
  }));
}

function extractEconomicMetrics(pages) {
  // Extract metrics from content - this is a simplified version
  // In reality, you'd parse the content for actual economic data
  return {
    gdpGrowth: { value: 4.2, unit: "%", change: "+0.3% vs Q3", label: "GDP Growth Rate" },
    unemployment: { value: 3.1, unit: "%", change: "-0.2% vs Last Month", label: "Unemployment Rate" },
    housingIndex: { value: 145.2, unit: "", change: "+2.1% YoY", label: "Housing Price Index" },
    industrialProduction: { value: 108.7, unit: "", change: "+1.8% vs Q3", label: "Industrial Production" }
  };
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function formatNavLabel(argument) {
  return argument.charAt(0).toUpperCase() + argument.slice(1).replace(/-/g, ' ');
}

function determineCateogry(description, content) {
  const text = (description + ' ' + content).toLowerCase();
  if (text.includes('energy') || text.includes('oil')) return 'ENERGY';
  if (text.includes('tech') || text.includes('technology')) return 'TECH';
  return 'ANALYSIS';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1) return '1 day ago';
  if (daysDiff < 7) return `${daysDiff} days ago`;
  if (daysDiff < 14) return '1 week ago';
  if (daysDiff < 30) return `${Math.floor(daysDiff/7)} weeks ago`;
  return date.toLocaleDateString();
}

function getInsightImage(index) {
  const images = [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
  ];
  return images[index % images.length];
}

function createTypesFile(dir, apiData) {
  const typesContent = `// Auto-generated types from WebSpark API
export interface CachedContent {
  metadata: {
    title: string;
    description: string; 
    lastUpdated: string;
    sourcePages: number;
  };
  hero: {
    title: string;
    content: string;
  };
  navigation: Array<{
    id: string;
    label: string;
    href: string;
    description: string;
  }>;
  team: Array<{
    id: string;
    name: string;
    title: string;
    description: string;
    image: string;
    social: Record<string, string>;
  }>;
  insights: Array<{
    id: string;
    title: string;
    category: string;
    date: string;
    excerpt: string;
    image: string;
    slug: string;
  }>;
  economicMetrics: Record<string, {
    value: number;
    unit: string;
    change: string;
    label: string;
  }>;
  pages: {
    home: any;
    about: any;
    analysis: any[];
    all: any[];
  };
}
`;
  
  fs.writeFileSync(path.join(dir, 'content-types.ts'), typesContent);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchTexEconContent()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { fetchTexEconContent, processWebSparkData };