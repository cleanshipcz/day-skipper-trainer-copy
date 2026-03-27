import type { Question } from "./types";

const victuallingQuestions: readonly Question[] = [
  {
    id: "v1",
    question: "How much fresh water per person per day minimum?",
    options: ["0.5L", "1L", "2L", "4L"],
    correctAnswer: 2,
    explanation:
      "Minimum 2 liters per person per day for drinking, with additional water needed for cooking and washing.",
  },
  {
    id: "v2",
    question: "Why provision for 50% more days than planned?",
    options: ["Crew eats more at sea", "Weather delays", "Food spoils faster", "Always hungry"],
    correctAnswer: 1,
    explanation: "Weather delays are common at sea. Always provision for 50% more days than your planned passage.",
  },
  {
    id: "v3",
    question: "What storage consideration is most important?",
    options: ["Color coding", "Waterproof containers", "Alphabetical order", "Refrigeration only"],
    correctAnswer: 1,
    explanation: "Waterproof containers are essential as moisture and spray can damage provisions at sea.",
  },
  {
    id: "v4",
    question: "What should you minimize when provisioning?",
    options: ["Fresh food", "Water", "Packaging waste", "Calories"],
    correctAnswer: 2,
    explanation: "Minimize packaging to reduce waste storage and disposal problems at sea.",
  },
  {
    id: "v5",
    question: "How long do fresh vegetables typically last without refrigeration?",
    options: ["1 day", "2-3 days", "1 week", "2 weeks"],
    correctAnswer: 1,
    explanation: "Most fresh vegetables last 2-3 days without refrigeration in warm conditions. Plan accordingly.",
  },
] as const;

export default victuallingQuestions;
