---
id: github-pages-publishing-integration
type: entity-layer
title: Github Pages Publishing Integration
layer: integration
source_of_truth:
- .github/workflows/deploy.yml
- vite.config.ts
last_verified: '2026-10-21'
---

# Github Pages Publishing Integration

The build job supplies VITE_BASE_PATH and SITE_BASE_URL to the content and Vite pipelines. Pull requests use the owner/repository Pages URL; production uses CUSTOM_DOMAIN=texecon.com and writes client/public/CNAME.

The upload-pages-artifact action packages target/. The deploy job uses Pages and OIDC permissions to publish that artifact. Lighthouse downloads the same artifact in a separate job.
