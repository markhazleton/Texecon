# GitHub Pages Publishing

GitHub Actions runs the Texecon publishing workflow on `main` pushes, pull requests targeting `main`, and manual dispatches. The build job installs Node.js 20, fetches content, runs quality checks, builds the site, generates static route pages, and validates the required files in `target/`.

Pull requests validate project-pages paths using `/<repository>/` and `https://<owner>.github.io/<repository>`. Non-PR builds with `CUSTOM_DOMAIN=texecon.com` use `/`, generate `client/public/CNAME`, upload `target/` as the Pages artifact, run Lighthouse, and deploy from `main`.

The publishing inputs are the WebSpark CMS payload fetched by `scripts/fetch-content.js`, the generated cache files under `client/src/data/`, and the route data read by the sitemap and static-page generators. A failed CMS request can use the existing processed cache, allowing a build to continue with previously fetched content when that cache is available.

## Required artifact contract

- `target/index.html`
- `target/version.json`
- `target/sitemap.xml`
- `target/robots.txt`

The workflow also verifies that sitemap URLs contain the expected site base URL and that production CNAME content matches the configured custom domain.

## Evidence

- `.github/workflows/deploy.yml`
- `scripts/fetch-content.js`
- `client/src/data/webspark-raw.json`
- `client/src/data/texecon-content.json`
- `vite.config.ts`
- `package.json`
