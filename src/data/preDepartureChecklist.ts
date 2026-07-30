export interface ChecklistItem { id: string; category: string; label: string; why: string }
export const preDepartureChecklist: readonly ChecklistItem[] = [
  { id: "crew-roles", category: "Crew brief", label: "Brief roles, route and emergency actions", why: "Everyone must know what is expected before workload rises." },
  { id: "crew-ppe", category: "Crew brief", label: "Fit lifejackets and harnesses", why: "Correctly fitted equipment is effective immediately." },
  { id: "lifesaving", category: "Safety equipment", label: "Locate liferaft, flares and grab bag", why: "Emergency equipment must be accessible and in date." },
  { id: "vhf", category: "Communications", label: "Test fixed and handheld VHF", why: "Reliable communications are essential for forecasts and distress." },
  { id: "forecast", category: "Weather", label: "Obtain and record the latest forecast", why: "The go/no-go decision needs current information." },
  { id: "engine", category: "Engine", label: "Check fuel, oil, coolant and raw-water flow", why: "Early checks prevent avoidable propulsion failures." },
  { id: "lights", category: "Navigation lights", label: "Test navigation lights", why: "Working lights are required if visibility deteriorates or night falls." },
  { id: "food", category: "Provisions", label: "Secure sufficient food and drinking water", why: "Allow for delay and keep supplies safely stowed." },
];
