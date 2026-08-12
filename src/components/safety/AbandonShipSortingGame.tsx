import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProcedureStep } from "@/data/lifeRaftProcedures";
import { ABANDON_SHIP_SCENARIOS, abandonShipEvidenceKey, findDependencyViolations, getDrillStep, hasAllScenarioEvidence, parseDrillEvidence, type Dependency, type DrillEvidence, type DrillScenario } from "@/data/abandonShipDrill";
const initialOrder = (scenario: DrillScenario) => [...scenario.steps].reverse();

interface AbandonShipSortingGameProps {
  readonly onReviewTheory?: () => void;
  /** Reports validated, de-duplicated browser evidence to the lesson shell. */
  readonly onEvidenceChange?: (evidence: DrillEvidence) => void;
  readonly evidenceOwnerId?: string | null;
  readonly evidenceRevision?: string;
}
export const AbandonShipSortingGame = ({ onReviewTheory, onEvidenceChange, evidenceOwnerId = null, evidenceRevision = "life-raft-qualified-guidance-drill-v3" }: AbandonShipSortingGameProps) => {
  const evidenceKey = abandonShipEvidenceKey(evidenceOwnerId, evidenceRevision);
  const evidenceScopeRef = useRef(evidenceKey);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const scenario = ABANDON_SHIP_SCENARIOS[scenarioIndex];
  const [steps, setSteps] = useState<ProcedureStep[]>(() => initialOrder(scenario));
  const [violations, setViolations] = useState<readonly Dependency[] | null>(null);
  const [evidence, setEvidence] = useState<DrillEvidence>(() => {
    try { return parseDrillEvidence(localStorage.getItem(evidenceKey)); }
    catch { return parseDrillEvidence(null); }
  });
  const mastered = evidence.masteredScenarioIds;
  const [announcement, setAnnouncement] = useState("");
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const solved = violations?.length === 0;
  const allMastered = hasAllScenarioEvidence(mastered);
  const dependencySummary = useMemo(() => scenario.dependencies.map(({ before, after }) => `${getDrillStep(scenario, before).text} before ${getDrillStep(scenario, after).text}`), [scenario]);

  useEffect(() => {
    if (evidenceScopeRef.current !== evidenceKey) {
      evidenceScopeRef.current = evidenceKey;
      let restored = parseDrillEvidence(null);
      try { restored = parseDrillEvidence(localStorage.getItem(evidenceKey)); } catch { /* start empty when storage is unavailable */ }
      setEvidence(restored);
      setScenarioIndex(0); setSteps(initialOrder(ABANDON_SHIP_SCENARIOS[0])); setViolations(null);
      setAnnouncement("Learner changed. Drill evidence reloaded for the current learner.");
      return;
    }
    try { localStorage.setItem(evidenceKey, JSON.stringify({ version: 2, masteredScenarioIds: mastered, completedAt: evidence.completedAt })); } catch { /* visible evidence remains explicitly browser-local */ }
    onEvidenceChange?.(evidence);
  }, [evidence, evidenceKey, mastered, onEvidenceChange]);

  const selectScenario = (index: number) => {
    const next = ABANDON_SHIP_SCENARIOS[index];
    setScenarioIndex(index); setSteps(initialOrder(next)); setViolations(null); setAnnouncement(`${next.title} selected. Order reset.`);
  };
  const move = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= steps.length) return;
    const next = [...steps]; [next[index], next[destination]] = [next[destination], next[index]];
    setSteps(next); setViolations(null); setAnnouncement(`${steps[index].text} moved to position ${destination + 1} of ${steps.length}.`);
    requestAnimationFrame(() => itemRefs.current[destination]?.focus());
  };
  const check = () => {
    const result = findDependencyViolations(steps, scenario.dependencies); setViolations(result);
    if (result.length === 0) {
      setEvidence((current) => {
        const masteredScenarioIds = current.masteredScenarioIds.includes(scenario.id) ? current.masteredScenarioIds : [...current.masteredScenarioIds, scenario.id];
        return { masteredScenarioIds, completedAt: current.completedAt ?? (hasAllScenarioEvidence(masteredScenarioIds) ? new Date().toISOString() : null) };
      });
      setAnnouncement(`Context solved. ${scenario.dependencies.length} safety dependencies satisfied; independent actions may be in different valid orders.`);
      toast.success("Safe dependencies satisfied", { description: "This is one valid plan; independent actions may also be reordered." });
    } else {
      setAnnouncement(`${result.length} safety dependencies violated. ${result[0].reason}`);
      toast.error("Unsafe dependency found", { description: result[0].reason });
    }
  };
  const reset = () => { setSteps(initialOrder(scenario)); setViolations(null); setAnnouncement(`${scenario.title} reset to an unsolved order.`); itemRefs.current[0]?.focus(); };

  return <section className="min-w-0 space-y-4" aria-labelledby="abandon-drill-title">
    <div><h2 id="abandon-drill-title" className="text-xl font-bold">Context-dependent abandon-ship drill</h2><p className="text-sm text-muted-foreground">Arrange actions so every stated safety dependency is satisfied. Actions without a dependency may happen concurrently or in either order; this records contextual planning, not recall of one universal sequence.</p></div>
    <div role="tablist" aria-label="Emergency scenario" className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
      {ABANDON_SHIP_SCENARIOS.map((item, index) => <Button key={item.id} role="tab" aria-selected={index === scenarioIndex} aria-controls="abandon-scenario-panel" id={`scenario-${item.id}`} variant={index === scenarioIndex ? "default" : "outline"} className="h-auto min-h-11 whitespace-normal px-3 py-2 text-left" onClick={() => selectScenario(index)}>{item.title}{mastered.includes(item.id) ? " — complete" : ""}</Button>)}
    </div>
    <Card id="abandon-scenario-panel" role="tabpanel" aria-labelledby={`scenario-${scenario.id}`} className="min-w-0 border-2 border-primary/20">
      <CardHeader><div className="flex min-w-0 flex-wrap items-start justify-between gap-2"><div className="min-w-0"><CardTitle>{scenario.title}</CardTitle><CardDescription>{scenario.context}</CardDescription></div>{solved && <Badge className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" />Dependencies satisfied</Badge>}</div></CardHeader>
      <CardContent className="min-w-0 space-y-4">
        <div className="rounded-md bg-muted p-3 text-sm"><p className="font-semibold">Required dependencies</p><ul className="list-disc space-y-1 pl-5">{dependencySummary.map((text) => <li key={text}>{text}</li>)}</ul></div>
        <ol aria-label={`Proposed action order for ${scenario.title}`} aria-describedby="drill-order-help" className="min-w-0 space-y-2">
          {steps.map((step, index) => <li key={step.id} ref={(node) => { itemRefs.current[index] = node; }} tabIndex={-1} className={`flex min-w-0 flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between ${violations?.some((item) => item.before === step.id || item.after === step.id) ? "border-destructive bg-destructive/5" : solved ? "border-green-600/40 bg-green-500/5" : "bg-card"}`}>
            <div className="flex min-w-0 items-start gap-3"><Badge variant="outline" aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-0">{index + 1}</Badge><span className="min-w-0 break-words font-medium">{step.text}</span></div>
            <div className="flex shrink-0 gap-2 self-end sm:self-auto"><Button type="button" variant="outline" size="icon" className="h-11 w-11 touch-manipulation" disabled={index === 0 || solved} aria-label={`Move ${step.text} earlier`} onClick={() => move(index, -1)}><ArrowUp aria-hidden="true" className="h-4 w-4" /></Button><Button type="button" variant="outline" size="icon" className="h-11 w-11 touch-manipulation" disabled={index === steps.length - 1 || solved} aria-label={`Move ${step.text} later`} onClick={() => move(index, 1)}><ArrowDown aria-hidden="true" className="h-4 w-4" /></Button></div>
          </li>)}
        </ol>
        <p id="drill-order-help" className="text-xs text-muted-foreground">Use the labelled earlier/later controls with keyboard, pointer or touch. Focus follows the moved action.</p>
        {violations && violations.length > 0 && <div role="alert" className="rounded-md border border-destructive p-3 text-sm"><p className="font-semibold">Revise {violations.length} unsafe {violations.length === 1 ? "dependency" : "dependencies"}:</p><ul className="list-disc space-y-1 pl-5">{violations.map((item) => <li key={`${item.before}-${item.after}`}>{item.reason}</li>)}</ul><Button type="button" variant="link" className="mt-2 h-auto p-0 underline" onClick={onReviewTheory}>Review the life-raft procedures theory</Button></div>}
        {solved && <p role="status" className="rounded-md border border-green-600 p-3 text-sm">Valid for this context. This evidence means the stated dependencies were satisfied; it does not certify a universal abandon-ship order.</p>}
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row"><Button className="min-h-11 flex-1" onClick={check} disabled={solved}>Check safety dependencies</Button><Button variant="outline" className="min-h-11" onClick={reset}><RefreshCcw aria-hidden="true" className="mr-2 h-4 w-4" />Reset scenario</Button></div>
        <p data-testid="drill-progress" className="text-sm">Context evidence: {mastered.length} of {ABANDON_SHIP_SCENARIOS.length} complete.{allMastered ? " All contexts completed in this browser." : ""}</p>
        <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
      </CardContent>
    </Card>
  </section>;
};
