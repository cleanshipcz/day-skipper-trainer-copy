/**
 * Gas Safety data — LPG and carbon monoxide risks aboard.
 *
 * Covers all theory areas required by RYA Day Skipper syllabus area 4 (Safety)
 * for gas safety: LPG properties, isolation valves, bilge sniff test,
 * gas locker requirements, carbon monoxide awareness, detector placement.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S5, AC-1
 */

export interface GasSafetyTopic {
  /** Unique identifier for this topic section. */
  readonly id: string;
  /** Human-readable title for the section. */
  readonly title: string;
  /** Detailed theory content for the section. */
  readonly content: string;
  /** Key learning points to highlight. */
  readonly keyPoints: readonly string[];
}

export const gasSafetyTopics: readonly GasSafetyTopic[] = [
  {
    id: "lpg-properties",
    title: "LPG Properties",
    content:
      "Liquefied Petroleum Gas (LPG) — propane or butane — is the most common cooking and heating fuel aboard yachts. LPG is heavier than air, meaning any leak will sink to the lowest point of the vessel, typically the bilge. This makes it extremely dangerous because gas can accumulate undetected in enclosed spaces, creating an explosive atmosphere. LPG is colourless and has a distinctive odour added (mercaptan) to aid leak detection. The explosive range is between 2% and 10% concentration in air. Even a small spark from an electrical switch or engine starter can ignite accumulated gas.",
    keyPoints: [
      "LPG (propane/butane) is heavier than air and sinks to the bilge",
      "Explosive range is 2–10% concentration in air",
      "Mercaptan odour is added to aid leak detection",
      "A small spark can ignite accumulated gas",
      "Gas accumulates in the lowest parts of the vessel",
    ],
  },
  {
    id: "isolation-valves",
    title: "Isolation Valves",
    content:
      "Every gas installation aboard must have an isolation valve at the cylinder and ideally a solenoid shut-off valve operable from the galley. The master isolation valve on the gas cylinder must be turned off when gas is not in use — this is the single most important gas safety habit. After turning off the cylinder valve, burn off residual gas in the supply line by leaving the burner on until the flame dies. Flexible hoses connecting the system must be marine-grade, in date, and inspected regularly for cracking or deterioration. All joints should be checked annually with a leak detection fluid (soapy water) — never use a naked flame to check for leaks.",
    keyPoints: [
      "Turn off the cylinder valve when gas is not in use",
      "Burn off residual gas by leaving the burner on until the flame dies",
      "A solenoid shut-off valve at the galley adds an extra layer of safety",
      "Use marine-grade hoses inspected regularly for cracking",
      "Check joints with leak detection fluid — never a naked flame",
    ],
  },
  {
    id: "bilge-sniff-test",
    title: "Bilge Sniff Test",
    content:
      "Before starting the engine or operating any electrical equipment after the boat has been closed up, perform a bilge sniff test. Open the bilge and smell for gas — LPG has a distinctive rotten-egg odour from the mercaptan additive. If you detect gas, do not operate any electrical switches (including bilge pumps), open all hatches and ventilate thoroughly, locate and fix the source of the leak, and ventilate the bilge with manual fanning if needed. The bilge sniff test should become a routine part of your pre-departure checks and should be performed every morning aboard and after any period when the vessel has been closed up.",
    keyPoints: [
      "Sniff the bilge before starting the engine or using electrical equipment",
      "LPG smells of rotten eggs (mercaptan additive)",
      "If gas is detected: do not operate any switches",
      "Ventilate thoroughly by opening all hatches",
      "Make the bilge sniff test part of your daily routine",
    ],
  },
  {
    id: "gas-locker-requirements",
    title: "Gas Locker Requirements",
    content:
      "Gas cylinders must be stored in a purpose-built gas locker that is sealed from the interior of the vessel and has a drain at the bottom leading overboard, below the waterline. This ensures that any leaked gas drains safely overboard rather than into the bilge. The locker must be ventilated and self-draining. Cylinders should be stored upright and secured against movement. The locker lid must seal gas-tight against the interior of the vessel. Spare cylinders must also be stored in the gas locker, never below decks in an unventilated space. The gas locker should be regularly inspected for corrosion and drain blockages.",
    keyPoints: [
      "Gas locker must be sealed from the vessel interior",
      "Must have an overboard drain at the bottom",
      "Cylinders stored upright and secured against movement",
      "Locker must be ventilated and self-draining",
      "Spare cylinders stored in the gas locker, never below decks",
    ],
  },
  {
    id: "carbon-monoxide",
    title: "Carbon Monoxide Awareness",
    content:
      "Carbon monoxide (CO) is an odourless, colourless, and tasteless gas produced by incomplete combustion of any carbon-based fuel — including LPG, diesel, petrol, and charcoal. It is lethal in very small concentrations. Symptoms of CO poisoning include headache, dizziness, nausea, confusion, and drowsiness — often mistaken for seasickness. Ensure adequate ventilation whenever using gas appliances, heaters, or running the engine in enclosed spaces. Never block ventilation openings. Never use a gas cooker or oven for heating the cabin. CO poisoning can occur from a neighbouring vessel's exhaust in a raft-up or marina. If CO poisoning is suspected, move the casualty to fresh air immediately and administer oxygen if available.",
    keyPoints: [
      "CO is odourless, colourless, and tasteless — you cannot detect it without an alarm",
      "Produced by incomplete combustion of any carbon-based fuel",
      "Symptoms mimic seasickness: headache, dizziness, nausea",
      "Never use a cooker or oven for cabin heating",
      "Move casualties to fresh air immediately if CO poisoning is suspected",
    ],
  },
  {
    id: "detector-placement",
    title: "Detector Placement",
    content:
      "Two types of gas detector are essential aboard: an LPG detector and a carbon monoxide (CO) detector. LPG detectors should be mounted low, near the bilge or at floor level, because LPG is heavier than air and sinks. Place LPG detectors near the cooker, in the bilge, and near the gas locker. CO detectors should be mounted at head height (breathing zone) in the saloon and any sleeping cabin, because CO mixes evenly with air. All detectors must be tested regularly and batteries replaced as recommended. Consider a hard-wired gas detection system with an automatic solenoid shut-off for the best protection. Detectors should carry a recognized marine standard (e.g., EN 50291 for CO detectors).",
    keyPoints: [
      "LPG detectors: mount low (floor level / bilge) — gas sinks",
      "CO detectors: mount at head height (breathing zone) — gas mixes with air",
      "Place detectors near the cooker, bilge, gas locker, saloon, and sleeping cabins",
      "Test detectors regularly and replace batteries on schedule",
      "Consider hard-wired systems with automatic solenoid shut-off",
    ],
  },
];
