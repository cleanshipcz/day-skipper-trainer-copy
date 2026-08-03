import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnnexIVDistressSignals } from "./AnnexIVDistressSignals";
import { ANNEX_IV_DISTRESS_SIGNALS, ANNEX_IV_SOURCE_REVIEW } from "./annexIVDistressSignalsData";

describe("Annex IV safety-critical content", () => {
  it("retains every paragraph 1 signal exactly once", () => {
    expect(ANNEX_IV_DISTRESS_SIGNALS).toHaveLength(15);
    expect(new Set(ANNEX_IV_DISTRESS_SIGNALS.map(({ id }) => id)).size).toBe(15);
    render(<AnnexIVDistressSignals />);
    for (const signal of ANNEX_IV_DISTRESS_SIGNALS) {
      expect(document.querySelectorAll(`[data-signal-id="${signal.id}"]`)).toHaveLength(1);
    }
  });

  it("preserves exact timing, combinations, frequencies and visual equivalents", () => {
    render(<AnnexIVDistressSignals />);
    expect(screen.getByText(/intervals of about one minute/i)).toBeTruthy();
    expect(screen.getByText(/together or separately/i)).toBeTruthy();
    expect(screen.getByText("••• ——— •••")).toBeTruthy();
    expect(screen.getByText(/ball may be either above or below/i)).toBeTruthy();
    expect(screen.getByText(/2187\.5, 4207\.5, 6312, 8414\.5, 12577 or 16804\.5 kHz/i)).toBeTruthy();
  });

  it("states the lookalike prohibition and device-specific operating boundary", () => {
    render(<AnnexIVDistressSignals />);
    expect(screen.getByText(/do not use or exhibit an Annex IV signal for another purpose/i)).toBeTruthy();
    expect(screen.getByText(/do not use another signal that could be confused/i)).toBeTruthy();
    for (const id of ["red-flares", "orange-smoke", "dsc", "satellite", "epirb", "radio-systems"]) {
      expect(within(document.querySelector(`[data-signal-id="${id}"]`)! as HTMLElement).getByText(/Training boundary:/i)).toBeTruthy();
    }
  });

  it("teaches receiving actions and records a versioned primary-source review", () => {
    render(<AnnexIVDistressSignals />);
    expect(screen.getByRole("heading", { name: /If you receive or observe distress/i })).toBeTruthy();
    expect(screen.getByText(/record the signal, time, position/i)).toBeTruthy();
    expect(screen.getByText(/bound to proceed with all speed/i)).toBeTruthy();
    expect(screen.getByText(/reason must be entered in the log-book/i)).toBeTruthy();
    expect(ANNEX_IV_SOURCE_REVIEW.ruleVersion).toMatch(/corrected 8 August 2024/);
    expect(ANNEX_IV_SOURCE_REVIEW.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(screen.getByRole("link", { name: ANNEX_IV_SOURCE_REVIEW.ruleVersion }).getAttribute("href")).toBe(ANNEX_IV_SOURCE_REVIEW.ruleUrl);
  });
});
