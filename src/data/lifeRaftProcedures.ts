export interface LifeRaftType { readonly id: string; readonly name: string; readonly description: string; readonly features: readonly string[] }
export interface SolasPackItem { readonly id: string; readonly name: string; readonly purpose: string }
export interface ProcedureStep { readonly id: string; readonly text: string }

export const LIFE_RAFT_REVIEW_BASIS = [
  "ISO 9650-1/2 — inflatable liferafts for small craft",
  "SOLAS Chapter III and LSA Code — survival-craft equipment and operation",
  "MCA MGN 548 (M+F) — life-saving appliances on small commercial vessels",
  "Manufacturer instructions and service record for the exact liferaft carried",
] as const;
export interface LifeRaftReleaseReview { readonly reviewed: boolean; readonly reviewerName: string | null; readonly reviewerQualification: string | null; readonly approvalDate: string | null; readonly sourceEvidence: readonly string[] }
export const LIFE_RAFT_RELEASE_REVIEW: LifeRaftReleaseReview = { reviewed: false, reviewerName: null, reviewerQualification: null, approvalDate: null, sourceEvidence: [] };
const isUtcCalendarDate = (value: string | null) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number); const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};
export const isLifeRaftReleaseApproved = (review: LifeRaftReleaseReview) => review.reviewed && Boolean(review.reviewerName?.trim()) && Boolean(review.reviewerQualification?.trim()) && isUtcCalendarDate(review.approvalDate) && LIFE_RAFT_REVIEW_BASIS.every((source) => review.sourceEvidence.includes(source));

export const lifeRaftTypes: readonly LifeRaftType[] = [
  { id: "iso-9650-1", name: "ISO 9650-1 (high-seas)", description: "A small-craft liferaft category intended for extended voyages where strong winds and significant waves may be encountered.", features: ["Select capacity, operating-temperature group and emergency pack for the voyage", "Insulated-floor and pack options are specification-dependent", "Check the exact certificate, manual and service label"] },
  { id: "iso-9650-2", name: "ISO 9650-2 (coastal)", description: "A small-craft category intended for navigation where moderate conditions may be met; the standard does not create a universal distance-from-shore rule.", features: ["Suitability depends on voyage, climate, rescue time and applicable rules", "Pack contents vary", "Check carriage rules and the exact raft certificate"] },
  { id: "open-reversible", name: "Open-reversible", description: "A different design that can be boarded whichever way up it inflates, usually trading enclosed protection for rapid access.", features: ["No universal equivalence to a canopied ISO/SOLAS raft", "Exposure protection and equipment depend on its approval", "Use only within its certified operating limits"] },
];

export const solasPackContents: readonly SolasPackItem[] = [
  { id: "inventory", name: "Raft-specific inventory", purpose: "Read the sealed pack list and certificate: SOLAS A, SOLAS B, ISO packs and owner supplements are not interchangeable." },
  { id: "water-food", name: "Water and food", purpose: "Quantities and carriage vary by approved pack. Protect supplies and follow the ration plan; never drink seawater and do not impose a blanket 24-hour fluid fast." },
  { id: "drogue", name: "Drogue / sea anchor", purpose: "Reduce drift and improve orientation when deployed exactly as the raft instructions specify." },
  { id: "bailing", name: "Bailer and sponges", purpose: "Remove water and help keep occupants and the floor dry." },
  { id: "repair", name: "Repair and inflation equipment", purpose: "Use patches, clamps/stoppers and bellows only as the raft manual directs; equipment varies." },
  { id: "signalling", name: "Signalling equipment", purpose: "Inventory may include torch, whistle, radar reflector and pyrotechnics. Use exact device instructions and trained procedures." },
  { id: "medical", name: "First-aid / seasickness supplies", purpose: "Treat casualties within training and pack instructions; seek medical advice through rescue communications." },
  { id: "release-tools", name: "Release and rescue tools", purpose: "Locate the safety knife, quoit/heaving line and any rescue loop carried; use them only as the raft instructions specify." },
];

export const abandonShipSteps: readonly ProcedureStep[] = [
  { id: "alarm", text: "Raise the alarm, account for crew and protect the escape route" },
  { id: "distress", text: "Send distress information early without delaying immediate escape" },
  { id: "protect", text: "Don lifejackets, warm layers and immersion protection where time permits" },
  { id: "equipment", text: "Take the prepared grab bag and beacons only when safely accessible" },
  { id: "deploy", text: "Deploy and board using the exact raft and vessel plan" },
  { id: "release", text: "Release from the vessel before sinking, fire or entanglement endangers the raft" },
];
export const deploymentProcedureSteps: readonly ProcedureStep[] = [
  { id: "assess", text: "Choose the safest deployment position for wind, sea, list, fire, obstructions and vessel drift" },
  { id: "secure", text: "Secure the painter to the designated strong point unless the approved automatic-launch arrangement specifies otherwise" },
  { id: "launch", text: "Release the securing arrangement and launch clear, following the canister and vessel instructions" },
  { id: "inflate", text: "Operate the painter/inflation system as labelled; keep clear of inflation hazards" },
  { id: "inspect", text: "Confirm full inflation and orientation; right an inverted raft only by its marked method" },
];
export const boardingProcedureSteps: readonly ProcedureStep[] = [
  { id: "dry", text: "Board directly from the vessel where practicable; avoid entering the water" },
  { id: "assist", text: "Use the vessel's practised order and assign capable crew to assist casualties; no universal person boards first" },
  { id: "distribute", text: "Keep low and distribute occupants as the raft instructions require" },
  { id: "account", text: "Account for everyone and recover only equipment that is immediately safe to take" },
  { id: "release", text: "Use the safety knife or release arrangement before the vessel or painter threatens the raft" },
];
export const actionsInRaftSteps: readonly ProcedureStep[] = [
  { id: "account", text: "Account for people, treat urgent injuries and activate/retain distress beacons as trained" },
  { id: "stabilise", text: "Deploy the drogue, close entrances and inflate floor/canopy only according to the raft instructions" },
  { id: "dry", text: "Bail, dry and protect occupants from cold, heat, wind and seasickness" },
  { id: "inspect", text: "Inspect tubes, valves and attachments; repair or top up only with the supplied equipment and instructions" },
  { id: "inventory", text: "Inventory water, food, medical and signalling supplies; set a situation-specific ration plan and never drink seawater" },
  { id: "signal", text: "Maintain lookout and use signals when they can aid detection, following each device's instructions" },
];
