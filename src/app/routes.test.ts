import { describe, expect, it } from "vitest";
import { appRoutes, toLazyRouteElement } from "./routes";

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
      const lazyComponent = toLazyRouteElement(route);
      expect(typeof route.importPage).toBe("function");
      expect(typeof lazyComponent).toBe("object");
      expect((lazyComponent as { $$typeof?: symbol }).$$typeof).toBeDefined();
    }
  });
});
