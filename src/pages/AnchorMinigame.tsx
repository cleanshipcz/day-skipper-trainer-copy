import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Anchor as AnchorIcon,
  ArrowLeft,
  Compass,
  Flag,
  RefreshCcw,
  Target,
  Trophy,
  Wind,
  Waves,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Condition = "mild" | "moderate" | "strong";

interface Scenario {
  id: number;
  title: string;
  condition: Condition;
  depth: number; // charted depth in meters
  bowHeight: number; // meters above the water
  note: string;
}

const CONDITION_SCOPE: Record<Condition, number> = {
  mild: 4, // calm chain: 4x+
  moderate: 5, // breezy chain: 5x+
  strong: 7, // tough holding: 7x+
};

const WORLD_LENGTH = 42; // meters visible across the SVG
const BOAT_LENGTH = 8; // meters
const MOVE_STEP = 0.8; // meters per key press
const RODE_STEP = 1; // meters per key press
const MAX_RODE = 120; // meters

const scenarioPool: Omit<Scenario, "id">[] = [
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
  const [scenario, setScenario] = useState<Scenario>(() => pickScenario());
  const startingBoatX = WORLD_LENGTH / 2 - BOAT_LENGTH / 2;
  const startingCamera = startingBoatX + BOAT_LENGTH / 2 - WORLD_LENGTH / 2;
  const [boatX, setBoatX] = useState(startingBoatX);
  const [cameraOrigin, setCameraOrigin] = useState(startingCamera);
  const [rode, setRode] = useState(0);
  const [anchorOnBottom, setAnchorOnBottom] = useState(false);
  const [anchorX, setAnchorX] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lastStatus, setLastStatus] = useState("Tap ↓ to lower the anchor. Drift back with ←.");
  const [resultOverlay, setResultOverlay] = useState<{ type: "success" | "failure"; message: string } | null>(null);

  const totalDepth = useMemo(() => scenario.depth + scenario.bowHeight, [scenario]);
  const requiredScope = CONDITION_SCOPE[scenario.condition];
  const targetRode = requiredScope * totalDepth;
  const bowX = boatX + BOAT_LENGTH / 2;
  const bowTipX = boatX + BOAT_LENGTH;
  const bowAttachX = bowTipX - 0.3;
  const scope = rode > 0 ? rode / totalDepth : 0;

  const horizontalAllowance =
    anchorOnBottom && rode >= totalDepth
      ? Math.sqrt(Math.max(rode * rode - totalDepth * totalDepth, 0))
      : 0;

  const anchorAheadBy = anchorOnBottom && anchorX !== null ? anchorX - bowTipX : 0;
  const anchorDepthBelowSurface = anchorOnBottom
    ? scenario.depth
    : Math.min(Math.max(rode - scenario.bowHeight, 0), scenario.depth);

  const resetPosition = () => {
    setBoatX(startingBoatX);
    setCameraOrigin(startingCamera);
    setRode(0);
    setAnchorOnBottom(false);
    setAnchorX(null);
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
      let nextBoat = boatX + direction * MOVE_STEP;

      if (anchorOnBottom && anchorX !== null && horizontalAllowance) {
        const candidateBow = nextBoat + BOAT_LENGTH - 0.3;
        const limitedBow = Math.min(
          Math.max(candidateBow, anchorX - horizontalAllowance),
          anchorX + horizontalAllowance,
        );
        nextBoat = limitedBow - (BOAT_LENGTH - 0.3);
      }

      const viewLeft = cameraOrigin;
      const viewRight = cameraOrigin + WORLD_LENGTH;
      const nextBowTip = nextBoat + BOAT_LENGTH;
      const leftMargin = viewLeft + WORLD_LENGTH * 0.25;
      const rightMargin = viewRight - WORLD_LENGTH * 0.25;
      let nextCamera = cameraOrigin;

      if (nextBowTip > rightMargin) {
        nextCamera = nextBowTip - WORLD_LENGTH * 0.75;
      } else if (nextBoat < leftMargin) {
        nextCamera = nextBoat - WORLD_LENGTH * 0.25;
      }

      setBoatX(nextBoat);
      setCameraOrigin(nextCamera);
      setLastStatus(direction === -1 ? "Drifting back from the anchor" : "Motoring ahead over the anchor");
    },
    [anchorOnBottom, anchorX, boatX, cameraOrigin, horizontalAllowance],
  );

  const changeRode = useCallback(
    (delta: number) => {
      setRode((prev) => {
        const proposed = Math.min(Math.max(prev + delta, 0), MAX_RODE);

        // Anchor still traveling with the boat.
        if (!anchorOnBottom) {
          if (proposed >= totalDepth) {
            setAnchorOnBottom(true);
            setAnchorX(bowAttachX);
            setLastStatus("Anchor just touched the seabed — it will stay put now.");
            toast.success("Anchor on the bottom", { description: "Move astern with ← to lay out chain." });
          }
          return proposed;
        }

        // Anchor is set on the bottom: keep enough rode to reach it.
        if (anchorOnBottom && anchorX !== null) {
          const horizontal = Math.abs(anchorX - bowAttachX);
          const minRode = Math.hypot(totalDepth, horizontal);

          // If we are still offset from the anchor, clamp to the taut length so it doesn't teleport.
          if (proposed < minRode && horizontal > 0.6) {
            setLastStatus("Rode is taut — move the bow toward the anchor before heaving more.");
            return minRode;
          }

          // If we are above the anchor and mostly vertical, allow lifting it.
          if (horizontal <= 0.6 && proposed < totalDepth * 0.95) {
            setAnchorOnBottom(false);
            setAnchorX(null);
            setLastStatus("Anchor coming up — keep heaving.");
            return Math.max(proposed, totalDepth * 0.85);
          }

          return proposed;
        }

        return proposed;
      });
    },
    [anchorOnBottom, anchorX, bowAttachX, totalDepth],
  );

  const checkPlacement = useCallback(() => {
    setAttempts((value) => value + 1);
    const issues: string[] = [];

    if (!anchorOnBottom || anchorX === null) {
      issues.push("anchor never made it to the seabed");
    }

    if (anchorOnBottom && anchorX !== null && anchorX - bowTipX <= 0.5) {
      issues.push("anchor ended up under/behind the bow");
    }

    if (rode < targetRode) {
      issues.push(`scope short by ${(targetRode - rode).toFixed(1)}m`);
    }

    if (issues.length === 0) {
      toast.success("Anchor set", {
        description: `Scope ${scope.toFixed(1)}x with ${rode.toFixed(1)}m out. Well ahead of the bow.`,
      });
      setLastStatus("Secure: anchor is ahead with enough scope.");
      setResultOverlay({
        type: "success",
        message: `Scope ${scope.toFixed(1)}x with ${rode.toFixed(1)}m out.`,
      });
    } else {
      toast.error("Not secure yet", { description: issues.join(" • ") });
      setLastStatus("Adjust and try again — keep anchor ahead with enough chain.");
      setResultOverlay({
        type: "failure",
        message: issues.join(" • "),
      });
    }
  }, [anchorOnBottom, anchorX, bowTipX, rode, scope, targetRode]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
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

  const viewWidth = 760;
  const viewHeight = 360;
  const horizontalMargin = 28;
  const xScale = (viewWidth - horizontalMargin * 2) / WORLD_LENGTH;
  const verticalSpan = scenario.depth + scenario.bowHeight + 1.5;
  const yScale = (viewHeight - 140) / verticalSpan;
  const surfaceY = 70;
  const seabedY = surfaceY + scenario.depth * yScale;

  const toX = (meters: number) => horizontalMargin + (meters - cameraOrigin) * xScale;
  const toY = (meters: number) => surfaceY + meters * yScale;

  const boatTopY = surfaceY - 18;
  const boatBottomY = surfaceY + 10;

  const { anchorAttachPoint, anchorPoint, slackMeters, chainPath, boatPath } = useMemo(() => {
    const mapX = (meters: number) => horizontalMargin + (meters - cameraOrigin) * xScale;
    const mapY = (meters: number) => surfaceY + meters * yScale;

    const nextAnchorAttachPoint = {
      x: mapX(bowAttachX),
      y: surfaceY - Math.min(scenario.bowHeight * yScale, 18),
    };

    const nextAnchorPoint = {
      x: mapX(anchorOnBottom && anchorX !== null ? anchorX : bowAttachX),
      y: mapY(anchorDepthBelowSurface),
    };

    const dxMeters = (nextAnchorPoint.x - nextAnchorAttachPoint.x) / xScale;
    const dyMeters = (nextAnchorPoint.y - nextAnchorAttachPoint.y) / yScale;
    const nextSlackMeters = Math.max(rode - Math.hypot(dxMeters, dyMeters), 0);

    const start = nextAnchorAttachPoint;
    const saggyEnd = (() => {
      if (!anchorOnBottom || nextSlackMeters <= 0) return nextAnchorPoint;
      const slackDirection = anchorX !== null ? Math.sign(anchorX - bowAttachX || 1) : 1;
      const seabedSlack = Math.min(nextSlackMeters, 30);
      return {
        x: nextAnchorPoint.x - slackDirection * seabedSlack * xScale * 0.6,
        y: nextAnchorPoint.y,
      };
    })();

    const segments = 18;
    const sagPx = Math.min(nextSlackMeters * xScale * 1.2 + 12, 260);
    const commands: string[] = [];

    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      const x = start.x + (saggyEnd.x - start.x) * t;
      const baseY = start.y + (saggyEnd.y - start.y) * t;
      const sag = Math.sin(Math.PI * t) * sagPx;
      const y = Math.min(baseY + sag, seabedY);
      commands.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }

    if (anchorOnBottom && nextSlackMeters > 0 && saggyEnd.x !== nextAnchorPoint.x) {
      commands.push(`L ${nextAnchorPoint.x.toFixed(2)} ${nextAnchorPoint.y.toFixed(2)}`);
    }

    const nextBoatPath = `
    M ${mapX(boatX - 0.6)} ${boatTopY}
    L ${mapX(boatX + BOAT_LENGTH + 0.6)} ${boatTopY + 6}
    L ${mapX(boatX + BOAT_LENGTH - 0.8)} ${boatBottomY}
    L ${mapX(boatX - 1)} ${boatBottomY}
    Z
  `;

    return {
      anchorAttachPoint: nextAnchorAttachPoint,
      anchorPoint: nextAnchorPoint,
      slackMeters: nextSlackMeters,
      chainPath: commands.join(" "),
      boatPath: nextBoatPath,
    };
  }, [anchorOnBottom, anchorDepthBelowSurface, anchorX, boatBottomY, boatTopY, boatX, bowAttachX, cameraOrigin, horizontalMargin, rode, scenario.bowHeight, seabedY, surfaceY, xScale, yScale]);

  const scopeColor =
    scope >= requiredScope ? "text-success" : scenario.condition === "strong" ? "text-destructive" : "text-accent";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      <header className="border-b border-border/80 bg-card/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/anchorwork")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Anchoring Simulator</h1>
              <p className="text-sm text-muted-foreground">
                Side profile • Bow to the right • Use arrows, press Enter to check
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
                <span className="font-semibold">{rode.toFixed(1)} m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Scope</span>
                <span className={`font-semibold ${scopeColor}`}>{scope.toFixed(1)} : 1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Anchor position</span>
                <span className="font-semibold">
                  {anchorOnBottom
                    ? anchorAheadBy >= 0
                      ? `${anchorAheadBy.toFixed(1)} m ahead`
                      : `${Math.abs(anchorAheadBy).toFixed(1)} m behind`
                    : "Traveling with boat"}
                </span>
              </div>
              <Badge
                variant="outline"
                className={`w-full justify-center gap-2 text-xs ${
                  anchorOnBottom ? "bg-success/10 border-success/50 text-success" : ""
                }`}
              >
                <AnchorIcon className="w-4 h-4" />
                {anchorOnBottom ? "Anchor on seabed" : "Anchor not set"}
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
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => moveBoat(-1)}>
                ← Left
              </Button>
              <Button variant="secondary" onClick={() => moveBoat(1)}>
                → Right
              </Button>
              <Button variant="secondary" onClick={() => changeRode(RODE_STEP)}>
                ↓ Down (pay out)
              </Button>
              <Button variant="secondary" onClick={() => changeRode(-RODE_STEP)}>
                ↑ Up (heave)
              </Button>
              <Button onClick={checkPlacement}>Enter (check)</Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-sky-100/80 via-sky-50 to-ocean-light/30">
              <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-full">
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
                  d={`M ${toX(boatX + BOAT_LENGTH - 0.4)} ${boatTopY - 4} L ${toX(
                    boatX + BOAT_LENGTH + 0.8,
                  )} ${boatTopY + 2} L ${toX(boatX + BOAT_LENGTH - 0.4)} ${boatTopY + 2} Z`}
                  fill="hsl(var(--primary))"
                />
                <line
                  x1={toX(boatX + BOAT_LENGTH - 1)}
                  y1={boatTopY - 12}
                  x2={toX(boatX + BOAT_LENGTH - 1)}
                  y2={boatTopY + 2}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                />
                <text x={toX(boatX + BOAT_LENGTH / 2)} y={boatBottomY + 22} fontSize="12" fill="hsl(var(--foreground))" textAnchor="middle">
                  Bow →
                </text>

                {/* Depth scale */}
                <line
                  x1={toX(cameraOrigin + 1)}
                  y1={surfaceY}
                  x2={toX(cameraOrigin + 1)}
                  y2={seabedY}
                  stroke="hsl(var(--secondary))"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={toX(cameraOrigin + 1)}
                  y={surfaceY + (seabedY - surfaceY) / 2}
                  fontSize="12"
                  fill="hsl(var(--secondary))"
                  textAnchor="start"
                >
                  {totalDepth.toFixed(1)} m
                </text>
              </svg>
              {resultOverlay && (
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center gap-4 backdrop-blur-sm border-2 shadow-lg ${
                    resultOverlay.type === "success"
                      ? "bg-success/15 border-success"
                      : "bg-destructive/10 border-destructive"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 font-semibold text-lg ${
                      resultOverlay.type === "success" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {resultOverlay.type === "success" ? (
                      <Trophy className="w-6 h-6" />
                    ) : (
                      <Target className="w-6 h-6" />
                    )}
                    {resultOverlay.type === "success" ? "Anchor secure" : "Not secure"}
                  </div>
                  <p className="text-sm text-muted-foreground text-center px-6">{resultOverlay.message}</p>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <Button
                      onClick={() => {
                        if (resultOverlay.type === "success") {
                          rollScenario();
                        }
                        setResultOverlay(null);
                      }}
                      className={resultOverlay.type === "success" ? "bg-success text-success-foreground" : ""}
                    >
                      {resultOverlay.type === "success" ? "Next setup" : "Close"}
                    </Button>
                    <Button variant="outline" onClick={resetPosition}>
                      Try again here
                    </Button>
                  </div>
                </div>
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
      </main>
    </div>
  );
};

export default AnchorMinigame;
