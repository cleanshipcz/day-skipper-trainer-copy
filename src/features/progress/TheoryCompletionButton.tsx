import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheoryCompletionGate } from "./useTheoryCompletionGate";

interface TheoryCompletionButtonProps {
  topicId: string;
  catalogueRevision: string;
  evidenceId: string;
  evidenceSatisfied: boolean;
  lockedLabel?: string;
}

/** Shared durable completion control for a leaf with one deliberate outcome. */
export const TheoryCompletionButton = ({ topicId, catalogueRevision, evidenceId, evidenceSatisfied, lockedLabel = "Complete the activity" }: TheoryCompletionButtonProps) => {
  const [announcement, setAnnouncement] = useState("");
  const { canComplete, markCompleted, markSectionVisited, saveState, isHydrated, isCompletionDurable } = useTheoryCompletionGate({
    topicId, catalogueRevision, requiredSectionIds: [evidenceId], pointsOnComplete: 10,
  });

  useEffect(() => { if (evidenceSatisfied) void markSectionVisited(evidenceId); }, [evidenceId, evidenceSatisfied, markSectionVisited]);
  const durable = isCompletionDurable;
  const status = announcement || (saveState === "saving" ? "Saving progress…" : durable && saveState === "saved" ? "Completion saved to your account." : durable && saveState === "queued" ? "Completion is durably queued on this device and will sync when you reconnect." : durable && saveState === "local" ? "Completed on this device. Sign in to save to an account." : saveState === "failed" ? "Completion was not saved. Retry when ready." : !isHydrated ? "Loading saved progress…" : canComplete ? "Activity evidence recorded. Save completion when ready." : lockedLabel);

  return <div className="space-y-2">
    <Button disabled={!isHydrated || !canComplete || saveState === "saving" || durable} onClick={async () => {
      if (!await markCompleted()) setAnnouncement("Completion was not saved. Your activity evidence remains available; retry when ready.");
    }}>
      {durable && <CheckCircle2 className="mr-2 h-4 w-4" />}
      {!isHydrated ? "Loading progress…" : saveState === "saving" ? "Saving…" : durable && saveState === "saved" ? "Saved" : durable && saveState === "queued" ? "Queued offline" : durable && saveState === "local" ? "Completed on this device" : saveState === "failed" && canComplete ? "Retry completion" : canComplete ? "Save completion" : lockedLabel}
      {isHydrated && canComplete && !durable && saveState !== "saving" && <ChevronRight className="ml-2 h-4 w-4" />}
    </Button>
    <p className="text-sm" role="status" aria-live="polite">{status}</p>
  </div>;
};
