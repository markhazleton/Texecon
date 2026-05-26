# Changelog

## [Unreleased]

## [v1.0.0] - 2026-05-26

### Added

- **Static Site Generation Pipeline**: Full build pipeline
  (`clean → fetch:content → generate:sitemap → vite build → generate:static-pages`)
  producing a deployable static artifact set in `target/` with pre-rendered
  crawlable HTML for every content route.
- **Dynamic Navigation & SEO**: Navigation menus, breadcrumbs, canonical URLs,
  Open Graph tags, Twitter Card tags, and `sitemap.xml` derived from WebSpark
  content API payload.
- **Tailwind CSS v4**: Migrated from v3 to v4 using `@tailwindcss/vite` plugin
  and CSS-first configuration, removing PostCSS dependency.
- **DevSpark v2.4.0**: Spec-driven workflow with full Claude Code slash-command
  support, including new `commit-audit`, `address-pr-review`, `update-pr` commands
  and Agent Skills surface.
- **GitHub Pages CI/CD**: Automated build-and-deploy via GitHub Actions with
  Lighthouse CI, security audits, type checking, and environment-aware
  base-path handling.
- **React 19 SPA**: Client-side navigation with Wouter routing, server-side
  pre-rendered static HTML for crawlers, and Vitest test coverage.

### Fixed

- **Trailing-slash 301 redirects**: Home page article section links (`/texas`,
  `/texas/keller`, etc.) were missing trailing slashes, causing GitHub Pages 301
  redirects on every crawler and user click. All link-generation sites now wrap
  URLs with `withTrailingSlash()`.

### Architectural Decisions

- **ADR-001**: Static-Site Generation via Vite + GitHub Pages
- **ADR-002**: Trailing-Slash Canonical URL Policy
- **ADR-003**: Tailwind CSS v4 CSS-First Configuration

### Contributors

- Mark Hazleton
- dependabot[bot]

## [2026-04-12] Archive run

### Archived

- `documentation-placement-review-2026-04-12.md` — session placement audit;
  decisions captured in changelog and guide.
- `harvest-2026-04-12.md` — session harvest report; archival state captured in
  changelog and guide.

### Key decisions preserved

- `.documentation/` is the authoritative active documentation surface;
  framework/tooling docs remain under `.devspark/`, `.github/`, and `.claude/`.
- `IMPLEMENTATION_SUMMARY.md` is now canonical at
  `.documentation/reports/IMPLEMENTATION_SUMMARY.md`.
- Legacy guides remain active under `.documentation/guides/legacy/` with repaired
  internal links to current repository paths.
- `.archive/` is audit-only historical storage and is not a source for active
  prompts, scripts, or living guidance.
