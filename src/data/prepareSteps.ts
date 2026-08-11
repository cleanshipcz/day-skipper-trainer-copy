export interface PrepareStep {
  id: "passage-appraisal" | "regulations-and-responsibilities" | "equipment-and-information" | "detailed-passage-plan" | "alternatives-and-contingencies" | "revise-and-brief" | "execute-and-monitor";
  letter: string;
  title: string;
  phases: readonly ("Appraisal" | "Detailed planning" | "Execution" | "Monitoring")[];
  /** Human-readable label for single or combined stages. */
  phase: string;
  description: string;
  considerations: readonly string[];
  example: string;
}

export interface PrepareSupportingRoute {
  label: string;
  route: string;
  explanation: string;
}

export const PREPARE_EXERCISE_REVISION = "prepare-applied-v1";

export type PrepareDecision = "go" | "delay" | "divert" | "abort";
export interface PrepareScenario {
  id: string; title: string; situation: string; visualSummary: string;
  stepPrompts: readonly string[]; answers: readonly string[];
  alternatives: readonly string[]; remediation: readonly string[];
  decision: PrepareDecision; decisionReason: string;
}

/** Fictional training situations: figures must never be used for navigation. */
export const prepareScenarios: readonly PrepareScenario[] = [
  {
    id: "bar-arrival", title: "Sheltered harbour with a tidal bar",
    situation: "A 9 m yacht plans a 24 NM daylight passage. The arrival bar window closes at 16:20. The latest forecast is F6 against the ebb, above the crew's agreed F5 limit; a sheltered harbour is available before the headland.",
    visualSummary: "Route flow: departure berth → open-water leg → headland decision point → tidal bar. A sheltered diversion branches before the headland. Hazard labels, not colour, identify the bar and wind-against-tide area.",
    stepPrompts: ["Passage appraisal", "Regulations and responsibilities", "Equipment and information", "Detailed passage plan", "Alternatives and contingencies", "Revise and brief", "Execute and monitor"],
    answers: ["Check crew limits, forecast, tide and berth-to-berth feasibility", "Check current harbour directions, charts and Notices to Mariners", "Confirm updated navigation data, VHF, steering, fuel and safety equipment", "Plot safe legs, tidal window, clearing limits and decision points", "Name the sheltered diversion and triggers before the headland", "Brief the changed forecast and compare it with the agreed F5 limit", "Monitor position, depth, ETA and conditions at risk-based intervals"],
    alternatives: ["Use the forecast printed yesterday because departure is close", "Rely on the chartplotter route and marina booking confirmation", "Treat a full fuel gauge as the complete equipment appraisal", "Plot the shortest track and decide margins at the bar", "Keep the diversion informal so the crew can adapt later", "Depart before the wind builds and brief once in open water", "Check position hourly regardless of hazards or uncertainty"],
    remediation: ["Reappraise from current inputs and the recorded crew and vessel limits.", "Separate current legal/local requirements from convenience or bookings.", "Verify serviceability, currency and usable quantities rather than one indicator.", "A usable plan needs explicit safe-water limits and decision points before execution.", "A contingency must have a named route and trigger before workload rises.", "A material limit exceedance must be resolved and briefed before departure.", "Monitoring frequency follows risk, uncertainty, hazards and decision points."],
    decision: "delay", decisionReason: "Delay. The latest forecast exceeds the agreed limit before departure; waiting preserves the bar and crew safety margins. Reappraise from current information before any later departure."
  },
  {
    id: "visibility-loss", title: "Visibility deteriorates near the decision point",
    situation: "During a coastal passage visibility falls below the plan's 2 NM limit before the headland. The destination approach is exposed, while the pre-planned all-weather refuge remains safely accessible from the vessel's current position.",
    visualSummary: "Decision flow: present safe water → headland commitment point → exposed destination. The all-weather refuge branches before commitment. Text identifies reduced visibility and each route outcome.",
    stepPrompts: ["Passage appraisal", "Regulations and responsibilities", "Equipment and information", "Detailed passage plan", "Alternatives and contingencies", "Revise and brief", "Execute and monitor"],
    answers: ["Reassess crew, visibility, traffic, tide and destination exposure", "Apply restricted-visibility duties and current local directions", "Ready radar/AIS where fitted, sound signals, lights, VHF and independent fixing", "Compare position and ETA with limits and the headland decision point", "Confirm the refuge remains viable and set the diversion track", "Brief crew, record the change and allocate lookout/navigation roles", "Increase monitoring, navigate at safe speed and verify the diversion"],
    alternatives: ["Keep the departure appraisal because the passage is already under way", "Treat the encounter as ordinary clear-visibility navigation until another vessel appears", "Use AIS alone so the crew can focus on the destination approach", "Continue to the headland and compare limits after commitment", "Assume the refuge is available because it was checked before departure", "Change course quietly to avoid distracting the lookout", "Maintain the original fix interval because frequent changes create confusion"],
    remediation: ["Appraisal continues when a core assumption changes during execution.", "Reduced visibility changes applicable duties before a contact is sighted.", "No single aid replaces lookout, sound signals and independent position evidence.", "Apply recorded limits while a safe decision remains available.", "Revalidate the alternative from current position, conditions and access constraints.", "Material changes need an explicit record, briefing and workable role allocation.", "Deteriorating visibility calls for safe speed and increased, verified monitoring."],
    decision: "divert", decisionReason: "Divert to the pre-planned refuge before the headland. Visibility is below the recorded limit and the refuge remains viable; continuing would knowingly discard the plan's safety margin."
  }
];

/** Curated learning and planning tools for each PREPARE action. */
export const prepareSupportingRoutes: Readonly<Record<string, readonly PrepareSupportingRoute[]>> = {
  "Passage appraisal": [
    { label: "Marine Forecasts", route: "/weather/forecasts", explanation: "Acquire and interpret forecast products covering the route and passage window." },
    { label: "Tides", route: "/navigation/tides", explanation: "Appraise tidal heights, streams, gates and wind-against-tide risk." },
    { label: "Navigation", route: "/navigation", explanation: "Review chart, compass and position-fixing knowledge needed for the route." },
    { label: "Pilotage", route: "/pilotage", explanation: "Appraise departure, arrival and confined-water sections berth to berth." },
    { label: "Personal Safety", route: "/safety/personal", explanation: "Match crew capability, clothing and personal equipment to the conditions." },
  ],
  "Regulations and responsibilities": [
    { label: "COLREGs", route: "/rules/colregs", explanation: "Refresh the steering and sailing rules that constrain execution of the route." },
    { label: "Lights and Signals", route: "/rules/lights", explanation: "Recognise vessels, obligations and signals expected during the passage." },
    { label: "Pilotage", route: "/pilotage", explanation: "Connect local directions, buoyage and harbour procedures to each pilotage section." },
  ],
  "Equipment and information": [
    { label: "Engine", route: "/engine", explanation: "Check propulsion, fuel, cooling, alarms, spares and operating limits." },
    { label: "Rig", route: "/rig", explanation: "Check standing and running rigging, sails and deck equipment." },
    { label: "Safety Equipment", route: "/safety", explanation: "Review accessible, serviceable personal and emergency equipment." },
    { label: "Victualling", route: "/victualling", explanation: "Plan water, food, stowage and reserves for the crew and contingencies." },
  ],
  "Detailed passage plan": [
    { label: "Passage Calculator", route: "/passage-planning/calculator", explanation: "Calculate duration, ETA, fuel requirement and reserve from explicit assumptions." },
    { label: "Tidal Heights Calculator", route: "/navigation/tides/heights-calc", explanation: "Calculate tidal height for a specified place and time, then apply vessel margins." },
    { label: "Tidal Vector Tool", route: "/navigation/tides/vector-tool", explanation: "Practise course-to-steer and speed-made-good vectors for a planned leg." },
    { label: "Pilotage Plan", route: "/pilotage/plan", explanation: "Turn departure or arrival details into a usable cockpit pilotage plan." },
    { label: "Plan Builder", route: "/passage-planning/builder", explanation: "Apply the appraisal to waypoints, legs, gates, limits and contingencies." },
  ],
  "Alternatives and contingencies": [
    { label: "Plan Builder", route: "/passage-planning/builder", explanation: "Record alternatives, decision points and weather or tidal windows." },
    { label: "Safety", route: "/safety", explanation: "Prepare realistic responses for person overboard, fire and other emergencies." },
    { label: "Engine", route: "/engine", explanation: "Plan safe actions for propulsion, fuel, cooling or electrical failure." },
  ],
  "Revise and brief": [
    { label: "Marine Forecasts", route: "/weather/forecasts", explanation: "Recheck the latest valid forecast and warnings against agreed limits." },
    { label: "Pre-departure Checklist", route: "/passage-planning/checklist", explanation: "Run final vessel, crew, weather, navigation and briefing checks." },
    { label: "Plan Builder", route: "/passage-planning/builder", explanation: "Revise the applied plan when an input, limit or departure decision changes." },
  ],
  "Execute and monitor": [
    { label: "Position Fixing", route: "/navigation/position", explanation: "Choose independent fixes and monitoring frequency appropriate to the risk." },
    { label: "Pilotage", route: "/pilotage", explanation: "Apply clearing limits, transits and buoyage in confined navigation." },
    { label: "COLREGs", route: "/rules/colregs", explanation: "Keep collision avoidance active while monitoring and adjusting the plan." },
  ],
};

/** PREPARE is a cockpit memory aid; the four IMO planning stages remain the framework. */
export const prepareSteps: readonly PrepareStep[] = [
  {
    id: "passage-appraisal", letter: "P", title: "Passage appraisal", phases: ["Appraisal"], phase: "Appraisal",
    description: "Define the berth-to-berth objective, gather current information, and decide whether vessel, skipper and crew can safely make the passage.",
    considerations: [
      "People: competence, watchkeeping, fatigue, seasickness, accessibility and personal limits.",
      "Route and pilotage: departure and arrival berths, hazards, safe water, traffic, daylight and likely duration.",
      "Environment: forecasts, visibility, sea state, tidal heights and streams, and weather-dependent margins.",
      "Vessel: draught, air draught, manoeuvring, speed, range, stability, defects and operating limits.",
    ],
    example: "Reject a nominally shorter exposed route when the crew and forecast favour the sheltered alternative.",
  },
  {
    id: "regulations-and-responsibilities", letter: "R", title: "Regulations and responsibilities", phases: ["Appraisal"], phase: "Appraisal",
    description: "Identify the law, directions and reporting rules that apply; do not treat a mnemonic or training page as legal advice.",
    considerations: [
      "COLREGs, local harbour byelaws/directions, traffic separation schemes, restricted areas and reporting requirements.",
      "UK legal baseline: SOLAS V is implemented in UK law and applies passage-planning duties to pleasure vessels, with proportionate exemptions and expectations described by the MCA.",
      "Official guidance: MCA MGN 610 (M+F) Amendment 1 explains voyage-planning expectations; guidance is not itself a replacement for the underlying law.",
      "Good practice: RYA methods, written pilotage notes, generous margins and checklists support judgement but are not legislation.",
    ],
    example: "Check current harbour directions and Notices to Mariners, then record which requirements affect the plan.",
  },
  {
    id: "equipment-and-information", letter: "E", title: "Equipment and information", phases: ["Appraisal"], phase: "Appraisal",
    description: "Confirm that navigation information, safety equipment, communications and consumables are suitable, serviceable and accessible.",
    considerations: [
      "Largest-scale suitable official charts or an appropriate updated electronic system, plus an independent fallback and known datum/settings.",
      "VHF/DSC, charged handheld, navigation lights, sound signals, lifejackets, harnesses, liferaft or tender as appropriate, first aid and firefighting equipment.",
      "Engine, steering, anchors, bilge pumps, batteries, fuel (including reserve), water, food, clothing, tools and spares.",
      "Validate sources: note edition/date, apply corrections and Notices to Mariners, check chart/ECDIS updates, forecasts, warnings and local information again close to departure.",
    ],
    example: "Update the chart, test fixed and handheld VHF, and calculate usable fuel rather than trusting the gauge alone.",
  },
  {
    id: "detailed-passage-plan", letter: "P", title: "Detailed passage plan", phases: ["Detailed planning"], phase: "Detailed planning",
    description: "Convert the appraisal into a berth-to-berth plan detailed enough to execute and monitor, including pilotage at both ends.",
    considerations: [
      "Plot safe legs, courses, distances, clearing bearings, no-go areas, wheel-over points and position-fixing methods.",
      "Calculate tidal heights/streams, course to steer, speed made good, ETAs, tidal gates, under-keel and overhead clearance with explicit safety margins.",
      "Plan departure and arrival pilotage, traffic interactions, communications, watch system and log intervals.",
      "Mark limits, decision points, abort points and who must be told before a change.",
    ],
    example: "Prepare a cockpit plan card with leg data, clearing limits, fix frequency, tide window and berth approach.",
  },
  {
    id: "alternatives-and-contingencies", letter: "A", title: "Alternatives and contingencies", phases: ["Detailed planning"], phase: "Detailed planning",
    description: "Plan realistic responses before workload rises or conditions deteriorate.",
    considerations: [
      "Ports and anchorages of refuge: access limits, tide, weather, facilities and approach hazards.",
      "Abort/divert triggers for wind, visibility, sea state, lateness, fatigue, illness, fuel, steering, engine or navigation failure.",
      "Man overboard, fire, flooding, communications failure and emergency assistance procedures.",
      "Preserve safe margins: an alternative that depends on the same failed assumption is not a contingency.",
    ],
    example: "Set a latest turn-back time and a sheltered diversion before committing past the final safe decision point.",
  },
  {
    id: "revise-and-brief", letter: "R", title: "Revise and brief", phases: ["Detailed planning", "Execution"], phase: "Detailed planning + Execution",
    description: "Finalize detailed planning immediately before departure, update it with observed conditions, and brief everyone as the passage transitions into execution; delay or cancel when limits are exceeded.",
    considerations: [
      "Recheck forecast, warnings, tides, visibility, berth/harbour status, defects, fuel and crew fitness.",
      "Brief route, hazards, roles, watches, lifejackets/tethers, communications, emergency actions, abort triggers and alternatives.",
      "Record material changes and ensure chart, plotter, pilotage notes and crew share the same plan.",
    ],
    example: "Move departure or choose the sheltered route when the latest wind forecast exceeds the agreed limit.",
  },
  {
    id: "execute-and-monitor", letter: "E", title: "Execute and monitor", phases: ["Execution", "Monitoring"], phase: "Execution + Monitoring",
    description: "Execute the agreed plan while continuously checking position, progress, conditions and assumptions; change the plan deliberately when required.",
    considerations: [
      "Set a risk-based monitoring frequency from vessel speed, position uncertainty, the fixing method available, proximity to hazards, traffic, visibility, tide, pilotage phase, and the time or distance remaining to the next decision point; there is no universal fixed interval.",
      "Monitor frequently or continuously wherever the risk demands, with explicit checks before hazards, tidal or other gates, course alterations and handovers, and whenever visibility, weather, traffic, equipment or other conditions deteriorate.",
      "At each check compare position, cross-track error (XTE), speed over ground (SOG), ETA, depth and observed conditions with the plan; act on deviations before margins are lost and record the observation, decision and action.",
      "Act at trigger points: slow, hold, turn back, divert or seek assistance before margins disappear.",
      "A plan is not a track to follow blindly: the skipper retains responsibility and communicates changes to the crew.",
    ],
    example: "In confined pilotage, use continuous track, depth and clearing-limit monitoring backed by frequent independent fixes, including checks before each alteration and hazard. In lower-risk open water, well clear of hazards in good visibility with a reliable fix, checks may be farther apart, but shorten the interval as uncertainty grows or a gate or decision point approaches. In either case, an unsafe XTE, unexpected depth or late ETA triggers the pre-briefed action and is recorded.",
  },
];
