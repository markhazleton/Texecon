# GitHub Pages Workflow Best Practices (2025-09-03)

This document summarizes the best-practice CI + Deploy workflow for publishing the TexEcon site to GitHub Pages using Vite + React + TypeScript.

## What’s Implemented

- Multi-job workflow: build on all pushes/PRs; deploy only on main and non-PR events.
- Least-privilege permissions: repo read globally; Pages + OIDC only on deploy job.
- Concurrency guard: ensures non-overlapping Pages deployments.
- Reproducible Node setup: Node 20 with npm cache keyed to package-lock.
- Dev dependency install: uses `npm ci --include=dev` so type-check (`tsc`) has `@types/node` and `vite` types.
- SPA base path detection: sets `VITE_BASE_PATH` dynamically based on presence of `client/public/CNAME`.
- CI gates: type-check before build; build artifacts uploaded for deployment via `actions/upload-pages-artifact`.

## How to Customize

- Node version: change `node-version` in `actions/setup-node` if you standardize on a different LTS.
- Add lint/tests: add `npm run lint`/`npm test` steps if/when configured.
- Content steps: `npm run refresh:content` and `npm run generate:sitemap` are executed inside `npm run build` already; adjust if you want separate timing or caching.
- Custom domain: add `client/public/CNAME` to switch base path to `/` automatically.

## Troubleshooting

- Type definitions missing: Ensure `npm ci --include=dev` is used in CI so devDependencies are installed.
- 404s on deep links: Confirm `client/public/404.html` exists (it does) and Vite `base` matches `VITE_BASE_PATH`.
- Asset base path issues: Verify `VITE_BASE_PATH` flows into `vite.config.ts` `base` setting.

## Security Notes

- Deploy job uses GitHub OIDC with least-privilege Pages permissions.
- No PATs or secrets are required for Pages deploy.

## Next Steps

- Add ESLint + Prettier and a `lint` CI step.
- Add bundle-size check and Lighthouse CI for Pages previews (optional).
- Matrix test for Node 20/22 across PRs (optional).
