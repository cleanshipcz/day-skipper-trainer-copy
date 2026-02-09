import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Calculator, Waves, TrendingUp, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModuleMenuGrid } from "@/components/module-menu/ModuleMenuGrid";
import type { ModuleMenuItem } from "@/components/module-menu/types";

const subModules: ModuleMenuItem[] = [
  {
    id: "tides-theory",
    title: "Understanding Tides",
    description: "Earth, Moon, Sun and tidal phenomena",
    icon: Waves,
    path: "/navigation/tides/theory",
    type: "learn",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "tides-heights-theory",
    title: "Calculating Tidal Heights",
    description: "Tidal curves and Rule of Twelves",
    icon: TrendingUp,
    path: "/navigation/tides/heights-theory",
    type: "learn",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "tides-heights-calc",
    title: "Tidal Height Calculator",
    description: "Interactive drilled practice for tidal heights",
    icon: Calculator,
    path: "/navigation/tides/heights-calc",
    type: "practice",
    color: "from-emerald-500 to-green-500",
  },
  {
    id: "tides-streams-theory",
    title: "Course to Steer Theory",
    description: "Vector triangles and tidal streams",
    icon: BookOpen,
    path: "/navigation/tides/streams-theory",
    type: "learn",
    color: "from-violet-500 to-purple-500",
  },
  {
    id: "tides-vector-tool",
    title: "Vector Solution Tool",
    description: "Interactive vector triangle plotting",
    icon: Navigation,
    path: "/navigation/tides/vector-tool",
    type: "practice",
    color: "from-orange-500 to-amber-500",
  },
];

const TidesMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/20 to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/navigation")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Tidal Theory & Streams</h1>
              <p className="text-sm text-muted-foreground">Mastering tides and vectors</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8 border-2 border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Waves className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">Tides & Currents</h2>
                <p className="text-muted-foreground">
                  A working knowledge of tides and tidal streams is essential for safe navigation. This module covers
                  the theory of tide generation, how to calculate tidal heights using curves and the rule of twelves,
                  and how to plot a Course to Steer (CTS) using vector triangles to compensate for current.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ModuleMenuGrid modules={subModules} onNavigate={navigate} gridClassName="grid md:grid-cols-2 lg:grid-cols-3 gap-6" />
      </main>
    </div>
  );
};

export default TidesMenu;
