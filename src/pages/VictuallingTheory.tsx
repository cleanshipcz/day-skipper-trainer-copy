import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Trophy, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { checklistData, ChecklistItem } from "@/data/victuallingItems";

const VictuallingTheory = () => {
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<ChecklistItem[]>(checklistData);
  const [score, setScore] = useState(0);

  const handleCheckItem = (itemId: string) => {
    const updatedChecklist = checklist.map((item) => {
      if (item.id === itemId && !item.checked) {
        setScore(score + 5);
        toast.success("+5 points! Item checked");
        return { ...item, checked: true };
      }
      return item;
    });
    setChecklist(updatedChecklist);
  };

  const categories = Array.from(new Set(checklist.map((item) => item.category)));
  const totalItems = checklist.length;
  const checkedItems = checklist.filter((item) => item.checked).length;
  const progressPercent = (checkedItems / totalItems) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Victualling (Provisioning)</h1>
                <p className="text-sm text-muted-foreground">Plan your provisions for sea</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                <span className="font-bold text-lg">{score}</span>
              </div>
              <Badge variant="secondary">
                {checkedItems}/{totalItems} items
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Progress Card */}
        <Card className="mb-6 border-2 border-secondary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Provisioning Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-secondary h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Guidelines Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Provisioning Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">Plan for Extra</h3>
                <p className="text-xs text-muted-foreground">
                  Always provision for 50% more days than planned. Weather delays happen!
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">Storage Considerations</h3>
                <p className="text-xs text-muted-foreground">
                  Use waterproof containers. Consider limited refrigeration space.
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">Fresh Water Priority</h3>
                <p className="text-xs text-muted-foreground">
                  Minimum 2L per person per day for drinking. Extra for cooking/washing.
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">Waste Management</h3>
                <p className="text-xs text-muted-foreground">
                  Plan for proper waste disposal. Minimize packaging where possible.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist by Category */}
        {categories.map((category) => (
          <Card key={category} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checklist
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        item.checked ? "border-success/30 bg-success/5" : "border-border hover:border-secondary/50"
                      }`}
                    >
                      <Checkbox id={item.id} checked={item.checked} onCheckedChange={() => handleCheckItem(item.id)} />
                      <label htmlFor={item.id} className="flex-1 cursor-pointer flex items-center justify-between">
                        <span className={item.checked ? "line-through text-muted-foreground" : ""}>{item.item}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.quantity}
                        </Badge>
                      </label>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {checkedItems === totalItems && (
          <Card className="border-2 border-accent bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">🎉 Provisioning complete! Ready for the quiz?</h3>
                  <p className="text-muted-foreground">Test your victualling knowledge</p>
                </div>
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => navigate("/quiz/victualling")}
                >
                  Take Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default VictuallingTheory;
