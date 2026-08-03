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
    uses: "Creates a fixed loop at a rope's end. It can secure a mooring line to a ring or post, but cyclic loading or shaking while slack can work it loose; do not use it where the line must be released under load.",
    difficulty: "Medium",
    tutorialUrl: "https://www.animatedknots.com/bowline-knot",
    steps: [
      "Allow a generous working end, then make a small loop in the standing part with the standing part on top",
      "Pass the working end up through the small loop",
      "Take the working end behind and around the standing part",
      "Bring it back down through the small loop, following its original path",
      "Dress the collar and loop neatly, then set the knot by pulling the standing part against the loop",
      "Inspect the path and leave a generous tail appropriate to the rope; use an approved backup where cyclic loading could shake the bowline loose",
    ],
    discovered: false,
  },
  {
    id: "clove-hitch",
    name: "Clove Hitch",
    uses: "A quick, adjustable temporary attachment, such as for a fender. Do not rely on it alone for mooring or critical loads: it can slip under changing loads and bind after heavy loading.",
    difficulty: "Easy",
    tutorialUrl: "https://www.animatedknots.com/clove-hitch-knot-rope-end",
    steps: [
      "Pass the working end around the object, leaving a generous tail",
      "Cross over the standing part and pass around the object a second time in the same direction",
      "Tuck the working end under the second wrap so both ends emerge between the two turns",
      "Dress the crossing turns snugly together and set by pulling both ends",
      "Inspect before use; for a fender, secure the tail with additional half hitches around the standing part, and choose a more secure hitch for changing or critical loads",
    ],
    discovered: false,
  },
  {
    id: "reef-knot",
    name: "Reef Knot (Square Knot)",
    uses: "A binding knot for tying reef points or securing a bundle. Never use it as a bend to join load-bearing ropes: it can spill, capsize, or pull undone.",
    difficulty: "Easy",
    tutorialUrl: "https://www.animatedknots.com/square-knot",
    steps: [
      "Cross the left working end over the right and tuck it under to make the first half knot",
      "Reverse the crossing: take the end now on the right over the end now on the left and tuck it under",
      "Dress the knot flat so both standing parts leave together on one side and both generous tails leave together on the other",
      "Set by pulling both standing parts and inspect that it is a symmetrical reef knot, not a granny knot",
      "Use only as a binding knot; choose a suitable bend, such as a correctly tied Sheet Bend, for joining ropes under load",
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
      "Dress the figure-eight shape, pull it snug, and leave a generous tail",
      "Inspect it before use; choose a larger or more secure stopper for a large opening or slippery rope",
    ],
    discovered: false,
  },
  {
    id: "round-turn",
    name: "Round Turn & Two Half Hitches",
    uses: "Secures a rope to a post or ring; the round turn controls strain while the hitches are tied.",
    difficulty: "Medium",
    tutorialUrl: "https://www.animatedknots.com/round-turn-two-half-hitches-knot",
    steps: [
      "Leave a generous tail and pass it twice around the post or through the ring to make a round turn",
      "Use the round turn to control the strain, adding turns before tying if the load requires them",
      "Make a half hitch around the standing part and pull it snug",
      "Make a second half hitch around the standing part in the same direction as the first",
      "Dress and set both hitches against the round turn, then inspect the knot and tail before loading",
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
      "Make a bight in the thicker or less flexible rope, leaving a generous tail",
      "Pass the thinner rope up through the bight from below",
      "Take its working end around behind both parts of the bight",
      "Tuck that end under its own standing part without passing it back through the bight",
      "Dress the knot so both tails lie on the same side; set by pulling both standing parts and inspect the tails",
      "Use a Double Sheet Bend and longer tails when the ropes differ greatly in size or the material is slippery",
    ],
    discovered: false,
  },
  {
    id: "rolling-hitch",
    name: "Rolling Hitch",
    uses: "Attaches a usually smaller rope to a larger rope for a pull nearly parallel to the larger rope, gripping in one stated direction only. It may fail on slippery modern rope or if pulled away from the main rope.",
    difficulty: "Medium",
    tutorialUrl: "https://www.animatedknots.com/rolling-hitch-knot",
    steps: [
      "Point the standing part of the hitching rope in the exact direction of the expected pull, nearly parallel to the main rope, and leave a generous working end",
      "On the side from which that pull is expected, pass the working end around the main rope to make the first turn",
      "Continue in the same direction for a second turn toward the pull; cross over the first turn and tuck the working end between the first turn and the main rope",
      "Continue around the main rope in the same direction and finish with a half hitch on the side away from the pull",
      "Dress the two gripping turns tightly together toward the pull, snug the final half hitch, and set the hitch before applying load",
      "Inspect the direction and tail, then test progressively: it must grip only along the main rope toward the doubled turns; do not use it on slippery rope or for a sideways pull",
    ],
    discovered: false,
  },
];
