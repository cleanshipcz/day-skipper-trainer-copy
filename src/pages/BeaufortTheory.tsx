import { useState } from "react";
import { WeatherTheoryLayout } from "@/components/weather/WeatherTheoryLayout";
import { BeaufortDrill } from "@/components/weather/BeaufortDrill";
import { BEAUFORT_SCALE_SOURCE, beaufortScale, conditionsForForce, forceForWindSpeed, normalizeWindSpeed } from "@/data/beaufortScale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BeaufortSeaStateVisual } from "@/components/weather/BeaufortSeaStateVisual";

export default function BeaufortTheory() {
  const [speed, setSpeed] = useState("");
  const [selectedForce, setSelectedForce] = useState(0);
  const enteredSpeed = speed === "" ? undefined : Number(speed);
  const normalizedSpeed = enteredSpeed === undefined ? undefined : normalizeWindSpeed(enteredSpeed);
  const lookup = enteredSpeed === undefined ? undefined : forceForWindSpeed(enteredSpeed);
  const roundingNotice = enteredSpeed !== undefined && normalizedSpeed !== undefined && enteredSpeed !== normalizedSpeed
    ? ` Rounded ${enteredSpeed} to ${normalizedSpeed} knots before lookup.`
    : "";
  const selectedConditions = conditionsForForce(selectedForce);
  return <WeatherTheoryLayout title="Beaufort Scale" subtitle="Estimate wind from what the sea is showing you" topicId="weather-beaufort" sections={[
    { title: "Wind speed → force", body: <><label htmlFor="wind-speed">Wind speed (knots)</label><Input id="wind-speed" aria-describedby="wind-speed-policy" inputMode="decimal" type="number" min="0" step="0.1" value={speed} onChange={(event) => setSpeed(event.target.value)} /><p id="wind-speed-policy" className="text-sm text-muted-foreground">The Met Office limits are stated in whole knots. Decimal readings are rounded to the nearest whole knot before lookup; half a knot rounds up.</p><p aria-live="polite">{lookup ? `Force ${lookup.force}: ${lookup.description} — ${lookup.seaState}.${roundingNotice}` : "Enter a finite, non-negative wind speed."}</p></> },
    { title: "Force → conditions", body: <><div className="grid grid-cols-7 gap-2" role="group" aria-label="Select Beaufort force">{beaufortScale.map(({ force }) => <Button key={force} type="button" size="sm" variant={selectedForce === force ? "default" : "outline"} aria-pressed={selectedForce === force} onClick={() => setSelectedForce(force)}>{force}</Button>)}</div><p aria-live="polite">{selectedConditions && `Force ${selectedConditions.force}: ${selectedConditions.knots} knots, ${selectedConditions.description}. Sea state: ${selectedConditions.seaState}. Probable wave height: ${selectedConditions.probableWaveHeight ?? "not specified"}; probable maximum: ${selectedConditions.probableMaximumWaveHeight ?? "not specified"}.`}</p><p className="text-sm text-muted-foreground">These heights describe well-developed wind waves in the open sea, not guaranteed conditions. Limited fetch or wind duration may prevent waves building; water depth can alter or steepen them, and swell can add waves from weather elsewhere. The sea also lags behind a rising wind.</p><p className="text-sm text-muted-foreground"><strong>Force 12 means “Hurricane force” wind on this marine scale.</strong> It does not by itself classify a tropical cyclone as a hurricane; that classification also depends on the storm system and sustained-wind criteria.</p></> },
  ]}>
    <section className="space-y-4" aria-labelledby="sea-state-visual-guide">
      <div><h2 id="sea-state-visual-guide" className="text-xl font-bold">Sea-state visual guide</h2><p className="text-sm text-muted-foreground">Compare wave scale, breaking crests, foam and spray—not height alone. Fetch, duration, depth and swell can produce a different-looking sea at the same wind force.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {beaufortScale.map((level) => <article key={level.force} className="min-w-0 space-y-2 rounded-lg border p-3"><h3 className="font-semibold">Force {level.force} — {level.description}</h3><BeaufortSeaStateVisual level={level}/><p className="text-sm"><strong>{level.seaState}</strong> · probable waves {level.probableWaveHeight ?? "not specified"} · probable maximum {level.probableMaximumWaveHeight ?? "not specified"}</p></article>)}
      </div>
      <p className="text-xs text-muted-foreground"><strong>Artwork provenance:</strong> Original project SVG artwork generated from the Met Office Beaufort data; no third-party image or chart artwork is reproduced.</p>
    </section>
    <div className="overflow-x-auto rounded-lg border"><table className="w-full min-w-[820px] text-sm"><caption className="p-3 text-left font-bold">Complete Beaufort reference</caption><thead><tr className="bg-muted"><th scope="col" className="p-2">Force</th><th scope="col">Knots</th><th scope="col">Wind term</th><th scope="col">Sea description</th><th scope="col">Probable wave height</th><th scope="col">Probable maximum</th></tr></thead><tbody>{beaufortScale.map((level) => <tr key={level.force} className="border-t"><th scope="row" className="p-2">{level.force}</th><td>{level.knots}</td><td>{level.description}</td><td className="p-2">{level.seaState}</td><td>{level.probableWaveHeight ?? "Not specified"}</td><td>{level.probableMaximumWaveHeight ?? "Not specified"}</td></tr>)}</tbody></table></div>
    <p className="text-sm text-muted-foreground">Source: <a className="underline" href={BEAUFORT_SCALE_SOURCE.url} target="_blank" rel="noreferrer">{BEAUFORT_SCALE_SOURCE.name}</a>. At Force 9, the official scale term is “Strong gale”; the Met Office uses “Severe gale” in its forecasts, which is the term shown here.</p>
    <BeaufortDrill />
  </WeatherTheoryLayout>;
}
