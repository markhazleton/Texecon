# DevSpark 9.2 Knowledge Layout

`.knowledge/` stores durable current truth. `.devspark.work/` stores temporary work and command customizations. The retired `.documentation/` layout is no longer active.

## Entities and layers

Each `.knowledge/entities/<id>/_entity.yaml` declares `id`, `type` and `owner`. Entity types are `subsystem`, `domain`, `integration` or `tooling`. Relations use `predicate` and `object`, and targets must resolve to existing entities. The canonical schema is `.devspark/templates/schemas/entity-node.schema.json`.

Layer documents declare `type: entity-layer`, a unique `id`, `title`, `layer`, existing `source_of_truth` paths and `last_verified`. Core layers are architecture, business, integration and operations. Pattern and plan layers are optional. A justified `coverage_overrides` entry may exempt a layer when it does not apply. Document schema is `.devspark/templates/schemas/knowledge-node.schema.json`.

## Governance

Decisions are keyed by topic at `.knowledge/governance/decisions/<topic>.md`. Their `constrains` entity IDs must be reciprocated by `constrained_by` in each entity record. Current decision frontmatter does not use legacy lifecycle or status fields. The constitution remains at `.knowledge/governance/constitution.md`.

## Generated output

The authoritative generator is `.devspark/scripts/build_knowledge_index.py`. It writes `.knowledge/index.json` and `.knowledge/ontology/coverage.json`; the older `_derived.yaml` and `*.generated.md` reports are retired.

```powershell
python .devspark/scripts/build_knowledge_index.py --repo-root .
python .devspark/scripts/build_knowledge_index.py --repo-root . --check
```

The check validates reproducible generated output. Review coverage gaps, dangling references and stale source dates as well. Historical migration copies live under `.devspark.work/migration/9.2.0/` and are not current knowledge.
