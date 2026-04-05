import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertTriangle,
  Ship,
  Package,
  Anchor,
  Gamepad2,
  CheckCircle2,
} from "lucide-react";
import { AbandonShipSortingGame } from "@/components/safety/AbandonShipSortingGame";
import { useProgress } from "@/hooks/useProgress";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import {
  lifeRaftTypes,
  solasPackContents,
  deploymentProcedureSteps,
  boardingProcedureSteps,
  actionsInRaftSteps,
} from "@/data/lifeRaftProcedures";

const LifeRaftTheory = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();
  const [theoryCompleted, setTheoryCompleted] = useState(false);

  const handleMarkComplete = useCallback(() => {
    saveProgress(TOPIC_IDS.SAFETY_LIFE_RAFT, true, 100, 10);
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
              <h1 className="text-xl font-bold">Life Raft & Abandon Ship</h1>
              <p className="text-sm text-muted-foreground">
                Deployment, Boarding & Survival Procedures
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="when-to-abandon" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
            <TabsTrigger value="when-to-abandon" className="py-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              When to Abandon
            </TabsTrigger>
            <TabsTrigger value="raft-types" className="py-2">
              <Ship className="w-4 h-4 mr-2" />
              Raft Types
            </TabsTrigger>
            <TabsTrigger value="solas-pack" className="py-2">
              <Package className="w-4 h-4 mr-2" />
              SOLAS Pack
            </TabsTrigger>
            <TabsTrigger value="deployment" className="py-2">
              <Anchor className="w-4 h-4 mr-2" />
              Deployment
            </TabsTrigger>
            <TabsTrigger value="drill" className="py-2">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Drill
            </TabsTrigger>
          </TabsList>

          {/* ── WHEN TO ABANDON SHIP ───────────────────────────────── */}
          <TabsContent value="when-to-abandon" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">When to Abandon Ship</h2>
              <p>
                Abandoning your vessel is an absolute last resort. A yacht, even
                damaged, is a far better survival platform than a life raft.
                The golden rule is: <strong>step UP into the life raft</strong> —
                meaning your vessel should be sinking beneath you before you leave.
              </p>
            </div>

            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Abandon Ship Only When:
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>The vessel is sinking and cannot be saved</li>
                  <li>Fire is uncontrollable and spreading</li>
                  <li>The vessel is structurally breaking up</li>
                  <li>The skipper gives the order to abandon</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm font-medium">
                  <strong>Key principle:</strong> Your vessel provides shelter,
                  visibility, and supplies. A life raft is cold, wet, and
                  difficult to spot. Never abandon ship prematurely — many crews
                  have been rescued from vessels that were later found still
                  afloat.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── LIFE RAFT TYPES ────────────────────────────────────── */}
          <TabsContent value="raft-types" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Life Raft Types</h2>
              <p>
                Life rafts for leisure sailing fall into three main categories.
                Choosing the right type depends on your sailing area and passage
                distance.
              </p>
            </div>

            <div className="grid gap-4">
              {lifeRaftTypes.map((raft) => (
                <Card key={raft.id}>
                  <CardHeader>
                    <CardTitle>{raft.name}</CardTitle>
                    <CardDescription>{raft.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {raft.features.map((feature) => (
                        <li key={feature}>&#x2713; {feature}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── SOLAS PACK CONTENTS ────────────────────────────────── */}
          <TabsContent value="solas-pack" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">SOLAS Pack Contents</h2>
              <p>
                The SOLAS B equipment pack is the standard for offshore yacht
                life rafts. Know what is inside — you will need to use this
                equipment to survive.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {solasPackContents.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {item.purpose}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── DEPLOYMENT, BOARDING & ACTIONS ──────────────────────── */}
          <TabsContent value="deployment" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Deployment Procedure</h2>
              <p>
                Deploying a life raft under pressure requires a clear,
                practiced procedure. The painter must be secured before
                launching the canister.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {deploymentProcedureSteps.map((step) => (
                    <li key={step.id}>{step.text}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Boarding Procedure</h2>
              <p>
                Board the raft quickly and carefully. Staying dry is critical
                to preventing hypothermia.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {boardingProcedureSteps.map((step) => (
                    <li key={step.id}>{step.text}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Actions in the Raft</h2>
              <p>
                Once aboard, immediate actions focus on stabilising the raft,
                maintaining warmth, and preparing for rescue.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {actionsInRaftSteps.map((step) => (
                    <li key={step.id}>{step.text}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── DRILL TAB ──────────────────────────────────────────── */}
          <TabsContent value="drill" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Abandon Ship Procedure Drill</h2>
              <p>
                Test your knowledge: put the steps in the correct order. In a
                real emergency, hesitation costs lives.
              </p>
            </div>

            <AbandonShipSortingGame />

            <div className="mt-8 p-6 bg-muted/50 rounded-xl text-center border">
              <h3 className="text-lg font-bold mb-2">
                Ready for the Quiz?
              </h3>
              <p className="text-muted-foreground mb-4">
                Challenge yourself with questions on life raft procedures.
              </p>
              <Button
                onClick={() => navigate("/quiz/safety-life-raft-quiz")}
                className="min-w-[200px]"
              >
                Take the Life Raft Quiz
              </Button>
            </div>
          </TabsContent>
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

export default LifeRaftTheory;
