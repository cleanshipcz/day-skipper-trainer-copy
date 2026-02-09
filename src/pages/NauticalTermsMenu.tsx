import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ship, Sailboat, BookOpen, HelpCircle, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModuleMenuGrid } from "@/components/module-menu/ModuleMenuGrid";
import type { ModuleMenuItem } from "@/components/module-menu/types";

const subModules: ModuleMenuItem[] = [
  {
    id: "nautical-terms-boat-parts",
    title: "Boat Parts",
    description: "Interactive diagram to identify hull, deck, rigging and more",
    icon: Ship,
    path: "/nautical-terms/boat-parts",
    type: "learn",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "nautical-terms-sail-controls",
    title: "Sail Controls & Lines",
    description: "Learn sheets, halyards, outhaul, reefing lines and more",
    icon: Sailboat,
    path: "/nautical-terms/sail-controls",
    type: "learn",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "nautical-terms-quiz",
    title: "Full Nautical Terms Quiz",
    description: "20-question challenge across every boat part and orientation term",
    icon: Trophy,
    path: "/quiz/nautical-terms-quiz",
    type: "quiz",
    color: "from-emerald-500 to-green-500",
  },
];

const NauticalTermsMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Nautical Terms & Boat Parts</h1>
              <p className="text-sm text-muted-foreground">Learn the language of sailing</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">Master Nautical Vocabulary</h2>
                <p className="text-muted-foreground">
                  Understanding nautical terms is essential for clear communication aboard. Start with the main parts of
                  a boat, then move on to sail controls and running rigging. Each module includes an interactive quiz to
                  test your knowledge.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ModuleMenuGrid modules={subModules} onNavigate={navigate} />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Port</strong> and <strong>Left</strong> both have 4 letters - that's how you remember which
                  side is which!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  The <strong>bow</strong> is the front, the <strong>stern</strong> is the back. "Bow" rhymes with "go"
                  - where you're heading!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Sheets</strong> control sail angle, <strong>halyards</strong> raise and lower sails. "Halyard"
                  = "haul yard" (the sail up).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  Standing rigging (stays, shrouds) supports the mast. Running rigging (sheets, halyards) controls the
                  sails.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NauticalTermsMenu;
