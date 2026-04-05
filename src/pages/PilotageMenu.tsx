/**
 * Pilotage module menu page.
 *
 * Lists available pilotage sub-modules. Additional modules are added as
 * subsequent E2 stories land.
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
  {
    id: "pilotage-transits",
    title: "Transits & Leading Lines",
    description: "Visual alignment for safe harbour approaches and channel navigation",
    icon: Navigation,
    path: "/pilotage/transits",
    type: "learn",
    color: "from-teal-500 to-cyan-500",
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
