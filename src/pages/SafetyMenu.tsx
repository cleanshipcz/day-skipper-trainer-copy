import { useNavigate } from "react-router-dom";
import { LifeBuoy } from "lucide-react";
import { ModuleMenuPage } from "@/components/module-menu/ModuleMenuPage";
import type { ModuleMenuItem } from "@/components/module-menu/types";

const safetyModules: ModuleMenuItem[] = [
  {
    id: "safety-mob",
    title: "Man Overboard (MOB)",
    description: "Immediate actions, recovery maneuvers, and distress signals",
    icon: LifeBuoy,
    path: "/safety/mob",
    type: "learn",
    color: "from-red-500 to-rose-500",
  },
];

const SafetyMenu = () => {
  const navigate = useNavigate();

  return (
    <ModuleMenuPage
      title="Safety Procedures"
      subtitle="Emergency protocols and drills"
      onBack={() => navigate("/")}
      modules={safetyModules}
      onNavigate={navigate}
      zIndexClassName="z-10"
      gridClassName="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
    />
  );
};

export default SafetyMenu;
