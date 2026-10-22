---
id: webspark-content-pipeline-integration
type: entity-layer
title: Webspark Content Pipeline Integration
layer: integration
source_of_truth:
- scripts/fetch-content.js
- scripts/refresh-content.js
- client/src/lib/data.ts
last_verified: '2026-10-21'
---

# Webspark Content Pipeline Integration

fetch-content.js fetches the WebSpark website payload and writes raw JSON, processed JSON, a fetch report and generated TypeScript types under client/src/data/. data.ts consumes the cached content. refresh-content.js provides a refresh workflow.

There is no runtime API client: the browser uses only the cached build output. The endpoint is public. An optional bearer token comes from the WEBSPARK_API_TOKEN environment variable. Do not commit tokens or cookies to scripts or browser code.
