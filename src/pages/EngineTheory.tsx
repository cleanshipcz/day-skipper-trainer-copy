import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Wrench, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { maintenanceChecks } from "@/data/engineChecks";
import { useProgress, type ProgressSaveResult } from "@/hooks/useProgress";
import { useAuth } from "@/contexts/AuthHooks";
import { clearAnonymousEngineChecklist, ENGINE_CHECKLIST_CATALOGUE_ID, ENGINE_CHECKLIST_PROGRESS_ID, ENGINE_CHECKLIST_PROGRESS_VERSION, normalizeEngineCatalogue, parseEngineChecklistProgress, restoreAnonymousEngineChecklist, saveAnonymousEngineChecklist } from "@/features/progress/engineChecklistProgress";

type Status = "loading" | "ready" | "saving" | "saved" | "anonymous" | "conflict" | "failed";

const EngineTheory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loadProgressDetailed, saveProgressDetailed } = useProgress();
  const catalogue = useMemo(() => normalizeEngineCatalogue(maintenanceChecks), []);
  const validIds = useMemo(() => new Set(catalogue.map(({ id }) => id)), [catalogue]);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Status>("loading");
  const [pendingIds, setPendingIds] = useState<string[] | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const ownerRef = useRef(user?.id ?? null);
  const revisionRef = useRef(0);
  ownerRef.current = user?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    if (user?.id) clearAnonymousEngineChecklist(sessionStorage);
    setCheckedIds(new Set()); setPendingIds(null); setStatus("loading"); revisionRef.current = 0;
    void loadProgressDetailed(ENGINE_CHECKLIST_PROGRESS_ID).then((result) => {
      if (cancelled) return;
      if (result.status === "remote") {
        const restored = parseEngineChecklistProgress(result.record.answers_history, validIds);
        if (!restored) { setStatus("failed"); return; }
        revisionRef.current = restored.revision; setCheckedIds(new Set(restored.checkedItemIds)); setStatus("ready");
      } else if (result.status === "anonymous") {
        const restored = restoreAnonymousEngineChecklist(sessionStorage, validIds);
        setCheckedIds(new Set(restored?.checkedItemIds ?? [])); setStatus("anonymous");
      } else setStatus(result.status === "failed" ? "failed" : "ready");
    }).catch(() => { if (!cancelled) setStatus("failed"); });
    return () => { cancelled = true; };
  }, [user?.id, loadAttempt, loadProgressDetailed, validIds]);

  const persist = async (ids: string[]) => {
    const owner = user?.id ?? null;
    if (!owner) { saveAnonymousEngineChecklist(sessionStorage, ids); setStatus("anonymous"); return; }
    setPendingIds(ids); setStatus("saving");
    let result: ProgressSaveResult;
    try { result = await saveProgressDetailed(ENGINE_CHECKLIST_PROGRESS_ID, false, 0, 0, {
      version: ENGINE_CHECKLIST_PROGRESS_VERSION, catalogueId: ENGINE_CHECKLIST_CATALOGUE_ID,
      checkedItemIds: ids, revision: revisionRef.current,
    }); } catch { result = "failed"; }
    if (ownerRef.current !== owner) return;
    if (result === "conflict") { setPendingIds(null); setStatus("conflict"); return; }
    if (result === "failed") { setStatus("failed"); return; }
    if (result === "remote") { revisionRef.current += 1; clearAnonymousEngineChecklist(sessionStorage); }
    setPendingIds(null); setStatus(result === "anonymous" ? "anonymous" : "saved");
  };

  const toggle = (id: string, checked: boolean) => {
    if (!validIds.has(id) || ["loading", "saving", "conflict", "failed"].includes(status)) return;
    const next = new Set(checkedIds);
    if (checked) next.add(id); else next.delete(id);
    setCheckedIds(next);
    void persist(catalogue.filter(({ id }) => next.has(id)).map(({ id }) => id));
  };
  const total = catalogue.length, count = checkedIds.size;
  const percentage = total ? Math.round(count / total * 100) : 0;
  const interactive = !["loading", "saving", "conflict", "failed"].includes(status);

  return <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
    <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-10"><div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" aria-label="Back to home" onClick={() => navigate("/")}><ArrowLeft className="w-5 h-5" /></Button><div><h1 className="text-xl font-bold">Engine Checks & Maintenance</h1><p className="text-sm text-muted-foreground">Practise planning a vessel-specific engine routine</p></div></div><Badge variant="secondary">{count}/{total} checked</Badge></div></header>
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <p className="mb-4 text-sm text-muted-foreground">This reversible checklist is a private practice and planning aid, not an attestation that an engine was inspected, maintained, safe, or ready. It awards no points and never marks the Engine topic complete. Authenticated progress belongs to your account; anonymous progress stays only in this browser session and expires after 24 hours.</p>
      <div className="mb-4 text-sm" role={status === "failed" || status === "conflict" ? "alert" : "status"}>
        {status === "loading" && "Loading saved checklist…"}{status === "saving" && "Saving checklist…"}{status === "saved" && "Checklist saved."}{status === "anonymous" && "Checklist saved for this browser session. Sign in to keep it across devices."}
        {status === "conflict" && <span>Checklist changed elsewhere; your change was not saved. <Button size="sm" variant="outline" onClick={() => setLoadAttempt((n) => n + 1)}>Reload checklist</Button></span>}
        {status === "failed" && <span>{pendingIds ? "Your latest change was not saved." : "Saved progress could not be loaded; editing is paused to protect it."} <Button size="sm" variant="outline" onClick={() => pendingIds ? void persist(pendingIds) : setLoadAttempt((n) => n + 1)}>{pendingIds ? "Retry save" : "Retry load"}</Button></span>}
      </div>
      <Card className="mb-6"><CardContent className="pt-6"><div className="flex justify-between mb-2"><span id="engine-progress-label" className="font-semibold">Practice checklist progress</span><span>{percentage}%</span></div><Progress value={percentage} aria-labelledby="engine-progress-label" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} /></CardContent></Card>
      <Card className="mb-6 border-2 border-accent bg-accent/5"><CardContent className="pt-6 flex gap-3"><AlertTriangle className="w-6 h-6 text-accent shrink-0" /><div><h3 className="font-bold mb-2">Use the vessel instructions</h3><p className="text-sm text-muted-foreground">Isolate machinery and follow the engine and vessel manufacturers’ procedures. Ventilation, fuel-vapour checks and pre-start routines depend on the installation; do not treat this training list as authority to operate or maintain equipment.</p></div></CardContent></Card>
      <Card className="mb-6"><CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="w-5 h-5" />Maintenance practice checklist</CardTitle></CardHeader><CardContent className="space-y-3">
        {total === 0 && <p role="status">No valid engine checklist items are currently available. The quiz remains available below.</p>}
        {catalogue.map((check) => <div key={check.id} className={`p-4 rounded-lg border-2 ${checkedIds.has(check.id) ? "border-success/30 bg-success/5" : "border-border"}`}><div className="flex items-start gap-3"><Checkbox id={`engine-${check.id}`} aria-label={check.task} checked={checkedIds.has(check.id)} disabled={!interactive} onCheckedChange={(value) => toggle(check.id, value === true)} className="mt-1 size-11" /><label htmlFor={`engine-${check.id}`} className="cursor-pointer flex-1"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">{check.task}</h3><Badge variant="outline">{check.frequency}</Badge></div><p className="text-sm text-muted-foreground mt-2">{check.description}</p></label></div></div>)}
      </CardContent></Card>
      <Card className="border-2 border-accent bg-accent/5"><CardContent className="pt-6 flex flex-col sm:flex-row gap-4 justify-between sm:items-center"><div><h3 className="text-xl font-bold">{total > 0 && count === total ? "Practice checklist complete" : "Engine quiz practice is available"}</h3><p className="text-muted-foreground">The quiz is intentionally available at any time. Checklist ticks are reversible planning notes; only the quiz provides learning assessment.</p></div><Button size="lg" onClick={() => navigate("/quiz/engine")}>{total > 0 && count === total ? "Take Engine Quiz" : "Practise Engine Quiz"}</Button></CardContent></Card>
    </main>
  </div>;
};

export default EngineTheory;
