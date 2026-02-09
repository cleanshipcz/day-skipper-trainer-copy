import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import type { ElementType } from "react";

export interface TopicMenuItem {
  id: string;
  title: string;
  description: string;
  icon: ElementType;
  path: string;
  color: string;
}

interface TopicMenuCompletionState {
  isCompleted: boolean;
  score?: number;
}

interface TopicMenuGridProps {
  items: TopicMenuItem[];
  onNavigate: (path: string) => void;
  getCompletionState: (item: TopicMenuItem) => TopicMenuCompletionState;
  gridClassName?: string;
}

export const TopicMenuGrid = ({
  items,
  onNavigate,
  getCompletionState,
  gridClassName = "grid md:grid-cols-2 lg:grid-cols-3 gap-6",
}: TopicMenuGridProps) => {
  return (
    <div className={gridClassName}>
      {items.map((item) => {
        const Icon = item.icon;
        const { isCompleted, score } = getCompletionState(item);

        return (
          <Card
            key={item.id}
            className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-secondary/50"
            onClick={() => onNavigate(item.path)}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className={`p-3 rounded-lg bg-muted ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {isCompleted && (
                  <Badge variant="default" className="bg-success text-success-foreground">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {score}%
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg group-hover:text-secondary transition-colors">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="secondary"
                className="w-full group-hover:bg-secondary group-hover:text-secondary-foreground transition-all"
              >
                {isCompleted ? "Review" : "Start Learning"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
