export interface ProvisioningInputs {
  crew: number;
  passageDays: number;
  contingencyDays: number;
  drinkingLitresPerPersonDay: number;
  activityClimateMultiplier: number;
  cookingLitresPerPersonDay: number;
  hygieneLitresPerPersonDay: number;
  emergencyReserveLitres: number;
  emergencyReserveCapacityLitres: number;
  tankCapacityLitres: number;
  unusableTankLitres: number;
  fuelPerDay: number;
  fuelCapacity: number;
}

export interface ProvisioningPlan {
  plannedDays: number;
  drinkingLitres: number;
  cookingLitres: number;
  hygieneLitres: number;
  mainTankDemandLitres: number;
  totalWaterLitres: number;
  usableWaterCapacityLitres: number;
  reserveShortfallLitres: number;
  waterShortfallLitres: number;
  fuelRequired: number;
  fuelShortfall: number;
}

const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** Pure calculation only: rates and margins are passage-specific planning inputs. */
export const calculateProvisioningPlan = (input: ProvisioningInputs): ProvisioningPlan => {
  for (const [name, value] of Object.entries(input)) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be a finite non-negative number`);
  }
  if (!Number.isInteger(input.crew)) throw new RangeError("crew must be a whole number");
  if (input.activityClimateMultiplier === 0 && input.crew > 0 && input.passageDays + input.contingencyDays > 0) {
    throw new RangeError("activityClimateMultiplier must be greater than zero for a passage");
  }

  const plannedDays = input.passageDays + input.contingencyDays;
  const drinkingLitres = input.crew * plannedDays * input.drinkingLitresPerPersonDay * input.activityClimateMultiplier;
  const cookingLitres = input.crew * plannedDays * input.cookingLitresPerPersonDay;
  const hygieneLitres = input.crew * plannedDays * input.hygieneLitresPerPersonDay;
  const mainTankDemandLitres = drinkingLitres + cookingLitres + hygieneLitres;
  const totalWaterLitres = mainTankDemandLitres + input.emergencyReserveLitres;
  const usableWaterCapacityLitres = Math.max(0, input.tankCapacityLitres - input.unusableTankLitres);
  const fuelRequired = plannedDays * input.fuelPerDay;
  const values = { plannedDays, drinkingLitres, cookingLitres, hygieneLitres, mainTankDemandLitres, totalWaterLitres, usableWaterCapacityLitres, fuelRequired };
  if (Object.values(values).some((value) => !Number.isFinite(value))) throw new RangeError("calculated requirement exceeds supported range");

  return {
    ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, round(value)])) as typeof values,
    reserveShortfallLitres: round(Math.max(0, input.emergencyReserveLitres - input.emergencyReserveCapacityLitres)),
    waterShortfallLitres: round(Math.max(0, mainTankDemandLitres - usableWaterCapacityLitres) + Math.max(0, input.emergencyReserveLitres - input.emergencyReserveCapacityLitres)),
    fuelShortfall: round(Math.max(0, fuelRequired - input.fuelCapacity)),
  };
};
