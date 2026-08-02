import { Compass, Lightbulb, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModuleMenuPage } from "@/components/module-menu/ModuleMenuPage";
import { ModuleMenuIntroCard } from "@/components/module-menu/ModuleMenuIntroCard";
import type { ModuleMenuItem } from "@/components/module-menu/types";

const subModules: ModuleMenuItem[] = [
  {
    id: "colregs-theory",
    title: "Steering & Sailing Rules",
    description: "Learn the core Rules of the Road (Part B)",
    icon: Compass,
    path: "/rules/colregs",
    type: "learn",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "lights-theory",
    title: "Lights & Signals",
    description: "Master lights, shapes, and sound signals (Parts C & D)",
    icon: Lightbulb,
    path: "/rules/lights",
    type: "learn",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "colregs",
    title: "Combined Rules Diagnostic",
    description: "Check 20 taught objectives, then follow targeted review links",
    icon: Trophy,
    path: "/quiz/colregs",
    type: "quiz",
    color: "from-emerald-500 to-green-500",
  },
];

const RulesOfTheRoadMenu = () => {
  const navigate = useNavigate();

  return (
    <ModuleMenuPage
      title="Rules of the Road"
      subtitle="International Regulations for Preventing Collisions at Sea"
      onBack={() => navigate("/")}
      modules={subModules}
      onNavigate={navigate}
      introCard={
        <ModuleMenuIntroCard
          icon={Compass}
          title="Safety at Sea"
          description="Study both Steering & Sailing and Lights & Signals first. The combined diagnostic then checks 20 taught objectives and links missed answers back to the relevant theory."
        />
      }
    />
  );
};

export default RulesOfTheRoadMenu;
