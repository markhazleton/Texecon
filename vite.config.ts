import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
  },
});
