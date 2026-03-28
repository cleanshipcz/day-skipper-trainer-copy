import type { Question } from "./types";

const anchorworkQuestions: readonly Question[] = [
  {
    id: "a1",
    question: "What is the minimum anchor scope in calm conditions?",
    options: ["2:1", "3:1", "4:1", "7:1"],
    correctAnswer: 2,
    explanation: "Minimum scope of 4:1 in calm conditions, increasing to 7:1 in rough weather for proper holding.",
  },
  {
    id: "a2",
    question: "What should you do after anchoring to check if the anchor is holding?",
    options: ["Wait 1 hour", "Note transit bearings", "Rev engine hard", "Drop a second anchor"],
    correctAnswer: 1,
    explanation: "Take transit bearings on fixed objects ashore to monitor if the anchor is dragging.",
  },
  {
    id: "a3",
    question: "When calculating anchor scope, what must you include?",
    options: ["Only water depth", "Depth + tidal range + bow height", "Just the chart depth", "Water depth × 2"],
    correctAnswer: 1,
    explanation: "Scope calculation must include water depth, tidal range, and height of bow above water.",
  },
  {
    id: "a4",
    question: "What is swinging room?",
    options: [
      "Room for crew to work",
      "Circle your boat traces at anchor",
      "Space in the anchor locker",
      "Distance between anchors",
    ],
    correctAnswer: 1,
    explanation: "Swinging room is the circular area your boat will cover as it swings with wind and tide changes.",
  },
  {
    id: "a5",
    question: "Which anchor type is best for sandy seabeds?",
    options: ["Fisherman", "Danforth", "Bruce", "Mushroom"],
    correctAnswer: 1,
    explanation: "Danforth anchors have excellent holding power in sand due to their large flat flukes.",
  },
  {
    id: "a6",
    question: "What is the purpose of an anchor trip line?",
    options: [
      "To measure water depth",
      "To help retrieve a fouled anchor",
      "To attach a second anchor",
      "To signal other boats",
    ],
    correctAnswer: 1,
    explanation:
      "A trip line, attached to the crown of the anchor and marked with a buoy, allows you to pull the anchor out backwards if it becomes fouled.",
  },
  {
    id: "a7",
    question: "Why should you add chain between the anchor and the rode?",
    options: [
      "To make the anchor heavier",
      "The weight keeps the pull angle low and absorbs shock loads",
      "Chain is cheaper than rope",
      "To prevent tangling",
    ],
    correctAnswer: 1,
    explanation:
      "Chain at the anchor end lowers the angle of pull (improving holding), resists abrasion on the seabed, and its weight absorbs shock loads.",
  },
  {
    id: "a8",
    question: "What action should you take if your anchor starts dragging?",
    options: [
      "Pay out more cable and re-check bearings",
      "Ignore it — anchors always move a little",
      "Cut the anchor line immediately",
      "Reverse at full throttle",
    ],
    correctAnswer: 0,
    explanation:
      "First try paying out more cable to increase scope. If still dragging, start the engine, weigh anchor, and re-anchor in a better position.",
  },
  {
    id: "a9",
    question: "What is the recommended scope in heavy weather or strong tidal conditions?",
    options: ["3:1", "4:1", "5:1", "7:1 or more"],
    correctAnswer: 3,
    explanation:
      "In heavy weather or strong tidal conditions, a scope of at least 7:1 is recommended for reliable holding.",
  },
  {
    id: "a10",
    question: "How should you approach the anchoring spot?",
    options: [
      "At full speed downwind",
      "Slowly, head to wind or tide (whichever is stronger)",
      "Beam-on to the waves",
      "Under full sail with no engine",
    ],
    correctAnswer: 1,
    explanation:
      "Approach slowly, heading into the strongest element (wind or tide) so the boat stops naturally and the anchor can be lowered under control.",
  },
  {
    id: "a11",
    question: "What is a kedge anchor primarily used for?",
    options: [
      "Main anchoring only",
      "A lighter secondary anchor for temporary use or warping off",
      "Decoration on the bow",
      "Mooring in a marina",
    ],
    correctAnswer: 1,
    explanation:
      "A kedge is a lighter secondary anchor used for temporary stops, preventing swinging in a crowded anchorage, or laying out by dinghy to warp off if aground.",
  },
  {
    id: "a12",
    question: "Why should you never make the anchor cable fast to a deck cleat alone?",
    options: [
      "It will scratch the cleat",
      "Shock loads can rip the cleat from the deck; use the bow roller and a strong point",
      "It is bad seamanship etiquette",
      "The cable will chafe through faster",
    ],
    correctAnswer: 1,
    explanation:
      "Anchor loads can be very high in gusts or waves. Secure the cable through the bow roller and to a strong point (samson post or deck cleat backed through the deck).",
  },
] as const;

export default anchorworkQuestions;
