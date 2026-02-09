import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, XCircle, Trophy, RotateCcw, ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthHooks";
import { supabase } from "@/integrations/supabase/client";
import { useProgress } from "@/hooks/useProgress";
import {
  countCorrectAnswers,
  percentageScore,
  pointsFromCorrectAnswers,
  questionProgressPercent,
} from "@/features/quiz/scoring";
import {
  canonicalQuizProgressKey,
  resolveQuizProgressForLoad,
  type QuizAnswersHistory,
  type QuizProgressRow,
} from "@/features/quiz/progressKeys";
import { createSeededRng, shuffleWithRng } from "@/features/quiz/randomization";

interface Question {
  id: string;
  question: string;
  image?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const quizData: Record<string, Question[]> = {
  "nautical-terms-quiz": [
    {
      id: "nt-bow",
      question: "What is the forward end of a boat called?",
      options: ["Stern", "Bow", "Beam", "Keel"],
      correctAnswer: 1,
      explanation: "The bow is the forward part of the boat and points toward where you're heading.",
    },
    {
      id: "nt-port",
      question: "When facing forward, which side is port?",
      options: ["Right side (green light)", "Left side (red light)", "Back of the boat", "Windward side"],
      correctAnswer: 1,
      explanation: "Port is the left side when looking forward. The port navigation light is red.",
    },
    {
      id: "nt-starboard-light",
      question: "Which side displays the green navigation light?",
      options: ["Port", "Starboard", "Stern", "Bow"],
      correctAnswer: 1,
      explanation: "The starboard (right) side shows a green light, while port shows red.",
    },
    {
      id: "nt-stern",
      question: "What is the rear end of a boat called?",
      options: ["Keel", "Stern", "Beam", "Transom"],
      correctAnswer: 1,
      explanation: "The stern is the aft (rear) end of the boat and houses the rudder and helm area.",
    },
    {
      id: "nt-beam",
      question: "What does the term 'beam' refer to?",
      options: ["Height of the mast", "Width at the widest point", "Back edge of a sail", "Anchor chain length"],
      correctAnswer: 1,
      explanation: "Beam is the maximum width of the boat, measured at its widest point.",
    },
    {
      id: "nt-hull",
      question: "What is the watertight body of the boat called?",
      options: ["Hull", "Deck", "Keel", "Beam"],
      correctAnswer: 0,
      explanation: "The hull is the main watertight body that keeps the boat afloat.",
    },
    {
      id: "nt-deck",
      question: "What is the top surface you walk on called?",
      options: ["Deck", "Keel", "Cockpit", "Mast"],
      correctAnswer: 0,
      explanation: "The deck is the top surface of the hull, forming the working platform of the boat.",
    },
    {
      id: "nt-keel",
      question: "Which structure prevents sideways drift and adds stability?",
      options: ["Boom", "Keel", "Spreaders", "Forestay"],
      correctAnswer: 1,
      explanation: "The keel is the heavy underwater fin that stops leeway and keeps the boat upright.",
    },
    {
      id: "nt-rudder",
      question: "Which underwater blade steers the boat?",
      options: ["Keel", "Rudder", "Tiller", "Bow"],
      correctAnswer: 1,
      explanation: "The rudder pivots to redirect water flow, steering the boat.",
    },
    {
      id: "nt-tiller",
      question: "How does a tiller steer the boat?",
      options: [
        "Push left to turn left",
        "Push right to go left",
        "Pull back to slow down",
        "It works like a car steering wheel",
      ],
      correctAnswer: 1,
      explanation: "A tiller moves opposite to the turn: push it right and the boat turns left (to port).",
    },
    {
      id: "nt-mast",
      question: "Which component supports the sails vertically?",
      options: ["Boom", "Mast", "Forestay", "Backstay"],
      correctAnswer: 1,
      explanation: "The mast is the tall vertical spar that carries sails and rigging.",
    },
    {
      id: "nt-boom",
      question: "What horizontal spar holds the foot of the mainsail?",
      options: ["Spreaders", "Boom", "Traveller", "Keel"],
      correctAnswer: 1,
      explanation: "The boom attaches to the mast and supports the bottom edge (foot) of the mainsail.",
    },
    {
      id: "nt-mainsail",
      question: "Which sail is set aft of the mast and provides most driving force?",
      options: ["Jib", "Mainsail", "Spinnaker", "Staysail"],
      correctAnswer: 1,
      explanation: "The mainsail sits behind the mast and is typically the largest working sail.",
    },
    {
      id: "nt-jib",
      question: "Which triangular sail is set forward of the mast?",
      options: ["Mainsail", "Spinnaker", "Jib", "Trysail"],
      correctAnswer: 2,
      explanation: "The jib (or genoa) is the headsail set forward of the mast.",
    },
    {
      id: "nt-forestay",
      question: "Which rigging line runs from masthead to the bow to support the mast?",
      options: ["Backstay", "Shrouds", "Forestay", "Halyard"],
      correctAnswer: 2,
      explanation: "The forestay supports the mast from the front and often carries the jib on hanks or a furler.",
    },
    {
      id: "nt-backstay",
      question: "Which cable runs from masthead to stern providing aft support?",
      options: ["Backstay", "Forestay", "Boom vang", "Halyard"],
      correctAnswer: 0,
      explanation: "The backstay supports the mast from the stern and can be tensioned to control mast bend.",
    },
    {
      id: "nt-shrouds",
      question: "What are shrouds?",
      options: [
        "Horizontal struts from the mast",
        "Wires supporting the mast sideways",
        "Lines controlling sail angle",
        "Channels for electrical wiring",
      ],
      correctAnswer: 1,
      explanation: "Shrouds are the standing rigging wires that hold the mast upright laterally.",
    },
    {
      id: "nt-spreaders",
      question: "What do spreaders do on a mast?",
      options: ["Hold the boom down", "Push shrouds away from the mast", "Raise the mainsail", "Support the rudder"],
      correctAnswer: 1,
      explanation: "Spreaders are horizontal struts that splay the shrouds, improving their support angle.",
    },
    {
      id: "nt-telltales",
      question: "What are telltales used for on sails?",
      options: [
        "Indicating anchor drag",
        "Showing wind flow over the sail",
        "Marking chain lengths",
        "Lighting navigation marks",
      ],
      correctAnswer: 1,
      explanation: "Telltales are small ribbons or yarn that show airflow so you can trim the sail correctly.",
    },
    {
      id: "nt-cockpit",
      question: "Where do the crew typically steer and trim sails from?",
      options: ["Forepeak", "Cabin sole", "Cockpit", "Bilge"],
      correctAnswer: 2,
      explanation: "The cockpit is the recessed working area where helm and sail controls are managed.",
    },
  ],
  ropework: [
    {
      id: "r1",
      question: "Which knot creates a fixed loop and is essential for mooring?",
      options: ["Reef Knot", "Bowline", "Clove Hitch", "Figure Eight"],
      correctAnswer: 1,
      explanation: "The bowline creates a secure fixed loop that won't slip and is easy to untie after loading.",
    },
    {
      id: "r2",
      question: "What is the best knot for quickly attaching a rope to a post?",
      options: ["Bowline", "Sheet Bend", "Clove Hitch", "Figure Eight"],
      correctAnswer: 2,
      explanation: "The clove hitch is quick to tie and adjustable, ideal for temporary fastening to rails and posts.",
    },
    {
      id: "r3",
      question: "Which knot is used to join two ropes of different thickness?",
      options: ["Reef Knot", "Sheet Bend", "Bowline", "Clove Hitch"],
      correctAnswer: 1,
      explanation: "The sheet bend is specifically designed to join ropes of different diameters securely.",
    },
    {
      id: "r4",
      question: "What type of knot is a Figure Eight?",
      options: ["Binding knot", "Stopper knot", "Bend", "Hitch"],
      correctAnswer: 1,
      explanation: "The figure eight is a stopper knot used to prevent rope running through a block.",
    },
    {
      id: "r5",
      question: "Which knot should NOT be used for joining ropes of different thickness?",
      options: ["Sheet Bend", "Reef Knot", "Double Sheet Bend", "Carrick Bend"],
      correctAnswer: 1,
      explanation:
        "A reef knot (square knot) can slip when joining ropes of different thickness. Use a sheet bend instead.",
    },
  ],
  anchorwork: [
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
  ],
  victualling: [
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
  ],
  engine: [
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
  ],

  rig: [
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
  ],
  colregs: [
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
  ],
  "safety-mob-quiz": [
    {
      id: "mob1",
      question: "What is the very first action to take upon seeing a Man Overboard?",
      options: ["Press DSC Distress", "Shout 'Man Overboard'", "Start the engine", "Jump in to help"],
      correctAnswer: 1,
      explanation:
        "The first priority is to alert the crew immediately so they can throw visual markers and keep pointing.",
    },
    {
      id: "mob2",
      question: "Which side should you approach a casualty in the water?",
      options: ["Windward (upwind)", "Leeward (downwind)", "Astern", "Ahead"],
      correctAnswer: 1,
      explanation:
        "Approach so the casualty is on your LEEWARD side (downwind). The boat drifts heavily, so if you are upwind, the boat may drift quickly onto the person.",
    },
    {
      id: "mob3",
      question: "What is the correct syntax for a Distress Call?",
      options: ["MAYDAY (3x)", "PAN PAN (3x)", "HELP (3x)", "EMERGENCY (3x)"],
      correctAnswer: 0,
      explanation: "A Man Overboard is a grave and imminent danger. Use MAYDAY, MAYDAY, MAYDAY.",
    },
    {
      id: "mob4",
      question: "What is a Williamson Turn used for?",
      options: [
        "Returning to a casualty in open water/fog",
        "Docking in high wind",
        "Avoiding a collision",
        "Sailing upwind efficiently",
      ],
      correctAnswer: 0,
      explanation:
        "The Williamson Turn (60° turn then hard over) brings the vessel back onto its reciprocal track, ideal when visual contact is lost or in fog.",
    },
    {
      id: "mob5",
      question: "Why should a hypothermic casualty be lifted horizontally?",
      options: [
        "It's easier for the winch",
        "To prevent 'Reflow Syndrome' (heart failure)",
        "So they don't slip out of the harness",
        "To drain water from their lungs",
      ],
      correctAnswer: 1,
      explanation:
        "Lifting vertically causes cold blood from legs to rush to the core, which can cause cardiac arrest (Reflow Syndrome/Hydrostatic Squeeze).",
    },
  ],
  "lights-signals": [
    {
      id: "ls1",
      question: "You see a vessel displaying 'White over Red' lights. What is it?",
      options: ["Pilot Vessel", "Fishing Vessel", "Sailing Vessel", "Trawling Vessel"],
      correctAnswer: 0,
      explanation:
        "Rule 29: Pilot vessels exhibit White over Red all-round lights. Mnemonic: 'White over Red, Pilot Ahead'.",
    },
    {
      id: "ls2",
      question: "You see a vessel displaying 'Red over White' lights. What is it?",
      options: ["Fishing (not trawling)", "Pilot Vessel", "Sailing Vessel", "Trawling"],
      correctAnswer: 0,
      explanation:
        "Rule 26: Fishing vessels (other than trawling) exhibit Red over White. Mnemonic: 'Red over White, Fishing at Night'.",
    },
    {
      id: "ls3",
      question: "You see 'Green over White' lights. What is it?",
      options: ["Trawling", "Sailing", "Pilot", "Fishing"],
      correctAnswer: 0,
      explanation:
        "Rule 26: Trawling vessels exhibit Green over White. Mnemonic: 'Green over White, Trawling at Night'.",
    },
    {
      id: "ls4",
      question: "What lights does a vessel 'Not Under Command' (NUC) show?",
      options: ["Red over Red", "Red over White", "Green over White", "White over Red"],
      correctAnswer: 0,
      explanation:
        "Rule 27: NUC vessels show two all-round red lights in a vertical line. Mnemonic: 'Red over Red, Captain is Dead'.",
    },
    {
      id: "ls5",
      question: "What day shape signifies a vessel at anchor?",
      options: ["One black ball", "Two black balls", "A diamond", "A cone"],
      correctAnswer: 0,
      explanation: "Rule 30: A vessel at anchor exhibits one black ball forward where it can best be seen.",
    },
    {
      id: "ls6",
      question: "What does a cylinder day shape indicate?",
      options: ["Constrained by Draft", "Fishing", "Towing", "Not Under Command"],
      correctAnswer: 0,
      explanation: "Rule 28: A vessel constrained by her draft exhibits a cylinder.",
    },
    {
      id: "ls7",
      question: "You see three black balls in a vertical line. What is this?",
      options: ["Vessel Aground", "Vessel at Anchor", "NUC", "Mine clearance"],
      correctAnswer: 0,
      explanation: "Rule 30: A vessel aground exhibits three black balls in a vertical line.",
    },
    {
      id: "ls8",
      question: "Restricted Visibility: You hear 1 Prolonged blast every 2 minutes. What is it?",
      options: ["Power-driven vessel making way", "Power-driven vessel stopped", "Sailing vessel", "Vessel at anchor"],
      correctAnswer: 0,
      explanation:
        "Rule 35: A power-driven vessel making way sounds one prolonged blast at intervals of not more than 2 minutes.",
    },
    {
      id: "ls9",
      question: "Restricted Visibility: You hear 2 Prolonged blasts every 2 minutes. What is it?",
      options: [
        "Power-driven vessel stopped (underway but not making way)",
        "Power-driven vessel making way",
        "Sailing vessel",
        "Pilot vessel",
      ],
      correctAnswer: 0,
      explanation: "Rule 35: A power-driven vessel underway but stopped sounds two prolonged blasts.",
    },
    {
      id: "ls10",
      question: "Restricted Visibility: You hear '1 Prolonged, 2 Short'. Which vessel is NOT this?",
      options: ["Power-driven vessel", "Sailing vessel", "Fishing vessel", "Restricted Ability to Maneuver (RAM)"],
      correctAnswer: 0,
      explanation:
        "Rule 35: The signal '1 Pro, 2 Short' is for NUC, RAM, CBD, Sailing, Fishing, or Towing. Standard Power-driven vessels do NOT use this.",
    },
    {
      id: "ls11",
      question: "What does 'Red White Red' vertical lights mean?",
      options: ["Restricted Ability to Maneuver (RAM)", "Not Under Command", "Pilot", "Aground"],
      correctAnswer: 0,
      explanation: "Rule 27: RAM vessels exhibit three all-round lights: Red-White-Red.",
    },
    {
      id: "ls12",
      question: "A vessel towing another (tow length < 200m). What lights on the stern?",
      options: [
        "One Yellow (Towing) over White (Sternlight)",
        "Red over White",
        "Yellow over Yellow",
        "Just a white sternlight",
      ],
      correctAnswer: 0,
      explanation: "Rule 24: A towing vessel shows a yellow towing light above the sternlight.",
    },
    {
      id: "ls13",
      question: "What shape does a vessel motoring while sails are up display?",
      options: ["Cone (Apex down)", "Cone (Apex up)", "Ball", "Diamond"],
      correctAnswer: 0,
      explanation: "Rule 25: A sailing vessel also under power must exhibit a cone, apex downwards.",
    },
    {
      id: "ls14",
      question: "Five short blasts on the whistle means:",
      options: [
        "I am in doubt of your intentions (Danger)",
        "I am backing up",
        "I am turning starboard",
        "Request to open bridge",
      ],
      correctAnswer: 0,
      explanation: "Rule 34: 5 short blasts indicates doubt or danger.",
    },
    {
      id: "ls15",
      question: "Which of these is a Distress Signal?",
      options: ["Orange Smoke", "Green Star Rocket", "Code Flag 'A'", "Rapid ringing of bell"],
      correctAnswer: 0,
      explanation: "Annex IV: Orange smoke is a recognized distress signal. Green stars or Flag A are not.",
    },
    {
      id: "ls16",
      question: "A hovercraft in non-displacement mode shows which flashing light?",
      options: ["Yellow", "Red", "Blue", "Green"],
      correctAnswer: 0,
      explanation:
        "Rule 23: An air-cushion vessel operating in non-displacement mode exhibits an all-round flashing yellow light.",
    },
    {
      id: "ls17",
      question: "Short blast duration?",
      options: ["1 second", "4-6 seconds", "10 seconds", "0.5 seconds"],
      correctAnswer: 0,
      explanation: "Rule 32: A short blast means a blast of about one second's duration.",
    },
    {
      id: "ls18",
      question: "Prolonged blast duration?",
      options: ["4-6 seconds", "1 second", "10-12 seconds", "2 minutes"],
      correctAnswer: 0,
      explanation: "Rule 32: A prolonged blast means a blast of from four to six seconds' duration.",
    },
    {
      id: "ls19",
      question: "You see a diamond shape. What is it?",
      options: ["Towing vessel (tow >200m)", "Fishing", "Anchor", "Pilot"],
      correctAnswer: 0,
      explanation: "Rule 24: When the length of the tow exceeds 200 meters, a diamond shape is shown.",
    },
    {
      id: "ls20",
      question: "Light signal: 'Red over Green'?",
      options: ["Sailing vessel", "Trawling", "Pilot", "NUC"],
      correctAnswer: 0,
      explanation: "Rule 25: Optional lights for a sailing vessel are Red over Green at the masthead.",
    },
  ],
};

const topicMeta: Record<string, { title: string; subtitle: string }> = {
  "nautical-terms-quiz": {
    title: "Nautical Terms Quiz",
    subtitle: "Boat parts, orientation, and rig vocabulary",
  },
  ropework: {
    title: "Ropework Quiz",
    subtitle: "Knot purpose, use cases, and safety checks",
  },
  anchorwork: {
    title: "Anchorwork Quiz",
    subtitle: "Scope, holding checks, and ground tackle basics",
  },
  victualling: {
    title: "Victualling Quiz",
    subtitle: "Provisioning, storage, and passage planning",
  },
  engine: {
    title: "Engine Checks Quiz",
    subtitle: "Pre-start routines and troubleshooting",
  },
  rig: {
    title: "Rig Prep Quiz",
    subtitle: "Standing and running rigging inspections",
  },
  "safety-mob-quiz": {
    title: "Man Overboard Quiz",
    subtitle: "Procedures, distress signals, and recovery actions",
  },
  colregs: {
    title: "Colregs Quiz",
    subtitle: "Steering & Sailing Rules (Rules of the Road)",
  },
  "lights-signals": {
    title: "Lights & Signals Mastery",
    subtitle: "Lights, Shapes, Sound Signals & Distress",
  },
};

const Quiz = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  // If topicId is nautical-terms (legacy) or undefined, use the new specific ID
  const topicKey = !topicId || topicId === "nautical-terms" ? "nautical-terms-quiz" : topicId;
  const { user } = useAuth();
  const { loadProgress, saveProgress, resetProgress } = useProgress();
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => {
    const source = quizData[topicKey] || [];
    const rng = createSeededRng(seed + 1);

    return shuffleWithRng(source, rng)
      .slice(0, Math.min(20, source.length))
      .map((q) => {
        const optionObjs = q.options.map((opt, idx) => ({ opt, idx }));
        const shuffledOptions = shuffleWithRng(optionObjs, rng);
        const correctIndex = shuffledOptions.findIndex((o) => o.idx === q.correctAnswer);
        return {
          ...q,
          options: shuffledOptions.map((o) => o.opt),
          correctAnswer: correctIndex,
        };
      });
  }, [topicKey, seed]);
  const meta = topicMeta[topicKey] || {
    title: "Topic Quiz",
    subtitle: "Answer the questions to test yourself",
  };

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize answers array when questions change
  useEffect(() => {
    const initQuiz = async () => {
      const canonicalKey = canonicalQuizProgressKey(topicKey);
      const canonicalRecord: QuizProgressRow | null = await loadProgress(canonicalKey);
      const legacyRecord: QuizProgressRow | null = canonicalRecord ? null : await loadProgress(topicKey);
      const resolution = resolveQuizProgressForLoad(topicKey, canonicalRecord, legacyRecord);
      const savedData = resolution.record;

      if (savedData?.answers_history) {
        try {
          const saved =
            typeof savedData.answers_history === "string"
              ? (JSON.parse(savedData.answers_history) as QuizAnswersHistory)
              : (savedData.answers_history as QuizAnswersHistory);
          if (saved.answers && Array.isArray(saved.answers)) {
            setAnswers(saved.answers);
            setCurrentQuestion(saved.currentQuestion || 0);

            if (resolution.shouldMigrateFromLegacy) {
              await saveProgress(canonicalKey, savedData.completed ?? false, savedData.score ?? 0, 0, saved);
              await resetProgress(topicKey);
            }
            return;
          }
        } catch (error) {
          console.error("Error parsing saved quiz progress:", error);
        }
      }
      setAnswers(new Array(questions.length).fill(null));
    };
    initQuiz();
  }, [questions.length, topicKey, loadProgress, saveProgress, resetProgress]);

  const selectedAnswer = answers[currentQuestion] ?? null;
  const correctAnswers = countCorrectAnswers(answers, questions);

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-2">
          <CardHeader>
            <CardTitle className="text-2xl">No questions available</CardTitle>
            <p className="text-sm text-muted-foreground">
              We could not find any quiz items for this topic. Please head back and choose another module.
            </p>
          </CardHeader>
          <CardContent className="flex gap-3 flex-col sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button className="flex-1" onClick={() => navigate("/nautical-terms")}>
              Nautical Terms
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = questionProgressPercent(currentQuestion, questions.length);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setShowExplanation(true);
    const isCorrect = selectedAnswer === question.correctAnswer;

    if (isCorrect) {
      toast.success("Correct! +20 points", {
        description: question.explanation,
      });
    } else {
      toast.error("Incorrect", {
        description: question.explanation,
      });
    }
  };

  const handleNext = async () => {
    const newQuestion = currentQuestion < questions.length - 1 ? currentQuestion + 1 : currentQuestion;
    setCurrentQuestion(newQuestion);
    setShowExplanation(false);

    // Save progress
    if (user) {
      const progressData = { answers, currentQuestion: newQuestion };
      await saveProgress(canonicalQuizProgressKey(topicKey), false, 0, 0, progressData);
    }

    if (currentQuestion >= questions.length - 1) {
      handleComplete();
    }
  };

  const handlePrevious = async () => {
    if (currentQuestion > 0) {
      const newQuestion = currentQuestion - 1;
      setCurrentQuestion(newQuestion);
      setShowExplanation(false);

      // Save progress
      if (user) {
        const progressData = { answers, currentQuestion: newQuestion };
        await saveProgress(canonicalQuizProgressKey(topicKey), false, 0, 0, progressData);
      }
    }
  };

  const handleComplete = async () => {
    setIsComplete(true);

    if (!user) return;

    const percentage = percentageScore(correctAnswers, questions.length);
    const pointsEarned = pointsFromCorrectAnswers(correctAnswers);

    try {
      // Save quiz score
      await supabase.from("quiz_scores").insert({
        user_id: user.id,
        topic_id: topicKey,
        score: correctAnswers,
        total_questions: questions.length,
        percentage,
      });

      // Save final progress with answers
      const progressData = { answers, currentQuestion, completed: true };
      await saveProgress(canonicalQuizProgressKey(topicKey), percentage >= 70, percentage, pointsEarned, progressData);

      toast.success(`Quiz completed! +${pointsEarned} points`);
    } catch (error) {
      console.error("Error saving quiz results:", error);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers(new Array(questions.length).fill(null));
    setShowExplanation(false);
    setIsComplete(false);
    setSeed((n) => n + 1);
  };

  if (isComplete) {
    const percentage = percentageScore(correctAnswers, questions.length);
    const passed = percentage >= 70;

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-2">
          <CardHeader className="text-center">
            <div
              className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                passed ? "bg-success/20" : "bg-accent/20"
              }`}
            >
              <Trophy className={`w-10 h-10 ${passed ? "text-success" : "text-accent"}`} />
            </div>
            <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-gradient mb-2">{percentage}%</div>
              <p className="text-xl text-muted-foreground">
                {correctAnswers} out of {questions.length} correct
              </p>
            </div>

            {passed ? (
              <div className="p-4 bg-success/10 border-2 border-success rounded-lg text-center">
                <p className="font-semibold text-success">🎉 Excellent work!</p>
                <p className="text-sm text-muted-foreground mt-1">You've mastered this topic!</p>
              </div>
            ) : (
              <div className="p-4 bg-accent/10 border-2 border-accent rounded-lg text-center">
                <p className="font-semibold text-accent">Keep practicing!</p>
                <p className="text-sm text-muted-foreground mt-1">Review the material and try again</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button className="flex-1 bg-secondary text-secondary-foreground" onClick={handleRestart}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{meta.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {meta.subtitle} • Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
            </div>
            <Badge variant="secondary">
              Score: {correctAnswers}/{questions.length}
            </Badge>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="border-2">
          <CardHeader>
            {question.image && (
              <div className="mb-4 flex justify-center">
                <img
                  src={question.image}
                  alt="Quiz Scenario"
                  className="max-h-64 rounded-lg object-contain border border-border"
                />
              </div>
            )}
            <CardTitle className="text-2xl">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correctAnswer;
                const showCorrect = showExplanation && isCorrect;
                const showIncorrect = showExplanation && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation}
                    className={`p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.02] ${
                      showCorrect
                        ? "border-success bg-success/10"
                        : showIncorrect
                        ? "border-destructive bg-destructive/10"
                        : isSelected
                        ? "border-secondary bg-secondary/10"
                        : "border-border bg-card hover:border-secondary/50"
                    } ${showExplanation ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {showCorrect && <CheckCircle2 className="w-5 h-5 text-success" />}
                      {showIncorrect && <XCircle className="w-5 h-5 text-destructive" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="mt-6 p-4 bg-muted rounded-lg border-2 border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                  Explanation
                </h3>
                <p className="text-muted-foreground">{question.explanation}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {currentQuestion > 0 && !showExplanation && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              {!showExplanation ? (
                <Button
                  className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleNext}>
                  {currentQuestion < questions.length - 1 ? "Next Question" : "View Results"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Quiz;
