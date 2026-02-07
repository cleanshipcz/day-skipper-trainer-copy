import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Compass, BookOpen, Lightbulb, Trophy, HelpCircle } from "lucide-react";
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
    title: "Rules of the Road Quiz",
    description: "Test your knowledge with 20+ scenario questions",
    icon: Trophy,
    path: "/quiz/colregs",
    type: "quiz",
    color: "from-emerald-500 to-green-500",
  },
];

const RulesOfTheRoadMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Rules of the Road</h1>
              <p className="text-sm text-muted-foreground">
                International Regulations for Preventing Collisions at Sea
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Compass className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">Safety at Sea</h2>
                <p className="text-muted-foreground">
                  The COLREGs are the "highway code" of the sea. Mastering them is essential for avoiding collisions and
                  navigating safely. Start with the Steering & Sailing rules, then learn about Lights & Shapes before
                  testing your knowledge.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    {module.type === "quiz" ? "Take Quiz" : "Start Learning"}
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

export default RulesOfTheRoadMenu;
