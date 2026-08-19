import type { Question } from "./types";

/**
 * Comprehensive Safety Quiz — E1-S6
 *
 * 24 questions spanning all six safety sub-topics required by the RYA Day Skipper syllabus:
 *   MOB (4), Fire (4), Life Raft (4), Flares (4), Personal Safety (4), Gas Safety (4).
 *
 * Question IDs use the "safety-<subtopic><n>" namespace to avoid collisions with
 * the dedicated sub-quiz files (safetyMob.ts, safetyFire.ts, etc.).
 */
const authoredSafetyQuestions: readonly Question[] = [
  // ── MOB (Man Overboard) ──────────────────────────────────────────────
  {
    id: "safety-mob1",
    question:
      "Under sail, you witness a crew member fall overboard. Which immediate sequence preserves the best recovery options?",
    options: [
      "Shout the alarm, keep a pointer and lookout, throw buoyancy, mark the position, and control the vessel using its practised return plan",
      "Apply one universal broad-reach manoeuvre before alerting anyone",
      "Send another person into the water",
      "Start the engine immediately without checking lines or the casualty",
    ],
    correctAnswer: 0,
    explanation:
      "Alarm, continuous pointing/lookout, flotation and a position reference run alongside prompt vessel control. The return manoeuvre depends on vessel, sail plan, crew and conditions; use the practised plan and manage engine/line/propeller hazards rather than imposing one turn.",
  },
  {
    id: "safety-mob2",
    question:
      "What is the primary purpose of pressing the MOB button on the GPS/chartplotter?",
    options: [
      "It sends an automatic MAYDAY on VHF Channel 16",
      "It records a position reference near where the person entered the water",
      "It activates the EPIRB",
      "It sounds the fog horn automatically",
    ],
    correctAnswer: 1,
    explanation:
      "The MOB function records an important position and time reference, but it is not the person's live position: both casualty and vessel drift. Keep visual pointing and lookout, deploy buoyancy and use all available references.",
  },
  {
    id: "safety-mob3",
    question: "How should a cold or hypothermic person normally be brought from the water when the recovery equipment and conditions permit?",
    options: [
      "Vertically by the arms to drain water",
      "As horizontally or near-horizontally as practicable, supporting the body and handling gently",
      "Head-down over the guardrail",
      "By asking them to climb unaided",
    ],
    correctAnswer: 1,
    explanation:
      "Cold casualties are vulnerable to collapse and cardiac arrest around rescue. Recover as horizontally or near-horizontally as the vessel, equipment and immediate danger permit, support the body, handle gently, monitor breathing and follow current first-aid and rescue-service advice. Do not delay an essential rescue to achieve a perfect angle.",
  },
  {
    id: "safety-mob4",
    question:
      "During a MOB recovery under power, when should you put the engine into neutral?",
    options: [
      "Immediately after the person falls overboard",
      "Only after the person is back on board",
      "Before the final close approach or contact, in time to remove propeller risk",
      "Neutral is never needed — keep steerage at all times",
    ],
    correctAnswer: 2,
    explanation:
      "Remove propeller risk before the final approach or contact: neutral early enough for the conditions, and stop the engine where the vessel plan and risk require it. Account for ropes in the water and confirm propulsion status aloud; exact handling is vessel-specific.",
  },

  // ── Fire Safety ──────────────────────────────────────────────────────
  {
    id: "safety-fire1",
    question:
      "Smoke is discovered below. Which sequence takes priority before any limited attempt to fight the fire?",
    options: [
      "Raise the alarm, account for and move crew toward safe escape, communicate early, isolate fuel/power/ventilation only if safe, then consider a limited attack without sacrificing escape",
      "Find the seat alone before waking the crew",
      "Select an extinguisher before accounting for people",
      "Open every boundary to improve visibility",
    ],
    correctAnswer: 0,
    explanation:
      "People, alarm, accounting and escape come first. Communicate early and perform only safe, vessel-specific shutdowns; a limited attack is optional and ends when smoke, fire or escape conditions worsen. A mnemonic must not delay those priorities.",
  },
  {
    id: "safety-fire2",
    question: "An energised panel is burning and safe isolation is not yet confirmed. What controls extinguisher selection?",
    options: [
      "The unit's actual marking and instructions for the voltage and distance, with isolation first if safe",
      "Its colour band alone",
      "Any extinguisher described as marine",
      "Water because it cools",
    ],
    correctAnswer: 0,
    explanation:
      "Electricity is a hazard, not a fire class. Isolate first if safe; otherwise only equipment whose exact marking and instructions permit the voltage, distance and use is supportable. Colour or a generic product type does not establish suitability.",
  },
  {
    id: "safety-fire3",
    question:
      "A fire breaks out in the engine compartment. After stopping the engine, how should you apply the extinguisher?",
    options: [
      "Open the hatch fully and aim directly at the base of the fire",
      "Keep the enclosure closed; use only the fitted fire port or fixed system and shutdown sequence exactly as instructed",
      "Remove the engine cover completely for access",
      "Wait until the fire burns down, then spray",
    ],
    correctAnswer: 1,
    explanation:
      "Alarm and account for crew, stop engine, fuel and ventilation by the vessel procedure, keep the enclosure closed, and use only its approved fire port or fixed system instructions. Do not improvise a hatch gap or assume a generic agent.",
  },
  {
    id: "safety-fire4",
    question: "What evidence establishes whether a portable extinguisher is suitable for a particular onboard fire?",
    options: [
      "The label, fire rating, electrical limitations, instructions and the actual fire and escape conditions",
      "The colour band alone",
      "The cylinder size alone",
      "Whether another boat carries the same type",
    ],
    correctAnswer: 0,
    explanation:
      "Colour can aid recognition but cannot prove fire rating, electrical suitability, range or safe use. Read the exact unit markings and instructions, protect escape, and withdraw when conditions exceed a limited safe attack.",
  },

  // ── Life Raft & Abandon Ship ─────────────────────────────────────────
  {
    id: "safety-raft1",
    question:
      "What essential item should the skipper grab before stepping into the life raft?",
    options: [
      "The ship's log book",
      "The vessel's prepared grab bag, only if it is safely accessible without delaying escape",
      "Personal belongings",
      "The anchor chain",
    ],
    correctAnswer: 1,
    explanation:
      "Take the prepared grab bag and additional equipment only when safely accessible. Its contents must be reconciled with the exact raft pack and vessel plan before departure; no item justifies delaying abandonment or crossing fire or smoke.",
  },
  {
    id: "safety-raft2",
    question: "How should a life raft canopy be managed after boarding?",
    options: [
      "Use the exact raft instructions and conditions to balance shelter, ventilation, lookout and signalling",
      "Keep every opening sealed in all climates and medical conditions",
      "Leave it fully open in all weather",
      "The canopy controls inflation pressure",
    ],
    correctAnswer: 0,
    explanation:
      "The canopy can reduce exposure, but ventilation, heat, sickness, lookout and signalling needs vary. Rig and adjust it using the exact raft instructions and current conditions rather than applying an always-closed rule.",
  },
  {
    id: "safety-raft3",
    question: "What determines when a life raft must next be serviced?",
    options: [
      "A universal annual interval",
      "The exact raft manufacturer's schedule and current service label/certificate, accounting for pack, vessel regime and service history",
      "A universal three-year interval",
      "Only whether the canister looks unopened",
    ],
    correctAnswer: 1,
    explanation:
      "Intervals differ by raft model, package, age/history, operating conditions and applicable vessel regime. Follow the exact manufacturer's schedule and authorised service documentation; an unopened case or a generic interval does not establish currency.",
  },
  {
    id: "safety-raft4",
    question:
      "After boarding and accounting for everyone, how should occupants stabilise the raft?",
    options: [
      "Follow the raft checklist: manage attachment or release hazards, stream the sea anchor as instructed, close entrances/insulate as conditions require, bail and inspect for damage",
      "Fire every signal immediately",
      "Use one universal ration rule before treating casualties",
      "Cut every line before checking whether the vessel is still the safer reference",
    ],
    correctAnswer: 0,
    explanation:
      "After accounting and immediate casualty care, use the exact checklist and allocate roles. Attachment/release, sea-anchor deployment, entrances, bailing and inspection depend on the raft, vessel and hazards; distress communications and exposure control continue throughout.",
  },

  // ── Flares & Pyrotechnics ────────────────────────────────────────────
  {
    id: "safety-flare1",
    question:
      "You spot a distant vessel on the horizon at night. Which pyrotechnic should you fire first?",
    options: [
      "Red hand flare",
      "Orange smoke",
      "Red parachute rocket",
      "White hand flare",
    ],
    correctAnswer: 2,
    explanation:
      "A labelled red rocket-parachute flare is intended for long-range distress attraction. Actual trajectory, visibility and duration vary with the product and conditions; follow rescue coordination and the exact instructions.",
  },
  {
    id: "safety-flare2",
    question:
      "How should the skipper determine the pyrotechnic signals to carry for a coastal passage?",
    options: [
      "Apply the vessel's use, jurisdiction, operating area and applicable rules or guidance, then verify each exact product and the distress plan",
      "Use one universal six-flare leisure pack",
      "Copy the nearest yacht regardless of its regime",
      "Carry none whenever a VHF is fitted",
    ],
    correctAnswer: 0,
    explanation:
      "Carriage requirements and guidance depend on vessel type/use, jurisdiction and operating area. Communications do not automatically replace visual distress signals. Confirm the applicable regime and inspect the exact carried products; the quiz does not impose a universal pack.",
  },
  {
    id: "safety-flare3",
    question: "An unfamiliar hand flare is required during distress. What operating method should be used?",
    options: [
      "Follow that exact product's printed instructions, maintain the specified safe direction and account for wind and vessel hazards",
      "Use a memorised universal arm angle",
      "Copy a different manufacturer's product",
      "Point it toward the rescue craft",
    ],
    correctAnswer: 0,
    explanation:
      "Designs and activation methods differ. The exact label controls handling, orientation, wind allowance and misfire action; keep it directed safely away from people, vessel and rescuers and do not improvise.",
  },
  {
    id: "safety-flare4",
    question: "How do you establish whether a red hand flare remains serviceable and what performance to expect?",
    options: [
      "Use its exact expiry/service-life marking, label and instructions",
      "Assume every red hand flare burns for 60 seconds",
      "Use casing colour as the serviceability test",
      "Keep expired units as equivalent backups",
    ],
    correctAnswer: 0,
    explanation:
      "Service life and performance vary by product. Use the exact markings and instructions, replace by the stated date and arrange authorised disposal; do not teach a generic duration as an operating guarantee.",
  },

  // ── Personal Safety ──────────────────────────────────────────────────
  {
    id: "safety-personal1",
    question: "When should lifejackets be worn on a Day Skipper passage?",
    options: [
      "Only in rough weather above Force 6",
      "Only when instructed by the Coastguard",
      "Under the vessel's wear policy and skipper/risk assessment, including whenever conditions or the task require it",
      "Only when leaving harbour",
    ],
    correctAnswer: 2,
    explanation:
      "Wear policy must reflect the vessel, crew, conditions and task, with the skipper setting clear requirements. A correctly selected, fitted and maintained lifejacket must be worn whenever the policy or risk assessment requires it; merely carrying one is ineffective.",
  },
  {
    id: "safety-personal2",
    question: "What is the purpose of a crotch strap on an inflatable lifejacket?",
    options: [
      "To keep the lifejacket comfortable for long wear",
      "To prevent the lifejacket riding up over the wearer's head in the water",
      "To attach a safety harness tether",
      "To store the manual inflation toggle",
    ],
    correctAnswer: 1,
    explanation:
      "The crotch strap stops the lifejacket from riding up over the head when in the water. Without it the buoyancy can shift upward, leaving the airway unprotected.",
  },
  {
    id: "safety-personal3",
    question: "What does 'one hand for the boat, one hand for yourself' mean?",
    options: [
      "Always carry equipment with one hand",
      "Always maintain a secure handhold when moving about the deck",
      "Operate the helm with one hand and the mainsheet with the other",
      "Keep one hand on the VHF radio at all times",
    ],
    correctAnswer: 1,
    explanation:
      "This safety maxim reminds crew to always have a secure grip on the boat (guardrails, grab handles, jackstays) when moving on deck, especially in rough weather, to prevent falling overboard.",
  },
  {
    id: "safety-personal4",
    question:
      "What is the correct attachment point for a safety harness tether when going on deck at night?",
    options: [
      "The guardrail wires",
      "The designated approved jackstay or strong point in the vessel's tether plan",
      "The boom vang",
      "A neighbouring crew member's harness",
    ],
    correctAnswer: 1,
    explanation:
      "Use only the vessel's inspected, approved attachment route and compatible tether, rigged to reduce going over the side and avoid entrapment. Do not assume every rail, line or fitting is an arrest point; inspect and practise transitions for the actual vessel.",
  },

  // ── Gas Safety ───────────────────────────────────────────────────────
  {
    id: "safety-gas1",
    question: "Where does propane (LPG) accumulate if it leaks on a yacht?",
    options: [
      "At the highest point of the cabin because it is lighter than air",
      "Evenly throughout the cabin",
      "In the bilge and low-lying areas because it is heavier than air",
      "Only in the gas locker",
    ],
    correctAnswer: 2,
    explanation:
      "LPG vapour is heavier than air and can collect in bilges and other low spaces, where it may form a flammable atmosphere. Treat smell or an alarm as a warning, avoid ignition and follow the vessel's emergency procedure; absence of smell does not prove safety.",
  },
  {
    id: "safety-gas2",
    question: "Where should a gas bottle locker be located on a yacht?",
    options: [
      "In the engine compartment for warmth",
      "Below the cabin sole for easy access",
      "In the vessel's approved enclosure, separated from accommodation and drained overboard as its design and applicable rules require",
      "Anywhere that is convenient and out of the way",
    ],
    correctAnswer: 2,
    explanation:
      "Use only the approved cylinder enclosure and applicable vessel design: it must prevent vapour entering accommodation and drain outside as specified. Exact construction and dimensions depend on the vessel and governing regime; never improvise storage.",
  },
  {
    id: "safety-gas3",
    question: "Before starting the engine after the yacht has been closed up, you smell LPG below. What is the safe response?",
    options: [
      "Start the engine and use its blower to clear the low spaces",
      "Switch off the battery, then move the cylinder on deck to inspect it",
      "Do not start: isolate LPG only if safe, extinguish flames without using electrical switches, evacuate, ventilate naturally from outside and summon help",
      "Open one hatch, then start once the smell has faded",
    ],
    correctAnswer: 2,
    explanation:
      "Smell warns of a possible leak but does not prove its source or that a space is safe when it fades. Do not operate any electrical switch on or off. Isolate only if the designated control is safely reachable, evacuate, create a natural through-draught from outside without ignition, and summon appropriate help. Keep the system out of use until a competent boat-LPG person has tested and made it safe; if a cylinder leak cannot be stopped, withdraw rather than handling or moving it.",
  },
  {
    id: "safety-gas4",
    question:
      "How should the gas supply be managed when the stove or oven is not in use?",
    options: [
      "Leave the bottle valve open so gas is available quickly",
      "Turn off the appliance tap only",
      "Follow the vessel shutdown order for appliance controls, branch devices, any fitted secondary control, and the cylinder/designated main valve",
      "Disconnect the regulator from the bottle each time",
    ],
    correctAnswer: 2,
    explanation:
      "Controls differ. Follow the documented vessel and manufacturer shutdown sequence; a remote solenoid or secondary tap exists only where fitted and does not automatically replace the designated main/cylinder isolation routine.",
  },
] as const;

export const SAFETY_LEAF_ROUTES = {
  mob: "/safety/mob", fire: "/safety/fire", raft: "/safety/life-raft",
  flare: "/safety/flares", personal: "/safety/personal", gas: "/safety/gas",
} as const;
export type SafetyLeaf = keyof typeof SAFETY_LEAF_ROUTES;
const leafFor = (id: string): SafetyLeaf => id.match(/^safety-([a-z]+)\d$/)?.[1] as SafetyLeaf;
export const SAFETY_QUIZ_CRITICAL_IDS = ["safety-mob3", "safety-fire3", "safety-raft3", "safety-flare3", "safety-personal4", "safety-gas3"] as const;
export const SAFETY_QUIZ_REVIEW_METADATA = {
  revision: "comprehensive-safety-v2",
  status: "educational-cross-check-complete-qualified-review-not-recorded",
  assumptions: "Questions inherit the corrected leaf models and their source/review limits. Vessel, product, manufacturer, jurisdiction and operating-regime instructions remain controlling; a written result does not establish practical competence or equipment readiness.",
  sharedModels: ["safetyMob", "safetyFire", "safetyLifeRaft", "safetyFlares", "personalSafety", "gasSafety"],
} as const;
const SAFETY_OBJECTIVE_IDS: Readonly<Record<string, string>> = {
  "safety-mob1": "mob-immediate-return-sequence", "safety-mob2": "mob-position-marking", "safety-mob3": "mob-recovery-medical-boundary", "safety-mob4": "mob-propeller-stop-boundary",
  "safety-fire1": "fire-alarm-restrict-response-sequence", "safety-fire2": "fire-equipment-marking-boundary", "safety-fire3": "fire-enclosure-shutdown-boundary", "safety-fire4": "fire-attack-stop-boundary",
  "safety-raft1": "raft-grab-bag-escape-sequence", "safety-raft2": "raft-exposure-control", "safety-raft3": "raft-manufacturer-service-boundary", "safety-raft4": "raft-stabilisation-sequence",
  "safety-flare1": "flare-long-range-selection", "safety-flare2": "flare-vessel-regime-boundary", "safety-flare3": "flare-manufacturer-operation-boundary", "safety-flare4": "flare-service-life-boundary",
  "safety-personal1": "personal-wear-policy-boundary", "safety-personal2": "personal-lifejacket-fit", "safety-personal3": "personal-safe-movement", "safety-personal4": "personal-tether-attachment-boundary",
  "safety-gas1": "gas-low-space-collection", "safety-gas2": "gas-locker-design-boundary", "safety-gas3": "gas-emergency-stop-escalate-sequence", "safety-gas4": "gas-manufacturer-shutdown-sequence",
};
export const SAFETY_QUIZ_OBJECTIVE_MATRIX = authoredSafetyQuestions.map((question) => {
  const leaf = leafFor(question.id);
  return { questionId: question.id, leaf, objectiveId: SAFETY_OBJECTIVE_IDS[question.id], remediationRoute: SAFETY_LEAF_ROUTES[leaf] };
});

const safetyQuestions: readonly Question[] = authoredSafetyQuestions.map((question) => {
  const matrix = SAFETY_QUIZ_OBJECTIVE_MATRIX.find(({ questionId }) => questionId === question.id)!;
  return { ...question, leaf: matrix.leaf, learningObjective: matrix.objectiveId, prerequisite: "Review the corresponding corrected Safety lesson and the vessel/equipment instructions first.", remediationRoute: matrix.remediationRoute };
});

export default safetyQuestions;
