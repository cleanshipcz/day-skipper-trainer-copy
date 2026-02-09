import { lazy, type ComponentType } from "react";

export interface AppRouteDefinition {
  path: string;
  importPage: () => Promise<{ default: ComponentType }>;
}

export const appRoutes: AppRouteDefinition[] = [
  { path: "/", importPage: () => import("@/pages/Index") },
  { path: "/auth", importPage: () => import("@/pages/Auth") },
  { path: "/nautical-terms", importPage: () => import("@/pages/NauticalTermsMenu") },
  { path: "/nautical-terms/boat-parts", importPage: () => import("@/pages/NauticalTerms") },
  { path: "/nautical-terms/sail-controls", importPage: () => import("@/pages/SailControls") },
  { path: "/ropework", importPage: () => import("@/pages/RopeworkTheory") },
  { path: "/anchorwork", importPage: () => import("@/pages/AnchorTheory") },
  { path: "/anchor-minigame", importPage: () => import("@/pages/AnchorMinigame") },
  { path: "/victualling", importPage: () => import("@/pages/VictuallingTheory") },
  { path: "/engine", importPage: () => import("@/pages/EngineTheory") },
  { path: "/rig", importPage: () => import("@/pages/RigTheory") },
  { path: "/rules-of-the-road", importPage: () => import("@/pages/RulesOfTheRoadMenu") },
  { path: "/rules/colregs", importPage: () => import("@/pages/ColregTheory") },
  { path: "/rules/lights", importPage: () => import("@/pages/LightsSignalsMenu") },
  { path: "/rules/lights/theory", importPage: () => import("@/pages/LightsTheory") },
  { path: "/navigation", importPage: () => import("@/pages/NavigationMenu") },
  { path: "/navigation/charts", importPage: () => import("@/pages/ChartsTheory") },
  { path: "/navigation/compass", importPage: () => import("@/pages/CompassTheory") },
  { path: "/navigation/position", importPage: () => import("@/pages/PositionFixingTheory") },
  { path: "/navigation/tides", importPage: () => import("@/pages/TidesMenu") },
  { path: "/navigation/tides/theory", importPage: () => import("@/pages/TidalTheory") },
  { path: "/navigation/tides/heights-theory", importPage: () => import("@/pages/TidalHeightsTheory") },
  { path: "/navigation/tides/heights-calc", importPage: () => import("@/pages/TidalHeightsCalculator") },
  { path: "/navigation/tides/streams-theory", importPage: () => import("@/pages/TidalStreamsTheory") },
  { path: "/navigation/tides/vector-tool", importPage: () => import("@/pages/VectorTriangleTool") },
  { path: "/safety", importPage: () => import("@/pages/SafetyMenu") },
  { path: "/safety/mob", importPage: () => import("@/pages/ManOverboardTheory") },
  { path: "/quiz/:topicId", importPage: () => import("@/pages/Quiz") },
  { path: "*", importPage: () => import("@/pages/NotFound") },
];

export const toLazyRouteElement = (route: AppRouteDefinition) => lazy(route.importPage);
