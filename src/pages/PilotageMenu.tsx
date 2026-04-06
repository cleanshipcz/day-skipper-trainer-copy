/**
 * Pilotage module menu page.
 *
 * Lists all pilotage sub-modules. Currently only IALA Buoyage is
 * implemented — additional sub-modules (transits, clearing bearings,
 * plan builder) will be added by future stories.
 *
 * @see docs/FEATURE_TASKS.md — Epic E2
 */
import { useNavigate } from "react-router-dom";
import { Navigation } from "lucide-react";
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
];

const PilotageMenu = () => {
  const navigate = useNavigate();

  return (
    <ModuleMenuPage
      title="Pilotage"
      subtitle="Navigation marks, transits, and harbour approaches"
      onBack={() => navigate("/")}
      modules={pilotageModules}
      onNavigate={navigate}
      zIndexClassName="z-10"
      gridClassName="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
    />
  );
};

export default PilotageMenu;
