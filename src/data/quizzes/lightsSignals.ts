import type { Question } from "./types";

const lightsSignalsQuestions: readonly Question[] = [
  {
    id: "ls1",
    question: "You see a vessel displaying 'White over Red' lights. What is it?",
    options: ["Pilot Vessel", "Fishing Vessel", "Sailing Vessel", "Trawling Vessel"],
    correctAnswer: 0,
    explanation:
      "Rule 29: Pilot vessels exhibit White over Red all-round lights. Mnemonic: 'White over Red, Pilot Ahead'.",
  },
  {
    id: "ls2",
    question: "You see a vessel displaying 'Red over White' lights. What is it?",
    options: ["Fishing (not trawling)", "Pilot Vessel", "Sailing Vessel", "Trawling"],
    correctAnswer: 0,
    explanation:
      "Rule 26: Fishing vessels (other than trawling) exhibit Red over White. Mnemonic: 'Red over White, Fishing at Night'.",
  },
  {
    id: "ls3",
    question: "You see 'Green over White' lights. What is it?",
    options: ["Trawling", "Sailing", "Pilot", "Fishing"],
    correctAnswer: 0,
    explanation:
      "Rule 26: Trawling vessels exhibit Green over White. Mnemonic: 'Green over White, Trawling at Night'.",
  },
  {
    id: "ls4",
    question: "What lights does a vessel 'Not Under Command' (NUC) show?",
    options: ["Red over Red", "Red over White", "Green over White", "White over Red"],
    correctAnswer: 0,
    explanation:
      "Rule 27: NUC vessels show two all-round red lights in a vertical line. Mnemonic: 'Red over Red, Captain is Dead'.",
  },
  {
    id: "ls5",
    question: "What day shape signifies a vessel at anchor?",
    options: ["One black ball", "Two black balls", "A diamond", "A cone"],
    correctAnswer: 0,
    explanation: "Rule 30: A vessel at anchor exhibits one black ball forward where it can best be seen.",
  },
  {
    id: "ls6",
    question: "What does a cylinder day shape indicate?",
    options: ["Constrained by Draft", "Fishing", "Towing", "Not Under Command"],
    correctAnswer: 0,
    explanation: "Rule 28: A vessel constrained by her draft exhibits a cylinder.",
  },
  {
    id: "ls7",
    question: "You see three black balls in a vertical line. What is this?",
    options: ["Vessel Aground", "Vessel at Anchor", "NUC", "Mine clearance"],
    correctAnswer: 0,
    explanation: "Rule 30: A vessel aground exhibits three black balls in a vertical line.",
  },
  {
    id: "ls8",
    question: "Restricted Visibility: You hear 1 Prolonged blast every 2 minutes. What is it?",
    options: ["Power-driven vessel making way", "Power-driven vessel stopped", "Sailing vessel", "Vessel at anchor"],
    correctAnswer: 0,
    explanation:
      "Rule 35: A power-driven vessel making way sounds one prolonged blast at intervals of not more than 2 minutes.",
  },
  {
    id: "ls9",
    question: "Restricted Visibility: You hear 2 Prolonged blasts every 2 minutes. What is it?",
    options: [
      "Power-driven vessel stopped (underway but not making way)",
      "Power-driven vessel making way",
      "Sailing vessel",
      "Pilot vessel",
    ],
    correctAnswer: 0,
    explanation: "Rule 35: A power-driven vessel underway but stopped sounds two prolonged blasts.",
  },
  {
    id: "ls10",
    question: "Restricted Visibility: You hear '1 Prolonged, 2 Short'. Which vessel is NOT this?",
    options: ["Power-driven vessel", "Sailing vessel", "Fishing vessel", "Restricted Ability to Maneuver (RAM)"],
    correctAnswer: 0,
    explanation:
      "Rule 35: The signal '1 Pro, 2 Short' is for NUC, RAM, CBD, Sailing, Fishing, or Towing. Standard Power-driven vessels do NOT use this.",
  },
  {
    id: "ls11",
    question: "What does 'Red White Red' vertical lights mean?",
    options: ["Restricted Ability to Maneuver (RAM)", "Not Under Command", "Pilot", "Aground"],
    correctAnswer: 0,
    explanation: "Rule 27: RAM vessels exhibit three all-round lights: Red-White-Red.",
  },
  {
    id: "ls12",
    question: "A vessel towing another (tow length < 200m). What lights on the stern?",
    options: [
      "One Yellow (Towing) over White (Sternlight)",
      "Red over White",
      "Yellow over Yellow",
      "Just a white sternlight",
    ],
    correctAnswer: 0,
    explanation: "Rule 24: A towing vessel shows a yellow towing light above the sternlight.",
  },
  {
    id: "ls13",
    question: "What shape does a vessel motoring while sails are up display?",
    options: ["Cone (Apex down)", "Cone (Apex up)", "Ball", "Diamond"],
    correctAnswer: 0,
    explanation: "Rule 25: A sailing vessel also under power must exhibit a cone, apex downwards.",
  },
  {
    id: "ls14",
    question: "Five short blasts on the whistle means:",
    options: [
      "I am in doubt of your intentions (Danger)",
      "I am backing up",
      "I am turning starboard",
      "Request to open bridge",
    ],
    correctAnswer: 0,
    explanation: "Rule 34: 5 short blasts indicates doubt or danger.",
  },
  {
    id: "ls15",
    question: "Which of these is a Distress Signal?",
    options: ["Orange Smoke", "Green Star Rocket", "Code Flag 'A'", "Rapid ringing of bell"],
    correctAnswer: 0,
    explanation: "Annex IV: Orange smoke is a recognized distress signal. Green stars or Flag A are not.",
  },
  {
    id: "ls16",
    question: "A hovercraft in non-displacement mode shows which flashing light?",
    options: ["Yellow", "Red", "Blue", "Green"],
    correctAnswer: 0,
    explanation:
      "Rule 23: An air-cushion vessel operating in non-displacement mode exhibits an all-round flashing yellow light.",
  },
  {
    id: "ls17",
    question: "Short blast duration?",
    options: ["1 second", "4-6 seconds", "10 seconds", "0.5 seconds"],
    correctAnswer: 0,
    explanation: "Rule 32: A short blast means a blast of about one second's duration.",
  },
  {
    id: "ls18",
    question: "Prolonged blast duration?",
    options: ["4-6 seconds", "1 second", "10-12 seconds", "2 minutes"],
    correctAnswer: 0,
    explanation: "Rule 32: A prolonged blast means a blast of from four to six seconds' duration.",
  },
  {
    id: "ls19",
    question: "You see a diamond shape. What is it?",
    options: ["Towing vessel (tow >200m)", "Fishing", "Anchor", "Pilot"],
    correctAnswer: 0,
    explanation: "Rule 24: When the length of the tow exceeds 200 meters, a diamond shape is shown.",
  },
  {
    id: "ls20",
    question: "Light signal: 'Red over Green'?",
    options: ["Sailing vessel", "Trawling", "Pilot", "NUC"],
    correctAnswer: 0,
    explanation: "Rule 25: Optional lights for a sailing vessel are Red over Green at the masthead.",
  },
] as const;

export default lightsSignalsQuestions;
