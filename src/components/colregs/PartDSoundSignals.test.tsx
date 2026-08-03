import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PartDSoundSignals } from "./PartDSoundSignals";
import { SOUND_EXERCISES, SOUND_SIGNALS } from "./partDSoundSignalsData";

describe("COLREG Part D safety-critical content", () => {
  it("keeps required patterns and intervals explicit", () => {
    expect(SOUND_SIGNALS.find(signal => signal.id === "doubt")?.pattern).toHaveLength(5);
    expect(SOUND_SIGNALS.find(signal => signal.id === "doubt")?.repetition).toMatch(/At least five/);
    expect(SOUND_SIGNALS.find(signal => signal.id === "making-way")?.repetition).toMatch(/not more than 2 minutes/);
    expect(SOUND_SIGNALS.find(signal => signal.id === "stopped")?.condition).toMatch(/stopped and making no way/);
    expect(SOUND_SIGNALS.find(signal => signal.id === "stopped")?.repetition).toMatch(/2 seconds apart/);
    expect(SOUND_SIGNALS.find(signal => signal.id === "tow")?.pattern).toEqual(["prolonged","short","short","short"]);
  });

  it("renders Rules 32–36, structured non-audio equivalents and special cases", () => {
    render(<PartDSoundSignals />);
    for (const rule of [32,33,34,35,36]) expect(document.getElementById("rule-"+rule)).toBeTruthy();
    expect(screen.getAllByRole("img").length).toBe(SOUND_SIGNALS.length);
    expect(screen.getByText(/two prolonged \+ one short/)).toBeTruthy();
    expect(screen.getByText(/at least 10 seconds between successive signals/)).toBeTruthy();
    expect(screen.getByText(/three distinct bell strokes/)).toBeTruthy();
    expect(screen.getByText(/Pilot on duty/)).toBeTruthy();
    expect(screen.getByText(/cannot be mistaken/)).toBeTruthy();
    expect(screen.getByText(/corrected 8 August 2024/)).toBeTruthy();
  });

  it("gives corrective and correct feedback in applied choices", () => {
    render(<PartDSoundSignals />);
    fireEvent.click(screen.getByRole("button",{name:"One prolonged"}));
    expect(screen.getByRole("status").textContent).toMatch(/^Try again/);
    fireEvent.click(screen.getByRole("button",{name:"Two prolonged about 2 seconds apart"}));
    expect(screen.getByRole("status").textContent).toMatch(/^Correct/);
    expect(screen.getByRole("button",{name:"Next exercise"}).hasAttribute("disabled")).toBe(false);
    expect(SOUND_EXERCISES).toHaveLength(3);
  });
});
