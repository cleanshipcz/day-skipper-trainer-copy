import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { COLREG_SCENARIOS, ColregScenarioExercise } from "./ColregScenarioExercise";

describe("applied COLREG exercises", () => {
  it("defines truthful, text-equivalent scenarios across the required encounter families", () => {
    expect(COLREG_SCENARIOS.map(({ id }) => id)).toEqual(["sailing", "overtaking", "head-on", "crossing", "channel", "fog"]);
    const legalTruth = {
      sailing: [/12 and 17/, /may act.*must act/i], overtaking: [/13/, /overtaking and must keep out/i],
      "head-on": [/14/, /alter to starboard/i], crossing: [/15 and 16/, /starboard side/i],
      channel: [/9 and 10/, /must not impede/i], fog: [/19/, /No stand-on\/give-way claim/i],
    } as const;
    for (const scenario of COLREG_SCENARIOS) {
      expect(scenario.geometry.length).toBeGreaterThan(35);
      expect(scenario.geometry).toMatch(/NM|channel|Radar/i);
      expect(scenario.rule).toMatch(/Rule/);
      expect(scenario.answers).toHaveLength(4);
      const [rule, responsibility] = legalTruth[scenario.id as keyof typeof legalTruth];
      expect(scenario.rule).toMatch(rule);
      expect(scenario.answers.join(" ")).toMatch(responsibility);
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
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Sailing encounter, same side of wind" }));
    expect(screen.getByRole("status").textContent).toMatch(/Correct/);
    await user.click(screen.getByRole("button", { name: "Continue to Responsibilities" }));
    expect(screen.getByText(/Responsibilities: choose/)).toBeTruthy();
  });

  it("completes all four stages, advances, and resets when switching scenarios", async () => {
    const user = userEvent.setup();
    render(<ColregScenarioExercise />);
    for (const [index, answer] of COLREG_SCENARIOS[0].answers.entries()) {
      await user.click(screen.getByRole("button", { name: answer }));
      if (index < 3) await user.click(screen.getByRole("button", { name: new RegExp(`Continue to`) }));
    }
    expect(screen.getByRole("button", { name: "Next scenario" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Next scenario" }));
    expect(screen.getByText("Overtaking from abaft the beam", { selector: "h3" })).toBeTruthy();
    expect(screen.getByText(/Classify: choose/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /4\. Crossing with target/ }));
    expect(screen.getByText("Crossing with target to starboard", { selector: "h3" })).toBeTruthy();
    expect(screen.getByText(/Classify: choose/)).toBeTruthy();
    expect(screen.queryByText(/^Correct\./)).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /4\. Crossing with target/ }));
  });

  it("offers touch-sized responsive controls without motion-dependent state", () => {
    const { container } = render(<ColregScenarioExercise />);
    const answer = screen.getByRole("button", { name: "Sailing encounter, same side of wind" });
    expect(answer.className).toContain("min-h-11");
    expect(answer.closest("div")?.className).toMatch(/sm:grid-cols-2/);
    expect(screen.getByRole("button", { name: /1\. Sailing vessels/ }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("img", { name: /Sailing vessels on the same tack/ })).toBeTruthy();
    expect(container.querySelector("dl")?.getAttribute("aria-label")).toMatch(/structured text description/);
    expect(screen.getByRole("img").getAttribute("class")).toContain("forced-colors:text-[CanvasText]");
  });
});
