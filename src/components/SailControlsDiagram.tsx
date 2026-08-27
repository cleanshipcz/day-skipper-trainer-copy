import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { sailControls } from "@/data/sailControls";

interface Props { highlightId?: string; onHover?: (id: string | null) => void; onClick?: (id: string) => void }
interface Geometry { path: string; handle: { x: number; y: number } }

// Each route is intentionally diagrammatic: it follows the complete working
// line from its sail attachment to its deck control, rather than tracing faint
// or hidden rope in a photograph.
const geometry: Record<string, Geometry> = {
  "main-halyard": { path: "M408 82 L430 52 L442 478", handle: { x: 442, y: 300 } },
  "jib-halyard": { path: "M458 108 L430 52 L458 478", handle: { x: 458, y: 454 } },
  mainsheet: { path: "M285 410 L304 443 L286 475 L310 514", handle: { x: 304, y: 443 } },
  "jib-sheet": { path: "M744 410 L628 493 L548 514", handle: { x: 548, y: 514 } },
  "boom-vang": { path: "M378 410 L428 480", handle: { x: 403, y: 445 } },
  outhaul: { path: "M166 407 L370 407", handle: { x: 188, y: 407 } },
  cunningham: { path: "M410 350 L424 477", handle: { x: 413, y: 376 } },
  "topping-lift": { path: "M430 52 L162 400", handle: { x: 300, y: 221 } },
  "reefing-lines": { path: "M248 300 L210 407 M270 344 L235 407", handle: { x: 248, y: 300 } },
  traveller: { path: "M247 516 L364 516", handle: { x: 340, y: 516 } },
  "jib-fairlead": { path: "M614 493 L645 493", handle: { x: 628, y: 493 } },
  "backstay-adjuster": { path: "M430 52 L105 472", handle: { x: 121, y: 451 } },
};
const overlays = sailControls.map((control, index) => ({ ...control, ...geometry[control.id], keyNumber: index + 1 }));

const keyboardProps = (control: (typeof overlays)[number], onClick?: (id: string) => void, onHover?: (id: string | null) => void) => !onClick ? {} : ({
  role: "button", tabIndex: 0, "aria-label": `Show ${control.name} details from diagram`,
  onFocus: () => onHover?.(control.id), onBlur: () => onHover?.(null),
  onKeyDown: (event: ReactKeyboardEvent<SVGGElement>) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onClick(control.id); } },
});

const SailControlsDiagram = ({ highlightId, onHover, onClick }: Props) => (
  <svg viewBox="0 0 900 600" className="h-auto w-[826px] max-w-none rounded-xl bg-sky-50 dark:bg-slate-950" aria-label="Interactive cutaway of a cruising sloop showing where each sail control runs" aria-describedby="sail-controls-diagram-help">
    <defs>
      <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#bae6fd" /><stop offset="1" stopColor="#e0f2fe" /></linearGradient>
      <linearGradient id="hull" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff" /><stop offset="1" stopColor="#cbd5e1" /></linearGradient>
      <filter id="controlGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    <rect width="900" height="600" rx="20" fill="url(#sea)" />
    <path d="M0 535 Q110 520 220 535 T440 535 T660 535 T900 535 V600 H0Z" fill="#38bdf8" opacity=".5" />
    {/* Simplified cutaway keeps the rig geometry legible at phone size. */}
    <path d="M90 480 Q430 458 800 478 L755 548 Q415 575 125 535Z" fill="url(#hull)" stroke="#334155" strokeWidth="5" />
    <path d="M205 470 L250 437 H525 L570 475" fill="#e2e8f0" stroke="#64748b" strokeWidth="4" />
    <path d="M430 478 L430 52" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
    <path d="M420 75 L173 398 L420 398Z" fill="#fff" fillOpacity=".88" stroke="#94a3b8" strokeWidth="3" />
    <path d="M446 92 L744 398 L446 398Z" fill="#fff" fillOpacity=".82" stroke="#94a3b8" strokeWidth="3" />
    <path d="M430 410 L158 410" stroke="#475569" strokeWidth="10" strokeLinecap="round" />
    <path d="M430 52 L105 472 M430 52 L790 475" stroke="#64748b" strokeWidth="2" />
    <path d="M248 300 L412 300 M270 344 L416 344" stroke="#94a3b8" strokeWidth="2" strokeDasharray="7 7" />
    <g fill="#475569"><circle cx="540" cy="514" r="10" /><circle cx="650" cy="500" r="8" /></g>
    {onClick && overlays.map((control) => {
      const active = !highlightId || highlightId === control.id;
      return <g key={control.id} {...keyboardProps(control, onClick, onHover)} data-control-id={control.id} className="cursor-pointer focus:outline-none focus-visible:[&>[data-touch-target]]:stroke-slate-950 focus-visible:[&>[data-touch-target]]:stroke-[5] dark:focus-visible:[&>[data-touch-target]]:stroke-white" opacity={active ? 1 : 0.12} filter={highlightId === control.id ? "url(#controlGlow)" : undefined} onMouseEnter={() => onHover?.(control.id)} onMouseLeave={() => onHover?.(null)} onClick={() => onClick(control.id)}>
        <path data-control-artwork={control.id} data-pointer-exclusion="presentation route halo" d={control.path} fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" opacity=".9" />
        <path data-control-artwork={control.id} data-pointer-exclusion="presentation route" d={control.path} fill="none" stroke={control.color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
        <circle data-touch-target={control.id} data-hit-center={`${control.handle.x},${control.handle.y}`} cx={control.handle.x} cy={control.handle.y} r="24" fill="transparent" stroke="transparent" />
        <circle data-control-affordance={control.id} cx={control.handle.x} cy={control.handle.y} r="15" fill="white" stroke={control.color} strokeWidth="5" pointerEvents="none" />
        <text data-control-key={control.id} x={control.handle.x} y={control.handle.y} dy="0.35em" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="800" pointerEvents="none" aria-hidden="true">{control.keyNumber}</text>
      </g>;
    })}
  </svg>
);

export default SailControlsDiagram;
