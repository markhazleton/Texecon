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
			const res = await fetch(`${import.meta.env.BASE_URL || "/"}version.json`, {
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
		} catch (_) {
			// ignore transient errors
		}
	}

	// Initial check shortly after load, then poll
	setTimeout(check, 5_000);
	const timer = setInterval(check, intervalMs);
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
