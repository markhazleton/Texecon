---
id: github-pages-publishing-business
type: entity-layer
title: Github Pages Publishing Business
layer: business
source_of_truth:
- .github/workflows/deploy.yml
- .knowledge/governance/constitution.md
last_verified: '2026-10-21'
---

# Github Pages Publishing Business

Publishing provides a static, publicly crawlable website at texecon.com. A deployment must include the generated application, sitemap, robots file, and version metadata. Pull requests validate the artifact without publishing it.

The main branch publishes through GitHub Pages; custom-domain configuration is part of the artifact contract.
