import { useState } from "react";
import { forecastAreas } from "@/data/forecastAreas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ForecastAreaMap = () => {
  const [selected, setSelected] = useState(forecastAreas[0]);
  return (
    <Card>
      <CardHeader><CardTitle>Shipping forecast areas</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p id="map-instruction">Select an area from the map or the list to locate and identify it.</p>
        <div className="relative aspect-[4/5] min-h-[24rem] overflow-hidden rounded-lg border bg-sky-100 dark:bg-slate-900" aria-describedby="map-instruction">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path d="M37 3 44 6 45 13 50 17 48 24 53 31 51 39 55 45 51 52 53 59 49 68 52 75 48 82 39 84 34 76 35 66 31 58 35 50 31 43 34 35 31 27 35 19 32 12Z" className="fill-emerald-200 stroke-emerald-700/60 dark:fill-emerald-950 dark:stroke-emerald-500" />
            <path d="M24 34 31 37 32 47 28 55 22 52 20 43Z" className="fill-emerald-200 stroke-emerald-700/60 dark:fill-emerald-950 dark:stroke-emerald-500" />
            <path d="M80 5 91 8 94 24 90 39 84 47 78 42 80 30 76 20Z" className="fill-emerald-200 stroke-emerald-700/60 dark:fill-emerald-950 dark:stroke-emerald-500" />
            <path d="M46 84 63 80 77 84 87 94 32 99 27 93Z" className="fill-emerald-200 stroke-emerald-700/60 dark:fill-emerald-950 dark:stroke-emerald-500" />
            <text x="43" y="48" className="fill-emerald-950 text-[4px] font-semibold dark:fill-emerald-100">Great Britain</text>
            <text x="20" y="45" className="fill-emerald-950 text-[4px] font-semibold dark:fill-emerald-100">Ireland</text>
            <text x="80" y="28" className="fill-emerald-950 text-[4px] font-semibold dark:fill-emerald-100">Norway</text>
          </svg>
          {forecastAreas.map((area) => (
            <button key={area.name} type="button" style={{ left: `${area.x}%`, top: `${area.y}%` }} className="absolute hidden -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary p-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:block" onClick={() => setSelected(area)} aria-label={`${area.name}: ${area.description}`} aria-pressed={selected.name === area.name}>
              <span className="sr-only">{area.name}</span>
            </button>
          ))}
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${selected.x}%`, top: `${selected.y}%` }}
            data-testid="selected-area-marker"
            data-area={selected.name}
          >
            <span className="block h-4 w-4 rounded-full border-2 border-white bg-destructive shadow ring-2 ring-destructive/40" />
            <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded bg-background/95 px-2 py-1 text-xs font-semibold text-foreground shadow">
              {selected.name}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" role="group" aria-label="Shipping forecast area list">
          {forecastAreas.map((area) => (
            <button key={area.name} type="button" onClick={() => setSelected(area)} aria-pressed={selected.name === area.name} className="min-h-11 rounded-md border px-2 py-1 text-left text-sm focus-visible:ring-2 focus-visible:ring-ring data-[selected=true]:border-primary data-[selected=true]:bg-primary/10" data-selected={selected.name === area.name}>
              {area.name}
            </button>
          ))}
        </div>
        <p role="status" aria-live="polite"><strong>{selected.name}:</strong> {selected.description}</p>
      </CardContent>
    </Card>
  );
};
