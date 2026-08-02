import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calculateProvisioningPlan, type ProvisioningInputs } from "@/features/victualling/provisioningPlan";

const initial: ProvisioningInputs = {
  crew: 4, passageDays: 3, contingencyDays: 1, drinkingLitresPerPersonDay: 2.5,
  activityClimateMultiplier: 1.2, cookingLitresPerPersonDay: 0.5, hygieneLitresPerPersonDay: 1,
  emergencyReserveLitres: 20, tankCapacityLitres: 100, unusableTankLitres: 5,
  fuelPerDay: 0.4, fuelCapacity: 1.2,
};

const fields: readonly [keyof ProvisioningInputs, string, string][] = [
  ["crew", "Crew", "people"], ["passageDays", "Passage duration", "days"],
  ["contingencyDays", "Justified contingency", "days"], ["drinkingLitresPerPersonDay", "Drinking rate", "L/person/day"],
  ["activityClimateMultiplier", "Activity/climate factor", "× rate"], ["cookingLitresPerPersonDay", "Cooking water", "L/person/day"],
  ["hygieneLitresPerPersonDay", "Hygiene water", "L/person/day"], ["emergencyReserveLitres", "Separate emergency reserve", "L"],
  ["tankCapacityLitres", "Installed water capacity", "L"], ["unusableTankLitres", "Unusable water volume", "L"],
  ["fuelPerDay", "Measured cooking-fuel use", "fuel units/day"], ["fuelCapacity", "Usable cooking-fuel capacity", "same fuel units"],
];

export const ProvisioningPlanner = () => {
  const [inputs, setInputs] = useState(initial);
  const result = useMemo(() => {
    try { return { plan: calculateProvisioningPlan(inputs), error: "" }; }
    catch (error) { return { plan: null, error: error instanceof Error ? error.message : "Invalid plan" }; }
  }, [inputs]);

  return <Card className="mb-6 border-2 border-primary/20">
    <CardHeader><CardTitle>Passage-specific calculator</CardTitle></CardHeader>
    <CardContent className="space-y-5">
      <p className="text-sm text-muted-foreground">These values are editable planning assumptions, not universal minima. Record why your contingency and rates fit the route, forecast, workload, climate, crew and diversion/resupply options. Follow vessel/operator instructions and applicable local guidance.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{fields.map(([key, label, unit]) => <label key={key} className="space-y-1 text-sm font-medium" htmlFor={`plan-${key}`}>
        <span>{label} <span className="font-normal text-muted-foreground">({unit})</span></span>
        <Input id={`plan-${key}`} type="number" min="0" step={key === "crew" ? "1" : "0.1"} value={inputs[key]} onChange={(event) => setInputs((value) => ({ ...value, [key]: event.target.value === "" ? 0 : Number(event.target.value) }))} />
      </label>)}</div>
      <div aria-live="polite">{result.error ? <p role="alert" className="text-sm text-destructive">{result.error}</p> : result.plan && <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
        <p><strong>Water arithmetic:</strong> drinking {result.plan.drinkingLitres} L + cooking {result.plan.cookingLitres} L + hygiene {result.plan.hygieneLitres} L + reserve {inputs.emergencyReserveLitres} L = <strong>{result.plan.totalWaterLitres} L</strong>.</p>
        <p>Usable capacity: {inputs.tankCapacityLitres} L installed − {inputs.unusableTankLitres} L unusable = <strong>{result.plan.usableWaterCapacityLitres} L</strong>.</p>
        <p><strong>Fuel check:</strong> {result.plan.plannedDays} days × {inputs.fuelPerDay} fuel units/day = {result.plan.fuelRequired} units; usable capacity {inputs.fuelCapacity} units.</p>
        {result.plan.waterShortfallLitres > 0 && <p role="alert" className="font-semibold text-destructive">Water capacity shortfall: {result.plan.waterShortfallLitres} L. Revise the plan; do not assume inaccessible tank volume is available.</p>}
        {result.plan.fuelShortfall > 0 && <p role="alert" className="font-semibold text-destructive">Cooking-fuel shortfall: {result.plan.fuelShortfall} units. Revise fuel, menus, or a safely approved alternative-cooking plan.</p>}
      </div>}</div>
      <div className="text-sm"><h3 className="font-semibold">Worked example (editable above)</h3><p>Four crew, 3 passage days + 1 justified delay day. Drinking: 4 × 4 × 2.5 L × 1.2 = 48 L; cooking: 4 × 4 × 0.5 L = 8 L; hygiene: 4 × 4 × 1 L = 16 L; reserve 20 L. Total 92 L versus 95 L usable. Fuel: 4 × 0.4 = 1.6 units versus 1.2 usable: short by 0.4 units.</p></div>
    </CardContent>
  </Card>;
};
