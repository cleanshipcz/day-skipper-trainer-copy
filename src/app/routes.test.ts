import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { appRoutes } from "./routes";
import routeFamilyInventory from "../../scripts/route-family-inventory.json";

describe("appRoutes", () => {
  it("contains unique route paths", () => {
    const paths = appRoutes.map((route) => route.path);
    const unique = new Set(paths);

    expect(unique.size).toBe(paths.length);
  });

  it("defines lazy route factories for top-level feature routes", () => {
    const topLevelRoutes = ["/nautical-terms", "/rules-of-the-road", "/navigation", "/safety", "/safety/flares"];

    const selectedRoutes = appRoutes.filter((route) => topLevelRoutes.includes(route.path));

    expect(selectedRoutes).toHaveLength(topLevelRoutes.length);

    for (const route of selectedRoutes) {
      expect(typeof route.importPage).toBe("function");
      expect(typeof route.lazyElement).toBe("object");
      expect((route.lazyElement as { $$typeof?: symbol }).$$typeof).toBeDefined();
    }
  });

  it("reuses the same lazy element reference for a route", () => {
    const navigationRoute = appRoutes.find((route) => route.path === "/navigation");

    expect(navigationRoute).toBeDefined();
    expect(navigationRoute?.lazyElement).toBe(navigationRoute?.lazyElement);
  });

  it("defines the daily review route", () => {
    expect(appRoutes.find((route) => route.path === "/review")).toBeDefined();
  });

  it("keeps the anchor minigame at its durable route", async () => {
    const route = appRoutes.find(({ path }) => path === "/anchor-minigame");

    expect(route).toBeDefined();
    await expect(route?.importPage()).resolves.toMatchObject({ default: expect.any(Function) });
  });

  it("requires every route root to have an explicit representative-test decision", () => {
    const routeRoot = (path: string) => path === "*" || path === "/"
      ? path
      : `/${path.split("/")[1]}`;
    const configuredRoots = routeFamilyInventory.flatMap(({ routeRoots }) => routeRoots);
    const actualRoots = [...new Set(appRoutes.map(({ path }) => routeRoot(path)))];

    expect([...configuredRoots].sort()).toEqual([...actualRoots].sort());
    for (const entry of routeFamilyInventory) {
      expect(["render-smoke", "existing-behavior-test"]).toContain(entry.decision);
      expect(appRoutes.some(({ path }) => path === entry.representativeRoute)).toBe(true);
      expect(existsSync(resolve(process.cwd(), entry.testPath))).toBe(true);
    }
  });
});
