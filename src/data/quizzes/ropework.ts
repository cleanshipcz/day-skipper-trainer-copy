import type { KnotId } from "../ropeworkKnots";
import type { Question } from "./types";

/**
 * The lesson-to-assessment contract for /ropework. Keep this catalogue in sync
 * with the knot lessons so a taught knot cannot silently disappear from the quiz.
 */
export const ropeworkAssessmentCoverage = {
  bowline: ["r1", "r8"],
  "clove-hitch": ["r2", "r9"],
  "sheet-bend": ["r3", "r11"],
  "figure-eight": ["r4"],
  "reef-knot": ["r5", "r10"],
  "round-turn": ["r6"],
  "rolling-hitch": ["r7", "r12"],
} as const satisfies Record<KnotId, readonly string[]>;

const ropeworkQuestions: readonly Question[] = [
  {
    id: "r1",
    question: "A fixed loop is needed on a mooring line, but the line may repeatedly shake while slack. Which choice matches the Bowline lesson?",
    options: [
      "Use a Bowline with a short tail because shaking tightens it",
      "Use a dressed Bowline with a generous tail and approved backup protection against cyclic slack loading",
      "Use a Reef Knot because it cannot spill",
      "Use a Figure Eight because it creates a fixed loop",
    ],
    correctAnswer: 1,
    explanation: "A Bowline creates a fixed loop, but cyclic loading or shaking while slack can work it loose. Dress and set it, leave a generous tail, and use an approved backup where that risk exists.",
  },
  {
    id: "r2",
    question: "Which is the safe taught use of a Clove Hitch?",
    options: [
      "The sole attachment for a critical mooring load",
      "A permanent bend joining two loaded ropes",
      "A quick adjustable fender attachment, with additional half hitches securing the tail",
      "A stopper for a line running through a block",
    ],
    correctAnswer: 2,
    explanation: "A Clove Hitch is quick and adjustable for temporary attachments such as fenders. Its crossing turns should be dressed without overlap and its tail secured; it can slip under changing loads, so it is not a sole critical mooring attachment.",
  },
  {
    id: "r3",
    question: "Which description identifies a correctly dressed Sheet Bend joining ropes of different thickness?",
    options: [
      "The thinner rope forms the bight and the tails finish on opposite sides",
      "The thicker rope forms the bight; the thinner rope circles both legs, tucks under its own standing part, and both tails finish on the same side",
      "Both ropes form identical interlocking half-knots with crossed tails",
      "The thinner rope passes back through the bight after circling one leg",
    ],
    correctAnswer: 1,
    explanation: "In the taught Sheet Bend, the thicker or less flexible rope forms the bight. The thinner rope circles both legs and tucks under its own standing part; both tails should finish on the same side.",
  },
  {
    id: "r4",
    question: "Before using a Figure Eight as a stopper, what inspection is taught?",
    options: [
      "Confirm it has two even lobes, a generous tail, and is large enough for the intended opening",
      "Confirm it has two same-direction half hitches against a round turn",
      "Confirm both tails finish on the same side of a bight",
      "Confirm its working end is cut flush with the knot",
    ],
    correctAnswer: 0,
    explanation: "A Figure Eight should show a clear, evenly dressed figure-eight with a generous tail. It must also be large and secure enough for the opening it is intended to stop.",
  },
  {
    id: "r5",
    question: "Which knot should NOT be used to join load-bearing ropes?",
    options: ["Sheet Bend", "Reef Knot", "Double Sheet Bend", "A suitable purpose-made bend"],
    correctAnswer: 1,
    explanation: "A Reef Knot is a binding knot for reef points or bundles. Used as a bend it can spill, capsize, or pull undone; use a suitable bend such as a correctly tied Sheet Bend instead.",
  },
  {
    id: "r6",
    question: "What should a correctly tied Round Turn and Two Half Hitches look like before loading?",
    options: [
      "One turn with two hitches tied in opposite directions and spaced apart",
      "A round turn controlling the strain, with two same-direction half hitches dressed together against it and the tail inspected",
      "Two gripping turns crossed toward a sideways pull",
      "Two flat interlocking half-knots with all four ends loaded",
    ],
    correctAnswer: 1,
    explanation: "The round turn takes and controls strain while tying. The two half hitches are made in the same direction, dressed together against the round turn, and the tail is inspected before loading. The hitches can tighten or jam after heavy or sustained loading, so this is not a promise of ready release under load.",
  },
  {
    id: "r7",
    question: "When is the taught Rolling Hitch an appropriate choice?",
    options: [
      "For a sideways pull on a slippery modern rope",
      "For joining two ropes end-to-end under changing load",
      "For attaching a usually smaller rope to a larger rope for a pull nearly parallel to it in one stated direction",
      "For making a fixed loop that can be loaded from any direction",
    ],
    correctAnswer: 2,
    explanation: "A Rolling Hitch is directional: its doubled turns grip for a pull nearly parallel to the main rope in the stated direction. It may fail on slippery rope or with a sideways pull.",
  },
  {
    id: "r8",
    question: "Which observation indicates a dressed Bowline rather than merely a loop-shaped tangle?",
    options: [
      "The collar is snug around the standing part, the fixed loop is uncrossed, and the working end has a generous tail",
      "The working end is cut flush and the collar remains loose",
      "Two tails leave opposite sides of a bight",
      "Two gripping turns point away from the expected pull",
    ],
    correctAnswer: 0,
    explanation: "Inspect the Bowline's rope path: its collar should be dressed snugly around the standing part, its fixed loop uncrossed, and its working end left with a generous tail.",
  },
  {
    id: "r9",
    question: "A Clove Hitch around a post has overlapping wraps and its crossing turns are loose. What should you do?",
    options: [
      "Load it immediately so the overlaps settle themselves",
      "Dress the two crossing turns snugly together without overlap, set the knot, and inspect the tail",
      "Convert it into a Reef Knot by pulling both ends apart",
      "Cut the tail short so it cannot snag",
    ],
    correctAnswer: 1,
    explanation: "The taught inspection requires the two crossing turns to be dressed snugly together without overlap. Set the hitch and inspect or secure its tail before its temporary use.",
  },
  {
    id: "r10",
    question: "How do you distinguish a correctly dressed Reef Knot from a Granny Knot?",
    options: [
      "Its two half-knots are tied in the same direction",
      "Its two opposite half-knots lie flat and symmetrical, with each tail beside its own standing part",
      "Its tails finish on opposite sides of a thicker-rope bight",
      "It has one doubled turn toward the direction of pull",
    ],
    correctAnswer: 1,
    explanation: "A Reef Knot uses opposite half-knots and dresses flat and symmetrically, with each tail beside its own standing part. Even correctly tied, it remains a binding knot rather than a load-bearing bend.",
  },
  {
    id: "r11",
    question: "Two ropes differ greatly in size and the material is slippery. What does the Sheet Bend lesson advise?",
    options: [
      "Use a single Sheet Bend with very short tails",
      "Use a Double Sheet Bend with longer tails",
      "Substitute a Reef Knot and load all four ends",
      "Use a Clove Hitch around the thinner rope",
    ],
    correctAnswer: 1,
    explanation: "For a large size difference or slippery material, the lesson advises a Double Sheet Bend and longer tails. The knot must still be dressed and inspected before loading.",
  },
  {
    id: "r12",
    question: "Which inspection and test matches a Rolling Hitch set for a pull to the left along the main rope?",
    options: [
      "The doubled gripping turns are dressed toward the left; apply load progressively and confirm it grips in that direction",
      "The doubled turns are dressed to the right; test it first with a hard sideways shock",
      "The turns may overlap anywhere because the final half hitch carries the load",
      "It should slide equally easily in both directions under full load",
    ],
    correctAnswer: 0,
    explanation: "Dress the two gripping turns tightly together toward the expected pull, snug the final half hitch, inspect the tail, and test progressively. A Rolling Hitch is directional and should not be relied on for a sideways pull.",
  },
] as const;

export default ropeworkQuestions;
