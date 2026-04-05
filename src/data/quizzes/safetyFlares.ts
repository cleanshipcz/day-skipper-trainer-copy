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
      "A red parachute rocket reaches approximately 300 m altitude and is visible up to 40 km at night, making it the most effective long-range distress signal.",
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
    question: "How long does a buoyant orange smoke canister typically burn?",
    options: ["30 seconds", "60 seconds", "3 minutes", "10 minutes"],
    correctAnswer: 2,
    explanation:
      "A buoyant orange smoke canister burns for approximately 3 minutes — three times longer than hand smoke — giving aircraft more time to locate you.",
  },
  {
    id: "flare5",
    question:
      "In strong winds, at what angle should a red parachute rocket be fired?",
    options: [
      "Straight up vertically",
      "Horizontally toward the rescuer",
      "At 15° downwind",
      "At 45° into the wind",
    ],
    correctAnswer: 2,
    explanation:
      "In strong winds, fire a parachute rocket at 15° downwind to prevent the parachute drifting the flare back over your vessel.",
  },
  {
    id: "flare6",
    question: "What is the typical shelf life of a pyrotechnic flare from its date of manufacture?",
    options: ["1 year", "2 years", "3 years", "5 years"],
    correctAnswer: 2,
    explanation:
      "Most pyrotechnic flares have a shelf life of 3 years from the date of manufacture stamped on the casing. Expired flares must be replaced and disposed of safely.",
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
      "Return them to a coastguard station or chandlery for safe disposal",
      "Store them as backups in case you run out",
    ],
    correctAnswer: 2,
    explanation:
      "Expired flares should be returned to a coastguard station or chandlery for safe disposal. They should never be thrown overboard, fired off casually, or relied upon as backups.",
  },
  {
    id: "flare10",
    question:
      "Which of the following flares is suitable ONLY for nighttime use?",
    options: [
      "Orange smoke (hand)",
      "Orange smoke (buoyant)",
      "Red hand flare",
      "Red parachute rocket",
    ],
    correctAnswer: 2,
    explanation:
      "A red hand flare is primarily a night-time signal. Orange smoke flares are daytime only, while a red parachute rocket is effective both day and night.",
  },
];

export default safetyFlaresQuestions;
