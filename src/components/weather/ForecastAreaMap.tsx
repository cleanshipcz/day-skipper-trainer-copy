import { useState } from "react";
import { forecastAreas, SHIPPING_FORECAST_MAP_SOURCE } from "@/data/forecastAreas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const coastlines = [
  // Great Britain, Ireland, Iceland, Norway/continental Europe and Iberia:
  "M350 232 366 247 361 270 376 282 369 304 386 322 378 347 397 366 394 393 410 409 404 434 421 453 408 474 386 481 373 510 344 520 327 505 340 482 326 462 332 437 318 414 326 387 315 360 329 337 322 310 337 286Z",
  "M267 338 290 350 302 374 294 400 307 421 291 442 262 450 238 432 244 405 230 383 242 357Z",
  "M202 46 225 24 273 20 308 37 305 69 279 87 236 86 211 68Z",
  "M540 190 571 165 600 154 600 431 566 421 548 392 556 365 540 340 548 311 537 286Z",
  "M375 537 402 526 431 543 449 578 432 615 397 638 366 634 359 606Z M263 662 294 649 337 665 363 701 342 739 246 739 239 704Z",
] as const;

export const ForecastAreaMap = () => {
  const [selected, setSelected] = useState(forecastAreas[0]);
  return (
    <Card>
      <CardHeader><CardTitle>Shipping forecast areas</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p id="map-instruction">Select a labelled sea-area polygon or use the list. The selected full area is highlighted; coastlines remain visible for orientation.</p>
        <div className="overflow-hidden rounded-lg border bg-sky-100 dark:bg-slate-900">
          <svg viewBox="0 0 600 739" className="block h-auto max-h-[48rem] w-full" role="img" aria-labelledby="shipping-map-title shipping-map-description">
            <title id="shipping-map-title">Met Office Shipping Forecast sea areas</title>
            <desc id="shipping-map-description">All 31 forecast areas around the British Isles. Use Tab to focus an area and Enter or Space to select it. Land is drawn above the sea-area boundaries.</desc>
            <rect width="600" height="739" className="fill-sky-100 dark:fill-slate-900" />
            {forecastAreas.map((area) => {
              const isSelected = selected.name === area.name;
              return <path key={area.name} d={`M${area.polygon.replaceAll(" ", " L")} Z`} role="button" tabIndex={0} aria-label={`${area.name}: ${area.description}`} aria-pressed={isSelected} onClick={() => setSelected(area)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelected(area); } }} className={isSelected ? "cursor-pointer fill-amber-300 stroke-slate-950 stroke-[4] focus:outline-none focus-visible:stroke-blue-700 dark:fill-amber-500" : "cursor-pointer fill-sky-200 stroke-slate-600 stroke-[1.5] hover:fill-sky-300 focus:outline-none focus-visible:fill-sky-300 focus-visible:stroke-blue-700 focus-visible:stroke-[4] dark:fill-sky-950 dark:stroke-sky-300"} />;
            })}
            {coastlines.map((path) => <path key={path} d={path} className="pointer-events-none fill-emerald-200 stroke-emerald-800 stroke-2 dark:fill-emerald-950 dark:stroke-emerald-300" />)}
            <g className="pointer-events-none fill-emerald-950 text-[12px] font-bold paint-order-stroke stroke-white stroke-[3px] dark:fill-emerald-100 dark:stroke-emerald-950"><text x="356" y="390">Great Britain</text><text x="254" y="394">Ireland</text><text x="244" y="58">Iceland</text><text x="555" y="260">Norway</text><text x="290" y="700">Iberia</text></g>
            {forecastAreas.map((area) => <text key={area.name} x={area.label[0]} y={area.label[1]} textAnchor="middle" className="pointer-events-none fill-slate-950 text-[11px] font-semibold paint-order-stroke stroke-white stroke-[3px] dark:fill-white dark:stroke-slate-950">{area.name}</text>)}
            <g data-testid="selected-area-marker" data-area={selected.name} className="pointer-events-none"><circle cx={selected.label[0]} cy={selected.label[1] - 15} r="6" className="fill-red-700 stroke-white stroke-2"/><text x={selected.label[0]} y={selected.label[1] - 26} textAnchor="middle" className="fill-red-950 text-[12px] font-bold paint-order-stroke stroke-white stroke-[4px] dark:fill-red-200 dark:stroke-slate-950">{selected.name}</text></g>
          </svg>
        </div>
        <div className="flex flex-wrap gap-4 text-xs" aria-label="Map legend"><span><span className="mr-1 inline-block size-3 border border-slate-700 bg-sky-200"/>Forecast area</span><span><span className="mr-1 inline-block size-3 border-2 border-slate-950 bg-amber-300"/>Selected area</span><span><span className="mr-1 inline-block size-3 border border-emerald-800 bg-emerald-200"/>Land/coastline</span></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" role="group" aria-label="Shipping forecast area list">
          {forecastAreas.map((area) => <button key={area.name} type="button" onClick={() => setSelected(area)} aria-pressed={selected.name === area.name} className="min-h-11 rounded-md border px-2 py-1 text-left text-sm focus-visible:ring-2 focus-visible:ring-ring data-[selected=true]:border-primary data-[selected=true]:bg-primary/10" data-selected={selected.name === area.name}>{area.name}</button>)}
        </div>
        <p role="status" aria-live="polite"><strong>{selected.name}:</strong> {selected.description}. Neighbours: {selected.neighbours.join(", ")}.</p>
        <p className="text-xs text-muted-foreground">Source: <a className="underline" href={SHIPPING_FORECAST_MAP_SOURCE.guide} target="_blank" rel="noreferrer">Met Office Guide to marine forecasts</a> and current <a className="underline" href={SHIPPING_FORECAST_MAP_SOURCE.liveForecast} target="_blank" rel="noreferrer">Shipping Forecast</a>. Project-native SVG trace checked {SHIPPING_FORECAST_MAP_SOURCE.checked}; see map maintenance documentation for tracing limits.</p>
      </CardContent>
    </Card>
  );
};
