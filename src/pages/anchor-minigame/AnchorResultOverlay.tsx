import { useEffect, useRef, type KeyboardEvent } from "react";
import { Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  useEffect(() => { initialFocus.current?.focus(); }, []);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onDismiss();
      return;
    }
    if (event.key !== "Tab") return;
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
    if (!buttons.length) return;
    const first = buttons[0];
    const last = buttons.at(-1)!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="anchor-result-title"
    aria-describedby="anchor-result-description"
    onKeyDown={onKeyDown}
    className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 backdrop-blur-sm border-2 shadow-lg ${
      result.type === "success"
        ? "bg-success/15 border-success"
        : "bg-destructive/10 border-destructive"
    }`}
  >
    <div
      id="anchor-result-title"
      className={`flex items-center gap-2 font-semibold text-lg ${
        result.type === "success" ? "text-success" : "text-destructive"
      }`}
    >
      {result.type === "success" ? <Trophy className="w-6 h-6" /> : <Target className="w-6 h-6" />}
      {result.type === "success" ? "Modeled checks passed" : "Checks not passed"}
    </div>
    <p id="anchor-result-description" className="text-sm text-muted-foreground text-center px-6">{result.message}</p>
    <div className="flex gap-2 flex-wrap justify-center">
      <Button
        ref={initialFocus}
        onClick={onContinue}
        className={result.type === "success" ? "bg-success text-success-foreground" : ""}
      >
        {result.type === "success" ? "Next setup" : "Close"}
      </Button>
      <Button variant="outline" onClick={onReset}>
        Try again here
      </Button>
      <Button variant="outline" onClick={onRemediate}>
        {result.type === "success"
          ? "Return to theory"
          : result.issues?.includes("procedure")
            ? "Review procedure lesson"
            : result.issues?.includes("watch")
              ? "Review anchor-watch lesson"
            : "Review scope lesson"}
      </Button>
    </div>
  </div>
  );
};
