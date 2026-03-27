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
  {
    id: "rg6",
    question: "What is the purpose of the forestay?",
    options: [
      "To support the boom",
      "To prevent the mast from falling aft",
      "To attach the spinnaker pole",
      "To hold the guardrails",
    ],
    correctAnswer: 1,
    explanation:
      "The forestay runs from the masthead (or near it) to the bow, preventing the mast from falling backwards.",
  },
  {
    id: "rg7",
    question: "What is running rigging?",
    options: [
      "The fixed wires supporting the mast",
      "Lines used to control and adjust sails",
      "The chain plates on the hull",
      "The keel bolts",
    ],
    correctAnswer: 1,
    explanation:
      "Running rigging includes halyards, sheets, and control lines that are used to hoist, trim, and adjust the sails.",
  },
  {
    id: "rg8",
    question: "What should you check on a halyard before hoisting sail?",
    options: [
      "That it is the correct colour",
      "That it runs free, is not chafed, and the shackle is secure",
      "That it is coiled neatly on deck",
      "That it has a label attached",
    ],
    correctAnswer: 1,
    explanation:
      "Before hoisting, ensure the halyard runs free without tangles, is not chafed, and the shackle pin is secure and moused.",
  },
  {
    id: "rg9",
    question: "Why should you check the gooseneck fitting regularly?",
    options: [
      "It affects the sail colour",
      "A failure would release the boom, causing injury and loss of control",
      "It is purely cosmetic",
      "To measure mast height",
    ],
    correctAnswer: 1,
    explanation:
      "The gooseneck connects the boom to the mast. Failure would release the boom, which could injure crew and cause loss of sail control.",
  },
  {
    id: "rg10",
    question: "What are shrouds?",
    options: [
      "Fabric covers for the sails",
      "Fixed wires running from the mast to the sides of the hull",
      "Ropes used to reef the mainsail",
      "Fenders hung along the side",
    ],
    correctAnswer: 1,
    explanation:
      "Shrouds are fixed (standing rigging) wires running from the mast to chain plates on the hull sides, providing lateral support.",
  },
  {
    id: "rg11",
    question: "What is the purpose of a topping lift?",
    options: [
      "To hoist the mainsail",
      "To support the boom when the mainsail is lowered or reefed",
      "To tension the forestay",
      "To tighten the backstay",
    ],
    correctAnswer: 1,
    explanation:
      "The topping lift supports the boom when the mainsail is lowered, reefed, or not set, preventing it from dropping onto the deck or crew.",
  },
  {
    id: "rg12",
    question: "What sign of wear would make you replace a wire shroud immediately?",
    options: [
      "Slight discolouration",
      "Broken strands (meat hooks) visible on the wire",
      "Surface salt deposits",
      "It makes a humming sound in wind",
    ],
    correctAnswer: 1,
    explanation:
      "Broken strands (often called 'meat hooks' because they can cut skin) indicate serious fatigue and the shroud should be replaced before sailing.",
  },
] as const;

export default rigQuestions;
