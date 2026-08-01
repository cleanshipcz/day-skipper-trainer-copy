import { Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AnchorResult {
  type: "success" | "failure";
  message: string;
}

export interface AnchorResultOverlayProps {
  result: AnchorResult;
  onContinue: () => void;
  onReset: () => void;
  onRemediate: () => void;
}

export const AnchorResultOverlay = ({ result, onContinue, onReset, onRemediate }: AnchorResultOverlayProps) => (
  <div
    className={`absolute inset-0 flex flex-col items-center justify-center gap-4 backdrop-blur-sm border-2 shadow-lg ${
      result.type === "success"
        ? "bg-success/15 border-success"
        : "bg-destructive/10 border-destructive"
    }`}
  >
    <div
      className={`flex items-center gap-2 font-semibold text-lg ${
        result.type === "success" ? "text-success" : "text-destructive"
      }`}
    >
      {result.type === "success" ? <Trophy className="w-6 h-6" /> : <Target className="w-6 h-6" />}
      {result.type === "success" ? "Anchor secure" : "Not secure"}
    </div>
    <p className="text-sm text-muted-foreground text-center px-6">{result.message}</p>
    <div className="flex gap-2 flex-wrap justify-center">
      <Button
        onClick={onContinue}
        className={result.type === "success" ? "bg-success text-success-foreground" : ""}
      >
        {result.type === "success" ? "Next setup" : "Close"}
      </Button>
      <Button variant="outline" onClick={onReset}>
        Try again here
      </Button>
      <Button variant="outline" onClick={onRemediate}>
        {result.type === "success" ? "Return to theory" : "Review scope lesson"}
      </Button>
    </div>
  </div>
);
