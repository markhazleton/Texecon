# Texecon Site Architecture

Texecon is a static-first React and TypeScript site. Build scripts fetch WebSpark content, generate navigation and SEO artifacts, Vite bundles the application, and static route pages are emitted into `target/` for GitHub Pages deployment.

## Owned paths

- `client/` — Vite React application and public assets.
- `scripts/` — content fetch, sitemap, static-page, and cleanup pipeline.
- `.github/workflows/deploy.yml` — CI and GitHub Pages publishing.
- `package.json` — Node, Vite, TypeScript, test, lint, and build commands.

## Current validation

The repository uses TypeScript type checking, ESLint, Prettier, Vitest, and CI artifact validation. Canonical URLs, sitemap/robots output, JSON-LD, and static route pages are part of the publishing contract.

## Publishing boundaries

Pull-request builds use a project-pages base path (`/<repository>/`) and owner/repository GitHub Pages URL for validation. Non-PR builds with `CUSTOM_DOMAIN=texecon.com` use `/` and `https://texecon.com`; the workflow writes `client/public/CNAME` for the deploy artifact. `.github/workflows/deploy.yml` validates `target/index.html`, `target/version.json`, `target/sitemap.xml`, `target/robots.txt`, the sitemap base URL, and the custom-domain CNAME when applicable.

The Pages artifact is uploaded only for non-PR builds. Lighthouse CI runs after a successful non-PR build, and the `main` branch deploy job publishes the uploaded Pages artifact.

## Evidence

- `package.json`
- `.github/workflows/deploy.yml`
- `client/index.html`
- `scripts/generate-sitemap.js`
- `scripts/generate-static-pages.js`
- `client/src/components/seo-head.test.tsx`
- `client/src/components/structured-data.test.tsx`
