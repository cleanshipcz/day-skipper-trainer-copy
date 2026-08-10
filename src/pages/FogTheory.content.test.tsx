// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import questions from "@/data/quizzes/weather";
import { fogTheorySections } from "./FogTheory";

const Content = () => <>{fogTheorySections.map(({ title, body }) => <section key={title}><h2>{title}</h2>{body}</section>)}</>;

describe("fog and marine visibility safety guidance", () => {
  it("pins all four forecast categories and their boundaries", () => {
    render(<Content />);
    const section = screen.getByRole("heading", { name: /marine forecast visibility scale/i }).closest("section")!;
    const text = section.textContent ?? "";
    expect(text).toMatch(/Good.*more than 5 NM.*9,260 m/i);
    expect(text).toMatch(/Moderate.*2–5 NM.*3,704–9,260 m.*exactly 2 NM and 5 NM/i);
    expect(text).toMatch(/Poor.*1,000 m to less than 2 NM.*0.54 NM.*3,704 m.*exactly 1,000 m/i);
    expect(text).toMatch(/Very poor.*less than 1,000 m.*0.54 NM/i);
    expect(text).toMatch(/1,000 m is poor.*2 NM is moderate.*5 NM is moderate/i);
  });

  it("separates weather phenomena, forecast visibility, and COLREG scope", () => {
    render(<Content />);
    const phenomena = screen.getByRole("heading", { name: /fog, forecast terms and COLREGs/i }).closest("section")?.textContent ?? "";
    expect(phenomena).toMatch(/Fog.*water droplets.*below 1,000 m/i);
    expect(phenomena).toMatch(/Mist.*water droplets.*1,000 m or more/i);
    expect(phenomena).toMatch(/Haze.*dry particles/i);
    expect(phenomena).toMatch(/weather.*fog, mist, rain or drizzle.*separately.*visibility/i);
    const colreg = phenomena;
    expect(colreg).toMatch(/fog, mist, falling snow, heavy rainstorms, sandstorms/i);
    expect(colreg).toMatch(/no single distance.*Rule 19/i);
  });

  it("teaches practical prediction, uncertainty and conservative decisions", () => {
    render(<Content />);
    const mechanisms = screen.getByRole("heading", { name: /common UK coastal mechanisms/i }).closest("section")?.textContent ?? "";
    expect(mechanisms).toMatch(/Advection.*colder sea.*onshore/i);
    expect(mechanisms).toMatch(/Radiation.*clear.*light-wind night.*valleys/i);
    expect(mechanisms).toMatch(/Frontal.*rain.*Hill fog.*coastal slopes/i);
    const indicators = screen.getByRole("heading", { name: /practical indicators/i }).closest("section")?.textContent ?? "";
    expect(indicators).toMatch(/air temperature and dew point.*narrowing spread/i);
    expect(indicators).toMatch(/sea-surface temperature.*SST/i);
    expect(indicators).toMatch(/wind direction and strength/i);
    const decision = screen.getByRole("heading", { name: /worked coastal decision/i }).closest("section")?.textContent ?? "";
    expect(decision).toMatch(/Delay:.*Divert:.*Abort:/i);
    expect(decision).toMatch(/uncertainty.*more margin/i);
  });

  it("requires source validity checks, underway triggers and an accessible diagram", () => {
    render(<Content />);
    const reassess = screen.getByRole("heading", { name: /brief, observe, reassess/i }).closest("section")?.textContent ?? "";
    expect(reassess).toMatch(/issue time, validity period, update time, units and station location/i);
    expect(reassess).toMatch(/forecasts cannot resolve every fog bank/i);
    expect(reassess).toMatch(/reassessment points.*trigger points/i);
    expect(screen.getByRole("img", { name: /air temperature falls.*dew point.*fog risk rises/i })).toBeTruthy();
    expect(screen.getByText(/solid\/circles/i)).toBeTruthy();
    expect(screen.getByText(/dashed\/squares/i)).toBeTruthy();
  });

  it("preserves fog Q17 and separately assesses very poor visibility", () => {
    const q17 = questions.find(({ id }) => id === "weather-17")!;
    expect(q17.question).toMatch(/fog.*visibility below/i);
    expect(q17.options[q17.correctAnswer]).toBe("1,000 m");
    expect(q17.explanation).toMatch(/below 1,000 metres/i);
    const radiation = questions.find(({ id }) => id === "weather-20")!;
    expect(radiation.question).toMatch(/Radiation fog most commonly develops/i);
    expect(radiation.options[radiation.correctAnswer]).toMatch(/clear calm nights over cooling land/i);
    const boundary = questions.find(({ id }) => id === "weather-21")!;
    expect(boundary.question).toMatch(/exactly 1,000 metres/i);
    expect(boundary.options[boundary.correctAnswer]).toBe("Poor");
    expect(boundary.explanation).toMatch(/very poor is strictly below 1,000 metres/i);
  });

  it("links current primary references", () => {
    render(<Content />);
    const refs = screen.getByRole("heading", { name: /authoritative references/i }).closest("section")!;
    const hrefs = within(refs).getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(hrefs.filter((href) => href?.includes("metoffice.gov.uk"))).toHaveLength(4);
    expect(hrefs.some((href) => href?.includes("NavRules_Handbook_Corrected_08_08_2024.pdf"))).toBe(true);
  });
});
