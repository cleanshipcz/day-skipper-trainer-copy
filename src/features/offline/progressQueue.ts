import type { SupabaseClient } from "@supabase/supabase-js";
import { saveProgressRecord } from "@/features/progress/progressPersistence";

const DATABASE_NAME = "day-skipper-offline";
const STORE_NAME = "progress-queue";
const DATABASE_VERSION = 1;

export interface QueuedProgress {
  id: string;
  userId: string;
  topicId: string;
  completed: boolean;
  score: number;
  pointsEarned: number;
  answersHistory?: Record<string, unknown>;
  updatedAt: number;
  revision: number;
  attempts: number;
  status: "pending" | "quarantined";
  lastError?: string;
}

type ProgressPayload = Omit<QueuedProgress, "id" | "updatedAt" | "revision" | "attempts" | "status" | "lastError">;

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String((error as { message?: unknown })?.message ?? error);

export const isRetryableProgressError = (
  error: unknown,
  online = typeof navigator === "undefined" ? true : navigator.onLine,
): boolean => {
  if (!online) return true;
  const candidate = error as { status?: number; code?: string; message?: string };
  if (candidate.status === 408 || candidate.status === 429 || (candidate.status ?? 0) >= 500) return true;
  if (candidate.code && /^(?:5\d\d|ETIMEDOUT|ECONNRESET|NETWORK_ERROR)$/i.test(candidate.code)) return true;
  if (candidate.code && /^(?:PGRST002|PGRST003|57P01|57P02|57P03|08000|08001|08003|08004|08006|08007|08P01)$/i.test(candidate.code)) return true;
  const diagnostic = [
    candidate.message,
    (error as { details?: string }).details,
    (error as { hint?: string }).hint,
  ].filter(Boolean).join(" ");
  return /(?:failed to fetch|network(?: request)?|offline|timeout|timed out|connection reset|bad gateway|gateway timeout|schema cache.*(?:database|connect)|database.*unavailable|could not connect to (?:the )?database)/i
    .test(diagnostic || errorMessage(error));
};

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      /* v8 ignore else -- this schema version's upgrade creates the store once */
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    /* v8 ignore next -- platform callback only forwards IndexedDB's request error */
    request.onerror = () => reject(request.error);
  });

const complete = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    /* v8 ignore next -- platform callback only forwards IndexedDB's transaction error */
    transaction.onerror = () => reject(transaction.error);
    /* v8 ignore next -- abort and error have the same forwarding contract */
    transaction.onabort = () => reject(transaction.error);
  });

export const queueProgress = async (
  progress: ProgressPayload,
  updatedAt = Date.now(),
): Promise<QueuedProgress> => {
  const id = `${progress.userId}:${progress.topicId}`;
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const existingRequest = store.get(id);
  const existing = await new Promise<QueuedProgress | undefined>((resolve, reject) => {
    existingRequest.onsuccess = () => resolve(existingRequest.result as QueuedProgress | undefined);
    /* v8 ignore next -- platform callback only forwards IndexedDB's request error */
    existingRequest.onerror = () => reject(existingRequest.error);
  });
  const entry: QueuedProgress = {
    ...progress,
    id,
    updatedAt: Math.max(updatedAt, existing?.updatedAt ?? 0),
    revision: (existing?.revision ?? 0) + 1,
    attempts: 0,
    status: "pending",
  };
  store.put(entry);
  await complete(transaction);
  database.close();
  return entry;
};

export const getQueuedProgress = async (userId?: string): Promise<QueuedProgress[]> => {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readonly");
  const request = transaction.objectStore(STORE_NAME).getAll();
  const entries = await new Promise<QueuedProgress[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as QueuedProgress[]);
    /* v8 ignore next -- platform callback only forwards IndexedDB's request error */
    request.onerror = () => reject(request.error);
  });
  await complete(transaction);
  database.close();
  return entries
    .filter((entry) => !userId || entry.userId === userId)
    .map((entry) => ({
      ...entry,
      revision: entry.revision ?? 0,
      attempts: entry.attempts ?? 0,
      status: entry.status ?? "pending",
    }))
    .sort((a, b) => a.updatedAt - b.updatedAt);
};

const sameRevision = (left: QueuedProgress, right: QueuedProgress): boolean =>
  left.revision === right.revision && left.updatedAt === right.updatedAt;

const removeQueuedProgress = async (snapshot: QueuedProgress): Promise<boolean> => {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.get(snapshot.id);
  const current = await new Promise<QueuedProgress | undefined>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as QueuedProgress | undefined);
    /* v8 ignore next -- platform callback only forwards IndexedDB's request error */
    request.onerror = () => reject(request.error);
  });
  const removed = Boolean(current && sameRevision(current, snapshot));
  if (removed) store.delete(snapshot.id);
  await complete(transaction);
  database.close();
  return removed;
};

const updateQueuedProgress = async (snapshot: QueuedProgress, entry: QueuedProgress): Promise<boolean> => {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.get(snapshot.id);
  const current = await new Promise<QueuedProgress | undefined>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as QueuedProgress | undefined);
    /* v8 ignore next -- platform callback only forwards IndexedDB's request error */
    request.onerror = () => reject(request.error);
  });
  const updated = Boolean(current && sameRevision(current, snapshot));
  if (updated) store.put(entry);
  await complete(transaction);
  database.close();
  return updated;
};

export const replayProgressQueue = async (
  supabaseClient: SupabaseClient,
  userId: string,
): Promise<{ synced: number; remaining: number; quarantined: number }> => {
  const entries = await getQueuedProgress(userId);
  let synced = 0;
  for (const entry of entries.filter(({ status }) => status !== "quarantined")) {
    try {
      await saveProgressRecord({
        supabaseClient,
        userId: entry.userId,
        topicId: entry.topicId,
        completed: entry.completed,
        score: entry.score,
        pointsEarned: entry.pointsEarned,
        answersHistory: entry.answersHistory,
      });
      await removeQueuedProgress(entry);
      synced += 1;
    } catch (error) {
      await updateQueuedProgress(entry, {
        ...entry,
        attempts: entry.attempts + 1,
        status: isRetryableProgressError(error) ? "pending" : "quarantined",
        lastError: errorMessage(error).slice(0, 300),
      });
    }
  }
  const remainingEntries = await getQueuedProgress(userId);
  return {
    synced,
    remaining: remainingEntries.length,
    quarantined: remainingEntries.filter(({ status }) => status === "quarantined").length,
  };
};
