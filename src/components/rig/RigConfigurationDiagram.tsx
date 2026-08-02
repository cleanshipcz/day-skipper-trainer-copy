const callouts = [
  { n: 1, x: 198, y: 42, label: "Mast and spreaders", detail: "Spar arrangement; shape and fittings depend on the fitted mast plan." },
  { n: 2, x: 112, y: 102, label: "Forestay and shrouds", detail: "Standing-rigging support; material, termination and tuning are configuration-specific." },
  { n: 3, x: 274, y: 126, label: "Backstay", detail: "Shown as one example only; split, running or absent backstays require a different plan." },
  { n: 4, x: 127, y: 246, label: "Chainplate and terminal", detail: "Attachment continues into structure that a deck-level view cannot clear." },
  { n: 5, x: 234, y: 165, label: "Boom and gooseneck", detail: "Control the swing and support before close inspection." },
  { n: 6, x: 222, y: 206, label: "Halyard and reefing leads", detail: "Illustrative running-rigging path; trace the vessel's labelled lead plan." },
] as const;

export const RigConfigurationDiagram = () => <figure className="min-w-0 rounded-lg border bg-muted/30 p-3 forced-colors:border-[CanvasText]" aria-labelledby="rig-diagram-caption">
  <div className="overflow-x-auto rounded-md bg-background focus-visible:ring-2 focus-visible:ring-ring" tabIndex={0} role="region" aria-label="Scrollable rig diagram; the numbered text alternative follows">
    <svg className="mx-auto h-auto w-full min-w-[20rem] max-w-3xl" viewBox="0 0 420 290" role="img" aria-labelledby="rig-diagram-title rig-diagram-desc">
      <title id="rig-diagram-title">Configuration-qualified mast and rigging orientation diagram</title>
      <desc id="rig-diagram-desc">Side view of one masthead sloop example, labelling mast and spreaders, forestay and shrouds, backstay, chainplate and terminal, boom and gooseneck, and illustrative halyard and reefing paths. It is not a tuning or assembly plan.</desc>
      <path d="M35 250 Q210 266 385 250 L365 278 L62 278 Z" className="fill-ocean/15 stroke-foreground" strokeWidth="2" />
      <path d="M205 250 L205 35" className="stroke-foreground" strokeWidth="8" />
      <path d="M159 104 L251 104" className="stroke-foreground" strokeWidth="5" />
      <path d="M201 45 L82 250 M209 45 L333 250 M163 104 L125 250 M247 104 L288 250" fill="none" className="stroke-muted-foreground" strokeWidth="2.5" />
      <path d="M209 159 L321 172" className="stroke-foreground" strokeWidth="7" />
      <path d="M198 48 L185 218 L309 218" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray="7 4" />
      <path d="M211 48 L224 199 L316 199" fill="none" className="stroke-accent-foreground" strokeWidth="3" strokeDasharray="3 4" />
      <rect x="116" y="240" width="18" height="20" rx="2" className="fill-destructive/20 stroke-foreground" />
      {callouts.map(({ n, x, y }) => <g key={n}><circle cx={x} cy={y} r="11" className="fill-primary stroke-background" strokeWidth="2"/><text x={x} y={y + 4} textAnchor="middle" className="fill-primary-foreground text-xs font-bold">{n}</text></g>)}
    </svg>
  </div>
  <figcaption id="rig-diagram-caption" className="mt-3">
    <p className="font-semibold">One masthead-sloop example—not a tuning, load or assembly plan</p>
    <ol className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">{callouts.map(({ n, label, detail }) => <li key={n}><strong className="text-foreground">{n}. {label}:</strong> {detail}</li>)}</ol>
  </figcaption>
</figure>;
