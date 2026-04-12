# Custom domain (texecon.com) with GitHub Pages + Cloudflare DNS

This repo is configured to deploy a static site to GitHub Pages with a custom domain `texecon.com`.

## GitHub Actions changes

- Workflow sets `CUSTOM_DOMAIN=texecon.com` and writes `client/public/CNAME` automatically.
- Vite builds with `base=/` and `SITE_BASE_URL=https://texecon.com`.

## GitHub Pages settings (one-time portal steps)

1) In the repo Settings → Pages:
   - Source: GitHub Actions (already configured).
   - Custom domain: `texecon.com`.
   - Enforce HTTPS: enable after the domain verifies.

## Cloudflare DNS records

Create these two records in the Cloudflare DNS tab for the `texecon.com` zone:

1) APEX (root) domain
   - Type: A
   - Name: @
   - IPv4: 185.199.108.153
   - Add four A records for resiliency (GitHub Pages anycast):
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
   - Proxy status: Off (DNS only) until HTTPS certificate is issued. You can turn proxy back on after verification if desired; if issues arise, leave DNS only.

    Optional IPv6 (recommended if not using Cloudflare proxy):
    - Type: AAAA, Name: @, add all four:
       2606:50c0:8000::153
       2606:50c0:8001::153
       2606:50c0:8002::153
       2606:50c0:8003::153

2) Optional www redirect
   - Type: CNAME
   - Name: www
   - Target: `texecon.com`
   - Proxy status: Proxied or DNS only. If using Cloudflare page rules/redirects, keep proxied.

### Optional: Cloudflare Page Rule for www → apex

If you prefer a 301 redirect from `www.texecon.com` to `texecon.com`:

1) Rules → Redirect Rules → Create rule
2) If host equals `www.texecon.com` then Static redirect to `https://texecon.com/$1` with status 301.

## Verify and enable HTTPS

1) Push to main and wait for the Pages deploy to finish.
2) In GitHub Settings → Pages, ensure the custom domain validates. If not, re-check DNS.
3) Toggle “Enforce HTTPS” when available. It may take 5–30 minutes for the certificate to issue.

## Troubleshooting

- Domain not verified: Confirm A records match exactly, TTL is default/auto, and Cloudflare proxy is disabled during initial verification.
- Mixed content or broken asset paths: Ensure `VITE_BASE_PATH=/` is in effect (it is when CNAME or CUSTOM_DOMAIN is present).
- Sitemap/robots base URL: The workflow sets `SITE_BASE_URL=https://texecon.com` so `scripts/generate-sitemap.js` emits correct absolute URLs.
