import type { Question } from "./types";

const anchorworkQuestions: readonly Question[] = [
  {
    id: "a1",
    question: "What is the minimum anchor scope in calm conditions?",
    options: ["2:1", "3:1", "4:1", "7:1"],
    correctAnswer: 2,
    explanation: "Minimum scope of 4:1 in calm conditions, increasing to 7:1 in rough weather for proper holding.",
  },
  {
    id: "a2",
    question: "What should you do after anchoring to check if the anchor is holding?",
    options: ["Wait 1 hour", "Note transit bearings", "Rev engine hard", "Drop a second anchor"],
    correctAnswer: 1,
    explanation: "Take transit bearings on fixed objects ashore to monitor if the anchor is dragging.",
  },
  {
    id: "a3",
    question: "When calculating anchor scope, what must you include?",
    options: ["Only water depth", "Depth + tidal range + bow height", "Just the chart depth", "Water depth × 2"],
    correctAnswer: 1,
    explanation: "Scope calculation must include water depth, tidal range, and height of bow above water.",
  },
  {
    id: "a4",
    question: "What is swinging room?",
    options: [
      "Room for crew to work",
      "Circle your boat traces at anchor",
      "Space in the anchor locker",
      "Distance between anchors",
    ],
    correctAnswer: 1,
    explanation: "Swinging room is the circular area your boat will cover as it swings with wind and tide changes.",
  },
  {
    id: "a5",
    question: "Which anchor type is best for sandy seabeds?",
    options: ["Fisherman", "Danforth", "Bruce", "Mushroom"],
    correctAnswer: 1,
    explanation: "Danforth anchors have excellent holding power in sand due to their large flat flukes.",
  },
] as const;

export default anchorworkQuestions;
