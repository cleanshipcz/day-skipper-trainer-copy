import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RigConfigurationDiagram } from "@/components/rig/RigConfigurationDiagram";
import { RigEvidencePractice } from "@/components/rig/RigEvidencePractice";
import { rigChecks, rigGuidance, rigSources } from "@/data/rigChecks";
import { rigObjectives } from "@/data/rigAssessment";
import { useAuth } from "@/contexts/AuthHooks";
import { useProgress, type ProgressSaveResult } from "@/hooks/useProgress";
import { isValidRigCatalogue, normalizeRigCatalogue, parseRigProgress, RIG_ANONYMOUS_KEY, RIG_PROGRESS_ID, rigProgressPayload, type RigOutcome, type RigOutcomes } from "@/features/progress/rigProgress";

type Status = "loading" | "ready" | "saving" | "saved" | "anonymous" | "queued" | "failed";
type Failure = "transient" | "malformed-remote" | "malformed-anonymous" | "catalogue" | null;
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
  const [failure, setFailure] = useState<Failure>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [practiceComplete, setPracticeComplete] = useState(false);
  const ownerRef = useRef(user?.id ?? null); ownerRef.current = user?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    if (!catalogueValid) { setFailure("catalogue"); setStatus("failed"); return; }
    setSelected({}); setFailure(null); setStatus("loading");
    void loadProgressDetailed(RIG_PROGRESS_ID).then((result) => {
      if (cancelled) return;
      if (result.status === "remote") {
        const parsed = parseRigProgress(result.record.answers_history, ids);
        if (!parsed) { setFailure("malformed-remote"); setStatus("failed"); return; }
        setSelected(parsed); setStatus("ready"); return;
      }
      if (result.status === "anonymous") {
        let parsed: RigOutcomes | null = {};
        try { const stored = sessionStorage.getItem(RIG_ANONYMOUS_KEY); parsed = stored ? parseRigProgress(JSON.parse(stored), ids) : {}; } catch { parsed = null; }
        if (!parsed) { setFailure("malformed-anonymous"); setStatus("failed"); return; }
        setSelected(parsed); setStatus("anonymous"); return;
      }
      if (result.status === "failed") { setFailure("transient"); setStatus("failed"); } else setStatus("ready");
    }).catch(() => { if (!cancelled) { setFailure("transient"); setStatus("failed"); } });
    return () => { cancelled = true; };
  }, [catalogueValid, ids, loadAttempt, loadProgressDetailed, user?.id]);

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
      if (result === "failed" || result === "conflict") { setFailure("transient"); setStatus("failed"); return; }
    setPending(null); setStatus(result === "queued" ? "queued" : "saved");
  };

  const update = (id: string, value: RigOutcome | "not-reviewed") => {
    if (!catalogueValid || ["loading", "saving", "failed"].includes(status)) return;
    const next = { ...selected }; if (value === "not-reviewed") delete next[id]; else next[id] = value;
    setSelected(next); void persist(next);
  };
  const reset = () => { if (!["loading", "saving"].includes(status)) { setSelected({}); void persist({}); } };
  const clearMalformedAnonymous = () => { sessionStorage.removeItem(RIG_ANONYMOUS_KEY); setSelected({}); setFailure(null); setStatus("anonymous"); };
  const resetMalformedRemote = () => { setSelected({}); setFailure(null); void persist({}); };
  const reviewed = Object.keys(selected).length;
  const blockers = Object.values(selected).filter((value) => value !== "satisfactory").length;
  const qualified = catalogueValid && catalogue.length > 0 && reviewed === catalogue.length && blockers === 0 && practiceComplete;
  const areas = [...new Set(catalogue.map(({ area }) => area))];

  return <div className="min-h-screen min-w-0 overflow-x-hidden bg-gradient-to-br from-background via-ocean-light/10 to-background motion-reduce:scroll-auto">
    <header className="sticky top-0 z-10 border-b border-border bg-card/95"><div className="container mx-auto flex flex-wrap items-start justify-between gap-3 px-3 py-4 sm:px-4"><div className="flex min-w-0 items-start gap-2"><Button variant="ghost" size="icon" aria-label="Back to Home from Rig Checks & Preparation" onClick={() => navigate("/")}><ArrowLeft aria-hidden="true" className="size-5" /></Button><div><h1 className="text-xl font-bold">Rig Checks & Preparation</h1><p className="text-sm text-muted-foreground">Learning review—not a vessel inspection certificate</p></div></div><Badge variant="secondary">{reviewed}/{catalogue.length} reviewed</Badge></div></header>
    <main className="container mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
      <Card className="mb-6 border-2 border-accent"><CardContent className="pt-6"><h2 className="font-bold">Record evidence honestly</h2><p className="mt-2 text-sm text-muted-foreground">Use this to practise what to look for. Select “Satisfactory” only after an authorised real inspection against the vessel’s instructions. A defect, uncertainty, inaccessible item or not-applicable decision must be recorded and handed to the skipper or competent rigger; it blocks any readiness statement.</p><p className="mt-2 text-sm font-medium">This review awards zero points and never proves the rig is safe.</p></CardContent></Card>
      <Card id="rig-hazards" className="mb-6 border-2 border-destructive/60"><CardContent className="flex gap-3 pt-6"><AlertCircle aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-destructive"/><div><h2 className="font-bold">Control the hazards before looking</h2><p className="mt-2 text-sm text-muted-foreground">Keep the mast and all rigging well clear of overhead electrical conductors—contact is not required for high voltage to arc. Depower sails; control the boom; keep clear of bights, snap-back paths, winches and loaded lines; and protect against sharp wire. Do not go aloft for this review. Aloft work requires a competent plan, independent fall protection, communication, controlled tools and suitable conditions.</p></div></CardContent></Card>
      <Card className="mb-6"><CardHeader><CardTitle>Learning objectives and quiz handoff</CardTitle></CardHeader><CardContent><p className="mb-3 text-sm text-muted-foreground">Every retained Rig quiz question maps to an objective taught below. The quiz checks safety decisions, not universal intervals, angles, thread counts or tuning values.</p><ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">{rigObjectives.map(({ id, label, theoryAnchor, questionIds }) => <li key={id}><a href={`#${theoryAnchor}`} className="underline underline-offset-4">{label}</a> ({questionIds.join(", ")})</li>)}</ul></CardContent></Card>
      <section aria-labelledby="rig-orientation" className="mb-6"><h2 id="rig-orientation" className="mb-4 text-2xl font-bold">Orient the fitted configuration</h2><RigConfigurationDiagram /></section>
      <Card className="mb-6"><CardHeader><CardTitle>Safe deck-level walk-round and passage preparation</CardTitle></CardHeader><CardContent><ol className="list-decimal space-y-3 pl-5 text-sm text-muted-foreground"><li><strong className="text-foreground">Plan and brief:</strong> identify the fitted rig plan and manuals, weather and passage loads, roles, communication, stop commands and no-go zones. Keep clear of overhead conductors.</li><li><strong className="text-foreground">Depower and control:</strong> secure sails and positively control the boom. Account for covers, lashings, fenders and loose deck gear without entering a fall or swing zone.</li><li><strong className="text-foreground">Walk standing supports:</strong> from deck, trace stays to terminals, retention and accessible chainplates; then mast base, partners and deck-visible spars. Compare dated records—do not tune or disturb loaded fittings.</li><li><strong className="text-foreground">Trace running paths:</strong> identify halyards, sheets, reefing/furling lines and boom controls from end to end. Check leads, chafe, attachments and safe tails while staying outside bights and snap-back paths.</li><li><strong className="text-foreground">Inspect sails and hardware:</strong> with sails controlled, check accessible cloth, seams, reef points, furling components, blocks, tracks, cleats and winches. Record inaccessible areas rather than guessing.</li><li><strong className="text-foreground">Function and close out:</strong> only when authorised, use depowered or low-load checks for leads, reefing/furling and controls. Stop on resistance or abnormal movement; reconcile defects, limitations and records with the skipper before sailing.</li></ol></CardContent></Card>
      <Card id="rig-incidents" className="mb-6"><CardHeader><CardTitle>After heavy weather, grounding or overload</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><p>Heavy weather, grounding, collision, lightning, dismasting, overload or an unexplained tuning/shape change triggers a new inspection; a normal pre-passage walk-round is not enough. Record the event, loads if known, photographs, component identity, changed evidence and inaccessible areas. Follow maker, insurer, coding-authority and competent-person requirements before return to service.</p><p><strong className="text-foreground">Bounded dismasting readiness:</strong> brief crew on stopping the vessel, keeping clear of loaded and overboard rigging, calling for help, and locating vessel-provided emergency tools and procedures. Do not rehearse cutting loaded wire, climb an unstable mast, energise lines near conductors, or prescribe improvised lashings/repairs; stabilisation and any jettison decision belong to the skipper’s situation-specific emergency plan.</p></CardContent></Card>
      <section aria-labelledby="rig-scope" className="mb-6"><h2 id="rig-scope" className="mb-4 text-2xl font-bold">Inspection scope and stop decisions</h2><div className="grid gap-4 md:grid-cols-2">{rigGuidance.map(({ title, body }) => <Card key={title}><CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{body}</p></CardContent></Card>)}</div></section>
      <div className="mb-4 text-sm" role={status === "failed" ? "alert" : "status"}>{status === "loading" && "Loading rig review…"}{status === "saving" && "Saving rig review…"}{status === "saved" && "Rig review saved."}{status === "anonymous" && "Rig review saved for this browser session."}{status === "queued" && "Rig review queued offline; server save is not yet confirmed."}{status === "failed" && <span>{pending ? "Your latest outcome was not saved." : failure === "malformed-remote" ? "Saved rig review uses an incompatible catalogue; it was not changed." : failure === "malformed-anonymous" ? "This browser's rig review is malformed; it was not deleted." : failure === "catalogue" ? "Rig review is unavailable because its catalogue is invalid." : "Saved rig review could not be loaded; editing is paused."} {pending && <Button size="sm" variant="outline" onClick={() => void persist(pending)}>Retry save</Button>}{!pending && (failure === "transient" || failure === "malformed-anonymous") && <Button size="sm" variant="outline" onClick={() => setLoadAttempt((n) => n + 1)}>Retry load</Button>}{failure === "malformed-anonymous" && <Button size="sm" variant="outline" onClick={clearMalformedAnonymous}>Clear local review</Button>}{failure === "malformed-remote" && <Button size="sm" variant="outline" onClick={resetMalformedRemote}>Reset saved review</Button>}</span>}</div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><p id="rig-review-progress" role="status" aria-live="polite" aria-atomic="true">Rig review progress: {reviewed} of {catalogue.length} items reviewed; {blockers} unresolved.</p><Button variant="outline" onClick={reset} disabled={reviewed === 0 || status === "saving"}>Reset review</Button></div>
      <Card id="rig-defect-disposition" className="mb-6 border-destructive/50"><CardHeader><CardTitle>Defect disposition before handoff</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">For a crack, broken wire or fibre, distortion, missing retention, abnormal movement, jam, or uncertain support: avoid contact and further loading; keep people outside sharp-wire, drop, bight and snap-back zones; stop and make the rig no-sail where support or control is affected. Secure or unload only under a competent plan, record the evidence, and escalate to the skipper and competent rigger. Tape, extra force, improvised repair and a quiz result are not clearance.</CardContent></Card>
      <div id="rig-evidence">{areas.map((area) => <Card key={area} className="mb-4"><CardHeader><CardTitle>{area}</CardTitle></CardHeader><CardContent className="space-y-4">{catalogue.filter((check) => check.area === area).map((check) => <fieldset key={check.id} className="min-w-0 rounded-lg border-2 p-3"><legend className="px-1 font-semibold">{check.item}</legend><div id={`rig-${check.id}-details`} className="mb-3 space-y-2 text-sm text-muted-foreground"><p><strong>Safe inspection:</strong> {check.lookFor}</p><p><strong>Acceptable evidence:</strong> {check.acceptableEvidence}</p><p><strong>Limitations:</strong> {check.limitations}</p><p className="rounded-md bg-muted p-3"><strong className="text-foreground">Defect action / work boundary:</strong> {check.boundary}</p></div><div className="grid gap-2 sm:grid-cols-2">{choices.map((choice) => <label key={choice.value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border p-3"><input type="radio" name={`rig-${check.id}`} value={choice.value} checked={(selected[check.id] ?? "not-reviewed") === choice.value} onChange={() => update(check.id, choice.value)} disabled={["loading", "saving", "failed"].includes(status)} aria-describedby={`rig-${check.id}-details`} className="size-5 shrink-0"/><span>{choice.label}</span></label>)}</div>{selected[check.id] === "defect" && <p role="alert" className="mt-3 text-sm font-medium">Stop: do not sail or load this item. Keep people clear, record the evidence, secure or unload only by a safe plan, and escalate to the skipper and competent rigger before reuse.</p>}{selected[check.id] === "unknown-na" && <p role="alert" className="mt-3 text-sm font-medium">Unresolved: do not treat this item—or dependent structure—as safe. Confirm access and applicability and obtain competent advice before sailing.</p>}</fieldset>)}</CardContent></Card>)}
      </div>
      <Card className="mb-6"><CardHeader><CardTitle>Applied evidence walk-round</CardTitle></CardHeader><CardContent><p id="rig-practice-instructions" className="mb-4 text-sm text-muted-foreground">Work one observation at a time: locate the relevant component, evaluate what the evidence can support, and apply the safe boundary. This is deliberately not a check-all exercise. Keyboard and touch controls provide the same choices and feedback.</p><RigEvidencePractice onComplete={() => setPracticeComplete(true)} /></CardContent></Card>
      <Card className="mb-6 min-w-0"><CardHeader><CardTitle>Sources and configuration-specific follow-up</CardTitle></CardHeader><CardContent><p className="mb-3 text-sm text-muted-foreground">Checked 2 August 2026. These authoritative sources support the general hazard boundaries. They do not replace current vessel, mast, rigging, sail and fitting manuals, service bulletins, competent inspection, coding rules or insurer requirements. Seldén is a labelled maker-specific example, not a universal specification.</p><ul className="list-disc space-y-2 pl-5 text-sm">{rigSources.map(({ label, href }) => <li key={href} className="break-words [overflow-wrap:anywhere]"><a className="text-primary underline underline-offset-4" href={href} target="_blank" rel="noreferrer">{label}</a></li>)}</ul></CardContent></Card>
      <Card id="rig-handoff" className={`mt-6 border-2 forced-colors:border-[CanvasText] ${qualified ? "border-success" : "border-accent"}`}><CardContent className="flex min-w-0 flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0" role="status" aria-live="polite" aria-atomic="true"><h2 className="break-words text-xl font-bold">{qualified ? "Learning review complete" : "Readiness not established"}</h2><p className="break-words text-muted-foreground">{qualified ? "All items have satisfactory evidence recorded and the applied practice is complete. Continue with the Rig quiz using the button below. This still is not a certificate of vessel condition." : "Finish the applied practice and every item, then resolve defects or uncertainty before any qualified readiness statement."}</p></div><Button className="min-h-11 shrink-0" onClick={() => navigate("/quiz/rig")}>Practise Rig Quiz</Button></CardContent></Card>
    </main>
  </div>;
};

export default RigTheory;
