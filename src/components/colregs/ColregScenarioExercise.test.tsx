import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { COLREG_SCENARIOS, ColregScenarioExercise } from "./ColregScenarioExercise";

describe("applied COLREG exercises", () => {
  it("defines truthful, text-equivalent scenarios across the required encounter families", () => {
    expect(COLREG_SCENARIOS.map(({ id }) => id)).toEqual(["sailing", "overtaking", "head-on", "crossing", "channel", "fog"]);
    for (const scenario of COLREG_SCENARIOS) {
      expect(scenario.geometry.length).toBeGreaterThan(35);
      expect(scenario.geometry).toMatch(/NM|channel|Radar/i);
      expect(scenario.rule).toMatch(/Rule/);
      expect(scenario.answers).toHaveLength(4);
    }
    const { container } = render(<ColregScenarioExercise />);
    expect(container.querySelector("svg[role=img] desc")?.textContent).toMatch(/Own vessel:.*Target:.*Geometry:/);
  });

  it("supports keyboard workflow transitions and meaningful remediation", async () => {
    const user = userEvent.setup();
    render(<ColregScenarioExercise />);
    await user.tab();
    expect(document.activeElement?.tagName).toBe("BUTTON");
    await user.click(screen.getByRole("button", { name: "Head-on power-driven encounter" }));
    expect(screen.getByText(/Not yet.*Recheck/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Sailing encounter, same side of wind" }));
    expect(screen.getByText(/Correct/)).toBeTruthy();
    expect(screen.getByText(/Responsibilities: choose/)).toBeTruthy();
  });

  it("offers touch-sized responsive controls without motion-dependent state", () => {
    render(<ColregScenarioExercise />);
    const answer = screen.getByRole("button", { name: "Sailing encounter, same side of wind" });
    expect(answer.className).toContain("min-h-11");
    expect(answer.closest("div")?.className).toMatch(/sm:grid-cols-2/);
  });
});
