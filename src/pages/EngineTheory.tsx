import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Wrench, AlertTriangle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { maintenanceChecks } from "@/data/engineChecks";
import { engineGuidance, engineSources } from "@/data/engineGuidance";
import { inspectionExamples, lessonStages, practiceScenarios } from "@/data/engineLesson";
import { engineObjectives } from "@/data/engineAssessment";
import { useProgress, type ProgressSaveResult } from "@/hooks/useProgress";
import { useAuth } from "@/contexts/AuthHooks";
import { clearAnonymousEngineChecklist, ENGINE_CHECKLIST_CATALOGUE_ID, ENGINE_CHECKLIST_PROGRESS_ID, ENGINE_CHECKLIST_PROGRESS_VERSION, mergeEngineChecklistIds, normalizeEngineCatalogue, parseEngineChecklistProgress, restoreAnonymousEngineChecklist, saveAnonymousEngineChecklist, shouldClearAnonymousAfterMigration } from "@/features/progress/engineChecklistProgress";

type Status = "loading" | "ready" | "saving" | "saved" | "queued" | "anonymous" | "conflict" | "failed";

const EngineTheory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { loadProgressDetailed, saveProgressDetailed } = useProgress();
  const catalogue = useMemo(() => normalizeEngineCatalogue(maintenanceChecks), []);
  const validIds = useMemo(() => new Set(catalogue.map(({ id }) => id)), [catalogue]);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Status>("loading");
  const [pendingIds, setPendingIds] = useState<string[] | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number>>({});
  const ownerRef = useRef(user?.id ?? null);
  const revisionRef = useRef(0);
  const completionHeadingRef = useRef<HTMLHeadingElement>(null);
  const userCompletionRef = useRef(false);
  const lastChangedIdRef = useRef<string | null>(null);
  const recoveryTargetRef = useRef<string | "first" | null>(null);
  ownerRef.current = user?.id ?? null;

  useEffect(() => {
    const anchor = location.hash.startsWith("#") ? location.hash.slice(1) : "";
    const allowed = engineObjectives.some(({ theoryAnchor }) => theoryAnchor === anchor);
    if (!allowed) return;
    const target = document.getElementById(anchor);
    if (!target) return;
    target.scrollIntoView?.({ block: "start" });
    target.focus({ preventScroll: true });
  }, [location.hash]);

  useEffect(() => {
    let cancelled = false;
    const loadOwner = user?.id ?? null;
    setCheckedIds(new Set()); setPendingIds(null); setStatus("loading"); revisionRef.current = 0;
    void loadProgressDetailed(ENGINE_CHECKLIST_PROGRESS_ID).then(async (result) => {
      if (cancelled) return;
      if (result.status === "remote") {
        const restored = parseEngineChecklistProgress(result.record.answers_history, validIds);
        if (!restored) { setStatus("failed"); return; }
        revisionRef.current = restored.revision;
        const anonymous = restoreAnonymousEngineChecklist(sessionStorage, validIds);
        if (!anonymous || !loadOwner) { setCheckedIds(new Set(restored.checkedItemIds)); setStatus("ready"); return; }
        const merged = mergeEngineChecklistIds(restored.checkedItemIds, anonymous.checkedItemIds, catalogue.map(({ id }) => id));
        setCheckedIds(new Set(merged));
        if (merged.length === restored.checkedItemIds.length && merged.every((id) => restored.checkedItemIds.includes(id))) {
          if (ownerRef.current === loadOwner) clearAnonymousEngineChecklist(sessionStorage);
          setStatus("ready"); return;
        }
        setPendingIds(merged); setStatus("saving");
        let reconciled: ProgressSaveResult;
        try { reconciled = await saveProgressDetailed(ENGINE_CHECKLIST_PROGRESS_ID, false, 0, 0, {
          version: ENGINE_CHECKLIST_PROGRESS_VERSION, catalogueId: ENGINE_CHECKLIST_CATALOGUE_ID,
          checkedItemIds: merged, revision: restored.revision,
        }); } catch { reconciled = "failed"; }
        if (cancelled || ownerRef.current !== loadOwner) return;
        if (shouldClearAnonymousAfterMigration(reconciled === "anonymous" ? "failed" : reconciled, loadOwner, ownerRef.current)) {
          revisionRef.current += 1; clearAnonymousEngineChecklist(sessionStorage); setPendingIds(null); setStatus("saved");
        } else if (reconciled === "queued") { setPendingIds(null); setStatus("queued"); }
        else setStatus(reconciled === "conflict" ? "conflict" : "failed");
      } else if (result.status === "anonymous") {
        const restored = restoreAnonymousEngineChecklist(sessionStorage, validIds);
        setCheckedIds(new Set(restored?.checkedItemIds ?? [])); setStatus("anonymous");
      } else if (result.status === "missing" && loadOwner) {
        const anonymous = restoreAnonymousEngineChecklist(sessionStorage, validIds);
        if (!anonymous || anonymous.checkedItemIds.length === 0) { setStatus("ready"); return; }
        setCheckedIds(new Set(anonymous.checkedItemIds)); setPendingIds(anonymous.checkedItemIds); setStatus("saving");
        let migrated: ProgressSaveResult;
        try { migrated = await saveProgressDetailed(ENGINE_CHECKLIST_PROGRESS_ID, false, 0, 0, {
          version: ENGINE_CHECKLIST_PROGRESS_VERSION, catalogueId: ENGINE_CHECKLIST_CATALOGUE_ID,
          checkedItemIds: anonymous.checkedItemIds, revision: 0,
        }); } catch { migrated = "failed"; }
        if (cancelled || ownerRef.current !== loadOwner) return;
        if (shouldClearAnonymousAfterMigration(migrated === "anonymous" ? "failed" : migrated, loadOwner, ownerRef.current)) { revisionRef.current = 1; clearAnonymousEngineChecklist(sessionStorage); setPendingIds(null); setStatus("saved"); }
        else if (migrated === "queued") { setPendingIds(null); setStatus("queued"); }
        else setStatus(migrated === "conflict" ? "conflict" : "failed");
      } else setStatus(result.status === "failed" ? "failed" : "ready");
    }).catch(() => { if (!cancelled) setStatus("failed"); });
    return () => { cancelled = true; };
  }, [user?.id, catalogue, loadAttempt, loadProgressDetailed, saveProgressDetailed, validIds]);

  const persist = async (ids: string[]) => {
    const owner = user?.id ?? null;
    if (!owner) {
      setPendingIds(ids);
      if (saveAnonymousEngineChecklist(sessionStorage, ids)) { setPendingIds(null); setStatus("anonymous"); }
      else setStatus("failed");
      return;
    }
    setPendingIds(ids); setStatus("saving");
    let result: ProgressSaveResult;
    try { result = await saveProgressDetailed(ENGINE_CHECKLIST_PROGRESS_ID, false, 0, 0, {
      version: ENGINE_CHECKLIST_PROGRESS_VERSION, catalogueId: ENGINE_CHECKLIST_CATALOGUE_ID,
      checkedItemIds: ids, revision: revisionRef.current,
    }); } catch { result = "failed"; }
    if (ownerRef.current !== owner) return;
    if (result === "conflict") { setStatus("conflict"); return; }
    if (result === "failed") { setStatus("failed"); return; }
    if (result === "remote") { revisionRef.current += 1; clearAnonymousEngineChecklist(sessionStorage); }
    setPendingIds(null); setStatus(result === "queued" ? "queued" : result === "anonymous" ? "anonymous" : "saved");
  };

  const toggle = (id: string, checked: boolean) => {
    if (!validIds.has(id) || ["loading", "saving", "conflict", "failed"].includes(status)) return;
    const next = new Set(checkedIds);
    if (checked) next.add(id); else next.delete(id);
    lastChangedIdRef.current = id;
    userCompletionRef.current = checked && total > 0 && next.size === total;
    setCheckedIds(next);
    void persist(catalogue.filter(({ id }) => next.has(id)).map(({ id }) => id));
  };
  const total = catalogue.length, count = checkedIds.size;
  const percentage = total ? Math.round(count / total * 100) : 0;
  const complete = total > 0 && count === total;
  const interactive = !["loading", "saving", "conflict", "failed"].includes(status);

  useEffect(() => {
    if (complete && userCompletionRef.current) completionHeadingRef.current?.focus({ preventScroll: true });
    userCompletionRef.current = false;
  }, [complete]);

  useEffect(() => {
    if (!interactive || !recoveryTargetRef.current || catalogue.length === 0) return;
    const targetId = recoveryTargetRef.current === "first" ? catalogue[0].id : recoveryTargetRef.current;
    recoveryTargetRef.current = null;
    document.getElementById(`engine-${targetId}`)?.focus({ preventScroll: true });
  }, [catalogue, interactive, status]);

  return <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background motion-reduce:scroll-auto">
    <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-10"><div className="container mx-auto px-3 py-4 sm:px-4 flex flex-wrap items-start justify-between gap-3"><div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3"><Button variant="ghost" size="icon" className="shrink-0" aria-label="Back to Home from Engine Checks & Maintenance" onClick={() => navigate("/")}><ArrowLeft className="w-5 h-5" aria-hidden="true" /></Button><div className="min-w-0"><h1 className="text-xl font-bold break-words [overflow-wrap:anywhere]">Engine Checks & Maintenance</h1><p className="text-sm text-muted-foreground break-words [overflow-wrap:anywhere]">Practise planning a vessel-specific engine routine</p></div></div><Badge variant="secondary" className="shrink-0" aria-hidden="true">{count}/{total} checked</Badge><span className="sr-only" aria-live="polite" aria-atomic="true">{count} of {total} practice checks selected.</span></div></header>
    <main className="container mx-auto px-3 py-6 sm:px-4 sm:py-8 max-w-5xl min-w-0">
      <p className="mb-4 text-sm text-muted-foreground">This reversible checklist is a private practice and planning aid, not an attestation that an engine was inspected, maintained, safe, or ready. It awards no points and never marks the Engine topic complete. Authenticated progress belongs to your account; anonymous progress stays only in this browser session and expires after 24 hours.</p>
      <div className="mb-4 text-sm break-words [overflow-wrap:anywhere]" role={status === "failed" || status === "conflict" ? "alert" : "status"} aria-live={status === "failed" || status === "conflict" ? "assertive" : "polite"} aria-atomic="true">
        {status === "loading" && "Loading saved checklist…"}{status === "saving" && "Saving checklist…"}{status === "saved" && "Checklist saved."}{status === "queued" && "Checklist saved offline and queued to sync; it is not yet confirmed on the server."}{status === "anonymous" && "Checklist saved for this browser session. Sign in to keep it across devices."}
        {status === "conflict" && <span>Checklist changed elsewhere; your change was not saved. <Button size="sm" variant="outline" onClick={() => { recoveryTargetRef.current = lastChangedIdRef.current ?? "first"; setLoadAttempt((n) => n + 1); }}>Reload checklist</Button></span>}
        {status === "failed" && <span>{pendingIds ? "Your latest change was not saved." : "Saved progress could not be loaded; editing is paused to protect it."} <Button size="sm" variant="outline" onClick={() => { recoveryTargetRef.current = pendingIds ? lastChangedIdRef.current ?? "first" : "first"; if (pendingIds) void persist(pendingIds); else setLoadAttempt((n) => n + 1); }}>{pendingIds ? "Retry save" : "Retry load"}</Button></span>}
      </div>
      <Card className="mb-6 min-w-0"><CardContent className="pt-6"><div className="flex flex-wrap justify-between gap-2 mb-2"><span id="engine-progress-label" className="font-semibold">Practice checklist progress</span><span>{percentage}%</span></div><Progress value={percentage} aria-labelledby="engine-progress-label" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} aria-valuetext={`${count} of ${total} practice checks selected; no points awarded`} /></CardContent></Card>
      <Card className="mb-6 border-2 border-accent bg-accent/5"><CardContent className="pt-6 flex gap-3"><AlertTriangle className="w-6 h-6 text-accent shrink-0" /><div><h3 className="font-bold mb-2">Use the vessel instructions</h3><p className="text-sm text-muted-foreground">Isolate machinery and follow the engine and vessel manufacturers’ procedures. Ventilation, fuel-vapour checks and pre-start routines depend on the installation; do not treat this training list as authority to operate or maintain equipment.</p></div></CardContent></Card>
      <section aria-labelledby="engine-objectives" className="mb-6">
        <Card><CardHeader><CardTitle id="engine-objectives" tabIndex={-1}>Lesson objectives and scope</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>By the end, you should be able to locate the fitted system from its manuals, make a safe operator observation, compare evidence with an installation-specific normal, record it, and decide when to stop, isolate or call a competent person.</p>
          <p><strong className="text-foreground">Representative installation only:</strong> the diagram and examples below help you ask better questions on the actual vessel. They are not a plumbing plan, universal layout, service instruction or substitute for identifying every fitted component in the current engine, gearbox/drive and vessel manuals.</p>
          <p>Before practical work, verify the real installation with the owner/skipper: manuals and service schedule; fuel and cooling routes; shut-offs and isolators; controls, alarms and normal readings; safe access; and the permitted operator-maintenance boundary.</p>
          <div><h3 className="font-semibold text-foreground">Assessed objectives</h3><ol className="mt-2 grid gap-1 sm:grid-cols-2">{engineObjectives.map((objective, index) => <li key={objective.id}><a className="underline underline-offset-4" href={`#${objective.theoryAnchor}`}>{index + 1}. {objective.title}</a></li>)}</ol></div>
        </CardContent></Card>
      </section>
      <section aria-labelledby="engine-system-map" className="mb-6">
        <Card><CardHeader><CardTitle id="engine-system-map">Representative engine-system map</CardTitle></CardHeader><CardContent>
          <figure className="space-y-3">
            <svg viewBox="0 0 760 330" role="img" aria-labelledby="engine-map-title engine-map-desc" className="h-auto w-full min-w-0 rounded-lg border bg-background p-2" preserveAspectRatio="xMidYMid meet">
              <title id="engine-map-title">Representative marine engine installation with labelled inspection points</title>
              <desc id="engine-map-desc">Fuel flows from a tank through a shut-off and water separator to the engine. Raw water flows from a seacock through a strainer and pump to a heat exchanger and wet exhaust. The engine connects to controls, batteries and stern gear. Operators inspect only from safe positions and isolate before hands-on work.</desc>
              <defs><marker id="engine-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" className="fill-primary" /></marker></defs>
              {[[20,35,"Fuel tank"],[145,35,"Separator"],[300,115,"Engine"],[495,35,"Heat exchanger"],[625,35,"Wet exhaust"],[20,235,"Seacock"],[145,235,"Strainer / pump"],[335,235,"Battery / isolator"],[525,235,"Gearbox / shaft"]].map(([x,y,label]) => <g key={String(label)}><rect x={Number(x)} y={Number(y)} width="115" height="55" rx="8" className="fill-card stroke-border" strokeWidth="2"/><text x={Number(x)+57.5} y={Number(y)+33} textAnchor="middle" className="fill-foreground text-[13px] font-semibold">{label}</text></g>)}
              {[[135,62,145,62],[260,62,320,115],[415,142,495,62],[610,62,625,62],[135,262,145,262],[260,262,320,170],[450,262,390,170],[415,160,525,262]].map((line, index) => <line key={index} x1={line[0]} y1={line[1]} x2={line[2]} y2={line[3]} className="stroke-primary" strokeWidth="3" markerEnd="url(#engine-arrow)" />)}
              <text x="20" y="18" className="fill-muted-foreground text-[12px]">Identify routes and inspection points on the actual vessel before use</text>
              <text x="20" y="318" className="fill-muted-foreground text-[12px]">Not to scale · arrangements and flow direction vary</text>
            </svg>
            <figcaption className="text-sm text-muted-foreground">Text alternative: fuel tank → shut-off/separator → engine; seacock → strainer/pump → engine heat exchanger → wet exhaust; battery/isolator supplies starting and charging; gearbox/shaft transmits drive. Trace and label the actual vessel because outboards, saildrives, dry exhausts, keel cooling and other arrangements differ.</figcaption>
          </figure>
        </CardContent></Card>
      </section>
      <section aria-labelledby="engine-worked-routine" className="mb-6"><h2 id="engine-worked-routine" tabIndex={-1} className="text-2xl font-bold mb-4 focus:outline-none">Worked inspect–compare–decide routine</h2><ol className="grid gap-4">
        {lessonStages.map((stage) => <li key={stage.id}><Card><CardHeader><CardTitle className="text-lg">{stage.title}</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2"><div><h3 className="font-semibold text-success">Normal evidence example</h3><p className="text-sm text-muted-foreground mt-1">{stage.example}</p></div><div><h3 className="font-semibold text-destructive">Abnormal evidence and decision</h3><p className="text-sm text-muted-foreground mt-1">{stage.abnormal}</p></div></CardContent></Card></li>)}
      </ol></section>
      <section aria-labelledby="engine-component-inspections" className="mb-6"><h2 id="engine-component-inspections" tabIndex={-1} className="text-2xl font-bold mb-2 focus:outline-none">Component inspection examples</h2><p className="text-sm text-muted-foreground mb-4">Use these cards to prepare a vessel walk-through. “Normal” means the documented baseline for that installation, not merely the absence of an alarm.</p><div className="grid gap-4 lg:grid-cols-2">
        {inspectionExamples.map((item) => <Card key={item.id}><CardHeader><CardTitle className="text-lg">{item.component}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><h3 className="font-semibold">Locate and verify</h3><p className="text-muted-foreground">{item.locate}</p></div><div><h3 className="font-semibold">Observe and record</h3><p className="text-muted-foreground">{item.observe}</p></div><dl className="grid gap-2 sm:grid-cols-2"><div className="rounded-md border border-success/40 p-3"><dt className="font-semibold">Normal evidence</dt><dd className="text-muted-foreground mt-1">{item.evidence.normal}</dd></div><div className="rounded-md border border-destructive/40 p-3"><dt className="font-semibold">Abnormal evidence</dt><dd className="text-muted-foreground mt-1">{item.evidence.abnormal}</dd></div></dl><div className="rounded-md bg-muted p-3"><h3 className="font-semibold">Work boundary</h3><p className="text-muted-foreground mt-1">{item.boundary}</p></div></CardContent></Card>)}
      </div></section>
      <section aria-labelledby="engine-safe-routine" className="mb-6"><h2 id="engine-safe-routine" tabIndex={-1} className="text-2xl font-bold mb-4 focus:outline-none">Safe operating routine and fault response</h2><div className="grid gap-4 md:grid-cols-2">
        {engineGuidance.map(({ title, body }) => <Card key={title}><CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{body}</p></CardContent></Card>)}
      </div></section>
      <section aria-labelledby="engine-practice" className="mb-6"><Card><CardHeader><CardTitle id="engine-practice">Decision practice</CardTitle></CardHeader><CardContent className="space-y-6"><p className="text-sm text-muted-foreground">Choose an action, then use the feedback to correct the reasoning. Practice does not attest that actual maintenance was completed.</p>
        {practiceScenarios.map((scenario) => { const selected = practiceAnswers[scenario.id]; const answered = selected !== undefined; return <fieldset key={scenario.id} className="space-y-3 rounded-lg border p-4"><legend className="px-1 font-semibold">{scenario.prompt}</legend><div className="grid gap-2">{scenario.choices.map((choice, index) => <label key={choice} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3"><input type="radio" name={scenario.id} value={index} checked={selected === index} onChange={() => setPracticeAnswers((current) => ({ ...current, [scenario.id]: index }))} className="mt-1 size-5 shrink-0"/><span>{choice}</span></label>)}</div>{answered && <div role="status" className={`rounded-md p-3 text-sm ${selected === scenario.answer ? "bg-success/10" : "bg-destructive/10"}`}><strong>{selected === scenario.answer ? "Defensible decision." : "Reconsider this choice."}</strong> {scenario.remediation}</div>}</fieldset>; })}
      </CardContent></Card></section>
      <section aria-labelledby="engine-preparation" className="mb-6"><Card><CardHeader><CardTitle id="engine-preparation" tabIndex={-1}>Prepare the actual inspection</CardTitle></CardHeader><CardContent className="grid gap-4 text-sm md:grid-cols-2"><div><h3 className="font-semibold">Tools, PPE and controls</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground"><li>Current engine, drive and vessel manuals; service schedule; hours and previous defect/service records</li><li>Only specified tools, test equipment and PPE; remove jewellery and control keys/starting energy</li><li>Correct labelled fluids, filters, belts, impeller, seals and other vessel-specific spares—never substitute by appearance</li></ul></div><div><h3 className="font-semibold">Spill, waste and handover</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground"><li>Absorbents, containers, plugs and fire controls ready before opening a system</li><li>Capture used fluid, filters, contaminated fuel and absorbents; store and dispose under marina/local rules—never discharge to bilge or water</li><li>Record date, hours, evidence, measurements, specification/batch, parts, work performed, next due point and competent person; retain invoices/service reports</li></ul></div></CardContent></Card></section>
      <Card className="mb-6"><CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="w-5 h-5" />Maintenance practice checklist</CardTitle></CardHeader><CardContent className="space-y-3">
        {total === 0 && <p role="status">No valid engine checklist items are currently available. The quiz remains available below.</p>}
        {catalogue.map((check) => <div key={check.id} className={`min-w-0 p-3 sm:p-4 rounded-lg border-2 ${checkedIds.has(check.id) ? "border-success/30 bg-success/5" : "border-border"}`}><div className="flex min-w-0 items-start gap-3"><Checkbox id={`engine-${check.id}`} aria-labelledby={`engine-${check.id}-task`} aria-describedby={`engine-${check.id}-description engine-${check.id}-frequency`} checked={checkedIds.has(check.id)} disabled={!interactive} onCheckedChange={(value) => toggle(check.id, value === true)} className="mt-1 size-11 shrink-0" /><label htmlFor={`engine-${check.id}`} className="min-w-0 cursor-pointer flex-1 break-words [overflow-wrap:anywhere]"><div className="flex flex-wrap items-start justify-between gap-2"><h3 id={`engine-${check.id}-task`} className="min-w-0 font-semibold">{check.task}</h3><Badge id={`engine-${check.id}-frequency`} variant="outline" className="max-w-full whitespace-normal text-left">{check.frequency}</Badge></div><p id={`engine-${check.id}-description`} className="text-sm text-muted-foreground mt-2">{check.description}</p></label></div></div>)}
      </CardContent></Card>
      <Card className="mb-6 min-w-0"><CardHeader><CardTitle>Sources and vessel-specific follow-up</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground mb-3">Checked 2 August 2026. These sources support the general safety principles; they do not replace the current manuals, service bulletins and legal requirements for the fitted vessel and engine.</p><ul className="list-disc pl-5 space-y-2 text-sm">{engineSources.map(({ label, href }) => <li key={href} className="break-words [overflow-wrap:anywhere]"><a className="text-primary underline underline-offset-4" href={href} target="_blank" rel="noreferrer">{label}</a></li>)}</ul></CardContent></Card>
      <Card className="min-w-0 border-2 border-accent bg-accent/5"><CardContent className="pt-6 flex min-w-0 flex-col sm:flex-row gap-4 justify-between sm:items-center"><div className="min-w-0 break-words [overflow-wrap:anywhere]"><h2 ref={completionHeadingRef} tabIndex={-1} className="text-xl font-bold focus:outline-none">{complete ? "Practice checklist complete" : "Engine quiz practice is available"}</h2><p className="text-muted-foreground">The quiz is intentionally available at any time. Checklist ticks are reversible planning notes; only the quiz provides learning assessment.</p></div><Button size="lg" className="w-full shrink-0 sm:w-auto" onClick={() => navigate("/quiz/engine")}>{complete ? "Take Engine Quiz" : "Practise Engine Quiz"}</Button></CardContent></Card>
    </main>
  </div>;
};

export default EngineTheory;
