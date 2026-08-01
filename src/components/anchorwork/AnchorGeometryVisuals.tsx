import { scopeWorkedExample, swingWorkedExample } from "@/features/anchorwork/scopeCalculations";

const label = "fill-foreground text-[14px] font-medium";
const line = "stroke-foreground [vector-effect:non-scaling-stroke]";

export const AnchorGeometryVisuals = () => (
  <div className="space-y-6" data-testid="anchor-geometry-visuals">
    <figure className="space-y-3">
      <div className="max-w-full overflow-x-auto" tabIndex={0} aria-label="Scrollable side-view diagram">
      <svg className="block h-auto w-full min-w-[42rem] rounded-lg border bg-background text-foreground" viewBox="0 0 700 300" role="img" aria-labelledby="anchor-side-title" aria-describedby="anchor-side-desc">
        <title id="anchor-side-title">Scale side view of the worked scope example</title>
        <desc id="anchor-side-desc">At twelve pixels per metre, 35 metres of rode joins the anchor and bow roller. The maximum vertical distance is seven metres: four metres current water depth, two metres tide rise, and one metre bow height. The scope is five to one.</desc>
        <rect width="700" height="300" className="fill-background" />
        <path d="M20 220H680" className={`${line} fill-none`} strokeWidth="3" /><text x="24" y="244" className={label}>Seabed</text>
        <path d="M20 172H680" className={`${line} fill-none`} strokeWidth="2" strokeDasharray="10 6" /><text x="24" y="166" className={label}>Current waterline</text>
        <path d="M20 148H680" className={`${line} fill-none`} strokeWidth="2" strokeDasharray="3 5" /><text x="24" y="142" className={label}>High-water planning line</text>
        <path d="M501 136l34 12h90q-7 31-55 33h-69z" className={`${line} fill-background`} strokeWidth="3" /><circle cx="501" cy="136" r="5" className="fill-foreground" /><text x="510" y="127" className={label}>Bow roller / chock</text>
        <line data-testid="scope-rode" data-scale-pixels-per-metre="12" x1="90" y1="220" x2="501" y2="136" className={`${line} fill-none`} strokeWidth="4" /><path d="M80 211l10 9-14 8m14-8 13 8m-13-8v-21" className={`${line} fill-none`} strokeWidth="4" /><text x="190" y="193" className={label}>Rode length 35 m</text>
        <line data-testid="maximum-vertical-distance" x1="650" y1="220" x2="650" y2="136" className={`${line} fill-none`} strokeWidth="2" />
        <path d="M655 220h17m-17-48h17m-8 48v-48" className={`${line} fill-none`} strokeWidth="2" /><text x="646" y="199" textAnchor="end" className={label}>4 m water depth</text>
        <path d="M625 172h17m-17-24h17m-8 24v-24" className={`${line} fill-none`} strokeWidth="2" /><text x="615" y="164" textAnchor="end" className={label}>2 m tide rise</text>
        <path d="M590 148h17m-17-12h17m-8 12v-12" className={`${line} fill-none`} strokeWidth="2" /><text x="580" y="132" textAnchor="end" className={label}>1 m bow height</text>
        <line data-testid="horizontal-rode-reach" x1="90" y1="266" x2="501" y2="266" className={`${line} fill-none`} strokeWidth="2" /><path d="M90 259v14m411-14v14" className={`${line} fill-none`} strokeWidth="2" /><text x="295" y="288" textAnchor="middle" className={label}>Horizontal reach ≈ 34.3 m</text>
        <text x="24" y="24" className={label}>Scale: 12 px = 1 m • maximum vertical distance 7 m • scope 35 ÷ 7 = 5:1</text>
      </svg></div>
      <figcaption className="text-sm leading-relaxed text-muted-foreground">The ratio uses maximum bow-roller-to-seabed distance, not water depth alone: 4 m current depth + 2 m expected rise + 1 m bow height = 7 m. A 35 m rode gives 5:1 scope. The straight rode is a planning simplification; catenary, stretch and movement need additional judgement.</figcaption>
    </figure>
    <figure className="space-y-3">
      <div className="max-w-full overflow-x-auto" tabIndex={0} aria-label="Scrollable plan-view diagram">
      <svg className="block h-auto w-full min-w-[42rem] rounded-lg border bg-background text-foreground" viewBox="0 0 700 420" role="img" aria-labelledby="anchor-plan-title" aria-describedby="anchor-plan-desc">
        <title id="anchor-plan-title">Plan view of vessel swinging room and nearby hazards</title>
        <desc id="anchor-plan-desc">The anchor is central. The vessel sweeps a radius of about 44.3 metres. A hatched clearance and uncertainty margin surrounds it. A shoal and neighbouring vessel lie nearby.</desc>
        <defs><pattern id="clearance-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line y2="10" className={line} strokeWidth="2" /></pattern></defs>
        <rect width="700" height="420" className="fill-background" /><circle cx="320" cy="220" r="190" fill="url(#clearance-hatch)" className={line} strokeWidth="2" strokeDasharray="8 5" /><circle data-testid="swing-radius" data-scale-pixels-per-metre="3.5" cx="320" cy="220" r="155" className={`${line} fill-background`} strokeWidth="3" />
        <path d="M310 213l10 7-12 10m12-10 12 10m-12-10v-21" className={`${line} fill-none`} strokeWidth="4" /><text x="320" y="193" textAnchor="middle" className={label}>Anchor</text>
        <path d="M320 220h155m-155-8v16m155-16v16" className={`${line} fill-none`} strokeWidth="2" /><text x="398" y="208" textAnchor="middle" className={label}>Approx. swing radius 44.3 m</text><path d="M475 220h35" className={`${line} fill-none`} strokeWidth="2" /><text x="492" y="245" textAnchor="middle" className={label}>Extra clearance</text><text x="492" y="262" textAnchor="middle" className={label}>+ uncertainty</text>
        <g transform="translate(432 190)rotate(90)"><path d="M-30 0l50-12 10 12-10 12z" className={`${line} fill-background`} strokeWidth="3" /><path d="M-22 0h43" className={`${line} fill-none`} strokeWidth="2" /></g><text x="443" y="177" className={label}>Vessel at one possible position</text>
        <path d="M548 65l35 18-18 28-42-6-8-25z" className={`${line} fill-background`} strokeWidth="4" strokeDasharray="6 4" /><text x="515" y="53" className={label}>Shoal / obstruction</text>
        <g transform="translate(605 300)"><path d="M-23 0l40-10 8 10-8 10z" className={`${line} fill-background`} strokeWidth="3" /><circle r="38" className={`${line} fill-none`} strokeWidth="2" strokeDasharray="3 5" /></g><text x="548" y="358" className={label}>Neighbour and its own swing</text>
        <text x="24" y="24" className={label}>Plan view • illustrative scale: 3.5 px = 1 m</text>
      </svg></div>
      <figcaption className="text-sm leading-relaxed text-muted-foreground">Planning approximation: 34.3 m horizontal rode reach plus 10 m from bow roller to the vessel’s furthest point gives a 44.3 m swept radius. Add margin for position uncertainty, yaw, weather and tide, and check the whole circle against hazards and every neighbour’s swinging circle.</figcaption>
    </figure>
    <div className="rounded-lg border p-4 text-sm" aria-label="Diagram values in text"><h3 className="font-semibold">Worked values</h3><dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-[minmax(12rem,auto)_1fr]"><dt>Maximum vertical distance</dt><dd>{scopeWorkedExample.maximumVerticalDistanceMetres} m (4 m depth + 2 m tide + 1 m bow height)</dd><dt>Rode and scope</dt><dd>35 m; {scopeWorkedExample.ratio}:1</dd><dt>Horizontal rode reach</dt><dd>{swingWorkedExample.horizontalRodeReachMetres.toFixed(2)} m</dd><dt>Approximate swept radius</dt><dd>{swingWorkedExample.approximateSwingRadiusMetres.toFixed(2)} m, before clearance and uncertainty</dd></dl></div>
  </div>
);
