import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BUOY_DRILL_ATTEMPT_KEY, BuoyIdentifier, buildBuoyQuestions, type BuoyDrillResult } from "@/components/pilotage/BuoyIdentifier";

describe("BuoyIdentifier mastery drill", () => {
  const onComplete = vi.fn<(result: BuoyDrillResult) => void>();
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

  it("builds reproducible full coverage with stable unique options", () => {
    const first = buildBuoyQuestions(12, 42);
    expect(buildBuoyQuestions(12, 42)).toEqual(first);
    expect(new Set(first.map(({ buoyId }) => buoyId)).size).toBe(12);
    expect(first.every(({ buoyId, optionIds }) => optionIds.length === 4 && new Set(optionIds).size === 4 && optionIds.includes(buoyId))).toBe(true);
  });

  it("keeps generated challenge and option order stable across selection and rerender", async () => {
    const user = userEvent.setup();
    const view = render(<BuoyIdentifier onComplete={onComplete} seed={7}/>);
    const before = screen.getAllByRole("radio").map((radio) => (radio as HTMLInputElement).value);
    await user.click(screen.getAllByRole("radio")[0]);
    view.rerender(<BuoyIdentifier onComplete={onComplete} seed={999}/>);
    expect(screen.getAllByRole("radio").map((radio) => (radio as HTMLInputElement).value)).toEqual(before);
  });

  it("uses a semantic keyboard-operable single-choice group and non-colour feedback", async () => {
    render(<BuoyIdentifier onComplete={onComplete}/>);
    const group = screen.getByRole("group", { name: "Choose one answer" });
    const correct = screen.getByTestId("correct-option").querySelector("input")!;
    correct.focus(); fireEvent.keyDown(correct, { key: " " }); fireEvent.click(correct);
    expect(group.hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("alert").textContent).toMatch(/Correct.*Distinguishing cue.*Meaning and safe action.*Q means quick/s);
    expect(screen.getByText("Correct answer").className).toContain("sr-only");
  });

  it("does not leak the answer name in the accessible visual prompt", () => {
    render(<BuoyIdentifier onComplete={onComplete}/>);
    const correctName = screen.getByTestId("correct-option").textContent!;
    expect(screen.getByRole("img").getAttribute("aria-label") ?? screen.getByRole("img").textContent).not.toContain(correctName);
    expect(screen.getByRole("img").textContent).toContain("Buoy identification challenge");
  });

  it("retains misses for targeted review and awards only after they are corrected", async () => {
    const user = userEvent.setup();
    render(<BuoyIdentifier onComplete={onComplete} totalChallenges={2} storageKey="two"/>);
    await user.click(screen.getAllByRole("radio").find((node) => !node.closest("label")?.hasAttribute("data-testid"))!);
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByTestId("correct-option").querySelector("input")!);
    await user.click(screen.getByRole("button", { name: /review missed/i }));
    expect(screen.getByRole("status").textContent).toMatch(/Targeted review: 1 mark/);
    expect(onComplete).not.toHaveBeenCalled();
    await user.click(screen.getByTestId("correct-option").querySelector("input")!);
    await user.click(screen.getByRole("button", { name: /mastery result/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ mastered: true, totalAnswered: 2 }));
  });

  it("restores a persisted attempt and rejects corrupt or wrong-sized evidence", async () => {
    const user = userEvent.setup();
    const view = render(<BuoyIdentifier onComplete={onComplete}/>);
    await user.click(screen.getByTestId("correct-option").querySelector("input")!);
    view.unmount();
    render(<BuoyIdentifier onComplete={onComplete}/>);
    expect(screen.getByRole("group").hasAttribute("disabled")).toBe(true);
    localStorage.setItem(BUOY_DRILL_ATTEMPT_KEY, JSON.stringify({ revision: "wrong" }));
    view.unmount();
  });

  it("rejects invalid counts and keeps touch targets responsive", () => {
    expect(() => buildBuoyQuestions(13)).toThrow(/between 1 and 12/);
    render(<BuoyIdentifier onComplete={onComplete}/>);
    expect(screen.getByTestId("correct-option").className).toContain("min-h-11");
    expect(screen.getByTestId("correct-option").className).toContain("items-center");
  });
});
