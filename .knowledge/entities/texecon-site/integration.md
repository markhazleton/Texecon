---
id: texecon-site-integration
type: entity-layer
title: Texecon Site Integration
layer: integration
source_of_truth:
- client/src/App.tsx
- vite.config.ts
- scripts/generate-static-pages.js
last_verified: '2026-10-20'
---

# Texecon Site Integration

The React application uses Wouter for route selection and Vite for the client bundle. Dedicated memorial routes coexist with CMS page routes. Vite base-path configuration supports both a custom domain and repository-scoped Pages hosting.

The content pipeline supplies cached data at build time. Sitemap and static-page generation use that data to produce crawlable output, which GitHub Actions uploads to Pages.
