import type { Question, TopicMeta } from "./types";

export const topicIds = [
  "nautical-terms-quiz", "ropework", "anchorwork", "victualling", "engine", "rig",
  "colregs", "lights-signals", "safety-mob-quiz", "safety-fire-quiz",
  "safety-life-raft-quiz", "safety-flares-quiz", "safety", "pilotage", "weather",
  "passage-planning",
] as const;

export type QuizTopicId = typeof topicIds[number];
type QuizModule = { default: readonly Question[] };
type QuizImporter = () => Promise<QuizModule>;

export interface QuizTopic {
  readonly id: QuizTopicId;
  readonly meta: TopicMeta;
  readonly load: () => Promise<readonly Question[]>;
}

const definitions: Record<QuizTopicId, { meta: TopicMeta; importer: QuizImporter }> = {
  "nautical-terms-quiz": { meta: { title: "Nautical Terms Quiz", subtitle: "Boat parts, orientation, and rig vocabulary" }, importer: () => import("./nauticalTerms") },
  ropework: { meta: { title: "Ropework Quiz", subtitle: "Knot purpose, use cases, and safety checks" }, importer: () => import("./ropework") },
  anchorwork: { meta: { title: "Anchorwork Quiz", subtitle: "Scope, holding checks, and ground tackle basics" }, importer: () => import("./anchorwork") },
  victualling: { meta: { title: "Victualling Quiz", subtitle: "Provisioning, storage, and passage planning" }, importer: () => import("./victualling") },
  engine: { meta: { title: "Engine Checks Quiz", subtitle: "Pre-start routines and troubleshooting" }, importer: () => import("./engine") },
  rig: { meta: { title: "Rig Prep Quiz", subtitle: "Standing and running rigging inspections" }, importer: () => import("./rig") },
  colregs: { meta: { title: "Colregs Quiz", subtitle: "Steering & Sailing Rules (Rules of the Road)" }, importer: () => import("./colregs") },
  "lights-signals": { meta: { title: "Lights & Signals Mastery", subtitle: "Lights, Shapes, Sound Signals & Distress" }, importer: () => import("./lightsSignals") },
  "safety-mob-quiz": { meta: { title: "Man Overboard Quiz", subtitle: "Procedures, distress signals, and recovery actions" }, importer: () => import("./safetyMob") },
  "safety-fire-quiz": { meta: { title: "Fire Safety Quiz", subtitle: "Fire types, extinguishers, prevention, and emergency procedure" }, importer: () => import("./safetyFire") },
  "safety-life-raft-quiz": { meta: { title: "Life Raft & Abandon Ship Quiz", subtitle: "Life raft types, deployment, boarding, and survival procedures" }, importer: () => import("./safetyLifeRaft") },
  "safety-flares-quiz": { meta: { title: "Flares & Pyrotechnics Quiz", subtitle: "Flare types, identification, usage scenarios, and expiry rules" }, importer: () => import("./safetyFlares") },
  safety: { meta: { title: "Comprehensive Safety Quiz", subtitle: "MOB, fire, life raft, flares, personal safety & gas safety" }, importer: () => import("./safety") },
  pilotage: { meta: { title: "Pilotage Quiz", subtitle: "IALA buoyage, transits, clearing bearings, and harbour plans" }, importer: () => import("./pilotage") },
  weather: { meta: { title: "Meteorology Quiz", subtitle: "Weather systems, Beaufort scale, forecasts, fog and visibility" }, importer: () => import("./weather") },
  "passage-planning": { meta: { title: "Passage Planning Quiz", subtitle: "PREPARE, calculations, tidal gates, contingencies and departure checks" }, importer: () => import("./passagePlanning") },
};

const cache = new Map<QuizTopicId, Promise<readonly Question[]>>();

const validateBank = (topicId: QuizTopicId, questions: readonly Question[]) => {
  if (!Array.isArray(questions) || questions.length === 0) throw new Error(`Quiz topic "${topicId}" contains no questions.`);
  const ids = new Set<string>();
  for (const question of questions) {
    if (!question.id || ids.has(question.id)) throw new Error(`Quiz topic "${topicId}" has an invalid or duplicate question ID.`);
    ids.add(question.id);
  }
  return questions;
};

export const isQuizTopicId = (value: string): value is QuizTopicId =>
  Object.prototype.hasOwnProperty.call(definitions, value);

export const topicMeta: Readonly<Record<QuizTopicId, TopicMeta>> = Object.fromEntries(
  topicIds.map((id) => [id, definitions[id].meta]),
) as Record<QuizTopicId, TopicMeta>;

export const loadQuizTopic = (topicId: string): Promise<readonly Question[]> => {
  if (!isQuizTopicId(topicId)) return Promise.reject(new Error(`Unknown quiz topic "${topicId}".`));
  const existing = cache.get(topicId);
  if (existing) return existing;
  const request = definitions[topicId].importer()
    .then(({ default: questions }) => validateBank(topicId, questions))
    .catch((error: unknown) => {
      cache.delete(topicId);
      throw new Error(`Could not load ${definitions[topicId].meta.title}.`, { cause: error });
    });
  cache.set(topicId, request);
  return request;
};

/** Intentional bulk loading for exam/review; workers bound simultaneous chunk requests. */
export const loadAllQuizTopics = async (concurrency = 4): Promise<Readonly<Record<QuizTopicId, readonly Question[]>>> => {
  const limit = Math.max(1, Math.min(topicIds.length, Math.floor(concurrency) || 1));
  const result = {} as Record<QuizTopicId, readonly Question[]>;
  let cursor = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (cursor < topicIds.length) {
      const topicId = topicIds[cursor++];
      result[topicId] = await loadQuizTopic(topicId);
    }
  }));
  const allIds = new Set<string>();
  for (const topicId of topicIds) for (const question of result[topicId]) {
    if (allIds.has(question.id)) throw new Error(`Question ID "${question.id}" is duplicated across quiz topics.`);
    allIds.add(question.id);
  }
  return result;
};

export const quizCatalogue: Readonly<Record<QuizTopicId, QuizTopic>> = Object.fromEntries(
  topicIds.map((id) => [id, { id, meta: definitions[id].meta, load: () => loadQuizTopic(id) }]),
) as Record<QuizTopicId, QuizTopic>;

export type { Question, TopicMeta } from "./types";
