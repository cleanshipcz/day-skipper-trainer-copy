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
    question: "Which side should you approach a casualty in the water?",
    options: ["Windward (upwind)", "Leeward (downwind)", "Astern", "Ahead"],
    correctAnswer: 1,
    explanation:
      "Approach so the casualty is on your LEEWARD side (downwind). The boat drifts heavily, so if you are upwind, the boat may drift quickly onto the person.",
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
      "The Williamson Turn (60° turn then hard over) brings the vessel back onto its reciprocal track, ideal when visual contact is lost or in fog.",
  },
  {
    id: "mob5",
    question: "Why should a hypothermic casualty be lifted horizontally?",
    options: [
      "It's easier for the winch",
      "To prevent 'Reflow Syndrome' (heart failure)",
      "So they don't slip out of the harness",
      "To drain water from their lungs",
    ],
    correctAnswer: 1,
    explanation:
      "Lifting vertically causes cold blood from legs to rush to the core, which can cause cardiac arrest (Reflow Syndrome/Hydrostatic Squeeze).",
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
    question: "On what VHF channel should you broadcast a MAYDAY?",
    options: ["Channel 6", "Channel 12", "Channel 16", "Channel 72"],
    correctAnswer: 2,
    explanation:
      "Channel 16 (156.8 MHz) is the international distress, safety, and calling frequency. All MAYDAY calls are made on Channel 16.",
  },
  {
    id: "mob9",
    question: "What manoeuvre brings you back along your reciprocal course?",
    options: [
      "A crash stop",
      "A Williamson Turn",
      "A figure-of-eight approach",
      "A beam reach and tack",
    ],
    correctAnswer: 1,
    explanation:
      "The Williamson Turn (hard over, then when 60° off course, hard over the other way) brings the vessel back exactly along its reciprocal track.",
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
    question: "What information must be included in a MAYDAY message?",
    options: [
      "Only the vessel name",
      "Vessel name, MMSI, position, nature of distress, number of persons on board",
      "Just the GPS coordinates",
      "The skipper's phone number",
    ],
    correctAnswer: 1,
    explanation:
      "A MAYDAY message must include: vessel name and callsign/MMSI, position, nature of distress, assistance required, number of POB, and any other useful information.",
  },
] as const;

export default safetyMobQuestions;
