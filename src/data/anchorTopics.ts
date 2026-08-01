export interface AnchorSource {
  id: "rya" | "mca" | "colregs";
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
    id: "rya",
    title: "RYA: The RYA Safety Boat Handbook — anchoring guidance",
    url: "https://www.rya.org.uk/shop/p/the-rya-safety-boat-handbook",
  },
  {
    id: "mca",
    title: "MCA Code of Safe Working Practices, chapter 26: anchoring operations",
    url: "https://www.gov.uk/government/publications/code-of-safe-working-practices-for-merchant-seafarers-coswp-2024",
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
    sourceIds: ["rya"],
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
    sourceIds: ["rya", "mca"],
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
    sourceIds: ["rya", "mca"],
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
    sourceIds: ["colregs", "rya"],
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
    sourceIds: ["mca", "rya"],
    completed: false,
  },
];
