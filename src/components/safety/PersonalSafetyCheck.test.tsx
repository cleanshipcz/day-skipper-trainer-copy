import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PERSONAL_SAFETY_CHECK_REVISION, PersonalSafetyCheck } from "./PersonalSafetyCheck";

const correctLabels = [
  /manufacturer states it suits the conditions/i,
  /follow the model instructions/i,
  /rig and inspect jacklines early/i,
  /test the cut-off system as instructed/i,
];

describe("PersonalSafetyCheck", () => {
  it("exposes an owned informative diagram and four accessible decision groups", () => {
    render(<PersonalSafetyCheck onMastery={vi.fn()} />);
    expect(screen.getByRole("img", { name: /personal safety equipment decision sequence/i })).toBeTruthy();
    expect(screen.getByText(/four panels show selecting and fitting/i, { selector: "desc" })).toBeTruthy();
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Select and fit the right PFD.", "Inspect its serviceable parts.", "Clip on early to suitable points.", "Attach the kill cord before starting.",
    ]);
    expect(screen.getAllByRole("group")).toHaveLength(4);
    expect(screen.getAllByRole("radio")).toHaveLength(12);
    expect(screen.getByRole("button", { name: /reset practical check/i })).toBeTruthy();
  });

  it("gives explicit incorrect feedback, permits correction, and emits deterministic mastery once complete", async () => {
    const user = userEvent.setup();
    const complete = vi.fn();
    render(<PersonalSafetyCheck onMastery={complete} />);

    await user.click(screen.getByRole("radio", { name: /largest number guarantees/i }));
    await user.click(screen.getByRole("button", { name: /check choose the pfd/i }));
    expect(screen.getByRole("alert").textContent).toMatch(/not safe.*does not guarantee/i);
    expect(complete).not.toHaveBeenCalled();

    for (let index = 0; index < correctLabels.length; index += 1) {
      await user.click(screen.getByRole("radio", { name: correctLabels[index] }));
      await user.click(screen.getAllByRole("button", { name: /^check /i })[index]);
    }
    expect(screen.getByText(/4 of 4/).textContent).toMatch(/4 of 4/);
    expect(complete).toHaveBeenCalledWith({ revision: PERSONAL_SAFETY_CHECK_REVISION, masteredScenarioIds: ["pfd", "fit", "tether", "kill-cord"] });

    await user.click(screen.getByRole("radio", { name: /largest number guarantees/i }));
    expect(complete).toHaveBeenLastCalledWith(null);
    expect(screen.getByText(/3 of 4/)).toBeTruthy();
  });

  it("resets selections, feedback and mastery safely for touch or keyboard activation", async () => {
    const user = userEvent.setup();
    render(<PersonalSafetyCheck onMastery={vi.fn()} />);
    await user.click(screen.getByRole("radio", { name: correctLabels[0] }));
    await user.click(screen.getByRole("button", { name: /check choose the pfd/i }));
    expect(screen.getByText(/1 of 4/)).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("button", { name: /reset practical check/i }), { key: "Enter" });
    await user.click(screen.getByRole("button", { name: /reset practical check/i }));
    expect(screen.getByText(/0 of 4/)).toBeTruthy();
    expect(screen.getAllByRole("radio").every((radio) => !(radio as HTMLInputElement).checked)).toBe(true);
    expect(screen.queryByText(/^Correct\./)).toBeNull();
  });

  it("keeps instructional labels in reflowing HTML rather than squeezing them into the fixed diagram", () => {
    const { container } = render(<PersonalSafetyCheck onMastery={vi.fn()} />);
    const svg = screen.getByRole("img", { name: /personal safety equipment decision sequence/i });
    expect(within(svg).queryByText(/select and fit/i)).toBeNull();
    const caption = container.querySelector("figcaption");
    expect(caption).toBeTruthy();
    expect(within(caption as HTMLElement).getAllByRole("listitem")).toHaveLength(4);
    expect((caption as HTMLElement).textContent).toContain("Attach the kill cord before starting");
    expect(screen.getAllByRole("radio").every((radio) => radio.closest("label")?.classList.contains("min-h-11"))).toBe(true);
    expect(container.querySelector("[class*='animate-']")).toBeNull();
  });
});
