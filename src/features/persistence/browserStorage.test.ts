import { describe, expect, it } from "vitest";
import {
  clearOwnerPersistence, ownerStorageKey, readStored, removeStored, writeStored,
  type StorageCodec,
} from "./browserStorage";

const codec: StorageCodec<{ version: 1; value: string }> = {
  version: 1,
  decode(value) {
    const candidate = value as { version?: unknown; value?: unknown } | null;
    return candidate?.version === 1 && typeof candidate.value === "string"
      ? { version: 1, value: candidate.value }
      : null;
  },
};

describe("browser persistence boundary", () => {
  it("validates versions and fails closed for corrupt or obsolete records", () => {
    localStorage.setItem("record", JSON.stringify({ version: 1, value: "safe" }));
    expect(readStored(localStorage, "record", codec)?.value).toBe("safe");
    localStorage.setItem("record", JSON.stringify({ version: 0, value: "old" }));
    expect(readStored(localStorage, "record", codec)).toBeNull();
    localStorage.setItem("record", "{bad");
    expect(readStored(localStorage, "record", codec)).toBeNull();
    localStorage.setItem("legacy-string", "legacy-id");
    expect(readStored(localStorage, "legacy-string", {
      version: 1,
      decode: (value) => typeof value === "string" ? value : null,
    })).toBe("legacy-id");
  });

  it("defines unavailable, quota, write, and removal behavior", () => {
    const unavailable = { getItem: () => { throw new DOMException("blocked", "SecurityError"); } } as Storage;
    expect(readStored(unavailable, "key", codec)).toBeNull();
    expect(writeStored(undefined, "key", {})).toEqual({ ok: false, reason: "unavailable" });
    const quota = { setItem: () => { throw new DOMException("full", "QuotaExceededError"); } } as Storage;
    expect(writeStored(quota, "key", {})).toEqual({ ok: false, reason: "quota" });
    expect(writeStored(localStorage, "key", { value: 1 })).toEqual({ ok: true });
    expect(removeStored(localStorage, "key")).toBe(true);
    expect(removeStored(undefined, "key")).toBe(false);
  });

  it("cleans only the switching owner's records across workflows", () => {
    localStorage.setItem(ownerStorageKey("quiz-attempt", "a", "weather"), "{}");
    localStorage.setItem(ownerStorageKey("engagement-outbox", "a"), "[]");
    localStorage.setItem(ownerStorageKey("day-skipper-passage-plan", "a"), "{}");
    localStorage.setItem(ownerStorageKey("quiz-attempt", "b", "weather"), "{}");
    sessionStorage.setItem("day-skipper-exam-session-v1", JSON.stringify({ ownerId: "a" }));

    clearOwnerPersistence("a");

    expect(localStorage.getItem("quiz-attempt:a:weather")).toBeNull();
    expect(localStorage.getItem("engagement-outbox:a")).toBeNull();
    expect(localStorage.getItem("day-skipper-passage-plan:a")).toBeNull();
    expect(localStorage.getItem("quiz-attempt:b:weather")).toBe("{}");
    expect(sessionStorage.getItem("day-skipper-exam-session-v1")).toBeNull();
  });
});
