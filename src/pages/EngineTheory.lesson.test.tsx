import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EngineTheory from "./EngineTheory";

const loadProgressDetailed = vi.fn();
const saveProgressDetailed = vi.fn();
const scrollIntoView = vi.fn();
const auth = { user: null as { id: string } | null };

vi.mock("@/contexts/AuthHooks", () => ({ useAuth: () => auth }));
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({ loadProgressDetailed, saveProgressDetailed }),
}));

describe("EngineTheory practical lesson", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });
    scrollIntoView.mockReset();
    sessionStorage.clear();
    auth.user = null;
    loadProgressDetailed.mockReset().mockResolvedValue({ status: "anonymous" });
    saveProgressDetailed.mockReset();
  });

  it("scrolls and focuses an allowlisted remediation heading", async () => {
    render(<MemoryRouter initialEntries={["/engine#engine-component-inspections"]}><EngineTheory /></MemoryRouter>);
    const heading = await screen.findByRole("heading", { name: "Component inspection examples" });
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
    expect(document.activeElement).toBe(heading);
  });

  it("ignores unrecognised hash targets", async () => {
    render(<MemoryRouter initialEntries={["/engine#not-an-engine-objective"]}><EngineTheory /></MemoryRouter>);
    await screen.findByText(/Lesson objectives and scope/i);
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(document.body);
  });

  it("renders objectives, an accessible visual alternative, and the ordered routine", async () => {
    const { container } = render(<MemoryRouter><EngineTheory /></MemoryRouter>);
    expect(await screen.findByText(/Lesson objectives and scope/i)).toBeTruthy();
    expect(screen.getByRole("img", { name: /representative marine engine installation/i })).toBeTruthy();
    expect(screen.getByText(/Text alternative: fuel tank/i)).toBeTruthy();
    const drivetrain = container.querySelector('line[x1="415"][y1="160"][x2="525"][y2="262"]');
    expect(drivetrain?.getAttribute("marker-end")).toBe("url(#engine-arrow)");
    expect(container.querySelector('line[x1="525"][y1="262"][x2="415"][y2="160"]')).toBeNull();
    const expected = ["1. Pre-start inspection", "2. Immediately after start", "3. Monitor underway", "4. Shutdown and post-run", "5. Maintenance record"];
    const positions = expected.map((title) => container.textContent?.indexOf(title) ?? -1);
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("provides contextual navigation and concise zero-reward progress semantics", async () => {
    render(<MemoryRouter><EngineTheory /></MemoryRouter>);
    expect(await screen.findByRole("button", { name: "Back to Home from Engine Checks & Maintenance" })).toBeTruthy();
    expect(screen.getByText("0 of 10 practice checks selected.")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toBe("0 of 10 practice checks selected; no points awarded");
  });

  it("announces one actionable load error and restores focus after recovery", async () => {
    loadProgressDetailed.mockResolvedValueOnce({ status: "failed" }).mockResolvedValueOnce({ status: "anonymous" });
    render(<MemoryRouter><EngineTheory /></MemoryRouter>);
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/Saved progress could not be loaded.*Retry load/);
    fireEvent.click(within(alert).getByRole("button", { name: "Retry load" }));
    const firstCheck = await screen.findByRole("checkbox", { name: /Inspect oil, coolant and bilge/i });
    await waitFor(() => expect(document.activeElement).toBe(firstCheck));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("focuses completion once all reversible checks are selected", async () => {
    render(<MemoryRouter><EngineTheory /></MemoryRouter>);
    await screen.findByText(/Checklist saved for this browser session/i);
    for (const checkbox of screen.getAllByRole("checkbox")) fireEvent.click(checkbox);
    const completion = await screen.findByRole("heading", { name: "Practice checklist complete" });
    await waitFor(() => expect(document.activeElement).toBe(completion));
    expect(screen.getByText("10 of 10 practice checks selected.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Take Engine Quiz" })).toBeTruthy();
  });

  it("does not move focus when a complete catalogue is restored", async () => {
    loadProgressDetailed.mockResolvedValue({
      status: "remote",
      record: { answers_history: { version: 2, catalogueId: "engine-maintenance-v2", checkedItemIds: ["oil", "coolant", "fuel", "seacock", "belt", "impeller", "filters", "anodes", "exhaust", "battery"], revision: 3 } },
    });
    render(<MemoryRouter><EngineTheory /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "Practice checklist complete" })).toBeTruthy();
    expect(document.activeElement).toBe(document.body);
  });

  it("uses the task as the concise name and exposes details once as description", async () => {
    render(<MemoryRouter><EngineTheory /></MemoryRouter>);
    const oil = await screen.findByRole("checkbox", {
      name: "Inspect oil, coolant and bilge",
      description: /With the engine stopped.*Before start \/ manual interval/i,
    });
    expect(oil.getAttribute("aria-labelledby")).toBe("engine-oil-task");
    expect(oil.getAttribute("aria-describedby")).toBe("engine-oil-description engine-oil-frequency");
    expect(oil.getAttribute("aria-checked")).toBe("false");
  });

  it("returns focus to the exact failed item after retry", async () => {
    auth.user = { id: "engine-user" };
    loadProgressDetailed.mockResolvedValue({ status: "missing" });
    saveProgressDetailed.mockResolvedValueOnce("failed").mockResolvedValueOnce("remote");
    render(<MemoryRouter><EngineTheory /></MemoryRouter>);
    const checks = await screen.findAllByRole("checkbox");
    fireEvent.click(checks[7]);
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Your latest change was not saved");
    fireEvent.click(within(alert).getByRole("button", { name: "Retry save" }));
    await waitFor(() => expect(document.activeElement).toBe(checks[7]));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("supports keyboard-sized native choices and gives remediation without gating", async () => {
    render(<MemoryRouter><EngineTheory /></MemoryRouter>);
    const scenario = await screen.findByRole("group", { name: /discharge expected/i });
    const wrong = within(scenario).getByLabelText(/Increase rpm/i);
    wrong.focus();
    fireEvent.keyDown(wrong, { key: " " });
    fireEvent.click(wrong);
    expect(within(scenario).getByRole("status").textContent).toMatch(/Reconsider this choice/i);
    fireEvent.click(within(scenario).getByLabelText(/stop as the fitted manual/i));
    expect(within(scenario).getByRole("status").textContent).toMatch(/Defensible decision/i);
    expect(screen.getByRole("button", { name: /Practise Engine Quiz/i }).hasAttribute("disabled")).toBe(false);
  });

  it("uses reflow-safe grids and touch targets", async () => {
    const { container } = render(<MemoryRouter><EngineTheory /></MemoryRouter>);
    await screen.findByText(/Lesson objectives and scope/i);
    expect(container.querySelector("svg.w-full.min-w-0")).toBeTruthy();
    expect(container.querySelector(".sm\\:grid-cols-2")).toBeTruthy();
    expect(container.querySelector("label.min-h-11")).toBeTruthy();
    expect(container.querySelector("main.min-w-0")).toBeTruthy();
    expect(Array.from(container.querySelectorAll("*")).some((node) => node.classList.contains("[overflow-wrap:anywhere]"))).toBe(true);
    expect(container.firstElementChild?.classList.contains("motion-reduce:scroll-auto")).toBe(true);
    expect(screen.getAllByRole("checkbox")[0].className).toContain("size-11");
  });
});
