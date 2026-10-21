---
id: memorial-site-operations
type: entity-layer
title: Memorial Site Operations
layer: operations
source_of_truth:
- package.json
- client/src/memorial/MemorialHome.tsx
- scripts/generate-static-pages.js
last_verified: '2026-10-20'
---

# Memorial Site Operations

Edit memorial components and their supporting data, then run npm run lint, npm run type-check, npm run test:run and npm run build. Preview the root page and dedicated biography, genealogy and gallery routes after changes.

The static page generator emits crawlable memorial routes into target/. Keep generated content and runtime routes aligned; regenerate output through the build scripts.
