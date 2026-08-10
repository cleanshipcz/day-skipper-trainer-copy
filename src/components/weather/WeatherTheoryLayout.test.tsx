// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WeatherTheoryLayout } from "./WeatherTheoryLayout";

const saveProgressDetailed = vi.fn().mockResolvedValue("remote");
const loadProgressDetailed = vi.fn().mockResolvedValue({ status: "missing", record: null });
let ownerId: string | null = "owner-a";
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({ ownerId, loadProgressDetailed, saveProgressDetailed }),
}));

describe("WeatherTheoryLayout", () => {
  beforeEach(() => {
    saveProgressDetailed.mockReset().mockResolvedValue("remote");
    loadProgressDetailed.mockReset().mockResolvedValue({ status: "missing", record: null });
    ownerId = "owner-a";
    window.localStorage.clear();
  });

  it("persists completion once the action succeeds", async () => {
    render(<MemoryRouter><WeatherTheoryLayout title="Test weather" subtitle="Test" topicId="weather-test" sections={[{ title: "Pressure", body: <p>Content</p> }]} /></MemoryRouter>);
    const action = await screen.findByRole("button", { name: /mark theory complete/i });
    fireEvent.click(action);
    await vi.waitFor(() => {
      expect(saveProgressDetailed).toHaveBeenCalledWith("weather-test", true, 100, 10, { completionState: "completed" });
      expect((screen.getByRole("button", { name: /completed/i }) as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it("surfaces a non-retryable save failure and permits an explicit retry", async () => {
    saveProgressDetailed.mockImplementation((_topicId, completed) => Promise.resolve(completed ? "failed" : "remote"));
    render(<MemoryRouter><WeatherTheoryLayout title="Test" subtitle="Test" topicId="weather-test" sections={[]} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: /mark theory complete/i }));
    await vi.waitFor(() => {
      expect(saveProgressDetailed).toHaveBeenCalledWith("weather-test", false, 0, 0, { engagementState: "started" });
      expect(saveProgressDetailed).toHaveBeenCalledWith("weather-test", true, 100, 10, { completionState: "completed" });
      expect(screen.getByRole("alert").textContent).toMatch(/couldn.t save completion.*not marked/i);
      expect(screen.queryByRole("button", { name: /completed/i })).toBeNull();
      expect((screen.getByRole("button", { name: /retry saving completion/i }) as HTMLButtonElement).disabled).toBe(false);
    });
    saveProgressDetailed.mockResolvedValue("remote");
    fireEvent.click(screen.getByRole("button", { name: /retry saving completion/i }));
    expect(await screen.findByRole("button", { name: /completed/i })).toBeTruthy();
  });

  it("shows sign-in guidance and never attempts writes for a guest", async () => {
    loadProgressDetailed.mockResolvedValue({ status: "anonymous", record: null });
    render(<MemoryRouter><WeatherTheoryLayout title="Test" subtitle="Test" topicId="weather-test" sections={[]} /></MemoryRouter>);
    expect(await screen.findByText(/sign in to save completion/i)).toBeTruthy();
    expect((screen.getByRole("button", { name: /sign in to complete/i }) as HTMLButtonElement).disabled).toBe(true);
    expect(saveProgressDetailed).not.toHaveBeenCalled();
  });

  it("does not write started after a failed read and retries the load", async () => {
    loadProgressDetailed.mockResolvedValueOnce({ status: "failed", record: null }).mockResolvedValueOnce({ status: "missing", record: null });
    render(<MemoryRouter><WeatherTheoryLayout title="Test" subtitle="Test" topicId="weather-test" sections={[]} /></MemoryRouter>);
    const retry = await screen.findByRole("button", { name: /retry loading progress/i });
    expect(screen.getByRole("alert").textContent).toMatch(/couldn.t load/i);
    expect(saveProgressDetailed).not.toHaveBeenCalled();
    fireEvent.click(retry);
    await screen.findByRole("button", { name: /mark theory complete/i });
    await vi.waitFor(() => expect(saveProgressDetailed).toHaveBeenCalledWith("weather-test", false, 0, 0, { engagementState: "started" }));
  });

  it("treats an offline-queued completion as durable success", async () => {
    saveProgressDetailed.mockImplementation((_topicId, completed) => Promise.resolve(completed ? "queued" : "remote"));
    render(<MemoryRouter><WeatherTheoryLayout title="Test" subtitle="Test" topicId="weather-test" sections={[]} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: /mark theory complete/i }));
    expect(await screen.findByRole("button", { name: /queued offline/i })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toMatch(/queued offline.*this account/i);
  });

  it("restores an account-scoped queued completion without writing an older started snapshot", async () => {
    saveProgressDetailed.mockImplementation((_topicId, completed) => Promise.resolve(completed ? "queued" : "remote"));
    const first = render(<MemoryRouter><WeatherTheoryLayout title="Test" subtitle="Test" topicId="weather-test" sections={[]} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: /mark theory complete/i }));
    await screen.findByRole("button", { name: /queued offline/i });
    await vi.waitFor(() => expect(saveProgressDetailed).toHaveBeenCalledTimes(2));
    first.unmount();

    loadProgressDetailed.mockResolvedValue({ status: "failed", record: null });
    const restored = render(<MemoryRouter><WeatherTheoryLayout title="Test" subtitle="Test" topicId="weather-test" sections={[]} /></MemoryRouter>);
    expect(await screen.findByRole("button", { name: /queued offline/i })).toBeTruthy();
    expect(saveProgressDetailed).toHaveBeenCalledTimes(2);
    expect((screen.getByRole("button", { name: /queued offline/i }) as HTMLButtonElement).disabled).toBe(true);
    restored.unmount();

    ownerId = "owner-b";
    render(<MemoryRouter><WeatherTheoryLayout title="Test" subtitle="Test" topicId="weather-test" sections={[]} /></MemoryRouter>);
    expect((await screen.findByRole("alert")).textContent).toMatch(/couldn.t load/i);
    expect(screen.queryByRole("button", { name: /queued offline/i })).toBeNull();
    expect(saveProgressDetailed).toHaveBeenCalledTimes(2);
  });

  it("restores persisted completion and prevents another award", async () => {
    loadProgressDetailed.mockResolvedValue({ status: "remote", record: { completed: true } });
    render(<MemoryRouter><WeatherTheoryLayout title="Test" subtitle="Test" topicId="weather-test" sections={[]} /></MemoryRouter>);
    const action = await screen.findByRole("button", { name: /completed/i });
    expect((action as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(action);
    expect(saveProgressDetailed).not.toHaveBeenCalled();
  });

  it("blocks rapid duplicate activation while the first save is in flight", async () => {
    let resolveSave!: (saved: string) => void;
    saveProgressDetailed.mockImplementation((_topicId, completed) => {
      if (!completed) return Promise.resolve("remote");
      return new Promise<string>((resolve) => {
        resolveSave = resolve;
      });
    });
    render(<MemoryRouter><WeatherTheoryLayout title="Test" subtitle="Test" topicId="weather-test" sections={[]} /></MemoryRouter>);
    const action = await screen.findByRole("button", { name: /mark theory complete/i });
    fireEvent.click(action);
    fireEvent.click(action);
    expect(saveProgressDetailed).toHaveBeenCalledTimes(2);
    expect((screen.getByRole("button", { name: /saving completion/i }) as HTMLButtonElement).disabled).toBe(true);
    resolveSave("remote");
    await screen.findByRole("button", { name: /completed/i });
    expect(saveProgressDetailed).toHaveBeenCalledTimes(2);
  });

  it("uses mobile-first controls and a responsive two-column content grid", () => {
    const { container } = render(<MemoryRouter><WeatherTheoryLayout title="Responsive" subtitle="Test" topicId="weather-test" sections={[{ title: "One", body: "One" }, { title: "Two", body: "Two" }]} /></MemoryRouter>);
    expect(container.querySelector(".grid.md\\:grid-cols-2")).toBeTruthy();
    expect(container.querySelector(".flex.flex-col.sm\\:flex-row")).toBeTruthy();
  });
});
