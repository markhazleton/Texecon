#!/usr/bin/env node

/**
 * Simple content refresh script that works with current setup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function refreshContent() {
  console.log('🔄 Refreshing content for static build...');
  
  const dataDir = path.join(__dirname, '..', 'client', 'src', 'data');
  
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const reportPath = path.join(dataDir, 'content-refresh-report.json');
  const startTime = Date.now();
  
  try {
    // Try to fetch from the WebSpark API
    const apiUrl = 'https://webspark.markhazleton.com/api/WebCMS/websites/1';
    const headers = {
      'Accept': 'application/json',
      'Authorization': 'Bearer MARKHAZLETON-WEB',
      'Cookie': '.AspNetCore.Antiforgery.DlpvxuBJxZo=CfDJ8C3wmONpH_FLphaqQtDLGRYuZc_a6WnqAFCJfLk5gXJrPIrBzDAeMRGaHM4nB5VvGscxdzWEpjSr7P-E-0av185InEN6AE2QazEDzVNGLwOv1YYKrBVcpf6eBMIlbj9VeHo13fpOQv8sQ8wfTdIPSVs'
    };
    
    console.log('📡 Attempting to fetch fresh content from API...');
    // Use a simple timeout without AbortController to avoid a libuv assertion on Windows
    const response = await Promise.race([
      fetch(apiUrl, { headers }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out after 10s')), 10000))
    ]);
    
    if (response.ok) {
      const data = await response.json();
      const fetchTime = Date.now() - startTime;
      
      // Analyze the fetched data for detailed reporting
      const contentAnalysis = analyzeApiResponse(data);
      
      // Save the fresh data
      fs.writeFileSync(
        path.join(dataDir, 'webspark-raw.json'),
        JSON.stringify(data, null, 2)
      );
      
      // Generate refresh report with detailed counts
      const report = {
        timestamp: new Date().toISOString(),
        status: 'success',
        fetchTime,
        contentUpdated: true,
        source: 'webspark-api',
        apiResponse: {
          success: data.success,
          hasData: !!data.data,
          menuCount: data.data?.menu?.length || 0
        },
        contentCounts: contentAnalysis,
        dataSize: JSON.stringify(data).length
      };
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      console.log('✅ Fresh content fetched successfully!');
      console.log(`   ⏱️  Fetch time: ${fetchTime}ms`);
      console.log(`   � API Response Analysis:`);
      console.log(`      �📄 Total pages: ${contentAnalysis.totalPages}`);
      console.log(`      🧭 Navigation pages: ${contentAnalysis.navigationPages}`);
      console.log(`      🏠 Home pages: ${contentAnalysis.homePages}`);
      console.log(`      📝 Pages with content: ${contentAnalysis.pagesWithContent}`);
      console.log(`      🔗 Parent-child relationships: ${contentAnalysis.parentChildRelations}`);
      console.log(`   💾 Data size: ${Math.round(report.dataSize / 1024)} KB`);
      console.log(`   📅 Updated: ${new Date().toLocaleString()}`);
      console.log(`   📊 Content is now fresh and ready for build`);
      
      return report;
      
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
  } catch (error) {
    const fallbackTime = Date.now() - startTime;
    
    console.log(`⚠️  API fetch failed: ${error.message}`);
    console.log('📚 Using existing cached content...');
    console.log('💡 Build will continue with previously fetched data');
    
    // Check existing content and analyze it
    const cachedFiles = [
      'webspark-raw.json',
      'texecon-content.json'
    ];
    
    const existingContent = cachedFiles.map(file => {
      const filePath = path.join(dataDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        let contentAnalysis = null;
        
        // Try to analyze cached content
        if (file === 'webspark-raw.json') {
          try {
            const cachedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            contentAnalysis = analyzeApiResponse(cachedData);
          } catch (e) {
            // Ignore parsing errors
          }
        }
        
        return {
          file,
          exists: true,
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
          contentAnalysis
        };
      }
      return { file, exists: false };
    });
    
    const report = {
      timestamp: new Date().toISOString(),
      status: 'fallback',
      fetchTime: fallbackTime,
      contentUpdated: false,
      error: error.message,
      cachedContent: existingContent,
      source: 'cached-data'
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📋 Content status:');
    existingContent.forEach(item => {
      if (item.exists) {
        const age = new Date(Date.now() - new Date(item.lastModified).getTime());
        const ageStr = age.getTime() < 86400000 ? 
          `${Math.floor(age.getTime() / 3600000)}h ago` : 
          `${Math.floor(age.getTime() / 86400000)}d ago`;
        console.log(`   ✅ ${item.file} (${ageStr})`);
        
        // Show content analysis for raw data
        if (item.contentAnalysis && item.file === 'webspark-raw.json') {
          console.log(`      📄 Cached pages: ${item.contentAnalysis.totalPages}`);
          console.log(`      🧭 Navigation: ${item.contentAnalysis.navigationPages}`);
          console.log(`      📝 With content: ${item.contentAnalysis.pagesWithContent}`);
          console.log(`      📊 Content types: ${Object.keys(item.contentAnalysis.contentTypes).length}`);
        }
      } else {
        console.log(`   ❌ ${item.file} (missing)`);
      }
    });
    
    return report;
  }
}

function analyzeApiResponse(data) {
  if (!data.success || !data.data?.menu) {
    return {
      totalPages: 0,
      navigationPages: 0,
      homePages: 0,
      pagesWithContent: 0,
      parentChildRelations: 0,
      contentTypes: {},
      averageContentLength: 0
    };
  }
  
  const pages = data.data.menu;
  
  // Count different types of pages
  const navigationPages = pages.filter(page => page.display_navigation).length;
  const homePages = pages.filter(page => page.isHomePage).length;
  const pagesWithContent = pages.filter(page => page.content && page.content.trim().length > 0).length;
  const parentChildRelations = pages.filter(page => page.parent_page !== null && page.parent_page !== undefined).length;
  
  // Analyze content types and arguments
  const contentTypes = {};
  let totalContentLength = 0;
  
  pages.forEach(page => {
    // Count by argument/type
    const type = page.argument || 'no-argument';
    contentTypes[type] = (contentTypes[type] || 0) + 1;
    
    // Sum content length
    if (page.content) {
      totalContentLength += page.content.length;
    }
  });
  
  return {
    totalPages: pages.length,
    navigationPages,
    homePages,
    pagesWithContent,
    parentChildRelations,
    contentTypes,
    averageContentLength: pagesWithContent > 0 ? Math.round(totalContentLength / pagesWithContent) : 0,
    totalContentCharacters: totalContentLength
  };
}

// Run if called directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  refreshContent()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Content refresh failed:', error);
      process.exit(1);
    });
}

export { refreshContent };
