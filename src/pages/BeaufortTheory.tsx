import { useState } from "react";
import { WeatherTheoryLayout } from "@/components/weather/WeatherTheoryLayout";
import { BeaufortDrill } from "@/components/weather/BeaufortDrill";
import { beaufortScale, forceForWindSpeed } from "@/data/beaufortScale";
import { Input } from "@/components/ui/input";

export default function BeaufortTheory() {
  const [speed, setSpeed] = useState("");
  const lookup = speed === "" ? undefined : forceForWindSpeed(Number(speed));
  return <WeatherTheoryLayout title="Beaufort Scale" subtitle="Estimate wind from what the sea is showing you" topicId="weather-beaufort" sections={[
    { title: "Wind speed → force", body: <><label htmlFor="wind-speed">Wind speed (knots)</label><Input id="wind-speed" inputMode="decimal" type="number" min="0" value={speed} onChange={(event) => setSpeed(event.target.value)} /><p aria-live="polite">{lookup ? `Force ${lookup.force}: ${lookup.description} — ${lookup.seaState}` : "Enter a non-negative wind speed."}</p></> },
    { title: "Force → conditions", body: <p>Select a force in the reference table to read its wind, sea state and wave-height range. Wave height is indicative: fetch, depth and swell change actual conditions.</p> },
  ]}>
    <div className="overflow-x-auto rounded-lg border"><table className="w-full min-w-[720px] text-sm"><caption className="p-3 text-left font-bold">Complete Beaufort reference</caption><thead><tr className="bg-muted"><th className="p-2">Force</th><th>Knots</th><th>Description</th><th>Sea state</th><th>Wave height</th></tr></thead><tbody>{beaufortScale.map((level) => <tr key={level.force} className="border-t"><th className="p-2">{level.force}</th><td>{level.knots}</td><td>{level.description}</td><td className="p-2">{level.seaState}</td><td>{level.waveHeight}</td></tr>)}</tbody></table></div>
    <BeaufortDrill />
  </WeatherTheoryLayout>;
}
