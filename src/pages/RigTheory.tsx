import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Trophy, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { rigChecks, RigCheck } from "@/data/rigChecks";

const RigTheory = () => {
  const navigate = useNavigate();
  const [checks, setChecks] = useState<RigCheck[]>(rigChecks);
  const [score, setScore] = useState(0);

  const handleCheckItem = (itemId: string) => {
    const updatedChecks = checks.map((check) => {
      if (check.id === itemId && !check.checked) {
        setScore(score + 8);
        toast.success("+8 points! Check completed");
        return { ...check, checked: true };
      }
      return check;
    });
    setChecks(updatedChecks);
  };

  const areas = Array.from(new Set(checks.map((check) => check.area)));
  const checkedCount = checks.filter((c) => c.checked).length;

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
                <h1 className="text-xl font-bold">Rig Checks & Preparation</h1>
                <p className="text-sm text-muted-foreground">Pre-sea rig inspection</p>
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
        {/* Inspection Tips */}
        <Card className="mb-6 border-2 border-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              Rig Inspection Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">Regular Schedule</h3>
                <p className="text-xs text-muted-foreground">
                  Full inspection before season start, visual checks before every sail
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">Aloft Inspection</h3>
                <p className="text-xs text-muted-foreground">
                  Annually, go aloft to inspect mast head, halyards, and upper fittings
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">Document Issues</h3>
                <p className="text-xs text-muted-foreground">
                  Photo and log any concerns. Address before they become failures
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">Professional Survey</h3>
                <p className="text-xs text-muted-foreground">
                  Every 5 years, have rig professionally surveyed and tension checked
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning Card */}
        <Card className="mb-6 border-2 border-accent bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-accent flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-2">Critical Safety Note</h3>
                <p className="text-sm text-muted-foreground">
                  Rig failure at sea can be catastrophic. Never ignore signs of wear, damage, or looseness. When in
                  doubt, seek professional inspection. Always carry spare shackles, blocks, and line.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist by Area */}
        {areas.map((area) => (
          <Card key={area} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{area}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checks
                .filter((check) => check.area === area)
                .map((check) => (
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
                        onCheckedChange={() => handleCheckItem(check.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor={check.id} className="cursor-pointer block">
                          <h3
                            className={`font-semibold mb-1 ${
                              check.checked ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {check.item}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Look for:</span> {check.lookFor}
                          </p>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}

        {/* Tuning Tips */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rig Tuning Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Proper rig tension is crucial for performance and safety:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-secondary">•</span>
                <span>
                  <strong>Mast should be straight</strong> when viewed from bow, slight bend acceptable from side
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-secondary">•</span>
                <span>
                  <strong>Equal tension</strong> on port and starboard shrouds
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-secondary">•</span>
                <span>
                  <strong>Cap shrouds</strong> should be tighter than lower shrouds
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-secondary">•</span>
                <span>
                  <strong>Forestay tension</strong> affects pointing ability and mast rake
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {checkedCount === checks.length && (
          <Card className="border-2 border-accent bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">🎉 All checks complete! Ready for the quiz?</h3>
                  <p className="text-muted-foreground">Test your rig inspection knowledge</p>
                </div>
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => navigate("/quiz/rig")}
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

export default RigTheory;
