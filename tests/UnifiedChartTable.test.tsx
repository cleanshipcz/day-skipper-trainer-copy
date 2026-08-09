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
    expect(document.activeElement?.textContent).toContain("Fix passed — 1042");
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

  it("keeps the learner's accepted corrected bearing as the recorded evidence", async () => {
    const user = userEvent.setup();
    const { container } = render(<UnifiedChartTable />);
    const svg = container.querySelector("svg.bg-white") as SVGSVGElement;
    Object.defineProperty(svg, "getBoundingClientRect", { value: () => ({ left: 0, top: 0, width: 800, height: 500 }) });
    await user.click(screen.getByRole("button", { name: "Sight Headland Light" }));
    await user.type(screen.getByLabelText("Corrected true bearing"), "306.5");
    await user.click(screen.getByRole("button", { name: "Record corrected sight" }));
    expect(screen.getByText(/Headland Light 311.9°M → 306.5°T/i)).toBeDefined();
    await user.type(screen.getByLabelText("Reciprocal bearing"), "126.5");
    tapChart(svg, 100, 150);
    expect(screen.getByText(/LOP 1 accepted/i)).toBeDefined();
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
    await user.click(screen.getByRole("button", { name: "Reset exercise" }));
    expect(screen.queryByText(/1040, log 18.6: Headland Light/i)).toBeNull();
    await user.click(screen.getByRole("button", { name: "Sight Headland Light" }));
    expect((screen.getByLabelText("Observation time") as HTMLInputElement).value).toBe("1042");
    expect((screen.getByLabelText("Log reading") as HTMLInputElement).value).toBe("18.6");
  });

  it("accepts a near-common-time sequence across midnight", async () => {
    const user = userEvent.setup();
    render(<UnifiedChartTable />);
    await user.click(screen.getByRole("button", { name: "Sight Headland Light" }));
    await user.clear(screen.getByLabelText("Observation time"));
    await user.type(screen.getByLabelText("Observation time"), "2359");
    await user.type(screen.getByLabelText("Corrected true bearing"), "306.9");
    await user.click(screen.getByRole("button", { name: "Record corrected sight" }));
    await user.click(screen.getByRole("button", { name: "Sight North Buoy" }));
    await user.clear(screen.getByLabelText("Observation time"));
    await user.type(screen.getByLabelText("Observation time"), "0000");
    await user.type(screen.getByLabelText("Corrected true bearing"), "34.3");
    await user.click(screen.getByRole("button", { name: "Record corrected sight" }));
    expect(screen.getByText(/0000, log 18.6: North Buoy/i)).toBeDefined();
    expect(screen.queryByText(/Stay within 2 minutes/i)).toBeNull();
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

  it("declares mobile-first wrapping, touch-target and desktop-only enlargement layout contracts", async () => {
    const user = userEvent.setup();
    render(<UnifiedChartTable />);
    expect(screen.getByRole("button", { name: "Enlarge chart inline" }).className).toContain("hidden");
    expect(screen.getByRole("button", { name: "Enlarge chart inline" }).className).toContain("lg:inline-flex");
    expect(screen.getByRole("button", { name: "Reset exercise" }).className).toContain("min-h-11");
    await user.click(screen.getByRole("button", { name: "Sight Headland Light" }));
    expect(screen.getByLabelText("Observation time").parentElement?.parentElement?.className).toContain("grid-cols-1");
  });

  it("exposes named state, chart description and a keyboard-equivalent precise plot", async () => {
    const user = userEvent.setup();
    render(<UnifiedChartTable />);
    const sight = screen.getByRole("button", { name: "Sight Headland Light" });
    expect(sight.getAttribute("aria-pressed")).toBe("false");
    sight.focus();
    await user.keyboard("{Enter}");
    expect(sight.getAttribute("aria-pressed")).toBe("true");
    await user.type(screen.getByLabelText("Corrected true bearing"), "306.9");
    await user.click(screen.getByRole("button", { name: "Record corrected sight" }));
    expect(document.activeElement).toBe(screen.getByLabelText("Reciprocal bearing"));
    await user.type(screen.getByLabelText("Reciprocal bearing"), "126.9");
    const precise = screen.getByRole("button", { name: "Plot selected sight precisely" });
    precise.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText(/LOP 1 accepted/i)).toBeDefined();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Sight North Buoy" }));
    expect(screen.getByText(/Headland Light: 126.9°T reciprocal/i)).toBeDefined();
    const chart = screen.getByRole("img", { name: "Position-fix practice chart" });
    expect(chart.getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.getByText(/Practice chart with three fixed objects/i)).toBeDefined();
  });

  it("reports inline enlargement with stable expanded and pressed state", async () => {
    const user = userEvent.setup();
    render(<UnifiedChartTable />);
    const enlarge = screen.getByRole("button", { name: "Enlarge chart inline" });
    expect(enlarge.getAttribute("aria-expanded")).toBe("false");
    expect(enlarge.getAttribute("aria-pressed")).toBe("false");
    await user.click(enlarge);
    expect(enlarge.getAttribute("aria-expanded")).toBe("true");
    expect(enlarge.getAttribute("aria-pressed")).toBe("true");
    expect(enlarge.getAttribute("aria-controls")).toBe("position-chart-region");
    const layout = document.querySelector('[data-layout="expanded"]') as HTMLElement;
    expect(layout.className).toContain("grid-cols-1");
    expect(document.getElementById("position-chart-region")?.className).toContain("order-1");
    expect((document.querySelector("[data-workflow-controls]") as HTMLElement).className).toContain("order-2");
  });

  it("allocates unique chart description targets for multiple exercises", () => {
    render(<><UnifiedChartTable /><UnifiedChartTable /></>);
    const charts = screen.getAllByRole("img", { name: "Position-fix practice chart" });
    const ids = charts.map((chart) => chart.getAttribute("aria-describedby"));
    expect(ids[0]).toBeTruthy();
    expect(ids[1]).toBeTruthy();
    expect(ids[0]).not.toBe(ids[1]);
    expect(document.getElementById(ids[0] as string)).toBeDefined();
    expect(document.getElementById(ids[1] as string)).toBeDefined();
  });
});
