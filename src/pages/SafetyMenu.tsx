import { useNavigate } from "react-router-dom";
import { LifeBuoy } from "lucide-react";
import { ModuleMenuGrid } from "@/components/module-menu/ModuleMenuGrid";
import { ModuleMenuHeader } from "@/components/module-menu/ModuleMenuHeader";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      <ModuleMenuHeader
        title="Safety Procedures"
        subtitle="Emergency protocols and drills"
        onBack={() => navigate("/")}
        zIndexClassName="z-10"
      />

      <main className="container mx-auto px-4 py-8">
        <ModuleMenuGrid modules={safetyModules} onNavigate={navigate} gridClassName="grid md:grid-cols-2 lg:grid-cols-3 gap-6" />
      </main>
    </div>
  );
};

export default SafetyMenu;
