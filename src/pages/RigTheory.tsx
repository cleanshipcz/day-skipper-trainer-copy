import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { rigChecks } from "@/data/rigChecks";
import { useAuth } from "@/contexts/AuthHooks";
import { useProgress, type ProgressSaveResult } from "@/hooks/useProgress";
import { isValidRigCatalogue, normalizeRigCatalogue, parseRigProgress, RIG_ANONYMOUS_KEY, RIG_PROGRESS_ID, rigProgressPayload, type RigOutcome, type RigOutcomes } from "@/features/progress/rigProgress";

type Status = "loading" | "ready" | "saving" | "saved" | "anonymous" | "queued" | "failed";
const choices: Array<{ value: RigOutcome | "not-reviewed"; label: string }> = [
  { value: "not-reviewed", label: "Not reviewed" }, { value: "satisfactory", label: "Satisfactory evidence" },
  { value: "defect", label: "Defect found" }, { value: "unknown-na", label: "Unknown / not accessible" },
];

const RigTheory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loadProgressDetailed, saveProgressDetailed } = useProgress();
  const catalogue = useMemo(() => normalizeRigCatalogue(rigChecks), []);
  const catalogueValid = useMemo(() => isValidRigCatalogue(rigChecks, catalogue), [catalogue]);
  const ids = useMemo(() => new Set(catalogue.map(({ id }) => id)), [catalogue]);
  const [selected, setSelected] = useState<RigOutcomes>({});
  const [status, setStatus] = useState<Status>("loading");
  const [pending, setPending] = useState<RigOutcomes | null>(null);
  const ownerRef = useRef(user?.id ?? null); ownerRef.current = user?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    if (!catalogueValid) { setStatus("failed"); return; }
    setSelected({}); setStatus("loading");
    void loadProgressDetailed(RIG_PROGRESS_ID).then((result) => {
      if (cancelled) return;
      if (result.status === "remote") {
        const parsed = parseRigProgress(result.record.answers_history, ids);
        if (!parsed) { setStatus("failed"); return; }
        setSelected(parsed); setStatus("ready"); return;
      }
      if (result.status === "anonymous") {
        let parsed: RigOutcomes | null = {};
        try { const stored = sessionStorage.getItem(RIG_ANONYMOUS_KEY); parsed = stored ? parseRigProgress(JSON.parse(stored), ids) : {}; } catch { parsed = null; }
        if (!parsed) { sessionStorage.removeItem(RIG_ANONYMOUS_KEY); setStatus("failed"); return; }
        setSelected(parsed); setStatus("anonymous"); return;
      }
      setStatus(result.status === "failed" ? "failed" : "ready");
    }).catch(() => { if (!cancelled) setStatus("failed"); });
    return () => { cancelled = true; };
  }, [catalogueValid, ids, loadProgressDetailed, user?.id]);

  const persist = async (next: RigOutcomes) => {
    setPending(next); setStatus("saving");
    if (!user) {
      try { sessionStorage.setItem(RIG_ANONYMOUS_KEY, JSON.stringify(rigProgressPayload(next))); setPending(null); setStatus("anonymous"); }
      catch { setStatus("failed"); }
      return;
    }
    let result: ProgressSaveResult;
    try { result = await saveProgressDetailed(RIG_PROGRESS_ID, false, 0, 0, rigProgressPayload(next)); } catch { result = "failed"; }
    if (ownerRef.current !== user.id) return;
    if (result === "failed" || result === "conflict") { setStatus("failed"); return; }
    setPending(null); setStatus(result === "queued" ? "queued" : "saved");
  };

  const update = (id: string, value: RigOutcome | "not-reviewed") => {
    if (!catalogueValid || ["loading", "saving", "failed"].includes(status)) return;
    const next = { ...selected }; if (value === "not-reviewed") delete next[id]; else next[id] = value;
    setSelected(next); void persist(next);
  };
  const reset = () => { if (!["loading", "saving"].includes(status)) { setSelected({}); void persist({}); } };
  const reviewed = Object.keys(selected).length;
  const blockers = Object.values(selected).filter((value) => value !== "satisfactory").length;
  const qualified = catalogueValid && catalogue.length > 0 && reviewed === catalogue.length && blockers === 0;
  const areas = [...new Set(catalogue.map(({ area }) => area))];

  return <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
    <header className="sticky top-0 z-10 border-b border-border bg-card/95"><div className="container mx-auto flex flex-wrap items-start justify-between gap-3 px-3 py-4 sm:px-4"><div className="flex min-w-0 items-start gap-2"><Button variant="ghost" size="icon" aria-label="Back to Home from Rig Checks & Preparation" onClick={() => navigate("/")}><ArrowLeft aria-hidden="true" className="size-5" /></Button><div><h1 className="text-xl font-bold">Rig Checks & Preparation</h1><p className="text-sm text-muted-foreground">Learning review—not a vessel inspection certificate</p></div></div><Badge variant="secondary">{reviewed}/{catalogue.length} reviewed</Badge></div></header>
    <main className="container mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
      <Card className="mb-6 border-2 border-accent"><CardContent className="pt-6"><h2 className="font-bold">Record evidence honestly</h2><p className="mt-2 text-sm text-muted-foreground">Use this to practise what to look for. Select “Satisfactory” only after an authorised real inspection against the vessel’s instructions. A defect, uncertainty, inaccessible item or not-applicable decision must be recorded and handed to the skipper or competent rigger; it blocks any readiness statement.</p><p className="mt-2 text-sm font-medium">This review awards zero points and never proves the rig is safe.</p></CardContent></Card>
      <div className="mb-4 text-sm" role={status === "failed" ? "alert" : "status"}>{status === "loading" && "Loading rig review…"}{status === "saving" && "Saving rig review…"}{status === "saved" && "Rig review saved."}{status === "anonymous" && "Rig review saved for this browser session."}{status === "queued" && "Rig review queued offline; server save is not yet confirmed."}{status === "failed" && <span>{pending ? "Your latest outcome was not saved." : catalogueValid ? "Saved rig review could not be loaded; editing is paused." : "Rig review is unavailable because its catalogue is invalid."} {pending && <Button size="sm" variant="outline" onClick={() => void persist(pending)}>Retry save</Button>}</span>}</div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><p aria-live="polite">{reviewed} of {catalogue.length} items reviewed; {blockers} unresolved.</p><Button variant="outline" onClick={reset} disabled={reviewed === 0 || status === "saving"}>Reset review</Button></div>
      {areas.map((area) => <Card key={area} className="mb-4"><CardHeader><CardTitle>{area}</CardTitle></CardHeader><CardContent className="space-y-4">{catalogue.filter((check) => check.area === area).map((check) => <fieldset key={check.id} className="min-w-0 rounded-lg border-2 p-3"><legend className="px-1 font-semibold">{check.item}</legend><p id={`rig-${check.id}-details`} className="mb-3 text-sm text-muted-foreground"><strong>Look for:</strong> {check.lookFor}</p><div className="grid gap-2 sm:grid-cols-2">{choices.map((choice) => <label key={choice.value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border p-3"><input type="radio" name={`rig-${check.id}`} value={choice.value} checked={(selected[check.id] ?? "not-reviewed") === choice.value} onChange={() => update(check.id, choice.value)} disabled={["loading", "saving", "failed"].includes(status)} aria-describedby={`rig-${check.id}-details`} className="size-5 shrink-0"/><span>{choice.label}</span></label>)}</div>{selected[check.id] === "defect" && <p role="alert" className="mt-3 text-sm font-medium">Stop: do not rely on this item. Record the defect and escalate to the skipper or competent rigger before sailing.</p>}{selected[check.id] === "unknown-na" && <p role="alert" className="mt-3 text-sm font-medium">Unresolved: confirm access/applicability and obtain competent advice before treating this item as satisfactory.</p>}</fieldset>)}</CardContent></Card>)}
      <Card className={`mt-6 border-2 ${qualified ? "border-success" : "border-accent"}`}><CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold">{qualified ? "Learning review complete" : "Readiness not established"}</h2><p className="text-muted-foreground">{qualified ? "All items have satisfactory evidence recorded. This still is not a certificate of vessel condition." : "Finish every item and resolve defects or uncertainty before any qualified readiness statement."}</p></div><Button onClick={() => navigate("/quiz/rig")}>Practise Rig Quiz</Button></CardContent></Card>
    </main>
  </div>;
};

export default RigTheory;
