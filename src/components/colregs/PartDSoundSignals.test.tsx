import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PartDSoundSignals } from "./PartDSoundSignals";
import { scheduleSignal, SOUND_EXERCISES, SOUND_SIGNALS } from "./partDSoundSignalsData";

const originalAudioContext = window.AudioContext;
afterEach(() => {
  window.AudioContext = originalAudioContext;
  vi.useRealTimers();
});

describe("COLREG Part D safety-critical content", () => {
  it("keeps required patterns and intervals explicit", () => {
    expect(SOUND_SIGNALS.find(signal => signal.id === "doubt")?.pattern).toHaveLength(5);
    expect(SOUND_SIGNALS.find(signal => signal.id === "doubt")?.repetition).toMatch(/At least five/);
    expect(SOUND_SIGNALS.find(signal => signal.id === "making-way")?.repetition).toMatch(/not more than 2 minutes/);
    expect(SOUND_SIGNALS.find(signal => signal.id === "stopped")?.condition).toMatch(/stopped and making no way/);
    expect(SOUND_SIGNALS.find(signal => signal.id === "stopped")?.repetition).toMatch(/2 seconds apart/);
    expect(SOUND_SIGNALS.find(signal => signal.id === "tow")?.pattern).toEqual(["prolonged","short","short","short"]);
    const stopped = SOUND_SIGNALS.find(signal => signal.id === "stopped")!;
    expect(scheduleSignal(stopped).map(({start}) => start)).toEqual([0.05,6.05]);
    const doubt = SOUND_SIGNALS.find(signal => signal.id === "doubt")!;
    expect(scheduleSignal(doubt).map(({start}) => start)).toEqual([0.05,1.3,2.55,3.8,5.05]);
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

  it("schedules oscillator starts correctly and cleans up replay, stop and unmount", () => {
    vi.useFakeTimers();
    const starts: number[] = [];
    const stops: number[] = [];
    const close = vi.fn().mockResolvedValue(undefined);
    class MockAudioContext {
      currentTime=10;
      destination={};
      latestGain={ gain:{value:0}, connect:vi.fn(() => this.latestGain) };
      createGain(){ this.latestGain={ gain:{value:0}, connect:vi.fn(() => this.latestGain) }; return this.latestGain; }
      createOscillator(){
        return { frequency:{value:0}, connect:vi.fn(() => this.latestGain), start:vi.fn((at:number)=>starts.push(at)), stop:vi.fn((at?:number)=>stops.push(at ?? -1)) };
      }
      close=close;
    }
    window.AudioContext = MockAudioContext as unknown as typeof AudioContext;
    const view=render(<PartDSoundSignals/>);
    fireEvent.click(screen.getByRole("button",{name:"Play Power-driven, stopped signal"}));
    expect(starts).toEqual([10.05,16.05]);
    expect(vi.getTimerCount()).toBe(1);
    fireEvent.click(screen.getByRole("button",{name:"Play Power-driven, stopped signal"}));
    expect(vi.getTimerCount()).toBe(1);
    fireEvent.click(screen.getAllByRole("button",{name:"Stop"}).find(button => !button.hasAttribute("disabled"))!);
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(screen.getByRole("button",{name:"Play Power-driven, stopped signal"}));
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(close).toHaveBeenCalledOnce();
    expect(stops.length).toBeGreaterThanOrEqual(6);
  });
});
