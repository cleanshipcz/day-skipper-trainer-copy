/**
 * Fire extinguisher data for the Fire Safety sub-module.
 *
 * Covers the four extinguisher types a Day Skipper student must know:
 * dry powder, foam, CO2, and fire blanket. Each entry lists the fire
 * classes it is suitable for, its colour code, and practical pros/cons.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S1, AC-3
 */

/** Fire classes relevant to marine environments. */
export type FireClass = "A" | "B" | "C" | "Electrical";

export const FIRE_CLASSES: readonly FireClass[] = [
  "A",
  "B",
  "C",
  "Electrical",
] as const;

/** Known extinguisher IDs — used for compile-time validation of scenario data. */
export type ExtinguisherId = "dry-powder" | "foam" | "co2" | "fire-blanket";

export const EXTINGUISHER_IDS = {
  DRY_POWDER: "dry-powder",
  FOAM: "foam",
  CO2: "co2",
  FIRE_BLANKET: "fire-blanket",
} as const satisfies Record<string, ExtinguisherId>;

export interface FireExtinguisher {
  readonly id: ExtinguisherId;
  readonly type: string;
  readonly colourCode: string;
  readonly description: string;
  readonly suitableClasses: readonly FireClass[];
  readonly advantages: readonly string[];
  readonly disadvantages: readonly string[];
}

export const fireExtinguishers: readonly FireExtinguisher[] = [
  {
    id: "dry-powder",
    type: "Dry Powder",
    colourCode: "Blue",
    description:
      "Multi-purpose extinguisher that smothers fire by coating the fuel with a fine chemical powder. The most versatile type found on boats.",
    suitableClasses: ["A", "B", "C", "Electrical"],
    advantages: [
      "Works on almost all fire types",
      "Quick knockdown of flames",
      "Effective on electrical fires",
    ],
    disadvantages: [
      "Creates a cloud that reduces visibility",
      "Does not cool the fire — risk of re-ignition",
      "Powder damages electronics and engines",
      "Difficult to clean up in a confined space",
    ],
  },
  {
    id: "foam",
    type: "Foam",
    colourCode: "Cream",
    description:
      "Sprays a layer of aqueous foam that seals the fuel surface, cutting off oxygen and preventing flammable vapour release.",
    suitableClasses: ["A", "B"],
    advantages: [
      "Seals the surface to prevent re-ignition",
      "Effective on liquid fuel spills (diesel, petrol)",
      "Cools the fire as it is water-based",
    ],
    disadvantages: [
      "Not suitable for electrical fires (conducts electricity)",
      "Not effective on gas fires (Class C)",
      "Can be blown away by wind on deck",
    ],
  },
  {
    id: "co2",
    type: "CO2",
    colourCode: "Black",
    description:
      "Displaces oxygen with carbon dioxide gas, suffocating the fire without leaving residue. Ideal for engine rooms and electrical panels.",
    suitableClasses: ["B", "Electrical"],
    advantages: [
      "Leaves no residue — safe for electronics",
      "Effective in enclosed engine spaces",
      "Does not conduct electricity",
    ],
    disadvantages: [
      "Limited range (approximately 1–2 metres)",
      "Ineffective outdoors or in windy conditions",
      "Risk of asphyxiation in confined spaces",
      "Does not cool the fuel — risk of re-ignition",
    ],
  },
  {
    id: "fire-blanket",
    type: "Fire Blanket",
    colourCode: "Red",
    description:
      "Fibreglass blanket that smothers small fires by cutting off the oxygen supply. Essential for galley fires involving cooking oil or fat.",
    suitableClasses: ["A", "B", "Electrical"],
    advantages: [
      "Simple to use with no training required",
      "Ideal for galley fat/oil fires",
      "Can be used to wrap a person whose clothing is on fire",
      "No clean-up or residue",
    ],
    disadvantages: [
      "Only effective on small, contained fires",
      "Single use — cannot be re-used once deployed",
      "Not suitable for large or spreading fires",
    ],
  },
];

/**
 * Fire drill scenarios — each scenario describes a fire situation and
 * the student must pick the best extinguisher.
 */
export interface FireScenario {
  readonly id: string;
  readonly description: string;
  readonly fireClass: FireClass;
  readonly correctExtinguisherId: ExtinguisherId;
  readonly explanation: string;
}

export const fireScenarios: readonly FireScenario[] = [
  {
    id: "galley-oil",
    description:
      "A pan of cooking oil catches fire on the galley stove. Flames are contained to the pan.",
    fireClass: "B",
    correctExtinguisherId: "fire-blanket",
    explanation:
      "A fire blanket is ideal for small galley fat/oil fires — place it gently over the pan to smother the flames without splashing burning oil.",
  },
  {
    id: "engine-diesel",
    description:
      "Diesel fuel has ignited in the engine compartment. Smoke is pouring from the engine hatch.",
    fireClass: "B",
    correctExtinguisherId: "co2",
    explanation:
      "CO2 is best for enclosed engine spaces — it suffocates the fire without damaging the engine and leaves no residue.",
  },
  {
    id: "electrical-panel",
    description:
      "Sparks and flames are visible behind the main electrical distribution panel in the nav station.",
    fireClass: "Electrical",
    correctExtinguisherId: "co2",
    explanation:
      "CO2 does not conduct electricity and leaves no residue, making it the safest choice for electrical panel fires.",
  },
  {
    id: "bunk-mattress",
    description:
      "A bunk mattress has caught fire from an unattended candle. Flames are spreading to nearby fabric.",
    fireClass: "A",
    correctExtinguisherId: "dry-powder",
    explanation:
      "Dry powder provides rapid knockdown on solid combustible (Class A) fires and works in confined cabin spaces.",
  },
  {
    id: "gas-leak-ignition",
    description:
      "A gas leak from the cooker supply has ignited, producing a jet of flame from a cracked fitting.",
    fireClass: "C",
    correctExtinguisherId: "dry-powder",
    explanation:
      "Dry powder is the only portable extinguisher effective on gas fires (Class C). Turn off the gas supply first if safe to do so.",
  },
  {
    id: "fuel-spill-deck",
    description:
      "Petrol has spilled on the cockpit sole while refuelling and ignited from a stray spark.",
    fireClass: "B",
    correctExtinguisherId: "foam",
    explanation:
      "Foam seals the fuel surface, cutting off vapour release and preventing re-ignition — ideal for liquid fuel spills on deck.",
  },
];
