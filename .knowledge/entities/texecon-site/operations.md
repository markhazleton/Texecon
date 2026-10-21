---
id: texecon-site-operations
type: entity-layer
title: Texecon Site Operations
layer: operations
source_of_truth:
- package.json
- .github/workflows/deploy.yml
- AGENTS.md
last_verified: '2026-10-20'
---

# Texecon Site Operations

Install dependencies with npm ci --include=dev and start local development with npm run dev. Run lint, format:check, type-check and test:run before building. npm run build refreshes content and sitemap data, bundles the app, and generates route HTML under target/.

Use npm run preview to serve the resulting artifact locally. CI validates project-page paths on pull requests and publishes production artifacts from main. DevSpark stock files live in .devspark/, current knowledge in .knowledge/, and work packages and overrides in .devspark.work/.
