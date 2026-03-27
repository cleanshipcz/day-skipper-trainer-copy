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
  {
    id: "v6",
    question: "What is the recommended way to store tinned food on a passage?",
    options: [
      "In their original cardboard packaging",
      "Remove labels, mark with waterproof pen, and stow securely",
      "Stack loosely in the galley",
      "Keep in a plastic bag on deck",
    ],
    correctAnswer: 1,
    explanation:
      "Remove labels (they disintegrate when wet), mark tins with a waterproof pen, and stow securely to prevent movement.",
  },
  {
    id: "v7",
    question: "Why should you plan meals before a passage?",
    options: [
      "To impress the crew",
      "To ensure balanced nutrition and minimise galley time in rough weather",
      "To reduce the skipper's workload",
      "It is a legal requirement",
    ],
    correctAnswer: 1,
    explanation:
      "Pre-planned meals ensure balanced nutrition, reduce galley time in rough weather, and allow efficient provisioning.",
  },
  {
    id: "v8",
    question: "What type of food is best for the first day of a rough-weather passage?",
    options: [
      "A full cooked meal",
      "Pre-prepared, easy-to-eat cold food",
      "Raw fish",
      "Freeze-dried rations only",
    ],
    correctAnswer: 1,
    explanation:
      "Pre-prepared cold food (sandwiches, snack packs) is safest and easiest when the crew is adjusting to conditions.",
  },
  {
    id: "v9",
    question: "How should you manage food allergies and dietary requirements on board?",
    options: [
      "Ignore them — sea air cures everything",
      "Establish them before departure and provision accordingly",
      "Only cater for the skipper's preferences",
      "Carry antihistamines instead of alternative food",
    ],
    correctAnswer: 1,
    explanation:
      "Always establish crew dietary requirements before departure and ensure suitable food is provisioned.",
  },
  {
    id: "v10",
    question: "What is the main risk of using gas appliances for cooking at sea?",
    options: [
      "They are too slow",
      "Gas is heavier than air and collects in the bilge, creating an explosion risk",
      "They require too much ventilation",
      "Gas runs out too quickly",
    ],
    correctAnswer: 1,
    explanation:
      "LPG is heavier than air and sinks to the bilge. A leak can create an explosive atmosphere. Always turn off gas at the bottle when not in use.",
  },
  {
    id: "v11",
    question: "What is the purpose of gimballing a stove on a sailing yacht?",
    options: [
      "To save space",
      "To keep pots level as the boat heels",
      "To make the stove lighter",
      "To improve gas efficiency",
    ],
    correctAnswer: 1,
    explanation:
      "A gimballed stove swings to remain level as the boat heels, preventing pots from sliding and spilling hot liquids.",
  },
  {
    id: "v12",
    question: "Why should the cook wear oilskin trousers in rough weather?",
    options: [
      "To stay dry from spray on deck",
      "To protect against scalds from spilling hot liquids",
      "It is a uniform requirement",
      "To keep warm in the galley",
    ],
    correctAnswer: 1,
    explanation:
      "Oilskin trousers protect the cook's legs against scalds from hot liquids spilling in rough conditions.",
  },
] as const;

export default victuallingQuestions;
