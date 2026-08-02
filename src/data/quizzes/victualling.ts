import type { Question } from "./types";

const victuallingQuestions: readonly Question[] = [
  {
    id: "v1",
    question: "How should a skipper choose a drinking-water allowance?",
    options: ["Use one universal minimum", "Use a documented rate adjusted for crew, activity, climate, and guidance", "Count tank size only", "Exclude contingency days"],
    correctAnswer: 1,
    explanation:
      "A documented planning rate must be checked against crew needs, activity, climate, vessel/operator advice, and local guidance; cooking, hygiene, and emergency reserve are separate inputs.",
  },
  {
    id: "v2",
    question: "How should contingency be set for a passage?",
    options: ["Always add 50%", "Choose and justify a margin from route, forecast, diversion, delay, and resupply risks", "Never carry contingency", "Use the same margin for every vessel"],
    correctAnswer: 1,
    explanation: "The margin is passage-specific: document why the route, weather, diversion options, likely delay, and resupply access justify it.",
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
    question: "How should fresh-produce quantities be planned?",
    options: ["Assume every item lasts 2–3 days", "Match selected foods to temperature, ventilation, storage, menu, and spoilage checks", "Buy the same list for every passage", "Stow all produce sealed and wet"],
    correctAnswer: 1,
    explanation: "Storage life varies by produce and conditions. Choose quantities from the passage menu and the vessel's actual temperature, ventilation, and storage limits.",
  },
  {
    id: "v17",
    question: "If a paper label may be damaged, how should a tin remain identifiable?",
    options: [
      "In their original cardboard packaging",
      "Protect the label or keep a complete record reliably tied to that exact tin",
      "Stack loosely in the galley",
      "Keep in a plastic bag on deck",
    ],
    correctAnswer: 1,
    explanation:
      "Keep the food name, ingredients and allergens, date mark, preparation and storage instructions, and batch/lot or recall details reliably associated with the exact tin. A product name written in pen is not enough; protect the original label unless the complete record can be preserved.",
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
    question: "What should you do if LPG is detected or suspected aboard?",
    options: [
      "Operate the bilge pump immediately",
      "Avoid switches, engines and flames; isolate only if safe, evacuate or ventilate from outside, and follow the vessel procedure",
      "Search every joint with a match",
      "Continue cooking until the cylinder is empty",
    ],
    correctAnswer: 1,
    explanation:
      "LPG can collect low and ignite. Avoid ignition sources, follow the vessel's emergency and isolation procedure, and do not reuse the system until a competent person has made it safe.",
  },
  {
    id: "v11",
    question: "When is a gimballed stove appropriate underway?",
    options: [
      "To save space",
      "When its locks and pot restraints are used as designed and conditions allow safe attended cooking",
      "To make the stove lighter",
      "To improve gas efficiency",
    ],
    correctAnswer: 1,
    explanation:
      "Gimbals can help keep pots level, but they do not make every condition safe. Use designed locks and restraints, attend the flame, and choose prepared no-cook food when motion makes cooking hazardous.",
  },
  {
    id: "v18",
    question: "What is the safest way to prevent galley scalds when conditions deteriorate?",
    options: [
      "Rely on ordinary waterproof trousers",
      "Stop unsafe cooking; otherwise use lids, designed restraints and locks, secure handholds and keep people clear",
      "Hold an open pan by hand",
      "Keep cooking but add more crew to the galley",
    ],
    correctAnswer: 1,
    explanation:
      "Eliminate the hazard first: switch to prepared no-cook food when motion makes cooking unsafe. In manageable conditions use lids, designed pot restraints and gimbal locks, secure handholds and an exclusion area. Ordinary oilskins are not scald PPE; use only manufacturer-rated protective equipment where the task and instructions call for it.",
  },
  {
    id: "v13",
    question: "A crew member has a severe food allergy. What should the provisioning plan include?",
    options: ["Rely on medication", "Labelled alternatives plus controls for shared equipment, preparation and storage", "Remove only visibly allergenic pieces", "Let the crew member skip meals"],
    correctAnswer: 1,
    explanation: "Ask about allergies and medical constraints before menu planning, provide suitable alternatives, and control cross-contact through separation, cleaning, labelling and preparation order.",
  },
  {
    id: "v14",
    question: "Which stowage plan is safest?",
    options: ["Heavy stores high for easy reach", "All water in one tank", "Heavy stores low and restrained, with an inventory and separate protected emergency water", "Cleaning products beside food"],
    correctAnswer: 2,
    explanation: "Stores must not move when the vessel heels, and must remain dry, accessible and traceable. Emergency water stays separate from the main supply and contamination sources.",
  },
  {
    id: "v15",
    question: "What should you do after finding a dirty water hose and an unusual odour in the tank?",
    options: ["Taste the water to decide", "Add flavouring", "Isolate the suspect supply and use protected water until it is confirmed safe or correctly treated", "Use it only for cooking"],
    correctAnswer: 2,
    explanation: "A dirty filling path and changed odour are contamination warnings. Do not taste suspect water or assume heating during normal cooking makes an unknown hazard safe.",
  },
  {
    id: "v16",
    question: "How should waste disposal be planned?",
    options: ["Throw biodegradable waste overboard anywhere", "Securely retain and segregate waste, then dispose of it under the rules for the vessel, location and waste type", "Burn packaging on deck", "Store waste beside drinking water"],
    correctAnswer: 1,
    explanation: "Reduce packaging and portions first, then retain waste without leaks or contamination. Applicable international, national and local rules determine what may be disposed of and where.",
  },
] as const;

export default victuallingQuestions;
