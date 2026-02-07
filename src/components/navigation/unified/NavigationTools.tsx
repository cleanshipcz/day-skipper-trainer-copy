import { useRef, useEffect, useState } from "react";
import { Move, RotateCcw } from "lucide-react";

// Types
interface Point {
  x: number;
  y: number;
}

// --- 1. Portland Plotter ---
interface PortlandPlotterProps {
  position: Point;
  rotation: number;
  onDragStart: (e: React.PointerEvent) => void;
  onRotateStart: (e: React.PointerEvent) => void;
}

export const PortlandPlotter = ({ position, rotation, onDragStart, onRotateStart }: PortlandPlotterProps) => {
  return (
    <g
      transform={`translate(${position.x}, ${position.y}) rotate(${rotation})`}
      className="group"
      style={{ touchAction: "none" }}
    >
      {/* Main Rectangular Body */}
      <rect
        x="-50"
        y="-150"
        width="100"
        height="300"
        fill="rgba(255,255,255,0.4)"
        stroke="blue"
        strokeWidth="2"
        rx="5"
        className="cursor-move"
        onPointerDown={onDragStart}
      />
      {/* Center Grid */}
      <line x1="0" y1="-140" x2="0" y2="140" stroke="blue" strokeWidth="1" strokeOpacity="0.5" pointerEvents="none" />
      <line x1="-40" y1="0" x2="40" y2="0" stroke="blue" strokeWidth="1" strokeOpacity="0.5" pointerEvents="none" />
      {/* Rotating Dial Visual (Does not actually rotate independent of body in this simplified version, keeping it locked to body for "Heading" setting) */}
      <circle r="40" fill="white" stroke="blue" opacity="0.9" pointerEvents="none" />
      <path d="M 0 -35 L 5 -25 L -5 -25 Z" fill="red" pointerEvents="none" /> {/* North Arrow on Dial */}
      {/* Dynamic Text showing 'Bearing' (Rotation) */}
      {/* Note: SVG rotation is CW. Navigational Bearing is CW. So Rotation = Bearing. */}
      <text x="0" y="5" textAnchor="middle" fontSize="12" fill="black" fontWeight="bold" pointerEvents="none">
        {Math.round(rotation % 360)}°
      </text>
      <text x="0" y="20" textAnchor="middle" fontSize="8" fill="blue" pointerEvents="none">
        TRUE
      </text>
      {/* Rotation Handle (Top) */}
      <g
        transform="translate(0, -170)"
        className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
        onPointerDown={onRotateStart}
      >
        <circle r="15" fill="white" stroke="blue" strokeWidth="2" />
        <RotateCcw className="w-5 h-5 text-blue-600 -translate-x-2.5 -translate-y-2.5" />
      </g>
      {/* Drawing Guide (Edge) */}
      {/* Represents the plotting edge. Clicking here triggers 'Draw' if we implemented a click-to-draw, 
                but plan says 'User aligns... Clicks Draw'. Button will be in UI. 
                Visual highlight for the edge. */}
      <line
        x1="50"
        y1="-150"
        x2="50"
        y2="150"
        stroke="transparent"
        strokeWidth="10"
        className="hover:stroke-yellow-400/30"
      />
    </g>
  );
};

// --- 2. Hand Bearing Compass View (Overlay) ---
// This isn't an SVG tool, it's a UI overlay.
// But we might represent the "sight line" on the chart.
interface SightLineProps {
  origin: Point;
  target: Point;
  bearing: number;
}
export const SightLine = ({ origin, target, bearing }: SightLineProps) => {
  return (
    <g>
      <line
        x1={origin.x}
        y1={origin.y}
        x2={target.x}
        y2={target.y}
        stroke="magenta"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
      <text
        x={(origin.x + target.x) / 2}
        y={(origin.y + target.y) / 2}
        fill="magenta"
        stroke="white"
        strokeWidth="3"
        paintOrder="stroke"
        fontWeight="bold"
      >
        {Math.round(bearing)}°M
      </text>
    </g>
  );
};

// --- 3. Pencil Marks ---
export const PencilMark = ({ type, p }: { type: "fix" | "ep" | "dr"; p: Point }) => {
  if (type === "fix") {
    return (
      <g transform={`translate(${p.x}, ${p.y})`}>
        <circle r="3" fill="none" stroke="black" strokeWidth="2" />
        <circle r="1" fill="black" />
      </g>
    );
  }
  // Add other symbols later
  return <circle cx={p.x} cy={p.y} r="2" fill="black" />;
};
