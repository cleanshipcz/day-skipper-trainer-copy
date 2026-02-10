import { BookOpen, Calculator, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompletionBadge } from "@/components/CompletionBadge";
import type { ModuleMenuItem, ModuleType } from "./types";
import { resolveModuleMeta } from "./moduleMenuMeta";

const typeIcon: Record<ModuleType, typeof BookOpen> = {
  learn: BookOpen,
  quiz: Trophy,
  practice: Calculator,
};

interface ModuleMenuCompletionState {
  isCompleted: boolean;
  score?: number;
}

interface ModuleMenuGridProps {
  modules: ModuleMenuItem[];
  onNavigate: (path: string) => void;
  gridClassName?: string;
  getCompletionState?: (module: ModuleMenuItem) => ModuleMenuCompletionState;
}

export const ModuleMenuGrid = ({
  modules,
  onNavigate,
  gridClassName = "grid md:grid-cols-2 gap-6",
  getCompletionState,
}: ModuleMenuGridProps) => {
  return (
    <div className={gridClassName}>
      {modules.map((module) => {
        const Icon = module.icon;
        const TypeIcon = typeIcon[module.type];
        const meta = resolveModuleMeta(module);
        const completion = getCompletionState?.(module);

        return (
          <Card
            key={module.id}
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            onClick={() => onNavigate(module.path)}
          >
            <div className={`h-2 bg-gradient-to-r ${module.color}`} />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color} text-white shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary" className="capitalize flex items-center gap-1 w-fit">
                    <TypeIcon className="w-3 h-3" />
                    {meta.badgeLabel}
                  </Badge>
                  {completion ? (
                    completion.isCompleted ? (
                      <Badge variant="default" className="bg-success text-success-foreground">
                        {completion.score ?? 100}%
                      </Badge>
                    ) : null
                  ) : (
                    <CompletionBadge topicIds={module.id} />
                  )}
                </div>
              </div>
              <CardTitle className="mt-4 group-hover:text-primary transition-colors">{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                {completion ? (completion.isCompleted ? "Review" : "Start Learning") : meta.buttonLabel}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
