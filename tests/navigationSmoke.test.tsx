// Basic smoke test to ensure components render without crashing
import { describe, it } from "vitest";
import { render } from "@testing-library/react";
import VirtualChartPlotter from "@/components/navigation/VirtualChartPlotter";
import UnifiedChartTable from "@/components/navigation/unified/UnifiedChartTable";

describe("Navigation Components Smoke Test", () => {
  it("renders VirtualChartPlotter without crashing", () => {
    // We mock ResizeObserver because ChartSurface uses getMyBoundingClientRect logic via refs which requires layout
    // In jsdom this is often mocked.
    // But basic crash test of "is it defined" is better than nothing.
    // Actually, VirtualChartPlotter uses ChartSurface which uses forwardRef.
    // If the import is missing, this would fail at compile or runtime.
    render(<VirtualChartPlotter />);
  });

  it("renders UnifiedChartTable without crashing", () => {
    render(<UnifiedChartTable />);
  });
});
