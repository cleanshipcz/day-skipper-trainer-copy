import { useNavigate, useSearchParams } from "react-router-dom";
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
import { carbonMonoxideSources, gasLockerReview, gasLockerSources, gasSafetyTopics } from "@/data/gasSafety";

import { GasLockerDrainDiagram } from "@/components/safety/GasLockerDrainDiagram";
import { GasSafetyPractice } from "@/components/safety/GasSafetyPractice";
import { useAuth } from "@/contexts/AuthHooks";

/**
 * Tab configuration mapping gas safety topic IDs to their display metadata.
 * Order matches the gasSafetyTopics data file for consistent rendering.
 */
const TAB_CONFIG = [
  { topicId: "lpg-properties", icon: Flame, shortLabel: "LPG" },
  { topicId: "isolation-valves", icon: ToggleLeft, shortLabel: "Valves" },
  { topicId: "bilge-sniff-test", icon: Wind, shortLabel: "Leak Response" },
  { topicId: "gas-locker-requirements", icon: Box, shortLabel: "Locker" },
  { topicId: "carbon-monoxide", icon: AlertTriangle, shortLabel: "CO" },
  { topicId: "detector-placement", icon: Radar, shortLabel: "Detectors" },
] as const;

const GasSafetyTheory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromVictualling = searchParams.get("from") === "victualling";
  const backDestination = fromVictualling ? "/victualling" : "/safety";
  const { saveProgress } = useProgress();
  const { user } = useAuth();
  const [theoryCompleted, setTheoryCompleted] = useState(false);
  const [, setPracticeMastery] = useState<unknown>(null);

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
              onClick={() => navigate(backDestination)}
            >
              <ArrowLeft aria-hidden="true" className="w-5 h-5" />
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
        <Card className="mb-6"><CardContent className="pt-6 text-sm text-muted-foreground">Apply the vessel's documented procedures, appliance and detector manufacturer instructions, competent inspection advice and applicable rules. Installation details and required checks vary; if the system is unfamiliar, damaged or suspect, isolate it and obtain competent help.</CardContent></Card>
        <Tabs defaultValue="lpg-properties" className="space-y-6">
          <TabsList aria-label="Gas safety lesson sections" className="grid h-auto w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {TAB_CONFIG.map(({ topicId, icon: Icon, shortLabel }) => (
              <TabsTrigger key={topicId} value={topicId} className="h-auto min-h-11 whitespace-normal py-2">
                <Icon aria-hidden="true" className="mr-2 size-4 shrink-0" />
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
              {topic.id === "gas-locker-requirements" && (
                <>
                  <GasLockerDrainDiagram />
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Source scope and review status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        Sources checked {gasLockerReview.sourceCheckedOn}. {gasLockerReview.releaseNote}
                      </p>
                      <ul className="list-disc space-y-2 pl-5">
                        {gasLockerSources.map((source) => (
                          <li key={source.id}>
                            <a
                              href={source.href}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary underline underline-offset-4"
                            >
                              {source.label}
                            </a>
                            <span className="text-muted-foreground"> — {source.scope}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              )}
              {topic.id === "carbon-monoxide" && <Card><CardHeader><CardTitle className="text-base">CO source scope</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p className="text-muted-foreground">Educational guidance checked 2026-08-12. The alarm and vessel manufacturer instructions control exact installation and operation; seek urgent professional medical advice after suspected exposure.</p><ul className="list-disc space-y-2 pl-5">{carbonMonoxideSources.map(source => <li key={source.id}><a href={source.href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">{source.label}</a><span className="text-muted-foreground"> — {source.scope}</span></li>)}</ul></CardContent></Card>}
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-10"><GasSafetyPractice evidenceOwnerKey={`${user?.id ?? "anonymous"}:gas-safety-practice-v1`} onMastery={setPracticeMastery} /></div>

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
                <CheckCircle2 aria-hidden="true" className="w-5 h-5" />
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
            onClick={() => navigate(backDestination)}
          >
            {fromVictualling ? "Back to Victualling" : "Back to Safety Menu"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default GasSafetyTheory;
