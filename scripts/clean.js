#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function rmrf(dir) {
  if (!fs.existsSync(dir)) return;
  const stat = fs.statSync(dir);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(dir)) {
      rmrf(path.join(dir, entry));
    }
    fs.rmdirSync(dir);
  } else {
    fs.unlinkSync(dir);
  }
}

function ensureEmpty(dir) {
  if (fs.existsSync(dir)) {
    rmrf(dir);
  }
}

(function main(){
  const target = process.env.TARGET_DIR || 'target';
  const outDir = path.resolve(__dirname, '..', target);
  console.log(`🧹 Cleaning build output: ${outDir}`);
  ensureEmpty(outDir);
  console.log('✅ Clean complete');
})();
