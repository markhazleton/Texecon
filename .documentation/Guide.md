# Documentation Guide

This is the living orientation document for active project documentation.

## Directory map

- `.documentation/commands/` - Team-level command overrides for DevSpark prompt/command behavior.
- `.documentation/decisions/` - Architecture and decision records that remain active references.
- `.documentation/guides/` - Human-oriented guides, including current and legacy-but-retained reference docs.
- `.documentation/memory/` - Project memory documents, including the constitution.
- `.documentation/repo-story/` - Repository narrative snapshots and historical project storyline docs retained as active context.
- `.documentation/reports/` - Implementation and review reports that remain relevant to current operations.
- `.documentation/specs/` - Spec artifacts for planned and active workstreams.

## Key files

- `.documentation/Guide.md` - This file; current-state orientation and usage rules for `.documentation/`.

## How to use

- DevSpark commands resolve in precedence order: personalized override, team override, then stock default.
- Team command overrides live in `.documentation/commands/`.
- Stock command definitions live in `.devspark/defaults/commands/`.
- Operational scripts are under `.devspark/scripts/` (and optional team script overrides under `.documentation/scripts/` when present).
- Command and plan templates are under `.devspark/templates/`.

## Constitution location

- `/.documentation/memory/constitution.md`

## Archive policy

- `.archive/` contains completed and historical documentation only.
- Do not read from `.archive/` during normal operations.
