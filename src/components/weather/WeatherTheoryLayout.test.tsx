// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WeatherTheoryLayout } from "./WeatherTheoryLayout";

const saveProgress = vi.fn().mockResolvedValue(true);
const loadProgress = vi.fn().mockResolvedValue(null);
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({ loadProgress, saveProgress }),
}));

describe("WeatherTheoryLayout", () => {
  beforeEach(() => {
    saveProgress.mockReset().mockResolvedValue(true);
    loadProgress.mockReset().mockResolvedValue(null);
  });

  it("persists completion and awards points once the action succeeds", async () => {
    render(<MemoryRouter><WeatherTheoryLayout title="Test weather" subtitle="Test" topicId="weather-test" sections={[{ title: "Pressure", body: <p>Content</p> }]} /></MemoryRouter>);
    const action = await screen.findByRole("button", { name: /mark theory complete/i });
    fireEvent.click(action);
    await vi.waitFor(() => {
      expect(saveProgress).toHaveBeenCalledWith("weather-test", true, 100, 10, { completionState: "completed" });
      expect((screen.getByRole("button", { name: /completed/i }) as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it("does not show completion or award again when persistence fails or the user is logged out", async () => {
    saveProgress.mockResolvedValue(false);
    render(<MemoryRouter><WeatherTheoryLayout title="Test" subtitle="Test" topicId="weather-test" sections={[]} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: /mark theory complete/i }));
    await vi.waitFor(() => {
      expect(saveProgress).toHaveBeenCalledOnce();
      expect(screen.queryByRole("button", { name: /completed/i })).toBeNull();
      expect((screen.getByRole("button", { name: /mark theory complete/i }) as HTMLButtonElement).disabled).toBe(false);
    });
  });

  it("restores persisted completion and prevents another award", async () => {
    loadProgress.mockResolvedValue({ completed: true });
    render(<MemoryRouter><WeatherTheoryLayout title="Test" subtitle="Test" topicId="weather-test" sections={[]} /></MemoryRouter>);
    const action = await screen.findByRole("button", { name: /completed/i });
    expect((action as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(action);
    expect(saveProgress).not.toHaveBeenCalled();
  });

  it("blocks rapid duplicate activation while the first save is in flight", async () => {
    let resolveSave!: (saved: boolean) => void;
    saveProgress.mockReturnValue(new Promise<boolean>((resolve) => {
      resolveSave = resolve;
    }));
    render(<MemoryRouter><WeatherTheoryLayout title="Test" subtitle="Test" topicId="weather-test" sections={[]} /></MemoryRouter>);
    const action = await screen.findByRole("button", { name: /mark theory complete/i });
    fireEvent.click(action);
    fireEvent.click(action);
    expect(saveProgress).toHaveBeenCalledOnce();
    expect((screen.getByRole("button", { name: /saving completion/i }) as HTMLButtonElement).disabled).toBe(true);
    resolveSave(true);
    await screen.findByRole("button", { name: /completed/i });
    expect(saveProgress).toHaveBeenCalledOnce();
  });

  it("uses mobile-first controls and a responsive two-column content grid", () => {
    const { container } = render(<MemoryRouter><WeatherTheoryLayout title="Responsive" subtitle="Test" topicId="weather-test" sections={[{ title: "One", body: "One" }, { title: "Two", body: "Two" }]} /></MemoryRouter>);
    expect(container.querySelector(".grid.md\\:grid-cols-2")).toBeTruthy();
    expect(container.querySelector(".flex.flex-col.sm\\:flex-row")).toBeTruthy();
  });
});
