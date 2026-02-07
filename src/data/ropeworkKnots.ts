export interface Knot {
  id: string;
  name: string;
  uses: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tutorialUrl: string;
  steps: string[];
  discovered: boolean;
}

export const knots: Knot[] = [
  {
    id: "bowline",
    name: "Bowline",
    uses: "Creates a fixed loop at the end of a rope. Essential for mooring.",
    difficulty: "Medium",
    tutorialUrl: "https://www.animatedknots.com/bowline-knot",
    steps: [
      "Make a small loop in the standing part",
      "Pass the working end up through the loop",
      "Pass it around behind the standing part",
      "Bring it back down through the small loop",
      "Tighten by pulling the standing part",
    ],
    discovered: false,
  },
  {
    id: "clove-hitch",
    name: "Clove Hitch",
    uses: "Quick way to attach a rope to a post or rail. Adjustable.",
    difficulty: "Easy",
    tutorialUrl: "https://www.animatedknots.com/clove-hitch-knot-rope-end",
    steps: [
      "Pass the rope around the object",
      "Cross over and pass around again",
      "Tuck the end under the last wrap",
      "Pull tight on both ends",
    ],
    discovered: false,
  },
  {
    id: "reef-knot",
    name: "Reef Knot (Square Knot)",
    uses: "Joining two ropes of equal thickness. Traditional reefing knot.",
    difficulty: "Easy",
    tutorialUrl: "https://www.animatedknots.com/square-knot",
    steps: [
      "Cross left over right and under",
      "Cross right over left and under",
      "Pull both ends tight",
      "Remember: Right over left, left over right",
    ],
    discovered: false,
  },
  {
    id: "figure-eight",
    name: "Figure Eight",
    uses: "Stopper knot to prevent rope running through a block.",
    difficulty: "Easy",
    tutorialUrl: "https://www.animatedknots.com/figure-8-knot",
    steps: [
      "Make a loop in the rope",
      "Pass the end around behind the standing part",
      "Bring it back through the loop from the front",
      "Pull tight",
    ],
    discovered: false,
  },
  {
    id: "round-turn",
    name: "Round Turn & Two Half Hitches",
    uses: "Securing to a post or ring. Very reliable and strong.",
    difficulty: "Medium",
    tutorialUrl: "https://www.animatedknots.com/round-turn-two-half-hitches-knot",
    steps: [
      "Pass the rope twice around the post (round turn)",
      "Make a half hitch around the standing part",
      "Make another half hitch above the first",
      "Pull tight",
    ],
    discovered: false,
  },
  {
    id: "sheet-bend",
    name: "Sheet Bend",
    uses: "Joining two ropes of different thickness.",
    difficulty: "Medium",
    tutorialUrl: "https://www.animatedknots.com/sheet-bend-knot",
    steps: [
      "Make a bight in the thicker rope",
      "Pass the thin rope up through the bight",
      "Wrap it around both parts of the bight",
      "Tuck it under itself",
      "Pull tight",
    ],
    discovered: false,
  },
  {
    id: "rolling-hitch",
    name: "Rolling Hitch",
    uses: "Attaches a rope to another rope.",
    difficulty: "Medium",
    tutorialUrl: "https://www.animatedknots.com/rolling-hitch-knot",
    steps: [
      "Lay your rope alongside the rope you want to hitch onto",
      "Wrap one turn around the main rope toward the load direction",
      "Wrap a second identical turn, right next to the first",
      "Make a third turn back the opposite way, crossing over the first two",
      "Finish with a half hitch around your own standing part and tighten so the first two turns grip",
    ],
    discovered: false,
  },
];
