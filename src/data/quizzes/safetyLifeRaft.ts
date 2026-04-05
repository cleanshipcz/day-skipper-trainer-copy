import type { Question } from "./types";

const safetyLifeRaftQuestions: readonly Question[] = [
  {
    id: "raft1",
    question: "What is the golden rule of abandoning ship?",
    options: [
      "Step UP into the life raft — the vessel should be sinking beneath you",
      "Jump into the water first, then swim to the raft",
      "Always abandon ship at the first sign of danger",
      "The youngest crew member should board first",
    ],
    correctAnswer: 0,
    explanation:
      "The golden rule is to step UP into the life raft, meaning the vessel should be sinking beneath you. A yacht, even damaged, is a better survival platform than a life raft.",
  },
  {
    id: "raft2",
    question: "What is the purpose of a sea anchor (drogue) in a life raft?",
    options: [
      "To anchor the raft to the seabed",
      "To slow drift and keep the raft oriented to wind and waves",
      "To paddle the raft towards shore",
      "To signal rescuers",
    ],
    correctAnswer: 1,
    explanation:
      "A sea anchor (drogue) is deployed to slow the raft's drift and keep it oriented bow-to-waves, reducing the risk of capsizing and keeping the raft near the last known position.",
  },
  {
    id: "raft3",
    question: "Which type of life raft includes a full SOLAS B equipment pack?",
    options: [
      "Coastal life raft",
      "Open-reversible life raft",
      "Offshore life raft",
      "Inflatable dinghy",
    ],
    correctAnswer: 2,
    explanation:
      "Offshore life rafts carry a full SOLAS B equipment pack including flares, water, first aid kit, and survival equipment for extended ocean survival.",
  },
  {
    id: "raft4",
    question: "What is the FIRST action when deploying a life raft canister?",
    options: [
      "Pull the painter sharply to trigger inflation",
      "Throw the canister over the leeward side",
      "Secure the painter to a strong point on the vessel",
      "Remove the canister lashings",
    ],
    correctAnswer: 2,
    explanation:
      "The painter must be secured to a strong point BEFORE launching the canister, to prevent the raft from drifting away once inflated.",
  },
  {
    id: "raft5",
    question: "Who should board the life raft first?",
    options: [
      "The skipper",
      "The lightest crew member",
      "The strongest person, to stabilise the raft",
      "Children and elderly first",
    ],
    correctAnswer: 2,
    explanation:
      "The strongest person boards first to stabilise the raft and then help injured or weaker crew members aboard.",
  },
  {
    id: "raft6",
    question: "What should you do with water rations in the first 24 hours in a life raft?",
    options: [
      "Drink as much as possible while supplies last",
      "Distribute water equally immediately",
      "No food or water for the first 24 hours",
      "Only drink sea water to conserve fresh water",
    ],
    correctAnswer: 2,
    explanation:
      "The general guidance is no food or water for the first 24 hours. The body can manage without, and this preserves limited supplies for the longer term. Never drink sea water.",
  },
  {
    id: "raft7",
    question: "Which side of the vessel should you launch the life raft from?",
    options: [
      "The windward side for maximum clearance",
      "The leeward side for shelter from wind and waves",
      "The bow for best visibility",
      "It doesn't matter which side",
    ],
    correctAnswer: 1,
    explanation:
      "Launch from the leeward side. This provides shelter from wind and waves, making it easier to bring the raft alongside and board safely.",
  },
  {
    id: "raft8",
    question: "When should you cut the painter line from the sinking vessel?",
    options: [
      "Immediately after inflation",
      "Before anyone boards the raft",
      "Only when everyone is safely aboard the raft",
      "You should never cut it — keep attached to the vessel",
    ],
    correctAnswer: 2,
    explanation:
      "Cut the painter only when everyone is safely aboard. The painter keeps the raft alongside for boarding, but must be cut before the vessel sinks to avoid dragging the raft down.",
  },
  {
    id: "raft9",
    question: "What item in the SOLAS pack is used to maintain buoyancy if the raft is punctured?",
    options: [
      "Bailer",
      "Repair kit",
      "Bellows / inflation pump",
      "Sea anchor",
    ],
    correctAnswer: 1,
    explanation:
      "The repair kit contains patches and adhesive to seal punctures and maintain the raft's buoyancy. The bellows can re-inflate tubes after patching.",
  },
  {
    id: "raft10",
    question: "What is the main advantage of an open-reversible life raft?",
    options: [
      "It carries more equipment than offshore models",
      "It can be boarded from either side if it inflates upside down",
      "It is cheaper than other types",
      "It provides better weather protection",
    ],
    correctAnswer: 1,
    explanation:
      "An open-reversible life raft can be used whichever way up it inflates, eliminating the dangerous task of righting an inverted raft in heavy seas.",
  },
];

export default safetyLifeRaftQuestions;
