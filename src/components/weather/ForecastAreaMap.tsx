import { useState } from "react";
import { forecastAreas } from "@/data/forecastAreas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ForecastAreaMap = () => {
  const [selected, setSelected] = useState(forecastAreas[0]);
  return (
    <Card>
      <CardHeader><CardTitle>Shipping forecast areas</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p id="map-instruction">Select an area to locate and identify it.</p>
        <div className="relative min-h-[28rem] rounded-lg bg-sky-100 dark:bg-slate-900 border" aria-describedby="map-instruction">
          {forecastAreas.map((area) => (
            <button key={area.name} type="button" style={{ left: `${area.x}%`, top: `${area.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-background border px-1.5 py-1 text-[10px] focus:ring-2 focus:ring-primary" onClick={() => setSelected(area)} aria-pressed={selected.name === area.name}>{area.name}</button>
          ))}
        </div>
        <p role="status"><strong>{selected.name}:</strong> {selected.description}</p>
      </CardContent>
    </Card>
  );
};
