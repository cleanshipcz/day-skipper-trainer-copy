import { useCallback, useRef, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

interface AnchorSceneProps {
  children: ReactNode;
  onMove: (direction: -1 | 1) => void;
  onChangeRode: (delta: number) => void;
  onCheck: () => void;
  rodeStep: number;
  disabled?: boolean;
}

const HORIZONTAL_STEP_PX = 18;
const VERTICAL_STEP_PX = 14;
const MAX_STEPS_PER_EVENT = 12;

export const AnchorScene = ({ children, onMove, onChangeRode, onCheck, rodeStep, disabled = false }: AnchorSceneProps) => {
  const gesture = useRef<{ pointerId: number; x: number; y: number; dx: number; dy: number } | null>(null);

  const stopGesture = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (gesture.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    gesture.current = null;
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dy: 0 };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;

    active.dx += event.clientX - active.x;
    active.dy += event.clientY - active.y;
    active.x = event.clientX;
    active.y = event.clientY;

    const horizontalSteps = Math.min(Math.trunc(Math.abs(active.dx) / HORIZONTAL_STEP_PX), MAX_STEPS_PER_EVENT);
    const verticalSteps = Math.min(Math.trunc(Math.abs(active.dy) / VERTICAL_STEP_PX), MAX_STEPS_PER_EVENT);
    if (horizontalSteps) {
      const direction = active.dx < 0 ? -1 : 1;
      for (let index = 0; index < horizontalSteps; index += 1) onMove(direction);
      active.dx -= direction * horizontalSteps * HORIZONTAL_STEP_PX;
    }
    if (verticalSteps) {
      const direction = active.dy < 0 ? -1 : 1;
      onChangeRode(direction * verticalSteps * rodeStep);
      active.dy -= direction * verticalSteps * VERTICAL_STEP_PX;
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || event.target !== event.currentTarget) return;
    const action = {
      ArrowLeft: () => onMove(-1),
      ArrowRight: () => onMove(1),
      ArrowUp: () => onChangeRode(-rodeStep),
      ArrowDown: () => onChangeRode(rodeStep),
      Enter: onCheck,
    }[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-sky-100/80 via-sky-50 to-ocean-light/30">
      {children}
      <div
        className="absolute inset-0 z-[1] cursor-grab touch-none active:cursor-grabbing focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-inset"
        role="application"
        tabIndex={disabled ? -1 : 0}
        aria-label="Anchor manipulation surface. Drag left or right to move the boat. Drag down to pay out rode and up to heave in. Arrow keys provide equivalent controls."
        aria-disabled={disabled || undefined}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopGesture}
        onPointerCancel={stopGesture}
        onLostPointerCapture={(event) => {
          if (gesture.current?.pointerId === event.pointerId) gesture.current = null;
        }}
      />
    </div>
  );
};
