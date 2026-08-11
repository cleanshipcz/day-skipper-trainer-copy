export interface PrepareStep {
  letter: string;
  title: string;
  phases: readonly ("Appraisal" | "Detailed planning" | "Execution" | "Monitoring")[];
  /** Human-readable label for single or combined stages. */
  phase: string;
  description: string;
  considerations: readonly string[];
  example: string;
}

/** PREPARE is a cockpit memory aid; the four IMO planning stages remain the framework. */
export const prepareSteps: readonly PrepareStep[] = [
  {
    letter: "P", title: "Passage appraisal", phases: ["Appraisal"], phase: "Appraisal",
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
    letter: "R", title: "Regulations and responsibilities", phases: ["Appraisal"], phase: "Appraisal",
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
    letter: "E", title: "Equipment and information", phases: ["Appraisal"], phase: "Appraisal",
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
    letter: "P", title: "Detailed passage plan", phases: ["Detailed planning"], phase: "Detailed planning",
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
    letter: "A", title: "Alternatives and contingencies", phases: ["Detailed planning"], phase: "Detailed planning",
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
    letter: "R", title: "Revise and brief", phases: ["Detailed planning", "Execution"], phase: "Detailed planning + Execution",
    description: "Finalize detailed planning immediately before departure, update it with observed conditions, and brief everyone as the passage transitions into execution; delay or cancel when limits are exceeded.",
    considerations: [
      "Recheck forecast, warnings, tides, visibility, berth/harbour status, defects, fuel and crew fitness.",
      "Brief route, hazards, roles, watches, lifejackets/tethers, communications, emergency actions, abort triggers and alternatives.",
      "Record material changes and ensure chart, plotter, pilotage notes and crew share the same plan.",
    ],
    example: "Move departure or choose the sheltered route when the latest wind forecast exceeds the agreed limit.",
  },
  {
    letter: "E", title: "Execute and monitor", phases: ["Execution", "Monitoring"], phase: "Execution + Monitoring",
    description: "Execute the agreed plan while continuously checking position, progress, conditions and assumptions; change the plan deliberately when required.",
    considerations: [
      "Fix position by suitable independent methods at planned intervals and before hazards; monitor cross-track error, depth and clearing limits.",
      "Compare actual course, speed, ETA, weather, tide, traffic, fuel and crew state with the plan and log significant observations.",
      "Act at trigger points: slow, hold, turn back, divert or seek assistance before margins disappear.",
      "A plan is not a track to follow blindly: the skipper retains responsibility and communicates changes to the crew.",
    ],
    example: "At each fix compare actual and planned progress; a late ETA that misses the tidal gate triggers the pre-briefed diversion.",
  },
];
