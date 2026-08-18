/**
 * Tests for the personal safety equipment data file.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S4, AC-1
 */
import { describe, expect, it } from "vitest";

describe("lifeJacketTypes data", () => {
  it("should export a non-empty readonly array of LifeJacketType objects", async () => {
    // given
    const mod = await import("./personalSafetyEquipment");

    // when
    const { lifeJacketTypes } = mod;

    // then
    expect(Array.isArray(lifeJacketTypes)).toBe(true);
    expect(lifeJacketTypes.length).toBeGreaterThan(0);
  });

  it("distinguishes the Level 50 buoyancy aid from Level 100, 150, and 275 lifejackets", async () => {
    // given
    const { lifeJacketTypes } = await import("./personalSafetyEquipment");

    // when
    const buoyancyRatings = lifeJacketTypes.map(
      (lj: { buoyancyRating: string }) => lj.buoyancyRating,
    );

    // then
    expect(buoyancyRatings).toContain("50N");
    expect(buoyancyRatings).toContain("100N");
    expect(buoyancyRatings).toContain("150N");
    expect(buoyancyRatings).toContain("275N");
    expect(lifeJacketTypes.length).toBe(4);
    expect(lifeJacketTypes.find((lj) => lj.buoyancyRating === "50N")?.name).toBe(
      "Level 50 Buoyancy Aid",
    );
    for (const rating of ["100N", "150N", "275N"]) {
      expect(lifeJacketTypes.find((lj) => lj.buoyancyRating === rating)?.name).toMatch(
        /Lifejacket$/,
      );
    }
  });

  it("should have valid LifeJacketType shape for every entry", async () => {
    // given
    const { lifeJacketTypes } = await import("./personalSafetyEquipment");

    // then
    for (const lj of lifeJacketTypes) {
      expect(typeof lj.id).toBe("string");
      expect(lj.id.length).toBeGreaterThan(0);

      expect(typeof lj.name).toBe("string");
      expect(lj.name.length).toBeGreaterThan(0);

      expect(typeof lj.buoyancyRating).toBe("string");
      expect(lj.buoyancyRating.length).toBeGreaterThan(0);

      expect(typeof lj.description).toBe("string");
      expect(lj.description.length).toBeGreaterThan(0);

      expect(typeof lj.suitableFor).toBe("string");
      expect(lj.suitableFor.length).toBeGreaterThan(0);

      expect(typeof lj.selfRightingPerformance).toBe("string");
      expect(lj.selfRightingPerformance.length).toBeGreaterThan(0);
    }
  });

  it("should have unique life jacket IDs", async () => {
    // given
    const { lifeJacketTypes } = await import("./personalSafetyEquipment");

    // when
    const ids = lifeJacketTypes.map((lj: { id: string }) => lj.id);
    const uniqueIds = new Set(ids);

    // then
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("gives safe, level-specific selection and self-righting guidance", async () => {
    // given
    const { lifeJacketTypes } = await import("./personalSafetyEquipment");

    // when
    const guidanceFor = (rating: string) => {
      const record = lifeJacketTypes.find((lj) => lj.buoyancyRating === rating);
      expect(record).toBeDefined();
      return `${record!.description} ${record!.suitableFor} ${record!.selfRightingPerformance}`
        .toLowerCase();
    };
    const level50 = guidanceFor("50N");
    const level100 = guidanceFor("100N");
    const level150 = guidanceFor("150N");
    const level275 = guidanceFor("275N");

    // then
    expect(level50).toMatch(/competent swimmer/);
    expect(level50).toMatch(/sheltered|calm/);
    expect(level50).toMatch(/not designed to (?:turn|self-right)/);

    expect(level100).toMatch(/sheltered|calm/);
    expect(level100).toMatch(/not intended for offshore|not suitable for offshore/);
    expect(level100).toMatch(/manufacturer/);
    expect(level100).toMatch(/fit/);
    expect(level100).toMatch(/cloth/);
    expect(level100).toMatch(/never assume.*guaranteed/);

    expect(level150).toMatch(/offshore/);
    expect(level150).toMatch(/rough weather|rough-weather/);
    expect(level150).toMatch(/manufacturer/);
    expect(level150).toMatch(/design/);
    expect(level150).toMatch(/cloth/);
    expect(level150).toMatch(/fit/);
    expect(level150).toMatch(/no universal guarantee/);

    expect(level275).toMatch(/offshore|ocean/);
    expect(level275).toMatch(/severe|demanding/);
    expect(level275).toMatch(/heavy|heavier/);
    expect(level275).toMatch(/trapped air/);
    expect(level275).toMatch(/manufacturer/);
    expect(level275).toMatch(/fit/);
    expect(level275).toMatch(/can prevent or delay turning/);

    for (const guidance of [level50, level100, level150, level275]) {
      expect(guidance).not.toMatch(/will (?:always )?turn (?:an? |the )?(?:unconscious )?(?:wearer|casualty)/);
      expect(guidance).not.toMatch(/guarantees? (?:that )?(?:every|all) wearers?/);
    }
  });
});

describe("inflationMethods data", () => {
  it("should export a non-empty readonly array of InflationMethod objects", async () => {
    // given
    const mod = await import("./personalSafetyEquipment");

    // when
    const { inflationMethods } = mod;

    // then
    expect(Array.isArray(inflationMethods)).toBe(true);
    expect(inflationMethods.length).toBeGreaterThanOrEqual(2);
  });

  it("distinguishes manual, water-activated, and hydrostatic inflation", async () => {
    // given
    const { inflationMethods } = await import("./personalSafetyEquipment");

    // when
    const names = inflationMethods.map(
      (m: { id: string }) => m.id,
    );

    // then
    expect(names).toContain("automatic-water-activated");
    expect(names).toContain("automatic-hydrostatic");
    expect(names).toContain("manual");
  });

  it("teaches activation trade-offs without attributing rain or spray triggers to hydrostatic heads", async () => {
    const { inflationMethods, oralInflationGuidance, safetyEquipmentTopics } = await import("./personalSafetyEquipment");
    const water = inflationMethods.find((method) => method.id === "automatic-water-activated")!;
    const hydrostatic = inflationMethods.find((method) => method.id === "automatic-hydrostatic")!;
    const manual = inflationMethods.find((method) => method.id === "manual")!;

    expect(`${water.description} ${water.disadvantages}`).toMatch(/water-sensitive|wetting/i);
    expect(water.disadvantages).toMatch(/rain.*spray|spray.*rain/i);
    expect(hydrostatic.description).toMatch(/water pressure|pressure-activated/i);
    expect(hydrostatic.advantages).toMatch(/resisting activation from rain, spray/i);

    const unsafeHydrostaticWettingClaim = new RegExp(
      [
        String.raw`\b(?:can|could|may|will|is|are)\s+(?:be\s+)?(?:accidentally\s+|unintentionally\s+)?(?:triggered|activated)\s+(?:by|from|in)\s+(?:(?!\b(?:not|rather\s+than)\b)[^.!?]){0,40}\b(?:rain|spray)\b`,
        String.raw`\b(?:rain|spray)\b[^.!?]{0,60}\b(?:can|could|may|will)\s+(?:cause\s+)?(?:an?\s+)?(?:unwanted\s+|accidental\s+)?(?:activation|triggering|trigger|activate)\b`,
        String.raw`\b(?:triggers?|activates?)\s+(?:in|from|because of|when exposed to)\s+(?:(?!\b(?:not|rather\s+than)\b)[^.!?]){0,40}\b(?:rain|spray)\b`,
      ].join("|"),
      "i",
    );
    const hydrostaticLearnerFields = [
      hydrostatic.name,
      hydrostatic.description,
      hydrostatic.advantages,
      hydrostatic.disadvantages,
    ];

    for (const field of hydrostaticLearnerFields) {
      expect(field).not.toMatch(unsafeHydrostaticWettingClaim);
    }
    expect("It may be accidentally triggered by heavy rain or spray.").toMatch(unsafeHydrostaticWettingClaim);
    expect("Rain or spray can cause unwanted activation.").toMatch(unsafeHydrostaticWettingClaim);
    expect("The unit activates when exposed to spray.").toMatch(unsafeHydrostaticWettingClaim);
    expect("It resists activation from rain and spray.").not.toMatch(unsafeHydrostaticWettingClaim);
    expect("It is activated by water pressure, not rain or spray.").not.toMatch(unsafeHydrostaticWettingClaim);
    expect("It is activated by water pressure rather than rain or spray.").not.toMatch(unsafeHydrostaticWettingClaim);
    expect(manual.description).toMatch(/pull a toggle|pull a .*cord/i);
    expect(manual.disadvantages).toMatch(/conscious/i);
    expect(oralInflationGuidance).toMatch(/topping up.*emergency backup/i);
    expect(oralInflationGuidance).toMatch(/not a substitute/i);

    const servicing = safetyEquipmentTopics.find((topic) => topic.id === "servicing")!;
    expect(servicing.keyPoints.join(" ")).toMatch(/manufacturer-specific/i);
  });

  it("should have valid InflationMethod shape for every entry", async () => {
    // given
    const { inflationMethods } = await import("./personalSafetyEquipment");

    // then
    for (const method of inflationMethods) {
      expect(typeof method.id).toBe("string");
      expect(method.id.length).toBeGreaterThan(0);

      expect(typeof method.name).toBe("string");
      expect(method.name.length).toBeGreaterThan(0);

      expect(typeof method.description).toBe("string");
      expect(method.description.length).toBeGreaterThan(0);

      expect(typeof method.advantages).toBe("string");
      expect(method.advantages.length).toBeGreaterThan(0);

      expect(typeof method.disadvantages).toBe("string");
      expect(method.disadvantages.length).toBeGreaterThan(0);
    }
  });
});

describe("safetyEquipmentTopics data", () => {
  it("should export a non-empty readonly array of SafetyEquipmentTopic objects", async () => {
    // given
    const mod = await import("./personalSafetyEquipment");

    // when
    const { safetyEquipmentTopics } = mod;

    // then
    expect(Array.isArray(safetyEquipmentTopics)).toBe(true);
    expect(safetyEquipmentTopics.length).toBeGreaterThanOrEqual(4);
  });

  it("should cover all required AC-1 topics: servicing, crotch straps, harnesses/tethers, jacklines, kill cords", async () => {
    // given
    const { safetyEquipmentTopics } = await import("./personalSafetyEquipment");

    // when
    const ids = safetyEquipmentTopics.map(
      (t: { id: string }) => t.id,
    );

    // then
    expect(ids).toContain("servicing");
    expect(ids).toContain("crotch-straps");
    expect(ids).toContain("harnesses-tethers");
    expect(ids).toContain("jacklines");
    expect(ids).toContain("kill-cords");
  });

  it("should have valid SafetyEquipmentTopic shape for every entry", async () => {
    // given
    const { safetyEquipmentTopics } = await import("./personalSafetyEquipment");

    // then
    for (const topic of safetyEquipmentTopics) {
      expect(typeof topic.id).toBe("string");
      expect(topic.id.length).toBeGreaterThan(0);

      expect(typeof topic.name).toBe("string");
      expect(topic.name.length).toBeGreaterThan(0);

      expect(typeof topic.description).toBe("string");
      expect(topic.description.length).toBeGreaterThan(0);

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
    const { safetyEquipmentTopics } = await import("./personalSafetyEquipment");

    // when
    const ids = safetyEquipmentTopics.map((t: { id: string }) => t.id);
    const uniqueIds = new Set(ids);

    // then
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should qualify kill-cord attachment, testing, maintenance, and legal guidance", async () => {
    const { safetyEquipmentTopics } = await import("./personalSafetyEquipment");
    const topic = safetyEquipmentTopics.find((item) => item.id === "kill-cords");
    const guidance = topic?.keyPoints.join(" ") ?? "";

    expect(guidance).toMatch(/engine and boat manufacturers' instructions/i);
    expect(guidance).toMatch(/cannot slip off or detach during normal helm movement/i);
    expect(guidance).toMatch(/loose loop around a bare wrist/i);
    expect(guidance).toMatch(/ordinary lifejacket or harness D-ring/i);
    expect(guidance).toMatch(/purpose-designed point/i);
    expect(guidance).toMatch(/before setting off/i);
    expect(guidance).toMatch(/after changing helm operator, cord, switch, or helm arrangement/i);
    expect(guidance).toMatch(/replace suspect or time-expired parts/i);
    expect(guidance).toMatch(/correct serviceable spare/i);
    expect(guidance).toMatch(/essential safe practice/i);
    expect(guidance).toMatch(/statutory or coded-vessel requirements may also apply/i);
  });

  it("teaches tether transfer without assuming every tether has two working hooks", async () => {
    const { safetyEquipmentTopics } = await import("./personalSafetyEquipment");
    const topic = safetyEquipmentTopics.find((item) => item.id === "harnesses-tethers")!;
    const guidance = `${topic.description} ${topic.keyPoints.join(" ")}`;

    expect(guidance).toMatch(/two-ended tether.*one working attachment/i);
    expect(guidance).toMatch(/three-point tether.*second working leg or intermediate hook/i);
    expect(guidance).toMatch(/clip the free working hook.*tug.*then release the previous hook/i);
    expect(guidance).toMatch(/does not require momentary unclipping/i);
    expect(guidance).not.toMatch(/always maintain.*unclip and re-clip one hook at a time/i);
  });

  it("keeps the wearer aboard and treats a tethered casualty as a practised recovery", async () => {
    const { safetyEquipmentTopics } = await import("./personalSafetyEquipment");
    const harness = safetyEquipmentTopics.find((item) => item.id === "harnesses-tethers")!;
    const jackstay = safetyEquipmentTopics.find((item) => item.id === "jacklines")!;
    const guidance = `${harness.description} ${harness.keyPoints.join(" ")} ${jackstay.description} ${jackstay.keyPoints.join(" ")}`;

    expect(guidance).toMatch(/keep the wearer aboard wherever practicable/i);
    expect(guidance).toMatch(/dragged alongside.*drown/i);
    expect(guidance).toMatch(/shortest suitable working leg.*inboard route/i);
    expect(guidance).toMatch(/practise a vessel-specific tethered-MOB recovery/i);
    expect(guidance).toMatch(/prevent propeller exposure.*continued dragging/i);
    expect(guidance).toMatch(/does not by itself recover/i);
  });

  it("requires verified strongpoints, safe hook loading, and retirement after load or doubt", async () => {
    const { safetyEquipmentTopics } = await import("./personalSafetyEquipment");
    const harness = safetyEquipmentTopics.find((item) => item.id === "harnesses-tethers")!;
    const jackstay = safetyEquipmentTopics.find((item) => item.id === "jacklines")!;
    const guidance = `${harness.keyPoints.join(" ")} ${jackstay.keyPoints.join(" ")}`;

    expect(guidance).toMatch(/purpose-designed strongpoints or jackstays verified for the boat/i);
    expect(guidance).toMatch(/ordinary cleats/i);
    expect(guidance).toMatch(/self-closing hooks/i);
    expect(guidance).toMatch(/physically tug|look at the connection and tug/i);
    expect(guidance).toMatch(/snag.*side-load/i);
    expect(guidance).toMatch(/overload indicator/i);
    expect(guidance).toMatch(/retire the tether immediately.*significant load/i);
    expect(guidance).toMatch(/loading history is in doubt/i);
    expect(guidance).not.toMatch(/pad eyes, cleats, or dedicated jackline anchorage points/i);
  });

  it("records sources and honest review status while separating guidance, standards, and racing rules", async () => {
    const { safetyEquipmentTopics, tetherJackstayReview, tetherJackstaySources } = await import("./personalSafetyEquipment");
    const guidance = safetyEquipmentTopics.find((item) => item.id === "harnesses-tethers")!.keyPoints.join(" ");

    expect(guidance).toMatch(/For recreational sailing/i);
    expect(guidance).toMatch(/ISO 12401 is a product standard/i);
    expect(guidance).toMatch(/World Sailing Offshore Special Regulations.*offshore racing/i);
    expect(guidance).toMatch(/not as universal law/i);
    expect(tetherJackstaySources.map((source) => source.id)).toEqual([
      "rya-lifejackets-harnesses",
      "world-sailing-osr-2026-2027",
      "maib-annual-report-2019-cv30",
    ]);
    expect(tetherJackstayReview.sourceIds).toEqual(tetherJackstaySources.map((source) => source.id));
    expect(tetherJackstayReview.qualifiedReview.status).toBe("pending");
    expect(tetherJackstayReview.qualifiedReview.reviewerName).toBeNull();
    expect(tetherJackstayReview.releaseNote).toMatch(/No qualified practitioner approval is recorded/i);
  });

  it("attributes each tether and jackstay source only to its evidenced scope", async () => {
    const { tetherJackstayReview, tetherJackstaySources } = await import("./personalSafetyEquipment");
    const rya = tetherJackstaySources.find((source) => source.id === "rya-lifejackets-harnesses")!;
    const worldSailing = tetherJackstaySources.find((source) => source.id === "world-sailing-osr-2026-2027")!;
    const maib = tetherJackstaySources.find((source) => source.id === "maib-annual-report-2019-cv30")!;

    expect(rya.label).toMatch(/PFD harness attachment-point context/i);
    expect(rya.scope).toMatch(/Recreational PFD context only/i);
    expect(rya.scope).toMatch(/not a source for jackstay design, tether transfer, hook loading, or tethered-MOB recovery/i);
    expect(worldSailing.label).toMatch(/sections 4\.04 and 5\.02/i);
    expect(worldSailing.label).not.toMatch(/3\.23/);
    expect(worldSailing.scope).toMatch(/Offshore-racing requirements/i);
    expect(maib.scope).toMatch(/Accident evidence/i);
    expect(tetherJackstayReview.reviewScope).toMatch(/PFD attachment-point context.*RYA/i);
    expect(tetherJackstayReview.reviewScope).toMatch(/Tether and jackstay claims.*World Sailing.*MAIB/i);
    expect(tetherJackstayReview.reviewScope).toMatch(/manufacturer instructions.*vessel-specific competent assessment.*recreational use/i);
    expect(tetherJackstayReview.qualifiedReview.status).toBe("pending");
  });

  it("should include servicing schedule information", async () => {
    // given
    const { safetyEquipmentTopics } = await import("./personalSafetyEquipment");

    // when
    const servicing = safetyEquipmentTopics.find(
      (t: { id: string }) => t.id === "servicing",
    );

    // then
    expect(servicing).toBeDefined();
    expect(servicing!.description.toLowerCase()).toMatch(/servic|inspect|maintain/);
  });

  it("separates owner checks, approved servicing, and regulated-vessel requirements", async () => {
    const { lifejacketServicingGuidance, lifejacketServiceSources, safetyEquipmentTopics } = await import("./personalSafetyEquipment");
    const { ownerChecks, approvedService, regulatedVessels } = lifejacketServicingGuidance;
    const ownerText = `${ownerChecks.description} ${ownerChecks.keyPoints.join(" ")}`;
    const serviceText = `${approvedService.description} ${approvedService.keyPoints.join(" ")}`;
    const legalText = `${regulatedVessels.description} ${regulatedVessels.keyPoints.join(" ")}`;
    const allGeneralGuidance = [
      safetyEquipmentTopics.find((topic) => topic.id === "servicing")!.description,
      ...safetyEquipmentTopics.find((topic) => topic.id === "servicing")!.keyPoints,
      ownerText,
      serviceText,
    ].join(" ");

    expect(ownerText).toMatch(/before use|before each passage/i);
    expect(ownerText).toMatch(/24 hours.*manufacturer-dependent/i);
    expect(ownerText).toMatch(/withdraw.*from use/i);
    expect(serviceText).toMatch(/product label|current manual/i);
    expect(serviceText).toMatch(/approved.*exact make and model/i);
    expect(serviceText).toMatch(/manufacturer permits owner re-arming/i);
    expect(legalText).toMatch(/commercial.*SOLAS|SOLAS.*commercial/i);
    expect(legalText).toMatch(/MGN 548.*12 months/i);
    expect(allGeneralGuidance).not.toMatch(/(?:should|must|is to be) (?:be )?(?:professionally )?serviced every 12 months/i);
    expect(allGeneralGuidance).not.toMatch(/leave inflated for 24 hours/i);
    expect(lifejacketServiceSources.map((source) => source.href)).toEqual(expect.arrayContaining([
      expect.stringMatching(/^https:\/\/www\.rya\.org\.uk\//),
      expect.stringMatching(/^https:\/\/www\.gov\.uk\/government\/publications\/mgn-548/),
    ]));
  });
});

describe("LIFE_JACKET_IDS constants", () => {
  it("should export LIFE_JACKET_IDS object with all 4 buoyancy level IDs", async () => {
    // given
    const { LIFE_JACKET_IDS } = await import("./personalSafetyEquipment");

    // then
    expect(LIFE_JACKET_IDS).toBeDefined();
    expect(typeof LIFE_JACKET_IDS.BUOYANCY_50N).toBe("string");
    expect(typeof LIFE_JACKET_IDS.BUOYANCY_100N).toBe("string");
    expect(typeof LIFE_JACKET_IDS.BUOYANCY_150N).toBe("string");
    expect(typeof LIFE_JACKET_IDS.BUOYANCY_275N).toBe("string");
  });
});
