import type { Question } from "./types";

const safetyFireQuestions: readonly Question[] = [
  {
    id: "fire1",
    question: "What are the three sides of the fire triangle?",
    options: [
      "Heat, Fuel, Oxygen",
      "Heat, Water, Fuel",
      "Oxygen, Carbon Dioxide, Fuel",
      "Smoke, Heat, Flame",
    ],
    correctAnswer: 0,
    explanation:
      "The fire triangle consists of Heat, Fuel, and Oxygen. Remove any one element and the fire goes out.",
  },
  {
    id: "fire2",
    question: "What colour band identifies a dry powder extinguisher?",
    options: ["Cream", "Black", "Blue", "Red"],
    correctAnswer: 2,
    explanation:
      "Dry powder extinguishers are identified by a blue colour band on the body.",
  },
  {
    id: "fire3",
    question:
      "A pan of cooking oil catches fire on the galley stove. What is the BEST first response?",
    options: [
      "Throw water on it",
      "Use a CO2 extinguisher",
      "Place a fire blanket over the pan",
      "Blow on the flames",
    ],
    correctAnswer: 2,
    explanation:
      "A fire blanket gently placed over a pan fire smothers it without risk of splashing burning oil. Never use water on a fat fire.",
  },
  {
    id: "fire4",
    question:
      "Which extinguisher type is MOST suitable for an engine room fire?",
    options: ["Foam", "Water", "CO2", "Fire blanket"],
    correctAnswer: 2,
    explanation:
      "CO2 suffocates fire in enclosed spaces without leaving residue or damaging the engine.",
  },
  {
    id: "fire5",
    question:
      "What is the FIRST action in an engine room fire procedure?",
    options: [
      "Open the engine hatch fully to see the fire",
      "Stop the engine",
      "Send a Mayday",
      "Discharge the fire extinguisher",
    ],
    correctAnswer: 1,
    explanation:
      "Stop the engine first to remove the ignition source and reduce air flow to the engine space.",
  },
  {
    id: "fire6",
    question: "Class B fires involve which type of material?",
    options: [
      "Solid combustibles (wood, paper)",
      "Flammable liquids (diesel, petrol, oil)",
      "Flammable gases (butane, propane)",
      "Electrical equipment",
    ],
    correctAnswer: 1,
    explanation:
      "Class B covers flammable liquids such as diesel, petrol, paraffin, and cooking oil.",
  },
  {
    id: "fire7",
    question:
      "Why should you NOT open the engine hatch fully during an engine room fire?",
    options: [
      "The heat will burn your hands",
      "The smoke will obscure your vision",
      "It feeds the fire with oxygen",
      "The extinguisher will not reach",
    ],
    correctAnswer: 2,
    explanation:
      "Opening the hatch fully allows a rush of fresh air (oxygen) that can cause the fire to flare up dramatically.",
  },
  {
    id: "fire8",
    question:
      "What is the main disadvantage of a dry powder extinguisher aboard a yacht?",
    options: [
      "It does not work on electrical fires",
      "It only works on Class A fires",
      "The powder damages electronics and is hard to clean up",
      "It must be refilled after each use",
    ],
    correctAnswer: 2,
    explanation:
      "While versatile, dry powder creates a cloud that damages electronics and engines, and is very difficult to clean from confined boat spaces.",
  },
];

export default safetyFireQuestions;
