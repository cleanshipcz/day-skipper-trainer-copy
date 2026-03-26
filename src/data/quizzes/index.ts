import type { Question, TopicMeta } from "./types";
import nauticalTermsQuestions from "./nauticalTerms";
import ropeworkQuestions from "./ropework";
import anchorworkQuestions from "./anchorwork";
import victuallingQuestions from "./victualling";
import engineQuestions from "./engine";
import rigQuestions from "./rig";
import colregsQuestions from "./colregs";
import lightsSignalsQuestions from "./lightsSignals";
import safetyMobQuestions from "./safetyMob";

/** Registry mapping each quiz topic ID to its question array. */
export const quizRegistry: Record<string, readonly Question[]> = {
  "nautical-terms-quiz": nauticalTermsQuestions,
  ropework: ropeworkQuestions,
  anchorwork: anchorworkQuestions,
  victualling: victuallingQuestions,
  engine: engineQuestions,
  rig: rigQuestions,
  colregs: colregsQuestions,
  "lights-signals": lightsSignalsQuestions,
  "safety-mob-quiz": safetyMobQuestions,
};

/** Metadata displayed in the quiz header for each topic. */
export const topicMeta: Record<string, TopicMeta> = {
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

export type { Question, TopicMeta } from "./types";
