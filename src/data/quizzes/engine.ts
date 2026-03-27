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
  {
    id: "e6",
    question: "What colour should healthy engine coolant be?",
    options: [
      "Black",
      "Pink or green (depending on type), clear and free of debris",
      "Brown and cloudy",
      "Colourless like water",
    ],
    correctAnswer: 1,
    explanation:
      "Coolant should be pink or green (depending on the antifreeze type), clear, and free of debris or oil contamination.",
  },
  {
    id: "e7",
    question: "Why should you check the stern gland before starting the engine?",
    options: [
      "To ensure the propeller is attached",
      "To verify it is dripping slightly (not dry, not streaming)",
      "To check the hull paint",
      "To tighten it as much as possible",
    ],
    correctAnswer: 1,
    explanation:
      "A stern gland should drip slightly when the shaft turns. Too dry causes overheating; too wet means it needs repacking or tightening.",
  },
  {
    id: "e8",
    question: "What should you do immediately if the engine oil pressure warning light comes on?",
    options: [
      "Increase revs to build pressure",
      "Stop the engine immediately and investigate",
      "Wait five minutes and check again",
      "Top up the fuel tank",
    ],
    correctAnswer: 1,
    explanation:
      "Stop the engine immediately to prevent serious damage. Investigate oil level, leaks, and filter condition before restarting.",
  },
  {
    id: "e9",
    question: "How often should fuel filters be checked on a diesel engine?",
    options: [
      "Once a year",
      "Before every passage and regularly during the season",
      "Only when the engine stalls",
      "Every 1,000 engine hours only",
    ],
    correctAnswer: 1,
    explanation:
      "Check fuel filters before every passage. Diesel bug and water contamination can block filters unexpectedly.",
  },
  {
    id: "e10",
    question: "What is 'diesel bug'?",
    options: [
      "An insect attracted to fuel fumes",
      "Microbial growth in diesel fuel that blocks filters",
      "A fault in the injection system",
      "Condensation on the engine block",
    ],
    correctAnswer: 1,
    explanation:
      "Diesel bug is microbial contamination (bacteria and fungi) that grows in diesel fuel, especially where water is present, and blocks fuel filters.",
  },
  {
    id: "e11",
    question: "Why is it important to run the engine in neutral before engaging gear?",
    options: [
      "To warm the gearbox oil and allow oil pressure to build",
      "To charge the batteries faster",
      "To test the throttle cable",
      "It makes no difference",
    ],
    correctAnswer: 0,
    explanation:
      "Warming up in neutral allows oil pressure to stabilise and gearbox oil to circulate before putting load on the drivetrain.",
  },
  {
    id: "e12",
    question: "What should you check when looking at the exhaust discharge?",
    options: [
      "That exhaust gases are blue",
      "That cooling water is flowing out with the exhaust",
      "That no exhaust gases are visible",
      "That the exhaust is completely dry",
    ],
    correctAnswer: 1,
    explanation:
      "Water should be visible in the exhaust discharge, confirming the raw-water cooling system is functioning. No water means overheating risk.",
  },
] as const;

export default engineQuestions;
