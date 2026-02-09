import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Lightbulb, Volume2, AlertTriangle, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModuleMenuGrid } from "@/components/module-menu/ModuleMenuGrid";
import { ModuleMenuHeader } from "@/components/module-menu/ModuleMenuHeader";
import type { ModuleMenuItem } from "@/components/module-menu/types";

const subModules: ModuleMenuItem[] = [
  {
    id: "lights-theory",
    title: "Comprehensive Theory",
    description: "Detailed study of Lights, Shapes, and Sound Signals (Parts C & D)",
    icon: BookOpen,
    path: "/rules/lights/theory",
    type: "learn",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "lights-signals-quiz",
    title: "Mastery Quiz",
    description: "Challenge yourself with 30+ scenarios covering all signal types",
    icon: Trophy,
    path: "/quiz/lights-signals",
    type: "quiz",
    color: "from-amber-500 to-orange-500",
    buttonLabel: "Start Assessment",
  },
];

const LightsSignalsMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      <ModuleMenuHeader
        title="Lights & Signals"
        subtitle="Mastering Identification and Communication at Sea"
        onBack={() => navigate("/rules-of-the-road")}
      />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Lightbulb className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg mb-2">Why this matters</h2>
                  <p className="text-muted-foreground">
                    Collision avoidance relies heavily on understanding what other vessels are doing. At night, lights
                    tell you the vessel type, aspect, and activity. In fog, sound signals are your only clue. This
                    module covers COLREGs Part C (Lights & Shapes) and Part D (Sound & Light Signals).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Key Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span>Nav Lights & Identifiers</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Day Shapes (Balls, Cones)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Volume2 className="w-4 h-4 text-blue-500" />
                <span>Sound Signals & Fog</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <ModuleMenuGrid modules={subModules} onNavigate={navigate} />
      </main>
    </div>
  );
};

export default LightsSignalsMenu;
