# DevSpark 9.2.0 migration — 2026-10-20

Upgraded DevSpark 4.2.0 to 9.2.0 using the cache-busted canonical Codex quickstart and manifest.json preserved here.

## Framework and adapters

- All 182 non-skill canonical files are installed; 38 hyphenated Codex prompts are present. Native Copilot skills are excluded by the Codex quickstart.
- All 28 dotted Codex prompts are quarantined, including the retired archive/harvest adapters. Original contents are retained.
- Existing supported Copilot and Claude adapters use hyphenated names and current override paths. Original adapters are quarantined; obsolete commands are inactive.
- 15 obsolete framework roots and 3 obsolete stock commands are preserved under obsolete-framework/ here. The active .devspark/ contains only VERSION, defaults/, templates/ and scripts/.
- .documentation/ contained no files. Its empty tree is preserved under empty-documentation/ here; active references use current paths.

## Knowledge migration

- The project constitution is unchanged.
- Four entities use the current schema, typed relations and reciprocal governance pointers.
- Architecture descriptions are retained. Twelve business/integration/operations layer documents close the missing-layer gaps.
- Five general guides moved to .knowledge/guides/; links and override guidance were corrected there.
- Three numbered governance decisions became topic-keyed documents, retaining their reasoning and source references.
- Previous entity metadata, numbered decisions, derived YAML and ontology reports are preserved under legacy-knowledge/.
- The canonical builder generates .knowledge/index.json and .knowledge/ontology/coverage.json. No legacy root index builder exists.

## Project integration

AGENTS.md, README.md, .gitignore, existing agent adapters and local VS Code settings now use current paths and /devspark-<name> command spelling. Command resolution is personal (.devspark.work/{git-user}/commands/), team (.devspark.work/commands/), then stock (.devspark/defaults/commands/).

To retain a legacy prompt edit as an active customization, recreate its intended change in a current override path. Do not restore .documentation/ paths. /devspark-personalize creates per-user overrides. Commands start when typed with a leading slash; bare names are plain text.

## Validation

- Canonical files and entry-point inventory passes.
- Four entity schemas, sixteen layer schemas and three decision schemas pass.
- The canonical index --check --fail-on-stale passes: 4/4 entities covered, no gaps, dangling references or stale source dates.
- npm run lint, npm run type-check and npm run format:check pass.
- 102 tracked moved originals match preserved copies after checkout line-ending normalization. 2 intentionally updated guides additionally have their original Git contents preserved under legacy-knowledge/guides/.
- Application source, API URLs, SEO generation and publishing configuration are unchanged by this migration.

moves.json records individual path relocations. Historical migration copies are not active defaults or current knowledge. Start with /devspark-specify; re-run the canonical Codex quickstart for future stock upgrades.
