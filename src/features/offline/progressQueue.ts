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
}

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
  progress: Omit<QueuedProgress, "id" | "updatedAt">,
  updatedAt = Date.now(),
): Promise<QueuedProgress> => {
  const entry = {
    ...progress,
    id: `${progress.userId}:${progress.topicId}`,
    updatedAt,
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
    .sort((a, b) => a.updatedAt - b.updatedAt);
};

const removeQueuedProgress = async (id: string): Promise<void> => {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).delete(id);
  await complete(transaction);
  database.close();
};

export const replayProgressQueue = async (
  supabaseClient: SupabaseClient,
  userId: string,
): Promise<{ synced: number; remaining: number }> => {
  const entries = await getQueuedProgress(userId);
  let synced = 0;
  for (const entry of entries) {
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
  }
  return { synced, remaining: entries.length - synced };
};
