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
});

export const isResolved = (entry: ReadinessEntry | undefined) =>
  entry?.status === "satisfactory" ||
  (entry?.status === "not_applicable" && entry.reason.trim().length > 0);

export const isBlockingStatus = (status: ReadinessStatus) =>
  status === "defect" || status === "blocked" || status === "unknown";

export const canSelectStatus = (item: ChecklistItem, status: ReadinessStatus) =>
  status !== "not_applicable" || Boolean(item.conditional);

export const transitionEntry = (
  current: ReadinessEntry | undefined,
  status: ReadinessStatus,
  recordedAt: string,
): ReadinessEntry => ({
  ...(current ?? emptyReadinessEntry()),
  status,
  reason: status === "not_applicable" ? current?.reason ?? "" : "",
  recordedAt: status === "not_checked" ? undefined : recordedAt,
});

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
