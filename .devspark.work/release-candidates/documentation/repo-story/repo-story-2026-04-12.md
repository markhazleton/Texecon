# Repository Story: Texecon

> Generated 2026-04-12 | Window: 12 months (full history: 2025-09-01 → 2026-03-30) | Scope: full

---

## Executive Summary

TexEcon is a modern, static React application that delivers expert analysis and commentary on the
Texas economy. It is published at `texecon.com` via GitHub Pages and is powered by a build-time
content pipeline that fetches from the WebSpark CMS API, generates a sitemap, compiles the
application with Vite 7, and produces pre-rendered HTML for every dynamic route. The result is
a fast, SEO-first, serverless site that requires zero runtime infrastructure.

In its **7 months of active history** (September 2025 through March 2026), the repository has
accumulated **88 commits** from a single human contributor — Mark Hazleton — assisted by
Dependabot for automated dependency maintenance. Three email identities resolve to one developer
(a Replit cloud environment and two personal addresses), plus 13 Dependabot automation commits.
This is a focused solo project with a clear mandate.

Velocity has followed a two-burst pattern: a **founding sprint in September 2025** (47 commits —
53% of all history) established the architecture, routing, CMS integration, and CI/CD pipeline in
a single month. A **two-month quiet period** followed (October 2025: 12 commits; November 2025 –
February 2026: near-zero activity). Then a **second burst in March 2026** (26 commits) delivered
quality hardening: Lighthouse threshold tuning, SEO meta tag improvements, OG image support,
accessibility fixes, and a significant round of dependency refreshes.

Governance signals are mixed. Conventional commit adoption is **66%** (58 of 88 commits use a
recognized prefix), which is solid for a solo project. The remaining 22 freeform commits —
almost all labeled "Refactor code structure for improved readability and maintainability" —
are a recurring commit message that lacks specificity. There are **no tags** in the repository,
meaning there is no formal release history. The single merge commit (1.1% merge rate) reflects
a direct-to-main workflow rather than a branch-per-feature approach.

The project is production-ready in the technical sense: GitHub Actions CI runs lint, type-check,
coverage, build, artifact validation, and Lighthouse quality gates on every push to `main`. The
deployment is live at `texecon.com`. The constitution (v1.1.0, ratified 2026-04-12) articulates
11 principles and a remediation backlog of 6 known compliance gaps.

---

## Technical Analysis

### Development Velocity

| Month | Commits | Notes |
|-------|---------|-------|
| 2025-09 | 47 | Founding sprint — architecture, routing, CMS, CI/CD |
| 2025-10 | 12 | Stabilization — refinements and early SEO work |
| 2025-11 | 0 | Quiet period |
| 2025-12 | 0 | Quiet period |
| 2026-01 | 3 | Dependabot dependency bumps only |
| 2026-02 | 0 | Quiet period |
| 2026-03 | 26 | Quality hardening sprint — Lighthouse, accessibility, deps |

**Total**: 88 commits over 7 active months. Average active-month throughput: **17.6 commits/month**.

The two-sprint pattern is very common for personal/solo projects: a concentrated initial build
followed by a maintenance and improvement phase. The silence from November 2025 through February
2026 (4 months) does not indicate abandonment — the March 2026 burst was focused and purposeful,
addressing quality signals rather than new features.

Lines added/removed data was not available from the script, but the hotspot files (sitemap.xml,
webspark-raw.json, generated HTML) are all auto-generated — suggesting the human-authored source
code is significantly more stable than the raw file-change count implies.

### Contributor Dynamics

| Role | Email Identities | Commits |
|------|-----------------|---------|
| Lead Architect (human) | mark.hazleton@controlorigins.com + mark@markhazleton.com + Replit identity | ~75 |
| Automation (Dependabot) | dependabot[bot] | 13 |

**Bus factor: 1.** All human-authored commits come from a single engineer. 85% of all commits
(75/88) are from the Lead Architect. Dependabot accounts for the remaining 13 (15%).

This is expected for a personal project. For a production site serving public users, the single
bus factor is the primary personnel risk. Documentation, the constitution, and the spec-driven
workflow (DevSpark) provide partial mitigation by capturing intent and conventions.

The three email addresses for Mark Hazleton (controlorigins.com, markhazleton.com, Replit) are
the same individual working across different environments. No team growth is present in the
history.

### Quality Signals

- **Test-to-source ratio**: 4 test files / 53 source files = **7.5%** — below the 40% threshold
  established in the v1.1.0 constitution. The 4 existing tests cover `seo-head`, `structured-data`,
  `seo-utils`, and `utils` — all in the SEO/utility layer.
- **Conventional commit adoption**: 58/88 = **66%** — good for a solo project; the 22 freeform
  "Refactor code structure" messages drag the number down and obscure what actually changed.
- **Commit message prefix distribution**:

  | Prefix | Count |
  |--------|-------|
  | refactor | 25 |
  | freeform / generic | 22 |
  | ci | 10 |
  | chore | 8 |
  | feat | 8 |
  | fix | 6 |
  | other | 8 |
  | docs | 1 |

  `refactor` being the top prefix is a positive quality signal — it shows iterative improvement.
  The near-absence of `docs` commits (1) suggests documentation happens in-band with
  features rather than as dedicated commits.

### Governance & Process Maturity

- **Merge commit rate**: 1/88 = **1.1%** — indicates a direct-to-main push workflow. Pull requests
  are used for Dependabot automation (the single merge commit), but human changes go directly to
  `main`. This is consistent for a solo project but would need to change if collaborators joined.
- **Tagged releases**: **0 tags**. There is no formal versioning or release tagging in the git
  history. The `version.json` file is generated at build time (from git SHA or timestamp), but
  no `git tag` release discipline exists. This is the governance posture gap most worth addressing.
- **CI enforcement**: Solid. GitHub Actions runs on every push and PR to `main` with: lint,
  type-check, format-check, test coverage (non-blocking), build, artifact validation
  (`target/index.html`, `version.json`, `sitemap.xml`, `robots.txt`), and Lighthouse CI.
- **Dependabot**: Actively maintained — 13 automated dependency/CI-action bumps in the history,
  keeping the supply chain current.

### Architecture & Technology

The technical signals in this repository are mature and well-integrated:

- **Language**: TypeScript (strict mode) with zero server-side runtime
- **Build toolchain**: Vite 7 + custom Node.js pipeline scripts (fetch-content.js,
  generate-sitemap.js, generate-static-pages.js, clean.js)
- **UI**: React 19 + Tailwind CSS v4 (CSS-first) + Radix UI / shadcn-ui component library
- **Routing**: Wouter (lightweight SPA router) with 404.html fallback for GitHub Pages
- **Testing**: Vitest + @testing-library/react + jsdom
- **CI/CD**: GitHub Actions (deploy.yml) with Lighthouse CI quality gates
- **Content**: WebSpark headless CMS, build-time fetched, cached in `client/src/data/`
- **Config files present**: `tsconfig.json` (strict), `.eslintrc` (rules currently disabled),
  `.prettierrc`, `vitest.config.ts`, `.github/lighthouse/lighthouserc.json`, `AGENTS.md`,
  `CLAUDE.md`, `.devspark/` (DevSpark v1.5.0)

The TypeScript downgrade from 6.0.2 → 5.9.3 (most recent commit) is notable — version 6.0.2
was likely released by TS as a beta/RC and was incompatible with the project's configuration.
The rollback was handled within hours of the Dependabot bump, demonstrating responsive
maintenance.

---

## Change Patterns

### Top 15 Most-Modified Files

| File | Changes | Interpretation |
|------|---------|----------------|
| `client/public/sitemap.xml` | 37 | Auto-generated at build time — frequent content updates |
| `client/src/data/webspark-raw.json` | 34 | CMS cache — updated with every content fetch |
| `target/index.html` | 27 | Build output — committed inadvertently or during early development |
| `target/sitemap.xml` | 26 | Build output — same pattern |
| `target/robots.txt` | 24 | Build output |
| `client/src/data/texecon-content.json` | 23 | Processed CMS data — updated with content |
| `client/index.html` | 21 | Core SPA entry — SEO meta tags, GA tag, PWA manifest |
| `client/src/pages/home.tsx` | 19 | Primary route orchestration — most active source file |
| `package.json` | 18 | Dependencies and scripts — actively maintained |
| `client/src/components/seo-head.tsx` | 16 | SEO management — reflects SEO-first focus |
| `.github/workflows/deploy.yml` | 15 | CI/CD pipeline evolution — actively refined |
| `client/src/components/navigation.tsx` | 14 | Navigation — content/URL-driven routing work |
| `client/src/lib/seo-utils.ts` | 13 | SEO utilities — canonical URL, meta logic |
| `vite.config.ts` | 12 | Build configuration — active tuning |
| `client/src/components/footer.tsx` | 11 | Footer — content/link updates |

**Key observations:**

1. **Generated artifacts dominate the top 5.** `sitemap.xml` and `webspark-raw.json` topping
   the list is expected — they are auto-generated and committed with every content refresh.
   The `target/` build output files appearing in the history suggests the `target/` directory
   was committed to git during early development (or is still not gitignored). This should be
   verified — build output should not be version-controlled.

2. **`client/src/pages/home.tsx` is the most-changed source file (19 changes)**, consistent
   with it being the primary route orchestration and SEO selection hub. High change frequency
   here is expected but worth monitoring — it may accumulate complexity.

3. **SEO files cluster in the top hotspots** (`seo-head.tsx`, `seo-utils.ts`, `generate-sitemap.js`),
   confirming that SEO is the primary active development area — aligned with the project's stated goals.

4. **`deploy.yml` has 15 changes** — the CI/CD pipeline has been actively iterated, reflecting
   investment in build quality and Dependabot automation.

---

## Milestone Timeline

No git tags exist in this repository. There is no formal release versioning history.

> ⚠️ **Recommendation**: Introduce semantic version tags beginning with the next meaningful
> release. Even for a solo project, tags create anchors for comparing Lighthouse scores,
> bundle sizes, and content state over time.

---

## Constitution Alignment

Constitution v1.1.0 was ratified 2026-04-12. Assessing commit history against stated principles:

| Principle | Commit Evidence | Alignment |
|-----------|-----------------|-----------|
| I. Simplicity | Wouter (not React Router), no server runtime, static output | ✅ Strong |
| II. Explicit Over Implicit | `exactOptionalPropertyTypes`, path aliases, API-driven URLs | ✅ Strong |
| III. Type Safety | TypeScript strict in tsconfig; TypeScript downgrade handled immediately | ✅ Strong |
| IV. Code Style Enforcement | `.prettierrc` present; ESLint rules disabled in config | ⚠️ Gap |
| V. Testing Standards | 4 test files; 40% threshold not yet met | ⚠️ Gap |
| VI. Iterative Delivery | Two focused sprints; small-scoped commits | ✅ Good |
| VII. Security | Hardcoded token in fetch-content.js; Dependabot active | ⚠️ Critical gap |
| VIII. Accessibility & Performance | Lighthouse CI active; `@axe-core/react` in devDeps | ✅ Good |
| IX. UI Component Standards | Radix UI + shadcn-ui 100% consistent | ✅ Strong |
| X. Static-First Architecture | No server runtime; build output in `target/` | ✅ Strong |
| XI. SEO and Crawlability | sitemap.xml + structured-data dominant in hotspots | ✅ Strong |

**Summary**: 7 of 11 principles show strong alignment from actual commit evidence. The 3 gaps
(ESLint disabled, insufficient test coverage, hardcoded security token) are already tracked in the
Remediation Backlog of constitution v1.1.0.

---

## Developer FAQ

### What does this project do?

TexEcon publishes expert analysis and commentary on the Texas economy at `texecon.com`. It is a
static React 19 single-page application that fetches content from the WebSpark headless CMS at
build time and pre-renders static HTML for every content route. There is no server — the entire
site is static files hosted on GitHub Pages.

### What tech stack does it use?

React 19 + TypeScript (strict mode) + Vite 7.1 for the frontend build. Tailwind CSS v4 with
Radix UI and shadcn/ui for styling and components. Wouter for client-side routing. Vitest +
@testing-library/react for tests. GitHub Actions for CI/CD with Lighthouse quality gates. Node.js
20 for build scripts. npm as package manager.

### Where do I start?

Open `client/src/pages/home.tsx` — it is the most-changed source file (19 commits) and is the
primary route orchestration hub. Then read `client/src/lib/seo-utils.ts` (13 changes) for URL
resolution logic, and `client/src/components/navigation.tsx` (14 changes) for menu structure.
Reading `AGENTS.md` at the repo root is mandatory — it documents the URL/navigation conventions
and build pipeline that all changes must respect.

### How do I run it locally?

```bash
npm install
npm run dev
```

For a full production build (fetches content from API, generates sitemap, compiles, generates
static pages):

```bash
npm run build
npm run preview
```

### How do I run the tests?

```bash
npm run test:run        # Single run
npm run test:coverage   # Run with coverage report
npm run test            # Watch mode
```

Tests use Vitest + jsdom. Test files are co-located alongside source: `*.test.ts` / `*.test.tsx`.
Only 4 test files currently exist (covering `seo-head`, `structured-data`, `seo-utils`, `utils`).

### What is the branching/PR workflow?

Currently direct-to-main for human commits (1.1% merge commit rate). Dependabot PRs come through
the standard PR workflow. The constitution (v1.1.0) requires all changes to be spec-driven
(`/devspark.specify` first) and to pass CI before merge. If adding a collaborator, feature
branches with PRs would align with the stated governance.

### Who do I ask when I'm stuck?

Mark Hazleton is the sole contributor — all 75 human-authored commits are his. He works under
three email identities (mark.hazleton@controlorigins.com, mark@markhazleton.com, Replit) that
all resolve to the same person. The constitution, `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md`
are the in-repo sources of design intent.

### What areas of the code change most often?

1. **`client/public/sitemap.xml`** (37 changes) — auto-generated with every content refresh
2. **`client/src/data/webspark-raw.json`** (34 changes) — CMS cache, updated at build time
3. **`client/src/pages/home.tsx`** (19 changes) — the most-active human-authored source file;
   route orchestration and SEO selection live here

For source code (not generated files), the hotspot directory is `client/src/components/` —
especially `seo-head.tsx` (16), `navigation.tsx` (14), and `footer.tsx` (11).

### Are there coding standards I must follow?

Yes. TypeScript strict mode is non-negotiable (`tsconfig.json`). Prettier formatting is enforced
(`npm run format:check` must pass — config: `semi: true`, `singleQuote: false`, `printWidth: 100`).
ESLint is configured (though rules are currently temporarily disabled — see Remediation Backlog).
Conventional commit prefixes (`feat:`, `fix:`, `refactor:`, etc.) are expected; 66% of existing
commits use them. All features must be spec-driven via DevSpark (`/devspark.specify` first).

### What version is currently released?

There are **no git tags** — no formal release versioning exists. The current HEAD is
`363c813` (2026-03-30): *"chore: downgrade typescript from 6.0.2 to 5.9.3"*. The live site
at `texecon.com` reflects the latest successful deploy from the `main` branch. `package.json`
version is `1.0.0`.

---

*Generated by /devspark.repo-story | DevSpark v1.5.0 — Adaptive System Life Cycle Development*
