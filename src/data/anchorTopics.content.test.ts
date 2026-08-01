import { describe, expect, it } from "vitest";
import { anchorSources, topics } from "./anchorTopics";

describe("reviewed Anchorwork guidance", () => {
  it("keeps the five durable progress IDs and gives every claim a review basis", () => {
    expect(topics.map(({ id }) => id)).toEqual(["types", "scope", "procedure", "swinging-room", "weighing"]);
    const knownSources = new Set(anchorSources.map(({ id }) => id));
    for (const topic of topics) {
      expect(topic.sourceIds.length).toBeGreaterThan(0);
      expect(topic.sourceIds.every((id) => knownSources.has(id))).toBe(true);
      expect(topic.tips).toHaveLength(3);
    }
  });

  it("preserves the exact safety-critical qualifications", () => {
    const copy = topics.flatMap((topic) => [topic.content, ...topic.tips]).join(" ");
    for (const phrase of [
      "no anchor type or size is best for every boat or bottom",
      "charted and local restrictions take priority",
      "rather than relying on one universal ratio",
      "never stand astride or over a moving rode",
      "do not use it as the permanent anchoring strong point",
      "at least two suitable cues",
      "not a substitute for lookout and repeated checks",
      "Rule 30 lights and day shape applicable to the vessel and circumstances",
      "do not force the windlass or put a person in danger",
      "mechanically secure the anchor and windlass controls for sea",
    ]) expect(copy).toContain(phrase);
  });

  it("does not restore unsafe universal anchor or scope rules", () => {
    const copy = topics.flatMap((topic) => [topic.content, ...topic.tips]).join(" ");
    expect(copy).not.toMatch(/minimum 4:1|7:1 for rough|excellent in sand|good holding/i);
  });
});
