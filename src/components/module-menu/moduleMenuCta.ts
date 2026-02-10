interface ModuleMenuCompletionState {
  isCompleted: boolean;
  score?: number;
}

interface ResolveModuleButtonLabelArgs {
  defaultButtonLabel: string;
  completion?: ModuleMenuCompletionState;
}

export const resolveModuleButtonLabel = ({
  defaultButtonLabel,
  completion,
}: ResolveModuleButtonLabelArgs): string => {
  if (!completion) return defaultButtonLabel;
  return completion.isCompleted ? "Review" : defaultButtonLabel;
};
