import type { ModuleMenuItem, ModuleType } from "./types";

const DEFAULT_LABELS: Record<ModuleType, { badgeLabel: string; buttonLabel: string }> = {
  learn: { badgeLabel: "Learn", buttonLabel: "Start Learning" },
  quiz: { badgeLabel: "Quiz", buttonLabel: "Take Quiz" },
  practice: { badgeLabel: "Practice", buttonLabel: "Start Practice" },
};

export const resolveModuleMeta = ({
  type,
  badgeLabel,
  buttonLabel,
}: Pick<ModuleMenuItem, "type" | "badgeLabel" | "buttonLabel">) => ({
  badgeLabel: badgeLabel ?? DEFAULT_LABELS[type].badgeLabel,
  buttonLabel: buttonLabel ?? DEFAULT_LABELS[type].buttonLabel,
});
