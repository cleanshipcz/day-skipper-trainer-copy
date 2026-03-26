import type { Question } from "./types";

const colregsQuestions: readonly Question[] = [
  {
    id: "cr1",
    question: "In this hierarchy of vessels, which vessel must give way (keep clear) of all the others listed?",
    options: ["Power-driven vessel", "Sailing vessel", "Fishing vessel", "Restricted in Ability to Maneuver"],
    correctAnswer: 0,
    explanation:
      "Rule 18: A power-driven vessel routinely gives way to sailing vessels, fishing vessels, RAM, NUC, and CBD vessels.",
  },
  {
    id: "cr2",
    question: "You are overtaking another vessel. Who is the give-way vessel?",
    image: "/images/colregs/quiz_overtaking.png",
    options: [
      "I am (the overtaking vessel)",
      "The vessel being overtaken",
      "The smaller vessel",
      "The power-driven vessel",
    ],
    correctAnswer: 0,
    explanation: "Rule 13: Any vessel overtaking any other shall keep out of the way of the vessel being overtaken.",
  },
  {
    id: "cr3",
    question: "You see this red light on your starboard bow. What is the situation?",
    image: "/images/colregs/quiz_crossing_giveway.png",
    options: [
      "Crossing situation, risk of collision exists, I must give way",
      "Crossing situation, I am stand-on",
      "He is overtaking me",
      "He is safe to pass ahead",
    ],
    correctAnswer: 0,
    explanation:
      "Rule 15: You see a red light on your starboard side ('Red Right Returning' doesn't apply here!). This is a crossing situation where you are the give-way vessel.",
  },
  {
    id: "cr4",
    question: "You see this green light on your port bow. What action should you take?",
    image: "/images/colregs/quiz_crossing_standon.png",
    options: ["Maintain course and speed (Stand-on)", "Give way immediately", "Turn to port", "Stop engines"],
    correctAnswer: 0,
    explanation:
      "Rule 15: You see a green light (starboard side) of another vessel on your port side. You are the stand-on vessel.",
  },
  {
    id: "cr5",
    question: "Two sailing vessels with wind on the same side. Which one gives way?",
    image: "/images/colregs/quiz_sailing_windward.png",
    options: [
      "The windward vessel (Boat A) gives way",
      "The leeward vessel (Boat B) gives way",
      "The faster vessel gives way",
      "The vessel with more sails gives way",
    ],
    correctAnswer: 0,
    explanation:
      "Rule 12: When both have the wind on the same side, the vessel which is to WINDWARD shall keep out of the way of the vessel which is to leeward.",
  },
  {
    id: "cr6",
    question: "Identify these lights.",
    image: "/images/colregs/quiz_lights_power.png",
    options: ["Power-driven vessel under 50m", "Sailing vessel", "Fishing vessel", "Vessel at anchor"],
    correctAnswer: 0,
    explanation:
      "Rule 23: A power-driven vessel underway exhibits a masthead light forward and sidelights. (Under 50m only requires one masthead light).",
  },
  {
    id: "cr7",
    question: "Identify these lights.",
    image: "/images/colregs/quiz_lights_sailing.png",
    options: ["Sailing vessel underway", "Power-driven vessel", "Vessel Not Under Command", "Pilot vessel"],
    correctAnswer: 0,
    explanation:
      "Rule 25: A sailing vessel underway exhibits sidelights and a sternlight. It does NOT show a white masthead light.",
  },
  {
    id: "cr8",
    question: "What signal should a vessel sound when altering course to starboard?",
    options: ["1 short blast", "2 short blasts", "3 short blasts", "5 short blasts"],
    correctAnswer: 0,
    explanation: "Rule 34: One short blast means 'I am altering my course to starboard'.",
  },
  {
    id: "cr9",
    question: "What does 5 short blasts mean?",
    options: [
      "I am in doubt of your intentions / Danger signal",
      "I am operating astern propulsion",
      "I am altering course to port",
      "I intend to overtake you",
    ],
    correctAnswer: 0,
    explanation: "Rule 34: 5 short blasts is the signal for doubt/danger.",
  },
  {
    id: "cr10",
    question: "What is a 'safe speed'?",
    options: [
      "A speed that allows effective action to avoid collision",
      "5 knots",
      "The slowest speed the vessel can maintain steerage",
      "Maximum speed in good visibility",
    ],
    correctAnswer: 0,
    explanation:
      "Rule 6: Every vessel shall at all times proceed at a safe speed so that she can take proper and effective action to avoid collision.",
  },
  {
    id: "cr11",
    question: "In a head-on situation, how should two power-driven vessels pass?",
    options: ["Port to Port", "Starboard to Starboard", "It doesn't matter", "Review the other vessel's size"],
    correctAnswer: 0,
    explanation:
      "Rule 14: Each shall alter her course to starboard so that each shall pass on the port side of the other.",
  },
  {
    id: "cr12",
    question: "Does a sailing vessel under power (motoring) count as a sailing vessel?",
    options: [
      "No, it is treated as a power-driven vessel",
      "Yes, if the sails are up",
      "Only if the engine is in neutral",
      "Yes, always",
    ],
    correctAnswer: 0,
    explanation:
      "Rule 3: The term 'sailing vessel' means any vessel under sail provided that propelling machinery, if fitted, is NOT being used.",
  },
  {
    id: "cr13",
    question: "What is a 'Not Under Command' (NUC) vessel?",
    options: [
      "Unable to maneuver as required by these Rules due to exceptional circumstances",
      "A vessel with no captain",
      "A vessel anchored",
      "A vessel engaged in fishing",
    ],
    correctAnswer: 0,
    explanation:
      "Rule 3: NUC means a vessel which through some exceptional circumstance (breakdown) is unable to maneuver as required.",
  },
  {
    id: "cr14",
    question: "Which side is the 'danger side' in a crossing situation?",
    options: ["Starboard", "Port", "Stern", "Bow"],
    correctAnswer: 0,
    explanation: "If a vessel is approaching from your Starboard side, you must give way. 'Right is Might'.",
  },
  {
    id: "cr15",
    question: "What lights must a vessel under oars show?",
    options: [
      "Must have an electric torch or lantern ready to show to prevent collision",
      "Sidelights and sternlight",
      "All-round white light",
      "No lights required",
    ],
    correctAnswer: 0,
    explanation:
      "Rule 25: A vessel under oars may exhibit the lights for a sailing vessel, but if not, must have an electric torch/lantern ready.",
  },
  {
    id: "cr16",
    question: "When is a vessel 'underway'?",
    options: [
      "When not at anchor, or made fast to the shore, or aground",
      "When moving through the water",
      "When the engine is running",
      "When the sails are up",
    ],
    correctAnswer: 0,
    explanation:
      "Rule 3: 'Underway' means that a vessel is not at anchor, or made fast to the shore, or aground. You can be underway but not making way (stopped).",
  },
  {
    id: "cr17",
    question: "What shape does a vessel at anchor exhibit by day?",
    options: ["One black ball", "A diamond shape", "A cylinder", "Two black balls"],
    correctAnswer: 0,
    explanation: "Rule 30: A vessel at anchor shall exhibit where it can best be seen: in the fore part, a ball.",
  },
  {
    id: "cr18",
    question: "You are in fog. You hear one prolonged blast every 2 minutes. What is it?",
    options: ["Power-driven vessel making way", "Sailing vessel", "Vessel at anchor", "Pilot vessel"],
    correctAnswer: 0,
    explanation:
      "Rule 35: A power-driven vessel making way through the water sounds one prolonged blast at intervals of not more than 2 minutes.",
  },
  {
    id: "cr19",
    question: "You are in fog. You hear two prolonged blasts every 2 minutes. What is it?",
    options: [
      "Power-driven vessel underway but stopped (not making way)",
      "Sailing vessel",
      "Fishing vessel",
      "Vessel aground",
    ],
    correctAnswer: 0,
    explanation: "Rule 35: A power-driven vessel underway but stopped/not making way sounds two prolonged blasts.",
  },
  {
    id: "cr20",
    question: "What is the general rule for Narrow Channels regarding small vessels?",
    options: [
      "Vessels <20m and sailing vessels shall not impede safe passage of a vessel that can only navigate safely in the channel",
      "Small vessels have right of way",
      "Keep to the port side",
      "All vessels have equal rights",
    ],
    correctAnswer: 0,
    explanation:
      "Rule 9: A vessel of less than 20 meters in length or a sailing vessel shall not impede the passage of a vessel which can safely navigate only within a narrow channel or fairway.",
  },
] as const;

export default colregsQuestions;
