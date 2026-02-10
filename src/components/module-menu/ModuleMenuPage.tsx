import type { ReactNode } from "react";
import type { ModuleMenuItem } from "./types";
import { ModuleMenuHeader } from "./ModuleMenuHeader";
import { ModuleMenuGrid } from "./ModuleMenuGrid";

interface ModuleMenuPageProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  modules: ModuleMenuItem[];
  onNavigate: (path: string) => void;
  introCard?: ReactNode;
  afterGrid?: ReactNode;
  backgroundClassName?: string;
  mainClassName?: string;
  gridClassName?: string;
  zIndexClassName?: string;
}

const defaultBackgroundClassName = "min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background";
const defaultMainClassName = "container mx-auto px-4 py-8";

export const ModuleMenuPage = ({
  title,
  subtitle,
  onBack,
  modules,
  onNavigate,
  introCard,
  afterGrid,
  backgroundClassName = defaultBackgroundClassName,
  mainClassName = defaultMainClassName,
  gridClassName,
  zIndexClassName,
}: ModuleMenuPageProps) => {
  return (
    <div className={backgroundClassName}>
      <ModuleMenuHeader title={title} subtitle={subtitle} onBack={onBack} zIndexClassName={zIndexClassName} />

      <main className={mainClassName}>
        {introCard}
        <ModuleMenuGrid modules={modules} onNavigate={onNavigate} gridClassName={gridClassName} />
        {afterGrid}
      </main>
    </div>
  );
};
