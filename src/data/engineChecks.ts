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
    task: "Inspect oil, coolant and bilge",
    description: "With the engine stopped, cool and safely isolated, use the vessel manual's method and limits. Check levels, hoses, mounts, wiring and the bilge for drips, staining, chafe or loose parts; never remove a hot or pressurised cooling-system cap.",
    frequency: "Before start / manual interval",
    checked: false,
  },
  {
    id: "coolant",
    task: "Confirm cooling-water route",
    description: "Identify whether the installation is raw-water, closed-circuit, outboard or another arrangement. Set seacocks/valves exactly as the vessel manual requires and inspect strainers only when it is safe to do so.",
    frequency: "Before every start",
    checked: false,
  },
  {
    id: "fuel",
    task: "Check fuel quantity, quality and system",
    description: "Allow passage fuel plus the skipper's reserve. Inspect tank, filter/water separator, lines, vents and connections for water, damage, staining, wetness or odour—smell alone cannot prove there is no leak. Set fuel valves per the manual.",
    frequency: "Before every start",
    checked: false,
  },
  {
    id: "seacock",
    task: "Make the start area safe",
    description: "Account for people, loose lines and tools; confirm the propeller and water intake are clear, controls are in neutral and nobody is in the water. Ventilate enclosed spaces. Run a bilge blower only where the petrol/gasoline installation or vessel instructions require it, then inspect for vapour or leaks.",
    frequency: "Before every start",
    checked: false,
  },
  {
    id: "belt",
    task: "Inspect belts and guards",
    description: "With starting energy isolated, inspect belt condition, alignment and guards. Use only the manufacturer's tension/deflection criterion—there is no universal millimetre value—and refit guards before starting.",
    frequency: "Manual interval / after adjustment",
    checked: false,
  },
  {
    id: "impeller",
    task: "Inspect service items",
    description: "At the engine manual's interval, a competent person should inspect or renew the raw-water impeller (if fitted), filters, anodes and fluids. Recover every missing impeller fragment and carry vessel-specific spares, tools and consumables.",
    frequency: "Manufacturer interval",
    checked: false,
  },
  {
    id: "filters",
    task: "Test batteries and electrical safety",
    description: "Check batteries are restrained and terminals protected, dry and tight; inspect cables and charging equipment. Ventilate as specified, keep sparks/flames away and isolate before working. Do not bridge, disconnect or switch circuits contrary to the vessel manual.",
    frequency: "Before passage / manual interval",
    checked: false,
  },
  {
    id: "anodes",
    task: "Prepare pollution and fire controls",
    description: "Know fuel shut-offs, battery isolation, extinguishing controls and alarms. Keep absorbent spill materials ready; stop the source, contain the spill, protect drains/bilge and report or dispose of waste under local rules—never pump oily fuel overboard.",
    frequency: "Before fuelling / before passage",
    checked: false,
  },
  {
    id: "exhaust",
    task: "Verify immediately after start",
    description: "From a safe position confirm expected oil-pressure/charge indications, alarms clear, cooling-water or tell-tale/exhaust flow appears as specified, and there is no abnormal noise, smoke, vibration, leak or exhaust ingress. Stop and investigate if the expected response is absent.",
    frequency: "After every start",
    checked: false,
  },
  {
    id: "battery",
    task: "Monitor, shut down and record",
    description: "Underway, scan gauges, alarms, exhaust, bilge, charging and fuel use. Shut down using the manual's cool-down/stop sequence, complete post-run leak and level checks when safe, record hours/defects/service, and do not restart an unexplained alarm or fault until assessed.",
    frequency: "Underway / after every run",
    checked: false,
  },
];
