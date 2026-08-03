import { Button } from "@/components/ui/button";

export interface AnchorControlsProps {
  onMove: (direction: -1 | 1) => void;
  onChangeRode: (delta: number) => void;
  onCheck: () => void;
  onApplyLoad: () => void;
  rodeStep: number;
}

export const AnchorControls = ({
  onMove,
  onChangeRode,
  onCheck,
  onApplyLoad,
  rodeStep,
}: AnchorControlsProps) => (
  <div className="flex flex-wrap gap-2">
    <Button variant="secondary" onClick={() => onMove(-1)}>
      ← Left
    </Button>
    <Button variant="secondary" onClick={() => onMove(1)}>
      → Right
    </Button>
    <Button variant="secondary" onClick={() => onChangeRode(rodeStep)}>
      ↓ Down (pay out)
    </Button>
    <Button variant="secondary" onClick={() => onChangeRode(-rodeStep)}>
      ↑ Up (heave)
    </Button>
    <Button variant="secondary" onClick={onApplyLoad}>Apply setting load</Button>
    <Button onClick={onCheck}>Enter (check)</Button>
  </div>
);
