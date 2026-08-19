/**
 * Gas Safety data — LPG and carbon monoxide risks aboard.
 *
 * Covers all theory areas required by RYA Day Skipper syllabus area 4 (Safety)
 * for gas safety: LPG properties, isolation valves, leak warning and response,
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
      "Liquefied Petroleum Gas (LPG) installations may use propane, butane or another approved supply. LPG vapour is heavier than air, so a leak can collect low in the vessel and form a flammable atmosphere. LPG is colourless and normally odorised: an unexpected gas smell is a warning to act on, but neither smell nor its absence proves whether the system is leaking or the space is safe. Fuel composition affects its flammable limits; even a small spark may ignite accumulated gas.",
    keyPoints: [
      "LPG vapour can collect in low spaces; use approved detection and vessel checks",
      "A fuel-specific range of LPG mixtures in air is flammable",
      "Odour is a warning, not proof of a leak or proof that a space is safe",
      "A small spark can ignite accumulated gas",
      "Avoid ignition sources whenever gas is detected or suspected",
    ],
  },
  {
    id: "isolation-valves",
    title: "Isolation Valves",
    content:
      "Know the installation's designated isolation controls and follow the vessel shutdown procedure whenever gas is not in use. Some systems include a remote solenoid as well as cylinder isolation. An owner may make the routine visual checks described by the vessel and component manufacturers and use a fitted bubble tester exactly as its manufacturer directs. Those checks do not replace competent pressure or leak testing. Diagnosis, pressure testing, component replacement and repair belong to a competent boat-LPG person. Only use compatible approved components, and inspect or replace hoses, regulators and connections at their specified intervals. Never search for a leak with a naked flame.",
    keyPoints: [
      "Use the installation's designated controls and vessel shutdown procedure",
      "Follow the vessel procedure for safely isolating the supply and residual gas",
      "Use only isolation equipment approved for the installation",
      "Inspect approved hoses and components at their specified intervals",
      "Limit owner checks to specified visual checks and correct use of a fitted manufacturer-approved bubble tester",
      "Use a competent boat-LPG person for pressure/leak testing, diagnosis and repair—never use a naked flame",
    ],
  },
  {
    id: "bilge-sniff-test",
    title: "Leak Warning and Response",
    content:
      "Before starting an engine after the vessel has been closed up, follow its specified LPG checks and treat any detector alarm, gas smell or other sign as a suspected leak. Shut the LPG supply only if the designated control can be reached safely; extinguish flames and other ignition sources without operating electrical switches either on or off. Evacuate everyone, then from outside ventilate naturally with a through-draught, without using electrical fans or creating another ignition source, and summon the emergency or professional help the situation requires. Keep a suspected leaking system out of use until a competent boat-LPG person has pressure/leak tested it, found the cause and made it safe. If a cylinder valve or leak will not stop, do not handle, disconnect or move the cylinder through the vessel: withdraw, keep others away, raise the alarm and call the fire and rescue service or Coastguard as appropriate.",
    keyPoints: [
      "Carry out the vessel's specified pre-use gas checks",
      "Treat smell as a warning, never as proof for or against a leak",
      "If gas is suspected, shut the supply only if safe and extinguish flames; operate no electrical switch on or off",
      "Evacuate, ventilate from outside with a natural through-draught and summon help",
      "Do not handle or move a cylinder whose leak cannot be stopped safely—withdraw and raise the alarm",
      "Keep the system out of use until competent boat-LPG pressure/leak testing and repair make it safe",
    ],
  },
  {
    id: "gas-locker-requirements",
    title: "Gas Locker Requirements",
    content:
      "Store connected and spare cylinders only in the approved cylinder enclosure, secured in their designed orientation. Current RYA recreational guidance calls for a dedicated enclosure separated from living accommodation, accessible only from outside and draining overboard. MCA LPG guidance used with MGN 280 sections 2.1–2.4 specifies, for small vessels in that Code's scope, a compartment vapour-tight to the vessel interior and a drain from the enclosure's lowest point that falls continuously without obstruction to an overboard outlet at least 75 mm above the at-rest waterline and at least 500 mm from openings into the vessel. Outside that Code's scope, treat its measurements as safety-critical design evidence rather than universal law: follow the vessel design, applicable rules and competent inspection advice, and never accept or improvise a drain outlet below the waterline.",
    keyPoints: [
      "Use only the approved cylinder enclosure: accessible from outside and vapour-tight to the accommodation",
      "Trace the drain from the locker low point: it must fall continuously, remain unobstructed and discharge overboard away from hull openings",
      "Confirm the outlet is at least 75 mm above the at-rest waterline; a below-waterline outlet is unsafe guidance",
      "Secure cylinders in their manufacturer-designed orientation",
      "Inspect for drain blockage, corrosion or damage, sound connections, and stored items that could obstruct the low point or drain",
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

export const gasLockerSources = [
  {
    id: "mca-mgn-280",
    label: "MCA LPG guidance used with MGN 280, sections 2.1–2.4",
    href: "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/282245/mgn280.pdf",
    scope: "Cylinder stowage and LPG locker/drain requirements for small vessels governed by the Code; not stated as universal law for every leisure vessel.",
  },
  {
    id: "rya-gas-safety",
    label: "RYA: Gas safety on boats",
    href: "https://www.rya.org.uk/water-safety/gas-safety/gas-safety-on-boats/",
    scope: "Current recreational gas-safety context. Vessel documentation, equipment instructions and applicable requirements remain controlling.",
  },
  {
    id: "gas-safe-boats",
    label: "Gas Safe Register: Gas safety on boats factsheet",
    href: "https://www.gassaferegister.co.uk/media/drxliecz/gas-on-boats-factsheet.pdf",
    scope: "Consumer guidance on recognising a suspected LPG escape, immediate precautions, owner checks and work that requires a suitably competent Gas Safe registered engineer.",
  },
] as const;

export const gasLockerReview = {
  contentVersion: "2026-08-12",
  sourceCheckedOn: "2026-08-12",
  sourceIds: gasLockerSources.map(({ id }) => id),
  qualifiedReview: { status: "pending", reviewerName: null, qualification: null, approvedOn: null },
  releaseNote: "No qualified practitioner approval is recorded; this lesson does not certify a locker or drain installation.",
} as const;
