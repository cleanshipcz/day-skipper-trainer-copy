import type { Question } from "./types";

const safetyFlaresQuestions: readonly Question[] = [
  {
    id: "flare1",
    question: "Which flare type provides the greatest range for attracting distant vessels?",
    options: [
      "Red hand flare",
      "Red parachute rocket",
      "Orange smoke (hand)",
      "White hand flare",
    ],
    correctAnswer: 1,
    explanation:
      "A red rocket-parachute flare is intended for long-range visual attraction. Height, duration and visibility are product- and condition-specific.",
  },
  {
    id: "flare2",
    question: "What is the primary purpose of a white hand flare?",
    options: [
      "To signal distress at night",
      "To mark your position for a rescue helicopter",
      "To warn other vessels of your presence and avoid collision",
      "To indicate wind direction",
    ],
    correctAnswer: 2,
    explanation:
      "A white hand flare is a collision warning signal only — it is NOT a distress signal. It is used to alert approaching vessels to your presence.",
  },
  {
    id: "flare3",
    question:
      "Which flare is most suitable for signalling to a helicopter during a daytime rescue?",
    options: [
      "Red parachute rocket",
      "White hand flare",
      "Orange smoke (hand)",
      "Red hand flare",
    ],
    correctAnswer: 2,
    explanation:
      "Orange hand smoke marks your position and shows the pilot the wind direction for approach. It is the preferred daytime signal for helicopter rescue.",
  },
  {
    id: "flare4",
    question: "Where should you find the operating duration of a buoyant orange smoke signal?",
    options: ["On that product's label", "Assume 60 seconds", "Assume 3 minutes", "From its casing colour"],
    correctAnswer: 0,
    explanation:
      "Operating duration varies. Read the marking and instructions on the exact approved product carried.",
  },
  {
    id: "flare5",
    question:
      "How should you choose the firing angle of a red rocket-parachute flare?",
    options: [
      "Straight up vertically",
      "Horizontally toward the rescuer",
      "Use the exact launcher's printed instructions and account for wind",
      "Always use 45° into the wind",
    ],
    correctAnswer: 2,
    explanation:
      "Launcher designs differ. Clear overhead hazards and use the orientation and wind allowance printed on the exact device.",
  },
  {
    id: "flare6",
    question: "Which date controls when a particular pyrotechnic flare must be replaced?",
    options: ["A universal three-year rule", "The expiry/service-life marking on that product", "The vessel launch date", "The date another maker uses"],
    correctAnswer: 1,
    explanation:
      "Use the expiry or service-life marking on the exact product; life varies and must not be assumed from another unit or maker.",
  },
  {
    id: "flare7",
    question:
      "You are in a life raft during daylight. Which flare should you deploy?",
    options: [
      "Red hand flare",
      "White hand flare",
      "Orange smoke (hand)",
      "Orange smoke (buoyant)",
    ],
    correctAnswer: 3,
    explanation:
      "A buoyant orange smoke canister can be thrown into the water from a life raft without needing to be held. Its 3-minute burn time makes it effective for marking your position.",
  },
  {
    id: "flare8",
    question:
      "An RNLI lifeboat is searching for you at night and is within a few miles. Which flare should you use?",
    options: [
      "Red parachute rocket",
      "Red hand flare",
      "Orange smoke (buoyant)",
      "White hand flare",
    ],
    correctAnswer: 1,
    explanation:
      "A red hand flare pinpoints your position at close range for nearby rescue vessels at night. The 60-second burn gives the crew time to take a bearing on your location.",
  },
  {
    id: "flare9",
    question: "How should expired flares be disposed of?",
    options: [
      "Throw them overboard",
      "Fire them off on a calm night for practice",
      "Arrange acceptance with a registered disposal point or another authorised service",
      "Store them as backups in case you run out",
    ],
    correctAnswer: 2,
    explanation:
      "HM Coastguard and RNLI stations do not accept unwanted flares. Arrange acceptance with a registered point, participating supplier/marina/council facility or specialist contractor; never dump or casually fire them.",
  },
  {
    id: "flare10",
    question:
      "Which signal is specifically intended for conspicuous daytime position marking?",
    options: [
      "Orange smoke (hand)",
      "Electronic visual distress signal (EVDS)",
      "Red hand flare",
      "White hand flare",
    ],
    correctAnswer: 0,
    explanation:
      "Orange smoke is the conspicuous daytime position signal. Red-light and white attention signals can still be seen by day, although their contrast is generally better at night.",
  },
];

export default safetyFlaresQuestions;
