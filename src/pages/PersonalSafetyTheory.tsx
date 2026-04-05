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
  Shield,
  LifeBuoy,
  Link,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import {
  lifeJacketTypes,
  inflationMethods,
  safetyEquipmentTopics,
} from "@/data/personalSafetyEquipment";

const PersonalSafetyTheory = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();
  const [theoryCompleted, setTheoryCompleted] = useState(false);

  const handleMarkComplete = useCallback(() => {
    saveProgress(TOPIC_IDS.SAFETY_PERSONAL, true, 100, 10);
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
              <h1 className="text-xl font-bold">Personal Safety Equipment</h1>
              <p className="text-sm text-muted-foreground">
                Life Jackets, Harnesses & Personal Gear
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="py-2">
              <Shield className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="life-jackets" className="py-2">
              <LifeBuoy className="w-4 h-4 mr-2" />
              Life Jackets
            </TabsTrigger>
            <TabsTrigger value="equipment" className="py-2">
              <Link className="w-4 h-4 mr-2" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="servicing" className="py-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Servicing
            </TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ──────────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">
                Personal Safety Equipment
              </h2>
              <p>
                Personal safety equipment is the last line of defence between
                a crew member and the sea. A Day Skipper must understand the
                different types of life jacket, when to wear them, how they
                work, and how to maintain them. Equally important is
                understanding harnesses, tethers, jacklines, and kill cords
                — the equipment that keeps you on the boat in the first place.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LifeBuoy className="w-5 h-5 text-blue-500" />
                    Life Jackets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Life jackets are rated by buoyancy in Newtons: 100N
                    (buoyancy aid), 150N (standard offshore), and 275N
                    (heavy weather / commercial). The higher the rating,
                    the more likely the jacket will turn an unconscious
                    wearer face-up — even when wearing heavy clothing.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="w-5 h-5 text-amber-500" />
                    Stay on Board
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    The best safety strategy is preventing crew from going
                    overboard. Harnesses, tethers, and jacklines keep you
                    attached to the vessel. A kill cord stops the engine if
                    the helm operator is thrown clear — preventing propeller
                    injury.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm font-medium">
                  <strong>Key principle:</strong> Wear the right life jacket
                  for the conditions, ensure it is properly fitted with a
                  crotch strap fastened, clip on with a harness and tether
                  before conditions deteriorate, and always attach the kill
                  cord when at the helm.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── LIFE JACKETS ─────────────────────────────────────── */}
          <TabsContent value="life-jackets" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Life Jacket Types</h2>
              <p>
                Life jackets are classified by their buoyancy rating in
                Newtons. A Day Skipper must know which rating is appropriate
                for different sailing conditions and understand the
                difference between auto-inflate and manual inflation.
              </p>
            </div>

            {/* Life jacket type cards */}
            <div className="grid gap-4">
              {lifeJacketTypes.map((lj) => (
                <Card key={lj.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{lj.name}</CardTitle>
                      <Badge
                        variant={lj.turnsUnconsciousWearer ? "default" : "outline"}
                        className="gap-1"
                      >
                        {lj.buoyancyRating}
                      </Badge>
                    </div>
                    <CardDescription>{lj.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Suitable For</p>
                        <p className="text-xs text-muted-foreground">
                          {lj.suitableFor}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">
                          Turns Unconscious Wearer
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lj.turnsUnconsciousWearer
                            ? "Yes — will turn a casualty face-up"
                            : "No — buoyancy aid only, does not turn wearer"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Inflation methods */}
            <div className="prose dark:prose-invert max-w-none mt-8">
              <h3 className="text-xl font-bold">
                Inflation Methods: Auto-Inflate vs Manual
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {inflationMethods.map((method) => (
                <Card key={method.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1 text-green-600">
                        Advantages
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {method.advantages}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1 text-red-600">
                        Disadvantages
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {method.disadvantages}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Crotch straps card */}
            <Card className="bg-destructive/5 border-destructive/20 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Crotch Strap — Critical Fitting Point
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-2">
                  A crotch strap passes between the legs and prevents the
                  life jacket from riding up over the wearer&apos;s head in
                  the water. Without a properly fastened crotch strap, a
                  life jacket can slip off entirely in rough seas.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {safetyEquipmentTopics
                    .find((t) => t.id === "crotch-straps")
                    ?.keyPoints.map((point, i) => <li key={i}>{point}</li>)}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── EQUIPMENT (harnesses, tethers, jacklines, kill cords) ── */}
          <TabsContent value="equipment" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">
                Harnesses, Tethers, Jacklines & Kill Cords
              </h2>
              <p>
                Preventing a crew member from going overboard is far more
                effective than recovering them from the water. The following
                equipment works together to keep you on the boat.
              </p>
            </div>

            {safetyEquipmentTopics
              .filter((t) =>
                ["harnesses-tethers", "jacklines", "kill-cords"].includes(t.id),
              )
              .map((topic) => (
                <Card key={topic.id}>
                  <CardHeader>
                    <CardTitle>{topic.name}</CardTitle>
                    <CardDescription>{topic.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {topic.keyPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          {/* ── SERVICING ────────────────────────────────────────── */}
          <TabsContent value="servicing" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">
                Servicing & Maintenance
              </h2>
              <p>
                A life jacket is only as reliable as its last service.
                Inflatable life jackets contain mechanisms that degrade over
                time — regular professional servicing is essential to ensure
                the device will work when your life depends on it.
              </p>
            </div>

            {safetyEquipmentTopics
              .filter((t) => t.id === "servicing")
              .map((topic) => (
                <Card key={topic.id}>
                  <CardHeader>
                    <CardTitle>{topic.name}</CardTitle>
                    <CardDescription>{topic.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                      {topic.keyPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}

            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Safety Warning
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Never assume a life jacket works — check it before every
                    passage.
                  </li>
                  <li>
                    A life jacket that has been accidentally inflated must be
                    re-armed with a new CO₂ cylinder and (for auto-inflate
                    models) a new hydrostatic release before the next use.
                  </li>
                  <li>
                    Brief all crew on how to operate their life jacket at the
                    start of every passage — especially guests and new crew.
                  </li>
                  <li>
                    Ensure every life jacket on board fits its wearer — an
                    ill-fitting jacket can be as dangerous as no jacket at all.
                  </li>
                </ul>
              </CardContent>
            </Card>
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

export default PersonalSafetyTheory;
