import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  Flame,
  ToggleLeft,
  Wind,
  Box,
  AlertTriangle,
  Radar,
  CheckCircle2,
} from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { gasSafetyTopics } from "@/data/gasSafety";

/**
 * Tab configuration mapping gas safety topic IDs to their display metadata.
 * Order matches the gasSafetyTopics data file for consistent rendering.
 */
const TAB_CONFIG = [
  { topicId: "lpg-properties", icon: Flame, shortLabel: "LPG" },
  { topicId: "isolation-valves", icon: ToggleLeft, shortLabel: "Valves" },
  { topicId: "bilge-sniff-test", icon: Wind, shortLabel: "Sniff Test" },
  { topicId: "gas-locker-requirements", icon: Box, shortLabel: "Locker" },
  { topicId: "carbon-monoxide", icon: AlertTriangle, shortLabel: "CO" },
  { topicId: "detector-placement", icon: Radar, shortLabel: "Detectors" },
] as const;

const GasSafetyTheory = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();
  const [theoryCompleted, setTheoryCompleted] = useState(false);

  const handleMarkComplete = useCallback(() => {
    saveProgress(TOPIC_IDS.SAFETY_GAS, true, 100, 10);
    setTheoryCompleted(true);
  }, [saveProgress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="back"
              onClick={() => navigate("/safety")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Gas Safety</h1>
              <p className="text-sm text-muted-foreground">
                LPG & Carbon Monoxide Risks Aboard
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="lpg-properties" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
            {TAB_CONFIG.map(({ topicId, icon: Icon, shortLabel }) => (
              <TabsTrigger key={topicId} value={topicId} className="py-2">
                <Icon className="w-4 h-4 mr-2" />
                {shortLabel}
              </TabsTrigger>
            ))}
          </TabsList>

          {gasSafetyTopics.map((topic) => (
            <TabsContent key={topic.id} value={topic.id} className="space-y-6">
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold">{topic.title}</h2>
                <p>{topic.content}</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Key Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    {topic.keyPoints.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Completion button + back navigation */}
        <div className="flex flex-col items-center gap-4 pt-12 pb-8">
          <Button
            size="lg"
            className="w-full md:w-auto gap-2"
            variant={theoryCompleted ? "outline" : "default"}
            disabled={theoryCompleted}
            onClick={handleMarkComplete}
          >
            {theoryCompleted ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Completed
              </>
            ) : (
              "Mark as Complete"
            )}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => navigate("/safety")}
          >
            Back to Safety Menu
          </Button>
        </div>
      </main>
    </div>
  );
};

export default GasSafetyTheory;
