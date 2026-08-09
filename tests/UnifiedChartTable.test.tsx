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
    expect(screen.getByText(/Fix passed — 1042/i)).toBeDefined();
    expect(screen.getByText(/Calculated position: \((?:299|300)\.\d, (?:299|300)\.\d\)/i)).toBeDefined();
    expect(screen.getByText(/independently specified scenario position/i)).toBeDefined();
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

  it("rejects observations outside the common-time sequence and reset clears edited evidence", async () => {
    const user = userEvent.setup();
    render(<UnifiedChartTable />);
    await user.click(screen.getByRole("button", { name: "Sight Headland Light" }));
    await user.clear(screen.getByLabelText("Observation time"));
    await user.type(screen.getByLabelText("Observation time"), "1040");
    await user.type(screen.getByLabelText("Corrected true bearing"), "306.9");
    await user.click(screen.getByRole("button", { name: "Record corrected sight" }));
    expect(screen.getByText(/1040, log 18.6: Headland Light/i)).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Sight North Buoy" }));
    await user.clear(screen.getByLabelText("Observation time"));
    await user.type(screen.getByLabelText("Observation time"), "1043");
    await user.type(screen.getByLabelText("Corrected true bearing"), "34.3");
    await user.click(screen.getByRole("button", { name: "Record corrected sight" }));
    expect(screen.getByText(/Stay within 2 minutes and 0.3 NM/i)).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.queryByText(/1040, log 18.6: Headland Light/i)).toBeNull();
    await user.click(screen.getByRole("button", { name: "Sight Headland Light" }));
    expect((screen.getByLabelText("Observation time") as HTMLInputElement).value).toBe("1042");
    expect((screen.getByLabelText("Log reading") as HTMLInputElement).value).toBe("18.6");
  });

  it("announces and styles an out-of-tolerance assessment as failure", async () => {
    const user = userEvent.setup();
    const { container } = render(<UnifiedChartTable />);
    const svg = container.querySelector("svg.bg-white") as SVGSVGElement;
    Object.defineProperty(svg, "getBoundingClientRect", { value: () => ({ left: 0, top: 0, width: 800, height: 500 }) });
    const biased = [
      ["Headland Light", "306.9", "128.8", 100, 150],
      ["North Buoy", "34.3", "212.4", 450, 80],
      ["Island Beacon", "104.0", "285.9", 500, 350],
    ] as const;
    for (const [name, trueBearing, reciprocalBearing, x, y] of biased) {
      await user.click(screen.getByRole("button", { name: `Sight ${name}` }));
      await user.clear(screen.getByLabelText("Corrected true bearing"));
      await user.type(screen.getByLabelText("Corrected true bearing"), trueBearing);
      await user.click(screen.getByRole("button", { name: "Record corrected sight" }));
      await user.clear(screen.getByLabelText("Reciprocal bearing"));
      await user.type(screen.getByLabelText("Reciprocal bearing"), reciprocalBearing);
      tapChart(svg, x, y);
    }
    const failure = screen.getByText(/Assessment failed — 1042/i).parentElement as HTMLElement;
    expect(failure.className).toContain("border-red-600");
    expect(screen.queryByText(/Fix passed/i)).toBeNull();
    expect(screen.getByText(/reset and retry/i)).toBeDefined();
  });

  it.each([375, 768, 1280, 1600])("retains chart controls at %ipx/high zoom equivalent", (width) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    render(<UnifiedChartTable />);
    expect(screen.getByRole("button", { name: "Open full screen chart" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Reset" })).toBeDefined();
    expect(screen.getByText(/Sight → record\/correct → plot/i)).toBeDefined();
  });
});
