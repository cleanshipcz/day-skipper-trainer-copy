import type { SupabaseClient } from "@supabase/supabase-js";
import { VICTUALLING_CHECKLIST_PROGRESS_ID, VICTUALLING_PROGRESS_VERSION } from "./victuallingProgress";
import { ENGINE_CHECKLIST_CATALOGUE_ID, ENGINE_CHECKLIST_PROGRESS_ID, ENGINE_CHECKLIST_PROGRESS_VERSION } from "./engineChecklistProgress";

interface SaveProgressRecordArgs {
  supabaseClient: SupabaseClient;
  userId: string;
  topicId: string;
  completed?: boolean;
  score?: number;
  pointsEarned?: number;
  answersHistory?: Record<string, unknown>;
}

interface DeleteProgressRecordArgs {
  supabaseClient: SupabaseClient;
  userId: string;
  topicId: string;
}

export const saveProgressRecord = async ({
  supabaseClient,
  userId,
  topicId,
  completed = false,
  score = 0,
  pointsEarned = 0,
  answersHistory,
}: SaveProgressRecordArgs): Promise<{ pointsAwarded: boolean; completionAwarded: boolean; awardedPoints: number }> => {
  // Authentication is enforced inside the RPC with auth.uid(). `userId` is
  // deliberately not sent to the database function and remains here only for
  // the separate RLS-scoped delete operation/API compatibility.
  void userId;
  const anchorworkIds = topicId === "anchorwork"
    ? (answersHistory as { completedTopicIds?: unknown } | undefined)?.completedTopicIds
    : null;
  if (topicId === "anchorwork" && (!Array.isArray(anchorworkIds) || anchorworkIds.some((id) => typeof id !== "string"))) {
    throw new Error("Anchorwork progress requires canonical completed topic IDs");
  }
  const victuallingPayload = answersHistory as { version?: unknown; checkedItemIds?: unknown; revision?: unknown } | undefined;
  if (topicId === VICTUALLING_CHECKLIST_PROGRESS_ID && (
    completed || pointsEarned !== 0 || victuallingPayload?.version !== VICTUALLING_PROGRESS_VERSION
    || !Array.isArray(victuallingPayload.checkedItemIds)
    || victuallingPayload.checkedItemIds.length > 18
    || victuallingPayload.checkedItemIds.some((id) => typeof id !== "string")
    || !Number.isSafeInteger(victuallingPayload.revision) || (victuallingPayload.revision as number) < 0
  )) throw new Error("Victualling checklist progress requires a valid revisioned snapshot");
  const enginePayload = answersHistory as { version?: unknown; catalogueId?: unknown; checkedItemIds?: unknown; revision?: unknown } | undefined;
  if (topicId === ENGINE_CHECKLIST_PROGRESS_ID && (
    completed || pointsEarned !== 0 || enginePayload?.version !== ENGINE_CHECKLIST_PROGRESS_VERSION
    || enginePayload?.catalogueId !== ENGINE_CHECKLIST_CATALOGUE_ID
    || !Array.isArray(enginePayload.checkedItemIds) || enginePayload.checkedItemIds.length > 10
    || enginePayload.checkedItemIds.some((id) => typeof id !== "string")
    || !Number.isSafeInteger(enginePayload.revision) || (enginePayload.revision as number) < 0
  )) throw new Error("Engine checklist progress requires a valid revisioned catalogue snapshot");
  const lightsPayload = answersHistory as { catalogueRevision?: unknown; completionState?: unknown; visitedSectionIds?: unknown } | undefined;
  const lightsEvidenceIds = ["part-c-recognition", "part-d-recognition", "distress-recognition"];
  const lightsEvidenceCount = Array.isArray(lightsPayload?.visitedSectionIds) ? new Set(lightsPayload.visitedSectionIds).size : 0;
  const passagePayload = answersHistory as { expectedServerHead?: unknown; passagePlanRecord?: { ownerId?: unknown; revision?: unknown; updatedAt?: unknown; lineage?: unknown; plan?: unknown } } | undefined;
  const passageRecord = passagePayload?.passagePlanRecord;
  const readinessPayload = answersHistory as { readinessRecord?: { version?: unknown; sessionId?: unknown; catalogueFingerprint?: unknown; context?: unknown; entries?: unknown; createdAt?: unknown; updatedAt?: unknown; expiresAt?: unknown } } | undefined;
  if (topicId === "passage-planning-checklist" && (
    readinessPayload?.readinessRecord?.version !== 2
    || typeof readinessPayload.readinessRecord.sessionId !== "string" || !readinessPayload.readinessRecord.sessionId.trim()
    || typeof readinessPayload.readinessRecord.catalogueFingerprint !== "string" || !readinessPayload.readinessRecord.catalogueFingerprint.trim()
    || !readinessPayload.readinessRecord.context || typeof readinessPayload.readinessRecord.context !== "object"
    || !readinessPayload.readinessRecord.entries || typeof readinessPayload.readinessRecord.entries !== "object"
    || typeof readinessPayload.readinessRecord.createdAt !== "string"
    || typeof readinessPayload.readinessRecord.updatedAt !== "string"
    || typeof readinessPayload.readinessRecord.expiresAt !== "string"
  )) throw new Error("Pre-departure readiness requires a valid evidence record");
  if (topicId === "passage-planning-builder" && (
    !passageRecord || passageRecord.ownerId !== userId
    || !Number.isSafeInteger(passageRecord.revision) || (passageRecord.revision as number) < 0
    || typeof passageRecord.updatedAt !== "string" || Number.isNaN(Date.parse(passageRecord.updatedAt))
    || !Array.isArray(passageRecord.lineage) || passageRecord.lineage.some(value => typeof value !== "string")
    || !(passagePayload?.expectedServerHead===null||typeof passagePayload?.expectedServerHead==="string")
    || !passageRecord.plan || typeof passageRecord.plan !== "object"
  )) throw new Error("Passage plan progress requires a valid owner-bound revisioned snapshot");
  if (topicId === "lights-theory" && (
    lightsPayload?.catalogueRevision !== "colregs-parts-c-d-annex-iv-v1"
    || !Array.isArray(lightsPayload.visitedSectionIds)
    || lightsPayload.visitedSectionIds.some((id) => typeof id !== "string" || !lightsEvidenceIds.includes(id))
    || new Set(lightsPayload.visitedSectionIds).size !== lightsPayload.visitedSectionIds.length
    || !["in_progress", "completed"].includes(String(lightsPayload.completionState))
    || completed !== (lightsPayload.completionState === "completed")
    || completed !== (lightsEvidenceCount === lightsEvidenceIds.length)
    || score !== Math.round((lightsEvidenceCount / lightsEvidenceIds.length) * 100)
  )) throw new Error("Lights theory progress requires valid revisioned evidence");
  const { data, error } = topicId === "quiz-nautical-terms-quiz"
    ? await supabaseClient.rpc("save_nautical_terms_quiz_progress", {
      p_completed: completed,
      p_score: score,
      p_answers_history: answersHistory ?? {},
    })
    : topicId === "anchorwork"
    ? await supabaseClient.rpc("save_anchorwork_progress", { p_completed_topic_ids: anchorworkIds as string[] })
    : topicId === "anchorwork-practice"
      ? await supabaseClient.rpc("save_anchorwork_practice_progress", {
        p_completed: completed,
        p_score: score,
        p_answers_history: answersHistory ?? {},
      })
    : topicId === VICTUALLING_CHECKLIST_PROGRESS_ID
      ? await supabaseClient.rpc("save_victualling_checklist_progress", {
        p_expected_revision: victuallingPayload?.revision as number,
        p_checked_item_ids: victuallingPayload?.checkedItemIds as string[],
      })
    : topicId === ENGINE_CHECKLIST_PROGRESS_ID
      ? await supabaseClient.rpc("save_engine_checklist_progress", {
        p_catalogue_id: enginePayload?.catalogueId as string,
        p_version: enginePayload?.version as number,
        p_expected_revision: enginePayload?.revision as number,
        p_checked_item_ids: enginePayload?.checkedItemIds as string[],
      })
    : topicId === "lights-theory"
      ? await supabaseClient.rpc("save_lights_theory_progress", {
        p_completed: completed,
        p_score: score,
        p_answers_history: lightsPayload as Record<string, unknown>,
      })
    : topicId === "passage-planning-builder"
      ? await supabaseClient.rpc("save_passage_plan_progress", {
        p_completed: completed,
        p_score: score,
        p_expected_updated_at: passagePayload?.expectedServerHead as string|null,
        p_answers_history: answersHistory as Record<string, unknown>,
      })
    : topicId === "passage-planning-checklist"
      ? await supabaseClient.rpc("save_readiness_record_progress_v2", {
        p_completed: completed,
        p_answers_history: answersHistory as Record<string, unknown>,
      })
      : await supabaseClient.rpc("save_topic_progress", {
      p_topic_id: topicId,
      p_completed: completed,
      p_score: score,
      p_points: pointsEarned,
      p_answers_history: answersHistory ?? null,
    });
  if (error) throw error;
  const outcome = Array.isArray(data) ? data[0] : data;
  if (!outcome) throw new Error("Progress RPC returned no outcome");
  if (
    typeof outcome.points_awarded !== "boolean"
    || typeof outcome.completion_awarded !== "boolean"
    || typeof outcome.awarded_points !== "number"
    || !Number.isFinite(outcome.awarded_points)
  ) {
    throw new Error("Progress RPC returned an invalid outcome");
  }

  return {
    pointsAwarded: outcome.points_awarded,
    completionAwarded: outcome.completion_awarded,
    awardedPoints: outcome.awarded_points,
  };
};

export const deleteProgressRecord = async ({ supabaseClient, userId, topicId }: DeleteProgressRecordArgs) => {
  const { error } = await supabaseClient.from("user_progress").delete().eq("user_id", userId).eq("topic_id", topicId);

  if (error) throw error;
};
