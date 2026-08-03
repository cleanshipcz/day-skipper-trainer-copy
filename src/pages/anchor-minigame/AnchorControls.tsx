import { Button } from "@/components/ui/button";

export interface AnchorControlsProps {
  onMove: (direction: -1 | 1) => void;
  onChangeRode: (delta: number) => void;
  onCheck: () => void;
  onApplyLoad: () => void;
  onApplyChange: () => void;
  onWatch: () => void;
  onRecover: () => void;
  rodeStep: number;
  disabled?: boolean;
}

export const AnchorControls = ({
  onMove,
  onChangeRode,
  onCheck,
  onApplyLoad,
  onApplyChange,
  onWatch,
  onRecover,
  rodeStep,
  disabled = false,
}: AnchorControlsProps) => (
  <div className="flex flex-wrap gap-2">
    <Button disabled={disabled} variant="secondary" onClick={() => onMove(-1)}>
      ← Left
    </Button>
    <Button disabled={disabled} variant="secondary" onClick={() => onMove(1)}>
      → Right
    </Button>
    <Button disabled={disabled} variant="secondary" onClick={() => onChangeRode(rodeStep)}>
      ↓ Down (pay out)
    </Button>
    <Button disabled={disabled} variant="secondary" onClick={() => onChangeRode(-rodeStep)}>
      ↑ Up (heave)
    </Button>
    <Button disabled={disabled} variant="secondary" onClick={onApplyLoad}>Apply setting load</Button>
    <Button disabled={disabled} variant="secondary" onClick={onApplyChange}>Apply wind/tide change</Button>
    <Button disabled={disabled} variant="secondary" onClick={onWatch}>Run anchor watch</Button>
    <Button disabled={disabled} variant="outline" onClick={onRecover}>Safe recovery</Button>
    <Button disabled={disabled} onClick={onCheck}>Enter (check)</Button>
  </div>
);
