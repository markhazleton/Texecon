---
id: github-pages-publishing-operations
type: entity-layer
title: Github Pages Publishing Operations
layer: operations
source_of_truth:
- .github/workflows/deploy.yml
- package.json
last_verified: '2026-10-20'
---

# Github Pages Publishing Operations

CI uses Node.js 22 and npm ci --include=dev. It generates content, runs lint, formatting, type checks and tests, builds the site, and checks index.html, version.json, sitemap.xml, robots.txt and production CNAME. Audit and coverage are non-blocking workflow steps.

For local validation run npm run build and npm run preview. Inspect generated route HTML and sitemap URLs before publishing changes to navigation or SEO. A successful main-branch build enables the Pages deployment; this migration does not trigger a deployment itself.
