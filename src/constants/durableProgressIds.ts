/**
 * Compatibility snapshot of every progress key shipped before issue #59.
 * Existing entries are immutable because Supabase rows and offline queues use
 * these values as durable identifiers. New entries may only be appended.
 */
export const DURABLE_PROGRESS_IDS = [
  "nautical-terms", "nautical-terms-boat-parts", "nautical-terms-sail-controls", "nautical-terms-quiz",
  "victualling", "engine", "rig", "ropework", "anchorwork",
  "safety", "safety-mob", "safety-fire", "safety-fire-drill", "safety-life-raft",
  "safety-flares", "safety-flares-drill", "safety-personal", "safety-gas",
  "rules-of-the-road", "colregs-theory", "lights-theory", "colregs",
  "navigation", "charts-theory", "compass-theory", "tides", "position-theory", "vector-triangle",
  "pilotage", "pilotage-buoyage", "pilotage-transits", "pilotage-clearing-bearings", "pilotage-plan", "quiz-pilotage",
  "weather", "weather-systems", "weather-beaufort", "weather-forecasts", "weather-fog", "quiz-weather",
  "passage-planning", "passage-planning-prepare", "passage-planning-calculator",
  "passage-planning-builder", "passage-planning-checklist", "quiz-passage-planning",
] as const;
