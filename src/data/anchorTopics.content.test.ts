import { describe, expect, it } from "vitest";
import { anchorClaimReviews, anchorSources, topics } from "./anchorTopics";

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

  it("requires an exact, located basis for every learner-facing safety statement", () => {
    const displayedStatements = topics.flatMap((topic) => [topic.content, ...topic.tips]).sort();
    const reviewedStatements = anchorClaimReviews.map(({ text }) => text).sort();
    expect(reviewedStatements).toEqual(displayedStatements);
    expect(new Set(reviewedStatements).size).toBe(reviewedStatements.length);
    const knownSources = new Set(anchorSources.map(({ id }) => id));
    for (const claim of anchorClaimReviews) {
      expect(claim.basis.length).toBeGreaterThan(0);
      for (const reference of claim.basis) {
        expect(knownSources.has(reference.sourceId)).toBe(true);
        expect(reference.locator.length).toBeGreaterThan(12);
      }
    }
    for (const topic of topics) {
      const displayedSources = new Set(topic.sourceIds);
      for (const claim of anchorClaimReviews.filter(({ text }) => [topic.content, ...topic.tips].includes(text))) {
        expect(claim.basis.every(({ sourceId }) => displayedSources.has(sourceId))).toBe(true);
      }
    }
  });

  it("preserves the exact safety-critical qualifications", () => {
    const copy = topics.flatMap((topic) => [topic.content, ...topic.tips]).join(" ");
    for (const phrase of [
      "no anchor type or size is best for every boat or bottom",
      "Use current location guidance to avoid anchoring in protected or sensitive seabed habitats",
      "rather than relying on one universal ratio",
      "never stand astride or over a moving rode",
      "do not use it as the permanent anchoring strong point",
      "Use two fixed shore points as a transit",
      "No single observation replaces lookout and repeated checks",
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
