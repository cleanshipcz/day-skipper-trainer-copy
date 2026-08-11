export const checklistPhases = [
  "Planning and current information",
  "Crew and vessel readiness",
  "Pre-start checks",
  "Safe start",
  "Immediate running checks",
  "Final go / no-go",
] as const;

export type ChecklistPhase = typeof checklistPhases[number];
export interface ChecklistItem {
  id: string;
  phase: ChecklistPhase;
  label: string;
  why: string;
  dependsOn?: readonly string[];
  conditional?: { when: string; authority: string };
}

const conditional = (when:string,authority:string):ChecklistItem["conditional"] => ({when,authority});

/** Ordered safety gate: later phases depend on evidence established earlier. */
export const preDepartureChecklist: readonly ChecklistItem[] = [
  {id:"passage-plan",phase:"Planning and current information",label:"Review the current berth-to-berth plan, hazards, limits, decision points and alternatives",why:"Use the dedicated passage-plan builder; this gate checks that its current revision has been reviewed rather than duplicating the plan."},
  {id:"charts-notices",phase:"Planning and current information",label:"Confirm official charts/publications, corrections, Notices to Mariners and harbour information are current for the whole route",why:"Record edition, correction and validity evidence; electronic data and a plotted route do not prove currency."},
  {id:"tides-ukc",phase:"Planning and current information",label:"Recalculate tidal gates, streams, heights and under-keel clearance with passage-specific allowances",why:"Use the tide and passage-planning tools, then compare results with vessel draught, loading, sea state and agreed limits.",dependsOn:["charts-notices"]},
  {id:"forecast",phase:"Planning and current information",label:"Obtain current forecast, warnings and local observations for the correct area and validity period",why:"Compare wind, sea, visibility and timing with crew/vessel limits and escape options."},
  {id:"planning-decision",phase:"Planning and current information",label:"Record the planning-stage go, delay, divert or cancel decision",why:"Do not continue by momentum when current information exceeds a limit or invalidates an alternative.",dependsOn:["passage-plan","charts-notices","tides-ukc","forecast"]},

  {id:"crew-fitness",phase:"Crew and vessel readiness",label:"Confirm crew number, competence, fitness, rest, clothing, medication and passage-specific limitations",why:"Allocate realistic watches and tasks; impairment, seasickness, fatigue or a missing competent person can change the decision.",dependsOn:["planning-decision"]},
  {id:"crew-brief",phase:"Crew and vessel readiness",label:"Brief route, roles, hazards, limits, lifejackets/tethers, communications, diversions and emergency actions",why:"Include skipper incapacitation: who takes command, stops/diverts, operates communications and finds essential equipment.",dependsOn:["crew-fitness"]},
  {id:"documents-shore",phase:"Crew and vessel readiness",label:"Carry required vessel/crew documents and leave the passage, persons aboard and escalation plan with a reliable shore contact",why:"Requirements depend on vessel, voyage, flag, location and operation; use the applicable authority and keep changes communicated."},
  {id:"hull-openings",phase:"Crew and vessel readiness",label:"Inspect hull/deck condition, seacocks and through-hulls; set openings and valves for sea",why:"Check for damage or leaks, know closure locations, and keep plugs/damage-control equipment accessible."},
  {id:"bilge-steering",phase:"Crew and vessel readiness",label:"Test bilge alarms/pumps and primary plus emergency steering",why:"Test by the vessel/manual method without unlawful discharge; brief isolation, manual operation and emergency steering access."},
  {id:"rig-deck",phase:"Crew and vessel readiness",label:"Inspect rig, sails, running rigging, guardrails, deck gear, anchors and moorings",why:"Use the dedicated rig and anchor lessons for detailed inspection; secure or ready equipment for the planned departure and contingencies."},
  {id:"electrical-gas",phase:"Crew and vessel readiness",label:"Set and inspect batteries, charging, essential electrical circuits and LPG/fuel isolation or ventilation arrangements",why:"Use vessel manuals and the gas-safety lesson. Never treat absence of smell as proof that petrol vapour, LPG or carbon monoxide is absent."},
  {id:"nav-signals",phase:"Crew and vessel readiness",label:"Test navigation, depth, position-fixing and steering instruments plus navigation lights and sound signals",why:"Know degraded alternatives; AIS, chartplotters and alarms supplement rather than replace lookout, charts and judgement.",conditional:conditional("Electronic aids, installed lights and powered sound equipment vary by vessel and intended conditions.","COLREGs, local rules, vessel certification/equipment requirements and manufacturer instructions determine what must be carried and shown.")},
  {id:"emergency-equipment",phase:"Crew and vessel readiness",label:"Check accessible fire, MOB, flooding/bilge, first-aid, lifesaving and abandon-vessel equipment; brief immediate actions",why:"Cross-reference the dedicated safety lessons and actual vessel plan; inspect condition, service status, location and safe access.",conditional:conditional("Liferaft, pyrotechnics, beacons and other carriage items depend on vessel and voyage.","Flag/coastal-state rules, coding or certificate requirements, manufacturer instructions and a competent person determine applicability and serviceability.")},
  {id:"stowage-hatches",phase:"Crew and vessel readiness",label:"Complete safe stowage of tender, anchors, loose gear, provisions and heavy items; close or set hatches, ports and companionway",why:"Nothing should shift, block controls/escapes, damage systems or admit water under expected heel, motion or weather."},

  {id:"cold-fluids",phase:"Pre-start checks",label:"With machinery stopped, cool and isolated, check fuel quantity/reserve, oil and coolant by the vessel/engine manual",why:"Keep cold level checks separate from running checks. Never remove a hot or pressurised cap; investigate leaks or unexplained consumption.",dependsOn:["hull-openings","electrical-gas"]},
  {id:"machinery-space",phase:"Pre-start checks",label:"Inspect bilge/tray, fuel, hoses, belts, guards, wiring, mounts, intake and exhaust route for leaks, damage or obstruction",why:"Hands-on inspection is stopped, isolated and cool. Do not start with suspected fuel leak or vapour."},
  {id:"prop-clear",phase:"Pre-start checks",label:"Account for people, tools and lines; confirm neutral and propeller/intake clearance",why:"Nobody may be in the water or exposed to machinery that could start; establish clear communication with line handlers."},
  {id:"ventilation",phase:"Pre-start checks",label:"Ventilate as the installation requires and operate a fitted blower for the labelled/manual period where required",why:"Petrol/gasoline and other arrangements are installation-specific; ventilation does not replace inspection.",conditional:conditional("Required where fitted or specified for the actual machinery/fuel installation.","Vessel/engine manuals, labels and applicable equipment rules control the sequence and duration.")},

  {id:"start-sequence",phase:"Safe start",label:"Start only by the vessel/engine manual sequence with controls in neutral and crew clear",why:"Stop rather than improvise if alarms, interlocks or indications do not behave as specified.",dependsOn:["cold-fluids","machinery-space","prop-clear","ventilation"]},
  {id:"pressure-charge",phase:"Safe start",label:"Immediately verify oil-pressure, charging and alarm indications",why:"Protect immediate navigational safety, then stop promptly for absent oil pressure or an unexplained critical alarm.",dependsOn:["start-sequence"]},
  {id:"cooling-exhaust",phase:"Safe start",label:"Immediately verify the installation-specific raw-water tell-tale or wet-exhaust/cooling discharge",why:"This is a running check, not part of the cold fluid inspection. If expected flow is absent, protect immediate safety, stop and investigate only when isolated and cool.",dependsOn:["start-sequence"],conditional:conditional("The indication differs for raw-water, closed-circuit, keel-cooled, outboard and dry-exhaust installations.","The vessel/engine manual defines the expected indication and safe response.")},

  {id:"running-scan",phase:"Immediate running checks",label:"At safe idle/load, scan temperature, pressure, charging, exhaust, bilge, leaks, noise, smoke and vibration",why:"Compare with the vessel's established normal; stop and resolve unexplained changes before committing to constrained water.",dependsOn:["pressure-charge","cooling-exhaust"]},
  {id:"controls-steering",phase:"Immediate running checks",label:"Confirm ahead/astern response and steering only when lines, water and people are clear",why:"Coordinate with line handlers and test without creating collision, propeller or mooring-line risk.",dependsOn:["running-scan"]},
  {id:"vhf-dsc",phase:"Immediate running checks",label:"Confirm lawful VHF/DSC readiness, power, position source, MMSI/display and listening arrangements",why:"Use an appropriate non-distress radio check or service where lawful; never send a DSC distress alert or false distress message merely to test. Carry and use only with required licensing/qualification.",conditional:conditional("Fixed/handheld VHF, DSC, AIS and satellite equipment vary by vessel, area and voyage.","Radio licence, operator qualification, equipment approval, manufacturer instructions and current local radio procedures control installation and testing.")},

  {id:"departure-ready",phase:"Final go / no-go",label:"Confirm moorings/anchor, fenders and deck are configured for the departure sequence and a safe abort",why:"Do not release the last restraint until propulsion/steering, crew communications and a safe fallback are established.",dependsOn:["controls-steering","crew-brief"]},
  {id:"final-information",phase:"Final go / no-go",label:"Recheck forecast/warnings, tide/UKC, traffic, destination, defects and crew condition for material change",why:"The planning decision expires when evidence changes; update the plan and brief before proceeding.",dependsOn:["forecast","tides-ukc","running-scan"]},
  {id:"final-decision",phase:"Final go / no-go",label:"Skipper records the final go, delay, divert or cancel decision and unresolved deficiencies",why:"Checklist completion is not seaworthiness certification. Resolve defects and depart only when the actual vessel, crew, conditions and lawful requirements are acceptable.",dependsOn:["departure-ready","final-information"]},
];

export const checklistSupportingRoutes = [
  {route:"/passage-planning/builder",label:"Passage plan builder",scope:"Route, limits, sources, alternatives and approval revision"},
  {route:"/navigation/charts",label:"Charts theory",scope:"Chart/publication currency and corrections"},
  {route:"/navigation/tides",label:"Tides tools",scope:"Tidal heights, streams and under-keel-clearance inputs"},
  {route:"/weather/forecasts",label:"Marine forecasts",scope:"Area, issue, validity and warning checks"},
  {route:"/engine",label:"Engine checks",scope:"Installation-specific stopped, start and running checks"},
  {route:"/rig",label:"Rig checks",scope:"Rig, sails and deck preparation"},
  {route:"/anchorwork",label:"Anchorwork",scope:"Anchor readiness and limitations"},
  {route:"/safety",label:"Safety procedures",scope:"MOB, fire, flooding, lifesaving, gas and abandon-vessel drills"},
  {route:"/victualling",label:"Victualling",scope:"Food, water, medication context and secure stowage"},
] as const;
