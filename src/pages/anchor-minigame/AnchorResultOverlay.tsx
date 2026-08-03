import { useRef } from "react";
import { Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface AnchorResult {
  type: "success" | "failure";
  message: string;
  issues?: readonly ("procedure" | "scope" | "verification" | "watch")[];
}

export interface AnchorResultOverlayProps {
  result: AnchorResult;
  onContinue: () => void;
  onReset: () => void;
  onRemediate: () => void;
  onDismiss: () => void;
}

export const AnchorResultOverlay = ({ result, onContinue, onReset, onRemediate, onDismiss }: AnchorResultOverlayProps) => {
  const initialFocus = useRef<HTMLButtonElement>(null);
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onDismiss(); }}>
      <DialogContent
        aria-modal="true"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          initialFocus.current?.focus();
        }}
        className={result.type === "success" ? "border-2 border-success" : "border-2 border-destructive"}
      >
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${result.type === "success" ? "text-success" : "text-destructive"}`}>
            {result.type === "success" ? <Trophy className="w-6 h-6" /> : <Target className="w-6 h-6" />}
            {result.type === "success" ? "Modeled checks passed" : "Checks not passed"}
          </DialogTitle>
          <DialogDescription>{result.message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-wrap gap-2 sm:space-x-0">
          <Button variant="outline" onClick={onRemediate}>
            {result.type === "success"
              ? "Return to theory"
              : result.issues?.includes("procedure")
                ? "Review procedure lesson"
                : result.issues?.includes("watch")
                  ? "Review anchor-watch lesson"
                  : "Review scope lesson"}
          </Button>
          <Button variant="outline" onClick={onReset}>Try again here</Button>
          <Button
            ref={initialFocus}
            onClick={onContinue}
            className={result.type === "success" ? "bg-success text-success-foreground" : ""}
          >
            {result.type === "success" ? "Next setup" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
