export const GasLockerDrainDiagram = () => (
  <figure className="rounded-lg border bg-muted/30 p-4" aria-labelledby="gas-locker-diagram-caption">
    <svg
      viewBox="0 0 760 360"
      role="img"
      aria-labelledby="gas-locker-diagram-title gas-locker-diagram-desc"
      className="h-auto w-full"
    >
      <title id="gas-locker-diagram-title">Correct and incorrect LPG locker drain arrangements</title>
      <desc id="gas-locker-diagram-desc">
        The correct panel shows an outside-access, vapour-tight cylinder locker. An unobstructed pipe falls continuously
        from its low point to an overboard outlet at least 75 millimetres above the at-rest waterline and away from a hull
        opening. The incorrect panel shows a rising, obstructed pipe ending below the waterline near an opening.
      </desc>
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
        <rect x="20" y="25" width="340" height="300" rx="10" />
        <rect x="400" y="25" width="340" height="300" rx="10" />
        <path data-testid="correct-waterline" d="M35 250H345" strokeDasharray="10 7" />
        <path d="M415 250H725" strokeDasharray="10 7" />
        <path d="M90 70h125v125H90zM470 70h125v125H470z" />
        <path d="M110 195L290 220" stroke="hsl(var(--primary))" />
        <circle data-testid="correct-drain-outlet" cx="290" cy="220" r="7" />
        <path d="M490 195L550 225L625 205L680 280" stroke="hsl(var(--destructive))" />
        <path d="M535 215l30 25M565 215l-30 25" stroke="hsl(var(--destructive))" />
        <g data-testid="outlet-clearance-dimension" aria-hidden="true">
          <path d="M290 220H318M290 250H318" strokeWidth="2" />
          <path d="M310 220V250M302 220H318M302 250H318" strokeWidth="3" />
        </g>
        <path d="M650 125h45v55h-45z" />
      </g>
      <g fill="currentColor" fontSize="20" fontWeight="600">
        <text x="38" y="55">Correct ✓</text>
        <text x="418" y="55">Incorrect ✕</text>
        <text x="38" y="278">At-rest waterline</text>
        <text x="418" y="278">At-rest waterline</text>
        <text data-testid="outlet-clearance-label" x="322" y="241" fontSize="15" textAnchor="start">
          ≥ 75 mm
        </text>
      </g>
    </svg>
    <figcaption id="gas-locker-diagram-caption" className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
      <p className="rounded-md border border-emerald-700 p-3">
        <strong>Correct:</strong> outside access; enclosure vapour-tight to accommodation; clear, continuously falling
        drain from the low point; outlet at least 75 mm above the at-rest waterline and away from hull openings.
      </p>
      <p className="rounded-md border border-destructive p-3">
        <strong>Incorrect:</strong> pipe rises, traps vapour or is obstructed; outlet is below the waterline or beside an
        opening. Do not accept this arrangement as a drain.
      </p>
    </figcaption>
  </figure>
);
