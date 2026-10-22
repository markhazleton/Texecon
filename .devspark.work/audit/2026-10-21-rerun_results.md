# Codebase Audit Report (Re-run)

## Audit Metadata

- **Audit Date**: 2026-10-21 18:41:52 UTC
- **Scope**: full
- **Auditor**: devspark-site-audit
- **Constitution Version**: 1.2.1
- **Repository**: Texecon (branch `main` @ `ba0ca81`)
- **Baseline**: `.devspark.work/audit/2026-10-21_results.md` (07:47 UTC, plus its Resolution section)

## Executive Summary

### Compliance Score

| Category | Score | Status |
|----------|-------|--------|
| DevSpark Version | 9.2.0 installed (latest unknown) | ⚠️ UNKNOWN |
| Durable Delta Consistency | FINDINGS (1) | ⚠️ |
| Knowledge Completeness & Mapping Accuracy | GAPS (index stale, 15 stale docs) | ⚠️ |
| Constitution Compliance | 95% | ✅ PASS (1 latent LOW) |
| Security | Committed credentials (outside the constitution) | ⚠️ |
| Code Quality | 90% | ✅ PASS |
| Test Coverage | 23 files / 158 tests passing | ✅ PASS |
| Documentation | 85% | ⚠️ PARTIAL |
| Dependencies | 100% (0 vulnerabilities) | ✅ PASS |

**Overall Health**: NEEDS ATTENTION (0 critical, 3 high, 1 medium, 1 low)

### Issue Summary

| Severity | Count |
|----------|-------|
| 🔴 CRITICAL | 0 |
| 🟠 HIGH | 3 |
| 🟡 MEDIUM | 1 |
| 🔵 LOW | 1 |

### Quality Gate Results (Principle IX chain, run locally)

| Gate | Result |
|------|--------|
| `npm run lint` | ✅ exit 0 |
| `npm run format:check` | ✅ exit 0 |
| `npm run type-check` | ✅ exit 0 |
| `npm run test:run` | ✅ 23 files, 158 tests passed |
| `npm run build` | ⏭️ not run (it fetches live WebSpark content) |
| `npm audit --audit-level=moderate` | ✅ 0 vulnerabilities |
| `build_knowledge_index.py --check` | ❌ exit 1: 15 STALE, index DRIFT |
| `knowledge-integrity.py --json` | ❌ 1 hard failure (`generated-artifact-drift`) |

## Baseline Fix Verification

| Baseline ID | Status now | Evidence |
|-------------|-----------|----------|
| KNOW7 | ✅ Holds | `knowledge-integrity.py` no longer reports engine divergence |
| ARCH1 | ✅ Holds | `withTrailingSlash`/`buildMenuHierarchy` are defined only in `shared/route-shape.js`. `generate-sitemap.js:27` and `seo-utils.ts:14` now delegate to it. One latent edge case remains (ARCH2) |
| DELTA4 | ✅ Holds | No planning identifiers in `.knowledge/`, `client/src`, `scripts/`, or `shared/` |
| TYPE1 | ✅ Holds | type-check passes; no `any` emitted for `pages` |
| DOC1 | ✅ Holds | Constitution 1.2.1 states Node.js 22 / Vitest 5 |
| — | ⚠️ **Regressed** | The baseline Resolution recorded "`build_knowledge_index.py --check` exits 0". It now fails (KNOW1). Committing the fixes moved source-of-truth dates past each doc's `last_verified` |

## Constitution Compliance

### Principle Compliance Matrix

| Principle | Status | Violations | Key Issues |
|-----------|--------|------------|------------|
| I. Static Output First | ✅ PASS | 0 | — |
| II. API Data Drives Published Routes | ✅ PASS | 0 | Menu hierarchy now shared |
| III. One Canonical Route Shape Everywhere | ✅ PASS (latent) | 1 LOW | Client-only fallback branches (ARCH2) |
| IV. Build Pipeline Is Product Logic | ✅ PASS | 0 | — |
| V. Type Safety and Explicitness | ✅ PASS | 0 | — |
| VI. Fully Crawlable Static HTML | ✅ PASS (static review) | 0 | — |
| VII. SEO and Metadata First-Class | ✅ PASS (static review) | 0 | — |
| VIII. GitHub Pages Compatibility | ✅ PASS | 0 | — |
| IX. Quality Gates Reflect Published Reality | ✅ PASS | 0 | All npm gates green |
| X. Generated Assets Reproducible | ⚠️ PARTIAL | 1 | Generated `.knowledge/index.json` is stale (KNOW1) |

### Detailed Violations

| ID | Principle | File:Line | Issue | Severity | Recommendation |
|----|-----------|-----------|-------|----------|----------------|
| KNOW1 | Knowledge completeness / X | `.knowledge/index.json`; 15 entity docs | Index stale. `last_verified` is older than source-of-truth changes made by today's fixes | HIGH | Re-verify the docs, bump `last_verified`, regenerate |
| SEC1 | Security (not in constitution) | `scripts/fetch-content.js:18-19`, `scripts/refresh-content.js:31-32`, `client/src/lib/api-client.ts:160-163` | Bearer token and antiforgery cookie hardcoded in tracked source | HIGH | Move to env vars / CI secrets; rotate if the token is meaningful |
| DELTA2 | Durable delta | `.knowledge/entities/webspark-content-pipeline/architecture.md` (Boundaries, Security boundary), `integration.md` | Knowledge describes `api-client.ts` as a live, browser-bundled runtime client. Nothing imports it | HIGH | Delete the dead module (resolves part of SEC1) and update both docs |
| DOC2 | Published docs | `README.md:122` | Links into ephemeral `.devspark.work/release-candidates/...` | MEDIUM | Move the repo story into durable docs or drop the link |
| ARCH2 | III | `client/src/lib/seo-utils.ts:20-26` vs `scripts/generate-sitemap.js:27-29` | Url-less items: the client emits `/<argument>/` or `/page/<id>/`, the sitemap emits `/` | LOW | Move the fallback into `shared/route-shape.js`, or reject url-less items |

#### KNOW1: Knowledge index stale after fixes (HIGH)

`build_knowledge_index.py --check` exits 1. It reports 15 `STALE` lines plus `DRIFT: .knowledge/index.json is stale`. `knowledge-integrity.py` reports the same thing verbatim:

> `generated-artifact-drift` · subject `index.json` · "C:\GitHub\MarkHazleton\Texecon\.knowledge\index.json is stale relative to .knowledge/ source content" · Regenerate with: `python3 scripts/build_knowledge_index.py --repo-root .`

Affected docs and the changed source:

- `github-pages-publishing/{architecture,integration}.md` ← `vite.config.ts`
- `github-pages-publishing/business.md`, `texecon-site/{architecture,business}.md` ← `constitution.md`
- `memorial-site/operations.md`, `texecon-site/integration.md` ← `generate-static-pages.js` / `vite.config.ts`
- `webspark-content-pipeline/{architecture,business,integration,operations}.md` ← `fetch-content.js`, `generate-sitemap.js`, `generate-static-pages.js`

**Intent**: an agent that resolves context through the index should be able to trust it. Bumping the dates by hand without reading the docs would satisfy the check and leave the intent unmet.

**Spot check**: none of the affected docs describe the moved functions, the old Node/Vitest versions, or the `any` types, so most only need a confirmation. Exception: the two `webspark-content-pipeline` docs named in DELTA2 need real edits.

**Recommendation**: Fix DELTA2 first. Then run `/devspark-explain` (or review by hand) for each listed doc, bump `last_verified` to 2026-10-21, run `python .devspark/scripts/build_knowledge_index.py --repo-root .`, and confirm `--check` exits 0.

#### SEC1: Credentials committed to source (HIGH)

```js
// scripts/fetch-content.js:18-19 (identical in refresh-content.js:31-32, api-client.ts:160-163)
'Authorization': 'Bearer MARKHAZLETON-WEB',
'Cookie': '.AspNetCore.Antiforgery.DlpvxuBJxZo=CfDJ8C3wmONpH_FLph…',
```

The constitution has no secrets principle, so this is not a constitution violation. It is a security finding: the baseline audit marked "No hardcoded secrets" as passing, and that was wrong. `.knowledge/entities/webspark-content-pipeline/architecture.md` already calls these "exposed credentials" and a "remediation concern". The bearer value looks like a site identifier and the cookie is an antiforgery (CSRF) token, so the real-world impact may be low. Only the WebSpark owner can confirm whether either value grants access.

**Recommendation**: Read `WEBSPARK_TOKEN` (and the cookie, if the API really requires it) from `process.env` in both scripts and supply them from a GitHub Actions secret in `deploy.yml`. If the token is a real credential, rotate it, because git history keeps the old value. Consider adding a constitution principle on secrets so future audits score this.

#### DELTA2: Knowledge describes a dead module as live (HIGH)

`client/src/lib/api-client.ts` (`WebSparkApiClient`, `websparkClient`, `fetchBuildTimeData`) is imported by no file in `client/src` or `scripts/`. The two knowledge docs nevertheless say:

> "The application also contains a runtime API client for cache-backed access and fallback behavior." … "The runtime client is browser-bundled, so these values must be treated as exposed credentials."

Because nothing imports the module, Vite does not bundle it, so the claim is false today. The module is dead code that only carries one of the three credential copies.

**Recommendation**: Delete `client/src/lib/api-client.ts` (no test file references it). Then rewrite the Boundaries and Security-boundary paragraphs of `architecture.md` and the second paragraph of `integration.md` to describe the build-time path only.

#### DOC2: README links into the ephemeral work root (MEDIUM)

`README.md:122` → `[Repo Story (2026-04-12)](.devspark.work/release-candidates/documentation/repo-story/repo-story-2026-04-12.md)`. The file exists today. `.devspark.work/` is defined as temporary (`.knowledge/ontology/schema.md:3`), so the link will break when release candidates are pruned.

**Recommendation**: Move the story to a durable location such as `.knowledge/guides/` or `docs/`, or remove the link.

Not flagged: `.knowledge/ontology/schema.md:24`, `.knowledge/guides/documentation-guide.md`, `AGENTS.md` and `README.md:168/174` mention `.devspark.work/` only to describe the framework layout. They do not depend on content stored there.

#### ARCH2: Route fallback only on the client (LOW, latent)

Principle III: "The following outputs MUST agree exactly on route shape". For an item with no `url`, `seo-utils.ts` falls back to `/${argument}/` and then to `/page/${id}/`, while the sitemap's `generateSEOPath` returns `/`. All 13 cached menu items have a `url` today, so no output differs yet.

**Recommendation**: Either move the fallback chain into `shared/route-shape.js` and use it on both sides, or have `fetch-content.js` fail when an item has no `url`. The second option matches Principle II ("API data drives routes").

## DevSpark Version

| Field | Value |
|-------|-------|
| Installed Version | 9.2.0 (Make-Bold edition) |
| Latest Version | Unknown: repo `CHANGELOG.md` tracks Texecon, not DevSpark |
| Install Date | 2026-10-20 |
| Method | claude-code-quickstart |
| Status | UNKNOWN |

No VER findings. VER4 for root `scripts/` is a false positive: it holds Texecon build scripts.

## Security Findings

| Type | Count | Severity |
|------|-------|----------|
| Hardcoded credentials | 3 locations (1 value pair) | HIGH (SEC1) |
| Insecure patterns | 0 | — |
| Vulnerable dependencies | 0 | — |

- [ ] No hardcoded secrets or credentials (SEC1)
- [x] Dependencies free of known vulnerabilities
- [x] Static-only output, no server attack surface (Principle I)
- [x] `scripts/image-dedupe/.venv` is git-ignored (`.gitignore:50`)

## Package/Dependency Analysis (npm)

| Package | Current | Latest | Note |
|---------|---------|--------|------|
| lucide-react | 1.60.0 | 1.61.0 | in range |
| vite | 8.3.4 | 8.3.5 | in range |
| typescript | 6.0.3 | 7.0.2 | pinned by decision `typescript-7-deferral` |

0 vulnerabilities. No unused dependencies detected.

## Code Quality Analysis

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| App files > 500 lines | 3 (`scripts/generate-static-pages.js` 960, `videos/editor/editor.js` 518, `videos/editor/enhancements.js` 525) | 0 | ⚠️ INFO |
| TODO comments (app code) | 1 (`client/src/App.tsx:88`, open product decision) | — | INFO |

Note: `generate-static-pages.js` grew from 933 to 960 lines since the baseline.

## Test Coverage Analysis

| Category | Value |
|----------|-------|
| Test files | 23 (Vitest), including the new `client/src/lib/route-shape.test.ts` |
| Tests | 158 passed, 0 failed |
| Evidence-accuracy pass | No `.knowledge/` node cites `verified_by: execution`. No DELTA5 |

## Unused Code Analysis

| Type | Item | Location | Confidence |
|------|------|----------|------------|
| Module | `WebSparkApiClient`, `websparkClient`, `fetchBuildTimeData` | `client/src/lib/api-client.ts` | HIGH: no importers (see DELTA2) |

## Duplicate Code Analysis

| ID | Locations | Similarity | Recommendation |
|----|-----------|------------|----------------|
| DUP1 | WebSpark request headers in `scripts/fetch-content.js:16-20` and `scripts/refresh-content.js:29-33` | ~100% | Fold into one env-backed config when fixing SEC1 |

## Recommendations

### High Priority

1. **DELTA2**: Delete `client/src/lib/api-client.ts` and correct the two pipeline docs.
2. **SEC1**: Move the WebSpark token and cookie to environment variables and a CI secret. Rotate the token if it is meaningful.
3. **KNOW1**: Re-verify the 15 stale docs, bump `last_verified`, regenerate the index, and confirm `--check` exits 0.

### Medium Priority

1. **DOC2**: Move or remove the README repo-story link into `.devspark.work/`.

### Low Priority

1. **ARCH2**: Unify or reject the url-less route fallback.
2. Optionally add a constitution principle on secrets (`/devspark-evolve-constitution`).

## Resolution (2026-10-21)

After the fixes: lint, format:check, type-check, and 23 files / 158 tests pass. `vite build` succeeds.
`build_knowledge_index.py --check` exits 0. `knowledge-integrity.py` reports 0 findings.

| ID | Verified | Fix |
|----|----------|-----|
| DELTA2 | ✅ no importers of `api-client.ts` anywhere in the repo | Module deleted. `webspark-content-pipeline/architecture.md` and `integration.md` now describe a build-time-only integration with no runtime client |
| SEC1 | ✅ GET `/api/WebCMS/websites/1` returns the same 200 / 67,147-byte body with no auth, the committed token, or a bogus token, so neither header was ever needed | Hardcoded bearer and cookie removed from `fetch-content.js` and `refresh-content.js`. An optional `WEBSPARK_API_TOKEN` env var is sent as a bearer token when set. A credential-free `fetch-content.js` run produced content identical to the cache except timestamps. No CI secret is required. The old values remain in git history |
| KNOW1 | ✅ 11 unique docs behind the 15 STALE lines reviewed against their changed sources | `texecon-site/architecture.md` now lists `shared/` as an owned path. Other docs matched the code. `last_verified` set to 2026-10-21 on all 11. Index and coverage regenerated |
| DOC2, ARCH2 | — | Not in scope of this pass |

## Comparative Analysis

| Metric | Baseline (07:47) | Current | Trend |
|--------|------------------|---------|-------|
| Critical | 0 | 0 | → |
| High | 3 | 3 | → (all 3 baseline HIGHs fixed; 3 new) |
| Medium | 2 | 1 | ↓ |
| Tests passing | 150 | 158 | ↑ |
| Constitution compliance | 85% | 95% | ↑ |
| Knowledge index `--check` | exit 0 | exit 1 | ↓ regression |

New since baseline: KNOW1 (side effect of committing the fixes), plus SEC1 and DELTA2, which the baseline missed.

## Next Steps

1. Fix DELTA2, then SEC1, then KNOW1, in that order. The doc edits for DELTA2 feed into the KNOW1 re-verification.
2. Run `npm run build` in a networked environment to confirm principles VI, VII, and X against real `target/` output.
3. Re-run the audit after fixes.

---

*Audit generated by devspark-site-audit v1.0*
*Constitution-driven codebase audit for Texecon*
*Next audit recommended: 2026-10-28*
*To re-run: `/devspark-site-audit` or `/devspark-site-audit --scope=constitution`*
