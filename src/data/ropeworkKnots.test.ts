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
    expect(knot("reef-knot").uses).toBe(
      "A binding knot for tying reef points or securing a bundle. Never use it as a bend to join load-bearing ropes: it can spill, capsize, or pull undone.",
    );
    expect(knot("reef-knot").steps).toContain(
      "Use only as a binding knot; choose a suitable bend, such as a correctly tied Sheet Bend, for joining ropes under load",
    );
  });

  it("qualifies the Clove Hitch for changing and directional loads", () => {
    expect(knot("clove-hitch").uses).toBe(
      "A quick, adjustable temporary attachment, such as for a fender. Do not rely on it alone for mooring or critical loads: it can slip under changing loads and bind after heavy loading.",
    );
    expect(knot("clove-hitch").steps).toContain(
      "Inspect before use; for a fender, secure the tail with additional half hitches around the standing part, and choose a more secure hitch for changing or critical loads",
    );
  });

  it("qualifies a Bowline used for mooring under cyclic loading", () => {
    expect(knot("bowline").uses).toBe(
      "Creates a fixed loop at a rope's end. It can secure a mooring line to a ring or post, but cyclic loading or shaking while slack can work it loose; do not use it where the line must be released under load.",
    );
    expect(knot("bowline").steps).toContain(
      "Inspect the path and leave a generous tail appropriate to the rope; use an approved backup where cyclic loading could shake the bowline loose",
    );
  });

  it("makes Rolling Hitch direction, finishing, and limits explicit", () => {
    const rollingHitch = knot("rolling-hitch");
    expect(rollingHitch.uses).toBe(
      "Attaches a usually smaller rope to a larger rope for a pull nearly parallel to the larger rope, gripping in one stated direction only. It may fail on slippery modern rope or if pulled away from the main rope.",
    );
    expect(rollingHitch.steps).toEqual([
      "Point the standing part of the hitching rope in the exact direction of the expected pull, nearly parallel to the main rope, and leave a generous working end",
      "On the side from which that pull is expected, pass the working end around the main rope to make the first turn",
      "Continue in the same direction for a second turn toward the pull; cross over the first turn and tuck the working end between the first turn and the main rope",
      "Continue around the main rope in the same direction and finish with a half hitch on the side away from the pull",
      "Dress the two gripping turns tightly together toward the pull, snug the final half hitch, and set the hitch before applying load",
      "Inspect the direction and tail, then test progressively: it must grip only along the main rope toward the doubled turns; do not use it on slippery rope or for a sideways pull",
    ]);
  });
});
