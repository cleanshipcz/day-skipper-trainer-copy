import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import coverageScope from "./scripts/coverage-scope.json";

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
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.ico", "images/**/*.png"],
      manifest: {
        name: "RYA Day Skipper Trainer",
        short_name: "Day Skipper",
        description: "Offline-ready RYA Day Skipper theory, quizzes and progress tracking.",
        theme_color: "#203b5e",
        background_color: "#f8fafc",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/favicon.ico", sizes: "256x256", type: "image/x-icon", purpose: "any" },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Quiz banks are fetched and runtime-cached only when a learner needs
        // them. Pre-caching them here would turn code splitting into an
        // install-time bulk download.
        globIgnores: [
          "**/{nauticalTerms,ropework,anchorwork,victualling,engine,rig,colregs,lightsSignals,safetyMob,safetyFire,safetyLifeRaft,safetyFlares,safety,pilotage,weather,passagePlanning}-*.js",
        ],
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.destination === "document"
              || request.destination === "script"
              || /\.(?:css|json|png|svg|woff2?)$/i.test(url.pathname),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "theory-and-on-demand-quiz-content" },
          },
        ],
      },
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
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
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "./coverage",
      include: coverageScope.files,
      thresholds: {
        perFile: true,
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    manifest: "manifest.json",
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
