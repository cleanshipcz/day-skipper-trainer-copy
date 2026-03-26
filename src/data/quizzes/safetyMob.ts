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
] as const;

export default safetyMobQuestions;
