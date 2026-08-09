import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { preDepartureChecklist } from "@/data/preDepartureChecklist";
import { useProgress } from "@/hooks/useProgress";
import { TOPIC_IDS } from "@/constants/topicRegistry";
export default function PreDepartureChecklist() {
  const n = useNavigate(),
    [params] = useSearchParams(),
    { saveProgress } = useProgress(),
    [checked, setChecked] = useState<Set<string>>(new Set());
  const categories = [...new Set(preDepartureChecklist.map((i) => i.category))],
    percent = Math.round((checked.size / preDepartureChecklist.length) * 100);
  return (
    <main className="container max-w-4xl mx-auto p-4 py-8 space-y-6">
      <Button variant="ghost" onClick={() => n(params.get("from") === "victualling" ? "/victualling" : "/passage-planning")}>
        <ArrowLeft className="mr-2" />
        {params.get("from") === "victualling" ? "Back to Victualling" : "Back"}
      </Button>
      <h1 className="text-3xl font-bold">Pre-departure checklist</h1>
      <Progress value={percent} />
      <p aria-live="polite">{percent}% complete</p>
      {categories.map((c) => (
        <Card key={c}>
          <CardHeader>
            <CardTitle>{c}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {preDepartureChecklist
              .filter((i) => i.category === c)
              .map((i) => (
                <div key={i.id} className="flex gap-3">
                  <Checkbox
                    id={i.id}
                    checked={checked.has(i.id)}
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
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
      <Button
        disabled={checked.size !== preDepartureChecklist.length}
        onClick={() =>
          void saveProgress(
            TOPIC_IDS.PASSAGE_PLANNING_CHECKLIST,
            true,
            100,
            10,
            { checked: [...checked] },
          )
        }
      >
        Record checklist completion
      </Button>
      <p className="text-sm text-muted-foreground">Recording this list does not by itself declare the vessel ready for sea; the skipper must resolve deficiencies and make the passage-specific go/no-go decision.</p>
    </main>
  );
}
