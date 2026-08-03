import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { AnchorScene } from "@/pages/anchor-minigame/AnchorScene";
import { AnchorResultOverlay, type AnchorResult } from "@/pages/anchor-minigame/AnchorResultOverlay";
import { calculateSceneGeometry } from "@/pages/anchor-minigame/geometry";
import {
  BOAT_LENGTH,
  RODE_STEP,
  applySettingLoad,
  applyWindTideChange,
  changeRode as transitionRode,
  checkPlacement as evaluatePlacement,
  createInitialState,
  getTargetRode,
  getCurrentVerticalDistance,
  getMaximumVerticalDistance,
  getPlannedSwingRadius,
  getSweptRadius,
  moveBoat as transitionBoat,
  recoverSafely,
  runAnchorWatch,
  startHoldingObservation,
  type AnchorScenario,
} from "@/pages/anchor-minigame/state";
import { anchorPracticeSkills, anchorTheoryRoute } from "@/features/anchorwork/learningPath";

const scenarioPool: Omit<AnchorScenario, "id">[] = [
  {
    title: "Sheltered cove",
    condition: "mild",
    depth: 5.5,
    tideRise: 1.4,
    bowHeight: 1.1,
    note: "Light breeze and weak current; firm mud with clear swinging room",
    rode: "10 m chain plus nylon rode",
    anchorAndVessel: "Manufacturer-approved bower anchor for this training yacht",
    seabed: "Firm mud; local guidance permits anchoring",
    minimumRode: 32,
    availableSwingRadius: 50,
    vesselExtent: 8,
    safetyAllowance: 3,
    hazards: [{ label: "shoal", distance: 55, clearance: 5, bearing: 55 }],
    neighbours: [{ label: "yacht on chain", distance: 75, swingRadius: 20, bearing: 210 }],
    weakHolding: false,
    minimumSetDistance: 3,
    minimumSetLoadSteps: 3,
    guidance: "Use 32–42 m for this fixture, set progressively astern, then verify holding.",
    basis: ["RNLI SAR Unit 9, p. 67", "MCA MGN 592 §§2.3–2.4"],
  },
  {
    title: "Harbour afternoon",
    condition: "moderate",
    depth: 7.5,
    tideRise: 1.8,
    bowHeight: 1.2,
    note: "Wind across the bows with ferry wash",
    rode: "All-chain rode",
    anchorAndVessel: "Manufacturer-approved bower anchor for this training yacht",
    seabed: "Good-holding sand; anchoring permitted by local guidance",
    minimumRode: 48,
    availableSwingRadius: 66,
    vesselExtent: 8,
    safetyAllowance: 4,
    hazards: [{ label: "harbour wall", distance: 70, clearance: 6, bearing: 90 }],
    neighbours: [{ label: "motor cruiser", distance: 90, swingRadius: 25, bearing: 245 }],
    weakHolding: false,
    minimumSetDistance: 4,
    minimumSetLoadSteps: 4,
    guidance: "Use 48–58 m for the forecast load and available room; verify the set after ferry wash.",
    basis: ["RNLI SAR Unit 9, p. 67", "MCA MGN 592 §§2.3–2.4"],
  },
  {
    title: "Open roadstead",
    condition: "strong",
    depth: 9.5,
    tideRise: 2.2,
    bowHeight: 1.3,
    note: "Gusty cross-wind with chop",
    rode: "All-chain rode",
    anchorAndVessel: "Heavy-weather anchor approved for this training yacht",
    seabed: "Firm sand; no protected habitat in the exercise fixture",
    minimumRode: 78,
    availableSwingRadius: 96,
    vesselExtent: 8,
    safetyAllowance: 6,
    hazards: [{ label: "lee-shore safety zone", distance: 105, clearance: 8, bearing: 140 }],
    neighbours: [{ label: "yacht on mixed rode", distance: 130, swingRadius: 30, bearing: 300 }],
    weakHolding: false,
    minimumSetDistance: 5,
    minimumSetLoadSteps: 5,
    guidance: "Use 78–88 m for this exposed fixture and confirm holding under progressive load.",
    basis: ["RNLI SAR Unit 9, p. 67", "MCA MGN 592 §§2.3–2.4", "RYA anchoring and mooring guidance"],
  },
  {
    title: "Tidal river bend",
    condition: "moderate",
    depth: 6.2,
    tideRise: 2.6,
    bowHeight: 1.0,
    note: "Reversing current; soft mud and restricted swinging room",
    rode: "8 m chain plus nylon rode",
    anchorAndVessel: "Manufacturer-approved bower anchor for this training yacht",
    seabed: "Soft mud; local guidance permits anchoring",
    minimumRode: 46,
    availableSwingRadius: 60,
    vesselExtent: 8,
    safetyAllowance: 5,
    hazards: [{ label: "outside of bend", distance: 68, clearance: 8, bearing: 35 }],
    neighbours: [{ label: "barge with short chain", distance: 95, swingRadius: 28, bearing: 190 }],
    weakHolding: true,
    minimumSetDistance: 4,
    minimumSetLoadSteps: 4,
    guidance: "Use 46–52 m; the upper bound preserves clearance when the current reverses.",
    basis: ["RNLI SAR Unit 9, p. 67", "MCA MGN 592 §§2.3–2.4"],
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
  const gameRef = useRef(game);
  gameRef.current = game;
  const [attempts, setAttempts] = useState(0);
  const [lastStatus, setLastStatus] = useState("Tap ↓ to lower the anchor. Drift back with ←.");
  const [resultOverlay, setResultOverlay] = useState<AnchorResult | null>(null);

  const currentVerticalDistance = useMemo(() => getCurrentVerticalDistance(scenario), [scenario]);
  const maximumVerticalDistance = useMemo(() => getMaximumVerticalDistance(scenario), [scenario]);
  const targetRode = getTargetRode(scenario);
  const requiredScope = targetRode / maximumVerticalDistance;
  const bowTipX = game.boatX + BOAT_LENGTH;
  const scope = game.rode > 0 ? game.rode / maximumVerticalDistance : 0;
  const plannedSwingRadius = getPlannedSwingRadius(game.rode, scenario);
  const sweptRadius = getSweptRadius(game.rode, scenario);
  const planMaximumExtent = Math.max(
    scenario.availableSwingRadius,
    sweptRadius,
    ...scenario.hazards.map(({ distance, clearance }) => distance + clearance),
    ...scenario.neighbours.map(({ distance, swingRadius }) => distance + swingRadius),
  );
  const planScale = 150 / planMaximumExtent;
  const anchorAheadBy = game.anchorOnBottom && game.anchorX !== null ? game.anchorX - bowTipX : 0;

  const resetPosition = () => {
    const initialState = createInitialState();
    gameRef.current = initialState;
    setGame(initialState);
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
      const result = transitionBoat(gameRef.current, direction, currentVerticalDistance);
      gameRef.current = result.state;
      setGame(result.state);
      setLastStatus(result.status);
    },
    [currentVerticalDistance],
  );

  const changeRode = useCallback(
    (delta: number) => {
      const result = transitionRode(gameRef.current, delta, currentVerticalDistance);
      gameRef.current = result.state;
      setGame(result.state);
      if (result.status) setLastStatus(result.status);
      if (result.event === "anchor-bottom") {
        toast.success("Anchor on the bottom", { description: "Move astern with ← to lay out chain." });
      }
    },
    [currentVerticalDistance],
  );

  const checkPlacement = useCallback(() => {
    setAttempts((value) => value + 1);
    const result = evaluatePlacement(game, scenario);
    if (result.type === "failure"
      && result.issues.includes("verification")
      && !result.issues.includes("procedure")
      && !result.issues.includes("scope")) {
      setGame(startHoldingObservation(game));
      setLastStatus("Fixed-position observation started. Hold the progressive setting load and re-check after 5 seconds without moving or changing rode.");
    }
    if (result.type === "success") {
      toast.success("Modeled placement passed", {
        description: result.message,
      });
      setLastStatus(result.status);
      setResultOverlay(result);
    } else {
      toast.error("Checks not passed", { description: result.message });
      setLastStatus(result.status);
      setResultOverlay(result);
    }
  }, [game, scenario]);

  const applyLoad = useCallback(() => {
    const result = applySettingLoad(game, scenario);
    setGame(result.state);
    setLastStatus(result.status);
  }, [game, scenario]);

  const applyChange = useCallback(() => {
    const result = applyWindTideChange(game, scenario);
    setGame(result.state);
    setLastStatus(result.status);
  }, [game, scenario]);

  const watchAnchor = useCallback(() => {
    const result = runAnchorWatch(game, scenario);
    setGame(result.state);
    setLastStatus(result.status);
  }, [game, scenario]);

  const recover = useCallback(() => {
    const result = recoverSafely(game);
    setGame(result.state);
    setLastStatus(result.status);
    setResultOverlay(null);
  }, [game]);

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
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Further rise of tide</span>
                <span className="font-semibold">{scenario.tideRise.toFixed(1)} m</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">Total depth from bow</span>
                <span className="font-semibold text-primary">{currentVerticalDistance.toFixed(1)} m now / {maximumVerticalDistance.toFixed(1)} m at high tide</span>
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
              onApplyLoad={applyLoad}
              onApplyChange={applyChange}
              onWatch={watchAnchor}
              onRecover={recover}
              rodeStep={RODE_STEP}
            />
          </CardHeader>

          <CardContent className="space-y-4">
            <AnchorScene onMove={moveBoat} onChangeRode={changeRode} rodeStep={RODE_STEP}>
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
                  Seabed ({currentVerticalDistance.toFixed(1)} m from bow now)
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
                  {currentVerticalDistance.toFixed(1)} m
                </text>
              </svg>
              {resultOverlay && (
                <div className="absolute inset-0 z-10">
                  <AnchorResultOverlay
                    result={resultOverlay}
                    onContinue={() => {
                      if (resultOverlay.type === "success") rollScenario();
                      setResultOverlay(null);
                    }}
                    onReset={resetPosition}
                    onRemediate={() => navigate(anchorTheoryRoute(resultOverlay.type === "success"
                      ? returnTopic
                      : resultOverlay.issues?.includes("procedure") ? "procedure"
                      : resultOverlay.issues?.includes("watch") ? "swinging-room" : "scope", "practice"))}
                  />
                </div>
              )}
            </AnchorScene>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <AnchorIcon className="w-4 h-4 text-primary" />
                  Win condition
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lower under control, apply at least {scenario.minimumSetLoadSteps} progressive astern load steps over {scenario.minimumSetDistance.toFixed(1)}m, and use at least {targetRode.toFixed(1)}m ({requiredScope.toFixed(1)}:1 at high tide).
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Flag className="w-4 h-4 text-accent" />
                  Controls
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Deploy and set, start the timed observation, apply the wind/tide change, then run the anchor watch. Use safe recovery if dragging is detected.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Target className="w-4 h-4 text-success" />
                  Tip
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {scenario.guidance} Simplified: the circular worst-case sweep uses straight-line rode geometry and fixed fixture positions. Actual catenary, yaw, traffic, equipment condition and neighbour response remain unmodeled.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Plan view — worst-case swept area</CardTitle>
            <CardDescription>Full circle assumes any wind/current direction after the forecast change.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <svg aria-label="Anchoring swept-area plan" viewBox="0 0 520 360" className="w-full max-h-96 rounded-lg border bg-muted/20">
              <circle data-testid="room-boundary" cx="260" cy="180" r={scenario.availableSwingRadius * planScale} fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              <circle data-testid="swept-area" cx="260" cy="180" r={sweptRadius * planScale} fill="hsl(var(--ocean-light))" fillOpacity="0.25" stroke={sweptRadius > scenario.availableSwingRadius ? "hsl(var(--destructive))" : "hsl(var(--ocean))"} strokeWidth="3" strokeDasharray="8 5" />
              <circle cx="260" cy="180" r="5" fill="hsl(var(--primary))" />
              <text x="268" y="174" fontSize="12">Anchor</text>
              {scenario.hazards.map((hazard) => {
                const radians = hazard.bearing * Math.PI / 180;
                const scale = planScale;
                const x = 260 + Math.sin(radians) * hazard.distance * scale;
                const y = 180 - Math.cos(radians) * hazard.distance * scale;
                return <g key={hazard.label}><circle cx={x} cy={y} r={hazard.clearance * scale} fill="hsl(var(--destructive))" fillOpacity="0.3" /><text x={x + 6} y={y} fontSize="11">{hazard.label}</text></g>;
              })}
              {scenario.neighbours.map((neighbour) => {
                const radians = neighbour.bearing * Math.PI / 180;
                const scale = planScale;
                const x = 260 + Math.sin(radians) * neighbour.distance * scale;
                const y = 180 - Math.cos(radians) * neighbour.distance * scale;
                return <g key={neighbour.label}><circle cx={x} cy={y} r={neighbour.swingRadius * scale} fill="hsl(var(--accent))" fillOpacity="0.25" stroke="hsl(var(--accent))" /><text x={x + 6} y={y} fontSize="11">{neighbour.label}</text></g>;
              })}
            </svg>
            <p className="text-sm text-muted-foreground">Rode reach + vessel extent = {plannedSwingRadius.toFixed(1)}m; safety allowance = {scenario.safetyAllowance.toFixed(1)}m; full swept radius = {sweptRadius.toFixed(1)}m within {scenario.availableSwingRadius.toFixed(1)}m scenario room.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Scenario assumptions and reviewed basis</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Rode:</strong> {scenario.rode}</p>
            <p><strong className="text-foreground">Anchor/vessel:</strong> {scenario.anchorAndVessel}</p>
            <p><strong className="text-foreground">Seabed/local guidance:</strong> {scenario.seabed}</p>
            <p><strong className="text-foreground">Modeled room:</strong> {scenario.availableSwingRadius.toFixed(1)}m radius; the full swept area includes {scenario.vesselExtent.toFixed(1)}m vessel extent and {scenario.safetyAllowance.toFixed(1)}m safety allowance.</p>
            <p><strong className="text-foreground">Hazards:</strong> {scenario.hazards.map(({ label, distance, clearance }) => `${label} at ${distance}m with ${clearance}m exclusion`).join("; ")}.</p>
            <p><strong className="text-foreground">Differently swinging neighbours:</strong> {scenario.neighbours.map(({ label, distance, swingRadius }) => `${label} at ${distance}m, ${swingRadius}m radius`).join("; ")}.</p>
            <p><strong className="text-foreground">Basis:</strong> {scenario.basis.join("; ")}. These sources support the factors and checks; the numeric exercise bounds are conservative training fixtures, not universal recommendations.</p>
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
