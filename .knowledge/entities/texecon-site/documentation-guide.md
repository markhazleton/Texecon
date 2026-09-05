# Documentation Guide

This is the living orientation document for active project documentation.

## Directory map

- `.knowledge/commands/` - Team-level command overrides for DevSpark prompt/command behavior.
- `.knowledge/decisions/` - Architecture and decision records that remain active references.
- `.knowledge/guides/` - Human-oriented guides, including current and legacy-but-retained reference docs.
- `.knowledge/memory/` - Project memory documents, including the constitution.
- `.knowledge/repo-story/` - Repository narrative snapshots and historical project storyline docs retained as active context.
- `.knowledge/reports/` - Implementation and review reports that remain relevant to current operations.
- `.knowledge/specs/` - Spec artifacts for planned and active workstreams.

## Key files

- `.knowledge/Guide.md` - This file; current-state orientation and usage rules for `.knowledge/`.

## How to use

- DevSpark commands resolve in precedence order: personalized override, team override, then stock default.
- Team command overrides live in `.knowledge/commands/`.
- Stock command definitions live in `.devspark/defaults/commands/`.
- Operational scripts are under `.devspark/scripts/` (and optional team script overrides under `.knowledge/scripts/` when present).
- Command and plan templates are under `.devspark/templates/`.

## Constitution location

- `/.knowledge/memory/constitution.md`

## Archive policy

- `.archive/` contains completed and historical documentation only.
- Do not read from `.archive/` during normal operations.
