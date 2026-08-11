import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checklistPhases, checklistSupportingRoutes, preDepartureChecklist } from "@/data/preDepartureChecklist";
import {
  canSelectStatus,
  emptyReadinessEntry,
  isResolved,
  readinessStatusLabels,
  parseReadinessPayload,
  summarizeReadiness,
  transitionEntry,
  type ReadinessEntries,
  type ReadinessStatus,
} from "@/features/readiness/readinessRecord";
import { useProgress } from "@/hooks/useProgress";
import { TOPIC_IDS } from "@/constants/topicRegistry";

const statuses = ["not_checked", "satisfactory", "not_applicable", "defect", "blocked", "unknown"] as const;

export default function PreDepartureChecklist() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { loadProgressDetailed, saveProgressDetailed } = useProgress();
  const [entries, setEntries] = useState<ReadinessEntries>({});
  const [context, setContext] = useState({ vessel: "", voyage: "", conditions: "" });
  const [loadState, setLoadState] = useState<"loading" | "ready" | "failed">("loading");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "failed" | "anonymous">("idle");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [completionConfirmed, setCompletionConfirmed] = useState(false);
  const revision = useRef(0);
  const hydrated = useRef(false);
  const summary = summarizeReadiness(preDepartureChecklist, entries);
  const resolvedCount = summary.satisfactory + summary.notApplicable;
  const percent = Math.round((resolvedCount / preDepartureChecklist.length) * 100);
  const itemName = (id: string) => preDepartureChecklist.find((item) => item.id === id)?.label ?? id;

  useEffect(() => {
    let active = true;
    hydrated.current = false;
    setLoadState("loading");
    void loadProgressDetailed(TOPIC_IDS.PASSAGE_PLANNING_CHECKLIST).then((result) => {
      if (!active) return;
      if (result.status === "failed") {
        setLoadState("failed");
        return;
      }
      const payload = result.status === "remote"
        ? parseReadinessPayload(result.record.answers_history?.readinessRecord, preDepartureChecklist)
        : null;
      if (payload) {
        setContext(payload.context);
        setEntries(payload.entries);
        setCompletionConfirmed(Boolean(result.status === "remote" && result.record.completed && summarizeReadiness(preDepartureChecklist, payload.entries).complete));
      } else {
        setCompletionConfirmed(false);
      }
      hydrated.current = true;
      setLoadState("ready");
      setSaveState(result.status === "anonymous" ? "anonymous" : "idle");
    }).catch(() => {
      if (active) setLoadState("failed");
    });
    return () => { active = false; };
  }, [loadAttempt, loadProgressDetailed]);

  const persistRecord = useCallback(async (completed: boolean, currentRevision: number) => {
    setSaveState("saving");
    const readinessRecord = { version: 1 as const, context, entries, updatedAt: new Date().toISOString() };
    const result = await saveProgressDetailed(TOPIC_IDS.PASSAGE_PLANNING_CHECKLIST, completed, completed ? 100 : 0, completed ? 10 : 0, { readinessRecord });
    if (revision.current !== currentRevision) return result;
    if (result === "remote" || result === "queued") setCompletionConfirmed(completed);
    setSaveState(result === "failed" || result === "conflict" ? "failed" : result === "anonymous" ? "anonymous" : "saved");
    return result;
  }, [context, entries, saveProgressDetailed]);

  const markChanged = () => {
    revision.current += 1;
    setSaveState("idle");
  };

  const invalidateDependents = (changedId: string, current: ReadinessEntries) => {
    const invalid = new Set<string>();
    const pending = [changedId];
    while (pending.length) {
      const prerequisite = pending.pop()!;
      for (const item of preDepartureChecklist) {
        if (item.dependsOn?.includes(prerequisite) && !invalid.has(item.id)) {
          invalid.add(item.id);
          pending.push(item.id);
        }
      }
    }
    if (!invalid.size) return current;
    return Object.fromEntries(Object.entries(current).filter(([id]) => !invalid.has(id)));
  };

  const setStatus = (id: string, status: ReadinessStatus) => {
    markChanged();
    setEntries((current) => {
      const next = invalidateDependents(id, current);
      next[id] = transitionEntry(current[id], status, new Date().toISOString());
      return { ...next };
    });
  };

  const setField = (id: string, field: "reason" | "notes" | "evidence" | "responsiblePerson", value: string) => {
    markChanged();
    setEntries((current) => ({
      ...current,
      [id]: { ...(current[id] ?? emptyReadinessEntry()), [field]: value },
    }));
  };

  const setContextField = (field: "vessel" | "voyage" | "conditions", value: string) => {
    markChanged();
    setContext((current) => ({ ...current, [field]: value }));
    setCompletionConfirmed(false);
    const changedAt = new Date().toISOString();
    setEntries((current) => Object.fromEntries(Object.entries(current).map(([id, entry]) => [id, transitionEntry(entry, "not_checked", changedAt)])));
  };

  useEffect(() => {
    if (!hydrated.current || loadState !== "ready" || revision.current === 0 || saveState !== "idle") return;
    if (summary.complete && !completionConfirmed) return;
    const currentRevision = revision.current;
    const completed = summary.complete && completionConfirmed;
    const timeout = window.setTimeout(() => { void persistRecord(completed, currentRevision); }, 300);
    return () => window.clearTimeout(timeout);
  }, [completionConfirmed, context, entries, loadState, persistRecord, saveState, summary.complete]);

  return (
    <main className="container mx-auto max-w-4xl space-y-6 p-4 py-8">
      <Button variant="ghost" onClick={() => navigate(params.get("from") === "victualling" ? "/victualling" : "/passage-planning")}>
        <ArrowLeft className="mr-2" />
        {params.get("from") === "victualling" ? "Back to Victualling" : "Back"}
      </Button>
      <h1 className="text-3xl font-bold">Pre-departure checklist</h1>
      <Card><CardContent className="space-y-2 pt-6"><h2 className="text-xl font-semibold">Training practice, not vessel certification</h2><p>This exercise practises a disciplined readiness record. It is <strong>not a seaworthiness certificate</strong>, survey, legal-compliance declaration or permission to depart. An online answer cannot inspect the vessel or replace the skipper, a competent person, manuals or applicable authority.</p><p>Applicability and criticality depend on the actual vessel, fitted equipment, voyage, operating area and present conditions. Never apply a blanket “not applicable”: use it only where offered, record a reason, and check the stated authority.</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Record context</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3">
        {(["vessel", "voyage", "conditions"] as const).map((field) => <label key={field} className="text-sm font-medium capitalize">{field}<input aria-label={field} disabled={loadState !== "ready"} className="mt-1 w-full rounded border bg-background p-2 font-normal" value={context[field]} onChange={(event) => setContextField(field, event.target.value)} placeholder={`Actual ${field}`} /></label>)}
      </CardContent></Card>
      {loadState === "loading" && <p role="status" aria-live="polite">Loading saved readiness record…</p>}
      {loadState === "failed" && <div role="alert" className="rounded border border-destructive p-3"><p>Saved readiness evidence could not be loaded. No stale or partial record has been used.</p><Button type="button" variant="outline" className="mt-2" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Retry saved record</Button></div>}
      {loadState === "ready" && <p role="status" aria-live="polite">{saveState === "saving" ? "Saving readiness record…" : saveState === "saved" ? "Readiness record saved." : saveState === "failed" ? "Readiness record could not be saved; keep this page open and retry an edit." : saveState === "anonymous" ? "Sign in to preserve this readiness record across navigation and devices." : "Readiness record ready."}</p>}
      <Progress value={percent} />
      <p aria-live="polite">{percent}% resolved ({summary.satisfactory} satisfactory, {summary.notApplicable} not applicable, {summary.blocked} blocked, {summary.notChecked} incomplete)</p>
      {summary.blocked > 0 && <Card className="border-destructive"><CardContent className="space-y-1 pt-6" role="alert"><h2 className="font-bold">No-go: readiness is blocked</h2><p>Stop the affected operation. Do not depart or conceal the finding. Escalate to the skipper and the responsible competent person or authority, correct the defect where authorised, record evidence, then reassess this item and every dependent decision when vessel, voyage or conditions change.</p></CardContent></Card>}

      {checklistPhases.map((phase, phaseIndex) => (
        <Card key={phase}><CardHeader><CardTitle>{phaseIndex + 1}. {phase}</CardTitle></CardHeader><CardContent className="space-y-5">
          {preDepartureChecklist.filter((item) => item.phase === phase).map((item) => {
            const entry = entries[item.id] ?? emptyReadinessEntry();
            const unmet = item.dependsOn?.filter((id) => !isResolved(entries[id])) ?? [];
            const dependencyBlocked = unmet.length > 0;
            return <fieldset key={item.id} className="space-y-2 rounded border p-3" data-phase={phase}>
              <legend className="px-1 font-medium">{item.label}</legend>
              <p className="text-sm text-muted-foreground">{item.why}</p>
              <p className="text-xs"><strong>Criticality:</strong> reassess for this vessel, equipment, voyage and conditions; a defect, blocked check or unknown evidence is a no-go until resolved.</p>
              {dependencyBlocked && <p className="text-sm text-amber-700 dark:text-amber-300"><strong>Resolve first:</strong> {unmet.map(itemName).join("; ")}</p>}
              {item.conditional && <div className="rounded border p-2 text-sm"><p><strong>Conditional:</strong> {item.conditional.when}</p><p><strong>Applicability authority:</strong> {item.conditional.authority}</p></div>}
              <div className="flex flex-wrap gap-2" aria-label={`${item.label} status`}>
                {statuses.filter((status) => canSelectStatus(item, status)).map((status) => <Button key={status} type="button" size="sm" variant={entry.status === status ? "default" : "outline"} aria-pressed={entry.status === status} disabled={loadState !== "ready" || (dependencyBlocked && status !== "not_checked")} onClick={() => setStatus(item.id, status)}>{readinessStatusLabels[status]}</Button>)}
              </div>
              {entry.status === "not_applicable" && <label className="block text-sm font-medium">Not-applicable reason and authority checked<input aria-label={`${item.label} not-applicable reason`} className="mt-1 w-full rounded border bg-background p-2 font-normal" value={entry.reason} onChange={(event) => setField(item.id, "reason", event.target.value)} /></label>}
              {entry.status !== "not_checked" && <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-sm">Notes / correction<input aria-label={`${item.label} notes`} className="mt-1 w-full rounded border bg-background p-2" value={entry.notes} onChange={(event) => setField(item.id, "notes", event.target.value)} /></label>
                <label className="text-sm">Evidence / reference<input aria-label={`${item.label} evidence`} className="mt-1 w-full rounded border bg-background p-2" value={entry.evidence} onChange={(event) => setField(item.id, "evidence", event.target.value)} /></label>
                <label className="text-sm">Responsible person<input aria-label={`${item.label} responsible person`} className="mt-1 w-full rounded border bg-background p-2" value={entry.responsiblePerson} onChange={(event) => setField(item.id, "responsiblePerson", event.target.value)} /></label>
                <p className="self-end text-xs text-muted-foreground">Recorded: {entry.recordedAt ? new Date(entry.recordedAt).toLocaleString() : "Not recorded"}</p>
              </div>}
            </fieldset>;
          })}
        </CardContent></Card>
      ))}

      <Card className={summary.outcome === "complete" ? "border-success" : summary.outcome === "blocked" ? "border-destructive" : "border-accent"}><CardHeader><CardTitle>Final go / no-go summary</CardTitle></CardHeader><CardContent className="space-y-2"><p><strong>{summary.outcome === "complete" ? "Checklist record complete" : summary.outcome === "blocked" ? "No-go — blocked items remain" : "Incomplete — required items remain"}</strong></p><p>Satisfactory: {summary.satisfactory}. Not applicable with reason: {summary.notApplicable}. Blocked/defect/unknown: {summary.blocked}. Not checked or invalid N/A: {summary.notChecked}.</p><p className="text-sm text-muted-foreground">A complete practice record still does not certify the vessel or authorise departure. The skipper must make and continually reassess the real go/no-go decision.</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Supporting lessons and tools</CardTitle></CardHeader><CardContent><p className="mb-3 text-sm text-muted-foreground">Use these for detailed calculation, inspection or drill.</p><ul className="space-y-2">{checklistSupportingRoutes.map((item) => <li key={item.route}><Link className="font-medium text-primary underline underline-offset-4" to={item.route}>{item.label}</Link><span className="text-muted-foreground"> — {item.scope}</span></li>)}</ul></CardContent></Card>
      <Button disabled={!summary.complete || loadState !== "ready" || saveState === "saving"} onClick={() => { const currentRevision = revision.current; void persistRecord(true, currentRevision); }}>Record training checklist completion</Button>
    </main>
  );
}
