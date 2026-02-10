import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ModuleMenuIntroCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
  iconContainerClassName?: string;
}

export const ModuleMenuIntroCard = ({
  icon: Icon,
  title,
  description,
  className,
  iconClassName,
  iconContainerClassName,
}: ModuleMenuIntroCardProps) => {
  return (
    <Card className={cn("mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent", className)}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-full bg-primary/10", iconContainerClassName)}>
            <Icon className={cn("w-6 h-6 text-primary", iconClassName)} />
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-2">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
