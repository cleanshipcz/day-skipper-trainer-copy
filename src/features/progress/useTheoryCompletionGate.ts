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
  const inProgressPersistedRef = useRef(false);
  const completionPromiseRef = useRef<Promise<boolean> | null>(null);
  const hydrationKeyRef = useRef<string | null>(null);
  const hydrationGenerationRef = useRef(0);
  const pendingSaveRef = useRef<{ generation: number; ids: string[] } | null>(null);
  const saveWorkerRef = useRef<{ generation: number; promise: Promise<void> } | null>(null);
  const localDurableRef = useRef(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "local" | "queued" | "failed">("idle");
  const storageKey = catalogueRevision ? `theory-gate:${ownerId ?? "anonymous"}:${topicId}:${catalogueRevision}` : null;

  const writeBrowserEvidence = useCallback((ids: readonly string[], completed = false) => {
    if (!storageKey) return true;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ catalogueRevision, visitedSectionIds: ids, completed }));
      localDurableRef.current = true;
      return true;
    } catch {
      localDurableRef.current = false;
      setSaveState("failed");
      return false;
    }
  }, [catalogueRevision, storageKey]);

  const enqueueInProgressSave = useCallback((ids: string[], generation = hydrationGenerationRef.current) => {
    pendingSaveRef.current = { generation, ids };
    if (saveWorkerRef.current?.generation === generation) return saveWorkerRef.current.promise;
    const worker = { generation, promise: Promise.resolve() };
    worker.promise = (async () => {
      while (pendingSaveRef.current?.generation === generation) {
        const snapshot = pendingSaveRef.current;
        pendingSaveRef.current = null;
        const score = deriveCompletionGateDecision({ visitedSectionIds: snapshot.ids, requiredSectionIds }).score;
        setSaveState("saving");
        const result = saveProgressDetailed
          ? await saveProgressDetailed(topicId, false, score, 0, { completionState: "in_progress", catalogueRevision, visitedSectionIds: snapshot.ids })
          : await saveProgress(topicId, false, score, 0, { completionState: "in_progress", catalogueRevision, visitedSectionIds: snapshot.ids });
        const ok = result !== false && result !== "failed" && result !== "conflict";
        setSaveState(result === "queued" ? "queued" : result === "anonymous" ? localDurableRef.current ? "local" : "failed" : ok ? "saved" : "failed");
      }
    })().finally(() => { if (saveWorkerRef.current === worker) saveWorkerRef.current = null; });
    saveWorkerRef.current = worker;
    return worker.promise;
  }, [catalogueRevision, requiredSectionIds, saveProgress, saveProgressDetailed, topicId]);

  useEffect(() => {
    if (!storageKey) return;
    const hydrationKey = `${ownerId ?? "anonymous"}:${topicId}:${catalogueRevision}`;
    if (hydrationKeyRef.current === hydrationKey) return;
    hydrationKeyRef.current = hydrationKey;
    visitedRef.current = [];
    setVisitedSectionIds([]);
    inProgressPersistedRef.current = false;
    const generation = ++hydrationGenerationRef.current;
    const restore = async () => {
      let restored: string[] = [];
      let locallyCompleted = false;
      try {
        const parsed = JSON.parse(localStorage.getItem(storageKey) ?? "null") as { visitedSectionIds?: unknown; completed?: unknown } | null;
        if (parsed && Array.isArray(parsed.visitedSectionIds)) restored = parsed.visitedSectionIds.filter((id): id is string => typeof id === "string" && requiredSectionIds.includes(id));
        locallyCompleted = parsed?.completed === true;
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
      inProgressPersistedRef.current = merged.length > 0;
      const completed = (locallyCompleted || remotelyCompleted) && merged.length === requiredSectionIds.length;
      const browserSaved = writeBrowserEvidence(merged, completed);
      if (completed) setSaveState(remotelyCompleted ? "saved" : browserSaved ? "local" : "failed");
      else if (merged.length > 0) await enqueueInProgressSave(merged, generation);
    };
    void restore();
  }, [catalogueRevision, enqueueInProgressSave, loadProgressDetailed, ownerId, requiredSectionIds, storageKey, topicId, writeBrowserEvidence]);

  const decision = useMemo(
    () => deriveCompletionGateDecision({ visitedSectionIds, requiredSectionIds }),
    [requiredSectionIds, visitedSectionIds]
  );

  const persistInProgressIfNeeded = useCallback(
    async (state: CompletionState, score: number, nextVisitedSectionIds: string[]) => {
      if (state !== "in_progress" || (!catalogueRevision && inProgressPersistedRef.current)) return;

      inProgressPersistedRef.current = true;
      if (catalogueRevision) await enqueueInProgressSave(nextVisitedSectionIds);
      else {
        const saved = await saveProgress(topicId, false, score, 0, { completionState: "in_progress", visitedSectionIds: nextVisitedSectionIds });
        if (saved === false) setSaveState("failed");
      }
    },
    [catalogueRevision, enqueueInProgressSave, saveProgress, topicId]
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
      await persistInProgressIfNeeded(nextDecision.state, nextDecision.score, nextVisitedSectionIds);
    },
    [persistInProgressIfNeeded, requiredSectionIds, writeBrowserEvidence]
  );

  const markCompleted = useCallback(async () => {
    if (!decision.canComplete) return false;
    if (completionPromiseRef.current) return completionPromiseRef.current;
    const attempt = (async () => {
      setSaveState("saving");
      try {
        // Revisioned evidence writes share one topic row/queue key with the
        // completion write. Drain them first so an older in-progress snapshot
        // can never overwrite a completed remote or queued snapshot.
        await saveWorkerRef.current?.promise;
        const history = { completionState: "completed", catalogueRevision, visitedSectionIds: visitedRef.current };
        const result = catalogueRevision && saveProgressDetailed
          ? await saveProgressDetailed(topicId, true, 100, pointsOnComplete, history)
          : await saveProgress(topicId, true, 100, pointsOnComplete, history);
        // Legacy saveProgress mocks/consumers historically resolved void on success.
        let ok = result !== false && result !== "failed" && result !== "conflict";
        if (result === "anonymous") ok = writeBrowserEvidence(visitedRef.current, true);
        setSaveState(result === "queued" ? "queued" : result === "anonymous" ? ok ? "local" : "failed" : ok ? "saved" : "failed");
        return ok;
      } catch {
        setSaveState("failed");
        return false;
      } finally { completionPromiseRef.current = null; }
    })();
    completionPromiseRef.current = attempt;
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
