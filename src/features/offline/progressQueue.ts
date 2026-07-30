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
  attempts: number;
  status: "pending" | "quarantined";
  lastError?: string;
}

type ProgressPayload = Omit<QueuedProgress, "id" | "updatedAt" | "attempts" | "status" | "lastError">;

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
  return /(?:failed to fetch|network(?: request)?|offline|timeout|timed out|connection reset)/i.test(errorMessage(error));
};

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const complete = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });

export const queueProgress = async (
  progress: ProgressPayload,
  updatedAt = Date.now(),
): Promise<QueuedProgress> => {
  const entry = {
    ...progress,
    id: `${progress.userId}:${progress.topicId}`,
    updatedAt,
    attempts: 0,
    status: "pending" as const,
  };
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).put(entry);
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
    request.onerror = () => reject(request.error);
  });
  await complete(transaction);
  database.close();
  return entries
    .filter((entry) => !userId || entry.userId === userId)
    .map((entry) => ({ ...entry, attempts: entry.attempts ?? 0, status: entry.status ?? "pending" }))
    .sort((a, b) => a.updatedAt - b.updatedAt);
};

const removeQueuedProgress = async (id: string): Promise<void> => {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).delete(id);
  await complete(transaction);
  database.close();
};

const updateQueuedProgress = async (entry: QueuedProgress): Promise<void> => {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).put(entry);
  await complete(transaction);
  database.close();
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
      await removeQueuedProgress(entry.id);
      synced += 1;
    } catch (error) {
      await updateQueuedProgress({
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
