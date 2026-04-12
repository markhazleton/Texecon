<!-- SYNC IMPACT REPORT
Version change: 1.0.0 → 1.1.0
Bump type: MINOR — 5 new principles added; "Quality First" replaced by specific Type Safety,
  Code Style Enforcement, and Testing Standards sections; Iterative Delivery preserved;
  Accessibility & Performance expanded; Remediation Backlog section added.

Modified principles:
  III. Quality First → split into III. Type Safety + IV. Code Style Enforcement + V. Testing Standards
  V. Accessibility & Performance → expanded with CI/axe-core/Lighthouse detail

Added sections:
  VI. Iterative Delivery (restored/formalized from v1.0.0)
  VII. Security (new — critical gap identified in discovery)
  VIII. UI Component Standards (new — from codebase discovery)
  IX. Static-First Architecture (new — from codebase discovery)
  X. SEO and Crawlability (new — from codebase discovery)
  XI. Remediation Backlog (new — tracks known compliance gaps)

Removed sections:
  (none removed; all original principles preserved or expanded)

Templates checked:
  ✅ .devspark/templates/spec-template.md — no constitution-specific tokens; no update required
  ✅ .devspark/templates/plan-template.md — Constitution Check section uses dynamic fill-in; no update required
  ✅ .devspark/templates/tasks-template.md — task categories remain valid; no update required

Follow-up TODOs:
  - Move hardcoded auth token in scripts/fetch-content.js → environment variable (Critical)
  - Restore ESLint rules in eslint.config.js (Critical)
  - Re-enable .husky/pre-commit lint-staged hook (High)
  - Increase Vitest coverage thresholds to 40% (Medium)
  - Wire @axe-core/react into CI (Medium)
-->

# Texecon Constitution

## Project Overview

**Project**: Texecon
**Owner**: Mark Hazleton
**Version**: 1.1.0 | **Ratified**: 2026-04-12 | **Last Amended**: 2026-04-12

## Technology Stack

- **Runtime**: Node.js 20
- **Language**: TypeScript (strict mode) + JavaScript (build scripts only)
- **Frontend**: React 19 + Vite 7
- **Styling**: Tailwind CSS v4 (CSS-first config) + Radix UI / shadcn-ui
- **Routing**: Wouter (lightweight SPA router)
- **Testing**: Vitest + @testing-library/react
- **Build Tool**: Vite 7 with custom pipeline scripts
- **Package Manager**: npm
- **Platform**: GitHub Pages — static site at `texecon.com`

## Core Principles

### I. Simplicity (NON-NEGOTIABLE)

Prefer simple, readable solutions over clever or complex ones.
Abstractions MUST be justified by concrete reuse — not hypothetical future needs.
When in doubt, do less and do it clearly.

Rationale: Lightweight routing (Wouter over React Router), no server runtime, and
static-first delivery are existing expressions of this principle. Each new dependency
or abstraction must clear the "do we actually need this?" bar.

### II. Explicit Over Implicit (NON-NEGOTIABLE)

Behavior MUST be predictable and visible.
Avoid magic, hidden side effects, and implicit conventions that require tribal knowledge.
Configuration over convention where clarity is at stake.

Rationale: `exactOptionalPropertyTypes: true`, explicit `@/*` path aliases, and
API-driven URL/navigation conventions (documented in AGENTS.md) are the lived
expression of this principle.

### III. Type Safety (MANDATORY)

- TypeScript strict mode MUST be enabled at all times (`strict: true` in `tsconfig.json`).
- All strictness flags MUST remain enabled: `noImplicitReturns`, `noUnusedLocals`,
  `noUnusedParameters`, `exactOptionalPropertyTypes`.
- `any` types MUST NOT be introduced without explicit, documented justification in the PR.
- `npm run type-check` MUST pass before any merge.

Rationale: TypeScript strict mode is 100% consistently applied. Weakening it is
not permitted without a constitution amendment.

### IV. Code Style Enforcement (MANDATORY)

- ESLint rules MUST be fully enabled; violations MUST block CI.
- Prettier MUST be applied consistently (`semi: true`, `singleQuote: false`,
  `printWidth: 100`, `tabWidth: 2`).
- Pre-commit hooks (Husky + lint-staged) MUST be enabled to enforce lint and
  format on staged files before commit.
- `npm run lint` and `npm run format:check` MUST pass before any merge.

> Known gap: `eslint.config.js` currently has most rules set to `"off"`. Restoration
> to full enforcement is tracked in the Remediation Backlog.

### V. Testing Standards (MANDATORY)

- New features MUST include co-located test files (`*.test.tsx` / `*.test.ts`)
  alongside their source files.
- Vitest + `@testing-library/react` is the MUST-use testing stack — no other
  test frameworks are permitted.
- Coverage thresholds MUST be at minimum 40% (lines/functions/branches/statements)
  and MUST NOT be lowered.
- `data-testid` attributes SHOULD be placed on all interactive and tested components.
- `npm run test:run` MUST pass before any merge.

> Known gap: Only 4 test files exist for 53 source files. Raising coverage to
> meet this principle is tracked in the Remediation Backlog.

### VI. Iterative Delivery (NON-NEGOTIABLE)

Ship small, working increments frequently.
Features MUST be spec-driven: specify first, plan second, implement third.
Avoid large, long-running branches — prefer small, focused PRs.
PRs that cannot be described in one sentence are too large.

### VII. Security (MANDATORY)

- Secrets, API tokens, and credentials MUST NOT be hardcoded in source files or
  build scripts.
- All sensitive values MUST be sourced from environment variables or GitHub Actions
  secrets at runtime.
- Dependencies MUST be kept current; Dependabot is configured and MUST remain enabled.
- All code changes MUST comply with OWASP Top 10.
- Security-relevant findings from code review are showstopper severity.

> Known critical gap: `scripts/fetch-content.js` contains a hardcoded
> `Authorization: Bearer` token and `Cookie` header. This MUST be moved to
> environment variables. Tracked in the Remediation Backlog.

### VIII. Accessibility & Performance (MANDATORY)

- The site MUST meet WCAG AA accessibility minimum at all times.
- Lighthouse performance and accessibility scores MUST NOT regress across releases.
- `@axe-core/react` SHOULD be integrated into CI to gate on accessibility violations.
- Prioritize static generation and minimal client-side JavaScript.
- Bundle size MUST remain below 500 KB (gzipped < 150 KB).

### IX. UI Component Standards (MANDATORY)

- All UI primitives MUST use Radix UI components via the shadcn/ui pattern;
  `components.json` is the authoritative component registry.
- New UI components MUST be placed in `client/src/components/ui/` and MUST follow
  the `class-variance-authority` + `tailwind-merge` pattern.
- Design tokens defined in `client/src/index.css` (`--background`, `--foreground`,
  etc.) MUST be used for theming — no hardcoded color values.
- Tailwind CSS v4 config is CSS-first; `tailwind.config.ts` is intentionally a stub
  and MUST NOT be used for new rule additions.

### X. Static-First Architecture (NON-NEGOTIABLE)

- There is no server runtime — all output MUST be static HTML/JS/CSS in `target/`.
- Build output directory is `target/` — do not change to `dist/` or `build/`.
- The full build pipeline MUST be preserved in order:
  `clean → fetch:content → generate:sitemap → vite build → generate:static-pages`
- Client-side routing fallback via `client/public/404.html` MUST remain functional.
- Artifacts in `target/` MUST NOT be manually edited — always regenerate via build.

### XI. SEO and Crawlability (MANDATORY)

- All pages MUST have complete meta tags: title, description, canonical, OG, Twitter.
- Structured data (JSON-LD) MUST be present on content and person pages.
- `sitemap.xml` and `robots.txt` MUST be generated at build time and verified in CI.
- Canonical URLs MUST use `item.url` from the API — do not invent alternate URL schemes.
- Static HTML files MUST be generated for all dynamic routes.

## Development Workflow

- All changes MUST be spec-driven: use `/devspark.specify` before planning or coding.
- PRs MUST pass CI (lint, type-check, format-check, test, build) before merge.
- Constitution violations are showstopper severity in code reviews.
- Features that add complexity MUST have documented justification in the PR.
- Pre-commit hooks MUST run lint-staged (lint + format on staged files).

## Remediation Backlog

Known compliance gaps at the time of v1.1.0 ratification. Each item MUST be
resolved and removed from this list as it is addressed.

| Priority | Item | Action Required |
|----------|------|-----------------|
| 🔴 Critical | Hardcoded auth token in `scripts/fetch-content.js` + `scripts/refresh-content.js` | Move to env vars |
| 🔴 Critical | ESLint rules disabled in `eslint.config.js` | Restore enforcement incrementally |
| 🟡 High | Pre-commit hooks disabled in `.husky/pre-commit` | Re-enable `lint-staged` |
| 🟡 High | Test coverage at ~7.5% file coverage | Add tests for core lib/components |
| 🟢 Medium | `@axe-core/react` not wired into CI | Add accessibility CI step |
| 🟢 Medium | Coverage threshold currently at 20% | Raise to 40% |

## Governance

This constitution is the authoritative guide for all development decisions on Texecon.
Amendments require documentation of the change and rationale in the PR that makes them.

- **MAJOR** version bump: backward-incompatible removal or redefinition of a principle.
- **MINOR** version bump: new principle or section added or materially expanded.
- **PATCH** version bump: clarifications, wording, non-semantic refinements.
- Reviews MUST occur quarterly, or after any major architectural change.
- Personal prompt overrides (`.documentation/{git-user}/`) are permitted for
  workflow tooling only — never for overriding core principles.

This constitution supersedes all other development practices unless explicitly noted.
