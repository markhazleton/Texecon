# Knowledge Entities

Each entity folder declares identity, ownership, relations and reciprocal governance pointers in `_entity.yaml`. Markdown layer documents describe current behavior and cite existing source paths with a verification date.

Core layers are architecture, business, integration and operations. The generated `.knowledge/index.json` contains the entity graph; `.knowledge/ontology/coverage.json` reports missing layers. Run the canonical builder under `.devspark/scripts/` to regenerate or check them. See `../ontology/schema.md` for the DevSpark 9.2 contract.
