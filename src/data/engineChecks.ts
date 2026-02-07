export interface MaintenanceCheck {
  id: string;
  task: string;
  description: string;
  frequency: string;
  checked: boolean;
}

export const maintenanceChecks: MaintenanceCheck[] = [
  {
    id: "oil",
    task: "Check Engine Oil Level",
    description: "Check dipstick when engine is cold. Top up if needed with correct grade oil.",
    frequency: "Before every start",
    checked: false,
  },
  {
    id: "coolant",
    task: "Check Coolant Level",
    description: "Inspect header tank. Top up with correct coolant mixture if needed.",
    frequency: "Before every start",
    checked: false,
  },
  {
    id: "fuel",
    task: "Check Fuel Level & Lines",
    description: "Verify sufficient fuel. Check lines for leaks. Ensure fuel shut-off valve is open.",
    frequency: "Before every start",
    checked: false,
  },
  {
    id: "seacock",
    task: "Open Sea Cock",
    description: "Ensure cooling water intake sea cock is fully open before starting.",
    frequency: "Before every start",
    checked: false,
  },
  {
    id: "belt",
    task: "Check Drive Belt Tension",
    description: "Belt should deflect 10-15mm under moderate pressure. Check for wear/cracks.",
    frequency: "Weekly",
    checked: false,
  },
  {
    id: "impeller",
    task: "Inspect Raw Water Impeller",
    description: "Check for damaged or missing blades. Replace if worn. Keep spare onboard.",
    frequency: "Monthly / Season start",
    checked: false,
  },
  {
    id: "filters",
    task: "Check Fuel & Oil Filters",
    description: "Inspect for contamination. Replace as per manufacturer schedule.",
    frequency: "Annually",
    checked: false,
  },
  {
    id: "anodes",
    task: "Inspect Sacrificial Anodes",
    description: "Replace when 50% consumed. Prevents corrosion of engine parts.",
    frequency: "Annually",
    checked: false,
  },
  {
    id: "exhaust",
    task: "Check Exhaust System",
    description: "Look for leaks, corrosion, blockages. Verify exhaust water flow.",
    frequency: "Monthly",
    checked: false,
  },
  {
    id: "battery",
    task: "Check Battery Connections",
    description: "Clean terminals. Check charge level. Ensure secure connections.",
    frequency: "Monthly",
    checked: false,
  },
];
