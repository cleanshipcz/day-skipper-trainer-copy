// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { weatherForecastSections } from "./WeatherForecastsTheory";

const Content = () => <>{weatherForecastSections.map(({ title, body }) => <section key={title}><h2>{title}</h2>{body}</section>)}</>;

describe("marine forecast safety guidance", () => {
  it("protects the official product scopes, fields, and warning thresholds", () => {
    render(<Content />);
    const products = screen.getByRole("heading", { name: /right official product/i }).closest("section")!;
    const text = products.textContent ?? "";
    expect(text).toMatch(/Shipping Forecast.*31 named sea areas.*gale warnings.*general synopsis.*wind direction and force.*sea state.*weather and visibility/i);
    expect(text).toMatch(/Inshore Waters Forecast.*12 nautical miles.*19 coastal areas/i);
    expect(text).toMatch(/Gale Warning.*force 8.*34 knots/i);
    expect(text).toMatch(/Strong Wind Warning.*force 6.*22 knots.*not a gale warning/i);
  });

  it("separates resilient acquisition from forecast corroboration", () => {
    render(<Content />);
    const acquisition = screen.getByRole("heading", { name: /disciplined acquisition/i }).closest("section")!;
    const text = acquisition.textContent ?? "";
    for (const requirement of [/product, route area and adjacent/i, /issue time, start time, valid period and time zone/i, /current gale, strong-wind and navigational warnings/i, /two independent acquisition paths/i, /same bulletin.*not two independent forecasts/i, /corroborate the official forecast against current observations/i, /supplementary.*never overrides an official warning/i, /recheck before departure.*area boundaries.*diverge/i]) expect(text).toMatch(requirement);
    expect(text).not.toMatch(/two independent sources/i);
  });

  it("distinguishes MSI reception from online and model aids", () => {
    render(<Content />);
    const delivery = screen.getByRole("heading", { name: /delivery routes/i }).closest("section")!;
    const text = delivery.textContent ?? "";
    expect(text).toMatch(/VHF.*channel 16.*working channel/i);
    expect(text).toMatch(/NAVTEX.*518 kHz.*490 kHz/i);
    expect(text).toMatch(/internet is not an MSI broadcast channel.*must not be the sole/i);
    expect(text).toMatch(/model viewers.*not an official warning.*uncertainty/i);
  });

  it("pins operational time, wind, sea-state, and visibility meanings", () => {
    render(<Content />);
    expect(screen.getByRole("heading", { name: /Timing language/i }).closest("section")?.textContent).toMatch(/Imminent.*within 6 hours.*Soon.*6–12 hours.*Later.*more than 12 hours/i);
    const decode = screen.getByRole("heading", { name: /Decode the bulletin/i }).closest("section")!;
    const text = decode.textContent ?? "";
    expect(text).toMatch(/Veering.*clockwise.*backing.*anticlockwise.*cyclonic.*variable/i);
    expect(text).toMatch(/Smooth.*under 0.5 m.*slight.*0.5–1.25 m.*moderate.*1.25–2.5 m.*rough.*2.5–4 m.*very rough.*4–6 m/i);
    expect(text).toMatch(/Very poor.*under 1,000 m.*poor.*1,000 m–2 NM.*moderate.*2–5 NM.*good.*over 5 NM/i);
  });

  it("turns the worked forecast into bounded decisions and reassessment", () => {
    render(<Content />);
    const worked = screen.getByRole("heading", { name: /worked passage decision/i }).closest("section")!;
    const text = worked.textContent ?? "";
    for (const requirement of [/plan for southwest 7.*rough sea.*poor visibility/i, /translate “later” from the issue time/i, /written limits.*crew experience.*reef/i, /sheltered water.*diversion.*last decision point/i, /current warnings through a second independent acquisition path.*corroborate.*actual wind, pressure, sea and visibility/i, /official warnings retain primacy/i, /No-go or escalation triggers.*new gale\/strong-wind warning.*wind against tide.*visibility.*escape option.*crew concern/i]) expect(text).toMatch(requirement);
    expect(within(worked).getAllByRole("listitem")).toHaveLength(5);
  });

  it("links current authoritative Met Office and MCA references", () => {
    render(<Content />);
    const references = screen.getByRole("heading", { name: /authoritative references/i }).closest("section")!;
    const hrefs = within(references).getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(hrefs.some((href) => href?.includes("weather.metoffice.gov.uk/guides/coast-and-sea"))).toBe(true);
    expect(hrefs.some((href) => href?.includes("advice-note-1033"))).toBe(true);
    expect(hrefs.some((href) => href?.includes("maritime-safety-information-broadcasts"))).toBe(true);
  });
});
