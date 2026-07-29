import { useState } from "react";
import { WeatherTheoryLayout } from "@/components/weather/WeatherTheoryLayout";
import { BeaufortDrill } from "@/components/weather/BeaufortDrill";
import { beaufortScale, conditionsForForce, forceForWindSpeed } from "@/data/beaufortScale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BeaufortTheory() {
  const [speed, setSpeed] = useState("");
  const [selectedForce, setSelectedForce] = useState(0);
  const lookup = speed === "" ? undefined : forceForWindSpeed(Number(speed));
  const selectedConditions = conditionsForForce(selectedForce);
  return <WeatherTheoryLayout title="Beaufort Scale" subtitle="Estimate wind from what the sea is showing you" topicId="weather-beaufort" sections={[
    { title: "Wind speed → force", body: <><label htmlFor="wind-speed">Wind speed (knots)</label><Input id="wind-speed" inputMode="decimal" type="number" min="0" value={speed} onChange={(event) => setSpeed(event.target.value)} /><p aria-live="polite">{lookup ? `Force ${lookup.force}: ${lookup.description} — ${lookup.seaState}` : "Enter a non-negative wind speed."}</p></> },
    { title: "Force → conditions", body: <><div className="grid grid-cols-7 gap-2" role="group" aria-label="Select Beaufort force">{beaufortScale.map(({ force }) => <Button key={force} type="button" size="sm" variant={selectedForce === force ? "default" : "outline"} aria-pressed={selectedForce === force} onClick={() => setSelectedForce(force)}>{force}</Button>)}</div><p aria-live="polite">{selectedConditions && `Force ${selectedConditions.force}: ${selectedConditions.knots} knots, ${selectedConditions.description}. ${selectedConditions.seaState}; waves ${selectedConditions.waveHeight}.`}</p><p className="text-sm text-muted-foreground">Wave height is indicative: fetch, depth and swell change actual conditions.</p></> },
  ]}>
    <div className="overflow-x-auto rounded-lg border"><table className="w-full min-w-[720px] text-sm"><caption className="p-3 text-left font-bold">Complete Beaufort reference</caption><thead><tr className="bg-muted"><th className="p-2">Force</th><th>Knots</th><th>Description</th><th>Sea state</th><th>Wave height</th></tr></thead><tbody>{beaufortScale.map((level) => <tr key={level.force} className="border-t"><th className="p-2">{level.force}</th><td>{level.knots}</td><td>{level.description}</td><td className="p-2">{level.seaState}</td><td>{level.waveHeight}</td></tr>)}</tbody></table></div>
    <BeaufortDrill />
  </WeatherTheoryLayout>;
}
