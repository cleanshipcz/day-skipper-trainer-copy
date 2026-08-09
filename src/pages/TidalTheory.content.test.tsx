import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import TidalTheory from "./TidalTheory";

vi.mock("@/hooks/useCompletion", () => ({ useCompletion: () => ({ completeTopic: vi.fn() }) }));

describe("Understanding Tides lesson", () => {
  it("teaches the differential model, local modifiers, and prediction uncertainty", () => {
    render(<MemoryRouter><TidalTheory /></MemoryRouter>);
    expect(document.body.textContent).toMatch(/difference in lunar and solar gravity/i);
    expect(screen.getByText(/two equilibrium bulges/i)).toBeTruthy();
    expect(screen.getByText(/24 h 50 min/i)).toBeTruthy();
    expect(screen.getByText(/Meteorological residual/i)).toBeTruthy();
    expect(screen.getByText(/predictions are not guarantees/i)).toBeTruthy();
  });

  it("exposes a consistent anti-clockwise schematic and its provenance", () => {
    const { container } = render(<MemoryRouter><TidalTheory /></MemoryRouter>);
    expect(screen.getByRole("img", { name: /North Sea amphidromic system teaching schematic/i })).toBeTruthy();
    expect(screen.getAllByText(/anti-clockwise propagation/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Original teaching schematic.*not for navigation/i)).toBeTruthy();
    const arrows = [...container.querySelectorAll('g[marker-end="url(#tidal-arrow)"] path')];
    expect(arrows).toHaveLength(2);
    expect(arrows.map((arrow) => arrow.getAttribute("d"))).toEqual([
      "M223 306 A150 115 0 0 0 448 304",
      "M437 132 A150 115 0 0 0 213 135",
    ]);
    expect(screen.getByText("0.5 m")).toBeTruthy();
    expect(screen.getByText("9 h")).toBeTruthy();
  });

  it("checks a safe decision using local predictions and residuals", () => {
    render(<MemoryRouter><TidalTheory /></MemoryRouter>);
    fireEvent.click(screen.getByLabelText(/Use the local table\/curve/i));
    expect(screen.getByRole("status").textContent).toMatch(/adjusted planning level is 4.5 m/i);
  });
});
