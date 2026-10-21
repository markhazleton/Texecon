# Documentation Guide

This is the living orientation document for active project documentation.

## Directory map

- `.knowledge/entities/` - Current-truth entities and their architecture or operational documents.
- `.knowledge/governance/` - Constitution and active architecture decisions.
- `.knowledge/ontology/` - Knowledge schema documentation and generated coverage.json.

- `.knowledge/guides/` - Developer and operational guides.
- `.knowledge/index.json` - Generated searchable knowledge graph.
- `.devspark.work/` - In-flight work, migration records and customizations.

## Key files

- `AGENTS.md` - Repository and knowledge-management orientation for agents.

## How to use

- DevSpark commands resolve in precedence order: personalized override, team override, then stock default.
- Team command overrides live in `.devspark.work/commands/`.
- Stock command definitions live in `.devspark/defaults/commands/`.
- Operational scripts are under `.devspark/scripts/` (and optional team script overrides under `.devspark.work/scripts/` when present).
- Command and plan templates are under `.devspark/templates/`.

## Constitution location

- `.knowledge/governance/constitution.md`

## Archive policy

- `.archive/` contains completed and historical documentation only.
- Do not read from `.archive/` during normal operations.

## DevSpark 9.2 commands

Type `/devspark-specify` to start a specification. Commands use the `/devspark-<name>` spelling; bare names are ordinary chat input. Override resolution is personal (`.devspark.work/{git-user}/commands/`), team (`.devspark.work/commands/`), then stock (`.devspark/defaults/commands/`). `/devspark-personalize` creates personal overrides.

Run `python .devspark/scripts/build_knowledge_index.py --repo-root .` to regenerate the index and `--check` to verify it. Re-run the canonical Codex quickstart to update stock framework files.
