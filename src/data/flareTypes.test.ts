/**
 * Tests for the flare types data file.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S3, AC-2
 */
import { describe, expect, it } from "vitest";

describe("flareTypes data", () => {
  it("should export a non-empty readonly array of FlareType objects", async () => {
    // given
    const mod = await import("./flareTypes");

    // when
    const { flareTypes } = mod;

    // then
    expect(Array.isArray(flareTypes)).toBe(true);
    expect(flareTypes.length).toBeGreaterThan(0);
  });

  it("should define all 5 required flare types per AC-1", async () => {
    // given
    const { flareTypes } = await import("./flareTypes");

    // when
    const ids = flareTypes.map((f: { id: string }) => f.id);

    // then
    expect(ids).toContain("red-parachute-rocket");
    expect(ids).toContain("red-hand-flare");
    expect(ids).toContain("orange-smoke-hand");
    expect(ids).toContain("orange-smoke-buoyant");
    expect(ids).toContain("white-hand-flare");
    expect(flareTypes.length).toBe(5);
  });

  it("should have valid FlareType shape for every flare", async () => {
    // given
    const { flareTypes } = await import("./flareTypes");

    // then
    for (const flare of flareTypes) {
      expect(typeof flare.id).toBe("string");
      expect(flare.id.length).toBeGreaterThan(0);

      expect(typeof flare.name).toBe("string");
      expect(flare.name.length).toBeGreaterThan(0);

      expect(typeof flare.description).toBe("string");
      expect(flare.description.length).toBeGreaterThan(0);

      expect(typeof flare.range).toBe("string");
      expect(flare.range.length).toBeGreaterThan(0);

      expect(typeof flare.burnTime).toBe("string");
      expect(flare.burnTime.length).toBeGreaterThan(0);

      expect(typeof flare.daySuitability).toBe("boolean");
      expect(typeof flare.nightSuitability).toBe("boolean");

      expect(typeof flare.expiryRules).toBe("string");
      expect(flare.expiryRules.length).toBeGreaterThan(0);

      expect(typeof flare.usage).toBe("string");
      expect(flare.usage.length).toBeGreaterThan(0);
    }
  });

  it("should have unique flare IDs", async () => {
    // given
    const { flareTypes } = await import("./flareTypes");

    // when
    const ids = flareTypes.map((f: { id: string }) => f.id);
    const uniqueIds = new Set(ids);

    // then
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should distinguish daylight smoke from red/white signals that remain visible by day", async () => {
    // given
    const { flareTypes } = await import("./flareTypes");

    // when
    const dayOnly = flareTypes.filter(
      (f: { daySuitability: boolean; nightSuitability: boolean }) =>
        f.daySuitability && !f.nightSuitability,
    );
    const dayAndNight = flareTypes.filter(
      (f: { daySuitability: boolean; nightSuitability: boolean }) =>
        f.daySuitability && f.nightSuitability,
    );

    // then
    expect(dayOnly.length).toBeGreaterThanOrEqual(1);
    expect(dayAndNight.length).toBeGreaterThanOrEqual(1);
    expect(flareTypes.filter((f) => f.id.includes("smoke")).every((f) => f.daySuitability && !f.nightSuitability)).toBe(true);
  });

  it("should mark white hand flare as collision warning, not distress", async () => {
    // given
    const { flareTypes } = await import("./flareTypes");

    // when
    const whiteFlare = flareTypes.find(
      (f: { id: string }) => f.id === "white-hand-flare",
    );

    // then
    expect(whiteFlare).toBeDefined();
    expect(whiteFlare.usage.toLowerCase()).toContain("collision");
    expect(whiteFlare.description.toLowerCase()).toContain("not one of");
  });

  it("records authoritative sources, EVDS boundaries and safe operating stages", async () => {
    const { evdsGuidance, flareOperatingSequence, flareSources } = await import("./flareTypes");
    expect(flareSources.length).toBeGreaterThanOrEqual(6);
    expect(flareSources.every((source) => source.href.startsWith("https://"))).toBe(true);
    expect(flareSources.map(({ id }) => id)).toEqual(expect.arrayContaining(["mca-min542", "mca-min687", "mca-mgn599", "imo-colregs"]));
    expect(evdsGuidance).toMatch(/does not automatically replace/i);
    expect(flareOperatingSequence.join(" ")).toMatch(/misfire/i);
  });

  it("states the current Class XII outfit without generalising it to other vessels", async () => {
    const { solasAndMakerBoundary, ukCarriageGuidance } = await import("./flareTypes");
    expect(ukCarriageGuidance).toMatch(/13\.7 m and over are Class XII/i);
    expect(ukCarriageGuidance).toMatch(/Category C waters and seaward/);
    expect(ukCarriageGuidance).toMatch(/4 red hand flares plus 2 orange smoke flares/);
    expect(ukCarriageGuidance).toMatch(/under 13\.7 m have no specific statutory flare-carriage requirement/i);
    expect(ukCarriageGuidance).toMatch(/different requirements/);
    expect(solasAndMakerBoundary).toMatch(/different questions/);
    expect(solasAndMakerBoundary).toMatch(/exact product's markings and instructions/);
  });

  it("maps versioned performance and representative maker instructions across every form", async () => {
    const { flareOperatingSequence, flareSources, flareStorageBoundary, representativeManufacturerInstructions, FLARE_IDS } = await import("./flareTypes");
    expect(flareSources.map(({ id }) => id)).toEqual(expect.arrayContaining(["imo-solas-2020", "imo-lsa-2017", "imo-msc48-66"]));
    const covered = new Set(representativeManufacturerInstructions.flatMap(({ flareIds }) => flareIds));
    expect(covered).toEqual(new Set(Object.values(FLARE_IDS)));
    expect(representativeManufacturerInstructions.every(({ href, version }) => href.startsWith("https://painswessex.com/our-products/") && /Product \d+/.test(version))).toBe(true);
    const operations = flareOperatingSequence.join(" ");
    expect(operations).toMatch(/different pull wires, tabs, delays and water deployment/i);
    expect(operations).toMatch(/misfire.*manufacturer/i);
    expect(flareStorageBoundary).toMatch(/temperature and container limits/i);
    expect(flareStorageBoundary).toMatch(/check recalls.*printed expiry date/i);
  });

  it("records corrected MGN 599 publication provenance", async () => {
    const { flareSources } = await import("./flareTypes");
    expect(flareSources.find(({ id }) => id === "mca-mgn599")?.version).toContain("Published 14 November 2024; updated 10 December 2024");
  });
});

describe("flareScenarios data", () => {
  it("should export a non-empty readonly array of FlareScenario objects", async () => {
    // given
    const mod = await import("./flareTypes");

    // when
    const { flareScenarios } = mod;

    // then
    expect(Array.isArray(flareScenarios)).toBe(true);
    expect(flareScenarios.length).toBeGreaterThanOrEqual(6);
  });

  it("should have valid FlareScenario shape for every scenario", async () => {
    // given
    const { flareScenarios, FLARE_IDS } = await import("./flareTypes");

    // when
    const validIds = new Set(Object.values(FLARE_IDS));

    // then
    for (const scenario of flareScenarios) {
      expect(typeof scenario.id).toBe("string");
      expect(scenario.id.length).toBeGreaterThan(0);

      expect(typeof scenario.description).toBe("string");
      expect(scenario.description.length).toBeGreaterThan(0);

      expect(typeof scenario.correctFlareId).toBe("string");
      expect(validIds.has(scenario.correctFlareId)).toBe(true);

      expect(typeof scenario.explanation).toBe("string");
      expect(scenario.explanation.length).toBeGreaterThan(0);
    }
  });

  it("should have unique scenario IDs", async () => {
    // given
    const { flareScenarios } = await import("./flareTypes");

    // when
    const ids = flareScenarios.map((s: { id: string }) => s.id);
    const uniqueIds = new Set(ids);

    // then
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should reference at least 3 different flare types across all scenarios", async () => {
    // given
    const { flareScenarios } = await import("./flareTypes");

    // when
    const usedFlareIds = new Set(
      flareScenarios.map((s: { correctFlareId: string }) => s.correctFlareId),
    );

    // then
    expect(usedFlareIds.size).toBeGreaterThanOrEqual(3);
  });
});

describe("FLARE_IDS constants", () => {
  it("should export FLARE_IDS object with all 5 flare type IDs", async () => {
    // given
    const { FLARE_IDS } = await import("./flareTypes");

    // then
    expect(FLARE_IDS).toBeDefined();
    expect(FLARE_IDS.RED_PARACHUTE_ROCKET).toBe("red-parachute-rocket");
    expect(FLARE_IDS.RED_HAND_FLARE).toBe("red-hand-flare");
    expect(FLARE_IDS.ORANGE_SMOKE_HAND).toBe("orange-smoke-hand");
    expect(FLARE_IDS.ORANGE_SMOKE_BUOYANT).toBe("orange-smoke-buoyant");
    expect(FLARE_IDS.WHITE_HAND_FLARE).toBe("white-hand-flare");
  });
});

describe("flare qualified-review release contract", () => {
  it("releases under the waiver while rejecting incomplete review evidence", async () => {
    const { flareQualifiedReview, flareReview, isFlareContentReleased, isFlareQualifiedReviewComplete } = await import("./flareTypes");
    expect(isFlareContentReleased).toBe(true);
    expect(flareReview.practitionerReviewWaived).toBe(true);
    expect(isFlareQualifiedReviewComplete(flareQualifiedReview, flareReview.contentVersion)).toBe(false);
    const almostComplete = { reviewerName: "Qualified reviewer", qualification: "Relevant maritime qualification", reviewedOn: "2026-08-12", reviewedCommit: "abc123", approvedContentVersion: flareReview.contentVersion, status: "approved" as const, sourceIds: [] };
    for (const key of ["reviewerName", "qualification", "reviewedOn", "reviewedCommit", "approvedContentVersion"] as const) {
      expect(isFlareQualifiedReviewComplete({ ...almostComplete, sourceIds: (await import("./flareTypes")).flareSources.map(source => source.id), [key]: null }, flareReview.contentVersion)).toBe(false);
    }
    expect(isFlareQualifiedReviewComplete(almostComplete, flareReview.contentVersion)).toBe(false);
  });

  it("derives release only from complete approved evidence for this version and all sources", async () => {
    const { flareReview, FLARE_QUALIFIED_REVIEW_SOURCE_IDS, isFlareQualifiedReviewComplete, representativeManufacturerInstructions } = await import("./flareTypes");
    const complete = { reviewerName: "Qualified reviewer", qualification: "Relevant maritime qualification", reviewedOn: "2026-08-12", reviewedCommit: "abc123", approvedContentVersion: flareReview.contentVersion, status: "approved" as const, sourceIds: FLARE_QUALIFIED_REVIEW_SOURCE_IDS };
    expect(isFlareQualifiedReviewComplete(complete, flareReview.contentVersion)).toBe(true);
    expect(isFlareQualifiedReviewComplete({ ...complete, status: "pending" }, flareReview.contentVersion)).toBe(false);
    expect(isFlareQualifiedReviewComplete({ ...complete, approvedContentVersion: "stale" }, flareReview.contentVersion)).toBe(false);
    expect(isFlareQualifiedReviewComplete({ ...complete, sourceIds: complete.sourceIds.slice(1) }, flareReview.contentVersion)).toBe(false);
    const duplicateSubstitution = [...complete.sourceIds.slice(0, -1), complete.sourceIds[0]];
    expect(duplicateSubstitution).toHaveLength(complete.sourceIds.length);
    expect(isFlareQualifiedReviewComplete({ ...complete, sourceIds: duplicateSubstitution }, flareReview.contentVersion)).toBe(false);
    for (const manufacturer of representativeManufacturerInstructions) {
      expect(isFlareQualifiedReviewComplete({ ...complete, sourceIds: complete.sourceIds.filter(id => id !== manufacturer.id) }, flareReview.contentVersion)).toBe(false);
    }
    expect(isFlareQualifiedReviewComplete({ ...complete, reviewedOn: "2999-01-01" }, flareReview.contentVersion)).toBe(false);
    expect(isFlareQualifiedReviewComplete({ ...complete, reviewedOn: "2026-99-99" }, flareReview.contentVersion)).toBe(false);
  });
});
