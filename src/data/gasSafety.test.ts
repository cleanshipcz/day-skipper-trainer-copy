/**
 * Tests for the gas safety data file.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S5, AC-1
 */
import { describe, expect, it } from "vitest";

describe("gasSafety data", () => {
  it("should export a non-empty readonly array of GasSafetyTopic objects", async () => {
    // given
    const mod = await import("./gasSafety");

    // when
    const { gasSafetyTopics } = mod;

    // then
    expect(Array.isArray(gasSafetyTopics)).toBe(true);
    expect(gasSafetyTopics.length).toBeGreaterThan(0);
  });

  it("should cover all required theory areas per AC-1", async () => {
    // given
    const { gasSafetyTopics } = await import("./gasSafety");

    // when
    const ids = gasSafetyTopics.map((t: { id: string }) => t.id);

    // then
    // - LPG properties (heavier than air)
    expect(ids).toContain("lpg-properties");
    // - isolation valves
    expect(ids).toContain("isolation-valves");
    // - bilge sniff test
    expect(ids).toContain("bilge-sniff-test");
    // - gas locker requirements
    expect(ids).toContain("gas-locker-requirements");
    // - carbon monoxide awareness
    expect(ids).toContain("carbon-monoxide");
    // - detector placement
    expect(ids).toContain("detector-placement");
  });

  it("should have valid GasSafetyTopic shape for every topic", async () => {
    // given
    const { gasSafetyTopics } = await import("./gasSafety");

    // then
    for (const topic of gasSafetyTopics) {
      expect(typeof topic.id).toBe("string");
      expect(topic.id.length).toBeGreaterThan(0);

      expect(typeof topic.title).toBe("string");
      expect(topic.title.length).toBeGreaterThan(0);

      expect(typeof topic.content).toBe("string");
      expect(topic.content.length).toBeGreaterThan(0);

      expect(Array.isArray(topic.keyPoints)).toBe(true);
      expect(topic.keyPoints.length).toBeGreaterThan(0);

      for (const point of topic.keyPoints) {
        expect(typeof point).toBe("string");
        expect(point.length).toBeGreaterThan(0);
      }
    }
  });

  it("should have unique topic IDs", async () => {
    // given
    const { gasSafetyTopics } = await import("./gasSafety");

    // when
    const ids = gasSafetyTopics.map((t: { id: string }) => t.id);
    const uniqueIds = new Set(ids);

    // then
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should mention LPG being heavier than air in the lpg-properties topic", async () => {
    // given
    const { gasSafetyTopics } = await import("./gasSafety");

    // when
    const lpgTopic = gasSafetyTopics.find(
      (t: { id: string }) => t.id === "lpg-properties",
    );

    // then
    expect(lpgTopic).toBeDefined();
    expect(lpgTopic.content.toLowerCase()).toContain("heavier than air");
  });

  it("should mention carbon monoxide as odourless and colourless", async () => {
    // given
    const { gasSafetyTopics } = await import("./gasSafety");

    // when
    const coTopic = gasSafetyTopics.find(
      (t: { id: string }) => t.id === "carbon-monoxide",
    );

    // then
    expect(coTopic).toBeDefined();
    const contentLower = coTopic.content.toLowerCase();
    expect(contentLower).toContain("odourless");
    expect(contentLower).toContain("colourless");
  });

  it("specifies marine CO alarm standard, placement and maintenance without a generic height", async () => {
    const { gasSafetyTopics } = await import("./gasSafety");
    const detector = gasSafetyTopics.find(({ id }) => id === "detector-placement")!;
    const guidance = `${detector.content} ${detector.keyPoints.join(" ")}`;
    expect(guidance).toMatch(/BS EN 50291-2/i);
    expect(guidance).toMatch(/certified audible.*boat-suitable|certified audible CO alarm suitable for boats/i);
    expect(guidance).toMatch(/living and sleeping areas/i);
    expect(guidance).toMatch(/heard|audib/i);
    expect(guidance).toMatch(/heat.*steam/i);
    expect(guidance).toMatch(/breathing-zone.*only.*instruct/i);
    expect(guidance).toMatch(/no universal.*height/i);
    expect(guidance).toMatch(/test button/i);
    expect(guidance).toMatch(/batter/i);
    expect(guidance).toMatch(/expiry.*end-of-life/i);
    expect(guidance).toMatch(/never disable/i);
  });

  it("gives vessel-specific marine LPG detector guidance without a blanket mandate or generic standard", async () => {
    const { gasSafetyTopics } = await import("./gasSafety");
    const detector = gasSafetyTopics.find(({ id }) => id === "detector-placement")!;
    const guidance = `${detector.content} ${detector.keyPoints.join(" ")}`;

    expect(guidance).toMatch(/not a universal mandate.*applicable regime/i);
    expect(guidance).toMatch(/marine-suitable equipment/i);
    expect(guidance).toMatch(/detector and vessel manufacturers' instructions/i);
    expect(guidance).toMatch(/low space where leaked vapour could collect/i);
    expect(guidance).toMatch(/bilge water.*oil.*chemicals.*damage/i);
    expect(guidance).toMatch(/ignition-hazard.*certification/i);
    expect(guidance).toMatch(/vapour-tight.*locker|locker.*vapour-tight/i);
    expect(guidance).toMatch(/audible.*visible.*helm.*accommodation.*sleeping occupants.*applicable/i);
    expect(guidance).toMatch(/solenoid interlock.*automatically isolate the LPG supply/i);
    expect(guidance).toMatch(/which supply or branch it isolates.*alarm response.*reset procedure.*vessel and detector manufacturers' instructions/i);
    expect(guidance).toMatch(/complete installed (?:LPG detector )?chain.*sensor.*wiring.*sounder.*solenoid/i);
    expect(guidance).toMatch(/not merely the control-panel button/i);
    expect(guidance).toMatch(/test and calibration intervals.*power supply.*fault indication/i);
    expect(guidance).toMatch(/expiry or end-of-life/i);
    expect(guidance).not.toMatch(/BS EN 50194|mount (?:the )?(?:LPG )?(?:sensor|detector) (?:at|within)|all boats must (?:have|fit)/i);
  });

  it("exposes scoped LPG detector sources without claiming practitioner approval", async () => {
    const { lpgDetectorSources } = await import("./gasSafety");
    expect(lpgDetectorSources.map(({ id }) => id)).toEqual(["bss-lpg-safety", "mca-mgn-280", "rya-gas-safety"]);
    expect(lpgDetectorSources.find(({ id }) => id === "mca-mgn-280")?.scope).toMatch(/stated commercial-use scope.*not.*universal/i);
    expect(lpgDetectorSources.map(({ scope }) => scope).join(" ")).not.toMatch(/practitioner approved|verified by.*engineer/i);
  });

  it("teaches complete CO prevention and ordered emergency response", async () => {
    const { gasSafetyTopics } = await import("./gasSafety");
    const co = gasSafetyTopics.find(({ id }) => id === "carbon-monoxide")!;
    const guidance = `${co.content} ${co.keyPoints.join(" ")}`;
    expect(guidance).toMatch(/competent installation and servicing/i);
    expect(guidance).toMatch(/fixed ventilation.*flues.*exhausts/i);
    expect(guidance).toMatch(/generators.*neighbouring craft/i);
    expect(guidance).toMatch(/yellow flames.*sooting.*condensation/i);
    const freshAir = guidance.indexOf("fresh air");
    expect(freshAir).toBeGreaterThan(-1);
    expect(guidance.indexOf("stop engines", freshAir)).toBeGreaterThan(freshAir);
    expect(guidance.indexOf("call emergency services", freshAir)).toBeGreaterThan(freshAir);
    expect(guidance).toMatch(/urgent medical advice/i);
    expect(guidance).toMatch(/do not re-enter until/i);
    expect(guidance).toMatch(/oxygen is (?:only )?for trained.*equipped responders/i);
    expect(guidance).not.toMatch(/administer oxygen if available/i);
  });

  it("should have exactly 6 topics covering all required areas", async () => {
    // given
    const { gasSafetyTopics } = await import("./gasSafety");

    // then
    expect(gasSafetyTopics.length).toBe(6);
  });

  it("keeps every learner summary qualified and free of unsafe generic actions", async () => {
    const { gasSafetyTopics } = await import("./gasSafety");
    const rendered = gasSafetyTopics.flatMap(({ keyPoints }) => keyPoints).join("\n");

    expect(rendered).not.toMatch(/sniff the bilge|open(?:ing)? all hatches|daily routine/i);
    expect(rendered).not.toMatch(/cylinders stored upright|must have an overboard drain/i);
    expect(rendered).not.toMatch(/mount low|head height|near the cooker/i);
    expect(rendered).toMatch(/manufacturer's exact placement instructions/i);
    expect(rendered).toMatch(/summon help/i);
  });

  it("requires a safe continuously falling LPG locker drain and rejects below-waterline guidance", async () => {
    const { gasSafetyTopics } = await import("./gasSafety");
    const locker = gasSafetyTopics.find(({ id }) => id === "gas-locker-requirements")!;
    const guidance = `${locker.content} ${locker.keyPoints.join(" ")}`;
    expect(guidance).toMatch(/accessible (?:only )?from outside/i);
    expect(guidance).toMatch(/vapour-tight to the accommodation/i);
    expect(guidance).toMatch(/low(?:est)? point.*falls continuously|continuously falling.*low point/i);
    expect(guidance).toMatch(/unobstructed/i);
    expect(guidance).toMatch(/at least 75 mm above the at-rest waterline/i);
    expect(guidance).toMatch(/away from hull openings/i);
    expect(guidance).toMatch(/at least 500 mm from openings into the vessel/i);
    expect(guidance).toMatch(/blockage.*corrosion or damage.*connections.*stored items/i);
    expect(guidance).toMatch(/below-waterline outlet is unsafe guidance/i);
    expect(guidance).not.toMatch(/drain(?:age)? (?:outlet )?(?:may|can|should|must) (?:terminate|discharge|be) below (?:the )?waterline/i);
  });

  it("records source scope without claiming universal law or practitioner approval", async () => {
    const { gasLockerReview, gasLockerSources } = await import("./gasSafety");
    expect(gasLockerSources.map(({ id }) => id)).toEqual(["rya-rcr-gas", "rya-installation-maintenance", "mca-mgn-280", "rya-gas-safety", "gas-safe-boats"]);
    expect(gasLockerSources.find(({ id }) => id === "mca-mgn-280")?.scope).toMatch(/governed by the Code.*not stated as universal law/i);
    expect(gasLockerSources.find(({ id }) => id === "gas-safe-boats")?.href).toBe(
      "https://www.gassaferegister.co.uk/media/drxliecz/gas-on-boats-factsheet.pdf",
    );
    expect(gasLockerReview.sourceIds).toEqual(gasLockerSources.map(({ id }) => id));
    expect(gasLockerReview.qualifiedReview.status).toBe("pending");
    expect(gasLockerReview.qualifiedReview.reviewerName).toBeNull();
    expect(gasLockerReview.releaseNote).toMatch(/No qualified practitioner approval is recorded/i);
  });

  it("exposes the verified canonical official CO source URLs", async () => {
    const { carbonMonoxideSources } = await import("./gasSafety");
    expect(carbonMonoxideSources.map(({ href }) => href)).toEqual([
      "https://www.gov.uk/government/publications/fire-safety-on-boats/fire-safety-on-boats-accessible-version",
      "https://www.boatsafetyscheme.org/stay-safe-advice/carbon-monoxide-co/",
    ]);
  });

  it("teaches a complete no-ignition leak response and competent-person boundary", async () => {
    const { gasSafetyTopics } = await import("./gasSafety");
    const response = gasSafetyTopics.find(({ id }) => id === "bilge-sniff-test")!;
    const guidance = `${response.content} ${response.keyPoints.join(" ")}`;

    expect(guidance).toMatch(/smell.*warning|warning.*smell/i);
    expect(guidance).toMatch(/shut the (?:LPG )?supply only if.*safe/i);
    expect(guidance).toMatch(/electrical switch(?:es)? (?:either )?on or off|switch on or off/i);
    expect(guidance).toMatch(/evacuat/i);
    expect(guidance).toMatch(/through-draught/i);
    expect(guidance).toMatch(/summon.*help/i);
    expect(guidance).toMatch(/out of use until.*competent boat-LPG.*pressure\/leak test/i);
    expect(guidance).toMatch(/do not handle.*move a cylinder|do not handle, disconnect or move the cylinder/i);
  });

  it("separates owner checks from competent LPG testing and repair", async () => {
    const { gasSafetyTopics } = await import("./gasSafety");
    const isolation = gasSafetyTopics.find(({ id }) => id === "isolation-valves")!;
    const guidance = `${isolation.content} ${isolation.keyPoints.join(" ")}`;

    expect(guidance).toMatch(/owner.*visual checks/i);
    expect(guidance).toMatch(/bubble tester.*manufacturer/i);
    expect(guidance).toMatch(/competent boat-LPG.*pressure.*leak testing/i);
    expect(guidance).toMatch(/diagnosis.*repair/i);
  });

  it("teaches RCR and ISO 10239-oriented installation and appliance controls", async () => {
    const { gasSafetyTopics } = await import("./gasSafety");
    const guidance = gasSafetyTopics.map(({ content, keyPoints }) => `${content} ${keyPoints.join(" ")}`).join(" ");
    expect(guidance).toMatch(/vapour-withdrawal system/i);
    expect(guidance).toMatch(/upright.*secured.*rough weather/i);
    expect(guidance).toMatch(/each appliance.*(?:distribution )?branch and closing device/i);
    expect(guidance).toMatch(/cylinder\/main supply valve.*appliance branch closing device.*installation-specific secondary tap/i);
    expect(guidance).toMatch(/flame supervision/i);
    expect(guidance).toMatch(/fixed ventilation/i);
    expect(guidance).toMatch(/intended for LPG and the marine environment.*manufacturer/i);
    expect(guidance).toMatch(/RYA RCR\/ISO overview.*ISO 10239:2014.*EN 16129 Annex M.*marked.*Marine/i);
    expect(guidance).toMatch(/not verified.*ISO 10239:2025/i);
    expect(guidance).not.toMatch(/current ISO 10239 guidance/i);
  });

  it("scopes user maintenance, competent work and rented-boat obligations", async () => {
    const { gasUserRoutine, gasWorkBoundaries } = await import("./gasSafety");
    const routine = [...gasUserRoutine.preUse, ...gasUserRoutine.shutdown].join(" ");
    const boundaries = Object.values(gasWorkBoundaries).join(" ");
    expect(routine).toMatch(/bubble tester.*manufacturer/i);
    expect(routine).toMatch(/leak-detection fluid/i);
    expect(routine).toMatch(/rough weather.*isolate at the cylinder/i);
    expect(routine).toMatch(/any secondary or master control the installation provides.*cylinder or designated main supply valve.*vessel and manufacturer procedure/i);
    expect(boundaries).toMatch(/pressure\/tightness testing.*servicing.*diagnosis.*repair/i);
    expect(boundaries).toMatch(/not a blanket rule for every private pleasure craft/i);
    expect(boundaries).toMatch(/hired out as a business.*Gas Safe registered engineer/i);
    expect(boundaries).toMatch(/rented boat.*Gas Safety Record/i);
    expect(`${routine} ${boundaries}`).not.toMatch(/annual DIY|DIY joint test/i);
  });
});
