/**
 * Personal safety equipment data for the Personal Safety Equipment sub-module.
 *
 * Covers the personal safety equipment a Day Skipper student must know:
 * life jacket types (100N, 150N, 275N), inflation methods (auto vs manual),
 * servicing schedule, crotch straps, harnesses & tethers, jacklines, and kill cords.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S4, AC-1
 */

// ── Life Jacket Types ──────────────────────────────────────────────────────

/** Known life jacket IDs — used for compile-time validation. */
export type LifeJacketId = "buoyancy-100n" | "buoyancy-150n" | "buoyancy-275n";

export const LIFE_JACKET_IDS = {
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
  readonly turnsUnconsciousWearer: boolean;
}

export const lifeJacketTypes: readonly LifeJacketType[] = [
  {
    id: "buoyancy-100n",
    name: "100 Newton Buoyancy Aid",
    buoyancyRating: "100N",
    description:
      "A buoyancy aid rather than a true life jacket. Designed to assist a conscious swimmer and allow freedom of movement. Does not have sufficient buoyancy to turn an unconscious casualty face-up in the water.",
    suitableFor:
      "Inshore sailing, dinghy sailing, and water sports where the wearer is a competent swimmer and rescue is close at hand. Not recommended for offshore or heavy weather sailing.",
    turnsUnconsciousWearer: false,
  },
  {
    id: "buoyancy-150n",
    name: "150 Newton Life Jacket",
    buoyancyRating: "150N",
    description:
      "The standard offshore life jacket for most recreational sailing. Provides enough buoyancy to turn an unconscious wearer face-up and keep their airway clear of the water, even when wearing light clothing.",
    suitableFor:
      "Coastal and offshore sailing. The minimum recommended standard for Day Skipper level and most cruising situations. Should be worn whenever on deck in rough weather or at night.",
    turnsUnconsciousWearer: true,
  },
  {
    id: "buoyancy-275n",
    name: "275 Newton Life Jacket",
    buoyancyRating: "275N",
    description:
      "The highest buoyancy rating, designed for extreme conditions. Provides sufficient buoyancy to turn an unconscious wearer face-up even when wearing heavy foul-weather gear and oilskins that trap air and resist turning.",
    suitableFor:
      "Offshore and ocean passages, commercial vessels, and heavy weather sailing where crew may be wearing multiple layers of heavy clothing. Required by some commercial codes of practice.",
    turnsUnconsciousWearer: true,
  },
];

// ── Inflation Methods ──────────────────────────────────────────────────────

export type InflationMethodId = "auto-inflate" | "manual";

export interface InflationMethod {
  readonly id: InflationMethodId;
  readonly name: string;
  readonly description: string;
  readonly advantages: string;
  readonly disadvantages: string;
}

export const inflationMethods: readonly InflationMethod[] = [
  {
    id: "auto-inflate",
    name: "Automatic (Hydrostatic) Inflation",
    description:
      "The life jacket inflates automatically when immersed in water. A hydrostatic release mechanism detects water pressure and triggers a CO₂ gas cylinder to inflate the bladder. Most modern offshore life jackets use this system.",
    advantages:
      "Inflates even if the wearer is unconscious or incapacitated. No action required — critical when a crew member falls overboard unexpectedly, especially at night or in heavy weather.",
    disadvantages:
      "Can be triggered accidentally by spray, heavy rain, or water in the cockpit. The hydrostatic mechanism and CO₂ cylinder must be serviced regularly and replaced after firing. More expensive than manual models.",
  },
  {
    id: "manual",
    name: "Manual Inflation",
    description:
      "The wearer must pull a toggle or cord to trigger the CO₂ cylinder and inflate the life jacket. Some models also have an oral inflation tube as a backup. The wearer must be conscious and able to activate the device.",
    advantages:
      "Will not inflate accidentally in spray or rain. Lower servicing costs and simpler mechanism. Preferred by some dinghy sailors and racers who want to avoid accidental inflation.",
    disadvantages:
      "Requires the wearer to be conscious and have the presence of mind to pull the toggle. Useless if the wearer is knocked unconscious by the boom or on falling into the water.",
  },
];

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
      "Life jackets must be serviced regularly to ensure they will function when needed. A life jacket that fails to inflate in an emergency is worse than useless — the wearer may not have attempted to swim because they trusted the device. Annual professional servicing is the standard for inflatable life jackets.",
    keyPoints: [
      "Inflatable life jackets should be professionally serviced every 12 months by a manufacturer-approved service agent.",
      "Check the CO₂ cylinder is correctly fitted, not corroded, and has not been discharged — weigh it if in doubt.",
      "Inspect the hydrostatic release mechanism (auto-inflate models) — replace at or before the expiry date printed on the unit.",
      "Check the oral inflation tube is clear and the valve seals correctly.",
      "Inspect all webbing, stitching, and buckles for wear, UV damage, or salt corrosion.",
      "Test-inflate the bladder orally and leave inflated for 24 hours to check for slow leaks.",
      "Record each service date and keep the service log with the vessel's safety documentation.",
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
      "A kill cord is a coiled lanyard that attaches to the helm operator and to the engine's emergency stop switch. If the operator is thrown from the helm position, the cord pulls the switch and stops the engine immediately, preventing the propeller from injuring anyone in the water.",
    keyPoints: [
      "The kill cord must be attached to the helm operator at all times when the engine is running — this is a legal requirement for many commercial vessels and strongly recommended for all leisure craft.",
      "Attach the kill cord to a secure point on the body — wrist, thigh, or life jacket D-ring. Do not attach it to clothing that could tear away.",
      "Test the kill cord before every departure by pulling it to confirm the engine stops.",
      "Carry a spare kill cord on board — a lost kill cord means the engine cannot be restarted on many outboard motors.",
      "When handing over the helm, transfer the kill cord to the new operator before they take control.",
      "Kill cords are especially critical on RIBs, tenders, and open boats where the risk of being thrown from the helm is highest.",
    ],
  },
];
