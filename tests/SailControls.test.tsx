import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SailControls from "../src/pages/SailControls";
import TestRouter from "./TestRouter";

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({ saveProgress: vi.fn() }),
}));

vi.mock("@/contexts/AuthHooks", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("SailControls schematic geometry", () => {
  it("aligns the jib luff, halyard, sheet, and fairlead route with the forestay", () => {
    const { container } = render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );

    const jib = container.querySelector('[data-geometry="jib"]');
    const forestay = container.querySelector('[data-geometry="forestay"]');
    const jibHalyard = container.querySelector('[data-control-id="jib-halyard"]');
    const jibSheet = container.querySelector('[data-control-id="jib-sheet"]');

    expect(jib?.getAttribute("d")).toBe("M306,78 L500,540 L410,440 Z");
    expect(forestay?.getAttribute("x1")).toBe("300");
    expect(forestay?.getAttribute("y1")).toBe("60");
    expect(forestay?.getAttribute("x2")).toBe("520");
    expect(forestay?.getAttribute("y2")).toBe("560");
    expect(jibHalyard?.querySelector("line")?.getAttribute("x1")).toBe("306");
    expect(jibHalyard?.querySelector("line")?.getAttribute("y1")).toBe("78");
    expect(jibSheet?.querySelector("polyline")?.getAttribute("points")).toBe("410,440 490,520 500,550");
    expect(jibSheet?.querySelector("circle")?.getAttribute("cx")).toBe("410");
    expect(jibSheet?.querySelector("circle")?.getAttribute("cy")).toBe("440");
  });
});
