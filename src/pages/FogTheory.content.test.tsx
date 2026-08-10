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

  it("preserves the safety-critical Rule 19 scope and alteration constraints", () => {
    render(<Content />);
    const scope = screen.getByRole("heading", { name: /fog, forecast terms and COLREGs/i }).closest("section")?.textContent ?? "";
    expect(scope).toMatch(/Rules 4–10 apply in any visibility/i);
    expect(scope).toMatch(/Rules 11–18 apply only when vessels are in sight/i);
    expect(scope).toMatch(/Rule 19 applies.*not in sight.*in or near restricted visibility/i);
    const avoid = screen.getByRole("heading", { name: /detect, assess and avoid/i }).closest("section")?.textContent ?? "";
    expect(avoid).toMatch(/avoid port for a vessel forward of the beam.*except when overtaking/i);
    expect(avoid).toMatch(/avoid altering toward a vessel abeam or abaft the beam/i);
    expect(avoid).toMatch(/fog signal apparently forward of the beam.*minimum.*keep course.*take all way off.*extreme caution/i);
  });

  it("teaches a prioritized small-craft plan and systematic risk assessment", () => {
    render(<Content />);
    const plan = screen.getByRole("heading", { name: /restricted-visibility action plan/i }).closest("section")?.textContent ?? "";
    expect(plan).toMatch(/Before entering:.*avoid, delay or divert.*lookout.*safe speed.*engine.*navigation lights.*Rule 35/i);
    expect(plan).toMatch(/Before entering:.*lifejackets.*clip on.*competent helm.*immediate hand steering/i);
    expect(plan).toMatch(/position.*depth.*escape water.*safe anchorage.*diversion/i);
    expect(plan).toMatch(/If visibility falls suddenly:.*first control speed and heading/i);
    expect(plan).toMatch(/If visibility falls suddenly:.*lifejackets.*competent helm.*immediate hand steering/i);
    expect(plan).toMatch(/visibility, traffic density.*stopping distance and turning ability.*wind, sea and current.*draught/i);
    const assess = screen.getByRole("heading", { name: /detect, assess and avoid/i }).closest("section")?.textContent ?? "";
    expect(assess).toMatch(/repeated plots or equivalent systematic observations.*closest point of approach.*time to closest approach/i);
    expect(assess).toMatch(/AIS.*missing, delayed or wrong/i);
    expect(assess).toMatch(/radar reflector.*does not guarantee/i);
    expect(assess).toMatch(/if in doubt, deem collision risk to exist/i);
  });

  it("covers Rule 35 and applies Rule 19 in scenarios", () => {
    render(<Content />);
    const scenarios = screen.getByRole("heading", { name: /sound signals and small-craft scenarios/i }).closest("section")!;
    expect(scenarios.textContent).toMatch(/making way.*one prolonged.*stopped.*two prolonged.*sailing vessel.*one prolonged followed by two short/i);
    expect(scenarios.textContent).toMatch(/At anchor.*bell rapidly.*five seconds.*one minute/i);
    expect(within(scenarios).getByRole("link", { name: /Rule 35 lesson/i }).getAttribute("href")).toBe("/rules/lights/theory?section=sounds#rule-35");
    expect(scenarios.textContent).toMatch(/Radar contact 20°.*steady bearing and decreasing range.*do not classify.*Rule 15/i);
    expect(scenarios.textContent).toMatch(/Prolonged blast ahead.*minimum speed at which the vessel can be kept on course.*all way off/i);
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
    expect(hrefs).toContain("https://weather.metoffice.gov.uk/guides/coast-and-sea/glossary");
    expect(hrefs).toContain("https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/fog");
    expect(hrefs).toContain("https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/humidity");
    expect(hrefs).toContain("https://www.gov.uk/government/publications/msn-1781-mf-amendment-3-the-merchant-shipping-regulations-1996-colreg");
    expect(hrefs).toContain("https://www.gov.uk/government/publications/mgn-369-mf-amendment-1-navigation-safety-navigation-practices-relevant-to-restricted-visibility");
  });
});
