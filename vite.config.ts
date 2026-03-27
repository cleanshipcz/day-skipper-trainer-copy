import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Override NODE_ENV for test runs.
 *
 * Vitest uses `process.env.NODE_ENV ??= "test"` — the nullish-coalesce
 * assignment does NOT override an existing value.  CI runners commonly set
 * NODE_ENV=production, which causes two failures:
 *
 *   1. React's CJS jsx-dev-runtime loads the production bundle that lacks
 *      `jsxDEV` — but the SWC plugin always emits `jsxDEV()` in serve mode.
 *   2. React's production build disables `act()` which @testing-library
 *      requires for every render/renderHook call.
 *
 * Setting NODE_ENV here — before any React module is required — ensures the
 * development bundle is loaded.  `process.env.VITEST` is set by the Vitest
 * CLI before this file is evaluated.
 */
if (process.env.VITEST === "true" && process.env.NODE_ENV === "production") {
  process.env.NODE_ENV = "test";
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: [],
    /**
     * Global teardown prevents CI timeout caused by lingering handles.
     * Vitest 4.x does not call process.exit() after a successful run —
     * it relies on the event loop draining.  Lingering handles (from
     * Vite's transform pipeline or worker IPC) prevent draining.
     */
    globalTeardown: "./vitest-global-teardown.ts",
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/*.integration.test.*",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-tabs", "lucide-react"],
        },
      },
    },
  },
}));
