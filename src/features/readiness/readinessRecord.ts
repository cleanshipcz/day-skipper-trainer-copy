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
  version: 1;
  context: { vessel: string; voyage: string; conditions: string };
  entries: ReadinessEntries;
  updatedAt: string;
}

const isString = (value: unknown): value is string => typeof value === "string";
const isStatus = (value: unknown): value is ReadinessStatus => isString(value) && value in readinessStatusLabels;
const isTimestamp = (value: unknown): value is string => isString(value) && !Number.isNaN(Date.parse(value));
const parseHistory = (value: unknown): ReadinessHistoryEntry[] => Array.isArray(value) ? value.filter((candidate): candidate is ReadinessHistoryEntry => {
  if (!candidate || typeof candidate !== "object") return false;
  const item = candidate as Partial<ReadinessHistoryEntry>;
  return isStatus(item.status) && item.status !== "not_checked" && isString(item.reason) && isString(item.notes) && isString(item.evidence)
    && isString(item.responsiblePerson) && isTimestamp(item.supersededAt) && isTimestamp(item.recordedAt);
}) : [];

export const parseReadinessPayload = (value: unknown, items: readonly ChecklistItem[]): ReadinessRecordPayload | null => {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<ReadinessRecordPayload>;
  if (candidate.version !== 1 || !candidate.context || typeof candidate.context !== "object" || !candidate.entries || typeof candidate.entries !== "object" || !isTimestamp(candidate.updatedAt)) return null;
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
  return { version: 1, context: { ...context }, entries, updatedAt: candidate.updatedAt };
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
