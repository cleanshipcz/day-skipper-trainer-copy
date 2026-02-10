import type { ElementType } from "react";

export type ModuleType = "learn" | "quiz" | "practice";

export interface ModuleMenuItem {
  id: string;
  title: string;
  description: string;
  icon: ElementType;
  path: string;
  type: ModuleType;
  color: string;
  badgeLabel?: string;
  buttonLabel?: string;
}
