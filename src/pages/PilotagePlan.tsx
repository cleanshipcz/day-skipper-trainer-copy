import { useCallback } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PilotagePlanBuilder } from "@/components/pilotage/PilotagePlanBuilder";
import type { PilotagePlanSummary } from "@/components/pilotage/pilotagePlan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { useProgress } from "@/hooks/useProgress";

const PilotagePlan = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();
  const completePlan = useCallback((summary: PilotagePlanSummary) => {
    return saveProgress(TOPIC_IDS.PILOTAGE_PLAN, true, 100, 15, {
      waypointCount: summary.waypoints.length,
      totalDistance: summary.totalDistance,
      estimatedMinutes: summary.estimatedMinutes,
      waypoints: summary.waypoints,
    });
  }, [saveProgress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" aria-label="Back to Pilotage" onClick={() => navigate("/pilotage")}><ArrowLeft /></Button>
          <div><h1 className="text-xl font-bold">Pilotage Plan Builder</h1><p className="text-sm text-muted-foreground">Turn a charted approach into a concise cockpit plan</p></div>
        </div>
      </header>
      <main className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="text-teal-500" />Before you build</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Work from seaward to the berth. Record conspicuous marks, safe-water limits, courses, distances, tidal effects, speed changes, communications, and abort points.</p>
            <p>Times are estimates: distance ÷ speed gives passage time, then each tidal offset adds or removes minutes for the expected stream.</p>
          </CardContent>
        </Card>
        <PilotagePlanBuilder onComplete={completePlan} />
      </main>
    </div>
  );
};

export default PilotagePlan;
