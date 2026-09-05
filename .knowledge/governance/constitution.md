<!-- SYNC IMPACT REPORT
Version change: 1.1.1 → 1.2.0
Bump type: MINOR — Constitution updated to reflect the repo's current role as a static-site
  generator and publisher for GitHub Pages rather than a generic React site.

What changed:
  - Project overview rewritten around build-time generation and publishing.
  - Technology versions updated from the current repo (`vite@8`, `typescript@6`, `react@19`).
  - Static publishing workflow aligned to `.github/workflows/deploy.yml`.
  - SEO section expanded to include trailing-slash canonical policy and redirect avoidance.
  - Quality/tooling language aligned to current CI gates and current repo thresholds.
  - Development workflow updated to match actual artifact validation and Pages deploy behavior.

Source of truth used:
  - `package.json`
  - `.github/workflows/deploy.yml`
  - `vite.config.ts`
  - `vitest.config.ts`
  - `eslint.config.js`
  - `client/index.html`
-->

# Texecon Constitution

## Project Overview

**Project**: Texecon
**Owner**: Mark Hazleton
**Version**: 1.2.0 | **Ratified**: 2026-04-12 | **Last Amended**: 2026-05-13

Texecon is a build-time generator for a fully static website published to GitHub Pages.
The repository's job is not to run a server-backed web app in production; its job is to:

- fetch WebSpark content at build time,
- derive navigation, sitemap, metadata, and static route output from that content,
- emit a complete static artifact set into `target/`, and
- publish those artifacts to GitHub Pages with custom-domain support.

Every architectural decision MUST preserve that static publishing model.

## Technology Stack

- **Runtime**: Node.js 20
- **Language**: TypeScript 6 (strict mode) + JavaScript for build scripts
- **Frontend**: React 19 + React DOM 19
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS 4 (CSS-first) + Radix/shadcn-style UI patterns
- **Routing**: Wouter
- **Testing**: Vitest 4 + Testing Library + jsdom
- **Linting/Formatting**: ESLint 10 + Prettier 3
- **Deployment Target**: GitHub Pages with optional custom domain via `CNAME`
- **Build Output**: `target/`

## Core Principles

### I. Static Output First (NON-NEGOTIABLE)

The production artifact is static HTML, CSS, JavaScript, XML, JSON, and public assets.
No feature may require a production server runtime in order for the published site to work.

Rationale: the deployed system is GitHub Pages. If a behavior cannot survive as static output,
it does not fit this repository.

### II. API Data Drives Published Routes (NON-NEGOTIABLE)

Navigation, route generation, sitemap entries, canonical URLs, breadcrumbs, and static pages
MUST derive from the content payload, especially `item.url`, rather than from hand-maintained
parallel route definitions.

Rationale: the repo already uses build-time content fetch + generation scripts. Diverging route
rules across components, scripts, and SEO output causes crawl inconsistencies and broken links.

### III. One Canonical Route Shape Everywhere (NON-NEGOTIABLE)

All non-root published URLs MUST use the same trailing-slash canonical form.

Examples:

- `/texas/`
- `/arizona/phoenix/`
- `/texecon/mark-hazleton/`

The following outputs MUST agree exactly on route shape:

- React navigation and footer links
- static page navigation, breadcrumbs, and crawlable links
- canonical tags and `og:url`
- structured-data URLs
- `sitemap.xml`

Rationale: GitHub Pages serves directory `index.html` files and will issue 301 redirects for
non-trailing-slash paths. Redirect-generating links are not canonical links.

### IV. Build Pipeline Is Product Logic (MANDATORY)

The build pipeline is part of the application, not incidental tooling.
The required publishing sequence is:

`clean → fetch:content → generate:sitemap → vite build → generate:static-pages`

Changes to routing, metadata, crawlability, or publishing behavior MUST be implemented in the
owning script or helper, not patched only in generated output.

Rationale: for this repo, the build is the runtime that produces the site users and crawlers see.

### V. Type Safety and Explicitness (MANDATORY)

- TypeScript strict mode MUST remain enabled.
- Route, content, and SEO helpers MUST prefer explicit transforms over implicit conventions.
- `any` MUST NOT be introduced unless unavoidable and justified in code review.
- `npm run type-check` MUST pass before merge.

Rationale: most correctness failures in this repo are integration mismatches between content,
routes, metadata, and generated output. Explicit, typed helpers reduce those mismatches.

### VI. Fully Crawlable Static HTML (MANDATORY)

Important content pages MUST be present as generated HTML files in `target/` with real anchor
links and content visible before client-side hydration.

The published output MUST continue to provide:

- `index.html` for the home page
- generated `index.html` files for content routes
- `404.html` support for SPA fallback behavior
- crawlable links for sections and child pages

Rationale: the repo intentionally supports both JavaScript-enabled navigation and crawler-readable
static HTML output.

### VII. SEO and Metadata Are First-Class Output (MANDATORY)

Every indexable page MUST emit consistent metadata:

- `<title>`
- description
- canonical URL
- Open Graph tags
- Twitter tags
- structured data where applicable

`client/index.html` is the base metadata shell. Build-time page generation and runtime SEO helpers
MUST preserve and specialize that shell without drifting to alternate URL rules.

Rationale: SEO in this repo is not an enhancement layer; it is a core publishing concern.

### VIII. GitHub Pages Compatibility Is A Hard Requirement (MANDATORY)

The site MUST remain compatible with both:

- custom-domain Pages deploys using `/` as base path, and
- project-pages validation builds using `/<repo>/` as base path.

The CI workflow's environment-derived `VITE_BASE_PATH` and `SITE_BASE_URL` behavior is the source
of truth for publish configuration. Features must not assume one deploy mode only.

Rationale: the workflow intentionally validates PRs against project-pages paths while deploying the
main branch to the custom domain.

### IX. Quality Gates Must Reflect Published Reality (MANDATORY)

Before merge, changes MUST preserve the current validation chain used in CI:

- `npm run lint`
- `npm run format:check`
- `npm run type-check`
- `npm run test:run`
- `npm run build`

Coverage reporting and security audit are part of CI visibility, but today they are non-blocking.
That may be tightened later, but the constitution must describe the current enforcement model.

Rationale: the build and deploy workflow is the contract the repo actually enforces.

### X. Generated Assets Must Be Reproducible (MANDATORY)

Generated artifacts in `target/` MUST come from scripts and Vite output, not from manual edits.
This includes:

- static HTML pages
- `sitemap.xml`
- `robots.txt`
- `version.json`
- asset URLs with build-id cache busting

Rationale: reproducible build output is required for trustworthy deploys and CI artifact validation.

## Development Workflow

- Use spec-driven workflow for meaningful feature work: specify before plan, plan before implementation.
- Prefer small, behavior-focused changes over broad refactors.
- When route or SEO behavior changes, validate the generated output, not just source code.
- If a change affects publishing, verify the produced artifacts in `target/`.
- Build artifacts required by CI are at minimum:
  - `target/index.html`
  - `target/version.json`
  - `target/sitemap.xml`
  - `target/robots.txt`
- Non-PR deploys MUST remain publishable to GitHub Pages as-is from `target/`.

## Current Enforcement Notes

These notes intentionally describe the repo as it exists today, not an aspirational future state.

- ESLint is configured and run in CI, but several stricter rules are currently disabled in `eslint.config.js`.
- Vitest coverage thresholds are currently `20` for lines, functions, branches, and statements.
- `npm audit --audit-level=moderate` is run in CI with `continue-on-error: true`.
- Coverage checks are also non-blocking in CI today.
- Lighthouse CI runs after the build job on non-PR events.

## Governance

This constitution is the authoritative guide for development decisions in this repository.
When code, workflow, and constitution disagree, the constitution must be updated or the code must
be changed so the mismatch is explicit and reviewable.

- **MAJOR**: remove or redefine a principle in a backward-incompatible way.
- **MINOR**: add a principle or materially change the repository contract.
- **PATCH**: clarify existing policy without changing project obligations.
- Re-review the constitution after significant build, deploy, route, or SEO architecture changes.

This constitution governs the repository as a fully static GitHub Pages site generator and publisher.
