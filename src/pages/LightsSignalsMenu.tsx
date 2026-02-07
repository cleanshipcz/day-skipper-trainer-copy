import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Trophy, Lightbulb, Volume2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CompletionBadge } from "@/components/CompletionBadge";

interface SubModule {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  type: "learn" | "quiz";
  color: string;
}

const subModules: SubModule[] = [
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
  },
];

const LightsSignalsMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/rules-of-the-road")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Lights & Signals</h1>
              <p className="text-sm text-muted-foreground">Mastering Identification and Communication at Sea</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Introduction */}
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

        {/* Sub-modules Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {subModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                onClick={() => navigate(module.path)}
              >
                <div className={`h-2 bg-gradient-to-r ${module.color}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color} text-white shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary" className="capitalize flex items-center gap-1 w-fit">
                        {module.type === "quiz" ? (
                          <>
                            <Trophy className="w-3 h-3" />
                            Quiz
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-3 h-3" />
                            Learn
                          </>
                        )}
                      </Badge>
                      <CompletionBadge topicIds={module.id} />
                    </div>
                  </div>
                  <CardTitle className="mt-4 group-hover:text-primary transition-colors">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    {module.type === "quiz" ? "Start Assessment" : "Start Learning"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default LightsSignalsMenu;
