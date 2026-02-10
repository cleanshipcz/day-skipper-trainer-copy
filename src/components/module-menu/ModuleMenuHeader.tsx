import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ModuleMenuHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  zIndexClassName?: string;
}

export const ModuleMenuHeader = ({ title, subtitle, onBack, zIndexClassName = "z-40" }: ModuleMenuHeaderProps) => {
  return (
    <header className={`border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 ${zIndexClassName}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
