export type EvidenceState = { normal: string; abnormal: string };

export type InspectionExample = {
  id: string;
  component: string;
  locate: string;
  observe: string;
  evidence: EvidenceState;
  boundary: string;
};

export const lessonStages = [
  {
    id: "pre-start",
    title: "1. Pre-start inspection",
    example: "Manual says oil is checked level, after the specified wait, with the dipstick seated as shown. Record: 418.2 h — oil between marks; coolant at COLD mark; bilge dry; fuel separator bowl clear.",
    abnormal: "A rising fluid level, milky oil, coolant below the manual limit, water/debris in fuel, wetness, staining or fuel odour is evidence to stop and escalate—not a prompt to top up blindly.",
  },
  {
    id: "post-start",
    title: "2. Immediately after start",
    example: "From a safe position: expected oil-pressure and charge indications appear, alarms clear, and the installation's tell-tale or exhaust discharge is present. Record the actual indications, not only ‘OK’.",
    abnormal: "No expected discharge, an alarm, persistent smoke, exhaust smell, leak, unusual noise or vibration: maintain navigational safety, stop as the fitted manual directs and do not restart an unexplained fault.",
  },
  {
    id: "monitor",
    title: "3. Monitor underway",
    example: "At regular scans compare temperature, oil pressure, charging, exhaust, bilge and fuel use with the vessel's established normal. Note time, rpm/load and readings so a trend is inspectable.",
    abnormal: "A changed trend, new vibration, smoke, smell, leak or warning is evidence. Reduce risk and follow the alarm/manual response; never investigate beside moving machinery.",
  },
  {
    id: "shutdown",
    title: "4. Shutdown and post-run",
    example: "Use the specified cool-down and stop sequence. When stopped, cool and safe, inspect for new leaks, levels or loose parts and restore valves/isolators to the vessel's berth policy.",
    abnormal: "Record anything changed since pre-start, isolate/tag against restart where required, and hand over the defect rather than leaving the next operator to rediscover it.",
  },
  {
    id: "record",
    title: "5. Maintenance record",
    example: "2 Aug, 418.7 h: separator showed clear fuel/no water; belt free of glazing/cracks; discharge normal for this installation. Next engine-oil service due at the earlier of 500 h or 1 Nov per current schedule.",
    abnormal: "Record symptoms, readings, photos if safe, action taken, parts/fluids used and who was told. A tick without evidence, date and hours is not a useful service record.",
  },
] as const;

export const inspectionExamples: InspectionExample[] = [
  { id: "fluids", component: "Oil and coolant", locate: "Dipstick/fill and expansion or header tank identified in the fitted manuals", observe: "Correct measurement method, level, appearance and change since last record", evidence: { normal: "Within the installation-specific marks; no unexpected change or contamination evidence", abnormal: "Below/above limits, milky oil, debris, incompatible/unknown coolant or unexplained change" }, boundary: "Observe when stopped and at the manual's stated condition. Never open a hot pressurised cap; fluid specification and corrective work follow the manual." },
  { id: "fuel", component: "Fuel filters / water separator", locate: "Primary separator, secondary filter, drains and shut-offs traced on the actual vessel", observe: "Bowl/indicator condition, water or debris, wetness, staining and restriction indication where fitted", evidence: { normal: "Clear view consistent with the fitted system and no leak/restriction evidence", abnormal: "Water layer, haze/debris, restriction, wetness, staining or fuel odour" }, boundary: "Visual operator check only unless trained and authorised. Isolated draining, bleeding and element replacement need spill/fire controls and the manual." },
  { id: "belts", component: "Belts and hoses", locate: "Driven belt runs, guards, coolant/raw-water/fuel hoses and clamps", observe: "Cracks, glazing, fray, alignment, bulges, chafe, hard/soft areas, staining and secure routing", evidence: { normal: "Condition and tension meet the maker's criterion; guards and hoses secure", abnormal: "Dust, cracks, glazing, misalignment, damaged hose, seepage or loose/missing guard" }, boundary: "Hands-on inspection only stopped, isolated and cool. Adjustment/tension is installation-specific competent work." },
  { id: "cooling", component: "Cooling discharge", locate: "Expected exhaust outlet, tell-tale or other indicator for this cooling arrangement", observe: "Presence, character and trend from a safe position immediately after start and underway", evidence: { normal: "Expected discharge/indicator appears as documented for this installation", abnormal: "Absent, reduced or changed flow; steam; temperature rise or alarm" }, boundary: "Observe only. Maintain navigational safety, stop per the manual and investigate after isolation—never reach near belts or intake machinery." },
  { id: "leaks", component: "Leaks and bilge evidence", locate: "Engine tray/bilge, tanks, unions, pumps, hoses, stern gear and exhaust route", observe: "Fresh drops, sheen, staining, smell, level change and source direction", evidence: { normal: "Dry or matches a documented installation-specific baseline", abnormal: "New/increasing fuel, oil, coolant, seawater or exhaust evidence" }, boundary: "Do not start with suspected fuel vapour/leak. Stop the source if safe, contain without pumping pollution overboard, and escalate." },
  { id: "battery", component: "Batteries and charging", locate: "Banks, restraint, covers, isolators, charger and cable routes", observe: "Secure/dry case, protected terminals, cable condition and installed voltage/charge indication", evidence: { normal: "Restrained, ventilated as specified, no heat/swelling/corrosion and expected indication", abnormal: "Loose restraint, damaged cable, exposed terminal, swelling, heat, smell or abnormal charge indication" }, boundary: "Operator observation only. Isolate before work; avoid jewellery, sparks, polarity errors and live-terminal cleaning. Electrical diagnosis is competent-person work." },
  { id: "exhaust", component: "Exhaust system", locate: "Manifold/lagging, hose, waterlock, anti-siphon device, clamps and outlet where fitted", observe: "Water/exhaust escape, corrosion, staining, hose/clamp condition, smoke and carbon-monoxide risk", evidence: { normal: "No escape into the vessel; expected discharge and stable smoke profile", abnormal: "Soot/water staining, damaged hose, loose clamp, unusual smoke, fumes or alarm" }, boundary: "Keep clear of hot surfaces. Suspected exhaust ingress or carbon monoxide means ventilate, leave exposure and stop/escalate safely." },
  { id: "controls", component: "Controls, alarms and stop", locate: "Neutral, throttle/gear, panel, emergency stop and shutdown controls", observe: "Neutral confirmation, self-test/alarms, gauge response and control movement per manual", evidence: { normal: "Controls identify correctly and indications follow the expected start/stop sequence", abnormal: "Cannot confirm neutral, failed alarm/self-test, sticky control or unexplained indication" }, boundary: "Do not start if control state is uncertain. Testing beyond the documented operator routine belongs to an authorised competent person." },
  { id: "stern-gear", component: "Stern gear / drive", locate: "Gearbox/drive, shaft coupling, gland/seal and accessible mounts for the fitted arrangement", observe: "Stopped inspection for looseness, damage or leakage; underway observation only from a protected remote position", evidence: { normal: "Matches the manufacturer-defined leakage/temperature/vibration baseline", abnormal: "Changed leak, vibration/noise, heat, damaged mount or guard—‘a slight drip’ is not universal" }, boundary: "Never approach a rotating shaft/coupling or inspect a gland beside live machinery. Isolate against restart; adjustment and alignment are competent-person work." },
];

export const practiceScenarios = [
  {
    id: "missing-discharge",
    prompt: "Immediately after start, the discharge expected for this installation is absent. What is the defensible action?",
    choices: ["Increase rpm to see whether it clears", "Keep people safe, stop as the fitted manual directs, then investigate only when isolated", "Tick the check because the engine started"],
    answer: 1,
    remediation: "Starting does not prove cooling. An absent expected discharge is abnormal evidence: protect navigation and people, stop according to the installed system's instructions, isolate, then diagnose or escalate.",
  },
  {
    id: "separator-water",
    prompt: "The pre-start separator bowl shows a distinct water layer. What should the record and decision say?",
    choices: ["Fuel looks mostly clear—normal", "Water observed; do not start until the vessel-specific isolated drain/remediation and contamination assessment are completed", "Drain it while the engine runs"],
    answer: 1,
    remediation: "Water is inspectable contamination evidence. Record it precisely; use spill/fire controls and the manual, and keep draining/bleeding work within competence and authorisation.",
  },
] as const;
