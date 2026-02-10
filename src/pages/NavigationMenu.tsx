import { Card, CardContent } from "@/components/ui/card";
import { Map, Compass, Crosshair, Waves } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModuleMenuPage } from "@/components/module-menu/ModuleMenuPage";
import type { ModuleMenuItem } from "@/components/module-menu/types";

const subModules: ModuleMenuItem[] = [
  {
    id: "charts-theory",
    title: "The Chart",
    description: "Symbols, depths, and Chart Datum (LAT)",
    icon: Map,
    path: "/navigation/charts",
    type: "learn",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "compass-theory",
    title: "The Compass",
    description: "True, Magnetic, Compass & CADET rule",
    icon: Compass,
    path: "/navigation/compass",
    type: "learn",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "position-theory",
    title: "Position Fixing",
    description: "Lat/Long and Three Point Fixes",
    icon: Crosshair,
    path: "/navigation/position",
    type: "learn",
    color: "from-emerald-500 to-green-500",
  },
  {
    id: "tides-menu",
    title: "Tides & Streams",
    description: "Theory, Heights & Vector Triangles",
    icon: Waves,
    path: "/navigation/tides",
    type: "learn",
    color: "from-purple-500 to-pink-500",
  },
];

const NavigationMenu = () => {
  const navigate = useNavigate();

  return (
    <ModuleMenuPage
      title="Navigation Fundamentals"
      subtitle="Charts, Compass, and Position"
      onBack={() => navigate("/")}
      modules={subModules}
      onNavigate={navigate}
      gridClassName="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      introCard={
        <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Map className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">Finding Your Way</h2>
                <p className="text-muted-foreground">
                  Navigation is the art and science of directing a vessel safely from one place to another. This module
                  transitions you from the vessel to the environment, covering the fundamental tools: the nautical
                  chart, the magnetic compass, and the definition of position.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      }
    />
  );
};

export default NavigationMenu;
