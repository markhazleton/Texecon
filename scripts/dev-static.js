#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

async function buildAndServe() {
  console.log('🔧 Building static site...');
  
  try {
    // Build the site
    await execAsync('npm run build:static', { cwd: projectRoot });
    console.log('✅ Build completed successfully!');
    
    // Start the development server
    console.log('🚀 Starting development server...');
    const serverProcess = exec('npx serve dist/public -s -l 5000', { 
      cwd: projectRoot 
    });
    
    serverProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down development server...');
      serverProcess.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildAndServe();