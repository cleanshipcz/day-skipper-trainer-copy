import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { flareScenarios, flareTypes, isFlareContentReleased, type FlareScenario } from "@/data/flareTypes";
import { useProgress } from "@/hooks/useProgress";

export const FLARE_DRILL_REVISION = "flare-identification-mastery-v1";
export const FLARE_DRILL_MASTERY = 100;

export interface DrillResult { readonly correctCount: number; readonly totalAnswered: number; readonly mastered: boolean; readonly revision: string; }
interface Props { readonly onComplete?: (result: DrillResult) => void; readonly scenarioBank?: readonly FlareScenario[]; readonly reviewApproved?: boolean; }
type SaveState = "hydrating" | "ready" | "saving" | "confirmed" | "queued" | "anonymous" | "failed";
type Attempt = { id: string; selected: string; correct: boolean };

const evidenceKey = (ownerId: string | null) => `flare-drill:${ownerId ?? "anonymous"}:${FLARE_DRILL_REVISION}`;
const validEvidence = (value: unknown, ownerId: string | null, ids: readonly string[]) => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  return record.revision === FLARE_DRILL_REVISION && record.ownerId === ownerId && record.mastered === true &&
    Array.isArray(record.masteredScenarioIds) && ids.every(id => (record.masteredScenarioIds as unknown[]).includes(id)) && ["confirmed", "queued", "anonymous"].includes(String(record.completionOutcome)) ? record.completionOutcome as "confirmed" | "queued" | "anonymous" : null;
};

export const FlareIdentificationDrill = ({ onComplete, scenarioBank = flareScenarios, reviewApproved = isFlareContentReleased }: Props) => {
  const { ownerId, loadProgressDetailed, saveProgressDetailed } = useProgress();
  const scenarios = useMemo(() => [...scenarioBank], [scenarioBank]);
  const ids = useMemo(() => scenarios.map(({ id }) => id), [scenarios]);
  const [roundIds, setRoundIds] = useState(ids);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);
  const [nextReady, setNextReady] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [missed, setMissed] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("hydrating");
  const [announcement, setAnnouncement] = useState("Loading saved drill progress…");
  const submitLock = useRef(false);
  const nextRef = useRef<HTMLButtonElement>(null);
  const saveLock = useRef(false);
  const focusTransition = () => setTimeout(() => {
    const scenario = document.querySelector<HTMLInputElement>('input[name^="flare-choice-"]');
    const result = [...document.querySelectorAll<HTMLButtonElement>("button")].find(button => /save mastery|completion confirmed|completion queued|saved on this device/i.test(button.textContent ?? ""));
    (scenario ?? result)?.focus();
  }, 0);

  useEffect(() => {
    let current = true;
    if (!reviewApproved) { setSaveState("ready"); setAnnouncement("Flare drill blocked pending qualified-practitioner review."); return () => { current = false; }; }
    setRoundIds(ids); setIndex(0); setSelected(null); setSettled(false); setAttempts([]); setMissed([]); setSaveState("hydrating");
    if (!ids.length) { setSaveState("ready"); setAnnouncement("Flare identification drill unavailable: no reviewed scenarios are available."); return () => { current = false; }; }
    void (async () => {
      let local: "confirmed" | "queued" | "anonymous" | null = null;
      try { local = validEvidence(JSON.parse(localStorage.getItem(evidenceKey(ownerId)) ?? "null"), ownerId, ids); } catch { local = null; }
      const remote = await loadProgressDetailed(TOPIC_IDS.SAFETY_FLARES_DRILL);
      if (!current) return;
      const history = remote.record?.answers_history;
      const restored = remote.status === "remote" && validEvidence(history, ownerId, ids) === "confirmed";
      const localDurable = local === "queued" && Boolean(ownerId) || local === "anonymous" && !ownerId;
      if (restored || localDurable) {
        setSaveState(restored ? "confirmed" : local!);
        setRoundIds([]); setAnnouncement(restored ? "Flare drill mastery restored from your account." : local === "queued" ? "Flare drill mastery restored from a real offline queue on this device." : "Anonymous mastery restored on this device.");
      } else { setSaveState("ready"); setAnnouncement(remote.status === "failed" ? "Saved progress could not be loaded. You may practise, but completion will require a successful save." : "Ready. Complete all scenarios; every missed item must be corrected."); }
    })();
    return () => { current = false; };
  }, [ids, loadProgressDetailed, ownerId, reviewApproved]);

  const current = scenarios.find(item => item.id === roundIds[index]);
  const mastered = ids.length > 0 && roundIds.length === 0;
  const submit = useCallback(() => {
    if (submitLock.current || settled || !current || !selected) return;
    submitLock.current = true;
    const correct = selected === current.correctFlareId;
    setAttempts(prev => prev.some(a => a.id === current.id && a.selected === selected && a.correct === correct) ? prev : [...prev, { id: current.id, selected, correct }]);
    if (!correct) setMissed(prev => prev.includes(current.id) ? prev : [...prev, current.id]);
    else setMissed(prev => prev.filter(id => id !== current.id));
    setNextReady(false); setSettled(true);
    setAnnouncement(`${correct ? "Correct" : "Not correct"}. ${current.explanation} ${correct ? "Continue when ready." : "Review why the selected signal does not fit, then correct this item in the remediation round."}`);
    setTimeout(() => { submitLock.current = false; setNextReady(true); nextRef.current?.focus(); }, 0);
  }, [current, selected, settled]);

  const advance = () => {
    if (!settled || !nextReady) return;
    if (index + 1 < roundIds.length) { setIndex(index + 1); setSelected(null); setSettled(false); setNextReady(false); setAnnouncement(`Scenario ${index + 2} of ${roundIds.length}.`); focusTransition(); return; }
    if (missed.length) { setRoundIds(missed); setMissed([]); setIndex(0); setSelected(null); setSettled(false); setNextReady(false); setAnnouncement(`Remediation round: retry ${missed.length} missed ${missed.length === 1 ? "scenario" : "scenarios"}.`); focusTransition(); return; }
    setRoundIds([]); setIndex(0); setSelected(null); setSettled(false); setNextReady(false); setSaveState("ready"); setAnnouncement("Mastery achieved. Save this evidence to complete the drill."); focusTransition();
  };

  const save = async () => {
    if (!mastered || saveLock.current || ["confirmed", "queued", "anonymous"].includes(saveState)) return;
    saveLock.current = true; setSaveState("saving"); setAnnouncement("Saving flare drill mastery…");
    const evidence = { revision: FLARE_DRILL_REVISION, ownerId, mastered: true, masteredScenarioIds: ids, attempts, scope: "visual recognition and scenario choice only; not practical pyrotechnic competence", qualifiedReview: "approved", completionOutcome: (ownerId ? "confirmed" : "anonymous") as "confirmed" | "anonymous" };
    try {
      const result = await saveProgressDetailed(TOPIC_IDS.SAFETY_FLARES_DRILL, true, FLARE_DRILL_MASTERY, 10, evidence);
      const durable = result === "remote" || result === "queued" || result === "anonymous";
      if (!durable) { setSaveState("failed"); setAnnouncement("Completion was not saved. Your answers remain available; retry the save."); return; }
      const state = result === "remote" ? "confirmed" : result;
      setSaveState(state); setAnnouncement(result === "remote" ? "Mastery confirmed and saved to your account." : result === "queued" ? "Mastery durably queued on this device for account sync." : "Anonymous mastery saved on this device. Sign in to save across devices.");
      onComplete?.({ correctCount: ids.length, totalAnswered: ids.length, mastered: true, revision: FLARE_DRILL_REVISION });
      try { localStorage.setItem(evidenceKey(ownerId), JSON.stringify({ ...evidence, completionOutcome: state })); } catch { /* Optional cache failure cannot undo authoritative persistence. */ }
    } catch { setSaveState("failed"); setAnnouncement("Completion save failed. Your answers remain available; retry when ready."); }
    finally { saveLock.current = false; }
  };

  const reset = () => { setRoundIds(ids); setIndex(0); setSelected(null); setSettled(false); setNextReady(false); setAttempts([]); setMissed([]); setSaveState("ready"); setAnnouncement("New practice attempt started. Previously saved mastery is preserved."); };

  if (!reviewApproved) return <Card role="status" className="min-w-0 border-2 forced-colors:border-[CanvasText]"><CardHeader><CardTitle>Flare drill release blocked</CardTitle><CardDescription>Qualified-practitioner approval is not evidenced. The drill cannot load, save, restore or award completion.</CardDescription></CardHeader></Card>;
  if (!ids.length) return <Card role="status" className="min-w-0 border-2 forced-colors:border-[CanvasText]"><CardHeader><CardTitle>Flare drill unavailable</CardTitle><CardDescription>No reviewed visual-identification scenarios are available. Nothing was completed or saved.</CardDescription></CardHeader></Card>;
  if (!current) return <Card className="min-w-0 border-2 forced-colors:border-[CanvasText]"><CardHeader><CardTitle>{mastered ? "Flare identification mastery" : "Drill complete"}</CardTitle><CardDescription>Mastery requires {ids.length} of {ids.length} scenarios and correction of every miss. This records visual recognition and scenario choice only; it does not certify practical handling.</CardDescription></CardHeader><CardContent className="space-y-4"><p className="text-2xl font-bold">{ids.length} / {ids.length}</p><p role="status" aria-live="polite">{announcement}</p><div className="flex flex-col gap-3 sm:flex-row"><Button className="min-h-11" onClick={() => void save()} disabled={saveState === "hydrating" || saveState === "saving" || ["confirmed", "queued", "anonymous"].includes(saveState)}>{saveState === "saving" ? "Saving…" : saveState === "failed" ? "Retry completion save" : saveState === "confirmed" ? "Completion confirmed" : saveState === "queued" ? "Completion queued" : saveState === "anonymous" ? "Saved on this device" : "Save mastery"}</Button><Button className="min-h-11" variant="outline" onClick={reset}><RefreshCcw className="mr-2 size-4" />Practise again</Button></div></CardContent></Card>;

  const correct = selected === current.correctFlareId;
  return <section className="min-w-0 space-y-4" aria-labelledby="flare-drill-title"><div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">Scenario {index + 1} of {roundIds.length} · {missed.length} awaiting correction</p><Button className="min-h-11" variant="outline" onClick={reset}><RefreshCcw className="mr-2 size-4" />Reset practice</Button></div><Card className="min-w-0 border-2 forced-colors:border-[CanvasText]"><CardHeader><CardTitle id="flare-drill-title">Visual identification and scenario choice</CardTitle><CardDescription data-testid="flare-scenario">{current.description}</CardDescription></CardHeader><CardContent className="min-w-0 space-y-4"><p id={`flare-question-${current.id}`} className="font-medium">Which labelled signal best fits this scenario?</p><fieldset disabled={settled}><legend className="sr-only">Choose one flare for {current.description}</legend><div className="grid min-w-0 gap-3 sm:grid-cols-2">{flareTypes.map(flare => <label key={flare.id} className="flex min-h-11 min-w-0 cursor-pointer items-start gap-3 rounded-lg border-2 p-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring forced-colors:border-[CanvasText]"><input type="radio" name={`flare-choice-${current.id}`} className="mt-0.5 size-5 shrink-0" checked={selected === flare.id} onChange={() => { setSelected(flare.id); setAnnouncement(`${flare.name} selected.`); }} /><span className="min-w-0 break-words"><strong>{flare.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{flare.recognition}</span></span></label>)}</div></fieldset>{settled && <div data-testid="drill-result" className="rounded-lg border p-4 forced-colors:border-[CanvasText]"><p className="font-medium">{correct ? "Correct" : "Not correct"}</p><p className="text-sm">{current.explanation}</p>{!correct && <p className="mt-2 text-sm">Compare the selected product label and intended signal with the required range, visibility and distress status. You will retry this scenario.</p>}</div>}<p className="sr-only" role="status" aria-live="polite">{announcement}</p>{!settled ? <Button className="min-h-11 w-full" disabled={!selected || saveState === "hydrating"} onClick={submit}>Check answer</Button> : <Button ref={nextRef} className="min-h-11 w-full" disabled={!nextReady} onClick={advance}>{index + 1 < roundIds.length ? "Next scenario" : missed.length ? "Start remediation" : "Show mastery result"}</Button>}</CardContent></Card><p className="text-sm text-muted-foreground motion-reduce:transition-none">Written choices use the reviewed #348 content model. Qualified-practitioner approval remains pending; always follow the exact product label and vessel requirements.</p></section>;
};
