import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calculateProvisioningPlan, type ProvisioningInputs } from "@/features/victualling/provisioningPlan";

const initial: ProvisioningInputs = {
  crew: 4, passageDays: 3, contingencyDays: 1, drinkingLitresPerPersonDay: 2.5,
  activityClimateMultiplier: 1.2, cookingLitresPerPersonDay: 0.5, hygieneLitresPerPersonDay: 1,
  emergencyReserveLitres: 20, tankCapacityLitres: 100, unusableTankLitres: 5,
  emergencyReserveCapacityLitres: 20,
  fuelPerDay: 0.4, fuelCapacity: 1.2,
};

const fields: readonly [keyof ProvisioningInputs, string, string][] = [
  ["crew", "Crew", "people"], ["passageDays", "Passage duration", "days"],
  ["contingencyDays", "Justified contingency", "days"], ["drinkingLitresPerPersonDay", "Drinking rate", "L/person/day"],
  ["activityClimateMultiplier", "Activity/climate factor", "× rate"], ["cookingLitresPerPersonDay", "Cooking water", "L/person/day"],
  ["hygieneLitresPerPersonDay", "Hygiene water", "L/person/day"], ["emergencyReserveLitres", "Protected emergency reserve required", "L"],
  ["emergencyReserveCapacityLitres", "Verified protected-container capacity", "L"],
  ["tankCapacityLitres", "Installed water capacity", "L"], ["unusableTankLitres", "Unusable water volume", "L"],
  ["fuelPerDay", "Measured LPG consumption", "kg LPG/day"], ["fuelCapacity", "Usable compatible LPG capacity", "kg LPG"],
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
        <p><strong>Water arithmetic:</strong> drinking {result.plan.drinkingLitres} L + cooking {result.plan.cookingLitres} L + hygiene {result.plan.hygieneLitres} L = <strong>{result.plan.mainTankDemandLitres} L main-tank demand</strong>; plus {inputs.emergencyReserveLitres} L protected reserve = {result.plan.totalWaterLitres} L carried.</p>
        <p>Main-tank usable capacity: {inputs.tankCapacityLitres} L installed − {inputs.unusableTankLitres} L unusable = <strong>{result.plan.usableWaterCapacityLitres} L</strong>. Protected reserve capacity: <strong>{inputs.emergencyReserveCapacityLitres} L</strong>.</p>
        <p><strong>LPG fuel check:</strong> {result.plan.plannedDays} days × {inputs.fuelPerDay} kg LPG/day = {result.plan.fuelRequired} kg LPG; usable capacity {inputs.fuelCapacity} kg LPG. Use measured consumption and compatible, approved LPG cylinders only; do not mix mass and volume units or fuel types.</p>
        {result.plan.waterShortfallLitres > 0 && <p role="alert" className="font-semibold text-destructive">Water capacity shortfall: {result.plan.waterShortfallLitres} L. Revise the plan; do not assume inaccessible tank volume is available.</p>}
        {result.plan.reserveShortfallLitres > 0 && <p role="alert" className="font-semibold text-destructive">Protected reserve container shortfall: {result.plan.reserveShortfallLitres} L.</p>}
        {result.plan.fuelShortfall > 0 && <p role="alert" className="font-semibold text-destructive">Cooking-fuel shortfall: {result.plan.fuelShortfall} kg LPG. Revise compatible LPG capacity, menus, or a safely approved alternative-cooking plan.</p>}
      </div>}</div>
      <div className="text-sm"><h3 className="font-semibold">Worked example (editable above)</h3><p>Four crew, 3 passage days + 1 justified delay day. Drinking: 4 × 4 × 2.5 L × 1.2 = 48 L; cooking: 4 × 4 × 0.5 L = 8 L; hygiene: 4 × 4 × 1 L = 16 L. Main demand 72 L versus 95 L usable tank capacity; a separate protected container carries the 20 L reserve. LPG: 4 × 0.4 kg/day = 1.6 kg versus 1.2 kg usable compatible LPG: short by 0.4 kg.</p></div>
    </CardContent>
  </Card>;
};
