import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { checklistData } from "@/data/victuallingItems";
import { useProgress, type ProgressSaveResult } from "@/hooks/useProgress";
import { useAuth } from "@/contexts/AuthHooks";
import { parseVictuallingProgress, VICTUALLING_CHECKLIST_PROGRESS_ID, VICTUALLING_PROGRESS_VERSION } from "@/features/progress/victuallingProgress";
import { ProvisioningPlanner } from "@/components/victualling/ProvisioningPlanner";
import { FoodWaterSafetyGuide } from "@/components/victualling/FoodWaterSafetyGuide";
import { GalleySafetyGuide } from "@/components/victualling/GalleySafetyGuide";

const POINTS_PER_CHECK = 5;
type PersistenceStatus = "loading" | "ready" | "saving" | "saved" | "anonymous" | "conflict" | "failed";

const VictuallingTheory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loadProgressDetailed, saveProgressDetailed } = useProgress();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<PersistenceStatus>("loading");
  const [pendingIds, setPendingIds] = useState<string[] | null>(null);
  const [loadRevision, setLoadRevision] = useState(0);
  const [progressAnnouncement, setProgressAnnouncement] = useState("");
  const ownerRef = useRef(user?.id ?? null);
  const revisionRef = useRef(0);
  ownerRef.current = user?.id ?? null;
  const validIds = useMemo(() => new Set(checklistData.map(({ id }) => id)), []);

  useEffect(() => {
    let cancelled = false;
    setCheckedIds(new Set());
    setPendingIds(null);
    revisionRef.current = 0;
    setStatus("loading");
    void loadProgressDetailed(VICTUALLING_CHECKLIST_PROGRESS_ID).then((result) => {
      if (cancelled) return;
      if (result.status === "remote") {
        const restored = parseVictuallingProgress(result.record.answers_history, validIds);
        if (restored) {
          revisionRef.current = restored.revision;
          setCheckedIds(new Set(restored.checkedItemIds));
          setStatus("ready");
        } else {
          setStatus("failed");
        }
      } else {
        setStatus(result.status === "anonymous" ? "anonymous" : result.status === "failed" ? "failed" : "ready");
      }
    }).catch(() => { if (!cancelled) setStatus("failed"); });
    return () => { cancelled = true; };
  }, [user?.id, loadProgressDetailed, loadRevision, validIds]);

  const persist = async (ids: string[]) => {
    const owner = user?.id ?? null;
    setPendingIds(ids);
    setStatus("saving");
    const percentage = checklistData.length === 0 ? 0 : Math.round((ids.length / checklistData.length) * 100);
    let result: ProgressSaveResult;
    try {
      // Checklist completion is planning readiness, not evidence of learning.
      // The quiz-victualling record is the only durable completion/credit gate.
      result = await saveProgressDetailed(VICTUALLING_CHECKLIST_PROGRESS_ID, false, percentage, 0, {
        version: VICTUALLING_PROGRESS_VERSION,
        checkedItemIds: ids,
        revision: revisionRef.current,
      });
    } catch { result = "failed"; }
    if (ownerRef.current !== owner) return;
    if (result === "conflict") {
      setPendingIds(null);
      setStatus("conflict");
      return;
    }
    if (result === "failed") { setStatus("failed"); return; }
    if (result === "remote") revisionRef.current += 1;
    setPendingIds(null);
    setStatus(result === "anonymous" ? "anonymous" : "saved");
  };

  const toggle = (id: string, checked: boolean) => {
    if (!validIds.has(id) || status === "loading" || status === "saving" || status === "failed" || status === "conflict") return;
    const next = new Set(checkedIds);
    if (checked) next.add(id); else next.delete(id);
    setCheckedIds(next);
    const item = checklistData.find((candidate) => candidate.id === id);
    const nextCount = next.size;
    const completion = total > 0 && nextCount === total ? " Victualling checklist complete; Take Quiz is now available." : "";
    setProgressAnnouncement(`${item?.item ?? "Item"} ${checked ? "checked" : "unchecked"}. ${nextCount} of ${total} items; planning score ${nextCount * POINTS_PER_CHECK} points.${completion}`);
    void persist(checklistData.filter((item) => next.has(item.id)).map((item) => item.id));
  };

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof checklistData>();
    checklistData.forEach((item) => groups.set(item.category, [...(groups.get(item.category) ?? []), item]));
    return groups;
  }, []);
  const count = checkedIds.size;
  const total = checklistData.length;
  const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
  const planningScore = count * POINTS_PER_CHECK;
  const interactive = status !== "loading" && status !== "saving" && status !== "failed" && status !== "conflict";

  return <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
    <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-10 [@media(max-height:24rem)]:static"><div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4"><div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-2 sm:gap-3"><Button variant="ghost" size="icon" className="shrink-0" aria-label="Back to home" onClick={() => navigate("/")}><ArrowLeft className="w-5 h-5" /></Button><div className="min-w-0"><h1 className="text-lg font-bold break-words sm:text-xl">Victualling (Provisioning)</h1><p className="text-sm text-muted-foreground break-words">Plan your provisions for sea</p></div></div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-4"><div className="flex items-center gap-2" aria-label={`Planning score: ${planningScore} points`}><Trophy className="w-5 h-5 text-accent" aria-hidden="true" /><span className="font-bold text-lg">{planningScore}</span></div><Badge variant="secondary" aria-label={`${count} of ${total} Victualling items checked`} className="whitespace-normal text-center">{count}/{total} items</Badge></div>
    </div></div></header>
    <main id="victualling-learning" className="container mx-auto px-4 py-8 max-w-5xl">
      <p className="mb-4 text-sm text-muted-foreground">Scope: food, potable water, galley consumables and their safe stowage. This reversible checklist records only Victualling planning progress—not general vessel readiness. Checking items earns no durable learning credit. Pass the Victualling Quiz to complete this learning topic.</p>
      <div className="mb-4 text-sm" role={status === "conflict" || status === "failed" ? "alert" : undefined} aria-atomic={status === "conflict" || status === "failed" ? "true" : undefined}>
        {status === "loading" && "Loading saved checklist…"}{status === "saving" && "Saving checklist…"}{status === "saved" && "Checklist saved."}{status === "anonymous" && "Checklist is available for this visit. Sign in to save it across devices."}
        {status === "conflict" && <span className="inline-flex flex-wrap items-center gap-3">This checklist changed elsewhere and your latest change was not saved. Editing is paused until you get the latest version.<Button size="sm" variant="outline" onClick={() => setLoadRevision((value) => value + 1)}>Reload checklist</Button></span>}
        {status === "failed" && <span className="inline-flex flex-wrap items-center gap-3">{pendingIds ? "Your latest checklist change was not saved. Editing is paused until you retry." : "Saved checklist could not be loaded. Editing is paused to protect your existing progress until you retry."}<Button size="sm" variant="outline" onClick={() => pendingIds ? void persist(pendingIds) : setLoadRevision((value) => value + 1)}>{pendingIds ? "Retry save" : "Retry load"}</Button></span>}
      </div>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true" data-testid="victualling-progress-announcement">{progressAnnouncement}</p>
      <Card className="mb-6 border-2 border-secondary/20"><CardContent className="pt-6"><div className="flex flex-wrap items-center justify-between gap-2 mb-2"><span id="victualling-progress-label" className="font-semibold">Victualling checklist progress</span><span className="text-sm text-muted-foreground">{percentage}% ({count} of {total})</span></div><Progress value={percentage} aria-labelledby="victualling-progress-label" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} className="h-3 forced-colors:border forced-colors:border-[CanvasText] [&>div]:motion-reduce:transition-none" /></CardContent></Card>
      <Card className="mb-6"><CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" />Provisioning method</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Build an auditable plan: confirm dietary and medical needs; choose menus and portions; calculate passage-specific water and fuel; compare requirements with realistic usable capacity; then record stowage, spoilage, waste and alternatives. Recheck when crew, route or forecast changes.</p></CardContent></Card>
      <ProvisioningPlanner />
      <FoodWaterSafetyGuide />
      <GalleySafetyGuide />
      {total === 0 && <Card><CardContent className="pt-6" role="status">No valid provisioning items are currently available.</CardContent></Card>}
      {[...grouped].map(([category, items]) => <Card key={category} className="mb-4"><CardHeader><CardTitle className="text-lg">{category}</CardTitle></CardHeader><CardContent><div className="space-y-3">{items.map((item) => {
        const checked = checkedIds.has(item.id);
        return <div key={item.id} className={`flex min-w-0 items-start gap-3 rounded-lg border-2 p-3 transition-colors motion-reduce:transition-none forced-colors:border-[CanvasText] ${checked ? "border-success bg-success/10" : "border-border hover:border-secondary"}`}><Checkbox id={`victualling-${item.id}`} aria-label={item.item} checked={checked} disabled={!interactive} onCheckedChange={(value) => toggle(item.id, value === true)} className="mt-0.5 size-11 shrink-0 forced-colors:border-[CanvasText]" /><label htmlFor={`victualling-${item.id}`} className="flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-2 sm:flex-row sm:justify-between"><span className="min-w-0 break-words font-medium">{item.item}</span><span className="flex max-w-full flex-wrap items-center gap-2"><Badge variant={checked ? "secondary" : "outline"} className="max-w-full whitespace-normal break-words text-left text-xs forced-colors:border-[CanvasText]">{item.quantity}</Badge>{checked && <span className="text-sm font-semibold">Checked</span>}</span></label></div>;
      })}</div></CardContent></Card>)}
      <Card className="border-2 border-accent bg-accent/5 forced-colors:border-[CanvasText]" role="region" aria-label={total > 0 && count === total ? "Victualling checklist complete" : "Victualling learning and quiz readiness"}><CardContent className="pt-6"><div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><h3 className="text-xl font-bold mb-2 break-words">{total > 0 && count === total ? "Planning checklist complete" : "Quiz practice is available"}</h3><p className="text-muted-foreground break-words">Recommended sequence: study the guidance, build and check a passage-specific plan, then take the quiz. The checklist is a reversible planning aid, not proof of knowledge or vessel readiness; it never blocks practice. The quiz is this topic's learning completion gate: only a passed, durably saved Victualling Quiz marks it complete on the dashboard.</p></div><Button size="lg" className="w-full shrink-0 sm:w-auto" onClick={() => navigate("/quiz/victualling")}>{total > 0 && count === total ? "Take Quiz" : "Practise Quiz"}</Button></div></CardContent></Card>
    </main>
  </div>;
};

export default VictuallingTheory;
