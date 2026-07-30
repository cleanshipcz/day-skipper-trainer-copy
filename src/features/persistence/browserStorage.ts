export interface StorageCodec<T> {
  readonly version: number;
  decode(value: unknown): T | null;
}

export interface StorageWriteResult {
  readonly ok: boolean;
  readonly reason?: "unavailable" | "quota";
}

const storageAvailable = (storage: Storage | undefined): storage is Storage =>
  storage !== undefined && storage !== null;

export const readStored = <T>(storage: Storage | undefined, key: string, codec: StorageCodec<T>): T | null => {
  if (!storageAvailable(storage)) return null;
  try {
    const raw = storage.getItem(key);
    if (raw === null) return null;
    try {
      return codec.decode(JSON.parse(raw));
    } catch {
      // Legacy primitive records were stored without JSON encoding.
      return codec.decode(raw);
    }
  } catch {
    return null;
  }
};

export const writeStored = (
  storage: Storage | undefined,
  key: string,
  value: unknown,
): StorageWriteResult => {
  if (!storageAvailable(storage)) return { ok: false, reason: "unavailable" };
  try {
    storage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof DOMException && error.name === "QuotaExceededError" ? "quota" : "unavailable",
    };
  }
};

export const removeStored = (storage: Storage | undefined, key: string): boolean => {
  if (!storageAvailable(storage)) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

export const ownerStorageKey = (namespace: string, owner: string, suffix?: string) =>
  `${namespace}:${owner}${suffix ? `:${suffix}` : ""}`;

export const clearOwnerPersistence = (
  owner: string,
  local: Storage | undefined = globalThis.localStorage,
  session: Storage | undefined = globalThis.sessionStorage,
): void => {
  const localPrefixes = [
    ownerStorageKey("engagement-outbox", owner),
    ownerStorageKey("quiz-attempt", owner),
    ownerStorageKey("day-skipper-passage-plan", owner),
  ];
  if (storageAvailable(local)) {
    try {
      for (let index = local.length - 1; index >= 0; index -= 1) {
        const key = local.key(index);
        if (key && localPrefixes.some((prefix) => key === prefix || key.startsWith(`${prefix}:`))) {
          local.removeItem(key);
        }
      }
    } catch {
      // Cleanup is best-effort when browser storage is disabled.
    }
  }
  if (storageAvailable(session)) {
    try {
      const key = "day-skipper-exam-session-v1";
      const value = JSON.parse(session.getItem(key) ?? "null") as { ownerId?: unknown } | null;
      if (value?.ownerId === owner) session.removeItem(key);
    } catch {
      // Corrupt or unavailable session storage cannot expose another owner's data.
    }
  }
};
