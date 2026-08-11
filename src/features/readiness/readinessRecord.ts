import type { ChecklistItem } from "@/data/preDepartureChecklist";

export type ReadinessStatus =
  | "not_checked"
  | "satisfactory"
  | "not_applicable"
  | "defect"
  | "blocked"
  | "unknown";

export interface ReadinessEntry {
  status: ReadinessStatus;
  reason: string;
  notes: string;
  evidence: string;
  responsiblePerson: string;
  recordedAt?: string;
  history: ReadinessHistoryEntry[];
}

export interface ReadinessHistoryEntry {
  status: ReadinessStatus;
  reason: string;
  notes: string;
  evidence: string;
  responsiblePerson: string;
  recordedAt?: string;
  supersededAt: string;
}

export type ReadinessEntries = Record<string, ReadinessEntry>;

export const READINESS_RECORD_VERSION = 2 as const;
export const READINESS_RETENTION_DAYS = 30;

export interface CatalogueValidation {
  valid: boolean;
  diagnostics: string[];
  fingerprint: string;
}

export const validateReadinessCatalogue = (items: readonly ChecklistItem[]): CatalogueValidation => {
  const diagnostics: string[] = [];
  if (items.length === 0) diagnostics.push("The readiness catalogue is empty.");
  const seen = new Set<string>();
  items.forEach((item, index) => {
    const id = typeof item.id === "string" ? item.id.trim() : "";
    if (!id) diagnostics.push(`Item ${index + 1} has no stable ID.`);
    else if (seen.has(id)) diagnostics.push(`Duplicate readiness item ID: ${id}.`);
    else seen.add(id);
    if (!item.label?.trim()) diagnostics.push(`Item ${id || index + 1} has no usable label.`);
    if (!item.why?.trim()) diagnostics.push(`Item ${id || index + 1} has no usable rationale.`);
    if (!item.phase || !Number.isInteger((item as ChecklistItem & { order?: number }).order ?? index)) diagnostics.push(`Item ${id || index + 1} has invalid ordering data.`);
    for (const dependency of item.dependsOn ?? []) if (!dependency.trim() || dependency === id) diagnostics.push(`Item ${id || index + 1} has an invalid dependency.`);
  });
  items.forEach((item) => (item.dependsOn ?? []).forEach((dependency) => {
    if (!seen.has(dependency)) diagnostics.push(`Item ${item.id} depends on missing item ${dependency}.`);
  }));
  const source = items.map((item, index) => `${index}:${item.id}:${item.phase}:${item.label}:${item.notApplicableAllowed === true}:${(item.dependsOn ?? []).join(",")}`).join("|");
  let hash = 2166136261;
  for (let i = 0; i < source.length; i += 1) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619);
  return { valid: diagnostics.length === 0, diagnostics, fingerprint: `fnv1a-${(hash >>> 0).toString(16)}` };
};

export const readinessStatusLabels: Record<ReadinessStatus, string> = {
  not_checked: "Not checked",
  satisfactory: "Satisfactory",
  not_applicable: "Not applicable",
  defect: "Defect",
  blocked: "Blocked",
  unknown: "Unknown",
};

export const emptyReadinessEntry = (): ReadinessEntry => ({
  status: "not_checked",
  reason: "",
  notes: "",
  evidence: "",
  responsiblePerson: "",
  history: [],
});

export const isResolved = (entry: ReadinessEntry | undefined) =>
  entry?.status === "satisfactory" ||
  (entry?.status === "not_applicable" && entry.reason.trim().length > 0);

export const isBlockingStatus = (status: ReadinessStatus) =>
  status === "defect" || status === "blocked" || status === "unknown";

export const canSelectStatus = (item: ChecklistItem, status: ReadinessStatus) =>
  status !== "not_applicable" || item.notApplicableAllowed === true;

export const transitionEntry = (
  current: ReadinessEntry | undefined,
  status: ReadinessStatus,
  recordedAt: string,
): ReadinessEntry => ({
  ...(current ?? emptyReadinessEntry()),
  status,
  reason: status === "not_applicable" ? current?.reason ?? "" : "",
  recordedAt: status === "not_checked" ? undefined : recordedAt,
  history: current && current.status !== "not_checked"
    ? [...current.history, {
      status: current.status,
      reason: current.reason,
      notes: current.notes,
      evidence: current.evidence,
      responsiblePerson: current.responsiblePerson,
      recordedAt: current.recordedAt,
      supersededAt: recordedAt,
    }]
    : current?.history ?? [],
});

export interface ReadinessRecordPayload {
  version: typeof READINESS_RECORD_VERSION;
  sessionId: string;
  catalogueFingerprint: string;
  context: { vessel: string; voyage: string; conditions: string };
  entries: ReadinessEntries;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  completedAt?: string;
}

export const createReadinessSession = (now = new Date()): ReadinessRecordPayload => ({
  version: READINESS_RECORD_VERSION,
  sessionId: globalThis.crypto?.randomUUID?.() ?? `readiness-${now.getTime()}-${Math.random().toString(36).slice(2)}`,
  catalogueFingerprint: "",
  context: { vessel: "", voyage: "", conditions: "" },
  entries: {},
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
  expiresAt: new Date(now.getTime() + READINESS_RETENTION_DAYS * 86_400_000).toISOString(),
});

export const isReadinessContextComplete = (context: ReadinessRecordPayload["context"]) =>
  context.vessel.trim().length > 0 && context.voyage.trim().length > 0 && context.conditions.trim().length > 0;

const isString = (value: unknown): value is string => typeof value === "string";
const isStatus = (value: unknown): value is ReadinessStatus => isString(value) && value in readinessStatusLabels;
const isTimestamp = (value: unknown): value is string => isString(value) && !Number.isNaN(Date.parse(value));
const parseHistory = (value: unknown): ReadinessHistoryEntry[] => Array.isArray(value) ? value.filter((candidate): candidate is ReadinessHistoryEntry => {
  if (!candidate || typeof candidate !== "object") return false;
  const item = candidate as Partial<ReadinessHistoryEntry>;
  return isStatus(item.status) && item.status !== "not_checked" && isString(item.reason) && isString(item.notes) && isString(item.evidence)
    && isString(item.responsiblePerson) && isTimestamp(item.supersededAt) && isTimestamp(item.recordedAt);
}) : [];

export type ReadinessParseResult = { status: "valid"; payload: ReadinessRecordPayload } | { status: "invalid" | "expired" | "catalogue_changed" | "legacy"; diagnostic: string };

export const parseReadinessSession = (value: unknown, items: readonly ChecklistItem[], now = new Date()): ReadinessParseResult => {
  const catalogue = validateReadinessCatalogue(items);
  if (!catalogue.valid) return { status: "invalid", diagnostic: catalogue.diagnostics.join(" ") };
  if (!value || typeof value !== "object") return { status: "invalid", diagnostic: "No usable readiness session was found." };
  const candidate = value as Partial<ReadinessRecordPayload>;
  if ((candidate as { version?: unknown }).version === 1) return { status: "legacy", diagnostic: "A legacy readiness draft was found. Start a new session so current catalogue requirements are reassessed." };
  if (candidate.version !== READINESS_RECORD_VERSION || !isString(candidate.sessionId) || !candidate.sessionId.trim() || !isString(candidate.catalogueFingerprint) || !candidate.context || typeof candidate.context !== "object" || !candidate.entries || typeof candidate.entries !== "object" || !isTimestamp(candidate.createdAt) || !isTimestamp(candidate.updatedAt) || !isTimestamp(candidate.expiresAt) || (candidate.completedAt !== undefined && !isTimestamp(candidate.completedAt))) return { status: "invalid", diagnostic: "Saved readiness data is malformed or incomplete and was not used." };
  if (Date.parse(candidate.expiresAt) <= now.getTime()) return { status: "expired", diagnostic: "The saved readiness session has expired and was not used." };
  if (candidate.catalogueFingerprint !== catalogue.fingerprint) return { status: "catalogue_changed", diagnostic: "The readiness catalogue changed. Prior decisions were invalidated; start a new session and reassess every current item." };
  const context = candidate.context as ReadinessRecordPayload["context"];
  if (![context.vessel, context.voyage, context.conditions].every(isString)) return null;
  const byId = new Map(items.map((item) => [item.id, item]));
  const entries: ReadinessEntries = {};
  for (const [id, raw] of Object.entries(candidate.entries)) {
    const item = byId.get(id);
    if (!item || !raw || typeof raw !== "object") continue;
    const entry = raw as Partial<ReadinessEntry>;
    if (!isStatus(entry.status) || !isString(entry.reason) || !isString(entry.notes) || !isString(entry.evidence) || !isString(entry.responsiblePerson) || (entry.status !== "not_checked" && !isTimestamp(entry.recordedAt)) || (entry.status === "not_checked" && entry.recordedAt !== undefined)) continue;
    if (!canSelectStatus(item, entry.status)) continue;
    entries[id] = { status: entry.status, reason: entry.reason, notes: entry.notes, evidence: entry.evidence, responsiblePerson: entry.responsiblePerson, recordedAt: entry.recordedAt, history: parseHistory(entry.history) };
  }
  if (Object.keys(entries).length !== Object.keys(candidate.entries).length) return { status: "invalid", diagnostic: "One or more saved readiness entries were malformed and the session was not used." };
  return { status: "valid", payload: { version: READINESS_RECORD_VERSION, sessionId: candidate.sessionId, catalogueFingerprint: candidate.catalogueFingerprint, context: { ...context }, entries, createdAt: candidate.createdAt, updatedAt: candidate.updatedAt, expiresAt: candidate.expiresAt, completedAt: candidate.completedAt } };
};

export const parseReadinessPayload = (value: unknown, items: readonly ChecklistItem[]): ReadinessRecordPayload | null => {
  const parsed = parseReadinessSession(value, items);
  return parsed.status === "valid" ? parsed.payload : null;
};

export interface ReadinessSummary {
  satisfactory: number;
  notApplicable: number;
  blocked: number;
  notChecked: number;
  complete: boolean;
  outcome: "complete" | "blocked" | "incomplete";
}

export const summarizeReadiness = (
  items: readonly ChecklistItem[],
  entries: ReadinessEntries,
): ReadinessSummary => {
  const satisfactory = items.filter((item) => entries[item.id]?.status === "satisfactory").length;
  const notApplicable = items.filter(
    (item) => entries[item.id]?.status === "not_applicable" && isResolved(entries[item.id]),
  ).length;
  const blocked = items.filter((item) => isBlockingStatus(entries[item.id]?.status ?? "not_checked")).length;
  const notChecked = items.length - satisfactory - notApplicable - blocked;
  const complete = satisfactory + notApplicable === items.length;
  return {
    satisfactory,
    notApplicable,
    blocked,
    notChecked,
    complete,
    outcome: blocked > 0 ? "blocked" : complete ? "complete" : "incomplete",
  };
};
