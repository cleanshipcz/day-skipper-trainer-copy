/**
 * Pilotage module menu page.
 *
 * Lists available pilotage sub-modules. Additional modules are added as
 * subsequent E2 stories land.
 *
 * @see docs/FEATURE_TASKS.md — Epic E2
 */
import { useNavigate } from "react-router-dom";
import { Navigation, Compass, ClipboardList, CircleHelp } from "lucide-react";
import { ModuleMenuPage } from "@/components/module-menu/ModuleMenuPage";
import type { ModuleMenuItem } from "@/components/module-menu/types";

const pilotageModules: ModuleMenuItem[] = [
  {
    id: "pilotage-buoyage",
    title: "IALA Buoyage",
    description: "IALA Region A buoyage system — lateral, cardinal, and special marks",
    icon: Navigation,
    path: "/pilotage/buoyage",
    type: "learn",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "pilotage-transits",
    title: "Transits & Leading Lines",
    description: "Visual alignment for safe harbour approaches and channel navigation",
    icon: Navigation,
    path: "/pilotage/transits",
    type: "learn",
    color: "from-teal-500 to-cyan-500",
  },
  {
    id: "pilotage-clearing-bearings",
    title: "Clearing Bearings",
    description:
      "Using compass bearings to define safe water boundaries and avoid hazards",
    icon: Compass,
    path: "/pilotage/clearing-bearings",
    type: "learn",
    color: "from-indigo-500 to-sky-500",
  },
  {
    id: "pilotage-plan",
    title: "Pilotage Plan Builder",
    description: "Build a cockpit-ready harbour approach with waypoints, timings, and tidal adjustments",
    icon: ClipboardList,
    path: "/pilotage/plan",
    type: "practice",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "quiz-pilotage",
    title: "Pilotage Quiz",
    description: "Test buoyage, transits, clearing bearings, and pilotage planning",
    icon: CircleHelp,
    path: "/quiz/pilotage",
    type: "quiz",
    color: "from-violet-500 to-purple-500",
  },
];

const PilotageMenu = () => {
  const navigate = useNavigate();

  return (
    <ModuleMenuPage
      title="Pilotage"
      subtitle="Harbour approaches, buoyage, transits, clearing bearings & cockpit plans"
      onBack={() => navigate("/")}
      modules={pilotageModules}
      onNavigate={navigate}
      zIndexClassName="z-10"
      gridClassName="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
    />
  );
};

export default PilotageMenu;
