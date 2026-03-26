import type { Question } from "./types";

const engineQuestions: readonly Question[] = [
  {
    id: "e1",
    question: "What does BWORCA stand for?",
    options: [
      "Boat Water Oil Reserve Control Anchor",
      "Blower Water Oil Reserve Controls Ancillaries",
      "Battery Water Oil Rudder Controls Anchor",
      "Blower Wind Oil Rigging Controls Air",
    ],
    correctAnswer: 1,
    explanation: "BWORCA: Blower, Water, Oil, Reserve (fuel), Controls, Ancillaries - the pre-start check sequence.",
  },
  {
    id: "e2",
    question: "How long should you run the blower before starting the engine?",
    options: ["1 minute", "2 minutes", "4 minutes", "10 minutes"],
    correctAnswer: 2,
    explanation:
      "Run blower for 4 minutes minimum to clear any fuel vapor from the engine compartment before starting.",
  },
  {
    id: "e3",
    question: "When should you check the engine oil level?",
    options: ["While engine running", "When engine is hot", "When engine is cold", "Once per season"],
    correctAnswer: 2,
    explanation: "Check oil level when engine is cold using the dipstick for an accurate reading.",
  },
  {
    id: "e4",
    question: "What indicates a raw water impeller needs replacing?",
    options: ["Engine starts slowly", "Damaged or missing blades", "Oil looks dirty", "Battery is low"],
    correctAnswer: 1,
    explanation: "Inspect impeller for damaged or missing blades. Replace if worn and always carry a spare.",
  },
  {
    id: "e5",
    question: "What is the first thing to check if the engine overheats?",
    options: ["Oil level", "Battery", "Sea cock open", "Fuel filter"],
    correctAnswer: 2,
    explanation:
      "First check the sea cock is open to allow cooling water intake. Then check impeller and coolant level.",
  },
] as const;

export default engineQuestions;
