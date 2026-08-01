import type { Knot, KnotId } from "@/data/ropeworkKnots";

type Point = [number, number];
type Endpoint = { role: "standing-a" | "working-a" | "standing-b" | "working-b"; point: Point; side: "left" | "right" | "top" | "bottom" };
type Diagram = {
  ropes: string[];
  bridges: { rope: number; path: string }[];
  object?: "post" | "ring";
  load: [number, number, number, number];
  standingPart: Point;
  workingEnd: Point;
  endpoints?: Endpoint[];
};

// Each physical rope is one continuous path. Short bridge paths redraw the
// over-passing section with a background casing so
// crossings remain unambiguous at small sizes and in high-contrast themes.
const knotDiagramSpecs: Record<KnotId, Diagram> = {
  bowline: {
    ropes: ["M145 12 L145 62 C145 82 123 89 108 75 C91 59 41 60 31 101 C18 153 87 166 113 132 C129 111 120 88 104 76 C125 70 158 83 158 111 L158 154"],
    bridges: [{ rope: 0, path: "M104 76 C125 70 145 78 153 94" }], load: [145, 34, 145, 7], standingPart: [145, 17], workingEnd: [158, 151],
  },
  "clove-hitch": {
    ropes: ["M42 12 L42 44 C42 64 63 72 100 72 C137 72 158 80 158 100 C158 122 132 132 100 132 C68 132 42 122 42 100 C42 80 65 72 100 72 C135 72 158 63 158 43 L158 158"],
    bridges: [{ rope: 0, path: "M76 72 C84 72 92 72 100 72 C116 72 130 70 140 64" }], object: "post", load: [42, 32, 42, 7], standingPart: [42, 17], workingEnd: [158, 154],
  },
  "reef-knot": {
    ropes: ["M10 61 C50 61 61 77 84 98 C101 114 71 119 10 119", "M190 61 C150 61 139 77 116 98 C99 114 129 119 190 119"],
    bridges: [{ rope: 1, path: "M116 98 C106 107 102 111 108 114" }, { rope: 0, path: "M74 89 C79 94 82 97 86 101" }], load: [34, 61, 5, 61], standingPart: [14, 61], workingEnd: [14, 119],
    endpoints: [
      { role: "standing-a", point: [10, 61], side: "left" }, { role: "working-a", point: [10, 119], side: "left" },
      { role: "standing-b", point: [190, 61], side: "right" }, { role: "working-b", point: [190, 119], side: "right" },
    ],
  },
  "figure-eight": {
    ropes: ["M100 9 L100 43 C100 62 57 65 52 97 C45 138 148 143 149 99 C150 68 77 57 73 86 C70 107 93 119 102 128 L102 160"],
    bridges: [{ rope: 0, path: "M73 86 C71 99 80 109 91 118" }], load: [100, 30, 100, 5], standingPart: [100, 14], workingEnd: [102, 157],
  },
  "round-turn": {
    ropes: ["M190 48 C159 48 145 19 101 19 C48 19 39 100 92 108 C139 115 157 82 136 67 C118 54 95 71 97 92 C99 113 130 118 148 105 C165 93 161 75 147 76 C128 76 126 105 146 119 C158 127 164 137 164 159"],
    bridges: [{ rope: 0, path: "M97 92 C99 108 118 115 136 111" }, { rope: 0, path: "M137 77 C128 85 132 101 145 106" }], object: "ring", load: [167, 48, 195, 48], standingPart: [186, 48], workingEnd: [164, 156],
  },
  "sheet-bend": {
    ropes: ["M14 40 C80 40 86 141 14 141", "M174 158 C174 126 153 119 153 83 C153 48 107 44 87 70 C69 94 67 116 24 121"],
    bridges: [{ rope: 1, path: "M87 70 C76 84 72 97 65 106" }], load: [38, 40, 8, 40], standingPart: [18, 40], workingEnd: [24, 121],
    endpoints: [
      { role: "standing-a", point: [14, 40], side: "left" }, { role: "working-a", point: [14, 141], side: "left" },
      { role: "standing-b", point: [174, 158], side: "right" }, { role: "working-b", point: [24, 121], side: "left" },
    ],
  },
  "rolling-hitch": {
    ropes: ["M7 91 L193 91", "M35 25 C58 25 67 43 67 68 C67 112 89 137 112 137 C139 137 147 112 136 96 C126 81 99 82 91 96 C80 115 99 128 121 121 C143 114 147 83 130 70 C112 56 91 65 91 83 C91 99 112 108 139 108 C158 108 166 126 166 158"],
    bridges: [{ rope: 1, path: "M91 83 C91 96 105 104 122 107" }, { rope: 1, path: "M122 121 C139 115 145 99 139 86" }], load: [57, 25, 29, 25], standingPart: [39, 25], workingEnd: [166, 155],
  },
};

export function KnotDiagram({ knot }: { knot: Knot }) {
  const diagram = knotDiagramSpecs[knot.id];
  const ropeClass = (index: number) => index ? "stroke-secondary" : "stroke-primary";
  return (
    <figure className="rounded-lg border bg-muted/30 p-3" aria-labelledby={`${knot.id}-diagram-caption`} data-knot-diagram={knot.id} data-rope-count={diagram.ropes.length} data-bridge-count={diagram.bridges.length}>
      <svg className="mx-auto h-auto w-full max-w-xs" viewBox="0 0 200 180" role="img" aria-label={`${knot.name} final-form diagram. ${knot.visualDescription}`}>
        <defs><marker id={`${knot.id}-arrow`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" className="fill-destructive" /></marker></defs>
        {diagram.object === "post" && <rect x="84" y="6" width="32" height="158" rx="8" className="fill-muted stroke-foreground" strokeWidth="2" />}
        {diagram.object === "ring" && <circle cx="99" cy="66" r="35" fill="none" className="stroke-muted-foreground" strokeWidth="9" />}
        {diagram.ropes.map((path, index) => <path key={path} data-rope-path="continuous" d={path} fill="none" className={ropeClass(index)} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />)}
        {diagram.bridges.map((bridge, index) => <g key={bridge.path} data-crossing-bridge={index + 1}><path d={bridge.path} fill="none" className="stroke-background" strokeWidth="15" strokeLinecap="round" /><path d={bridge.path} fill="none" className={ropeClass(bridge.rope)} strokeWidth="9" strokeLinecap="round" /></g>)}
        <line x1={diagram.load[0]} y1={diagram.load[1]} x2={diagram.load[2]} y2={diagram.load[3]} className="stroke-destructive" strokeWidth="3" markerEnd={`url(#${knot.id}-arrow)`} />
        <circle cx={diagram.standingPart[0]} cy={diagram.standingPart[1]} r="3" className="fill-destructive" /><circle cx={diagram.workingEnd[0]} cy={diagram.workingEnd[1]} r="3" className="fill-foreground" />
        {diagram.endpoints?.map((endpoint) => <g key={endpoint.role} data-endpoint-role={endpoint.role} data-endpoint-side={endpoint.side} data-x={endpoint.point[0]} data-y={endpoint.point[1]}><circle cx={endpoint.point[0]} cy={endpoint.point[1]} r="4" className={endpoint.role.startsWith("standing") ? "fill-destructive" : "fill-foreground"} /></g>)}
        <text x="5" y="172" className="fill-foreground text-[9px]">● working end</text><text x="78" y="172" className="fill-destructive text-[9px]">● standing part / load</text>
      </svg>
      <figcaption id={`${knot.id}-diagram-caption`} className="mt-2 text-sm text-muted-foreground">{knot.visualDescription}</figcaption>
    </figure>
  );
}
