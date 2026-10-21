---
id: typescript-7-deferral
type: governance-decision
title: TypeScript 7 Deferral
constrains:
- texecon-site
source_of_truth:
- package.json
last_verified: '2026-10-21'
---

# TypeScript 7 Deferral

## Status

Accepted

## Context

TypeScript 7 is published, but `@typescript-eslint/parser` and
`@typescript-eslint/eslint-plugin` (8.72.0, the current release) declare a peer range of
`typescript >=4.8.4 <6.1.0`. Upgrading would put the lint gate (Constitution Principle IX)
outside its supported range or require forced peer overrides.

## Decision

`typescript` stays pinned at `~6.0.3`. `npm outdated` reporting TypeScript 7 is expected
and is not an upgrade signal on its own. Do not use `--force`, `--legacy-peer-deps`, or
`overrides` to bypass the typescript-eslint peer range.

Revisit when a typescript-eslint release declares TypeScript 7 support. At that point the
upgrade is a dedicated change that validates compiler configuration, lint, type-check, and
the full build.

## Consequences

### Positive

- Lint, type-check, and editor tooling stay on a supported combination.

### Negative

- TypeScript 7 compiler performance and language features are unavailable until the lint
  toolchain catches up.

## Source

- **Evidence**: `.knowledge/npm-upgrade-evidence-2026-09-12.json` (registry peer metadata)
- **Constitution**: Principle V — Type Safety and Explicitness; Principle IX — Quality Gates
- **Date**: 2026-10-21
