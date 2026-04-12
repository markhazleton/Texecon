# GitHub Pages Workflow Review (2025-09-03)

This document reviews and refines the GitHub Actions workflow for deploying the TexEcon site to GitHub Pages.

## Summary of Improvements Applied

- Least-privilege permissions per job (removed broad workflow-level permissions).
- Concurrency set to cancel in-progress runs to avoid overlapping deploys.
- Node 20 with npm cache + lockfile path for faster, reproducible installs.
- CI and NODE_ENV=production set at job scope for deterministic builds.
- Added TypeScript type-check step before build to catch errors early.
- Robust Vite base path handling via VITE_BASE_PATH derived from repo name unless a custom domain CNAME is present.
- Explicit timeout on build job (15 min) to prevent hung workflows.

See `.github/workflows/deploy.yml` for changes.

## Best Practices Checklist

- Triggers
  - Build on push to `main`, PRs, and manual dispatch; deploy only from `main`.
- Permissions
  - Build job: `contents: read` only.
  - Deploy job: `pages: write` and `id-token: write` only.
- Build
  - Use `npm ci` with `package-lock.json` cached.
  - Run `npm run type-check` before `npm run build`.
  - Export `VITE_BASE_PATH` based on CNAME or repo path (project pages) before build.
- GitHub Pages
  - `actions/configure-pages` + `actions/upload-pages-artifact` + `actions/deploy-pages`.
  - Concurrency enabled with cancel-in-progress.
- Artifacts
  - Upload `./dist` only.

## Notes and Recommendations

- Vite base path
  - The workflow now injects `VITE_BASE_PATH` so assets and routes resolve correctly for project pages under `/<repo>/`.
  - If/when a `client/public/CNAME` is added for a custom domain, base path automatically becomes `/`.
- Sitemap and robots.txt
  - Current generator hardcodes `https://texecon.com`. If you deploy without a custom domain, consider parameterizing base URL (e.g., `SITE_BASE_URL`) and set it in the workflow similar to `VITE_BASE_PATH`.
- Optional preview deploys for PRs
  - You can add a separate job to deploy preview sites for PRs using `actions/deploy-pages` with preview mode (if enabled for the repo). Not enabled here to keep mainline simple.
- Node version policy
  - Pin to Node 20 LTS. Consider a scheduled job to validate against upcoming LTS.

## Validation

- YAML validated by inspection; Ubuntu runner will handle `npm ci` without Windows-specific file lock issues.
- The site includes `client/public/404.html` for client-side routing fallback.

## Next Steps (Optional)

1. Parameterize sitemap/robots with `SITE_BASE_URL` and set it in the workflow (CNAME-aware).
2. Add a lightweight link checker or HTML proofer as a separate CI job (non-blocking).
3. Enable PR preview deploys if desired.
