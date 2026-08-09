import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProgress } from "@/hooks/useProgress";
import { deriveCompletionGateDecision, type CompletionState } from "./completionGates";

interface UseTheoryCompletionGateArgs {
  topicId: string;
  requiredSectionIds: string[];
  pointsOnComplete?: number;
  catalogueRevision?: string;
}

export const useTheoryCompletionGate = ({
  topicId,
  requiredSectionIds,
  pointsOnComplete = 10,
  catalogueRevision,
}: UseTheoryCompletionGateArgs) => {
  const progress = useProgress();
  const { loadProgressDetailed, saveProgress, saveProgressDetailed } = progress;
  const ownerId = "ownerId" in progress ? progress.ownerId : null;
  const [visitedSectionIds, setVisitedSectionIds] = useState<string[]>([]);
  const visitedRef = useRef<readonly string[]>(visitedSectionIds);
  const completionPromiseRef = useRef<{ generation: number; promise: Promise<boolean> } | null>(null);
  const hydrationKeyRef = useRef<string | null>(null);
  const hydrationGenerationRef = useRef(0);
  const pendingSaveRef = useRef<{ generation: number; ids: string[] } | null>(null);
  const saveWorkerRef = useRef<{ generation: number; promise: Promise<"failed" | void> } | null>(null);
  const localDurableRef = useRef(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "local" | "queued" | "failed">("idle");
  const storageKey = catalogueRevision ? `theory-gate:${ownerId ?? "anonymous"}:${topicId}:${catalogueRevision}` : null;
  const completionStorageKey = storageKey ? `${storageKey}:completion` : null;

  const writeBrowserEvidence = useCallback((ids: readonly string[], completed = false, completionOutcome?: "saved" | "queued" | "local") => {
    if (!storageKey) return true;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ catalogueRevision, visitedSectionIds: ids, completed, completionOutcome }));
      if (completed && completionStorageKey) {
        // Separate monotonic marker: incomplete writes from another tab never
        // touch this key, so they cannot race a durable completion backwards.
        localStorage.setItem(completionStorageKey, JSON.stringify({ catalogueRevision, visitedSectionIds: ids, completionOutcome }));
      }
      localDurableRef.current = true;
      return true;
    } catch {
      localDurableRef.current = false;
      setSaveState("failed");
      return false;
    }
  }, [catalogueRevision, completionStorageKey, storageKey]);

  const enqueueInProgressSave = useCallback((ids: string[], generation = hydrationGenerationRef.current) => {
    pendingSaveRef.current = { generation, ids };
    if (saveWorkerRef.current?.generation === generation) return saveWorkerRef.current.promise;
    const worker: { generation: number; promise: Promise<"failed" | void> } = { generation, promise: Promise.resolve() };
    worker.promise = (async (): Promise<"failed" | void> => {
      let outcome: "failed" | "saved" | "queued" | "local" = "saved";
      while (pendingSaveRef.current?.generation === generation) {
        const snapshot = pendingSaveRef.current;
        pendingSaveRef.current = null;
        const score = deriveCompletionGateDecision({ visitedSectionIds: snapshot.ids, requiredSectionIds }).score;
        if (hydrationGenerationRef.current === generation) setSaveState("saving");
        let result;
        try {
          const history = catalogueRevision
            ? { completionState: "in_progress", catalogueRevision, visitedSectionIds: snapshot.ids }
            : { completionState: "in_progress", visitedSectionIds: snapshot.ids };
          result = catalogueRevision && saveProgressDetailed
            ? await saveProgressDetailed(topicId, false, score, 0, history)
            : await saveProgress(topicId, false, score, 0, history);
        } catch {
          outcome = "failed";
          if (hydrationGenerationRef.current === generation) setSaveState("failed");
          continue;
        }
        const ok = result !== false && result !== "failed" && result !== "conflict";
        outcome = result === "queued" ? "queued" : result === "anonymous" ? localDurableRef.current ? "local" : "failed" : ok ? "saved" : "failed";
        if (hydrationGenerationRef.current === generation) setSaveState(outcome);
      }
      if (outcome === "failed") return "failed";
    })().finally(() => { if (saveWorkerRef.current === worker) saveWorkerRef.current = null; });
    saveWorkerRef.current = worker;
    return worker.promise;
  }, [catalogueRevision, requiredSectionIds, saveProgress, saveProgressDetailed, topicId]);

  useEffect(() => {
    const hydrationKey = `${ownerId ?? "anonymous"}:${topicId}:${catalogueRevision ?? "legacy"}`;
    if (hydrationKeyRef.current === hydrationKey) return;
    hydrationKeyRef.current = hydrationKey;
    const generation = ++hydrationGenerationRef.current;
    pendingSaveRef.current = null;
    saveWorkerRef.current = null;
    completionPromiseRef.current = null;
    visitedRef.current = [];
    setVisitedSectionIds([]);
    setSaveState("idle");
    if (!storageKey) return;
    const restore = async () => {
      let restored: string[] = [];
      let locallyCompleted = false;
      let localCompletionOutcome: "saved" | "queued" | "local" | undefined;
      try {
        const parsed = JSON.parse(localStorage.getItem(storageKey) ?? "null") as { visitedSectionIds?: unknown; completed?: unknown; completionOutcome?: unknown } | null;
        if (parsed && Array.isArray(parsed.visitedSectionIds)) restored = parsed.visitedSectionIds.filter((id): id is string => typeof id === "string" && requiredSectionIds.includes(id));
        locallyCompleted = parsed?.completed === true;
        if (parsed?.completionOutcome === "saved" || parsed?.completionOutcome === "queued" || parsed?.completionOutcome === "local") localCompletionOutcome = parsed.completionOutcome;
        const marker = completionStorageKey
          ? JSON.parse(localStorage.getItem(completionStorageKey) ?? "null") as { catalogueRevision?: unknown; visitedSectionIds?: unknown; completionOutcome?: unknown } | null
          : null;
        if (marker?.catalogueRevision === catalogueRevision && Array.isArray(marker.visitedSectionIds)) {
          const markerIds = marker.visitedSectionIds.filter((id): id is string => typeof id === "string" && requiredSectionIds.includes(id));
          if (requiredSectionIds.every((id) => markerIds.includes(id))) {
            locallyCompleted = true;
            restored = [...new Set([...restored, ...markerIds])];
            if (marker.completionOutcome === "saved" || marker.completionOutcome === "queued" || marker.completionOutcome === "local") localCompletionOutcome = marker.completionOutcome;
          }
        }
      } catch { /* Ignore corrupt legacy browser state. */ }
      const load = loadProgressDetailed ? await loadProgressDetailed(topicId) : null;
      const remoteHistory = load?.status === "remote" ? load.record.answers_history as { catalogueRevision?: string; visitedSectionIds?: unknown } | null : null;
      const remotelyCompleted = load?.status === "remote" && load.record.completed === true && remoteHistory?.catalogueRevision === catalogueRevision;
      if (remoteHistory?.catalogueRevision === catalogueRevision && Array.isArray(remoteHistory.visitedSectionIds)) {
        restored = [...new Set([...restored, ...remoteHistory.visitedSectionIds.filter((id): id is string => typeof id === "string" && requiredSectionIds.includes(id))])];
      }
      if (hydrationGenerationRef.current !== generation) return;
      const merged = [...new Set([...restored, ...visitedRef.current])];
      visitedRef.current = merged;
      setVisitedSectionIds(merged);
      const completed = (locallyCompleted || remotelyCompleted) && merged.length === requiredSectionIds.length;
      const outcome = remotelyCompleted ? "saved" : localCompletionOutcome ?? "local";
      const browserSaved = writeBrowserEvidence(merged, completed, completed ? outcome : undefined);
      if (completed) setSaveState(browserSaved ? outcome : remotelyCompleted ? "saved" : "failed");
      else if (merged.length > 0) await enqueueInProgressSave(merged, generation);
    };
    void restore();
  }, [catalogueRevision, completionStorageKey, enqueueInProgressSave, loadProgressDetailed, ownerId, requiredSectionIds, storageKey, topicId, writeBrowserEvidence]);

  const decision = useMemo(
    () => deriveCompletionGateDecision({ visitedSectionIds, requiredSectionIds }),
    [requiredSectionIds, visitedSectionIds]
  );

  const persistInProgressIfNeeded = useCallback(
    async (state: CompletionState, score: number, nextVisitedSectionIds: string[]) => {
      if (state !== "in_progress") return;
      return enqueueInProgressSave(nextVisitedSectionIds);
    },
    [enqueueInProgressSave]
  );

  const markSectionVisited = useCallback(
    async (sectionId: string) => {
      if (!sectionId || !requiredSectionIds.includes(sectionId)) return;

      /**
       * Read the latest visited list from a ref rather than relying on
       * side-effects inside a setState updater (which is not guaranteed
       * to execute synchronously under React 18 concurrent features).
       * The ref is updated immediately so rapid/batched calls each see
       * the previous call's result without waiting for a re-render.
       */
      const prev = visitedRef.current;
      if (prev.includes(sectionId)) return;

      const nextVisitedSectionIds = [...prev, sectionId];
      visitedRef.current = nextVisitedSectionIds;
      setVisitedSectionIds(nextVisitedSectionIds);
      writeBrowserEvidence(nextVisitedSectionIds);

      const nextDecision = deriveCompletionGateDecision({
        visitedSectionIds: nextVisitedSectionIds,
        requiredSectionIds,
      });
      return persistInProgressIfNeeded(nextDecision.state, nextDecision.score, nextVisitedSectionIds);
    },
    [persistInProgressIfNeeded, requiredSectionIds, writeBrowserEvidence]
  );

  const markCompleted = useCallback(async () => {
    if (!decision.canComplete) return false;
    const generation = hydrationGenerationRef.current;
    if (completionPromiseRef.current?.generation === generation) return completionPromiseRef.current.promise;
    const operation: { generation: number; promise: Promise<boolean> } = { generation, promise: Promise.resolve(false) };
    const attempt = (async () => {
      if (hydrationGenerationRef.current !== generation) return false;
      setSaveState("saving");
      try {
        // Revisioned evidence writes share one topic row/queue key with the
        // completion write. Drain them first so an older in-progress snapshot
        // can never overwrite a completed remote or queued snapshot.
        await saveWorkerRef.current?.promise;
        if (hydrationGenerationRef.current !== generation) return false;
        const history = { completionState: "completed", catalogueRevision, visitedSectionIds: visitedRef.current };
        const result = catalogueRevision && saveProgressDetailed
          ? await saveProgressDetailed(topicId, true, 100, pointsOnComplete, history)
          : await saveProgress(topicId, true, 100, pointsOnComplete, history);
        if (hydrationGenerationRef.current !== generation) return false;
        // Legacy saveProgress mocks/consumers historically resolved void on success.
        let ok = result !== false && result !== "failed" && result !== "conflict";
        if (result === "anonymous") ok = writeBrowserEvidence(visitedRef.current, true, "local");
        else if (result === "queued") ok = writeBrowserEvidence(visitedRef.current, true, "queued");
        else if (ok) writeBrowserEvidence(visitedRef.current, true, "saved");
        setSaveState(result === "queued" ? "queued" : result === "anonymous" ? ok ? "local" : "failed" : ok ? "saved" : "failed");
        return ok;
      } catch {
        if (hydrationGenerationRef.current === generation) setSaveState("failed");
        return false;
      } finally { if (completionPromiseRef.current === operation) completionPromiseRef.current = null; }
    })();
    operation.promise = attempt;
    completionPromiseRef.current = operation;
    return attempt;
  }, [catalogueRevision, decision.canComplete, pointsOnComplete, saveProgress, saveProgressDetailed, topicId, writeBrowserEvidence]);

  return {
    completionState: decision.state,
    score: decision.score,
    canComplete: decision.canComplete,
    visitedSectionIds,
    markSectionVisited,
    markCompleted,
    saveState,
  };
};
