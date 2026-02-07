export interface Topic {
  id: string;
  title: string;
  content: string;
  tips: string[];
  completed: boolean;
}

export const topics: Topic[] = [
  {
    id: "types",
    title: "Types of Anchors",
    content:
      "Common anchor types include: Plow/CQR (good all-round), Danforth (excellent in sand), Bruce/Claw (good holding), and Fisherman (traditional, rocky bottoms).",
    tips: [
      "Choose anchor based on seabed type",
      "Size anchor for your vessel's displacement",
      "Carry a spare anchor for emergencies",
    ],
    completed: false,
  },
  {
    id: "scope",
    title: "Anchor Scope",
    content:
      "Scope is the ratio of anchor rode length to water depth. Minimum 4:1 for calm conditions, 7:1 for rough weather. More scope = better holding.",
    tips: [
      "Calculate: Depth + Height of bow above water",
      "Include tidal range in calculations",
      "Use chain for better holding angle",
    ],
    completed: false,
  },
  {
    id: "procedure",
    title: "Anchoring Procedure",
    content:
      "Approach slowly into wind/tide, lower anchor when stopped, let vessel drift back while paying out rode, set anchor with reverse thrust, check holding.",
    tips: [
      "Note transit bearings to check for dragging",
      "Set anchor alarm on GPS/depth sounder",
      "Display anchor ball/light as required",
    ],
    completed: false,
  },
  {
    id: "weighing",
    title: "Weighing Anchor",
    content:
      "Motor slowly forward while taking in rode, break anchor free, bring anchor aboard, clean and secure. Check no damage.",
    tips: ["Avoid running over your anchor rode", "Clean anchor before stowing", "Check rode for wear and chafe"],
    completed: false,
  },
  {
    id: "swinging-room",
    title: "Swinging Room",
    content:
      "Calculate swinging circle radius = vessel length + rode length. Account for other vessels and obstructions within your swing.",
    tips: [
      "Allow extra room for wind shifts",
      "Watch other vessels' anchor positions",
      "Consider tidal stream changes",
    ],
    completed: false,
  },
];
