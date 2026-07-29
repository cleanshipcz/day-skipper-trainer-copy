// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WeatherTheoryLayout } from "./WeatherTheoryLayout";

const saveProgress = vi.fn().mockResolvedValue(true);
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({ saveProgress }),
}));

describe("WeatherTheoryLayout", () => {
  beforeEach(() => saveProgress.mockClear());

  it("persists completion and awards points once the action succeeds", async () => {
    render(<MemoryRouter><WeatherTheoryLayout title="Test weather" subtitle="Test" topicId="weather-test" sections={[{ title: "Pressure", body: <p>Content</p> }]} /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: /mark theory complete/i }));
    await vi.waitFor(() => {
      expect(saveProgress).toHaveBeenCalledWith("weather-test", true, 100, 10, { completionState: "completed" });
      expect((screen.getByRole("button", { name: /completed/i }) as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it("uses mobile-first controls and a responsive two-column content grid", () => {
    const { container } = render(<MemoryRouter><WeatherTheoryLayout title="Responsive" subtitle="Test" topicId="weather-test" sections={[{ title: "One", body: "One" }, { title: "Two", body: "Two" }]} /></MemoryRouter>);
    expect(container.querySelector(".grid.md\\:grid-cols-2")).toBeTruthy();
    expect(container.querySelector(".flex.flex-col.sm\\:flex-row")).toBeTruthy();
  });
});
