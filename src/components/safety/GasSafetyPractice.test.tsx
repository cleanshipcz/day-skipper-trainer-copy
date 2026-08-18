import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GasSafetyPractice } from "./GasSafetyPractice";
import { GAS_SAFETY_MASTERY_REVISION } from "./gasSafetyMastery";

describe("GasSafetyPractice", () => {
  it("provides text equivalents for all three code-native diagrams and reflow-safe structure", () => {
    const { container } = render(<GasSafetyPractice onMastery={() => undefined}/>);
    expect(screen.getByRole("img", { name: /LPG accumulation and drainage/i })).toBeTruthy();
    expect(screen.getByRole("img", { name: /Safe isolation flow/i })).toBeTruthy();
    expect(screen.getByRole("img", { name: /Boat CO alarm placement/i })).toBeTruthy();
    const placement = screen.getByRole("img", { name: /Boat CO alarm placement/i });
    expect(placement.textContent).toMatch(/living area.*sleeping area.*audible CO alarm.*heat \/ steam.*height \/ breathing zone.*maker instructions/is);
    expect(screen.getAllByText(/no universal height/i)).toHaveLength(2);
    expect(container.querySelector("section")?.className).toContain("min-w-0");
    expect(container.querySelector("label")?.className).toContain("min-h-11");
    expect(screen.getByRole("heading", { name: /practice source scope/i })).toBeTruthy();
    expect(screen.getByText(/no qualified practitioner approval is recorded/i)).toBeTruthy();
    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.getByRole<HTMLAnchorElement>("link", { name: /UK government: Fire safety on boats/i }).href).toBe("https://www.gov.uk/government/publications/fire-safety-on-boats/fire-safety-on-boats-accessible-version");
    expect(screen.getByRole("radio", { name: /oxygen is only for trained, equipped responders/i })).toBeTruthy();
    expect(screen.queryByText(/give first aid or oxygen/i)).toBeNull();
  });

  it("clears answers and parent-held evidence when the learner owner changes", async () => {
    const user = userEvent.setup(); const onMastery = vi.fn();
    const { rerender } = render(<GasSafetyPractice evidenceOwnerKey="account-a" onMastery={onMastery}/>);
    for (const [radio, button] of [[/operate no electrical switches/i,/check gas smell/i],[/get everyone into fresh air/i,/check carbon-monoxide/i]] as const) { await user.click(screen.getByRole("radio", {name:radio})); await user.click(screen.getByRole("button", {name:button})); }
    expect(onMastery.mock.calls.some(([value]) => value?.revision === GAS_SAFETY_MASTERY_REVISION)).toBe(true);
    rerender(<GasSafetyPractice evidenceOwnerKey="account-b" onMastery={onMastery}/>);
    expect(onMastery).toHaveBeenLastCalledWith(null);
    expect(screen.getAllByRole("radio").every(radio => !(radio as HTMLInputElement).checked)).toBe(true);
    expect(screen.getByText(/0 of 2/)).toBeTruthy();
  });

  it("supports keyboard selection, announces corrective feedback and emits deterministic mastery", async () => {
    const user = userEvent.setup(); const onMastery = vi.fn();
    render(<GasSafetyPractice onMastery={onMastery}/>);
    const unsafe = screen.getByRole("radio", { name: /electric bilge blower/i });
    unsafe.focus(); await user.keyboard(" ");
    await user.click(screen.getByRole("button", { name: /check gas smell/i }));
    expect(screen.getByRole("alert").textContent).toMatch(/may create an ignition source/i);
    await user.click(screen.getByRole("radio", { name: /operate no electrical switches/i }));
    await user.click(screen.getByRole("button", { name: /check gas smell/i }));
    await user.click(screen.getByRole("radio", { name: /get everyone into fresh air/i }));
    await user.click(screen.getByRole("button", { name: /check carbon-monoxide/i }));
    expect(onMastery).toHaveBeenLastCalledWith({ revision: GAS_SAFETY_MASTERY_REVISION, masteredScenarioIds: ["lpg-leak", "co-alarm"] });
    expect(screen.getByText(/in-session mastery signal ready/i)).toBeTruthy();
  });

  it("withdraws ephemeral evidence when a mastered answer changes and resets without persistence", async () => {
    const user = userEvent.setup(); const onMastery = vi.fn(); render(<GasSafetyPractice onMastery={onMastery}/>);
    for (const [radio, button] of [[/operate no electrical switches/i,/check gas smell/i],[/get everyone into fresh air/i,/check carbon-monoxide/i]] as const) { await user.click(screen.getByRole("radio", {name:radio})); await user.click(screen.getByRole("button", {name:button})); }
    await user.click(screen.getByRole("radio", {name:/silence it and wait/i}));
    expect(onMastery).toHaveBeenLastCalledWith(null);
    await user.click(screen.getByRole("button", {name:/reset practice/i}));
    expect(screen.getAllByRole("radio").every(radio => !(radio as HTMLInputElement).checked)).toBe(true);
  });
});
