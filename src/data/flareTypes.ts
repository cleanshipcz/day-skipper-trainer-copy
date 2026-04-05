/**
 * Flare types data for the Flares & Pyrotechnics sub-module.
 *
 * Covers the five flare types a Day Skipper student must know:
 * red parachute rocket, red hand flare, orange smoke (hand),
 * orange smoke (buoyant), and white hand flare (collision warning).
 *
 * Each entry lists range, burn time, day/night suitability, expiry rules,
 * and intended usage.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S3, AC-2
 */

/** Known flare IDs — used for compile-time validation of scenario data. */
export type FlareId =
  | "red-parachute-rocket"
  | "red-hand-flare"
  | "orange-smoke-hand"
  | "orange-smoke-buoyant"
  | "white-hand-flare";

export const FLARE_IDS = {
  RED_PARACHUTE_ROCKET: "red-parachute-rocket",
  RED_HAND_FLARE: "red-hand-flare",
  ORANGE_SMOKE_HAND: "orange-smoke-hand",
  ORANGE_SMOKE_BUOYANT: "orange-smoke-buoyant",
  WHITE_HAND_FLARE: "white-hand-flare",
} as const satisfies Record<string, FlareId>;

export interface FlareType {
  readonly id: FlareId;
  readonly name: string;
  readonly description: string;
  readonly range: string;
  readonly burnTime: string;
  readonly daySuitability: boolean;
  readonly nightSuitability: boolean;
  readonly expiryRules: string;
  readonly usage: string;
}

export const flareTypes: readonly FlareType[] = [
  {
    id: "red-parachute-rocket",
    name: "Red Parachute Rocket",
    description:
      "Fires a bright red flare to approximately 300 m (1,000 ft) altitude, where a parachute deploys and the flare descends slowly. The most effective long-range distress signal at sea.",
    range: "Up to 40 km (25 miles) in clear visibility at night; 10–15 km by day",
    burnTime: "40 seconds under parachute",
    daySuitability: true,
    nightSuitability: true,
    expiryRules:
      "Stamped with a manufacture date. Must be replaced before the expiry date printed on the casing (typically 3 years from manufacture). Expired flares should be returned to a coastguard station or chandlery for safe disposal — never thrown overboard.",
    usage:
      "Primary long-range distress signal. Fire vertically in calm conditions; at an angle of 15° downwind in strong wind to prevent the parachute drifting back over the vessel. Use when you need to attract attention from a distant vessel or aircraft.",
  },
  {
    id: "red-hand-flare",
    name: "Red Hand Flare",
    description:
      "A handheld flare that burns bright red. Used to pinpoint your position once a rescue vessel or aircraft is within visual range.",
    range: "5–7 km (3–4 miles) at night; shorter by day",
    burnTime: "60 seconds",
    daySuitability: false,
    nightSuitability: true,
    expiryRules:
      "Stamped with a manufacture date. Must be replaced before the expiry date (typically 3 years). Expired flares should be disposed of safely through a coastguard station or chandlery.",
    usage:
      "Short-range distress pinpointing signal. Hold at arm's length on the downwind side to avoid burns and dripping residue. Use once rescue services are in the area and you need to guide them to your exact position.",
  },
  {
    id: "orange-smoke-hand",
    name: "Orange Smoke (Hand)",
    description:
      "A handheld canister that produces dense orange smoke. Most effective for daytime signalling and for indicating wind direction to helicopter pilots.",
    range: "3–5 km (2–3 miles) in daylight",
    burnTime: "60 seconds",
    daySuitability: true,
    nightSuitability: false,
    expiryRules:
      "Stamped with a manufacture date. Must be replaced before the expiry date (typically 3 years). Dispose of expired units via coastguard or chandlery.",
    usage:
      "Daytime distress signal and wind direction indicator. Hold at arm's length downwind. Particularly useful for guiding helicopter rescue — the smoke shows wind direction for approach. Less effective in strong wind as smoke disperses quickly.",
  },
  {
    id: "orange-smoke-buoyant",
    name: "Orange Smoke (Buoyant)",
    description:
      "A floating canister thrown into the water that produces dense orange smoke. Designed for use from life rafts or when a handheld flare cannot be safely held.",
    range: "3–5 km (2–3 miles) in daylight",
    burnTime: "3 minutes",
    daySuitability: true,
    nightSuitability: false,
    expiryRules:
      "Stamped with a manufacture date. Must be replaced before the expiry date (typically 3 years). Dispose of expired units safely — never dump at sea.",
    usage:
      "Daytime distress signal deployed from life rafts or thrown overboard. Longer burn time than hand smoke. Deploy to windward of your position so smoke drifts across your location, marking it for rescuers.",
  },
  {
    id: "white-hand-flare",
    name: "White Hand Flare",
    description:
      "A handheld flare that burns bright white. NOT a distress signal — used to warn other vessels of your presence to avoid collision.",
    range: "5–7 km (3–4 miles) at night",
    burnTime: "60 seconds",
    daySuitability: false,
    nightSuitability: true,
    expiryRules:
      "Stamped with a manufacture date. Must be replaced before the expiry date (typically 3 years). Dispose of expired units safely via coastguard or chandlery.",
    usage:
      "Collision warning only — NOT for indicating you are in danger or requesting assistance. Use to attract the attention of an approaching vessel that may not have seen you, particularly in busy shipping lanes or at anchor. Hold at arm's length on the downwind side.",
  },
];

/**
 * Flare identification scenarios — each scenario describes a situation
 * and the student must pick the correct flare to use.
 */
export interface FlareScenario {
  readonly id: string;
  readonly description: string;
  readonly correctFlareId: FlareId;
  readonly explanation: string;
}

export const flareScenarios: readonly FlareScenario[] = [
  {
    id: "distant-vessel-night",
    description:
      "It is 02:00 and your yacht is taking on water 15 miles offshore. You can see the lights of a distant ship on the horizon. You need to attract their attention.",
    correctFlareId: "red-parachute-rocket",
    explanation:
      "A red parachute rocket is visible up to 40 km at night and reaches 300 m altitude — the best way to attract a distant vessel's attention. Fire at 15° downwind if there is significant wind.",
  },
  {
    id: "helicopter-approaching-day",
    description:
      "A coastguard helicopter is approaching your position in daylight after receiving your Mayday. The pilot needs to see your exact location and determine wind direction for the approach.",
    correctFlareId: "orange-smoke-hand",
    explanation:
      "Orange hand smoke is the best daytime signal for helicopter rescue — it marks your position and shows the pilot the wind direction for their approach. Hold it at arm's length downwind.",
  },
  {
    id: "liferaft-daytime",
    description:
      "You are in a life raft during daylight. A search aircraft has been spotted in the distance. You need a long-lasting daytime signal but cannot safely hold a flare.",
    correctFlareId: "orange-smoke-buoyant",
    explanation:
      "A buoyant orange smoke canister burns for 3 minutes (longer than hand smoke) and can be deployed into the water from a life raft without needing to hold it. Deploy to windward so smoke drifts over your position.",
  },
  {
    id: "rescue-boat-close-night",
    description:
      "An RNLI lifeboat has responded to your Mayday and is searching the area at night. They are within a few miles but haven't located you yet. You need to guide them to your exact position.",
    correctFlareId: "red-hand-flare",
    explanation:
      "A red hand flare pinpoints your position for nearby rescue vessels at night. The 60-second burn time gives the lifeboat crew time to take a bearing on your location. Hold at arm's length downwind.",
  },
  {
    id: "shipping-lane-collision-risk",
    description:
      "You are anchored at night near a busy shipping lane. A large vessel appears to be heading directly toward you and has not responded to VHF calls. You are NOT in distress but need to avoid a collision.",
    correctFlareId: "white-hand-flare",
    explanation:
      "A white hand flare is a collision warning signal — it alerts approaching vessels to your presence. It is NOT a distress signal. Using a red flare in this situation would trigger an unnecessary rescue response.",
  },
  {
    id: "offshore-distress-windy-night",
    description:
      "Your engine has failed and you are drifting toward rocks 20 miles from shore on a stormy night. Strong winds of 30 knots are blowing. You need maximum visibility to attract any vessel in the area.",
    correctFlareId: "red-parachute-rocket",
    explanation:
      "A red parachute rocket provides the best long-range visibility. In strong winds, fire at 15° downwind to prevent the parachute drifting the flare back over your vessel. The 300 m altitude means it can be seen from far away even in poor conditions.",
  },
  {
    id: "sar-aircraft-daytime-windy",
    description:
      "A coastguard fixed-wing aircraft is conducting a search pattern in your area during a windy day. You need to signal your position but conditions are too windy for hand-held smoke to be effective for long.",
    correctFlareId: "orange-smoke-buoyant",
    explanation:
      "A buoyant orange smoke canister burns for 3 minutes — three times longer than hand smoke — giving the aircraft more time to spot you. In windy conditions the longer burn compensates for faster smoke dispersal.",
  },
  {
    id: "close-range-night-pinpoint",
    description:
      "You have fired a red parachute rocket and a vessel has altered course toward you. It is now within 3 miles on a dark night. You need to help them find your exact location.",
    correctFlareId: "red-hand-flare",
    explanation:
      "After attracting attention with a parachute rocket, switch to a red hand flare to pinpoint your position for the approaching vessel. The handheld flare provides a precise location fix at close range.",
  },
];
