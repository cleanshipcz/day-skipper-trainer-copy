import type { Question } from "./types";

const rigQuestions: readonly Question[] = [
  {
    id: "rg1",
    question: "What is standing rigging?",
    options: ["Sails", "Fixed wires supporting the mast", "Ropes that control sails", "The boom"],
    correctAnswer: 1,
    explanation: "Standing rigging refers to the fixed wires (shrouds and stays) that support the mast.",
  },
  {
    id: "rg2",
    question: "When should you perform a full rig inspection?",
    options: ["After every sail", "Weekly", "Before season start", "Only if something breaks"],
    correctAnswer: 2,
    explanation:
      "Full rig inspection before season start, with visual checks before every sail and aloft inspection annually.",
  },
  {
    id: "rg3",
    question: "What should you check on turnbuckles?",
    options: ["Color", "Split pins secure, no cracks", "Manufacturer name", "Weight"],
    correctAnswer: 1,
    explanation: "Check turnbuckles for secure split pins, no cracks, and that threads aren't showing excessively.",
  },
  {
    id: "rg4",
    question: "What indicates spreaders need attention?",
    options: ["Wrong color", "Cracks, tips not protected, incorrect angle", "Too clean", "Different brand than mast"],
    correctAnswer: 1,
    explanation:
      "Check spreaders for cracks, ensure tips are protected to prevent sail damage, and verify correct angle.",
  },
  {
    id: "rg5",
    question: "Why is rig tension important?",
    options: ["Makes boat look better", "Performance and safety", "Easier to clean", "Reduces fuel consumption"],
    correctAnswer: 1,
    explanation:
      "Proper rig tension is crucial for both sailing performance and safety. Incorrect tension can lead to rig failure.",
  },
] as const;

export default rigQuestions;
