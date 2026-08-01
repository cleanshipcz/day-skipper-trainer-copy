import type { Knot, KnotId } from "@/data/ropeworkKnots";

type Diagram = { rope: string[]; object?: "post" | "ring"; load: [number, number, number, number] };

const diagrams: Record<KnotId, Diagram> = {
  bowline: { rope: ["M145 18 V72 C145 100 112 101 104 75 C96 47 35 50 31 102 C27 151 87 164 113 131 C126 114 123 91 105 77", "M105 77 C128 69 156 83 159 108 V150"], load: [145, 34, 145, 10] },
  "clove-hitch": { rope: ["M43 20 C43 65 157 54 157 91 C157 128 43 116 43 160", "M157 20 C157 65 43 54 43 91 C43 128 157 116 157 160"], object: "post", load: [43, 36, 43, 10] },
  "reef-knot": { rope: ["M15 74 C55 74 62 126 102 104 C132 88 133 67 185 67", "M15 112 C54 112 62 62 101 82 C132 99 137 112 185 112"], load: [36, 74, 8, 74] },
  "figure-eight": { rope: ["M100 12 V47 C100 74 52 65 52 101 C52 139 148 139 148 101 C148 65 75 58 75 88 C75 110 101 116 101 160"], load: [100, 32, 100, 8] },
  "round-turn": { rope: ["M185 58 C144 58 143 22 99 22 C48 22 47 105 98 105 C148 105 149 61 116 61 C85 61 84 137 119 137 C145 137 150 119 151 101 C152 82 131 76 119 91 C108 105 123 123 151 122"], object: "ring", load: [168, 58, 194, 58] },
  "sheet-bend": { rope: ["M22 38 C84 38 88 143 22 143", "M116 158 C116 121 151 120 151 83 C151 48 104 45 87 73 C72 98 93 119 133 103"], load: [39, 38, 13, 38] },
  "rolling-hitch": { rope: ["M10 91 H190", "M42 25 C72 25 74 140 105 140 C137 140 137 43 107 43 C77 43 77 126 108 126 C139 126 140 76 116 76 C98 76 99 101 126 105 L165 105"], load: [62, 25, 32, 25] },
};

export function KnotDiagram({ knot }: { knot: Knot }) {
  const diagram = diagrams[knot.id];
  return (
    <figure className="rounded-lg border bg-muted/30 p-3" aria-labelledby={`${knot.id}-diagram-caption`}>
      <svg className="mx-auto h-auto w-full max-w-xs" viewBox="0 0 200 175" role="img" aria-label={`${knot.name} final-form diagram. ${knot.visualDescription}`}>
        <defs>
          <marker id={`${knot.id}-arrow`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" className="fill-destructive" /></marker>
        </defs>
        {diagram.object === "post" && <rect x="84" y="8" width="32" height="160" rx="8" className="fill-muted stroke-foreground" strokeWidth="2" />}
        {diagram.object === "ring" && <circle cx="99" cy="67" r="35" fill="none" className="stroke-muted-foreground" strokeWidth="9" />}
        {diagram.rope.map((path, index) => <path key={path} d={path} fill="none" className={index ? "stroke-secondary" : "stroke-primary"} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />)}
        <line x1={diagram.load[0]} y1={diagram.load[1]} x2={diagram.load[2]} y2={diagram.load[3]} className="stroke-destructive" strokeWidth="3" markerEnd={`url(#${knot.id}-arrow)`} />
        <text x="8" y="170" className="fill-foreground text-[10px]">Red arrow: load direction</text>
      </svg>
      <figcaption id={`${knot.id}-diagram-caption`} className="mt-2 text-sm text-muted-foreground">{knot.visualDescription}</figcaption>
    </figure>
  );
}
