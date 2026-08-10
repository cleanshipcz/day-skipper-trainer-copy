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
    const phenomena = screen.getByRole("heading", { name: /fog is not a forecast visibility term/i }).closest("section")?.textContent ?? "";
    expect(phenomena).toMatch(/Fog.*water droplets.*below 1,000 m/i);
    expect(phenomena).toMatch(/Mist.*water droplets.*1,000 m or more/i);
    expect(phenomena).toMatch(/Haze.*dry particles/i);
    expect(phenomena).toMatch(/weather.*fog, mist, rain or drizzle.*separately.*visibility/i);
    const colreg = screen.getByRole("heading", { name: /COLREG restricted visibility/i }).closest("section")?.textContent ?? "";
    expect(colreg).toMatch(/fog, mist, falling snow, heavy rainstorms, sandstorms/i);
    expect(colreg).toMatch(/no single distance.*Rule 19/i);
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
    expect(hrefs.filter((href) => href?.includes("metoffice.gov.uk"))).toHaveLength(2);
    expect(hrefs.some((href) => href?.includes("NavRules_Handbook_Corrected_08_08_2024.pdf"))).toBe(true);
  });
});
