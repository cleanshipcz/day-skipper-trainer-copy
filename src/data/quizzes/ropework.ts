import type { Question } from "./types";

const ropeworkQuestions: readonly Question[] = [
  {
    id: "r1",
    question: "Which knot creates a fixed loop and is essential for mooring?",
    options: ["Reef Knot", "Bowline", "Clove Hitch", "Figure Eight"],
    correctAnswer: 1,
    explanation: "The bowline creates a secure fixed loop that won't slip and is easy to untie after loading.",
  },
  {
    id: "r2",
    question: "What is the best knot for quickly attaching a rope to a post?",
    options: ["Bowline", "Sheet Bend", "Clove Hitch", "Figure Eight"],
    correctAnswer: 2,
    explanation: "The clove hitch is quick to tie and adjustable, ideal for temporary fastening to rails and posts.",
  },
  {
    id: "r3",
    question: "Which knot is used to join two ropes of different thickness?",
    options: ["Reef Knot", "Sheet Bend", "Bowline", "Clove Hitch"],
    correctAnswer: 1,
    explanation: "The sheet bend is specifically designed to join ropes of different diameters securely.",
  },
  {
    id: "r4",
    question: "What type of knot is a Figure Eight?",
    options: ["Binding knot", "Stopper knot", "Bend", "Hitch"],
    correctAnswer: 1,
    explanation: "The figure eight is a stopper knot used to prevent rope running through a block.",
  },
  {
    id: "r5",
    question: "Which knot should NOT be used for joining ropes of different thickness?",
    options: ["Sheet Bend", "Reef Knot", "Double Sheet Bend", "Carrick Bend"],
    correctAnswer: 1,
    explanation:
      "A reef knot (square knot) can slip when joining ropes of different thickness. Use a sheet bend instead.",
  },
] as const;

export default ropeworkQuestions;
