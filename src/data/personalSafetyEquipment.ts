/**
 * Personal safety equipment data for the Personal Safety Equipment sub-module.
 *
 * Covers the personal safety equipment a Day Skipper student must know:
 * buoyancy aids and life jacket levels (50, 100, 150, 275), inflation methods,
 * servicing schedule, crotch straps, harnesses & tethers, jacklines, and kill cords.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S4, AC-1
 */

// ── Life Jacket Types ──────────────────────────────────────────────────────

/** Known life jacket IDs — used for compile-time validation. */
export type LifeJacketId =
  | "buoyancy-50n"
  | "buoyancy-100n"
  | "buoyancy-150n"
  | "buoyancy-275n";

export const LIFE_JACKET_IDS = {
  BUOYANCY_50N: "buoyancy-50n",
  BUOYANCY_100N: "buoyancy-100n",
  BUOYANCY_150N: "buoyancy-150n",
  BUOYANCY_275N: "buoyancy-275n",
} as const satisfies Record<string, LifeJacketId>;

export interface LifeJacketType {
  readonly id: LifeJacketId;
  readonly name: string;
  readonly buoyancyRating: string;
  readonly description: string;
  readonly suitableFor: string;
  readonly selfRightingPerformance: string;
}

export const lifeJacketTypes: readonly LifeJacketType[] = [
  {
    id: "buoyancy-50n",
    name: "Level 50 Buoyancy Aid",
    buoyancyRating: "50N",
    description:
      "An ISO 12402 Level 50 buoyancy aid for competent swimmers. It assists flotation but is not a lifejacket and is not designed to turn an unconscious wearer face-up.",
    suitableFor:
      "Sheltered or calm water where help and rescue are close at hand, such as dinghy sailing and water sports. Not suitable for offshore use, rough water, or anyone unable to swim.",
    selfRightingPerformance:
      "Not designed to self-right an unconscious wearer.",
  },
  {
    id: "buoyancy-100n",
    name: "Level 100 Lifejacket",
    buoyancyRating: "100N",
    description:
      "An ISO 12402 Level 100 lifejacket for relatively sheltered or calm water. It provides limited self-righting assistance, but its performance can be affected by the design, fit, clothing, water conditions, and air trapped in clothing.",
    suitableFor:
      "Inshore and sheltered-water use where rescue should be reasonably quick. It is not intended for offshore or severe conditions and may not have enough buoyancy to overcome heavy or air-trapping clothing.",
    selfRightingPerformance:
      "May help turn some wearers face-up; never assume this is guaranteed. Check the manufacturer's stated performance and ensure the correct fit.",
  },
  {
    id: "buoyancy-150n",
    name: "Level 150 Lifejacket",
    buoyancyRating: "150N",
    description:
      "An ISO 12402 Level 150 lifejacket for general offshore and rough-weather use. It is designed to provide self-righting performance for many wearers, including with foul-weather clothing, but actual performance depends on the product, fit, clothing, and conditions.",
    suitableFor:
      "Coastal and offshore sailing and rough weather. Confirm the selected model is suitable for the clothing and equipment being worn, fits correctly, and meets the manufacturer's instructions.",
    selfRightingPerformance:
      "Designed to self-right many unconscious wearers, but no universal guarantee applies across all designs, body types, clothing, fits, and sea conditions.",
  },
  {
    id: "buoyancy-275n",
    name: "Level 275 Lifejacket",
    buoyancyRating: "275N",
    description:
      "An ISO 12402 Level 275 lifejacket offering high buoyancy for demanding offshore conditions and for wearers carrying heavy clothing or equipment. Extra buoyancy can help overcome trapped air, but it does not make self-righting unconditional.",
    suitableFor:
      "Offshore and ocean passages, severe conditions, and situations involving heavy protective clothing or equipment. Follow the manufacturer's limits because fit, equipment, clothing, and the particular design still affect performance.",
    selfRightingPerformance:
      "Designed for strong self-righting performance, including with heavier clothing, but trapped air, fit, design, body position, and conditions can prevent or delay turning.",
  },
];

// ── Inflation Methods ──────────────────────────────────────────────────────

export type InflationMethodId =
  | "automatic-water-activated"
  | "automatic-hydrostatic"
  | "manual";

export interface InflationMethod {
  readonly id: InflationMethodId;
  readonly name: string;
  readonly description: string;
  readonly advantages: string;
  readonly disadvantages: string;
}

export const inflationMethods: readonly InflationMethod[] = [
  {
    id: "automatic-water-activated",
    name: "Automatic Water-Activated Inflation",
    description:
      "A water-sensitive element dissolves or reacts when sufficiently wetted, releasing a mechanism that pierces the CO₂ cylinder and inflates the bladder. The exact trigger and delay depend on the model.",
    advantages:
      "Can inflate without action from a wearer who is unconscious or incapacitated after entering the water.",
    disadvantages:
      "Because the trigger responds to wetting, heavy rain, spray, or water collecting around the firing head can cause unwanted activation on some models. Keep it maintained and stowed as its manufacturer directs.",
  },
  {
    id: "automatic-hydrostatic",
    name: "Automatic Hydrostatic Inflation",
    description:
      "A hydrostatic firing head responds to water pressure at a specified immersion depth, then pierces the CO₂ cylinder to inflate the bladder. It is pressure-activated, not simply triggered by getting its surface wet.",
    advantages:
      "Can inflate without action from an unconscious or incapacitated wearer, while resisting activation from rain, spray, and ordinary deck wetness.",
    disadvantages:
      "It must reach the model's specified pressure or immersion condition, costs more than simpler mechanisms, and its firing head and cylinder require inspection and replacement as the manufacturer specifies.",
  },
  {
    id: "manual",
    name: "Manual Inflation",
    description:
      "The wearer must pull a toggle or cord to trigger the CO₂ cylinder and inflate the life jacket. Some models also have an oral inflation tube as a backup. The wearer must be conscious and able to activate the device.",
    advantages:
      "Will not inflate accidentally in spray or rain. Lower servicing costs and simpler mechanism. Preferred by some dinghy sailors and racers who want to avoid accidental inflation.",
    disadvantages:
      "Requires the wearer to be conscious, able to reach the toggle, and capable of acting promptly; it may provide no inflated buoyancy if the wearer is incapacitated.",
  },
];

export const oralInflationGuidance =
  "The oral inflation tube is for topping up a partly inflated bladder or as an emergency backup if the normal system fails. It is not a substitute for pulling a manual toggle or allowing the fitted automatic system to activate. Follow the lifejacket instructions; do not trigger the CO₂ cylinder when the bladder is already orally inflated because over-pressure can injure the wearer or damage the bladder.";

export const lifejacketServicingGuidance = {
  ownerChecks: {
    name: "Routine owner checks",
    description:
      "Before use and at the intervals on the product label or in its manual, inspect the lifejacket without dismantling or altering its inflation system.",
    keyPoints: [
      "Check the cover, bladder, webbing, stitching, buckles, crotch strap, whistle, light, reflective material, oral tube, and inflation indicators for damage, contamination, corrosion, or missing parts.",
      "Confirm the CO₂ cylinder is secure, undamaged, unpierced, and the specified type and charge for that model. Weigh or remove it only when the manufacturer's instructions tell the owner how to do so.",
      "Check dated firing heads, cartridges, lights, and other replaceable parts against their marked expiry dates and the manual; replace them at the earlier product-specific limit.",
      "An oral-inflation leak test, including whether the bladder should remain inflated for 24 hours, is manufacturer-dependent. Perform it only at the interval and by the method in that lifejacket's instructions, then fully deflate and repack exactly as directed.",
      "If a check finds damage, leakage, corrosion, an incorrect or expired component, an uncertain indicator, or a missed service date, withdraw the lifejacket from use until the manufacturer or an approved service station confirms it is serviceable.",
    ],
  },
  approvedService: {
    name: "Manufacturer-approved servicing",
    description:
      "Use the service interval printed on the lifejacket or stated in its current manual; there is no single leisure-lifejacket interval that overrides the product instructions.",
    keyPoints: [
      "Use a service station approved for the exact make and model whenever the label/manual requires professional servicing, after damage or a failed owner check, or whenever the owner procedure is unclear.",
      "Servicing, repairs, replacement intervals, pressure tests, and repacking must follow the manufacturer's current instructions and service bulletins.",
      "After activation, re-arm only if the manufacturer permits owner re-arming, using the exact cylinder, firing head or water-activated element, seals, and status indicators specified for that model. Otherwise use an approved service station.",
      "Record inspections, servicing, activation, re-arming, and component replacement so the next due date and fitted parts can be verified.",
    ],
  },
  regulatedVessels: {
    name: "Commercial and SOLAS requirements",
    description:
      "Commercial, coded, fishing, passenger, and SOLAS vessels may be subject to statutory service intervals, approved-service-station rules, certification, and record-keeping beyond leisure-craft owner guidance.",
    keyPoints: [
      "Identify the vessel's applicable flag-state regulations, code, certification, and survey requirements; do not assume a leisure product manual alone satisfies them.",
      "MCA MGN 548 Amendment 1 requires SOLAS-certificated inflatable lifejackets in its scope to be serviced every 12 months at an approved service station, subject only to the formal exceptions described there.",
      "Other UK commercial categories can have different regimes. Follow the applicable MCA code or regulation, the lifejacket approval and manufacturer instructions, and any surveyor direction.",
    ],
  },
} as const;

export const lifejacketServiceSources = [
  {
    label: "RYA: Life Jackets and Buoyancy Aids",
    href: "https://www.rya.org.uk/water-safety/lifejacket-safety/lifejackets-and-buoyancy-aids/",
  },
  {
    label: "MCA MGN 548 (M+F) Amendment 1: SOLAS inflatable life-saving appliance servicing",
    href: "https://www.gov.uk/government/publications/mgn-548-mf-amendment-1-life-saving-appliances-servicing-requirements-for-solas-inflatable-life-saving-appliances-at-approved-service-stations/mgn-548-mf-amendment-1-life-saving-appliances-servicing-requirements-for-solas-inflatable-life-saving-appliances-at-approved-service-stations",
  },
] as const;

// ── Safety Equipment Topics ────────────────────────────────────────────────

export interface SafetyEquipmentTopic {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly keyPoints: readonly string[];
}

export const safetyEquipmentTopics: readonly SafetyEquipmentTopic[] = [
  {
    id: "servicing",
    name: "Servicing & Maintenance Schedule",
    description:
      "Lifejackets need routine checks and servicing at the intervals specified on the product label and in the current manufacturer instructions. Legal requirements for regulated vessels are a separate minimum and may be more prescriptive.",
    keyPoints: [
      "Read the product label and current manual before checking, testing, servicing, or re-arming the lifejacket; intervals, parts, and procedures are manufacturer-specific.",
      "Keep owner checks within the procedures the manufacturer assigns to the owner; use an approved service station for specified service work and defects.",
      "Check the next service date and component expiry dates before each passage and record completed work.",
      "Apply any separate commercial, coding, flag-state, or SOLAS requirements that govern the vessel and equipment.",
    ],
  },
  {
    id: "crotch-straps",
    name: "Crotch Straps",
    description:
      "A crotch strap (or leg strap) passes between the legs and prevents the life jacket from riding up over the wearer's head when in the water. Without a crotch strap, wave action and the buoyancy of the jacket can push it upward, leaving the wearer's face unprotected.",
    keyPoints: [
      "Always fasten the crotch strap before going on deck — a life jacket without a crotch strap can ride up and slip off in the water.",
      "Most modern 150N and 275N life jackets include a crotch strap or a thigh strap as standard.",
      "Adjust the strap so the life jacket sits snugly on the torso with no slack — it should be firm but not restrictive.",
      "Check the crotch strap buckle is secure and not corroded during each pre-passage safety check.",
    ],
  },
  {
    id: "harnesses-tethers",
    name: "Harnesses & Tethers",
    description:
      "A safety harness keeps the wearer attached to the vessel via a tether clipped to a strong point or jackline. The goal is to prevent the crew member from going overboard in the first place — recovery of a person from the water is difficult, slow, and often fatal in heavy weather or cold water.",
    keyPoints: [
      "Many modern life jackets have an integrated harness — check that the harness meets ISO 12401.",
      "A tether is a short lanyard (typically 1 m or 2 m) with a carbine hook at each end that connects the harness to the vessel.",
      "Use a short tether (1 m) whenever possible — it keeps you closer to the vessel and reduces the risk of being dragged through the water.",
      "Double-action safety hooks are required — they prevent accidental opening under load.",
      "Clip on before leaving the companionway at night, in rough weather, or whenever the skipper calls for harnesses.",
      "Never clip a tether to the guardrails or stanchions — they are not designed to take the shock load of a falling body.",
      "When moving along the deck, always maintain at least one point of attachment — unclip and re-clip one hook at a time.",
    ],
  },
  {
    id: "jacklines",
    name: "Jacklines",
    description:
      "Jacklines (also called jack stays) are strong lines or webbing straps rigged fore-and-aft along the deck to provide a continuous attachment point for safety tethers. They allow crew to move between the cockpit and foredeck while remaining clipped on at all times.",
    keyPoints: [
      "Jacklines should be rigged before departure and left in place for the duration of the passage.",
      "Flat webbing jacklines are preferred over wire because they lie flat on deck and are less of a trip hazard.",
      "Rig jacklines inboard of the shrouds so that a crew member who falls will land on deck, not over the side.",
      "Attach jacklines to strong points at bow and stern — pad eyes, cleats, or dedicated jackline anchorage points.",
      "Inspect jacklines for UV degradation, chafe, and stitching failure before each passage — replace if in doubt.",
      "Jacklines should be long enough to reach from cockpit to foredeck but not so slack that a tethered person could reach the water.",
    ],
  },
  {
    id: "kill-cords",
    name: "Kill Cords (Engine Cut-Off Devices)",
    description:
      "A kill cord is a lanyard between the helm operator and the engine's emergency stop switch. If the operator is thrown away from the controls, it should operate the switch and stop the engine, reducing the risk of an uncontrolled powered craft and propeller injury.",
    keyPoints: [
      "Follow the engine and boat manufacturers' instructions for the correct cord, attachment point, checks, and replacement interval. Using the kill cord whenever the engine is running is essential safe practice; separate statutory or coded-vessel requirements may also apply, so check the rules for the vessel and waters.",
      "Attach it to the operator at the purpose-designed point specified by the manufacturer, securely enough that it cannot slip off or detach during normal helm movement. Do not assume that a loose loop around a bare wrist, clothing, or an ordinary lifejacket or harness D-ring is suitable: use a D-ring or other point only when its manufacturer identifies it for kill-cord attachment.",
      "Before setting off, start the engine as directed and test the cut-off system by operating the kill cord; confirm the engine stops, then refit it correctly before restarting. Repeat the applicable check after changing helm operator, cord, switch, or helm arrangement, following the manufacturers' procedure.",
      "When handing over the helm, stop or control the boat as instructed, transfer or reconnect the kill cord securely to the new operator, and verify the connection before they take control.",
      "Inspect the cord, clip, fittings, and switch before use for cuts, stretching, loss of recoil, corrosion, stiffness, or other damage. Replace suspect or time-expired parts with the specified type; never knot, extend, or improvise a repair unless the manufacturer expressly permits it.",
      "Carry the correct serviceable spare where it is accessible but cannot foul the controls. A spare supports recovery after a loss or failure; it must not be left fitted to defeat the cut-off switch or used to keep the engine running without the operator attached.",
      "Kill cords are especially critical on RIBs, tenders, and open boats where the risk of being thrown from the helm is highest.",
    ],
  },
];
