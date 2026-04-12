# Project Guide

## DevSpark Commands

This project uses DevSpark for spec-driven development. Available slash commands:

- `/devspark.specify` — Define requirements and user stories
- `/devspark.plan` — Create implementation plan
- `/devspark.tasks` — Break plan into actionable tasks
- `/devspark.implement` — Execute tasks
- `/devspark.create-pr` — Draft or update a pull request
- `/devspark.pr-review` — Constitution-based PR review
- `/devspark.quickfix` — Lightweight bug fix workflow
- `/devspark.critic` — Pre-implementation risk analysis
- `/devspark.clarify` — Resolve spec ambiguities
- `/devspark.analyze` — Cross-artifact consistency check
- `/devspark.checklist` — Generate requirement quality checklists
- `/devspark.harvest` — Extract knowledge from completed specs
- `/devspark.release` — Archive artifacts and prepare release notes
- `/devspark.site-audit` — Full codebase audit against constitution
- `/devspark.repo-story` — Generate narrative from git history

See `.devspark/defaults/commands/` for the full list.

## Constitution

Read `.documentation/memory/constitution.md` before making changes — it defines the project's non-negotiable principles.

## Upgrade DevSpark

To upgrade DevSpark to the latest version, run in chat:

```
/devspark Follow the instructions at https://raw.githubusercontent.com/markhazleton/devspark/main/templates/commands/upgrade.md
```
