/**
 * Topic Registry — Single Source of Truth for all topic IDs, hierarchy,
 * and metadata in the Day Skipper Trainer.
 */

export interface TopicEntry {
  readonly id: string;
  readonly label: string;
  readonly parentId: string | null;
  readonly route: string;
  readonly quizRoute: string | null;
  readonly submoduleIds: readonly string[];
  readonly syllabusArea: number;
}

export const topicRegistry: readonly TopicEntry[] = [
  { id: "nautical-terms", label: "Nautical Terms & Boat Parts", parentId: null, route: "/nautical-terms", quizRoute: "/quiz/nautical-terms-quiz", submoduleIds: ["nautical-terms-boat-parts", "nautical-terms-sail-controls", "nautical-terms-quiz"], syllabusArea: 1 },
  { id: "nautical-terms-boat-parts", label: "Boat Parts", parentId: "nautical-terms", route: "/nautical-terms/boat-parts", quizRoute: null, submoduleIds: [], syllabusArea: 1 },
  { id: "nautical-terms-sail-controls", label: "Sail Controls", parentId: "nautical-terms", route: "/nautical-terms/sail-controls", quizRoute: null, submoduleIds: [], syllabusArea: 1 },
  { id: "nautical-terms-quiz", label: "Nautical Terms Quiz", parentId: "nautical-terms", route: "/quiz/nautical-terms-quiz", quizRoute: "/quiz/nautical-terms-quiz", submoduleIds: [], syllabusArea: 1 },
  { id: "victualling", label: "Victualling (Provisioning)", parentId: null, route: "/victualling", quizRoute: "/quiz/victualling", submoduleIds: [], syllabusArea: 1 },
  { id: "engine", label: "Engine Checks & Maintenance", parentId: null, route: "/engine", quizRoute: "/quiz/engine", submoduleIds: [], syllabusArea: 1 },
  { id: "rig", label: "Rig Checks & Preparation", parentId: null, route: "/rig", quizRoute: "/quiz/rig", submoduleIds: [], syllabusArea: 1 },
  { id: "ropework", label: "Ropework & Knots", parentId: null, route: "/ropework", quizRoute: "/quiz/ropework", submoduleIds: [], syllabusArea: 2 },
  { id: "anchorwork", label: "Anchorwork", parentId: null, route: "/anchorwork", quizRoute: "/quiz/anchorwork", submoduleIds: [], syllabusArea: 3 },
  { id: "safety", label: "Safety Procedures", parentId: null, route: "/safety", quizRoute: null, submoduleIds: ["safety-mob", "safety-fire", "safety-life-raft", "safety-flares", "safety-personal", "safety-gas"], syllabusArea: 4 },
  { id: "safety-mob", label: "Man Overboard", parentId: "safety", route: "/safety/mob", quizRoute: "/quiz/safety-mob-quiz", submoduleIds: [], syllabusArea: 4 },
  { id: "safety-fire", label: "Fire Safety", parentId: "safety", route: "/safety/fire", quizRoute: "/quiz/safety-fire-quiz", submoduleIds: ["safety-fire-drill"], syllabusArea: 4 },
  { id: "safety-fire-drill", label: "Fire Extinguisher Drill", parentId: "safety-fire", route: "/safety/fire", quizRoute: null, submoduleIds: [], syllabusArea: 4 },
  { id: "safety-life-raft", label: "Life Raft & Abandon Ship", parentId: "safety", route: "/safety/life-raft", quizRoute: "/quiz/safety-life-raft-quiz", submoduleIds: [], syllabusArea: 4 },
  { id: "safety-flares", label: "Flares & Pyrotechnics", parentId: "safety", route: "/safety/flares", quizRoute: "/quiz/safety-flares-quiz", submoduleIds: ["safety-flares-drill"], syllabusArea: 4 },
  { id: "safety-flares-drill", label: "Flare Identification Drill", parentId: "safety-flares", route: "/safety/flares", quizRoute: null, submoduleIds: [], syllabusArea: 4 },
  { id: "safety-personal", label: "Personal Safety Equipment", parentId: "safety", route: "/safety/personal", quizRoute: null, submoduleIds: [], syllabusArea: 4 },
  { id: "safety-gas", label: "Gas Safety", parentId: "safety", route: "/safety/gas", quizRoute: null, submoduleIds: [], syllabusArea: 4 },
  { id: "rules-of-the-road", label: "Rules of the Road", parentId: null, route: "/rules-of-the-road", quizRoute: "/quiz/colregs", submoduleIds: ["colregs-theory", "lights-theory", "colregs"], syllabusArea: 5 },
  { id: "colregs-theory", label: "COLREGs Theory", parentId: "rules-of-the-road", route: "/rules/colregs", quizRoute: null, submoduleIds: [], syllabusArea: 5 },
  { id: "lights-theory", label: "Lights & Signals Theory", parentId: "rules-of-the-road", route: "/rules/lights", quizRoute: "/quiz/lights-signals", submoduleIds: [], syllabusArea: 5 },
  { id: "colregs", label: "COLREGs Quiz", parentId: "rules-of-the-road", route: "/quiz/colregs", quizRoute: "/quiz/colregs", submoduleIds: [], syllabusArea: 5 },
  { id: "navigation", label: "Navigation Fundamentals", parentId: null, route: "/navigation", quizRoute: null, submoduleIds: ["charts-theory", "compass-theory", "position-theory"], syllabusArea: 6 },
  { id: "charts-theory", label: "Charts Theory", parentId: "navigation", route: "/navigation/charts", quizRoute: null, submoduleIds: [], syllabusArea: 6 },
  { id: "compass-theory", label: "Compass Theory", parentId: "navigation", route: "/navigation/compass", quizRoute: null, submoduleIds: [], syllabusArea: 7 },
  { id: "tides", label: "Tides", parentId: "navigation", route: "/navigation/tides", quizRoute: null, submoduleIds: [], syllabusArea: 8 },
  { id: "position-theory", label: "Position Fixing Theory", parentId: "navigation", route: "/navigation/position", quizRoute: null, submoduleIds: [], syllabusArea: 9 },
  { id: "vector-triangle", label: "Course to Steer (Vector Triangle)", parentId: "navigation", route: "/navigation/tides/vector-tool", quizRoute: null, submoduleIds: [], syllabusArea: 10 },
  { id: "pilotage", label: "Pilotage", parentId: null, route: "/pilotage", quizRoute: "/quiz/pilotage", submoduleIds: ["pilotage-buoyage", "pilotage-transits", "pilotage-clearing-bearings", "pilotage-plan", "quiz-pilotage"], syllabusArea: 11 },
  { id: "pilotage-buoyage", label: "IALA Buoyage", parentId: "pilotage", route: "/pilotage/buoyage", quizRoute: null, submoduleIds: [], syllabusArea: 11 },
  { id: "pilotage-transits", label: "Transits & Leading Lines", parentId: "pilotage", route: "/pilotage/transits", quizRoute: null, submoduleIds: [], syllabusArea: 11 },
  { id: "pilotage-clearing-bearings", label: "Clearing Bearings", parentId: "pilotage", route: "/pilotage/clearing-bearings", quizRoute: null, submoduleIds: [], syllabusArea: 11 },
  { id: "pilotage-plan", label: "Pilotage Plan Builder", parentId: "pilotage", route: "/pilotage/plan", quizRoute: null, submoduleIds: [], syllabusArea: 11 },
  { id: "quiz-pilotage", label: "Pilotage Quiz", parentId: "pilotage", route: "/quiz/pilotage", quizRoute: "/quiz/pilotage", submoduleIds: [], syllabusArea: 11 },
  { id: "weather", label: "Meteorology", parentId: null, route: "/weather", quizRoute: "/quiz/weather", submoduleIds: ["weather-systems", "weather-beaufort", "weather-forecasts", "weather-fog", "quiz-weather"], syllabusArea: 12 },
  { id: "weather-systems", label: "Weather Systems & Fronts", parentId: "weather", route: "/weather/systems", quizRoute: null, submoduleIds: [], syllabusArea: 12 },
  { id: "weather-beaufort", label: "Beaufort Scale", parentId: "weather", route: "/weather/beaufort", quizRoute: null, submoduleIds: [], syllabusArea: 12 },
  { id: "weather-forecasts", label: "Marine Forecasts", parentId: "weather", route: "/weather/forecasts", quizRoute: null, submoduleIds: [], syllabusArea: 12 },
  { id: "weather-fog", label: "Fog & Visibility", parentId: "weather", route: "/weather/fog", quizRoute: null, submoduleIds: [], syllabusArea: 12 },
  { id: "quiz-weather", label: "Meteorology Quiz", parentId: "weather", route: "/quiz/weather", quizRoute: "/quiz/weather", submoduleIds: [], syllabusArea: 12 },
  { id: "passage-planning", label: "Passage Planning", parentId: null, route: "/passage-planning", quizRoute: "/quiz/passage-planning", submoduleIds: ["passage-planning-prepare", "passage-planning-calculator", "passage-planning-builder", "passage-planning-checklist", "quiz-passage-planning"], syllabusArea: 13 },
  { id: "passage-planning-prepare", label: "PREPARE Mnemonic", parentId: "passage-planning", route: "/passage-planning/prepare", quizRoute: null, submoduleIds: [], syllabusArea: 13 },
  { id: "passage-planning-calculator", label: "Passage Calculator", parentId: "passage-planning", route: "/passage-planning/calculator", quizRoute: null, submoduleIds: [], syllabusArea: 13 },
  { id: "passage-planning-builder", label: "Passage Plan Builder", parentId: "passage-planning", route: "/passage-planning/builder", quizRoute: null, submoduleIds: [], syllabusArea: 13 },
  { id: "passage-planning-checklist", label: "Pre-departure Checklist", parentId: "passage-planning", route: "/passage-planning/checklist", quizRoute: null, submoduleIds: [], syllabusArea: 13 },
  { id: "quiz-passage-planning", label: "Passage Planning Quiz", parentId: "passage-planning", route: "/quiz/passage-planning", quizRoute: "/quiz/passage-planning", submoduleIds: [], syllabusArea: 13 },
];

const topicByIdMap = new Map(topicRegistry.map((entry) => [entry.id, entry]));
export const getTopicById = (id: string): TopicEntry | undefined => topicByIdMap.get(id);
export const getTopicsByParent = (parentId: string): readonly TopicEntry[] => topicRegistry.filter((entry) => entry.parentId === parentId);
export const getTopicsBySyllabusArea = (area: number): readonly TopicEntry[] => topicRegistry.filter((entry) => entry.syllabusArea === area);
export const getRootTopics = (): readonly TopicEntry[] => topicRegistry.filter((entry) => entry.parentId === null);
export const getImplementedSyllabusAreas = (): readonly number[] => {
  const areas = new Set(topicRegistry.map((entry) => entry.syllabusArea));
  return [...areas].sort((a, b) => a - b);
};
export const TOTAL_SYLLABUS_AREAS = 13;

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
  SAFETY_FLARES: "safety-flares",
  SAFETY_FLARES_DRILL: "safety-flares-drill",
  SAFETY_PERSONAL: "safety-personal",
  SAFETY_GAS: "safety-gas",
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
  PILOTAGE: "pilotage",
  PILOTAGE_BUOYAGE: "pilotage-buoyage",
  PILOTAGE_TRANSITS: "pilotage-transits",
  PILOTAGE_CLEARING_BEARINGS: "pilotage-clearing-bearings",
  PILOTAGE_PLAN: "pilotage-plan",
  PILOTAGE_QUIZ: "quiz-pilotage",
  WEATHER: "weather",
  WEATHER_SYSTEMS: "weather-systems",
  WEATHER_BEAUFORT: "weather-beaufort",
  WEATHER_FORECASTS: "weather-forecasts",
  WEATHER_FOG: "weather-fog",
  WEATHER_QUIZ: "quiz-weather",
  PASSAGE_PLANNING: "passage-planning",
  PASSAGE_PLANNING_PREPARE: "passage-planning-prepare",
  PASSAGE_PLANNING_CALCULATOR: "passage-planning-calculator",
  PASSAGE_PLANNING_BUILDER: "passage-planning-builder",
  PASSAGE_PLANNING_CHECKLIST: "passage-planning-checklist",
  PASSAGE_PLANNING_QUIZ: "quiz-passage-planning",
} as const;
