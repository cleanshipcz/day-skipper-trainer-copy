import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EngineTheory from "./EngineTheory";

const loadProgressDetailed = vi.fn();
const saveProgressDetailed = vi.fn();

vi.mock("@/contexts/AuthHooks", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({ loadProgressDetailed, saveProgressDetailed }),
}));

describe("EngineTheory practical lesson", () => {
  beforeEach(() => {
    sessionStorage.clear();
    loadProgressDetailed.mockReset().mockResolvedValue({ status: "anonymous" });
    saveProgressDetailed.mockReset();
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
  });
});
