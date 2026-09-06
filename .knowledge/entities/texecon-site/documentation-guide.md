# Documentation Guide

This is the living orientation document for active project documentation.

## Directory map

- `.knowledge/entities/` - Current-truth entities and their architecture or operational documents.
- `.knowledge/governance/` - Constitution and active architecture decisions.
- `.knowledge/ontology/` - Generated coverage, evidence, relation, governance, and gap reports.

## Key files

- `AGENTS.md` - Repository and knowledge-management orientation for agents.

## How to use

- DevSpark commands resolve in precedence order: personalized override, team override, then stock default.
- Team command overrides live in `.knowledge/commands/`.
- Stock command definitions live in `.devspark/defaults/commands/`.
- Operational scripts are under `.devspark/scripts/` (and optional team script overrides under `.knowledge/scripts/` when present).
- Command and plan templates are under `.devspark/templates/`.

## Constitution location

- `.knowledge/governance/constitution.md`

## Archive policy

- `.archive/` contains completed and historical documentation only.
- Do not read from `.archive/` during normal operations.
