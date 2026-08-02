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
      "Liquefied Petroleum Gas (LPG) installations may use propane, butane or another approved supply. LPG vapour is heavier than air, so a leak can collect low in the vessel and form a flammable atmosphere. LPG is colourless and is normally odorised to aid detection, but smell is not a substitute for approved detection and system checks. Fuel composition affects its flammable limits; even a small spark may ignite accumulated gas.",
    keyPoints: [
      "LPG vapour can collect in low spaces; use approved detection and vessel checks",
      "A fuel-specific range of LPG mixtures in air is flammable",
      "Odour may warn of a leak but must never be the only detection method",
      "A small spark can ignite accumulated gas",
      "Avoid ignition sources whenever gas is detected or suspected",
    ],
  },
  {
    id: "isolation-valves",
    title: "Isolation Valves",
    content:
      "Know the installation's designated isolation controls and follow the vessel shutdown procedure whenever gas is not in use. Some systems include a remote solenoid as well as cylinder isolation. Only use compatible approved components, and inspect or replace hoses, regulators and connections at the intervals specified by their manufacturer, the vessel procedure and applicable rules. Leak testing must use the approved method and competent help where required—never a naked flame.",
    keyPoints: [
      "Use the installation's designated controls and vessel shutdown procedure",
      "Follow the vessel procedure for safely isolating the supply and residual gas",
      "Use only isolation equipment approved for the installation",
      "Inspect approved hoses and components at their specified intervals",
      "Use the approved leak-test method—never a naked flame",
    ],
  },
  {
    id: "bilge-sniff-test",
    title: "Bilge Sniff Test",
    content:
      "Follow the vessel's checks before starting engines or operating electrical equipment after it has been closed up. If gas is detected or suspected, do not operate switches, engines or flames. Evacuate as needed, isolate the supply only if safe, ventilate naturally from outside, follow the emergency procedure, and have the cause made safe by a competent person before reuse. Do not rely on smell alone.",
    keyPoints: [
      "Carry out the vessel's specified pre-use gas checks",
      "Never rely on smell alone to declare a space safe",
      "If gas is suspected, do not operate switches, engines or flames",
      "Evacuate as needed and isolate the supply only if it is safe to do so",
      "Ventilate naturally from outside as directed by the vessel emergency procedure",
    ],
  },
  {
    id: "gas-locker-requirements",
    title: "Gas Locker Requirements",
    content:
      "Store connected and spare cylinders only in the approved location provided by the vessel, secured in their designed orientation. A marine LPG locker is normally vapour-tight to the accommodation and drained overboard to open air from its low point; its design must follow the vessel specification and applicable standards. Keep drains and ventilation paths clear and inspect the locker, restraints and fittings as instructed. Never move a cylinder below decks or improvise storage to gain capacity.",
    keyPoints: [
      "Use only the cylinder location approved for the vessel and installation",
      "Keep specified drain and ventilation paths clear",
      "Secure cylinders in their manufacturer-designed orientation",
      "Inspect the locker, restraints and fittings as vessel instructions require",
      "Never improvise cylinder storage or move cylinders into accommodation",
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
      "Use detectors specified for the vessel and installation. LPG and CO sensors have different placement constraints: mounting height, distance from appliances, airflow, sleeping areas and environmental protection must follow the detector manufacturer and vessel instructions rather than a generic position. Test, service and replace detectors and batteries on their specified schedule. A detector supports—rather than replaces—ventilation, isolation, inspection and correct operation.",
    keyPoints: [
      "Use alarms specified for the vessel, fuel and installation",
      "Follow each alarm manufacturer's exact placement instructions",
      "Account for airflow, appliances, sleeping spaces and environmental limits as instructed",
      "Test, service and replace alarms and batteries on their specified schedule",
      "Detection supplements rather than replaces ventilation, isolation and inspection",
    ],
  },
];
