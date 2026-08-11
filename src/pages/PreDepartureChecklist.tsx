import { useState } from "react";
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
  const { saveProgress } = useProgress();
  const [entries, setEntries] = useState<ReadinessEntries>({});
  const [context, setContext] = useState({ vessel: "", voyage: "", conditions: "" });
  const summary = summarizeReadiness(preDepartureChecklist, entries);
  const resolvedCount = summary.satisfactory + summary.notApplicable;
  const percent = Math.round((resolvedCount / preDepartureChecklist.length) * 100);
  const itemName = (id: string) => preDepartureChecklist.find((item) => item.id === id)?.label ?? id;

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
    setEntries((current) => {
      const next = invalidateDependents(id, current);
      next[id] = transitionEntry(current[id], status, new Date().toISOString());
      return { ...next };
    });
  };

  const setField = (id: string, field: "reason" | "notes" | "evidence" | "responsiblePerson", value: string) => {
    setEntries((current) => ({
      ...current,
      [id]: { ...(current[id] ?? emptyReadinessEntry()), [field]: value },
    }));
  };

  return (
    <main className="container mx-auto max-w-4xl space-y-6 p-4 py-8">
      <Button variant="ghost" onClick={() => navigate(params.get("from") === "victualling" ? "/victualling" : "/passage-planning")}>
        <ArrowLeft className="mr-2" />
        {params.get("from") === "victualling" ? "Back to Victualling" : "Back"}
      </Button>
      <h1 className="text-3xl font-bold">Pre-departure checklist</h1>
      <Card><CardContent className="space-y-2 pt-6"><h2 className="text-xl font-semibold">Training practice, not vessel certification</h2><p>This exercise practises a disciplined readiness record. It is <strong>not a seaworthiness certificate</strong>, survey, legal-compliance declaration or permission to depart. An online answer cannot inspect the vessel or replace the skipper, a competent person, manuals or applicable authority.</p><p>Applicability and criticality depend on the actual vessel, fitted equipment, voyage, operating area and present conditions. Never apply a blanket “not applicable”: use it only where offered, record a reason, and check the stated authority.</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Record context</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3">
        {(["vessel", "voyage", "conditions"] as const).map((field) => <label key={field} className="text-sm font-medium capitalize">{field}<input aria-label={field} className="mt-1 w-full rounded border bg-background p-2 font-normal" value={context[field]} onChange={(event) => setContext((current) => ({ ...current, [field]: event.target.value }))} placeholder={`Actual ${field}`} /></label>)}
      </CardContent></Card>
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
                {statuses.filter((status) => canSelectStatus(item, status)).map((status) => <Button key={status} type="button" size="sm" variant={entry.status === status ? "default" : "outline"} aria-pressed={entry.status === status} disabled={dependencyBlocked && status !== "not_checked"} onClick={() => setStatus(item.id, status)}>{readinessStatusLabels[status]}</Button>)}
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
      <Button disabled={!summary.complete} onClick={() => void saveProgress(TOPIC_IDS.PASSAGE_PLANNING_CHECKLIST, true, 100, 10, { context, entries, summary })}>Record training checklist completion</Button>
    </main>
  );
}
