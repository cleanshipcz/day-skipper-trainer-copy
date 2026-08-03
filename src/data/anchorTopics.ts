export interface AnchorSource {
  id: "rnli-sar" | "rnli-afloat" | "mca-coswp" | "mca-mgn592" | "colregs" | "rya-environment";
  title: string;
  url: string;
}

export interface Topic {
  id: string;
  title: string;
  content: string;
  tips: string[];
  sourceIds: AnchorSource["id"][];
  completed: boolean;
}

export const anchorSources: readonly AnchorSource[] = [
  {
    id: "rnli-sar",
    title: "RNLI Maritime Search and Rescue Manual, Unit 9: Anchoring (p. 67)",
    url: "https://rnli.org/-/media/rnli/downloads/tp-int-05_maritime_sar_manual_2019.pdf",
  },
  {
    id: "rnli-afloat",
    title: "RNLI: Get ready to go afloat — Using an anchor in an emergency",
    url: "https://rnli.org/water-safety/choose-your-activity/yacht-sailing-and-motorboating/how-to-stay-safe-when-you-go-afloat",
  },
  {
    id: "mca-coswp",
    title: "MCA Code of Safe Working Practices, chapter 26: anchoring operations",
    url: "https://www.gov.uk/government/publications/code-of-safe-working-practices-for-merchant-seafarers-coswp-2024",
  },
  {
    id: "mca-mgn592",
    title: "MCA MGN 592 (M+F) Amendment 2: anchoring equipment on all vessels",
    url: "https://www.gov.uk/government/publications/mgn-592-mf-anchoring-mooring-towing-or-hauling-equipment",
  },
  {
    id: "rya-environment",
    title: "RYA: Anchoring and mooring — protected seabed habitats",
    url: "https://www.rya.org.uk/environment-and-sustainability/anchoring-and-mooring/",
  },
  {
    id: "colregs",
    title: "US Coast Guard Navigation Rules and Regulations Handbook: COLREG Rules 5, 7 and 30",
    url: "https://www.navcen.uscg.gov/navigation-rules-amalgamated",
  },
] as const;

export const topics: Topic[] = [
  {
    id: "types",
    title: "Plan and Select",
    content:
      "Plan before committing: assess depth and tidal range, weather, seabed, hazards, traffic, escape routes and room to swing, and use current location guidance to avoid protected or sensitive seabed habitats. Select an anchor and rode for the particular anchor design and size, vessel displacement and windage, seabed, expected load and manufacturer guidance; no anchor type or size is best for every boat or bottom.",
    tips: [
      "Use the vessel and anchor manufacturers' instructions; familiar type labels do not establish suitability",
      "Allow for changing wind, current, waves, tide, nearby vessels and their different swing",
      "Use current location guidance to avoid anchoring in protected or sensitive seabed habitats",
    ],
    sourceIds: ["rnli-sar", "rnli-afloat", "mca-mgn592", "rya-environment"],
    completed: false,
  },
  {
    id: "scope",
    title: "Prepare the Operation",
    content:
      "Brief the helm and foredeck crew, agree clear signals and an abort plan, and prepare the correctly secured rode before entering the anchorage. Scope is only one input: determine it from the maximum bow-roller-to-seabed distance and adapt it to the rode, anchor, vessel, seabed, available room, forecast conditions and manufacturer guidance rather than relying on one universal ratio.",
    tips: [
      "Confirm the rode is serviceable, securely attached and ready for use; follow the vessel and equipment instructions for emergency release",
      "Keep people out of the bight, pinch points and snap-back zones; never stand astride or over a moving rode",
      "Keep hands, feet, clothing and loose gear clear of windlass, chain, rope and gypsy",
    ],
    sourceIds: ["rnli-sar", "rnli-afloat", "mca-coswp", "mca-mgn592"],
    completed: false,
  },
  {
    id: "procedure",
    title: "Deploy, Set and Verify",
    content:
      "Approach at controlled speed while accounting for the dominant wind or current. When stopped over the chosen position, lower—not throw—the anchor under control; move astern slowly while paying out rode so it does not pile on the anchor. Snub on a suitable strong point and increase setting load progressively within the vessel's and equipment's limits. A windlass handles rode; unless its maker expressly approves the load, do not use it as the permanent anchoring strong point.",
    tips: [
      "Use agreed helm–foredeck communication and stop immediately if a person, rode or equipment is at risk",
      "Use two fixed shore points as a transit to check holding, and keep checking position, depth and rode load for change",
      "If the transit or other observations show dragging, pay out more suitable rode where room permits, or recover and reset elsewhere",
    ],
    sourceIds: ["rnli-sar", "mca-coswp", "mca-mgn592"],
    completed: false,
  },
  {
    id: "swinging-room",
    title: "Maintain an Anchor Watch",
    content:
      "Anchoring is not finished when the engine stops. Maintain a watch appropriate to the circumstances: monitor position and depth trends, fixed marks where available, weather, tide/current, traffic, rode condition and clearance through the vessel's possible swing. No single observation replaces lookout and repeated checks.",
    tips: [
      "Keep repeating position and transit checks; no single observation replaces a continuing watch",
      "Apply COLREG lookout and risk-of-collision duties; at anchor display the Rule 30 lights and day shape applicable to the vessel and circumstances",
      "If changing anchoring position, recheck current location guidance and avoid protected or sensitive seabed habitats",
    ],
    sourceIds: ["colregs", "rnli-sar", "rya-environment"],
    completed: false,
  },
  {
    id: "weighing",
    title: "Recover and Secure",
    content:
      "Brief the recovery, start the engine when appropriate, and coordinate helm and foredeck. Take in slack while the vessel is moved gently toward the anchor; do not use the windlass to pull the vessel or motor across the rode. Keep clear of the loaded line and machinery. If the anchor or rode is fouled or heavily loaded, stop, reduce the load and use the vessel-specific recovery plan—do not force the windlass or put a person in danger.",
    tips: [
      "Confirm the anchor is aweigh and clear before manoeuvring away; check for damage, chafe or contamination",
      "Clean and stow the rode under control, then mechanically secure the anchor and windlass controls for sea",
      "If safe recovery is not possible, stop the attempt and seek local or professional help rather than improvising under load",
    ],
    sourceIds: ["mca-coswp"],
    completed: false,
  },
];

export interface AnchorClaimReview {
  text: string;
  basis: { sourceId: AnchorSource["id"]; locator: string }[];
}

// Every learner-facing safety statement is an exact key in this register. A
// content change therefore requires an explicit, reviewable source decision.
const statement = (topicIndex: number, tipIndex?: number) =>
  tipIndex === undefined ? topics[topicIndex].content : topics[topicIndex].tips[tipIndex];
const basis = (sourceId: AnchorSource["id"], locator: string) => ({ sourceId, locator });

export const anchorClaimReviews: readonly AnchorClaimReview[] = [
  { text: statement(0), basis: [basis("rnli-sar", "Unit 9, p. 67, ‘Factors to consider prior to anchoring’: wind, depth/tide, hazards, seabed and safe swinging circle"), basis("rnli-afloat", "‘Stay put’ > ‘Using an anchor in an emergency’: anchor suitable for the vessel and sufficient chain/line"), basis("rya-environment", "‘How do I anchor with care?’: use current location guidance and avoid protected or sensitive seabed habitats"), basis("mca-mgn592", "§§1.2 and 2.3–2.4: application to yachts, design limitations and foreseeable equipment loads")] },
  { text: statement(0, 0), basis: [basis("rnli-afloat", "‘Stay put’ > ‘Using an anchor in an emergency’: suitability to vessel and area of activity"), basis("mca-mgn592", "§§2.3–2.4: anchoring-equipment design limitations and operational loads")] },
  { text: statement(0, 1), basis: [basis("rnli-sar", "Unit 9, p. 67: wind and tide can change; establish a safe swinging circle before anchoring")] },
  { text: statement(0, 2), basis: [basis("rya-environment", "‘How do I anchor with care?’: use current location guidance and avoid protected or sensitive seabed habitats")] },

  { text: statement(1), basis: [basis("mca-coswp", "2024 ch. 26, ‘Anchoring and weighing anchor’: competent person, bridge communication and equipment preparation"), basis("rnli-sar", "Unit 9, p. 67: depth/tidal rise, hazards, seabed and rode-length factors")] },
  { text: statement(1, 0), basis: [basis("rnli-afloat", "‘Stay put’ > ‘Using an anchor in an emergency’: suitable anchor, enough chain/line and practice before emergency use"), basis("mca-coswp", "2024 ch. 26, ‘Anchoring and weighing anchor’: check brake and clear securing devices before use")] },
  { text: statement(1, 1), basis: [basis("mca-mgn592", "§2.1: installation must avoid stationing anyone in a rope bight and account for failure consequences"), basis("mca-coswp", "2024 ch. 26, ‘Anchoring and weighing anchor’: stand safely from windlass/capstan and account for snap-back")] },
  { text: statement(1, 2), basis: [basis("mca-coswp", "2024 ch. 26, ‘Anchoring and weighing anchor’: safe distance from windlass/capstan and protective clothing against cable debris")] },

  { text: statement(2), basis: [basis("rnli-sar", "Unit 9, p. 67, ‘How an anchor works’: deployment and vessel pull dig the anchor into the seabed"), basis("mca-mgn592", "§§2.1–2.4: windlass layout, walking-out speed and design-load limitations"), basis("mca-coswp", "2024 ch. 26, ‘Anchoring and weighing anchor’: controlled walking out and brake use")] },
  { text: statement(2, 0), basis: [basis("mca-coswp", "2024 ch. 26, ‘Anchoring and weighing anchor’: responsible person and suitable bridge–anchoring-party communication")] },
  { text: statement(2, 1), basis: [basis("rnli-sar", "Unit 9, p. 67: use two fixed points as a transit to check holding; account for depth and changing wind/tide")] },
  { text: statement(2, 2), basis: [basis("rnli-sar", "Unit 9, p. 67: transit movement indicates not holding; if dragging, use more cable or reset elsewhere")] },

  { text: statement(3), basis: [basis("rnli-sar", "Unit 9, p. 67: wind/tide affect anchored position and can change; transit checks holding and swinging room prevents collision"), basis("colregs", "International Rules 5 and 7: continuing lookout and all available means for collision-risk assessment")] },
  { text: statement(3, 0), basis: [basis("rnli-sar", "Unit 9, p. 67: transit observation detects loss of holding and wind/tide can change position"), basis("colregs", "International Rule 5: proper lookout by sight, hearing and all available means")] },
  { text: statement(3, 1), basis: [basis("colregs", "International Rules 5, 7 and 30: lookout, collision-risk assessment, and circumstance/size-dependent anchor lights and shapes")] },
  { text: statement(3, 2), basis: [basis("rya-environment", "‘How do I anchor with care?’: consult current location guidance and avoid protected or sensitive seabed habitats")] },

  { text: statement(4), basis: [basis("mca-coswp", "2024 ch. 26, ‘Anchoring and weighing anchor’: bridge communication, safe distance, snap-back and controlled windlass operation")] },
  { text: statement(4, 0), basis: [basis("mca-coswp", "2024 ch. 26, ‘Anchoring and weighing anchor’: report when anchor is home and apply securing devices") ] },
  { text: statement(4, 1), basis: [basis("mca-coswp", "2024 ch. 26, ‘Anchoring and weighing anchor’: apply anchor securing devices after weighing and keep cable machinery controlled")] },
  { text: statement(4, 2), basis: [basis("mca-coswp", "2024 ch. 26, general safe-system principle and ‘Anchoring and weighing anchor’: stop unsafe machinery handling and maintain communication")] },
];
