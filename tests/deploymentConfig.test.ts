import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

interface VercelConfig {
  routes?: unknown;
  rewrites?: Array<{ source?: string; destination?: string }>;
}

describe("Vercel deployment routing", () => {
  it("serves client-side deep links through the SPA shell with filesystem precedence", () => {
    const config = JSON.parse(readFileSync("vercel.json", "utf8")) as VercelConfig;

    // Vercel rewrites check deployed files/functions first. Keeping this as a
    // rewrite (rather than a catch-all legacy route) protects generated assets
    // and functions while unmatched React Router paths receive the SPA shell.
    expect(config.routes).toBeUndefined();
    expect(config.rewrites).toEqual([
      { source: "/(.*)", destination: "/index.html" },
    ]);
  });
});
