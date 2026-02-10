import { describe, expect, it } from "vitest";
import { appRoutes } from "./routes";

describe("appRoutes", () => {
  it("contains unique route paths", () => {
    const paths = appRoutes.map((route) => route.path);
    const unique = new Set(paths);

    expect(unique.size).toBe(paths.length);
  });

  it("defines lazy route factories for top-level feature routes", () => {
    const topLevelRoutes = ["/nautical-terms", "/rules-of-the-road", "/navigation", "/safety"];

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
});
