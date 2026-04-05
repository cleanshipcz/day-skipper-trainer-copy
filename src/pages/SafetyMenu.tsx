import { useNavigate } from "react-router-dom";
import { LifeBuoy, Flame, Ship, Sparkles } from "lucide-react";
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
  {
    id: "safety-fire",
    title: "Fire Safety",
    description: "Fire types, extinguishers, prevention, and engine room procedure",
    icon: Flame,
    path: "/safety/fire",
    type: "learn",
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "safety-life-raft",
    title: "Life Raft & Abandon Ship",
    description: "Life raft types, deployment, boarding, and survival procedures",
    icon: Ship,
    path: "/safety/life-raft",
    type: "learn",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "safety-flares",
    title: "Flares & Pyrotechnics",
    description: "Flare types, identification, usage scenarios, and expiry rules",
    icon: Sparkles,
    path: "/safety/flares",
    type: "learn",
    color: "from-rose-500 to-pink-500",
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
