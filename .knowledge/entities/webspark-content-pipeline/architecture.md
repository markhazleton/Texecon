---
id: webspark-content-pipeline-architecture
type: entity-layer
title: WebSpark Content Pipeline Architecture
layer: architecture
source_of_truth:
- scripts/fetch-content.js
- scripts/refresh-content.js
- client/src/lib/data.ts
last_verified: '2026-10-21'
---

# WebSpark Content Pipeline

The WebSpark CMS integration is build-time only. The pipeline fetches the Texecon website payload, writes raw and processed JSON plus generated TypeScript content types under `client/src/data/`, and supplies those cached files to the application and publishing scripts. The browser bundle reads only those cached files and never calls the WebSpark API.

## Boundaries

- `scripts/fetch-content.js` owns the remote fetch, transformation, cache writes, and fetch report.
- `scripts/refresh-content.js` provides the refresh workflow around the cached content.
- `client/src/lib/data.ts` consumes cached content for application rendering.
- `scripts/generate-sitemap.js` and `scripts/generate-static-pages.js` consume content-derived routes for SEO and crawlable output.

The fetch script falls back to the existing processed cache when the remote request fails and a cache file is available. `client/src/data/` is build-generated data, not hand-authored product content.

## Security boundary

The WebSpark website endpoint is public and needs no credentials. `fetch-content.js` and `refresh-content.js` send only `Accept: application/json`. They add a bearer token only when the `WEBSPARK_API_TOKEN` environment variable is set. Never commit tokens or cookies to scripts or browser code. Supply them through the environment, or a GitHub Actions secret in CI.

## Evidence

- `scripts/fetch-content.js`
- `scripts/refresh-content.js`
- `client/src/lib/data.ts`
- `scripts/generate-sitemap.js`
- `scripts/generate-static-pages.js`
