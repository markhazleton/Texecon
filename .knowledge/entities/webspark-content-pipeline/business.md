---
id: webspark-content-pipeline-business
type: entity-layer
title: Webspark Content Pipeline Business
layer: business
source_of_truth:
- scripts/fetch-content.js
- scripts/generate-sitemap.js
last_verified: '2026-10-21'
---

# Webspark Content Pipeline Business

The CMS is the source of truth for API-driven content and navigation. Menu fields determine visibility, hierarchy and ordering; API URLs determine content paths.

The build converts the API payload into local content and crawler artifacts. When a request fails, an existing processed cache can allow the build to proceed with previously fetched content.
