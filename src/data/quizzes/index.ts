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
  "nautical-terms-quiz": { meta: { title: "Full Nautical Terms Quiz", subtitle: "32 questions covering Boat Parts and Sail Controls" }, importer: () => import("./nauticalTerms") },
  ropework: { meta: { title: "Ropework Quiz", subtitle: "Knot purpose, use cases, and safety checks" }, importer: () => import("./ropework") },
  anchorwork: { meta: { title: "Anchorwork Quiz", subtitle: "Scope, holding checks, and ground tackle basics" }, importer: () => import("./anchorwork") },
  victualling: { meta: { title: "Victualling Quiz", subtitle: "Provisioning, storage, and passage planning" }, importer: () => import("./victualling") },
  engine: { meta: { title: "Engine Checks Quiz", subtitle: "Pre-start routines and troubleshooting" }, importer: () => import("./engine") },
  rig: { meta: { title: "Rig Prep Quiz", subtitle: "Standing and running rigging inspections" }, importer: () => import("./rig") },
  colregs: { meta: { title: "Combined Rules Diagnostic", subtitle: "Steering & Sailing plus Lights & Signals" }, importer: () => import("./colregs") },
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

const normalizedOption = (value: string) => value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
const normalizedAssessmentText = (value: string) => value.normalize("NFKC").toLocaleLowerCase("en")
  .replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
const escapesPattern = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const revealsCorrectOption = (text: string, correctOption: string) => {
  const normalizedCorrect = normalizedAssessmentText(correctOption);
  // Explicit answer-key language is reliable leakage. Merely mentioning a
  // panel, vessel, or other short/common option in observational data is not.
  if (normalizedCorrect.length < 3) return false;
  const option = escapesPattern(normalizedCorrect);
  const normalizedText = normalizedAssessmentText(text);
  return new RegExp(`(?:correct|right|keyed) (?:answer )?(?:is )?${option}(?: |$)`).test(normalizedText)
    || new RegExp(`(?:answer|solution) (?:is )?${option}(?: |$)`).test(normalizedText)
    || new RegExp(`(?:^| )${option} (?:is )?(?:the )?(?:correct|right|keyed) answer(?: |$)`).test(normalizedText)
    || new RegExp(`(?:^| )${option} is the (?:answer|solution)(?: |$)`).test(normalizedText)
    || new RegExp(`(?:^| )(?:choose|select|pick) ${option}(?: |$)`).test(normalizedText)
    || new RegExp(`(?:^| )${option} should be (?:selected|chosen|picked)(?: |$)`).test(normalizedText);
};
const localQuizImage = /^\/images\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.(?:png|jpe?g|webp|svg)$/i;

const questionError = (topicId: string, index: number, candidate: unknown, detail: string) => {
  const id = candidate && typeof candidate === "object" && "id" in candidate && typeof candidate.id === "string"
    ? ` "${candidate.id}"`
    : ` at index ${index}`;
  return new Error(`Quiz topic "${topicId}" question${id}: ${detail}`);
};

/**
 * Runtime boundary for quiz modules. Both lazy topic loads and bulk exam/review
 * loads use this exact validator, so malformed authored data never reaches UI,
 * scoring, persistence, or review scheduling.
 */
export const validateQuizBank = (topicId: string, candidate: unknown): readonly Question[] => {
  if (!Array.isArray(candidate) || candidate.length === 0) throw new Error(`Quiz topic "${topicId}" contains no questions.`);
  const ids = new Set<string>();
  for (const [index, value] of candidate.entries()) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw questionError(topicId, index, value, "must be an object.");
    }
    const question = value as Record<string, unknown>;
    if (typeof question.id !== "string" || question.id.trim() === "" || question.id !== question.id.trim()) {
      throw questionError(topicId, index, value, "id must be a non-blank, trimmed string.");
    }
    if (ids.has(question.id)) throw questionError(topicId, index, value, `id "${question.id}" is duplicated in this topic.`);
    ids.add(question.id);
    if (typeof question.question !== "string" || question.question.trim() === "" || question.question !== question.question.trim()) {
      throw questionError(topicId, index, value, "text must be a non-blank, trimmed string.");
    }
    if (!Array.isArray(question.options) || question.options.length < 2) {
      throw questionError(topicId, index, value, "options must intentionally provide at least two choices.");
    }
    const options = new Set<string>();
    for (const [optionIndex, option] of question.options.entries()) {
      if (typeof option !== "string" || option.trim() === "") {
        throw questionError(topicId, index, value, `option ${optionIndex + 1} must be a non-blank string.`);
      }
      const normalized = normalizedOption(option);
      if (options.has(normalized)) {
        throw questionError(topicId, index, value, `option ${optionIndex + 1} duplicates another choice after normalization.`);
      }
      options.add(normalized);
    }
    if (!Number.isInteger(question.correctAnswer) || (question.correctAnswer as number) < 0 || (question.correctAnswer as number) >= question.options.length) {
      throw questionError(topicId, index, value, "correctAnswer must be an integer index within options.");
    }
    if (typeof question.explanation !== "string" || question.explanation.trim() === "") {
      throw questionError(topicId, index, value, "explanation must be a non-blank string.");
    }
    if (question.image !== undefined && (typeof question.image !== "string" || !localQuizImage.test(question.image))) {
      throw questionError(topicId, index, value, "image must be a canonical local asset path under /images/.");
    }
    if (question.image !== undefined) {
      const hasMeaningfulAlt = typeof question.imageAlt === "string" && question.imageAlt.trim().length >= 20;
      const scenario = question.scenario;
      const hasStructuredEquivalent = Boolean(
        scenario && typeof scenario === "object" && !Array.isArray(scenario)
        && typeof (scenario as Record<string, unknown>).accessibleName === "string"
        && ((scenario as Record<string, unknown>).accessibleName as string).trim().length >= 5
        && typeof (scenario as Record<string, unknown>).description === "string"
        && ((scenario as Record<string, unknown>).description as string).trim().length >= 10
        && Array.isArray((scenario as Record<string, unknown>).facts)
        && ((scenario as Record<string, unknown>).facts as unknown[]).length > 0
      );
      if (!hasMeaningfulAlt && !hasStructuredEquivalent) {
        throw questionError(topicId, index, value, "visual questions require a meaningful imageAlt or structured scenario equivalent.");
      }
      const correctOption = question.options[question.correctAnswer as number] as string;
      const structuredText = hasStructuredEquivalent ? JSON.stringify(scenario) : "";
      if ((hasMeaningfulAlt && revealsCorrectOption(question.imageAlt as string, correctOption))
        || (hasStructuredEquivalent && revealsCorrectOption(structuredText, correctOption))) {
        throw questionError(topicId, index, value, "visual equivalent must not reveal the correct option.");
      }
    }
  }
  return candidate as readonly Question[];
};

export const validateQuizCatalogueIds = (catalogue: Readonly<Record<string, readonly Question[]>>) => {
  const ownerById = new Map<string, string>();
  for (const [topicId, questions] of Object.entries(catalogue)) for (const question of questions) {
    const firstOwner = ownerById.get(question.id);
    if (firstOwner !== undefined) {
      throw new Error(`Question ID "${question.id}" belongs to both quiz topics "${firstOwner}" and "${topicId}".`);
    }
    ownerById.set(question.id, topicId);
  }
  return catalogue;
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
    .then(({ default: questions }) => validateQuizBank(topicId, questions))
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
  return validateQuizCatalogueIds(result) as Readonly<Record<QuizTopicId, readonly Question[]>>;
};

export const quizCatalogue: Readonly<Record<QuizTopicId, QuizTopic>> = Object.fromEntries(
  topicIds.map((id) => [id, { id, meta: definitions[id].meta, load: () => loadQuizTopic(id) }]),
) as Record<QuizTopicId, QuizTopic>;

export type { Question, TopicMeta } from "./types";
