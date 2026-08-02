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
    options: ["Wait 1 hour", "Use repeated position checks and fixed transits where available", "Rev the engine hard once", "Assume the anchor alarm proves it is holding"],
    correctAnswer: 1,
    explanation: "Use repeated position and depth checks and two fixed shore objects as a transit where available. Keep a lookout and monitor weather, tide/current, traffic, rode load and clearance; no single check or alarm proves continued holding.",
  },
  {
    id: "a3",
    question: "Which vertical distance should be used when calculating planned anchor scope?",
    options: ["Current water depth only", "Maximum anticipated bow-roller/chock-to-seabed distance", "Charted depth plus the full tidal range regardless of time", "Current depth plus tide height already included in that depth"],
    correctAnswer: 1,
    explanation: "Use the maximum anticipated vertical distance from the bow roller or chock to the seabed during the stay. If starting from depth measured now, add only the further expected rise and the attachment height; do not add tide twice.",
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
    question: "When is a trip line an appropriate part of an anchoring plan?",
    options: [
      "Whenever anchoring, because it has no disadvantages",
      "When it may aid recovery and its buoy, line and retrieval method will not endanger people or other craft",
      "Only to measure water depth",
      "As a substitute for securing the main rode",
    ],
    correctAnswer: 1,
    explanation:
      "A correctly rigged trip line may help recover a fouled anchor, but a buoyed or slack line can foul propellers, snag other craft or create handling hazards. Use one only after assessing traffic, depth and tide, marking, rigging and the vessel-specific recovery plan.",
  },
  {
    id: "a7",
    question: "How do chain and a suitable snubber or bridle contribute differently?",
    options: [
      "Chain provides elastic stretch; a snubber only prevents rust",
      "Chain adds weight and seabed abrasion resistance; a suitable snubber or bridle provides elasticity and reduces shock loading",
      "Both guarantee that the anchor will hold",
      "They remove the need for an engineered strong point",
    ],
    correctAnswer: 1,
    explanation:
      "Chain weight can form catenary and can lower the pull angle while enough remains off the seabed, but chain is not an elastic shock absorber. A suitably designed snubber or bridle supplies stretch, reduces shock loading and can transfer load from the windlass in accordance with vessel and equipment guidance.",
  },
  {
    id: "a8",
    question: "What is the safest response when observations show that the anchor is dragging?",
    options: [
      "Alert the crew, maintain control and clearance, and assess whether to add suitable rode or recover and reset",
      "Ignore it — anchors always move a little",
      "Cut the anchor line immediately",
      "Reverse at full throttle without checking the rode",
    ],
    correctAnswer: 0,
    explanation:
      "Alert the crew and helm, start the engine when appropriate, maintain lookout and control, and protect clearance from hazards. Add suitable rode only if depth, equipment and safe swinging room permit and then re-verify holding; otherwise recover and reset or use the vessel's abort plan.",
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
    question: "How should you plan the final approach to the anchoring position?",
    options: [
      "At full speed downwind",
      "At controlled speed, accounting for the dominant wind/current and retaining a safe abort route",
      "Beam-on to the waves",
      "Under full sail with no engine",
    ],
    correctAnswer: 1,
    explanation:
      "Approach at controlled speed with the helm and foredeck briefed. Account for the dominant wind or current, vessel handling, traffic and hazards rather than treating one heading as universal, and retain room to abort before lowering the anchor under control.",
  },
  {
    id: "a11",
    question: "What is required before using a kedge anchor for warping off or controlling the vessel?",
    options: [
      "Nothing; it is always safe to deploy one from a dinghy",
      "A planned operation suited to the vessel, load, conditions, equipment and trained crew",
      "Only a lighter anchor, regardless of holding or load",
      "Attaching it to the windlass as the permanent strong point",
    ],
    correctAnswer: 1,
    explanation:
      "A kedge may be used for a planned secondary-anchor or warping operation, but it is not automatically suitable because it is lighter. Assess the anchor and strong points, expected loads, seabed, traffic, weather and recovery method; laying it from a tender also requires a safe, trained crew and vessel-specific plan.",
  },
  {
    id: "a12",
    question: "How should a loaded anchor rode be secured?",
    options: [
      "To the windlass alone unless it looks strong",
      "Through the bow roller alone because it is the load-bearing strong point",
      "To an engineered strong point using chafe protection and a suitable snubber or bridle where specified",
      "To any convenient deck fitting",
    ],
    correctAnswer: 2,
    explanation:
      "Lead the rode through the intended bow roller or chock, protect it from chafe, and transfer the load to an engineered strong point with a suitable snubber or bridle where required. A roller guides the rode but is not automatically the securing point; follow the vessel, windlass and rode manufacturers' load and securing guidance.",
  },
] as const;

export default anchorworkQuestions;
