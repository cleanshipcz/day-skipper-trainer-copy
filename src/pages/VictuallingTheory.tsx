import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Trophy, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { checklistData } from "@/data/victuallingItems";
import { useProgress, type ProgressSaveResult } from "@/hooks/useProgress";
import { useAuth } from "@/contexts/AuthHooks";
import { parseVictuallingProgress, VICTUALLING_CHECKLIST_PROGRESS_ID, VICTUALLING_PROGRESS_VERSION } from "@/features/progress/victuallingProgress";

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
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10"><div className="container mx-auto px-4 py-4"><div className="flex items-center justify-between">
      <div className="flex items-center gap-3"><Button variant="ghost" size="icon" aria-label="Back to Home" onClick={() => navigate("/")}><ArrowLeft className="w-5 h-5" /></Button><div><h1 className="text-xl font-bold">Victualling (Provisioning)</h1><p className="text-sm text-muted-foreground">Plan your provisions for sea</p></div></div>
      <div className="flex items-center gap-4"><div className="flex items-center gap-2" aria-label={`Planning score: ${planningScore} points`}><Trophy className="w-5 h-5 text-accent" /><span className="font-bold text-lg">{planningScore}</span></div><Badge variant="secondary">{count}/{total} items</Badge></div>
    </div></div></header>
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <p className="mb-4 text-sm text-muted-foreground">Completion criteria: this reversible checklist records planning readiness only. Checking items earns no durable learning credit. Pass the Victualling Quiz to complete the learning topic.</p>
      <div className="mb-4 text-sm" aria-live="polite">
        {status === "loading" && "Loading saved checklist…"}{status === "saving" && "Saving checklist…"}{status === "saved" && "Checklist saved."}{status === "anonymous" && "Checklist is available for this visit. Sign in to save it across devices."}
        {status === "conflict" && <span className="inline-flex items-center gap-3">This checklist changed elsewhere. Reload the latest version before editing.<Button size="sm" variant="outline" onClick={() => setLoadRevision((value) => value + 1)}>Reload checklist</Button></span>}
        {status === "failed" && <span className="inline-flex items-center gap-3">{pendingIds ? "Checklist could not be saved." : "Saved checklist could not be loaded. Editing is paused to protect your existing progress."}<Button size="sm" variant="outline" onClick={() => pendingIds ? void persist(pendingIds) : setLoadRevision((value) => value + 1)}>{pendingIds ? "Retry save" : "Retry load"}</Button></span>}
      </div>
      <Card className="mb-6 border-2 border-secondary/20"><CardContent className="pt-6"><div className="flex items-center justify-between mb-2"><span className="font-semibold">Provisioning Progress</span><span className="text-sm text-muted-foreground">{percentage}%</span></div><div className="w-full bg-muted rounded-full h-3"><div className="bg-secondary h-3 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} /></div></CardContent></Card>
      <Card className="mb-6"><CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" />Provisioning Guidelines</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Plan extra supplies, protect stores from water, prioritise fresh water, and minimise waste.</p></CardContent></Card>
      {total === 0 && <Card><CardContent className="pt-6" role="status">No valid provisioning items are currently available.</CardContent></Card>}
      {[...grouped].map(([category, items]) => <Card key={category} className="mb-4"><CardHeader><CardTitle className="text-lg">{category}</CardTitle></CardHeader><CardContent><div className="space-y-3">{items.map((item) => {
        const checked = checkedIds.has(item.id);
        return <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${checked ? "border-success/30 bg-success/5" : "border-border hover:border-secondary/50"}`}><Checkbox id={`victualling-${item.id}`} aria-label={item.item} checked={checked} disabled={!interactive} onCheckedChange={(value) => toggle(item.id, value === true)} /><label htmlFor={`victualling-${item.id}`} className="flex-1 cursor-pointer flex items-center justify-between"><span className={checked ? "line-through text-muted-foreground" : ""}>{item.item}</span><Badge variant="outline" className="text-xs">{item.quantity}</Badge></label></div>;
      })}</div></CardContent></Card>)}
      {total > 0 && count === total && <Card className="border-2 border-accent bg-accent/5" role="region" aria-label="Provisioning checklist ready"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><h3 className="text-xl font-bold mb-2">Provisioning plan ready</h3><p className="text-muted-foreground">The quiz is the learning completion gate.</p></div><Button size="lg" onClick={() => navigate("/quiz/victualling")}>Take Quiz</Button></div></CardContent></Card>}
    </main>
  </div>;
};

export default VictuallingTheory;
