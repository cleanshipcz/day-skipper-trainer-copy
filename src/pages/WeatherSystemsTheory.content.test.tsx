// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { weatherSystemsSections } from "./WeatherSystemsTheory";

const TheoryContent = () => <>{weatherSystemsSections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.body}</section>)}</>;

describe("weather systems applied theory", () => {
  it("qualifies pressure values and wind strength by gradient and local effects", () => {
    render(<TheoryContent />);
    const pressure = screen.getByRole("heading", { name: /pressure, isobars/i }).closest("section")!;
    expect(within(pressure).getByText(/1013 hPa/i)).toBeTruthy();
    expect(within(pressure).getByText(/value is not .good. or .bad. by itself/i)).toBeTruthy();
    expect(within(pressure).getByText(/closely spaced isobars.*generally stronger true wind/i)).toBeTruthy();
    expect(within(pressure).getByText(/local effects, fronts, squalls, friction and topography/i)).toBeTruthy();
    expect(within(pressure).getByText(/tendency and the forecast movement matter more than one barometer reading/i)).toBeTruthy();
  });

  it("covers the chart systems and frontal-wave terminology used by the graphics and quiz", () => {
    render(<TheoryContent />);
    const systems = screen.getByRole("heading", { name: /highs, lows, ridges/i }).closest("section")!;
    const fronts = screen.getByRole("heading", { name: /frontal wave & warm sector/i }).closest("section")!;
    expect(systems.textContent).toMatch(/ridge.*elongated extension of high pressure/i);
    expect(systems.textContent).toMatch(/trough.*elongated area of relatively low pressure/i);
    expect(fronts.textContent).toMatch(/wedge of relatively warm air.*warm sector/i);
    expect(fronts.textContent).toMatch(/faster cold front catches the warm front/i);
    expect(screen.getByText(/blue triangles/i)).toBeTruthy();
    expect(screen.getByText(/red semicircles/i)).toBeTruthy();
  });

  it("gives a qualified, time-sequenced Northern Hemisphere front passage", () => {
    render(<TheoryContent />);
    const passage = screen.getByRole("heading", { name: /worked passage: warm then cold/i }).closest("section")!;
    expect(within(passage).getAllByRole("listitem")).toHaveLength(4);
    for (const stage of ["Ahead of the warm front", "Warm-front passage and warm sector", "Cold-front passage", "Behind the cold front"]) {
      expect(within(passage).getByText(new RegExp(stage, "i"))).toBeTruthy();
    }
    expect(within(passage).getByText(/typical Northern Hemisphere depression/i)).toBeTruthy();
    expect(within(passage).getByText(/track, speed, depth.*can change it/i)).toBeTruthy();
    expect(within(passage).getByText(/pressure reaches a minimum then starts to rise/i)).toBeTruthy();
  });

  it("connects uncertain forecasts to hazards, monitoring and practical decisions", () => {
    render(<TheoryContent />);
    const decisions = screen.getByRole("heading", { name: /passage decisions/i }).closest("section")!;
    expect(within(decisions).getByText(/delaying, shortening or rerouting/i)).toBeTruthy();
    expect(within(decisions).getByText(/wind against tide.*unsafe seas/i)).toBeTruthy();
    expect(within(decisions).getByText(/reef early/i)).toBeTruthy();
    expect(within(decisions).getByText(/lee shores, poor visibility and difficult harbour approaches/i)).toBeTruthy();
    expect(within(decisions).getByText(/does not guarantee conditions/i)).toBeTruthy();
  });
});
