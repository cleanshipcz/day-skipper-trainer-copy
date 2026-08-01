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
      "Plan before committing: check the chart and current local information for anchoring prohibitions, restricted or protected areas, cables and pipelines, depth and tidal range, weather, traffic, escape routes, and room to swing. Select an anchor and rode for the particular anchor design and size, vessel displacement and windage, seabed, expected load and manufacturer guidance; no anchor type or size is best for every boat or bottom.",
    tips: [
      "Use the vessel and anchor manufacturers' instructions; familiar type labels do not establish suitability",
      "Allow for changing wind, current, waves, tide, nearby vessels and their different swing",
      "Obtain permission or local advice where required; charted and local restrictions take priority",
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
      "Confirm the rode and its attachment are serviceable, and know how the bitter end can be released in an emergency",
      "Keep people out of the bight, pinch points and snap-back zones; never stand astride or over a moving rode",
      "Keep hands, feet, clothing and loose gear clear of windlass, chain, rope and gypsy",
    ],
    sourceIds: ["rnli-sar", "mca-coswp"],
    completed: false,
  },
  {
    id: "procedure",
    title: "Deploy, Set and Verify",
    content:
      "Approach at controlled speed while accounting for the dominant wind or current. When stopped over the chosen position, lower—not throw—the anchor under control; move astern slowly while paying out rode so it does not pile on the anchor. Snub on a suitable strong point and increase setting load progressively within the vessel's and equipment's limits. A windlass handles rode; unless its maker expressly approves the load, do not use it as the permanent anchoring strong point.",
    tips: [
      "Use agreed helm–foredeck communication and stop immediately if a person, rode or equipment is at risk",
      "Verify holding independently using at least two suitable cues: fixed transits or bearings, position trend or alarm, depth, and feel/load on the rode",
      "A single GPS fix, alarm or burst of reverse does not prove holding; investigate movement and reset or relocate if in doubt",
    ],
    sourceIds: ["rnli-sar", "mca-coswp", "mca-mgn592"],
    completed: false,
  },
  {
    id: "swinging-room",
    title: "Maintain an Anchor Watch",
    content:
      "Anchoring is not finished when the engine stops. Maintain a watch appropriate to the circumstances: monitor position and depth trends, fixed marks where available, weather, tide/current, traffic, rode condition and clearance through the vessel's possible swing. An electronic anchor alarm is a useful aid, not a substitute for lookout and repeated checks.",
    tips: [
      "Set alarm limits from the anchor position, expected swing and positioning uncertainty, then test the alarm",
      "Apply COLREG lookout and risk-of-collision duties; at anchor display the Rule 30 lights and day shape applicable to the vessel and circumstances",
      "Local harbour, environmental and anchoring rules may add restrictions or signals; check them before arrival and during the stay",
    ],
    sourceIds: ["colregs", "rnli-sar"],
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
      "If safe recovery is not possible, mark or buoy only where lawful and safe, record the position, and seek local or professional help",
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
export const anchorClaimReviews: readonly AnchorClaimReview[] = topics.flatMap((topic) => {
  const contentBasis: Record<string, AnchorClaimReview["basis"]> = {
    types: [
      { sourceId: "rnli-sar", locator: "Unit 9, p. 67: pre-anchoring factors and swinging circle" },
      { sourceId: "rnli-afloat", locator: "Stay put / Using an anchor in an emergency: suitable anchor, chain and line" },
      { sourceId: "mca-mgn592", locator: "MGN 592 (M+F) Amendment 2, §§1.2, 2.3–2.4: yachts, equipment design limits and foreseeable loads" },
      { sourceId: "rya-environment", locator: "How do I anchor with care?: sensitive and protected seabed habitats" },
    ],
    scope: [
      { sourceId: "rnli-sar", locator: "Unit 9, p. 67: wind, tide, depth, hazards, seabed and cable considerations" },
      { sourceId: "mca-coswp", locator: "COSWP 2024 ch. 26, §§26.2.1–26.2.3 and 26.3: planning, communication and anchoring machinery hazards" },
    ],
    procedure: [
      { sourceId: "rnli-sar", locator: "Unit 9, p. 67: deploying, digging in, transit holding check and reset response" },
      { sourceId: "mca-mgn592", locator: "MGN 592 Amendment 2, §§2.1–2.4: windlass design limits and safe layout" },
      { sourceId: "mca-coswp", locator: "COSWP 2024 ch. 26, §§26.3–26.4: controlled anchoring operations" },
    ],
    "swinging-room": [
      { sourceId: "rnli-sar", locator: "Unit 9, p. 67: changing wind/tide, safe swinging circle and transit checks" },
      { sourceId: "colregs", locator: "International Rules 5, 7 and 30: lookout, collision-risk assessment, anchor lights/shapes and exceptions" },
    ],
    weighing: [
      { sourceId: "mca-coswp", locator: "COSWP 2024 ch. 26, §§26.2–26.4: communication, loaded cable, machinery, heaving and securing precautions" },
    ],
  };
  const tipBasis: Record<string, AnchorClaimReview["basis"][]> = {
    types: [contentBasis.types, contentBasis.types, contentBasis.types],
    scope: [contentBasis.scope, contentBasis.scope, contentBasis.scope],
    procedure: [contentBasis.procedure, contentBasis.procedure, contentBasis.procedure],
    "swinging-room": [contentBasis["swinging-room"], contentBasis["swinging-room"], contentBasis["swinging-room"]],
    weighing: [contentBasis.weighing, contentBasis.weighing, contentBasis.weighing],
  };
  return [
    { text: topic.content, basis: contentBasis[topic.id] },
    ...topic.tips.map((text, index) => ({ text, basis: tipBasis[topic.id][index] })),
  ];
});
