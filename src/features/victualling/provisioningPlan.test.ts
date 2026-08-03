import { describe, expect, it } from "vitest";
import { calculateProvisioningPlan, type ProvisioningInputs } from "./provisioningPlan";

const passage: ProvisioningInputs = {
  crew: 4, passageDays: 3, contingencyDays: 1, drinkingLitresPerPersonDay: 2.5,
  activityClimateMultiplier: 1.2, cookingLitresPerPersonDay: 0.5, hygieneLitresPerPersonDay: 1,
  emergencyReserveLitres: 20, tankCapacityLitres: 100, unusableTankLitres: 5,
  emergencyReserveCapacityLitres: 20,
  fuelPerDay: 0.4, fuelCapacity: 1.2,
};

describe("calculateProvisioningPlan", () => {
  it("keeps units and decimal arithmetic explicit", () => {
    expect(calculateProvisioningPlan(passage)).toEqual({
      plannedDays: 4, drinkingLitres: 48, cookingLitres: 8, hygieneLitres: 16,
      mainTankDemandLitres: 72, totalWaterLitres: 92, usableWaterCapacityLitres: 95, reserveShortfallLitres: 0, waterShortfallLitres: 0,
      fuelRequired: 1.6, fuelShortfall: 0.4,
    });
  });
  it("handles a zero-person, zero-day plan", () => {
    expect(calculateProvisioningPlan({ ...passage, crew: 0, passageDays: 0, contingencyDays: 0, emergencyReserveLitres: 0 })).toMatchObject({ totalWaterLitres: 0, fuelRequired: 0 });
  });
  it("warns when realistic usable capacity is insufficient", () => {
    expect(calculateProvisioningPlan({ ...passage, tankCapacityLitres: 70, unusableTankLitres: 10, emergencyReserveCapacityLitres: 12 })).toMatchObject({ usableWaterCapacityLitres: 60, reserveShortfallLitres: 8, waterShortfallLitres: 20, fuelShortfall: 0.4 });
  });
  it("keeps protected reserve capacity separate from a sufficient main tank", () => {
    expect(calculateProvisioningPlan(passage)).toMatchObject({ mainTankDemandLitres: 72, usableWaterCapacityLitres: 95, reserveShortfallLitres: 0, waterShortfallLitres: 0 });
  });
  it("rejects invalid units and unsafe numeric boundaries", () => {
    expect(() => calculateProvisioningPlan({ ...passage, crew: 1.5 })).toThrow(/whole number/);
    expect(() => calculateProvisioningPlan({ ...passage, fuelPerDay: -1 })).toThrow(/non-negative/);
    expect(() => calculateProvisioningPlan({ ...passage, passageDays: Number.MAX_VALUE, crew: Number.MAX_SAFE_INTEGER })).toThrow(/supported range/);
  });
});
