---
id: memorial-site-integration
type: entity-layer
title: Memorial Site Integration
layer: integration
source_of_truth:
- client/src/App.tsx
- client/src/memorial/MemorialHome.tsx
- client/src/memorial/components/layout/Navbar.tsx
last_verified: '2026-10-20'
---

# Memorial Site Integration

App.tsx selects MemorialHome at the root route and the memorial alias. Wouter also selects dedicated biography, genealogy and gallery components. Legacy memorial URLs redirect to the current destination.

MemorialHome supplies profile, person, page and event structured data through SEOHead. Navbar uses the Vite base URL for navigation and switches between local scrolling and home-page anchors according to the current page.
