---
id: webspark-content-pipeline-integration
type: entity-layer
title: Webspark Content Pipeline Integration
layer: integration
source_of_truth:
- scripts/fetch-content.js
- scripts/refresh-content.js
- client/src/lib/data.ts
- client/src/lib/api-client.ts
last_verified: '2026-10-20'
---

# Webspark Content Pipeline Integration

fetch-content.js fetches the WebSpark website payload and writes raw JSON, processed JSON, a fetch report and generated TypeScript types under client/src/data/. data.ts consumes the cached content. refresh-content.js provides a refresh workflow.

The separate browser API client has in-memory caching and fallback behavior. Existing embedded credentials are an exposed security boundary; do not add new secrets to source-controlled scripts or browser code.
