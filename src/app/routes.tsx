import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export interface AppRouteDefinition {
  path: string;
  importPage: () => Promise<{ default: ComponentType }>;
  lazyElement: LazyExoticComponent<ComponentType>;
}

interface AppRouteConfig {
  path: string;
  importPage: () => Promise<{ default: ComponentType }>;
}

const defineRoute = (route: AppRouteConfig): AppRouteDefinition => ({
  ...route,
  lazyElement: lazy(route.importPage),
});

export const appRoutes: AppRouteDefinition[] = [
  defineRoute({ path: "/", importPage: () => import("@/pages/Index") }),
  defineRoute({ path: "/auth", importPage: () => import("@/pages/Auth") }),
  defineRoute({ path: "/nautical-terms", importPage: () => import("@/pages/NauticalTermsMenu") }),
  defineRoute({ path: "/nautical-terms/boat-parts", importPage: () => import("@/pages/NauticalTerms") }),
  defineRoute({ path: "/nautical-terms/sail-controls", importPage: () => import("@/pages/SailControls") }),
  defineRoute({ path: "/ropework", importPage: () => import("@/pages/RopeworkTheory") }),
  defineRoute({ path: "/anchorwork", importPage: () => import("@/pages/AnchorTheory") }),
  defineRoute({ path: "/anchor-minigame", importPage: () => import("@/pages/AnchorMinigame") }),
  defineRoute({ path: "/victualling", importPage: () => import("@/pages/VictuallingTheory") }),
  defineRoute({ path: "/engine", importPage: () => import("@/pages/EngineTheory") }),
  defineRoute({ path: "/rig", importPage: () => import("@/pages/RigTheory") }),
  defineRoute({ path: "/rules-of-the-road", importPage: () => import("@/pages/RulesOfTheRoadMenu") }),
  defineRoute({ path: "/rules/colregs", importPage: () => import("@/pages/ColregTheory") }),
  defineRoute({ path: "/rules/lights", importPage: () => import("@/pages/LightsSignalsMenu") }),
  defineRoute({ path: "/rules/lights/theory", importPage: () => import("@/pages/LightsTheory") }),
  defineRoute({ path: "/navigation", importPage: () => import("@/pages/NavigationMenu") }),
  defineRoute({ path: "/navigation/charts", importPage: () => import("@/pages/ChartsTheory") }),
  defineRoute({ path: "/navigation/compass", importPage: () => import("@/pages/CompassTheory") }),
  defineRoute({ path: "/navigation/position", importPage: () => import("@/pages/PositionFixingTheory") }),
  defineRoute({ path: "/navigation/tides", importPage: () => import("@/pages/TidesMenu") }),
  defineRoute({ path: "/navigation/tides/theory", importPage: () => import("@/pages/TidalTheory") }),
  defineRoute({ path: "/navigation/tides/heights-theory", importPage: () => import("@/pages/TidalHeightsTheory") }),
  defineRoute({ path: "/navigation/tides/heights-calc", importPage: () => import("@/pages/TidalHeightsCalculator") }),
  defineRoute({ path: "/navigation/tides/streams-theory", importPage: () => import("@/pages/TidalStreamsTheory") }),
  defineRoute({ path: "/navigation/tides/vector-tool", importPage: () => import("@/pages/VectorTriangleTool") }),
  defineRoute({ path: "/safety", importPage: () => import("@/pages/SafetyMenu") }),
  defineRoute({ path: "/safety/mob", importPage: () => import("@/pages/ManOverboardTheory") }),
  defineRoute({ path: "/quiz/:topicId", importPage: () => import("@/pages/Quiz") }),
  defineRoute({ path: "*", importPage: () => import("@/pages/NotFound") }),
];
