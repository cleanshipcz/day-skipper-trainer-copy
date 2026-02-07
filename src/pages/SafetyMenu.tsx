import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, LifeBuoy } from "lucide-react";

const SafetyMenu = () => {
  const navigate = useNavigate();

  const safetyModules = [
    {
      title: "Man Overboard (MOB)",
      description: "Immediate actions, recovery maneuvers, and distress signals",
      icon: LifeBuoy,
      path: "/safety/mob",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Safety Procedures</h1>
              <p className="text-sm text-muted-foreground">Emergency protocols and drills</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safetyModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.path}
                className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary/50"
                onClick={() => navigate(module.path)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${module.color}`} />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full group-hover:bg-primary/10">
                    Start Module
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

export default SafetyMenu;
