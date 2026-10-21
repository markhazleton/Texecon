# npm package review and upgrade plan

Reviewed: 2026-09-12. Scope: all 38 direct dependencies (15 runtime, 23 development), installed dependency health, lockfile security, and registry engine/peer metadata. This is a plan only; no dependencies or lockfile were changed. Existing package.json video scripts and untracked videos/ work are preserved.

## Findings

- `npm outdated --json`: 17 packages flagged; exit 1 means updates were found.
- `npx --yes npm-check-updates --jsonUpgraded` (ncu 23.1.0): 16 proposed updates. No `-u` was used.
- `npm audit --json`: zero reported vulnerabilities at every severity across 397 dependencies in audit metadata. This is a point-in-time advisory check, not a guarantee of security.
- `npm ls --depth=0 --json`: passed; all 38 direct dependencies installed without reported direct-tree problems.
- Five package entries have major upgrades: TypeScript, jsdom, and the three Vitest packages. Eleven other ncu suggestions are minor/patch updates.
- `@types/node` is a special case: installed 26.4.0, wanted 26.5.1, registry latest tag 22.20.2. Registry compiler-specific tags point to 26.5.1; ncu omits it. Select the type major deliberately to match the runtime instead of following latest.
- CI selects Node 20; local review ran Node 26.7.0 and npm 12.0.2. Current jest-dom 7.0.1 and visualizer 7.1.1 require Node >=22. Node 20 is EOL according to the [Node release schedule](https://nodejs.org/en/about/previous-releases).
- Current code already uses Vite 8, TypeScript 6, and ESLint 10. AGENTS.md describes older versions and a PWA plugin that is absent from the current manifest/config; do not add it back as part of this upgrade.
- No direct latest-version metadata reported deprecation.

## Complete direct-package inventory

Latest values are npm registry tags observed during this review, not automatically approved targets. Keep rows are already at latest and need no version change.

| Package | Declared | Installed/locked | Registry latest | Decision |
| --- | --- | --- | --- | --- |
| @radix-ui/react-slot | ^1.3.3 | 1.3.3 | 1.3.3 | Keep |
| @radix-ui/react-tabs | ^1.1.21 | 1.1.21 | 1.1.21 | Keep |
| @radix-ui/react-toast | ^1.2.23 | 1.2.23 | 1.2.23 | Keep |
| @radix-ui/react-tooltip | ^1.2.16 | 1.2.16 | 1.2.16 | Keep |
| @tailwindcss/typography | ^0.5.20 | 0.5.20 | 0.5.20 | Keep |
| @tanstack/react-query | ^5.102.8 | 5.102.8 | 5.102.8 | Keep |
| class-variance-authority | ^0.7.1 | 0.7.1 | 0.7.1 | Keep |
| clsx | ^2.1.1 | 2.1.1 | 2.1.1 | Keep |
| lucide-react | ^1.35.0 | 1.35.0 | 1.45.0 | Phase 2 |
| react | ^19.2.8 | 19.2.8 | 19.3.0 | Phase 2 |
| react-dom | ^19.2.8 | 19.2.8 | 19.3.0 | Phase 2 |
| tailwind-merge | ^3.6.0 | 3.6.0 | 3.6.0 | Keep |
| tailwindcss | ^4.3.3 | 4.3.3 | 4.3.3 | Keep |
| tailwindcss-animate | ^1.0.7 | 1.0.7 | 1.0.7 | Keep |
| wouter | ^3.10.0 | 3.10.0 | 3.11.0 | Phase 3 |
| @axe-core/react | ^4.13.0 | 4.13.0 | 4.13.0 | Keep |
| @eslint/js | ^10.0.1 | 10.0.1 | 10.0.1 | Keep |
| @tailwindcss/vite | ^4.3.3 | 4.3.3 | 4.3.3 | Keep |
| @testing-library/jest-dom | ^7.0.1 | 7.0.1 | 7.0.1 | Keep |
| @testing-library/react | ^16.3.3 | 16.3.3 | 16.3.3 | Keep |
| @types/node | ^26.4.0 | 26.4.0 | 22.20.2 | Align to Node 24: ^24.13.4 |
| @types/react | ^19.2.18 | 19.2.18 | 19.3.0 | Phase 2 |
| @types/react-dom | ^19.2.5 | 19.2.5 | 19.3.0 | Phase 2 |
| @typescript-eslint/eslint-plugin | ^8.68.0 | 8.68.0 | 8.70.0 | Phase 3 |
| @typescript-eslint/parser | ^8.66.0 | 8.68.0 | 8.70.0 | Phase 3 |
| @vitejs/plugin-react | ^6.0.5 | 6.0.5 | 6.1.1 | Phase 3 |
| @vitest/coverage-v8 | ^4.1.11 | 4.1.11 | 5.0.0 | Phase 4 |
| @vitest/ui | ^4.1.10 | 4.1.11 | 5.0.0 | Phase 4 |
| eslint | ^10.8.1 | 10.8.1 | 10.10.0 | Phase 3 |
| eslint-config-prettier | ^10.1.8 | 10.1.8 | 10.1.8 | Keep |
| eslint-plugin-prettier | ^5.5.6 | 5.5.6 | 5.5.6 | Keep |
| jsdom | ^29.1.1 | 29.1.1 | 30.0.1 | Phase 5 |
| prettier | ^3.9.6 | 3.9.6 | 3.9.6 | Keep |
| rollup-plugin-visualizer | ^7.1.1 | 7.1.1 | 7.1.1 | Keep |
| sharp | ^0.35.4 | 0.35.4 | 0.35.4 | Keep |
| typescript | ^6.0.3 | 6.0.3 | 7.0.2 | Hold 6.0.3; blocked by lint peers |
| vite | ^8.2.1 | 8.2.1 | 8.3.0 | Phase 3 |
| vitest | ^4.1.10 | 4.1.11 | 5.0.0 | Phase 4 |

Registry engine/peer metadata for every package is saved in the adjacent evidence file. Peer listings include optional peers; do not install optional integrations solely because they appear there.

## Implementation sequence

Use a dedicated branch and separate commits for the phases below. Preserve the existing user edits when staging. Re-query versions at implementation time if this plan has aged. Commit package.json and package-lock.json together in every dependency phase; do not hand-edit the lockfile, run audit fix --force, or bypass peers with --legacy-peer-deps.

### Phase 1: establish a compatible runtime and clean baseline

1. Set CI and local development to a current Node 24 LTS patch, minimum 24.15.0 (required by proposed jsdom 30). Add a runtime version file and document the selected npm version; declare the supported Node range in package.json.
2. Align `@types/node` deliberately to `^24.13.4`, the newest 24.x found in this review. This is an intentional type-major reduction from 26, paired with the chosen LTS runtime.
3. Run `npm ci --include=dev` on Node 24 and confirm there are no engine/peer errors. Type changes require another install before this clean-install check.
4. Resolve the pre-existing generated-file formatting failure through the existing generation/Prettier workflow. CI already formats this generated file after fetching content.
5. Establish full build and coverage baselines on Node 24 before upgrading libraries. The local Node 26 checks below do not prove CI compatibility.

### Phase 2: React and matching types

Update React and React DOM together to 19.3.0, and both React type packages to 19.3.0.

```powershell
npm install react@^19.3.0 react-dom@^19.3.0
npm install -D @types/react@^19.3.0 @types/react-dom@^19.3.0
```

React DOM requires React ^19.3.0; React DOM types require React types ^19.3.0. Existing Radix, React Query, Testing Library, and Wouter peer ranges accept React 19. Run type-check and component tests; smoke-test tabs, toasts, tooltips, navigation, and data-driven content. Inspect React release notes before implementation for behavior changes not captured by peer ranges.

### Phase 3: compatible toolchain and UI updates

```powershell
npm install lucide-react@^1.45.0 wouter@^3.11.0
npm install -D eslint@^10.10.0 @typescript-eslint/eslint-plugin@^8.70.0 @typescript-eslint/parser@^8.70.0
npm install -D vite@^8.3.0 @vitejs/plugin-react@^6.1.1
```

Keep the parser/plugin versions aligned. Vite 8.3 is inside Tailwind Vite's supported ^8 peer range, and React plugin 6.1.1 requires Vite ^8. Keep TypeScript 6.0.3. Validate icon rendering, direct and legacy route links, dev-server refresh, bundle visualizer, cache-buster output, and generated static pages. Make separate commits for UI, lint, and build-tool batches so regressions are easy to isolate.

### Phase 4: Vitest 5 migration

Read the [official migration guide](https://main.vitest.dev/guide/migration/) and [Vitest 5 release notes](https://vitest.dev/blog/vitest-5) before editing configuration. Vitest 5 requires a newer runtime than CI's Node 20; the proposed Node 24 baseline satisfies its engine range.

```powershell
npm install -D vitest@5.0.0 @vitest/ui@5.0.0 @vitest/coverage-v8@5.0.0
```

Use matching exact versions because UI and coverage declare exact Vitest peers. Initially keep jsdom 29.1.1 to isolate the test-runner migration. Address the current warning in vitest.config.ts by replacing __dirname with import.meta.dirname in alias paths when reviewing native config loading. Verify setup hooks, mocks, all 41 existing tests, coverage output/thresholds, and `npm run test:ui`. Do not lower thresholds to make the upgrade pass.

### Phase 5: jsdom 30

```powershell
npm install -D jsdom@^30.0.1
```

Registry engine requirement: ^22.22.2 || ^24.15.0 || >=26.0.0. Inspect [jsdom release notes](https://github.com/jsdom/jsdom/releases) before implementation and test DOM events, computed styles, selectors, accessibility assertions, and browser API mocks. Re-run tests and coverage independently of Phase 4.

### Phase 6: defer TypeScript 7 until supported

Do not accept ncu's TypeScript 7.0.2 suggestion yet. Both @typescript-eslint packages at 8.70.0 declare TypeScript >=4.8.4 <6.1.0; TypeScript 7 falls outside that range. Retain ^6.0.3 and recheck published peers and [typescript-eslint support guidance](https://typescript-eslint.io/users/dependency-versions/) in a later review. Once supported, make this a separate migration and validate compiler configuration, editor integration, lint, and builds. No forced peer overrides.

## Validation and acceptance

After each applicable batch run type-check, lint, and tests. Before merging each completed upgrade PR run:

```powershell
npm ci --include=dev
npm ls --depth=0
npm run type-check
npm run lint
npm run format:check
npm run test:run
npm run test:coverage -- --run
npm run build
npm audit --json
npm outdated --json
npx --yes npm-check-updates --jsonUpgraded
```

- Require no install engine/peer failures, no new audit findings, passing checks, and coverage meeting existing thresholds. Remaining TypeScript ncu output is expected while deferred; @types/node may continue to have a misleading latest tag.
- Verify target/index.html, version.json, sitemap.xml, robots.txt, and CNAME; inspect bundle-stats.html and static HTML for representative API item.url paths.
- Validate both production env (`VITE_BASE_PATH=/`, `SITE_BASE_URL=https://texecon.com`) and PR env (`VITE_BASE_PATH=/Texecon/`, `SITE_BASE_URL=https://markhazleton.github.io/Texecon`) with separate builds.
- Verify canonical URLs, JSON-LD, crawler links, sitemap paths, and direct navigation/refresh match existing API URLs; no SEO or URL schema change is intended.
- Build fetches external content and regenerates cached data/public outputs: distinguish content changes from dependency changes when reviewing diffs. Never manually repair target/ artifacts.
- Run existing Lighthouse checks against the output and compare bundle size to baseline. Dependency upgrades must not remove crawler discoverability.
- Roll back a failed batch by reverting its specific dependency/configuration commit and running npm ci. Avoid resetting unrelated user work. Do not merge a failed batch.

## Checks actually run for this review

| Check | Result |
| --- | --- |
| npm outdated --json | 17 entries; expected exit 1 |
| npm audit --json | Pass; zero vulnerabilities |
| ncu --jsonUpgraded | 16 proposals; no manifest writes |
| npm ls --depth=0 --json | Pass |
| npm run type-check | Pass |
| npm run lint | Pass |
| npm run test:run | Pass; 6 files, 41 tests; native-config warning about __dirname |
| npm run format:check | Existing failure: client/src/data/content-types.ts |
| Build, coverage, Node 24 clean install, browser/Lighthouse checks | Not run; implementation acceptance gates |

No application, routing, SEO, or publishing behavior was changed during this review.

