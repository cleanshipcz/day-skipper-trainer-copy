import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checklistPhases, checklistSupportingRoutes, preDepartureChecklist } from "@/data/preDepartureChecklist";
import { useProgress } from "@/hooks/useProgress";
import { TOPIC_IDS } from "@/constants/topicRegistry";
export default function PreDepartureChecklist() {
  const n = useNavigate(),
    [params] = useSearchParams(),
    { saveProgress } = useProgress(),
    [checked, setChecked] = useState<Set<string>>(new Set()),
    [notApplicable,setNotApplicable]=useState<Set<string>>(new Set());
  const resolved = new Set([...checked,...notApplicable]),
    percent = Math.round((resolved.size / preDepartureChecklist.length) * 100),
    itemName = (id:string) => preDepartureChecklist.find(item=>item.id===id)?.label ?? id;
  return (
    <main className="container max-w-4xl mx-auto p-4 py-8 space-y-6">
      <Button variant="ghost" onClick={() => n(params.get("from") === "victualling" ? "/victualling" : "/passage-planning")}>
        <ArrowLeft className="mr-2" />
        {params.get("from") === "victualling" ? "Back to Victualling" : "Back"}
      </Button>
      <h1 className="text-3xl font-bold">Pre-departure checklist</h1>
      <Card><CardContent className="pt-6 space-y-2"><h2 className="text-xl font-semibold">Scope and authority</h2><p>This learning gate supplements the vessel&apos;s manuals, required procedures and the skipper&apos;s inspection. Completing or recording it is <strong>not a seaworthiness certificate</strong>, survey, legal-compliance declaration or permission to depart.</p><p>Identify the actual vessel, machinery, equipment, voyage, operating area and crew. Applicable law, flag/coastal-state requirements, coding or certificate conditions, manufacturer instructions and competent advice override this generic list. Stop and resolve a defect or uncertainty rather than checking a box.</p></CardContent></Card>
      <Progress value={percent} />
      <p aria-live="polite">{percent}% resolved ({checked.size} checked, {notApplicable.size} recorded not applicable)</p>
      {checklistPhases.map((phase,phaseIndex) => (
        <Card key={phase}>
          <CardHeader>
            <CardTitle>{phaseIndex+1}. {phase}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {preDepartureChecklist
              .filter((i) => i.phase === phase)
              .map((i) => {const unmet=i.dependsOn?.filter(id=>!resolved.has(id))??[];const blocked=unmet.length>0;return (
                <div key={i.id} className="flex gap-3" data-phase={phase}>
                  <Checkbox
                    id={i.id}
                    checked={checked.has(i.id)}
                    disabled={blocked||notApplicable.has(i.id)}
                    onCheckedChange={(v) =>
                      setChecked((s) => {
                        const x = new Set(s);
                        if (v) x.add(i.id);
                        else x.delete(i.id);
                        return x;
                      })
                    }
                  />
                  <div>
                    <label htmlFor={i.id} className="font-medium">
                      {i.label}
                    </label>
                    <p className="text-sm text-muted-foreground">{i.why}</p>
                    {blocked&&<p className="text-sm text-amber-700 dark:text-amber-300"><strong>Complete first:</strong> {unmet.map(itemName).join("; ")}</p>}
                    {i.conditional&&<div className="mt-2 rounded border p-2 text-sm"><p><strong>Conditional:</strong> {i.conditional.when}</p><p><strong>Applicability authority:</strong> {i.conditional.authority}</p><Button type="button" size="sm" variant="outline" className="mt-2" disabled={blocked} aria-pressed={notApplicable.has(i.id)} onClick={()=>{setNotApplicable(current=>{const next=new Set(current);if(next.has(i.id))next.delete(i.id);else next.add(i.id);return next});setChecked(current=>{const next=new Set(current);next.delete(i.id);return next})}}>{notApplicable.has(i.id)?"Undo not-applicable decision":"Record not applicable after checking authority"}</Button></div>}
                  </div>
                </div>
              )})}
          </CardContent>
        </Card>
      ))}
      <Card><CardHeader><CardTitle>Supporting lessons and tools</CardTitle></CardHeader><CardContent><p className="mb-3 text-sm text-muted-foreground">Use these for the detailed calculation, inspection or drill; this gate cross-references them rather than pretending to replace them.</p><ul className="space-y-2">{checklistSupportingRoutes.map(item=><li key={item.route}><Link className="font-medium text-primary underline underline-offset-4" to={item.route}>{item.label}</Link><span className="text-muted-foreground"> — {item.scope}</span></li>)}</ul></CardContent></Card>
      <Button
        disabled={resolved.size !== preDepartureChecklist.length}
        onClick={() =>
          void saveProgress(
            TOPIC_IDS.PASSAGE_PLANNING_CHECKLIST,
            true,
            100,
            10,
            { checked: [...checked], notApplicable:[...notApplicable] },
          )
        }
      >
        Record checklist completion
      </Button>
      <p className="text-sm text-muted-foreground">Recording this list does not declare the vessel ready or seaworthy. The skipper remains responsible for resolving deficiencies and making—and revisiting—the passage-specific go/no-go decision.</p>
    </main>
  );
}
