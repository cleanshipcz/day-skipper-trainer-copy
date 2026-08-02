import { describe, expect, it } from "vitest";
import { rigChecks, rigGuidance, rigSources } from "./rigChecks";

const allContent = () => [
  ...rigGuidance.flatMap(({ title, body }) => [title, body]),
  ...rigChecks.flatMap(({ item, lookFor, acceptableEvidence, limitations, boundary }) => [item, lookFor, acceptableEvidence, limitations, boundary]),
].join(" ").toLowerCase();

describe("rig safety guidance", () => {
  it("keeps critical no-sail and visual-inspection limitations explicit", () => {
    const content = allContent();
    for (const phrase of [
      "broken wire", "no-sail", "crack", "distortion", "missing or ineffective retention",
      "abnormal movement", "hidden chainplate", "post-incident", "overhead electrical",
    ]) expect(content).toContain(phrase);
    expect(content).toMatch(/deck-level visual check cannot establish/);
    expect(content).toMatch(/secure.*unload.*competent/);
  });

  it("rejects universal tuning, thread and calendar shortcuts", () => {
    const content = allContent();
    expect(content).toMatch(/neither 'no threads showing'.*universal/);
    expect(content).toMatch(/tuning values.*rig-specific/);
    expect(content).toMatch(/no universal calendar life/);
    expect(content).toMatch(/maker.*use.*incident.*coding.*insurer/);
  });

  it("states the principal hands-on safety boundaries", () => {
    const content = allContent();
    for (const phrase of ["sharp", "loaded lines store energy", "independent fall protection", "swing arc", "winches multiply force", "snap-back"]) expect(content).toContain(phrase);
  });

  it("gives every observation evidence, limits and a bounded action", () => {
    for (const check of rigChecks) {
      expect(check.acceptableEvidence.length).toBeGreaterThan(60);
      expect(check.limitations.length).toBeGreaterThan(50);
      expect(check.boundary).toMatch(/do not|no-sail|keep|secure|control|unload/i);
    }
  });

  it("provides dated authoritative follow-up and labels the maker example", () => {
    expect(rigSources.length).toBeGreaterThanOrEqual(5);
    expect(new Set(rigSources.map(({ id }) => id)).size).toBe(rigSources.length);
    expect(rigSources.every(({ href }) => href.startsWith("https://"))).toBe(true);
    expect(rigSources.find(({ id }) => id === "mca-coswp")).toEqual(expect.objectContaining({
      label: expect.stringMatching(/2026 edition/i),
      href: "https://www.gov.uk/government/publications/code-of-safe-working-practices-for-merchant-seafarers-2026-edition",
    }));
    expect(rigSources.find(({ id }) => id === "selden")?.label).toMatch(/maker example/i);
  });
});
