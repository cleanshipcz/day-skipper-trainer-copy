/**
 * Topic Registry — Single Source of Truth for all topic IDs, hierarchy,
 * and metadata in the Day Skipper Trainer.
 *
 * Every topic used for progress tracking, routing, and dashboard display
 * is defined here. Pages and components should import from this module
 * rather than using string literals.
 *
 * Adding a new topic requires only:
 *   1. Adding an entry here
 *   2. Creating the page component and its route in routes.tsx
 * No dashboard or menu changes are needed — they derive from the registry.
 *
 * @see docs/FEATURE_TASKS.md — Story E0-S3
 */

export interface TopicEntry {
  /** Unique identifier used as progress key (must match existing progress data). */
  readonly id: string;
  /** Human-readable display label. */
  readonly label: string;
  /** Parent topic ID, or null for root/dashboard-level topics. */
  readonly parentId: string | null;
  /** Route path registered in src/app/routes.tsx. */
  readonly route: string;
  /** Quiz route path, or null if the topic has no quiz. */
  readonly quizRoute: string | null;
  /** IDs of child/sub-module topics. Empty array for leaf topics. */
  readonly submoduleIds: readonly string[];
  /** RYA Day Skipper syllabus area number (1–13). */
  readonly syllabusArea: number;
}

/**
 * Complete topic registry. Order matches dashboard display order.
 *
 * Syllabus area mapping (RYA SBT DS 03, per docs/FEATURES.md §2):
 *   1 = Nautical Terms
 *   2 = Ropework
 *   3 = Anchorwork
 *   4 = Safety
 *   5 = International Regulations (COLREGs)
 *   6 = Definition of Position, Charts
 *   7 = Compass
 *   8 = Tides
 *   9 = Position Fixing
 *  10 = Course to Steer
 *  11 = Pilotage           (not yet implemented)
 *  12 = Meteorology         (not yet implemented)
 *  13 = Passage Planning    (not yet implemented)
 *
 * Preparation topics (victualling, engine, rig) are mapped to area 1
 * (Seamanship / preparation for sea) since they are not separate RYA
 * syllabus areas but sub-topics of general seamanship.
 */
export const topicRegistry: readonly TopicEntry[] = [
  // ── Syllabus Area 1: Nautical Terms & Seamanship Preparation ─────────
  {
    id: "nautical-terms",
    label: "Nautical Terms & Boat Parts",
    parentId: null,
    route: "/nautical-terms",
    quizRoute: "/quiz/nautical-terms-quiz",
    submoduleIds: ["nautical-terms-boat-parts", "nautical-terms-sail-controls", "nautical-terms-quiz"],
    syllabusArea: 1,
  },
  {
    id: "nautical-terms-boat-parts",
    label: "Boat Parts",
    parentId: "nautical-terms",
    route: "/nautical-terms/boat-parts",
    quizRoute: null,
    submoduleIds: [],
    syllabusArea: 1,
  },
  {
    id: "nautical-terms-sail-controls",
    label: "Sail Controls",
    parentId: "nautical-terms",
    route: "/nautical-terms/sail-controls",
    quizRoute: null,
    submoduleIds: [],
    syllabusArea: 1,
  },
  {
    id: "nautical-terms-quiz",
    label: "Nautical Terms Quiz",
    parentId: "nautical-terms",
    route: "/quiz/nautical-terms-quiz",
    quizRoute: "/quiz/nautical-terms-quiz",
    submoduleIds: [],
    syllabusArea: 1,
  },
  {
    id: "victualling",
    label: "Victualling (Provisioning)",
    parentId: null,
    route: "/victualling",
    quizRoute: "/quiz/victualling",
    submoduleIds: [],
    syllabusArea: 1,
  },
  {
    id: "engine",
    label: "Engine Checks & Maintenance",
    parentId: null,
    route: "/engine",
    quizRoute: "/quiz/engine",
    submoduleIds: [],
    syllabusArea: 1,
  },
  {
    id: "rig",
    label: "Rig Checks & Preparation",
    parentId: null,
    route: "/rig",
    quizRoute: "/quiz/rig",
    submoduleIds: [],
    syllabusArea: 1,
  },

  // ── Syllabus Area 2: Ropework ────────────────────────────────────────
  {
    id: "ropework",
    label: "Ropework & Knots",
    parentId: null,
    route: "/ropework",
    quizRoute: "/quiz/ropework",
    submoduleIds: [],
    syllabusArea: 2,
  },

  // ── Syllabus Area 3: Anchorwork ──────────────────────────────────────
  {
    id: "anchorwork",
    label: "Anchorwork",
    parentId: null,
    route: "/anchorwork",
    quizRoute: "/quiz/anchorwork",
    submoduleIds: [],
    syllabusArea: 3,
  },

  // ── Syllabus Area 4: Safety ──────────────────────────────────────────
  {
    id: "safety",
    label: "Safety Procedures",
    parentId: null,
    route: "/safety",
    quizRoute: null,
    submoduleIds: ["safety-mob", "safety-fire", "safety-life-raft"],
    syllabusArea: 4,
  },
  {
    id: "safety-mob",
    label: "Man Overboard",
    parentId: "safety",
    route: "/safety/mob",
    quizRoute: "/quiz/safety-mob-quiz",
    submoduleIds: [],
    syllabusArea: 4,
  },
  {
    id: "safety-fire",
    label: "Fire Safety",
    parentId: "safety",
    route: "/safety/fire",
    quizRoute: "/quiz/safety-fire-quiz",
    submoduleIds: ["safety-fire-drill"],
    syllabusArea: 4,
  },
  {
    id: "safety-fire-drill",
    label: "Fire Extinguisher Drill",
    parentId: "safety-fire",
    route: "/safety/fire",
    quizRoute: null,
    submoduleIds: [],
    syllabusArea: 4,
  },
  {
    id: "safety-life-raft",
    label: "Life Raft & Abandon Ship",
    parentId: "safety",
    route: "/safety/life-raft",
    quizRoute: "/quiz/safety-life-raft-quiz",
    submoduleIds: [],
    syllabusArea: 4,
  },

  // ── Syllabus Area 5: International Regulations (COLREGs) ─────────────
  {
    id: "rules-of-the-road",
    label: "Rules of the Road",
    parentId: null,
    route: "/rules-of-the-road",
    quizRoute: "/quiz/colregs",
    submoduleIds: ["colregs-theory", "lights-theory", "colregs"],
    syllabusArea: 5,
  },
  {
    id: "colregs-theory",
    label: "COLREGs Theory",
    parentId: "rules-of-the-road",
    route: "/rules/colregs",
    quizRoute: null,
    submoduleIds: [],
    syllabusArea: 5,
  },
  {
    id: "lights-theory",
    label: "Lights & Signals Theory",
    parentId: "rules-of-the-road",
    route: "/rules/lights",
    quizRoute: "/quiz/lights-signals",
    submoduleIds: [],
    syllabusArea: 5,
  },
  {
    id: "colregs",
    label: "COLREGs Quiz",
    parentId: "rules-of-the-road",
    route: "/quiz/colregs",
    quizRoute: "/quiz/colregs",
    submoduleIds: [],
    syllabusArea: 5,
  },

  // ── Syllabus Area 6: Definition of Position, Charts ──────────────────
  {
    id: "navigation",
    label: "Navigation Fundamentals",
    parentId: null,
    route: "/navigation",
    quizRoute: null,
    submoduleIds: ["charts-theory", "compass-theory", "position-theory"],
    syllabusArea: 6,
  },
  {
    id: "charts-theory",
    label: "Charts Theory",
    parentId: "navigation",
    route: "/navigation/charts",
    quizRoute: null,
    submoduleIds: [],
    syllabusArea: 6,
  },

  // ── Syllabus Area 7: Compass ─────────────────────────────────────────
  {
    id: "compass-theory",
    label: "Compass Theory",
    parentId: "navigation",
    route: "/navigation/compass",
    quizRoute: null,
    submoduleIds: [],
    syllabusArea: 7,
  },

  // ── Syllabus Area 8: Tides ───────────────────────────────────────────
  {
    id: "tides",
    label: "Tides",
    parentId: "navigation",
    route: "/navigation/tides",
    quizRoute: null,
    submoduleIds: [],
    syllabusArea: 8,
  },

  // ── Syllabus Area 9: Position Fixing ─────────────────────────────────
  {
    id: "position-theory",
    label: "Position Fixing Theory",
    parentId: "navigation",
    route: "/navigation/position",
    quizRoute: null,
    submoduleIds: [],
    syllabusArea: 9,
  },

  // ── Syllabus Area 10: Course to Steer ────────────────────────────────
  {
    id: "vector-triangle",
    label: "Course to Steer (Vector Triangle)",
    parentId: "navigation",
    route: "/navigation/tides/vector-tool",
    quizRoute: null,
    submoduleIds: [],
    syllabusArea: 10,
  },
];

// ── Lookup helpers ───────────────────────────────────────────────────────

const topicByIdMap = new Map(topicRegistry.map((entry) => [entry.id, entry]));

/** Look up a topic by its unique ID. Returns undefined if not found. */
export const getTopicById = (id: string): TopicEntry | undefined => topicByIdMap.get(id);

/** Get all direct children of a given parent topic. */
export const getTopicsByParent = (parentId: string): readonly TopicEntry[] =>
  topicRegistry.filter((entry) => entry.parentId === parentId);

/** Get all topics belonging to a given RYA syllabus area (1–13). */
export const getTopicsBySyllabusArea = (area: number): readonly TopicEntry[] =>
  topicRegistry.filter((entry) => entry.syllabusArea === area);

/** Get all root (dashboard-level) topics — those with null parentId. */
export const getRootTopics = (): readonly TopicEntry[] =>
  topicRegistry.filter((entry) => entry.parentId === null);

/**
 * Syllabus areas that currently have at least one topic in the registry.
 * Used to programmatically verify coverage progress.
 */
export const getImplementedSyllabusAreas = (): readonly number[] => {
  const areas = new Set(topicRegistry.map((entry) => entry.syllabusArea));
  return [...areas].sort((a, b) => a - b);
};

/** Total number of RYA Day Skipper syllabus areas. */
export const TOTAL_SYLLABUS_AREAS = 13;

// ── Topic ID constants ───────────────────────────────────────────────────
// Use these instead of string literals when calling useProgress,
// useTheoryCompletionGate, or saveProgress.

export const TOPIC_IDS = {
  NAUTICAL_TERMS: "nautical-terms",
  NAUTICAL_TERMS_BOAT_PARTS: "nautical-terms-boat-parts",
  NAUTICAL_TERMS_SAIL_CONTROLS: "nautical-terms-sail-controls",
  NAUTICAL_TERMS_QUIZ: "nautical-terms-quiz",
  ROPEWORK: "ropework",
  ANCHORWORK: "anchorwork",
  VICTUALLING: "victualling",
  ENGINE: "engine",
  RIG: "rig",
  SAFETY: "safety",
  SAFETY_MOB: "safety-mob",
  SAFETY_FIRE: "safety-fire",
  SAFETY_FIRE_DRILL: "safety-fire-drill",
  SAFETY_LIFE_RAFT: "safety-life-raft",
  RULES_OF_THE_ROAD: "rules-of-the-road",
  COLREGS_THEORY: "colregs-theory",
  LIGHTS_THEORY: "lights-theory",
  COLREGS: "colregs",
  NAVIGATION: "navigation",
  CHARTS_THEORY: "charts-theory",
  COMPASS_THEORY: "compass-theory",
  TIDES: "tides",
  POSITION_THEORY: "position-theory",
  VECTOR_TRIANGLE: "vector-triangle",
} as const;
