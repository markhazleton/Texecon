---
id: webspark-content-pipeline-operations
type: entity-layer
title: Webspark Content Pipeline Operations
layer: operations
source_of_truth:
- package.json
- scripts/fetch-content.js
- scripts/generate-sitemap.js
- scripts/generate-static-pages.js
last_verified: '2026-10-20'
---

# Webspark Content Pipeline Operations

Run npm run fetch:content to refresh the cache, then generate:sitemap and generate:static-pages as appropriate. The full npm run build performs these steps in order around the Vite build.

Inspect fetch-report.json and generated sitemap paths when content processing changes. Update processing scripts before consuming code, and verify API menu URLs in navigation and static output. Generated types must retain the project formatting.
