export type KnotId = "bowline" | "clove-hitch" | "reef-knot" | "figure-eight" | "round-turn" | "sheet-bend" | "rolling-hitch";

export interface Knot {
  id: KnotId;
  name: string;
  uses: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tutorialUrl: string;
  tutorialTitle: string;
  visualDescription: string;
  steps: string[];
  practice: {
    question: string;
    options: string[];
    correctOption: number;
  };
  discovered: boolean;
}

export const knots: Knot[] = [
  {
    id: "bowline",
    name: "Bowline",
    uses: "Creates a fixed loop at a rope's end. It can secure a mooring line to a ring or post, but cyclic loading or shaking while slack can work it loose; do not use it where the line must be released under load.",
    difficulty: "Medium",
    tutorialUrl: "https://www.animatedknots.com/bowline-knot",
    tutorialTitle: "Animated Knots: Bowline",
    visualDescription: "Final form: the standing part leaves upward under load; the fixed loop extends left; the working end finishes downward inside the collar. Dress the collar snugly around the standing part and keep the loop uncrossed.",
    steps: [
      "Allow a generous working end, then make a small loop in the standing part with the standing part on top",
      "Pass the working end up through the small loop",
      "Take the working end behind and around the standing part",
      "Bring it back down through the small loop, following its original path",
      "Dress the collar and loop neatly, then set the knot by pulling the standing part against the loop",
      "Inspect the path and leave a generous tail appropriate to the rope; use an approved backup where cyclic loading could shake the bowline loose",
    ],
    practice: { question: "A dinghy painter needs a loop that will keep its size around a harbour ring. Which choice best fits?", options: ["Make a non-tightening eye, inspect it, and add protection against repeated movement", "Cross the painter ends twice and pull the binding flat", "Wrap the painter twice around the ring and finish on its standing part"], correctOption: 0 },
    discovered: false,
  },
  {
    id: "clove-hitch",
    name: "Clove Hitch",
    uses: "A quick, adjustable temporary attachment, such as for a fender. Do not rely on it alone for mooring or critical loads: it can slip under changing loads and bind after heavy loading.",
    difficulty: "Easy",
    tutorialUrl: "https://www.animatedknots.com/clove-hitch-knot-rope-end",
    tutorialTitle: "Animated Knots: Clove Hitch using the rope end",
    visualDescription: "Final form around a post: the standing part loads upward, two turns cross diagonally at the front, and the working end exits downward beneath the second turn. Dress both turns together without overlap.",
    steps: [
      "Pass the working end around the object, leaving a generous tail",
      "Cross over the standing part and pass around the object a second time in the same direction",
      "Tuck the working end under the second wrap so both ends emerge between the two turns",
      "Dress the crossing turns snugly together and set by pulling both ends",
      "Inspect before use; for a fender, secure the tail with additional half hitches around the standing part, and choose a more secure hitch for changing or critical loads",
    ],
    practice: { question: "You are hanging a fender temporarily from a rail. Which plan is proportionate?", options: ["Use the hitch alone for the yacht's permanent mooring", "Make the adjustable attachment, then add securing half hitches", "Join the fender line to a second line and load both tails"], correctOption: 1 },
    discovered: false,
  },
  {
    id: "reef-knot",
    name: "Reef Knot (Square Knot)",
    uses: "A binding knot for tying reef points or securing a bundle. Never use it as a bend to join load-bearing ropes: it can spill, capsize, or pull undone.",
    difficulty: "Easy",
    tutorialUrl: "https://www.animatedknots.com/square-knot",
    tutorialTitle: "Animated Knots: Square (Reef) Knot",
    visualDescription: "Final binding form: each working end lies beside its own standing part on the same side of the knot, with the two rope pairs leaving opposite sides. Load the standing parts away from each other; dress the two interlocking half-knots flat and symmetrical.",
    steps: [
      "Cross the left working end over the right and tuck it under to make the first half knot",
      "Reverse the crossing: take the end now on the right over the end now on the left and tuck it under",
      "Dress the knot flat so each working end (tail) lies beside its own standing part on the same side, with the two rope pairs leaving opposite sides",
      "Set by pulling both standing parts and inspect that it is a symmetrical reef knot, not a granny knot",
      "Use only as a binding knot; choose a suitable bend, such as a correctly tied Sheet Bend, for joining ropes under load",
    ],
    practice: { question: "The sail is reefed and two reef-point ends must hold a bundle without carrying sheet load. What should you do?", options: ["Form an end loop and load its standing part", "Join the ends as though they were two loaded ropes", "Alternate the two crossings and verify a balanced, mirror-like finish"], correctOption: 2 },
    discovered: false,
  },
  {
    id: "figure-eight",
    name: "Figure Eight",
    uses: "Stopper knot to prevent rope running through a block.",
    difficulty: "Easy",
    tutorialUrl: "https://www.animatedknots.com/figure-8-knot",
    tutorialTitle: "Animated Knots: Figure Eight",
    visualDescription: "Final stopper form: the standing part loads upward; the rope crosses through a clear figure-eight; the working end exits downward beside the standing part. Dress both lobes evenly and leave a generous tail.",
    steps: [
      "Make a loop in the rope",
      "Pass the end around behind the standing part",
      "Bring it back through the loop from the front",
      "Dress the figure-eight shape, pull it snug, and leave a generous tail",
      "Inspect it before use; choose a larger or more secure stopper for a large opening or slippery rope",
    ],
    practice: { question: "A halyard tail could disappear through a fairlead. Which response addresses that risk?", options: ["Form, dress, and inspect a bulky stopper near the tail", "Make two gripping turns around a second line", "Create a loop that stays the same size under load"], correctOption: 0 },
    discovered: false,
  },
  {
    id: "round-turn",
    name: "Round Turn & Two Half Hitches",
    uses: "Secures a rope to a post or ring; the round turn controls strain while the hitches are tied.",
    difficulty: "Medium",
    tutorialUrl: "https://www.animatedknots.com/round-turn-two-half-hitches-knot",
    tutorialTitle: "Animated Knots: Round Turn and Two Half Hitches",
    visualDescription: "Final form at a ring: the standing part loads to the right after a full round turn; the working end makes two same-direction half hitches around it and exits downward. Dress the hitches together against the round turn.",
    steps: [
      "Leave a generous tail and pass it twice around the post or through the ring to make a round turn",
      "Use the round turn to control the strain, adding turns before tying if the load requires them",
      "Make a half hitch around the standing part and pull it snug",
      "Make a second half hitch around the standing part in the same direction as the first",
      "Dress and set both hitches against the round turn, then inspect the knot and tail before loading",
    ],
    practice: { question: "A line is under strain while you secure it to a ring. Which sequence lets you control that strain before finishing?", options: ["Make a small loop, circle its standing part, then return through it", "Take two passes at the ring, then add two same-direction hitches", "Cross two ends twice, reversing the second crossing"], correctOption: 1 },
    discovered: false,
  },
  {
    id: "sheet-bend",
    name: "Sheet Bend",
    uses: "Joining two ropes of different thickness.",
    difficulty: "Medium",
    tutorialUrl: "https://www.animatedknots.com/sheet-bend-knot",
    tutorialTitle: "Animated Knots: Sheet Bend",
    visualDescription: "Final form: the thicker rope forms a left-facing bight; the thinner rope enters from below, circles both legs, and tucks under its own standing part. Both working ends finish on the same side; dress all parts snugly before loading the standing parts apart.",
    steps: [
      "Make a bight in the thicker or less flexible rope, leaving a generous tail",
      "Pass the thinner rope up through the bight from below",
      "Take its working end around behind both parts of the bight",
      "Tuck that end under its own standing part without passing it back through the bight",
      "Dress the knot so both tails lie on the same side; set by pulling both standing parts and inspect the tails",
      "Use a Double Sheet Bend and longer tails when the ropes differ greatly in size or the material is slippery",
    ],
    practice: { question: "A thin heaving line must be connected to a thicker warp. Which arrangement should you recognise as suitable?", options: ["The thin line passes through and around a bight in the thicker line, with both tails together", "Both lines make identical interlocking end loops", "The thin line makes doubled gripping turns along the straight warp"], correctOption: 0 },
    discovered: false,
  },
  {
    id: "rolling-hitch",
    name: "Rolling Hitch",
    uses: "Attaches a usually smaller rope to a larger rope for a pull nearly parallel to the larger rope, gripping in one stated direction only. It may fail on slippery modern rope or if pulled away from the main rope.",
    difficulty: "Medium",
    tutorialUrl: "https://www.animatedknots.com/rolling-hitch-knot",
    tutorialTitle: "Animated Knots: Rolling Hitch",
    visualDescription: "Final directional form: the main rope runs horizontally and the standing part of the hitching rope loads left, toward two gripping turns. The working end finishes downward after the outer half hitch. Dress the doubled turns tightly together toward the load.",
    steps: [
      "Point the standing part of the hitching rope in the exact direction of the expected pull, nearly parallel to the main rope, and leave a generous working end",
      "On the side from which that pull is expected, pass the working end around the main rope to make the first turn",
      "Continue in the same direction for a second turn toward the pull; cross over the first turn and tuck the working end between the first turn and the main rope",
      "Continue around the main rope in the same direction and finish with a half hitch on the side away from the pull",
      "Dress the two gripping turns tightly together toward the pull, snug the final half hitch, and set the hitch before applying load",
      "Inspect the direction and tail, then test progressively: it must grip only along the main rope toward the doubled turns; do not use it on slippery rope or for a sideways pull",
    ],
    practice: { question: "A loaded line is jammed and you need a second line to take pull along it toward one side. What should the finished hitch show?", options: ["Two opposite half-knots lying flat between paired ends", "Extra coils gathered on the side receiving the effort", "A stopper shape with two even lobes beside the tail"], correctOption: 1 },
    discovered: false,
  },
];
