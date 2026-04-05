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
const safetyQuestions: readonly Question[] = [
  // ── MOB (Man Overboard) ──────────────────────────────────────────────
  {
    id: "safety-mob1",
    question:
      "Under sail, you witness a crew member fall overboard. After shouting 'Man Overboard', what is the helmsman's immediate action?",
    options: [
      "Tack immediately towards the casualty",
      "Bear away to a broad reach to maintain speed and control",
      "Heave-to and deploy the life raft",
      "Start the engine and motor directly back",
    ],
    correctAnswer: 1,
    explanation:
      "The helmsman should bear away onto a broad reach. This maintains boat speed for manoeuvrability and sets up for a controlled return using the reach-tack-reach method.",
  },
  {
    id: "safety-mob2",
    question:
      "What is the primary purpose of pressing the MOB button on the GPS/chartplotter?",
    options: [
      "It sends an automatic MAYDAY on VHF Channel 16",
      "It records the position where the person entered the water",
      "It activates the EPIRB",
      "It sounds the fog horn automatically",
    ],
    correctAnswer: 1,
    explanation:
      "The MOB button marks the exact GPS position where the person went overboard, allowing the crew to navigate back to that point even if visual contact is lost.",
  },
  {
    id: "safety-mob3",
    question: "What is 'Reflow Syndrome' in the context of recovering a hypothermic casualty?",
    options: [
      "Water entering the lungs when the casualty is pulled from the sea",
      "Cold blood from the extremities rushing to the heart when the casualty is lifted vertically",
      "The casualty vomiting sea water after rescue",
      "Loss of consciousness due to sudden warmth",
    ],
    correctAnswer: 1,
    explanation:
      "Reflow Syndrome (also called circum-rescue collapse) occurs when a hypothermic person is lifted vertically — cold, acidic blood from the legs rushes to the core and can cause cardiac arrest. Always lift horizontally.",
  },
  {
    id: "safety-mob4",
    question:
      "During a MOB recovery under power, when should you put the engine into neutral?",
    options: [
      "Immediately after the person falls overboard",
      "Only after the person is back on board",
      "When the casualty is alongside, before making contact",
      "Neutral is never needed — keep steerage at all times",
    ],
    correctAnswer: 2,
    explanation:
      "The engine must be in neutral before the casualty is alongside to prevent propeller injuries. Final positioning is done using the boat's remaining momentum.",
  },

  // ── Fire Safety ──────────────────────────────────────────────────────
  {
    id: "safety-fire1",
    question:
      "What is the recommended sequence for fighting a fire on board using the FIRE mnemonic?",
    options: [
      "Find, Inform, Restrict, Extinguish",
      "Fight, Isolate, Retreat, Evacuate",
      "Flood, Insulate, Remove, Escape",
      "Find, Ignite, Run, Exit",
    ],
    correctAnswer: 0,
    explanation:
      "The FIRE mnemonic stands for Find the fire, Inform the crew, Restrict air supply and fuel, Extinguish the fire. This structured approach prevents panic.",
  },
  {
    id: "safety-fire2",
    question: "Which fire extinguisher type is safe to use on live electrical equipment?",
    options: [
      "Water",
      "Foam (AFFF)",
      "CO2",
      "Wet chemical",
    ],
    correctAnswer: 2,
    explanation:
      "CO2 extinguishers are non-conductive and leave no residue, making them safe for electrical fires. Water, foam, and wet chemical extinguishers all conduct electricity.",
  },
  {
    id: "safety-fire3",
    question:
      "A fire breaks out in the engine compartment. After stopping the engine, how should you apply the extinguisher?",
    options: [
      "Open the hatch fully and aim directly at the base of the fire",
      "Crack the hatch just enough to insert the nozzle and discharge",
      "Remove the engine cover completely for access",
      "Wait until the fire burns down, then spray",
    ],
    correctAnswer: 1,
    explanation:
      "Only crack the hatch enough to insert the extinguisher nozzle. Opening it fully feeds the fire with oxygen. In an enclosed space the CO2 or powder is most effective with minimal ventilation.",
  },
  {
    id: "safety-fire4",
    question: "What colour band identifies a foam (AFFF) fire extinguisher?",
    options: [
      "Blue",
      "Black",
      "Cream / Pale yellow",
      "Red",
    ],
    correctAnswer: 2,
    explanation:
      "Foam (AFFF) extinguishers are identified by a cream or pale yellow colour band. Blue = dry powder, black = CO2, red body = water.",
  },

  // ── Life Raft & Abandon Ship ─────────────────────────────────────────
  {
    id: "safety-raft1",
    question:
      "What essential item should the skipper grab before stepping into the life raft?",
    options: [
      "The ship's log book",
      "The grab bag (ditch bag) with survival equipment",
      "Personal belongings",
      "The anchor chain",
    ],
    correctAnswer: 1,
    explanation:
      "The grab bag (ditch bag) is pre-packed with essential survival items: flares, water, handheld VHF, torch, first aid kit, knife, and SART/PLB. It is the single most important item to bring.",
  },
  {
    id: "safety-raft2",
    question: "Why is it important to keep the life raft's canopy closed once everyone is aboard?",
    options: [
      "To keep the raft inflated",
      "To reduce heat loss, protect from spray, and improve morale",
      "To prevent the raft from capsizing",
      "To make the raft invisible to rescuers",
    ],
    correctAnswer: 1,
    explanation:
      "Closing the canopy protects occupants from wind, spray, sun, and cold. Maintaining body heat is critical for survival, and shelter greatly improves morale and reduces panic.",
  },
  {
    id: "safety-raft3",
    question: "How often must a life raft be serviced to remain in date?",
    options: [
      "Every 6 months",
      "Every year",
      "Every 3 years",
      "Every 5 years",
    ],
    correctAnswer: 2,
    explanation:
      "Life rafts must be professionally serviced every 3 years (some manufacturers specify annually for older rafts). A service checks inflation, repairs fabric, and replaces expired supplies.",
  },
  {
    id: "safety-raft4",
    question:
      "After boarding the life raft, what is the first maintenance action to perform?",
    options: [
      "Deploy a flare to attract attention",
      "Check for leaks, deploy the sea anchor, and bail out water",
      "Ration the food supplies immediately",
      "Try to paddle towards shore",
    ],
    correctAnswer: 1,
    explanation:
      "Immediate priorities are: check for and repair leaks, deploy the sea anchor to control drift and reduce capsize risk, and bail out any water that entered during boarding.",
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
      "A red parachute rocket reaches ~300 m and is visible up to 40 km at night. It is the best long-range signal to attract distant vessels. Save hand flares for when rescuers are closer.",
  },
  {
    id: "safety-flare2",
    question:
      "What is the minimum number of flares recommended for a coastal passage within 7 miles of shore?",
    options: [
      "2 red hand flares only",
      "2 red parachute rockets, 2 red hand flares, 2 orange smoke signals",
      "4 red parachute rockets and 2 orange smoke",
      "None — a VHF radio is sufficient",
    ],
    correctAnswer: 1,
    explanation:
      "The recommended minimum coastal pack is: 2 red parachute rockets (long range), 2 red hand flares (close range night), and 2 orange smoke signals (close range day).",
  },
  {
    id: "safety-flare3",
    question: "How should you hold a hand flare when firing it?",
    options: [
      "At arm's length downwind, angled slightly away from the body",
      "Close to your body for stability",
      "Above your head pointing straight up",
      "Pointing directly at the approaching vessel",
    ],
    correctAnswer: 0,
    explanation:
      "Hold hand flares at arm's length, downwind, angled slightly away from you and the vessel. This prevents drips of burning composition falling onto you or the deck.",
  },
  {
    id: "safety-flare4",
    question: "What is the approximate burn time of a standard red hand flare?",
    options: [
      "15 seconds",
      "60 seconds",
      "3 minutes",
      "5 minutes",
    ],
    correctAnswer: 1,
    explanation:
      "A standard red hand flare burns for approximately 60 seconds. This is enough time for a nearby rescue vessel to take a bearing on your position.",
  },

  // ── Personal Safety ──────────────────────────────────────────────────
  {
    id: "safety-personal1",
    question: "When should lifejackets be worn on a Day Skipper passage?",
    options: [
      "Only in rough weather above Force 6",
      "Only when instructed by the Coastguard",
      "At all times on deck, and whenever the skipper directs",
      "Only when leaving harbour",
    ],
    correctAnswer: 2,
    explanation:
      "Best practice is to wear a lifejacket at all times when on deck. The skipper may mandate wearing them below in heavy weather too. Most drownings occur because lifejackets were not worn.",
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
      "A jackstay (strong line or webbing running fore-and-aft along the deck)",
      "The boom vang",
      "A neighbouring crew member's harness",
    ],
    correctAnswer: 1,
    explanation:
      "Jackstays are strong webbing straps or wire running fore-and-aft. They allow the wearer to move along the deck while remaining clipped on. Guardrails are not strong enough to arrest a fall.",
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
      "Propane is heavier than air (relative density ~1.5). Leaked gas sinks to the bilge and other low points, creating an explosive concentration that is very difficult to ventilate.",
  },
  {
    id: "safety-gas2",
    question: "Where should a gas bottle locker be located on a yacht?",
    options: [
      "In the engine compartment for warmth",
      "Below the cabin sole for easy access",
      "In a sealed locker that drains overboard, not into the bilge",
      "Anywhere that is convenient and out of the way",
    ],
    correctAnswer: 2,
    explanation:
      "Gas bottles must be in a dedicated locker that is sealed from the accommodation and has a drain overboard at the lowest point. Any leak drains safely overboard rather than into the bilge.",
  },
  {
    id: "safety-gas3",
    question: "What should you do FIRST if you smell gas below decks?",
    options: [
      "Light a match to locate the leak",
      "Turn off the gas at the bottle, extinguish all flames, and ventilate",
      "Radio the Coastguard for advice",
      "Start the engine to ventilate via the exhaust blower",
    ],
    correctAnswer: 1,
    explanation:
      "Immediately shut off the gas at the bottle valve, extinguish all naked flames and ignition sources, and open hatches to ventilate. Never create sparks — even a light switch can ignite gas.",
  },
  {
    id: "safety-gas4",
    question:
      "How should the gas supply be managed when the stove or oven is not in use?",
    options: [
      "Leave the bottle valve open so gas is available quickly",
      "Turn off the appliance tap only",
      "Turn off the gas at the bottle (or use a remote shut-off valve) in addition to the appliance tap",
      "Disconnect the regulator from the bottle each time",
    ],
    correctAnswer: 2,
    explanation:
      "Best practice is to shut off the gas at the bottle or remote shut-off valve when not in use, in addition to closing the appliance tap. This provides double protection against leaks in the supply line.",
  },
] as const;

export default safetyQuestions;
