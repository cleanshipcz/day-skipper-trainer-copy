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
    const stages = within(passage).getAllByRole("listitem");
    const expectedStages = [
      {
        name: "Ahead of the warm front",
        fields: [/pressure falls/i, /true wind.*east or southeast.*veers.*south.*strengthens if isobars tighten/i, /cirrus.*cloud lowers and thickens/i, /rain becomes persistent/i, /visibility deteriorates/i, /temperature may begin to rise/i],
      },
      {
        name: "Warm-front passage and warm sector",
        fields: [/pressure.*steadies or falls more slowly/i, /true wind.*veers toward southwest.*fresh wind where the gradient remains steep/i, /low cloud/i, /rain may ease to drizzle/i, /poor visibility can persist/i, /milder and humid/i],
      },
      {
        name: "Cold-front passage",
        fields: [/pressure reaches a minimum then starts to rise/i, /true wind.*veers sharply.*west or northwest.*squalls/i, /towering or cumulonimbus cloud/i, /heavy rain.*showers/i, /visibility.*very poor.*then improve/i, /temperature falls/i],
      },
      {
        name: "Behind the cold front",
        fields: [/pressure rises/i, /west or northwest wind.*stay strong when isobars remain close/i, /cloud becomes broken/i, /showery|showers/i, /visibility.*good between showers/i, /colder/i],
      },
    ];

    expect(stages).toHaveLength(expectedStages.length);
    for (const [index, expected] of expectedStages.entries()) {
      const stageText = stages[index].textContent ?? "";
      expect(stageText).toMatch(new RegExp(`^${expected.name}`, "i"));
      for (const field of expected.fields) expect(stageText).toMatch(field);
    }
    expect(within(passage).getByText(/typical Northern Hemisphere depression/i)).toBeTruthy();
    expect(within(passage).getByText(/track, speed, depth.*can change it/i)).toBeTruthy();
  });

  it("qualifies pressure, wind and weather through an occluded-front passage", () => {
    render(<TheoryContent />);
    const occlusion = screen.getByRole("heading", { name: /worked passage: occlusion/i }).closest("section")!;
    const text = occlusion.textContent ?? "";
    for (const field of [
      /pressure commonly falls.*level then rise/i,
      /true wind may veer and become gusty/i,
      /cloud thickens/i,
      /prolonged rain or showers/i,
      /reduce visibility.*visibility improve/i,
      /temperature change can be small/i,
    ]) expect(text).toMatch(field);
    expect(text).toMatch(/do not infer an exact wind shift or clearance time/i);
    expect(text).toMatch(/successive charts.*forecast.*barometer and observations/i);
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
