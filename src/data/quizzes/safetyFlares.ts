import type { Question } from "./types";
import { FLARE_QUALIFIED_REVIEW_SOURCE_IDS } from "../flareTypes";

export const FLARE_QUIZ_REVIEW_BASIS = FLARE_QUALIFIED_REVIEW_SOURCE_IDS;

export const FLARE_QUIZ_CATALOGUE_REVISION = "safety-flares-applied-v2";

export const FLARE_QUIZ_OUTCOME_MAP = {
  "distress-versus-warning": ["flare-applied-white-warning-v2"],
  "long-range-distress": ["flare-applied-long-range-v2"],
  "close-range-distress": ["flare-applied-close-range-v2"],
  "daytime-position": ["flare-applied-day-position-v2"],
  "product-specific-operation": ["flare-applied-launch-instructions-v2", "flare-applied-misfire-v2"],
  "serviceability-and-disposal": ["flare-applied-service-life-v2", "flare-applied-disposal-v2"],
  "recognition-without-colour-alone": ["flare-applied-labelled-recognition-v2"],
  "assessment-limit": ["flare-applied-learning-limit-v2"],
} as const;

export const FLARE_QUIZ_PASS_POLICY = {
  passingPercentage: 70,
  claim: "A pass records performance on these written recognition and selection scenarios only; it is not pyrotechnic handling competence or vessel readiness.",
  remediation: "Review every missed outcome, the exact product labels and vessel requirements, then practise only under qualified supervision.",
} as const;

export const FLARE_QUIZ_REVIEW_METADATA = {
  model: "src/data/flareTypes.ts",
  status: "release-blocked-pending-qualified-maritime-review",
  sourceBasis: FLARE_QUIZ_REVIEW_BASIS,
} as const;

const prerequisite = "Review the qualified-review-gated Flares lesson, the exact products carried and the vessel's distress plan first.";
const remediationRoute = "/safety/flares";
const sourceNote = "Source/review basis: flareTypes reviewed model and FLARE_QUIZ_REVIEW_BASIS; qualified maritime approval remains pending.";
const answerPositions: Readonly<Record<string, number>> = {
  "flare-applied-white-warning-v2": 2,
  "flare-applied-long-range-v2": 1,
  "flare-applied-close-range-v2": 3,
  "flare-applied-day-position-v2": 2,
  "flare-applied-launch-instructions-v2": 1,
  "flare-applied-misfire-v2": 3,
  "flare-applied-service-life-v2": 2,
  "flare-applied-disposal-v2": 1,
  "flare-applied-labelled-recognition-v2": 3,
  "flare-applied-learning-limit-v2": 2,
};
const q = (id: string, learningObjective: string, question: string, authoredOptions: readonly string[], authoredCorrectAnswer: number, explanation: string, scenario?: Question["scenario"]): Question => {
  const correctOption = authoredOptions[authoredCorrectAnswer];
  const correctAnswer = answerPositions[id];
  if (correctOption === undefined || correctAnswer === undefined || correctAnswer >= authoredOptions.length) throw new Error(`Invalid flare quiz answer contract for ${id}.`);
  const options = authoredOptions.filter((_, index) => index !== authoredCorrectAnswer);
  options.splice(correctAnswer, 0, correctOption);
  return { id, learningObjective, prerequisite, remediationRoute, question, options, correctAnswer, explanation: `${explanation} Review the Flares lesson. ${sourceNote}`, scenario };
};

const questions: readonly Question[] = [
  q("flare-applied-white-warning-v2", "Distinguish collision warning from distress signalling", "Another vessel is approaching and collision risk is developing, but your vessel is not in distress. Which carried signal has the relevant intended role?", ["A white hand flare, used as a collision warning according to its label", "A red hand flare, because every bright light means distress", "Orange smoke, because it is a night collision warning", "Any rocket fired toward the approaching vessel"], 0, "White hand flares are collision-warning signals, not distress signals. Red light and orange smoke communicate distress; no pyrotechnic should be aimed at a vessel."),
  q("flare-applied-long-range-v2", "Select a labelled long-range distress-attraction signal", "Your vessel is in grave and imminent danger and a distant ship may not yet know your position. Which signal is intended to attract attention at long range?", ["Red rocket-parachute flare", "White hand flare", "Buoyant orange smoke", "Red hand flare"], 0, "A red rocket-parachute flare is intended for long-range distress attraction. Actual visibility, trajectory and duration depend on the product and conditions."),
  q("flare-applied-close-range-v2", "Select a close-range distress position signal", "At night, a rescue vessel is already nearby and needs to pinpoint your position. Which labelled distress signal best fits?", ["Red hand flare", "White hand flare", "Orange smoke", "Another rocket regardless of the rescue crew's directions"], 0, "A red hand flare is intended to pinpoint a distress position at closer range. Follow rescue coordination and the exact device instructions; do not assume a universal duration."),
  q("flare-applied-day-position-v2", "Select conspicuous daytime position marking", "In daylight, rescuers can search your area and need a conspicuous position marker that can also indicate local wind. Which signal fits?", ["Orange smoke signal", "White hand flare", "Red hand flare because colour is the only relevant cue", "An unlabelled cylindrical device"], 0, "Orange smoke is intended for conspicuous daytime position marking. Choose the hand-held or buoyant product only from its label and the circumstances; the quiz does not teach handling."),
  q("flare-applied-launch-instructions-v2", "Use product-specific operating instructions", "A red rocket-parachute flare is required and the launchers aboard are not all the same design. How is launch orientation chosen?", ["Use the exact device's printed instructions, clear overhead hazards and account for wind as directed", "Always vertical", "Always 45 degrees into wind", "Horizontally toward the search vessel"], 0, "Launcher designs differ, so a memorised universal angle is unsafe. The exact label and instructions control orientation and wind allowance."),
  q("flare-applied-misfire-v2", "Respond to a pyrotechnic misfire without improvisation", "A flare does not operate after the labelled activation step. What should the operator do?", ["Keep it pointed safely away, follow that product's misfire instructions and do not improvise or inspect the firing end", "Immediately look into the firing end", "Try a different maker's delay and re-lighting sequence", "Throw it into the sea at once"], 0, "Misfire actions and waiting periods are product-specific. Maintain a safe direction and follow the exact manufacturer's instructions rather than diagnosing or improvising."),
  q("flare-applied-service-life-v2", "Verify serviceability from exact product markings", "Two flare products from different makers show different service-life markings. Which date governs replacement?", ["The expiry or service-life marking on each exact product", "A universal three-year rule", "The vessel launch date", "Whichever maker gives the later date"], 0, "Service life varies. Inspect and replace by each exact product's marking and applicable vessel requirements rather than borrowing another product's date."),
  q("flare-applied-disposal-v2", "Arrange authorised disposal without creating a false distress alert", "Expired flares must leave the vessel. What is the defensible plan?", ["Confirm acceptance with a registered disposal point, participating supplier, marina, council facility or specialist contractor before travel", "Fire them for practice", "Throw them overboard", "Keep them indefinitely as emergency backups"], 0, "Expired pyrotechnics must not be casually fired, dumped or relied on. UK coastguard and RNLI stations do not accept them; confirm an authorised route in advance."),
  q("flare-applied-labelled-recognition-v2", "Identify signals using label, form and purpose rather than colour alone", "Which identification is supportable from the observable information?", ["The labelled hand-held white-light signal is a collision warning, not distress", "The pale casing alone proves it is safe to hold", "Any cylinder with an orange cap is buoyant smoke", "Casing colour alone proves signal type and operation"], 0, "Identification must use the product label, stated signal, form and instructions; casing colour alone is not a reliable or accessible key.", { accessibleName: "Labelled hand-held signal recognition card", description: "A text-first product card supplies the identification cues without relying on colour perception.", facts: [{ label: "Form", value: "Hand-held light signal" }, { label: "Printed signal", value: "White light — collision warning" }, { label: "Handling", value: "Read the exact product instructions" }] }),
  q("flare-applied-learning-limit-v2", "State the limit of a written flare assessment", "A learner answers every quiz scenario correctly before joining a yacht with unfamiliar pyrotechnics. What has been demonstrated?", ["Written recognition and selection only; they must inspect the actual products and receive qualified practical instruction", "Competence to operate every flare design", "That the yacht's carriage and serviceability are compliant", "Qualified maritime approval of this content"], 0, "A quiz cannot verify the vessel, approve content, or demonstrate practical pyrotechnic competence. Product inspection, vessel-specific planning and qualified practical instruction remain necessary."),
];

export default questions;
