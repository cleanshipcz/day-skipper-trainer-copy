import { useId, useState } from "react";
import { forecastAreas, SHIPPING_FORECAST_MAP_SOURCE, type ForecastArea } from "@/data/forecastAreas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { areaInDirection, type ArrowKey } from "./weatherMapNavigation";

const coastlines = [
  // Great Britain, Ireland, Iceland, Norway/continental Europe and Iberia:
  "M350 232 366 247 361 270 376 282 369 304 386 322 378 347 397 366 394 393 410 409 404 434 421 453 408 474 386 481 373 510 344 520 327 505 340 482 326 462 332 437 318 414 326 387 315 360 329 337 322 310 337 286Z",
  "M267 338 290 350 302 374 294 400 307 421 291 442 262 450 238 432 244 405 230 383 242 357Z",
  "M202 46 225 24 273 20 308 37 305 69 279 87 236 86 211 68Z",
  "M540 190 571 165 600 154 600 431 566 421 548 392 556 365 540 340 548 311 537 286Z",
  "M375 537 402 526 431 543 449 578 432 615 397 638 366 634 359 606Z M263 662 294 649 337 665 363 701 342 739 246 739 239 704Z",
] as const;

const optionSlug = (name: string) => name.toLowerCase().replaceAll(" ", "-");

export const ForecastAreaMap = () => {
  const [selected, setSelected] = useState(forecastAreas[0]);
  const idPrefix = useId().replaceAll(":", "");
  const select = (area: ForecastArea) => setSelected(area);
  const selectedOptionId = `${idPrefix}-forecast-area-${optionSlug(selected.name)}`;

  return (
    <Card className="min-w-0">
      <CardHeader><CardTitle>Shipping forecast areas</CardTitle></CardHeader>
      <CardContent className="min-w-0 space-y-4">
        <p id={`${idPrefix}-map-instruction`}>Tap or click an area on the map, or use the area chooser. In the chooser, the arrow keys move geographically and select an area; Home or End selects the first or last area.</p>
        <div className="overflow-hidden rounded-lg border bg-sky-100 dark:bg-slate-900 forced-colors:border-[CanvasText]">
          <svg viewBox="0 0 600 739" className="block h-auto max-h-[48rem] min-w-0 w-full touch-manipulation" role="img" aria-labelledby={`${idPrefix}-shipping-map-title ${idPrefix}-shipping-map-description`}>
            <title id={`${idPrefix}-shipping-map-title`}>Met Office Shipping Forecast sea areas</title>
            <desc id={`${idPrefix}-shipping-map-description`}>All 31 forecast areas around the British Isles. {selected.name} is selected. Its neighbouring areas are {selected.neighbours.join(", ")}.</desc>
            <rect width="600" height="739" className="fill-sky-100 dark:fill-slate-900 forced-colors:fill-[Canvas]" />
            {forecastAreas.map((area) => {
              const isSelected = selected.name === area.name;
              return <path key={area.name} d={`M${area.polygon.replaceAll(" ", " L")} Z`} data-map-area={area.name} aria-hidden="true" onClick={() => select(area)} className={isSelected ? "cursor-pointer fill-amber-300 stroke-slate-950 stroke-[5] dark:fill-amber-400 dark:stroke-white forced-colors:fill-[Highlight] forced-colors:stroke-[HighlightText]" : "cursor-pointer fill-sky-200 stroke-slate-700 stroke-2 hover:fill-cyan-300 hover:stroke-slate-950 dark:fill-sky-950 dark:stroke-sky-200 dark:hover:fill-cyan-800 forced-colors:fill-[Canvas] forced-colors:stroke-[CanvasText]"} />;
            })}
            {coastlines.map((path) => <path key={path} d={path} className="pointer-events-none fill-emerald-200 stroke-emerald-800 stroke-2 dark:fill-emerald-950 dark:stroke-emerald-300 forced-colors:fill-[Canvas] forced-colors:stroke-[CanvasText]" />)}
            <g className="pointer-events-none fill-emerald-950 text-[12px] font-bold paint-order-stroke stroke-white stroke-[3px] dark:fill-emerald-100 dark:stroke-emerald-950"><text x="356" y="390">Great Britain</text><text x="254" y="394">Ireland</text><text x="244" y="58">Iceland</text><text x="555" y="260">Norway</text><text x="290" y="700">Iberia</text></g>
            {forecastAreas.map((area) => <text key={area.name} x={area.label[0]} y={area.label[1]} textAnchor="middle" className="pointer-events-none fill-slate-950 text-[11px] font-semibold paint-order-stroke stroke-white stroke-[3px] dark:fill-white dark:stroke-slate-950">{area.name}</text>)}
            <g data-testid="selected-area-marker" data-area={selected.name} className="pointer-events-none"><circle cx={selected.label[0]} cy={selected.label[1] - 15} r="7" className="fill-red-700 stroke-white stroke-[3px] dark:fill-red-300 dark:stroke-slate-950 forced-colors:fill-[Highlight] forced-colors:stroke-[HighlightText]"/><text x={selected.label[0]} y={selected.label[1] - 27} textAnchor="middle" className="fill-red-950 text-[12px] font-bold paint-order-stroke stroke-white stroke-[4px] dark:fill-red-200 dark:stroke-slate-950">{selected.name}</text></g>
          </svg>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs" aria-label="Map legend"><span><span className="mr-1 inline-block size-3 border border-slate-700 bg-sky-200"/>Forecast area</span><span><span className="mr-1 inline-block size-3 border-[3px] border-slate-950 bg-amber-300"/>Selected area</span><span><span className="mr-1 inline-block size-3 border border-emerald-800 bg-emerald-200"/>Land/coastline</span></div>
        <div
          role="listbox"
          tabIndex={0}
          aria-label="Shipping forecast area chooser"
          aria-describedby={`${idPrefix}-map-instruction`}
          aria-activedescendant={selectedOptionId}
          className="grid min-w-0 grid-cols-1 gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          onKeyDown={(event) => {
            let next: ForecastArea | undefined;
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) next = areaInDirection(selected, event.key as ArrowKey);
            if (event.key === "Home") next = forecastAreas[0];
            if (event.key === "End") next = forecastAreas.at(-1);
            if (next) { event.preventDefault(); select(next); }
          }}
        >
          {forecastAreas.map((area) => {
            const isSelected = selected.name === area.name;
            return <div id={`${idPrefix}-forecast-area-${optionSlug(area.name)}`} key={area.name} role="option" aria-selected={isSelected} onClick={() => select(area)} className={`flex min-h-11 min-w-0 cursor-pointer items-center rounded-md border px-3 py-2 text-left text-sm hover:border-slate-700 hover:bg-accent dark:hover:border-slate-200 forced-colors:border-[CanvasText] ${isSelected ? "border-primary bg-primary/10 font-semibold ring-2 ring-primary ring-offset-1" : ""}`}>{area.name}</div>;
          })}
        </div>
        <p role="status" aria-live="polite" aria-atomic="true"><strong>{selected.name}:</strong> {selected.description}. Adjacent areas: {selected.neighbours.join(", ")}.</p>
        <p className="text-xs text-muted-foreground">Source: <a className="underline" href={SHIPPING_FORECAST_MAP_SOURCE.guide} target="_blank" rel="noreferrer">Met Office Guide to marine forecasts</a> and current <a className="underline" href={SHIPPING_FORECAST_MAP_SOURCE.liveForecast} target="_blank" rel="noreferrer">Shipping Forecast</a>. Project-native SVG trace checked {SHIPPING_FORECAST_MAP_SOURCE.checked}; see map maintenance documentation for tracing limits.</p>
      </CardContent>
    </Card>
  );
};
