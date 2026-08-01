import { describe, expect, it } from "vitest";

import { knots } from "./ropeworkKnots";

const knot = (id: string) => {
  const match = knots.find((candidate) => candidate.id === id);
  expect(match, `Missing knot: ${id}`).toBeDefined();
  return match!;
};

describe("ropework knot safety guidance", () => {
  it("keeps the catalogue complete and structurally usable", () => {
    expect(knots.map(({ id }) => id)).toEqual([
      "bowline",
      "clove-hitch",
      "reef-knot",
      "figure-eight",
      "round-turn",
      "sheet-bend",
      "rolling-hitch",
    ]);

    for (const entry of knots) {
      expect(entry.uses.length).toBeGreaterThan(20);
      expect(entry.steps.length).toBeGreaterThanOrEqual(5);
      expect(entry.steps.join(" ")).toMatch(/dress|snug/i);
      expect(entry.steps.join(" ")).toMatch(/inspect/i);
      expect(entry.steps.join(" ")).toMatch(/tail/i);
    }
  });

  it("does not teach the Reef Knot as a load-bearing bend", () => {
    expect(knot("reef-knot").uses).toMatch(/binding knot/i);
    expect(knot("reef-knot").uses).toMatch(/never.*join.*load-bearing/i);
    expect(knot("reef-knot").steps.join(" ")).toMatch(/suitable bend.*Sheet Bend/i);
  });

  it("qualifies the Clove Hitch for changing and directional loads", () => {
    const guidance = `${knot("clove-hitch").uses} ${knot("clove-hitch").steps.join(" ")}`;
    expect(guidance).toMatch(/slip/i);
    expect(guidance).toMatch(/capsize/i);
    expect(guidance).toMatch(/load changes direction|changing.*loads/i);
    expect(guidance).toMatch(/not rely on it alone|more secure hitch/i);
  });

  it("qualifies a Bowline used for mooring under cyclic loading", () => {
    const guidance = `${knot("bowline").uses} ${knot("bowline").steps.join(" ")}`;
    expect(guidance).toMatch(/cyclic load/i);
    expect(guidance).toMatch(/slack|shak/i);
    expect(guidance).toMatch(/loosen|capsize/i);
    expect(guidance).toMatch(/released? under load/i);
  });

  it("makes Rolling Hitch direction, finishing, and limits explicit", () => {
    const rollingHitch = knot("rolling-hitch");
    const guidance = `${rollingHitch.uses} ${rollingHitch.steps.join(" ")}`;
    expect(guidance).toMatch(/direction of the expected pull/i);
    expect(guidance).toMatch(/nearly parallel/i);
    expect(guidance).toMatch(/second turn toward the pull/i);
    expect(guidance).toMatch(/tuck.*between the first turn and the main rope/i);
    expect(guidance).toMatch(/half hitch.*away from the pull/i);
    expect(guidance).toMatch(/slippery/i);
    expect(guidance).toMatch(/sideways pull/i);
  });
});
