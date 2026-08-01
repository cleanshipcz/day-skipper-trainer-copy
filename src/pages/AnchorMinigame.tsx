import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Anchor as AnchorIcon,
  ArrowLeft,
  Compass,
  Flag,
  RefreshCcw,
  Target,
  Wind,
  Waves,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnchorControls } from "@/pages/anchor-minigame/AnchorControls";
import { AnchorResultOverlay, type AnchorResult } from "@/pages/anchor-minigame/AnchorResultOverlay";
import { calculateSceneGeometry } from "@/pages/anchor-minigame/geometry";
import {
  BOAT_LENGTH,
  CONDITION_SCOPE,
  RODE_STEP,
  changeRode as transitionRode,
  checkPlacement as evaluatePlacement,
  createInitialState,
  getTargetRode,
  getTotalDepth,
  moveBoat as transitionBoat,
  type AnchorScenario,
} from "@/pages/anchor-minigame/state";
import { anchorPracticeSkills, anchorTheoryRoute } from "@/features/anchorwork/learningPath";

const scenarioPool: Omit<AnchorScenario, "id">[] = [
  {
    title: "Sheltered cove",
    condition: "mild",
    depth: 5.5,
    bowHeight: 1.1,
    note: "Light breeze, soft mud bottom",
  },
  {
    title: "Harbour afternoon",
    condition: "moderate",
    depth: 7.5,
    bowHeight: 1.2,
    note: "Wind across the bows with ferry wash",
  },
  {
    title: "Open roadstead",
    condition: "strong",
    depth: 9.5,
    bowHeight: 1.3,
    note: "Gusty cross-wind with chop",
  },
  {
    title: "Tidal river bend",
    condition: "moderate",
    depth: 6.2,
    bowHeight: 1.0,
    note: "Weak holding, slight current",
  },
];

let scenarioCounter = 0;

const pickScenario = () => {
  const choice = scenarioPool[Math.floor(Math.random() * scenarioPool.length)];
  scenarioCounter += 1;
  return { ...choice, id: scenarioCounter };
};

const AnchorMinigame = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTopic = searchParams.get("returnTopic") || "scope";
  const [scenario, setScenario] = useState<AnchorScenario>(() => pickScenario());
  const [game, setGame] = useState(createInitialState);
  const [attempts, setAttempts] = useState(0);
  const [lastStatus, setLastStatus] = useState("Tap ↓ to lower the anchor. Drift back with ←.");
  const [resultOverlay, setResultOverlay] = useState<AnchorResult | null>(null);

  const totalDepth = useMemo(() => getTotalDepth(scenario), [scenario]);
  const requiredScope = CONDITION_SCOPE[scenario.condition];
  const targetRode = getTargetRode(scenario);
  const bowTipX = game.boatX + BOAT_LENGTH;
  const scope = game.rode > 0 ? game.rode / totalDepth : 0;
  const anchorAheadBy = game.anchorOnBottom && game.anchorX !== null ? game.anchorX - bowTipX : 0;

  const resetPosition = () => {
    setGame(createInitialState());
    setLastStatus("Anchor stowed. Lower with ↓ and use ← to fall back.");
    setResultOverlay(null);
  };

  const rollScenario = () => {
    const next = pickScenario();
    setScenario(next);
    setAttempts(0);
    resetPosition();
    toast.message("New anchorage", {
      description: `${next.title} • ${next.condition} wind • ${next.depth}m depth`,
    });
  };

  const moveBoat = useCallback(
    (direction: -1 | 1) => {
      const result = transitionBoat(game, direction, totalDepth);
      setGame(result.state);
      setLastStatus(result.status);
    },
    [game, totalDepth],
  );

  const changeRode = useCallback(
    (delta: number) => {
      const result = transitionRode(game, delta, totalDepth);
      setGame(result.state);
      if (result.status) setLastStatus(result.status);
      if (result.event === "anchor-bottom") {
        toast.success("Anchor on the bottom", { description: "Move astern with ← to lay out chain." });
      }
    },
    [game, totalDepth],
  );

  const checkPlacement = useCallback(() => {
    setAttempts((value) => value + 1);
    const result = evaluatePlacement(game, scenario);
    if (result.type === "success") {
      toast.success("Anchor set", {
        description: `${result.message} Well ahead of the bow.`,
      });
      setLastStatus(result.status);
      setResultOverlay(result);
    } else {
      toast.error("Not secure yet", { description: result.message });
      setLastStatus(result.status);
      setResultOverlay(result);
    }
  }, [game, scenario]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement
        && target.closest("button, a, input, select, textarea, [role='button'], [contenteditable='true']")
      ) {
        return;
      }

      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
        event.preventDefault();
      }
      switch (event.key) {
        case "ArrowLeft":
          moveBoat(-1);
          break;
        case "ArrowRight":
          moveBoat(1);
          break;
        case "ArrowUp":
          changeRode(-RODE_STEP);
          break;
        case "ArrowDown":
          changeRode(RODE_STEP);
          break;
        case "Enter":
          checkPlacement();
          break;
        default:
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [changeRode, checkPlacement, moveBoat]);

  const {
    viewWidth, viewHeight, surfaceY, seabedY, boatTopY, boatBottomY, anchorPoint, chainPath, boatPath, toX,
  } = useMemo(() => calculateSceneGeometry(game, scenario), [game, scenario]);

  const scopeColor =
    scope >= requiredScope ? "text-success" : scenario.condition === "strong" ? "text-destructive" : "text-accent";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      <header className="border-b border-border/80 bg-card/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Return to anchorwork theory" onClick={() => navigate(anchorTheoryRoute(returnTopic, "practice"))}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Anchoring Simulator</h1>
              <p className="text-sm text-muted-foreground">
                Side profile • Bow to the right • Use arrows, press Enter to check
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              Attempted {attempts} time{attempts === 1 ? "" : "s"}
            </Badge>
            <Button variant="outline" onClick={rollScenario}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              New setup
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>{scenario.title}</CardTitle>
                <CardDescription>{scenario.note}</CardDescription>
              </div>
              <Badge
                variant={
                  scenario.condition === "mild"
                    ? "secondary"
                    : scenario.condition === "moderate"
                    ? "default"
                    : "destructive"
                }
                className="capitalize"
              >
                <Wind className="w-3.5 h-3.5 mr-1" />
                {scenario.condition} wind
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Water depth</span>
                <span className="font-semibold">{scenario.depth} m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bow roller above water</span>
                <span className="font-semibold">{scenario.bowHeight.toFixed(1)} m</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">Total depth from bow</span>
                <span className="font-semibold text-primary">{totalDepth.toFixed(1)} m</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-ocean" />
                Live readout
              </CardTitle>
              <CardDescription>Stay within the swinging circle.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rode out</span>
                <span className="font-semibold">{game.rode.toFixed(1)} m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Scope</span>
                <span className={`font-semibold ${scopeColor}`}>{scope.toFixed(1)} : 1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Anchor position</span>
                <span className="font-semibold">
                  {game.anchorOnBottom
                    ? anchorAheadBy >= 0
                      ? `${anchorAheadBy.toFixed(1)} m ahead`
                      : `${Math.abs(anchorAheadBy).toFixed(1)} m behind`
                    : "Traveling with boat"}
                </span>
              </div>
              <Badge
                variant="outline"
                className={`w-full justify-center gap-2 text-xs ${
                  game.anchorOnBottom ? "bg-success/10 border-success/50 text-success" : ""
                }`}
              >
                <AnchorIcon className="w-4 h-4" />
                {game.anchorOnBottom ? "Anchor on seabed" : "Anchor not set"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-ocean" />
                Side profile — keep the anchor ahead
              </CardTitle>
              <CardDescription>{lastStatus}</CardDescription>
            </div>
            <AnchorControls
              onMove={moveBoat}
              onChangeRode={changeRode}
              onCheck={checkPlacement}
              rodeStep={RODE_STEP}
            />
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-sky-100/80 via-sky-50 to-ocean-light/30">
              <svg aria-label="Anchoring side profile" viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-full">
                <defs>
                  <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--ocean-light))" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="hsl(var(--ocean))" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <rect x="0" y={surfaceY} width={viewWidth} height={viewHeight - surfaceY} fill="url(#water)" />
                <rect x="0" y={seabedY} width={viewWidth} height={viewHeight - seabedY} fill="hsl(var(--muted))" />
                <line
                  x1="0"
                  y1={seabedY}
                  x2={viewWidth}
                  y2={seabedY}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="1.5"
                  strokeDasharray="8 6"
                />
                <line
                  x1="0"
                  y1={surfaceY}
                  x2={viewWidth}
                  y2={surfaceY}
                  stroke="hsl(var(--ocean))"
                  strokeWidth="2"
                  strokeDasharray="10 6"
                />
                <text x="10" y={surfaceY - 8} fontSize="12" fill="hsl(var(--ocean))">
                  Surface
                </text>
                <text x="10" y={seabedY - 6} fontSize="12" fill="hsl(var(--muted-foreground))">
                  Seabed ({totalDepth.toFixed(1)} m from bow)
                </text>

                {/* Wind indicator */}
                <g transform={`translate(${viewWidth - 170}, ${surfaceY - 20})`}>
                  <Wind
                    className="w-8 h-8"
                    color="hsl(var(--primary))"
                    style={{ opacity: 0.6 }}
                  />
                  <text x="22" y="10" fontSize="12" fill="hsl(var(--foreground))">
                    Wind from ahead
                  </text>
                </g>

                {/* Anchor rode */}
                <path d={chainPath} stroke="hsl(var(--rope))" strokeWidth="3" strokeLinecap="round" fill="none" />

                {/* Anchor */}
                <g transform={`translate(${anchorPoint.x}, ${anchorPoint.y})`}>
                  <path
                    d="M 0 0 L -8 12 M 0 0 L 8 12 M -8 12 L 8 12"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <circle r="3" fill="hsl(var(--primary))" />
                </g>

                {/* Boat */}
                <path d={boatPath} fill="white" stroke="hsl(var(--primary))" strokeWidth="2" />
                <path
                  d={`M ${toX(game.boatX + BOAT_LENGTH - 0.4)} ${boatTopY - 4} L ${toX(
                    game.boatX + BOAT_LENGTH + 0.8,
                  )} ${boatTopY + 2} L ${toX(game.boatX + BOAT_LENGTH - 0.4)} ${boatTopY + 2} Z`}
                  fill="hsl(var(--primary))"
                />
                <line
                  x1={toX(game.boatX + BOAT_LENGTH - 1)}
                  y1={boatTopY - 12}
                  x2={toX(game.boatX + BOAT_LENGTH - 1)}
                  y2={boatTopY + 2}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                />
                <text x={toX(game.boatX + BOAT_LENGTH / 2)} y={boatBottomY + 22} fontSize="12" fill="hsl(var(--foreground))" textAnchor="middle">
                  Bow →
                </text>

                {/* Depth scale */}
                <line
                  x1={toX(game.cameraOrigin + 1)}
                  y1={surfaceY}
                  x2={toX(game.cameraOrigin + 1)}
                  y2={seabedY}
                  stroke="hsl(var(--secondary))"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={toX(game.cameraOrigin + 1)}
                  y={surfaceY + (seabedY - surfaceY) / 2}
                  fontSize="12"
                  fill="hsl(var(--secondary))"
                  textAnchor="start"
                >
                  {totalDepth.toFixed(1)} m
                </text>
              </svg>
              {resultOverlay && (
                <AnchorResultOverlay
                  result={resultOverlay}
                  onContinue={() => {
                    if (resultOverlay.type === "success") rollScenario();
                    setResultOverlay(null);
                  }}
                  onReset={resetPosition}
                  onRemediate={() => navigate(anchorTheoryRoute(resultOverlay.type === "success" ? returnTopic : "scope", "practice"))}
                />
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <AnchorIcon className="w-4 h-4 text-primary" />
                  Win condition
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Anchor on seabed, ahead of the bow, and scope at least {requiredScope}:1 ({targetRode.toFixed(1)}m).
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Flag className="w-4 h-4 text-accent" />
                  Controls
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ← / → move boat • ↓ pay out • ↑ heave in • Enter check. The anchor stops moving with you once it hits bottom.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Target className="w-4 h-4 text-success" />
                  Tip
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Let the boat drift astern after the anchor touches down. Extra scope is needed in stronger wind.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Skills assessed</CardTitle></CardHeader>
          <CardContent><ul className="list-disc pl-5 text-sm text-muted-foreground">{anchorPracticeSkills.map((skill) => <li key={skill}>{skill}</li>)}</ul></CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AnchorMinigame;
