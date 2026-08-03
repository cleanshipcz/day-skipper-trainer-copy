import type { Question } from "./types";

const anchorworkQuestions: readonly Question[] = [
  {
    id: "a1",
    question: "How should you choose rode length for an anchoring plan?",
    options: ["Always use 4:1", "Always use 7:1", "Use depth alone", "Consider rode, anchor/vessel, seabed, conditions, tide, room and current manufacturer/local guidance"],
    correctAnswer: 3,
    explanation: "Scope is one input, not a universal verdict. Use the full bow-to-seabed depth and adapt rode to the equipment, vessel, seabed, forecast load, available room, and current manufacturer or local guidance.",
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
    question: "What establishes whether an anchor is suitable for a sandy anchorage?",
    options: ["Its familiar type name alone", "Its colour", "Suitability for the vessel, anchor design/size, seabed and expected load under manufacturer guidance", "The shortest available rode"],
    correctAnswer: 2,
    explanation: "No type label guarantees suitability. Check the particular anchor and rode against the vessel, seabed, expected load, and manufacturer guidance.",
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
      "Pay out more suitable cable only where safe swinging room permits, then verify holding again. If room is insufficient or dragging continues, start the engine as appropriate, recover the anchor, and reset elsewhere.",
  },
  {
    id: "a9",
    question: "Why can paying out more rode be unsafe even when it increases scope?",
    options: ["It always weakens the anchor", "It can make the vessel's possible swing exceed safe room", "It reduces tidal range", "It changes the seabed"],
    correctAnswer: 1,
    explanation:
      "More rode increases possible swing. Do not exceed safe room; recover and reset elsewhere if suitable rode cannot be used without losing clearance.",
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
