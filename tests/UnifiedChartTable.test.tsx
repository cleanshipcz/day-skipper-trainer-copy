import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UnifiedChartTable from "@/components/navigation/unified/UnifiedChartTable";

const observations = [
  ["Headland Light", "306.9", "126.9", 100, 150],
  ["North Buoy", "34.3", "214.3", 450, 80],
  ["Island Beacon", "104.0", "284.0", 500, 350],
] as const;

const tapChart = (svg: SVGSVGElement, clientX: number, clientY: number) => {
  fireEvent.click(svg, { clientX, clientY });
};

describe("UnifiedChartTable", () => {
  it("requires sight, correction and unique reciprocal plotting before a terminal fix", async () => {
    const user = userEvent.setup();
    const { container } = render(<UnifiedChartTable />);
    const svg = container.querySelector("svg.bg-white") as SVGSVGElement;
    Object.defineProperty(svg, "getBoundingClientRect", { value: () => ({ left: 0, top: 0, width: 800, height: 500 }) });

    for (const [name, trueBearing, reciprocalBearing, x, y] of observations) {
      await user.click(screen.getByRole("button", { name: `Sight ${name}` }));
      await user.clear(screen.getByLabelText("Corrected true bearing"));
      await user.type(screen.getByLabelText("Corrected true bearing"), trueBearing);
      await user.click(screen.getByRole("button", { name: "Record corrected sight" }));
      await user.clear(screen.getByLabelText("Reciprocal bearing"));
      await user.type(screen.getByLabelText("Reciprocal bearing"), reciprocalBearing);
      tapChart(svg, x, y);
    }
    expect(screen.getByText(/Fix complete — 1042/i)).toBeDefined();
    expect(screen.getByText(/Calculated position: \((?:299|300)\.\d, (?:299|300)\.\d\)/i)).toBeDefined();
    expect(screen.getByText(/independently computed scenario position/i)).toBeDefined();
  });

  it("rejects the forward bearing and gives actionable reciprocal feedback", async () => {
    const user = userEvent.setup();
    const { container } = render(<UnifiedChartTable />);
    const svg = container.querySelector("svg.bg-white") as SVGSVGElement;
    Object.defineProperty(svg, "getBoundingClientRect", { value: () => ({ left: 0, top: 0, width: 800, height: 500 }) });
    await user.click(screen.getByRole("button", { name: "Sight Headland Light" }));
    await user.type(screen.getByLabelText("Corrected true bearing"), "306.9");
    await user.click(screen.getByRole("button", { name: "Record corrected sight" }));
    await user.type(screen.getByLabelText("Reciprocal bearing"), "306.9");
    tapChart(svg, 100, 150);
    expect(screen.getByText(/bearing to the object.*reciprocal 126.9°T/i)).toBeDefined();
  });

  it.each([375, 768, 1280, 1600])("retains chart controls at %ipx/high zoom equivalent", (width) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    render(<UnifiedChartTable />);
    expect(screen.getByRole("button", { name: "Open full screen chart" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Reset" })).toBeDefined();
    expect(screen.getByText(/Sight → record\/correct → plot/i)).toBeDefined();
  });
});
