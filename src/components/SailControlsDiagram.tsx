import type { KeyboardEvent as ReactKeyboardEvent } from "react";

interface Props { highlightId?: string; onHover?: (id: string | null) => void; onClick?: (id: string) => void }
interface Overlay { id: string; name: string; color: string; hitPolygons: readonly string[]; path?: string; points?: string; anchor: { x: number; y: number } }

const overlays: readonly Overlay[] = [
  { id: "main-halyard", name: "Main Halyard", color: "#2563eb", hitPolygons: ["285,52 329,52 329,165 285,165", "292,167 329,167 329,310 292,310", "276,312 329,312 329,462 276,462"], path: "M320 462 L320 48 L332 35", anchor: { x: 320, y: 450 } },
  { id: "jib-halyard", name: "Jib Halyard", color: "#0891b2", hitPolygons: ["331,52 375,52 375,464 331,464"], path: "M340 464 L340 51 L332 35", anchor: { x: 340, y: 450 } },
  { id: "mainsheet", name: "Mainsheet", color: "#db2777", hitPolygons: ["210,478 258,478 258,574 210,574"], path: "M236 500 L258 548 L246 574", anchor: { x: 236, y: 500 } },
  { id: "jib-sheet", name: "Jib Sheet", color: "#d97706", hitPolygons: ["397,505 544,505 544,549 397,549"], points: "520,530 480,548", anchor: { x: 520, y: 530 } },
  { id: "boom-vang", name: "Boom Vang", color: "#dc2626", hitPolygons: ["260,478 310,478 310,574 260,574"], path: "M292 503 L270 556", anchor: { x: 292, y: 503 } },
  { id: "outhaul", name: "Outhaul", color: "#7c3aed", hitPolygons: ["136,464 208,464 208,508 136,508"], path: "M208 500 L151 500", anchor: { x: 151, y: 500 } },
  { id: "cunningham", name: "Cunningham", color: "#16a34a", hitPolygons: ["312,466 358,466 358,550 312,550"], path: "M320 478 L320 542", anchor: { x: 320, y: 478 } },
  { id: "topping-lift", name: "Topping Lift", color: "#475569", hitPolygons: ["248,200 290,218 256,310 214,292"], path: "M269 209 L235 301", anchor: { x: 269, y: 209 } },
  { id: "reefing-lines", name: "Reefing Lines", color: "#ea580c", hitPolygons: ["176,312 274,312 274,356 176,356", "176,368 274,368 274,412 176,412"], points: "270,341 218,337 270,408 198,402", anchor: { x: 218, y: 337 } },
  { id: "traveller", name: "Mainsheet Traveller", color: "#334155", hitPolygons: ["211,576 355,576 355,620 211,620"], path: "M218 576 L337 576", anchor: { x: 260, y: 576 } },
  { id: "jib-fairlead", name: "Jib Fairlead", color: "#57534e", hitPolygons: ["381,551 475,551 475,609 381,609"], path: "M430 570 L404 579", anchor: { x: 430, y: 570 } },
  { id: "backstay-adjuster", name: "Backstay Adjuster", color: "#1e3a5f", hitPolygons: ["190,200 232,218 192,310 150,292", "104,414 146,432 129,462 88,444"], path: "M211 209 L171 301 M125 423 L108 453", anchor: { x: 108, y: 453 } },
] as const;

const keyboardProps = (control: Overlay, onClick?: (id: string) => void, onHover?: (id: string | null) => void) => !onClick ? {} : ({
  role: "button", tabIndex: 0, "aria-label": `Show ${control.name} details from diagram`,
  onFocus: () => onHover?.(control.id), onBlur: () => onHover?.(null),
  onKeyDown: (event: ReactKeyboardEvent<SVGGElement>) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onClick(control.id) } },
});

const SailControlsDiagram = ({ highlightId, onHover, onClick }: Props) => (
  <svg viewBox="0 0 600 700" className="h-auto w-full min-w-[600px] max-w-none rounded-xl md:min-w-0" aria-label="Interactive side view of a cruising yacht showing sail controls and rig adjustments" aria-describedby="sail-controls-diagram-help">
    <defs><filter id="controlGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
    <image href="/images/sail-controls/cruising-sloop-controls.png" x="0" y="0" width="600" height="700" preserveAspectRatio="xMidYMid slice" data-yacht-plate="cruising-sloop-controls" />
    <rect x="0" y="0" width="600" height="700" rx="18" fill="none" stroke="currentColor" strokeOpacity="0.15" />
    {onClick && overlays.map((control) => {
      const active = !highlightId || highlightId === control.id;
      return <g key={control.id} {...keyboardProps(control, onClick, onHover)} data-control-id={control.id} className="cursor-pointer focus:outline-none focus-visible:[&>[data-touch-target]]:stroke-white focus-visible:[&>[data-touch-target]]:stroke-[4]" opacity={active ? 1 : 0.22} filter={highlightId === control.id ? "url(#controlGlow)" : undefined} onMouseEnter={() => onHover?.(control.id)} onMouseLeave={() => onHover?.(null)} onClick={() => onClick(control.id)}>
        <path data-touch-target={control.id} data-hit-polygons={control.hitPolygons.join("|")} d={control.hitPolygons.map((polygon) => `M${polygon}Z`).join(" ")} fill="transparent" />
        {control.path && <path data-control-artwork={control.id} data-pointer-exclusion="presentation outside owned hotspot" d={control.path} fill="none" stroke={control.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />}
        {control.points && <polyline data-control-artwork={control.id} data-pointer-exclusion="presentation outside owned hotspot" points={control.points} fill="none" stroke={control.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />}
        <circle data-control-artwork={control.id} data-pointer-exclusion="presentation outside owned hotspot" cx={control.anchor.x} cy={control.anchor.y} r="7" fill={control.color} stroke="white" strokeWidth="2" pointerEvents="none" />
      </g>;
    })}
  </svg>
);

export default SailControlsDiagram;
