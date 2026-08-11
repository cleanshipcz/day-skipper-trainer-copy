import type { Question } from "./types";

const safetyMobQuestions: readonly Question[] = [
  {
    id: "mob1",
    question: "What is the very first action to take upon seeing a Man Overboard?",
    options: ["Press DSC Distress", "Shout 'Man Overboard'", "Start the engine", "Jump in to help"],
    correctAnswer: 1,
    explanation:
      "The first priority is to alert the crew immediately so they can throw visual markers and keep pointing.",
  },
  {
    id: "mob2",
    question: "What is the safest general rule for the final approach to a casualty in the water?",
    options: [
      "Always put the casualty on the leeward side",
      "Always approach stern-first under power",
      "Choose a controlled approach for the vessel, rig, wind and sea state, with an abort route",
      "Keep the propeller turning to hold position alongside",
    ],
    correctAnswer: 2,
    explanation:
      "There is no universally safe side: the plan depends on the vessel, rig, conditions and recovery point. Approach slowly under control, brief the crew, keep an escape route, and abort early if the position is unsafe. Aim to stop alongside; before the casualty is within propeller danger, select neutral or stop the engine as conditions and vessel control allow, and never expose them to a turning propeller.",
  },
  {
    id: "mob3",
    question: "What is the correct syntax for a Distress Call?",
    options: ["MAYDAY (3x)", "PAN PAN (3x)", "HELP (3x)", "EMERGENCY (3x)"],
    correctAnswer: 0,
    explanation: "A Man Overboard is a grave and imminent danger. Use MAYDAY, MAYDAY, MAYDAY.",
  },
  {
    id: "mob4",
    question: "What is a Williamson Turn used for?",
    options: [
      "Returning to a casualty in open water/fog",
      "Docking in high wind",
      "Avoiding a collision",
      "Sailing upwind efficiently",
    ],
    correctAnswer: 0,
    explanation:
      "A Williamson turn is a standard powered-ship recovery manoeuvre intended to make good the original track in reduced visibility. Its published helm sequence is a guide, not a universal small-craft response: vessel handling, sea room, traffic and conditions determine whether it is suitable, and the vessel's practised recovery plan takes priority.",
  },
  {
    id: "mob5",
    question: "How should a casualty who may be hypothermic be recovered from the water, where practicable?",
    options: [
      "It's easier for the winch",
      "Horizontally or near-horizontally, because vertical recovery can increase cardiac-arrest risk",
      "So they don't slip out of the harness",
      "To drain water from their lungs",
    ],
    correctAnswer: 1,
    explanation:
      "Use horizontal or near-horizontal (such as a supported 'deck-chair') recovery where practicable. Medically reviewed maritime guidance warns that vertical recovery can increase cardiac-arrest risk in a hypothermic casualty; handle them gently and follow current first-aid and rescue guidance.",
  },
  {
    id: "mob6",
    question: "What should you throw to a person in the water immediately?",
    options: [
      "The anchor",
      "A lifebuoy with a drogue and/or dan buoy",
      "A bucket on a rope",
      "A fender",
    ],
    correctAnswer: 1,
    explanation:
      "Throw a lifebuoy (preferably with an attached drogue and light) and a dan buoy to mark the casualty's position and provide flotation.",
  },
  {
    id: "mob7",
    question: "What is the designated role of the 'pointer' during a MOB recovery?",
    options: [
      "To steer the boat",
      "To keep an arm continuously pointing at the casualty and never lose sight",
      "To call the Coastguard",
      "To prepare the recovery equipment",
    ],
    correctAnswer: 1,
    explanation:
      "The pointer must continuously point at the casualty with an outstretched arm. Losing visual contact dramatically reduces recovery chances.",
  },
  {
    id: "mob8",
    question: "How should a VHF distress alert and MAYDAY voice message normally be sent?",
    options: [
      "Send both by voice on Channel 70",
      "If DSC is fitted, send the DSC distress alert, then transmit the MAYDAY voice message on Channel 16",
      "Send only a DSC alert; no voice follow-up is needed",
      "Make the voice call on a working channel chosen by the skipper",
    ],
    correctAnswer: 1,
    explanation:
      "Where a suitable DSC radio is fitted, send the digital distress alert first (DSC uses Channel 70), then follow with the MAYDAY voice call and message on Channel 16. Channel 70 is digital-only. If DSC is unavailable, make the voice distress call directly on Channel 16.",
  },
  {
    id: "mob9",
    question: "Which statement about a Williamson turn is accurate?",
    options: [
      "It guarantees every vessel will return exactly along its reciprocal track",
      "It is a powered-ship manoeuvre intended to make good the original track, but execution and suitability are vessel- and condition-dependent",
      "It is the mandatory final approach for every sailing vessel",
      "It removes the need for a lookout and MOB position mark",
    ],
    correctAnswer: 1,
    explanation:
      "The standard published sequence uses hard-over helm, opposite helm after about 60° of heading change, then midships before the reciprocal heading. Those values describe a standard powered-ship manoeuvre, not an exact guarantee for every craft; use the vessel's practised procedure and account for sea room, traffic and conditions.",
  },
  {
    id: "mob10",
    question: "Why should you avoid using the propeller close to a person in the water?",
    options: [
      "It will stall the engine",
      "The propeller can cause fatal injuries to the casualty",
      "It wastes fuel",
      "It creates too much wake",
    ],
    correctAnswer: 1,
    explanation:
      "A spinning propeller can inflict serious or fatal injuries. Always put the engine in neutral before the casualty is alongside.",
  },
  {
    id: "mob11",
    question: "What does PAN PAN signify compared to MAYDAY?",
    options: [
      "A more serious emergency than MAYDAY",
      "An urgent situation that is not an immediate threat to life",
      "A routine navigational warning",
      "A request for a weather forecast",
    ],
    correctAnswer: 1,
    explanation:
      "PAN PAN indicates urgency (e.g., a medical situation, engine failure) but not immediate danger to life or vessel. MAYDAY is for grave and imminent danger.",
  },
  {
    id: "mob12",
    question: "Which is the most complete practical content for a MAYDAY voice message?",
    options: [
      "Only the vessel name",
      "Vessel identity, position, nature of distress, assistance required, persons on board, and other useful information",
      "Just the GPS coordinates",
      "The skipper's phone number",
    ],
    correctAnswer: 1,
    explanation:
      "Give MAYDAY and identify the vessel, then state position, nature of distress, assistance required, persons on board and other useful information. Use the vessel's call sign, MMSI or other available identification as applicable; an MMSI is not universally available, especially when calling without DSC equipment.",
  },
] as const;

export default safetyMobQuestions;
