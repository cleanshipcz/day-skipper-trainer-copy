import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProgress } from "@/hooks/useProgress";

export interface TheorySection {
  title: string;
  body: ReactNode;
}

export const WeatherTheoryLayout = ({ title, subtitle, topicId, sections, children }: {
  title: string;
  subtitle: string;
  topicId: string;
  sections: readonly TheorySection[];
  children?: ReactNode;
}) => {
  const navigate = useNavigate();
  const { loadProgress, saveProgress } = useProgress();
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  useEffect(() => {
    let active = true;
    void loadProgress(topicId).then((progress) => {
      if (active) {
        setComplete(Boolean(progress?.completed));
        setLoading(false);
        if (!progress?.completed) {
          void saveProgress(topicId, false, 0, 0, { engagementState: "started" });
        }
      }
    });
    return () => {
      active = false;
    };
  }, [loadProgress, saveProgress, topicId]);
  const finish = async () => {
    if (complete || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const saved = await saveProgress(topicId, true, 100, 10, { completionState: "completed" });
      if (saved) setComplete(true);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background pb-16">
      <header className="border-b bg-card/80 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back to meteorology" onClick={() => navigate("/weather")}><ArrowLeft /></Button>
          <div><h1 className="text-xl font-bold">{title}</h1><p className="text-sm text-muted-foreground">{subtitle}</p></div>
        </div>
      </header>
      <main className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-5">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader><CardTitle>{section.title}</CardTitle></CardHeader>
              <CardContent className="space-y-3 leading-relaxed">{section.body}</CardContent>
            </Card>
          ))}
        </div>
        {children}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={finish} disabled={loading || saving || complete}>{complete ? <><CheckCircle2 className="mr-2" />Completed</> : loading ? "Loading progress…" : saving ? "Saving completion…" : "Mark theory complete"}</Button>
          <Button variant="outline" onClick={() => navigate("/weather")}>Back to Meteorology</Button>
        </div>
      </main>
    </div>
  );
};
