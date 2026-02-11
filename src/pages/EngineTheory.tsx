import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Trophy, Wrench, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { maintenanceChecks, MaintenanceCheck } from "@/data/engineChecks";

const EngineTheory = () => {
  const navigate = useNavigate();
  const [checks, setChecks] = useState<MaintenanceCheck[]>(maintenanceChecks);
  const [score, setScore] = useState(0);

  const handleCheckTask = (taskId: string) => {
    setChecks((previousChecks) => {
      let awardedPoints = false;

      const nextChecks = previousChecks.map((check) => {
        if (check.id === taskId && !check.checked) {
          awardedPoints = true;
          return { ...check, checked: true };
        }
        return check;
      });

      if (awardedPoints) {
        setScore((previousScore) => previousScore + 10);
        toast.success("+10 points! Check completed");
      }

      return nextChecks;
    });
  };

  const checkedCount = useMemo(() => checks.filter((check) => check.checked).length, [checks]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Engine Checks & Maintenance</h1>
                <p className="text-sm text-muted-foreground">Essential engine procedures</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                <span className="font-bold text-lg">{score}</span>
              </div>
              <Badge variant="secondary">
                {checkedCount}/{checks.length} checked
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Safety Warning */}
        <Card className="mb-6 border-2 border-accent bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-2">Safety First!</h3>
                <p className="text-sm text-muted-foreground">
                  Always ensure good ventilation when working on engines. Never run engine with blower off. Check for
                  fuel vapors before starting. Keep fire extinguisher nearby.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BWORCA Mnemonic */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              BWORCA Pre-Start Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-bold text-primary mb-1">B - Blower</h3>
                <p className="text-sm text-muted-foreground">Run for 4 minutes before starting</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-bold text-primary mb-1">W - Water</h3>
                <p className="text-sm text-muted-foreground">Sea cock open, coolant level OK</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-bold text-primary mb-1">O - Oil</h3>
                <p className="text-sm text-muted-foreground">Check level on dipstick</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-bold text-primary mb-1">R - Reserve</h3>
                <p className="text-sm text-muted-foreground">Check fuel level and fuel lines</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-bold text-primary mb-1">C - Controls</h3>
                <p className="text-sm text-muted-foreground">Throttle in neutral, working freely</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-bold text-primary mb-1">A - Ancillaries</h3>
                <p className="text-sm text-muted-foreground">Battery on, belts OK, no leaks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Checklist */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Maintenance Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checks.map((check) => (
              <div
                key={check.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  check.checked ? "border-success/30 bg-success/5" : "border-border hover:border-secondary/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={check.id}
                    checked={check.checked}
                    onCheckedChange={() => handleCheckTask(check.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor={check.id} className="cursor-pointer block">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-semibold ${check.checked ? "line-through text-muted-foreground" : ""}`}>
                          {check.task}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {check.frequency}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{check.description}</p>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Troubleshooting Tips */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Common Issues & Solutions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2 text-sm">Engine Won't Start</h3>
              <p className="text-xs text-muted-foreground">
                Check: Battery charge, fuel supply, sea cock open, gear in neutral, kill switch
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2 text-sm">Overheating</h3>
              <p className="text-xs text-muted-foreground">
                Check: Sea cock open, raw water impeller, coolant level, exhaust blockage
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2 text-sm">Loss of Power</h3>
              <p className="text-xs text-muted-foreground">
                Check: Fuel filters, air intake, propeller fouling, engine load
              </p>
            </div>
          </CardContent>
        </Card>

        {checkedCount === checks.length && (
          <Card className="border-2 border-accent bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">🎉 All checks complete! Ready for the quiz?</h3>
                  <p className="text-muted-foreground">Test your engine maintenance knowledge</p>
                </div>
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => navigate("/quiz/engine")}
                >
                  Take Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default EngineTheory;
