/** Fire classes used in the UK under BS EN 2. Electrical equipment is a hazard, not a class. */
export type FireClass = "A" | "B" | "C" | "D" | "F";

export const FIRE_CLASSES: readonly FireClass[] = ["A", "B", "C", "D", "F"] as const;

export type ExtinguisherId =
  | "dry-powder"
  | "foam"
  | "co2"
  | "wet-chemical";

export type FirefightingEquipmentId =
  | ExtinguisherId
  | "fire-blanket"
  | "fixed-co2-system";

export const EXTINGUISHER_IDS = {
  DRY_POWDER: "dry-powder",
  FOAM: "foam",
  CO2: "co2",
  WET_CHEMICAL: "wet-chemical",
} as const satisfies Record<string, ExtinguisherId>;

export const EQUIPMENT_IDS = {
  ...EXTINGUISHER_IDS,
  FIRE_BLANKET: "fire-blanket",
  FIXED_CO2_SYSTEM: "fixed-co2-system",
} as const satisfies Record<string, FirefightingEquipmentId>;

export interface FireExtinguisher {
  readonly id: ExtinguisherId;
  readonly type: string;
  readonly colourCode: string;
  readonly description: string;
  /** Typical classes only. The marking on the particular unit is authoritative. */
  readonly suitableClasses: readonly FireClass[];
  readonly advantages: readonly string[];
  readonly disadvantages: readonly string[];
  readonly selectionRule: string;
}

export interface FireBlanket {
  readonly id: "fire-blanket";
  readonly type: "Fire Blanket";
  readonly description: string;
  readonly safeUse: readonly string[];
  readonly limitations: readonly string[];
}

export const fireExtinguishers: readonly FireExtinguisher[] = [
  {
    id: "dry-powder",
    type: "Dry Powder",
    colourCode: "Blue band",
    description:
      "Knocks flames down rapidly. ABC and BC powders have different ratings: use only where the cylinder's marked rating covers the fuel and the manufacturer permits the application.",
    suitableClasses: ["A", "B", "C"],
    advantages: ["Rapid flame knockdown", "Some marked products cover Class C gas fires"],
    disadvantages: [
      "Dense powder clouds impair breathing and visibility in accommodation",
      "Little cooling allows re-ignition",
      "Residue can damage engines and electrical equipment",
    ],
    selectionRule:
      "Never infer suitability from 'powder' alone; check the actual A/B/C/D rating. Specialist Class D powder is not interchangeable with ABC powder.",
  },
  {
    id: "foam",
    type: "Foam",
    colourCode: "Cream band",
    description:
      "Cools Class A material and, where the unit has the required rating, blankets some Class B liquid surfaces. Performance depends on the fuel, application method and product approval.",
    suitableClasses: ["A", "B"],
    advantages: ["Cooling on Class A fires", "Some rated products suppress vapour above compatible liquid fuels"],
    disadvantages: [
      "Do not use on cooking oil/fat (Class F)",
      "Do not use on gas (Class C)",
      "Keep off energised equipment unless the specific unit is explicitly tested and marked for that use",
      "Wind, fuel compatibility and disturbing the liquid can defeat the blanket",
    ],
    selectionRule:
      "Confirm the cylinder's marked A/B rating, fuel compatibility and manufacturer instructions; 'foam' is not an absolute answer for every liquid fire.",
  },
  {
    id: "co2",
    type: "CO2",
    colourCode: "Black band",
    description:
      "A residue-free medium commonly rated for Class B fires and useful around energised electrical equipment. It is not automatically suitable for an engine space.",
    suitableClasses: ["B"],
    advantages: ["Non-conductive and residue-free", "Can avoid powder contamination of electrical equipment"],
    disadvantages: [
      "No cooling, so hot fuel can re-ignite",
      "Gas disperses rapidly outdoors or through an open compartment",
      "Dangerous asphyxiation concentration in occupied/confined spaces",
      "A portable discharge through an open hatch can feed or spread an engine-space fire",
    ],
    selectionRule:
      "Use only for the marked rating and from a safe position. A fixed engine-space system must be approved for that space and used to its instructions after evacuation and shutdown prerequisites.",
  },
  {
    id: "wet-chemical",
    type: "Wet Chemical",
    colourCode: "Yellow band",
    description:
      "A purpose-designed Class F medium that cools hot cooking oil and forms a sealing layer when gently applied.",
    suitableClasses: ["F"],
    advantages: ["Rated for cooking-oil/fat fires", "Cooling reduces re-ignition risk"],
    disadvantages: ["Use only at the specified distance and application pattern", "Not a general-purpose marine extinguisher"],
    selectionRule:
      "Check for a Class F rating and follow the manufacturer's instructions; isolate the heat source if safe and never move the pan.",
  },
];

export const fireBlankets: readonly FireBlanket[] = [{
  id: "fire-blanket",
  type: "Fire Blanket",
  description:
    "Separate firefighting equipment for smothering a very small, contained pan fire where the blanket can cover it completely without reaching through flames.",
  safeUse: ["Use a compliant blanket of adequate size", "Follow its instructions and keep an escape route"],
  limitations: [
    "Not an extinguisher: it has no extinguisher colour band or fire-class rating",
    "Deployment requires instruction and practice; hands and escape route remain at risk",
    "Withdraw if the fire is spreading or approach is unsafe",
    "Leave in place to cool and treat as single-use after deployment",
  ],
}];

export const firefightingEquipment = [
  { id: "dry-powder", type: "Dry Powder", equipmentKind: "Extinguisher", optionDetail: "Blue band • marked 13A 34B C • use only as manufacturer permits" },
  { id: "foam", type: "Foam", equipmentKind: "Extinguisher", optionDetail: "Cream band • marked 13A 21B • use only on manufacturer-approved fuels" },
  { id: "co2", type: "CO2", equipmentKind: "Extinguisher", optionDetail: "Black band • marked 34B • obey voltage, distance and enclosure instructions" },
  { id: "fixed-co2-system", type: "Fixed CO2 System", equipmentKind: "Fixed installation", optionDetail: "Approved and sized for the protected engine space • operate only to system instructions" },
  { id: "wet-chemical", type: "Wet Chemical", equipmentKind: "Extinguisher", optionDetail: "Yellow band • marked 25F • obey pan-size and distance instructions" },
  { id: "fire-blanket", type: "Fire Blanket", equipmentKind: "Separate equipment", optionDetail: "BS EN 1869 • no extinguisher colour band or class rating" },
] as const;

export interface FireScenario {
  readonly id: string;
  readonly description: string;
  readonly fireClass: FireClass;
  readonly electricalHazard?: boolean;
  readonly acceptableEquipmentIds: readonly FirefightingEquipmentId[];
  /** Exact markings/approval assumed by this assessment; visible before answering. */
  readonly assumedEquipment: Readonly<Partial<Record<FirefightingEquipmentId, string>>>;
  readonly prerequisites: string;
  readonly explanation: string;
}

export const fireScenarios: readonly FireScenario[] = [
  {
    id: "galley-oil",
    description: "A small pan of cooking oil catches fire on the galley stove and remains contained to the pan.",
    fireClass: "F",
    acceptableEquipmentIds: ["wet-chemical", "fire-blanket"],
    assumedEquipment: {
      "wet-chemical": "Marked 25F; manufacturer instructions cover this pan size and application distance.",
      "fire-blanket": "BS EN 1869 blanket large enough to cover the pan; instructions permit this use.",
    },
    prerequisites: "Raise the alarm, keep an escape route, isolate the heat if safe, do not move the pan and do not use water or foam.",
    explanation:
      "Use a Class F-rated wet-chemical unit as marked, or a compliant fire blanket only when the small pan can be covered safely and completely. If approach is unsafe or fire is spreading, withdraw.",
  },
  {
    id: "engine-diesel",
    description: "Diesel fuel has ignited inside an engine compartment and smoke is coming from the closed hatch.",
    fireClass: "B",
    acceptableEquipmentIds: ["foam", "dry-powder", "fixed-co2-system"],
    assumedEquipment: {
      foam: "Marked 21B and approved by its manufacturer for diesel through the installed fire port.",
      "dry-powder": "Marked 34B and approved for discharge through the installed fire port.",
      "fixed-co2-system": "Fixed CO2 system approved and sized for this engine space, with shutdown controls.",
    },
    prerequisites: "Raise the alarm, stop engine/fuel/ventilation if safe, keep the compartment closed and use an approved fire port or fixed system; do not open the hatch to discharge.",
    explanation:
      "There is no universal portable-medium answer. Use only equipment rated and approved for the fuel and installation. CO2 needs effective enclosure and asphyxiation controls; powder obscures and does not cool; foam depends on rating, access and fuel compatibility.",
  },
  {
    id: "electrical-panel",
    description: "Sparks and flames are visible behind an energised electrical distribution panel at the nav station.",
    fireClass: "A",
    electricalHazard: true,
    acceptableEquipmentIds: ["co2", "dry-powder"],
    assumedEquipment: {
      co2: "Marked 34B and manufacturer instructions permit use at the stated electrical voltage and distance.",
      "dry-powder": "Marked 13A 34B C and manufacturer instructions permit use at the stated electrical voltage and distance.",
    },
    prerequisites: "Raise the alarm and isolate electrical power if safe. Keep clear until isolation is confirmed.",
    explanation:
      "Electrical is a hazard, not a fire class. Before isolation use only a medium and unit marked/approved for energised equipment; CO2 avoids residue but gives no cooling, while rated powder contaminates equipment and impairs visibility. After isolation, treat the burning material's class.",
  },
  {
    id: "bunk-mattress",
    description: "A bunk mattress is burning in accommodation and flames are spreading to nearby fabric.",
    fireClass: "A",
    acceptableEquipmentIds: ["foam", "dry-powder"],
    assumedEquipment: {
      foam: "Marked 13A; manufacturer instructions cover solid combustibles at the available range.",
      "dry-powder": "Marked 13A 34B C; manufacturer instructions cover Class A material at the available range.",
    },
    prerequisites: "Raise the alarm, preserve the escape route and attack only if the fire is still small and the selected unit is Class A rated.",
    explanation:
      "A Class A-rated cooling medium is normally preferable for deep-seated material. Rated powder can knock flames down but its cloud, breathing/visibility effects and lack of cooling make it hazardous in a cabin; expect re-ignition and withdraw if conditions worsen.",
  },
  {
    id: "gas-leak-ignition",
    description: "Leaking cooker LPG is burning as a jet from a cracked fitting.",
    fireClass: "C",
    acceptableEquipmentIds: ["dry-powder"],
    assumedEquipment: {
      "dry-powder": "Marked 13A 34B C; manufacturer instructions cover LPG after fuel isolation.",
    },
    prerequisites: "Do not extinguish the flame unless the gas supply can be stopped safely; otherwise unburned gas may accumulate and explode. Raise the alarm and withdraw.",
    explanation:
      "After safe fuel isolation, a cylinder specifically marked for Class C may knock down remaining flame. Not every powder cylinder has a C rating, and extinguishing without stopping the leak can make conditions worse.",
  },
  {
    id: "fuel-spill-deck",
    description: "A small petrol spill on the open cockpit sole ignites during refuelling.",
    fireClass: "B",
    acceptableEquipmentIds: ["foam", "dry-powder"],
    assumedEquipment: {
      foam: "Marked 21B; manufacturer confirms petrol compatibility and the stated application distance.",
      "dry-powder": "Marked 34B; manufacturer instructions cover petrol at the stated range.",
    },
    prerequisites: "Raise the alarm, stop the fuel source if safe, avoid spreading the spill and keep an upwind escape route.",
    explanation:
      "Use a unit with the necessary Class B rating and follow its application instructions. Compatible foam may blanket a contained surface but wind or a running/spreading spill can defeat it; rated powder offers rapid knockdown but little cooling and re-ignition remains possible.",
  },
];

/** Content may ship only after sign-off by a competent marine fire-safety reviewer. */
export interface FireSafetyReleaseReview {
  readonly required: true;
  readonly reviewed: boolean;
  readonly reviewerName: string | null;
  readonly reviewerQualification: string | null;
  readonly approvalDate: string | null;
  readonly sourceEvidence: readonly string[];
}

export const isFireSafetyReleaseApproved = (review: FireSafetyReleaseReview): boolean =>
  review.reviewed &&
  Boolean(review.reviewerName?.trim()) &&
  Boolean(review.reviewerQualification?.trim()) &&
  Boolean(review.approvalDate?.trim()) &&
  review.sourceEvidence.length > 0 &&
  review.sourceEvidence.every((source) => source.trim().length > 0);

export const FIRE_SAFETY_RELEASE_REVIEW: FireSafetyReleaseReview = {
  required: true,
  reviewed: false,
  reviewerName: null,
  reviewerQualification: null,
  approvalDate: null,
  sourceEvidence: [],
};
