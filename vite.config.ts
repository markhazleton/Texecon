import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { execSync } from "node:child_process";

// Build ID generator: prefer git short SHA, fallback to timestamp
function getBuildId(): string {
  try {
    const sha = execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    if (sha) return sha;
  } catch (_) {
    // ignore
  }
  return new Date().toISOString().replace(/[-:.TZ]/g, "");
}

// Vite plugin to append ?v=BUILD_ID to static links in index.html and emit version.json
function cacheBusterPlugin(buildId: string): Plugin {
  const versionParam = `v=${buildId}`;
  const targetFiles = [
    "favicon.ico",
    "favicon.svg",
    "browserconfig.xml",
    "site.webmanifest",
    "sitemap.xml",
  ];
  const faviconPngPattern = /favicon-\d{2,3}x\d{2,3}\.png/gi;

  const addOrReplaceVersion = (input: string): string => {
    // Replace explicit targets
    let html = input;
    for (const name of targetFiles) {
      const re = new RegExp(`(${name})(?:\\?[^"'\\s>]*)?`, "gi");
      html = html.replace(re, `$1?${versionParam}`);
    }
    // Replace/append for all favicon-*.png
    html = html.replace(faviconPngPattern, (m) => `${m}?${versionParam}`);
    // If a v param already exists, normalize it to the current buildId
    html = html.replace(/(\?v=)[^"'\\s>]+/gi, `$1${buildId}`);
    return html;
  };

  return {
    name: "cache-buster-plugin",
    enforce: "post",
    transformIndexHtml(html) {
      return addOrReplaceVersion(html);
    },
    generateBundle() {
      const payload = {
        buildId,
        buildTime: new Date().toISOString(),
      };
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify(payload, null, 2),
      });
    },
  };
}

export default defineConfig({
  plugins: (() => {
    const buildId = process.env.BUILD_ID || getBuildId();
    return [
      react(),
      tailwindcss(),
      cacheBusterPlugin(buildId),
      {
        name: "inject-build-id-define",
        config: () => ({
          define: {
            __BUILD_ID__: JSON.stringify(buildId),
          },
        }),
      },
    ];
  })(),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  base: process.env.VITE_BASE_PATH || "/",
  build: {
    // Allow overriding output directory via TARGET_DIR env var; default to 'target'
    outDir: path.resolve(
      import.meta.dirname,
      process.env.TARGET_DIR || "target"
    ),
    emptyOutDir: true,
    manifest: true,
  },
});
