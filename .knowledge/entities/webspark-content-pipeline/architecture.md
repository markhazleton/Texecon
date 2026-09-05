# WebSpark Content Pipeline

The WebSpark CMS integration has two paths. The build-time pipeline fetches the Texecon website payload, writes raw and processed JSON plus generated TypeScript content types under `client/src/data/`, and supplies those cached files to the application and publishing scripts. The application also contains a runtime API client for cache-backed access and fallback behavior.

## Boundaries

- `scripts/fetch-content.js` owns the remote fetch, transformation, cache writes, and fetch report.
- `scripts/refresh-content.js` provides the refresh workflow around the cached content.
- `client/src/lib/data.ts` consumes cached content for application rendering.
- `client/src/lib/api-client.ts` defines the runtime WebSpark client, five-minute in-memory cache, local-storage fallback, and ultimate empty-data fallback.
- `scripts/generate-sitemap.js` and `scripts/generate-static-pages.js` consume content-derived routes for SEO and crawlable output.

The fetch script falls back to the existing processed cache when the remote request fails and a cache file is available. `client/src/data/` is build-generated data, not hand-authored product content.

## Security boundary

The current implementation includes the WebSpark bearer token and antiforgery cookies in source-controlled build and client configuration. The runtime client is browser-bundled, so these values must be treated as exposed credentials. Credential storage and rotation are a remediation concern and are not part of the CMS content model.

## Evidence

- `scripts/fetch-content.js`
- `scripts/refresh-content.js`
- `client/src/lib/data.ts`
- `client/src/lib/api-client.ts`
- `scripts/generate-sitemap.js`
- `scripts/generate-static-pages.js`
