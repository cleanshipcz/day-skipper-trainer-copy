import type { Question } from "./types";

const ropeworkQuestions: readonly Question[] = [
  {
    id: "r1",
    question: "Which knot creates a fixed loop and is essential for mooring?",
    options: ["Reef Knot", "Bowline", "Clove Hitch", "Figure Eight"],
    correctAnswer: 1,
    explanation: "The bowline creates a secure fixed loop that won't slip and is easy to untie after loading.",
  },
  {
    id: "r2",
    question: "What is the best knot for quickly attaching a rope to a post?",
    options: ["Bowline", "Sheet Bend", "Clove Hitch", "Figure Eight"],
    correctAnswer: 2,
    explanation: "The clove hitch is quick to tie and adjustable, ideal for temporary fastening to rails and posts.",
  },
  {
    id: "r3",
    question: "Which knot is used to join two ropes of different thickness?",
    options: ["Reef Knot", "Sheet Bend", "Bowline", "Clove Hitch"],
    correctAnswer: 1,
    explanation: "The sheet bend is specifically designed to join ropes of different diameters securely.",
  },
  {
    id: "r4",
    question: "What type of knot is a Figure Eight?",
    options: ["Binding knot", "Stopper knot", "Bend", "Hitch"],
    correctAnswer: 1,
    explanation: "The figure eight is a stopper knot used to prevent rope running through a block.",
  },
  {
    id: "r5",
    question: "Which knot should NOT be used for joining ropes of different thickness?",
    options: ["Sheet Bend", "Reef Knot", "Double Sheet Bend", "Carrick Bend"],
    correctAnswer: 1,
    explanation:
      "A reef knot (square knot) can slip when joining ropes of different thickness. Use a sheet bend instead.",
  },
  {
    id: "r6",
    question: "What is the primary purpose of a round turn and two half hitches?",
    options: [
      "Joining two ropes together",
      "Securing a rope to a ring, post, or rail under load",
      "Creating a loop in the middle of a rope",
      "Shortening a rope",
    ],
    correctAnswer: 1,
    explanation:
      "A round turn and two half hitches is reliable for securing a line to a ring, post, or rail and is easy to untie even after heavy loading.",
  },
  {
    id: "r7",
    question: "What is 'surging' a line on a cleat or winch?",
    options: [
      "Tying it off permanently",
      "Easing it under control by allowing it to slip gradually",
      "Pulling it in as fast as possible",
      "Coiling it on deck",
    ],
    correctAnswer: 1,
    explanation:
      "Surging means allowing the line to slip in a controlled manner around a cleat or winch drum, used when easing sheets or mooring lines.",
  },
  {
    id: "r8",
    question: "Why should you always coil ropes clockwise (right-handed lay)?",
    options: [
      "It looks tidier",
      "It follows the natural twist of the rope, preventing kinks and tangles",
      "It is a maritime superstition",
      "Left-handed coiling is illegal",
    ],
    correctAnswer: 1,
    explanation:
      "Standard three-strand rope has a right-hand lay. Coiling clockwise works with the twist, preventing kinks and ensuring the rope runs freely.",
  },
  {
    id: "r9",
    question: "What knot is used to create a loop in the middle (bight) of a rope without access to the ends?",
    options: ["Bowline", "Alpine Butterfly", "Reef Knot", "Clove Hitch"],
    correctAnswer: 1,
    explanation:
      "The alpine butterfly knot forms a secure loop in the bight of a rope and can take load in any direction.",
  },
  {
    id: "r10",
    question: "What is the danger of a riding turn on a winch?",
    options: [
      "It makes the winch look untidy",
      "The line jams and cannot be eased, potentially causing equipment failure or injury",
      "It wears out the winch handle",
      "It only occurs on manual winches",
    ],
    correctAnswer: 1,
    explanation:
      "A riding turn (override) locks the line on the winch drum so it cannot be eased. It can cause rigging damage or injury if loads are high.",
  },
  {
    id: "r11",
    question: "What should you do to the end of a synthetic rope to prevent fraying?",
    options: [
      "Tie a reef knot in it",
      "Heat-seal (melt) the end or apply whipping twine",
      "Leave it — synthetic ropes don't fray",
      "Wrap it in electrical tape permanently",
    ],
    correctAnswer: 1,
    explanation:
      "Heat-sealing melts the synthetic fibres together. For a more durable finish, apply whipping twine. Both prevent the strands from unravelling.",
  },
  {
    id: "r12",
    question: "When cleating a line, how many figure-of-eight turns are typically sufficient?",
    options: [
      "One turn only",
      "Two to three complete figure-of-eight turns, finished with a locking turn",
      "As many as possible",
      "None — just one round turn",
    ],
    correctAnswer: 1,
    explanation:
      "Two to three figure-of-eight turns provide sufficient friction. Finish with a locking (half-hitch) turn to secure the line.",
  },
] as const;

export default ropeworkQuestions;
