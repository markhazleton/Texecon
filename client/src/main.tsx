import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Accessibility testing in development
if (import.meta.env.DEV) {
  import("@axe-core/react").then((axe) => {
    axe.default(React, createRoot, 1000, {
      rules: [
        {
          id: "color-contrast",
          enabled: true,
        },
      ],
    });
  });
}

// Lightweight runtime version check – reloads when a new build is published
declare const __BUILD_ID__: string;

function startVersionWatcher() {
  const intervalMs = 60_000; // 1 minute
  const controller = new AbortController();
  const currentId = (typeof __BUILD_ID__ !== "undefined" && __BUILD_ID__) || "dev";

  async function check() {
    try {
      // Append a unique query param so the CDN (not just the browser) treats
      // this as a fresh URL instead of serving an edge-cached version.json.
      const versionUrl = `${import.meta.env.BASE_URL || "/"}version.json?_=${Date.now()}`;
      const res = await fetch(versionUrl, {
        cache: "no-store",
        signal: controller.signal,
        headers: { "cache-control": "no-cache" },
      });
      if (!res.ok) return;
      const data: { buildId?: string } = await res.json().catch(() => ({}));
      if (data?.buildId && data.buildId !== currentId) {
        // Bust caches and reload
        const loc = window.location;
        const url = new URL(loc.href);
        url.searchParams.set("_", String(Date.now()));
        window.location.replace(url.toString());
      }
    } catch {
      // ignore transient errors
    }
  }

  // Initial check shortly after load, then poll
  setTimeout(check, 1_000);
  const timer = setInterval(check, intervalMs);

  // A normal reload or new tab reruns this module, but a page restored from
  // the browser's back/forward cache (bfcache) does not — that's the case
  // that otherwise requires a manual Ctrl+F5 to pick up new content.
  window.addEventListener("pageshow", (event: PageTransitionEvent) => {
    if (event.persisted) check();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") check();
  });

  // Firefox and Safari skip bfcache entirely for pages with an `unload`
  // listener, forcing a real network navigation (and therefore a fresh
  // HTTP cache check) on every back/forward instead of restoring a frozen
  // snapshot. Chrome ignores this (its bfcache is handled by the pageshow
  // listener above instead), so this is a no-op there, not a regression.
  window.addEventListener("unload", () => {});

  window.addEventListener("beforeunload", () => {
    controller.abort();
    clearInterval(timer);
  });
}

if (import.meta.env.PROD) startVersionWatcher();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
