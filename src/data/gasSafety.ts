/**
 * Gas Safety data — LPG and carbon monoxide risks aboard.
 *
 * Covers all theory areas required by RYA Day Skipper syllabus area 4 (Safety)
 * for gas safety: LPG properties, isolation valves, leak warning and response,
 * gas locker requirements, carbon monoxide awareness, detector placement.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S5, AC-1
 */

export interface GasSafetyTopic {
  /** Unique identifier for this topic section. */
  readonly id: string;
  /** Human-readable title for the section. */
  readonly title: string;
  /** Detailed theory content for the section. */
  readonly content: string;
  /** Key learning points to highlight. */
  readonly keyPoints: readonly string[];
}

export const gasSafetyTopics: readonly GasSafetyTopic[] = [
  {
    id: "lpg-properties",
    title: "LPG Properties",
    content:
      "A permanently installed marine LPG system is a vapour-withdrawal system: vapour, not liquid LPG, must reach its regulator and appliances. Keep every connected and spare cylinder upright in its designed orientation and positively secured against vessel movement. A cylinder on its side or inverted in rough weather can feed liquid LPG into the regulator, causing dangerously high downstream pressure, leaks or flare-ups; isolate at the cylinder before rough weather and keep it secured. Installations may use propane, butane or another approved supply, but the cylinder, regulator, operating pressure and appliances must match—never improvise adapters or substitute fuels. LPG vapour is heavier than air, so a leak can collect low in the vessel and form a flammable atmosphere. LPG is colourless and normally odorised: an unexpected gas smell is a warning to act on, but neither smell nor its absence proves whether the system is leaking or the space is safe. Even a small spark may ignite accumulated gas.",
    keyPoints: [
      "LPG vapour can collect in low spaces; use approved detection and vessel checks",
      "A fuel-specific range of LPG mixtures in air is flammable",
      "Odour is a warning, not proof of a leak or proof that a space is safe",
      "A small spark can ignite accumulated gas",
      "Avoid ignition sources whenever gas is detected or suspected",
      "Vapour withdrawal depends on cylinders remaining upright and secured; isolate at the bottle before rough weather",
    ],
  },
  {
    id: "isolation-valves",
    title: "Isolation Valves",
    content:
      "Each appliance must have its own distribution branch and closing device. The cylinder valve or other designated main supply valve is the primary supply isolation; some installations also provide a labelled, accessible secondary tap or remote solenoid for routine use, but that extra control is installation-specific and does not replace the documented cylinder/main-valve routine. Each burner needs effective flame supervision that stops gas if its flame fails. Keep the installation's fixed ventilation open. Appliances must be intended for LPG and the marine environment, secured for vessel movement, and installed to their manufacturer's instructions. The regulator must match the fuel, cylinder connection, capacity and appliance pressure. The cited RYA RCR/ISO overview describes the ISO 10239:2014 basis as recognising EN 16129 Annex M regulators marked “Marine” for seawater craft; this lesson has not verified that detail against ISO 10239:2025, so a competent person must establish the standard and equipment applicable to the vessel. An owner or user may follow the vessel instructions for pre-use visual checks, use a fitted bubble tester exactly as its manufacturer directs, and apply proprietary leak-detection fluid to a just-remade cylinder connection if the instructions assign that task. Bubbles or a suspect result mean isolate and stop: these checks cover only their stated location or downstream scope and never prove the whole installation safe. Installation, alteration, pressure/tightness testing, service, diagnosis and repair belong to a competent boat-LPG person. Inspect accessible hose and pipework visually for cracking, hardening, discolouration, chafe, corrosion, loose support or damage; isolate and obtain competent replacement at the component/manufacturer interval or sooner if defective—do not impose a generic annual DIY joint test or universal hose replacement date. Never use a naked flame.",
    keyPoints: [
      "Use the installation's designated controls and vessel shutdown procedure",
      "Follow the vessel procedure for safely isolating the supply and residual gas",
      "Use only isolation equipment approved for the installation",
      "Distinguish the cylinder/main supply valve, each appliance branch closing device, and any installation-specific secondary tap",
      "Use flame supervision, permanent ventilation and LPG/marine-suitable appliances installed to their instructions",
      "Match the regulator to fuel, pressure and capacity; the cited RYA summary's 2014 basis describes EN 16129 Annex M equipment as marked Marine",
      "Visually inspect accessible hoses and pipework; replacement timing follows condition, component instructions and competent assessment",
      "Limit owner checks to specified visual checks and correct use of a fitted manufacturer-approved bubble tester",
      "Use a competent boat-LPG person for pressure/leak testing, diagnosis and repair—never use a naked flame",
    ],
  },
  {
    id: "bilge-sniff-test",
    title: "Leak Warning and Response",
    content:
      "Before starting an engine after the vessel has been closed up, follow its specified LPG checks and treat any detector alarm, gas smell or other sign as a suspected leak. Shut the LPG supply only if the designated control can be reached safely; extinguish flames and other ignition sources without operating electrical switches either on or off. Evacuate everyone, then from outside ventilate naturally with a through-draught, without using electrical fans or creating another ignition source, and summon the emergency or professional help the situation requires. Keep a suspected leaking system out of use until a competent boat-LPG person has pressure/leak tested it, found the cause and made it safe. If a cylinder valve or leak will not stop, do not handle, disconnect or move the cylinder through the vessel: withdraw, keep others away, raise the alarm and call the fire and rescue service or Coastguard as appropriate.",
    keyPoints: [
      "Carry out the vessel's specified pre-use gas checks",
      "Treat smell as a warning, never as proof for or against a leak",
      "If gas is suspected, shut the supply only if safe and extinguish flames; operate no electrical switch on or off",
      "Evacuate, ventilate from outside with a natural through-draught and summon help",
      "Do not handle or move a cylinder whose leak cannot be stopped safely—withdraw and raise the alarm",
      "Keep the system out of use until competent boat-LPG pressure/leak testing and repair make it safe",
    ],
  },
  {
    id: "gas-locker-requirements",
    title: "Gas Locker Requirements",
    content:
      "Store connected and spare cylinders upright and secured only in the approved cylinder enclosure. Current RCR/ISO 10239-oriented RYA guidance describes a permanent system enclosure separated from living accommodation, accessible only from outside and ventilated outside so escaping vapour drains overboard. MCA LPG guidance used with MGN 280 sections 2.1–2.4 specifies, for small vessels in that Code's scope, a compartment vapour-tight to the vessel interior and a drain from the enclosure's lowest point that falls continuously without obstruction to an overboard outlet at least 75 mm above the at-rest waterline and at least 500 mm from openings into the vessel. Outside that Code's scope, treat its measurements as safety-critical design evidence rather than universal law: follow the vessel design, applicable rules and competent inspection advice, and never accept or improvise a drain outlet below the waterline.",
    keyPoints: [
      "Use only the approved cylinder enclosure: accessible from outside and vapour-tight to the accommodation",
      "Trace the drain from the locker low point: it must fall continuously, remain unobstructed and discharge overboard away from hull openings",
      "Confirm the outlet is at least 75 mm above the at-rest waterline; a below-waterline outlet is unsafe guidance",
      "Secure cylinders in their manufacturer-designed orientation",
      "Inspect for drain blockage, corrosion or damage, sound connections, and stored items that could obstruct the low point or drain",
      "Never improvise cylinder storage or move cylinders into accommodation",
    ],
  },
  {
    id: "carbon-monoxide",
    title: "Carbon Monoxide Awareness",
    content:
      "Carbon monoxide (CO) is an odourless, colourless and tasteless gas produced by incomplete combustion of carbon-based fuels, including LPG, diesel, petrol and charcoal. Symptoms such as headache, dizziness, nausea, confusion and drowsiness can be mistaken for seasickness. Prevention starts with competent installation and servicing of fuel-burning equipment: keep fixed ventilation, flues and exhausts clear, never use a cooker or oven to heat the cabin, and investigate yellow flames, sooting or unusual condensation. Consider exhaust from engines and generators—including neighbouring craft when rafted or in a marina. If an alarm sounds or exposure is suspected, get everyone into fresh air, stop engines, generators or appliances only if this is safe, call emergency services and seek urgent medical advice. Do not re-enter until responders or another competent authority say it is safe. Supplemental oxygen is for trained, equipped responders, not an untrained crew treatment.",
    keyPoints: [
      "CO is odourless, colourless, and tasteless — you cannot detect it without an alarm",
      "Produced by incomplete combustion of any carbon-based fuel",
      "Symptoms mimic seasickness: headache, dizziness, nausea",
      "Prevent CO through competent installation and servicing, clear fixed ventilation, flues and exhausts, and attention to yellow flames, sooting or condensation",
      "Account for engines, generators and exhaust from neighbouring craft",
      "Never use a cooker or oven for cabin heating",
      "Fresh air first; stop sources only if safe, call emergency services and obtain urgent medical advice",
      "Do not re-enter until declared safe; oxygen is only for trained and equipped responders",
    ],
  },
  {
    id: "detector-placement",
    title: "Detector Placement",
    content:
      "Fit a certified audible CO alarm suitable for boats and meeting BS EN 50291-2, following its manufacturer installation and location instructions. Place CO alarms to protect living and sleeping areas and ensure they can be heard where people sleep. Avoid positions affected by heat or steam. Use a sleeping breathing-zone position only when the alarm manufacturer specifically instructs it: there is no universal mounting height. Test a CO alarm routinely with its test button and maintain it as instructed. An LPG detector is a separate aid, not a universal mandate for every craft: establish whether one is required or recommended for the vessel, its use and the applicable regime, then choose marine-suitable equipment for that installation. A competent installer must follow the detector and vessel manufacturers' instructions when locating each LPG sensor in a low space where leaked vapour could collect. The head must remain clear of bilge water, oil, cleaning chemicals, mechanical damage and other contaminants, and any equipment in an ignition-hazard area must have the certification required for that location. Do not drill, cable through or mount equipment in a way that compromises the cylinder locker's vapour-tight separation from the vessel interior, and do not introduce uncertified electrical equipment into the locker. Arrange audible and, where provided, visible indication so an alarm reaches the helm, accommodation and sleeping occupants as applicable to the vessel. Where the installation includes a solenoid interlock, an alarm may automatically isolate the LPG supply; which supply or branch it isolates, its alarm response and its reset procedure must follow the vessel and detector manufacturers' instructions. Test the complete installed LPG detector chain only by the detector manufacturer's approved method—including each sensor, wiring, sounder/indicator and any linked solenoid—not merely the control-panel button. Follow the specified test and calibration intervals, keep its power supply and fault indication serviceable, and replace sensors, batteries or the whole unit at the stated expiry or end-of-life. Never expose a sensor to lighter gas or another improvised test source. If either alarm operates, follow the relevant emergency response rather than merely silencing it. Detection supplements rather than replaces competent installation, servicing, isolation and fixed ventilation.",
    keyPoints: [
      "Choose a certified audible boat-suitable CO alarm meeting BS EN 50291-2",
      "Follow the manufacturer's exact placement instructions; protect living and sleeping areas and confirm audibility",
      "Avoid heat and steam; use sleeping breathing-zone placement only where instructed—there is no universal height",
      "Establish the vessel and regime-specific need for an LPG detector; choose marine-suitable equipment rather than assuming a universal mandate or generic standard",
      "Put LPG sensor heads where gas could collect low down, while protecting them from bilge water, oil, chemicals, contamination and damage",
      "Preserve locker vapour-tightness and use only electrical equipment appropriately certified for any ignition-hazard location",
      "Confirm audible/visible indication reaches the helm, accommodation and sleeping occupants as applicable",
      "A fitted solenoid interlock may automatically isolate the LPG supply; what it isolates, alarm response and reset follow the vessel and detector manufacturers' instructions",
      "Test the complete sensor-to-alarm and linked-solenoid chain by the manufacturer's approved method—not just the panel button",
      "Maintain power and fault indication; test, calibrate and replace sensors, batteries or units at manufacturer-specified intervals and end-of-life—never disable an alarm",
      "Treat an alarm as an emergency requiring fresh air and help, not as a device to silence",
      "Detection supplements rather than replaces ventilation, isolation and inspection",
    ],
  },
];

export const gasLockerSources = [
  {
    id: "rya-rcr-gas",
    label: "RYA: Gas safety regulations for boats (RCR and ISO 10239 overview)",
    href: "https://www.rya.org.uk/water-safety/gas-safety/gas-safety-regulations-for-boats/",
    scope: "RYA summary of RCR essential requirements and ISO 10239 context. Its regulator detail expressly cites ISO 10239:2014; this lesson has not verified ISO 10239:2025.",
  },
  {
    id: "rya-installation-maintenance",
    label: "RYA: Gas installation and maintenance",
    href: "https://www.rya.org.uk/water-safety/gas-safety/gas-installation-and-maintenance/",
    scope: "Competence, maintenance, ventilation, regulator compatibility and private-boat legal context; component and vessel instructions remain controlling.",
  },
  {
    id: "mca-mgn-280",
    label: "MCA LPG guidance used with MGN 280, sections 2.1–2.4",
    href: "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/282245/mgn280.pdf",
    scope: "Cylinder stowage and LPG locker/drain requirements for small vessels governed by the Code; not stated as universal law for every leisure vessel.",
  },
  {
    id: "rya-gas-safety",
    label: "RYA: Gas safety on boats",
    href: "https://www.rya.org.uk/water-safety/gas-safety/gas-safety-on-boats/",
    scope: "Current recreational gas-safety context. Vessel documentation, equipment instructions and applicable requirements remain controlling.",
  },
  {
    id: "gas-safe-boats",
    label: "Gas Safe Register: Gas safety on boats factsheet",
    href: "https://www.gassaferegister.co.uk/media/drxliecz/gas-on-boats-factsheet.pdf",
    scope: "Consumer guidance on recognising a suspected LPG escape, immediate precautions, owner checks and work that requires a suitably competent Gas Safe registered engineer.",
  },
] as const;

export const gasLockerReview = {
  contentVersion: "2026-08-12",
  sourceCheckedOn: "2026-08-12",
  sourceIds: gasLockerSources.map(({ id }) => id),
  qualifiedReview: { status: "pending", reviewerName: null, qualification: null, approvedOn: null },
  releaseNote: "No qualified practitioner approval is recorded; this lesson does not certify an installation or claim verification against ISO 10239:2025.",
} as const;

export const gasUserRoutine = {
  preUse: [
    "Read the vessel gas routine; identify the cylinder or designated main supply valve, each appliance branch closing device, and any installation-specific accessible secondary tap or remote solenoid.",
    "Confirm cylinders are upright and secured, the locker drain and fixed ventilation are clear, and accessible hose/pipework has no visible damage.",
    "Confirm appliance controls are off. Use the fitted bubble tester exactly as its manufacturer directs; after an authorised cylinder change, use approved leak-detection fluid as instructed—never a flame.",
    "If there is an alarm, smell, bubbles, damage or uncertainty, do not light an appliance: isolate only if safe, evacuate as required and obtain competent help.",
  ],
  shutdown: [
    "Turn every appliance off and verify each flame is extinguished.",
    "Close its branch closing device, any secondary or master control the installation provides, and the cylinder or designated main supply valve in the order set by the vessel and manufacturer procedure.",
    "Before sleep, leaving the boat or rough weather, isolate at the cylinder unless the documented installation procedure identifies an appliance designed to remain supplied.",
    "Leave fixed ventilation open; record defects and keep a suspect system out of use until competent testing and repair make it safe.",
  ],
} as const;

export const gasWorkBoundaries = {
  user: "Users carry out only the vessel's documented operation, cylinder-change and visual/bubble-tester/leak-fluid routines within their competence and the manufacturers' instructions.",
  competent: "A competent boat-LPG person designs, installs or alters the system and performs installation pressure/tightness testing, servicing, diagnosis and repair.",
  rentedBoat: "Gas Safe registration is not a blanket rule for every private pleasure craft. Where a boat is hired out as a business, made available to the public as part of a business, or used primarily as domestic/residential accommodation, in-scope gas work must be done by a suitably competent Gas Safe registered engineer; a rented boat also requires the applicable Gas Safety Record. Exact duties depend on the vessel's use and jurisdiction, so the owner/operator must confirm the legal scope.",
} as const;

export const carbonMonoxideSources = [
  { id: "gov-uk-fire-boats", label: "UK government: Fire safety on boats", href: "https://www.gov.uk/government/publications/fire-safety-on-boats/fire-safety-on-boats-accessible-version", scope: "Accessible official boat guidance covering CO alarms, escape and routine safety checks." },
  { id: "boatsafety-co", label: "Boat Safety Scheme: Carbon monoxide", href: "https://www.boatsafetyscheme.org/stay-safe-advice/carbon-monoxide-co/", scope: "Marine alarm, installation, maintenance, symptoms and combustion warning signs." },
] as const;

export const lpgDetectorSources = [
  {
    id: "bss-lpg-safety",
    label: "Boat Safety Scheme: LPG safety aboard",
    href: "https://www.boatsafetyscheme.org/stay-safe-advice/lpg/",
    scope: "Official scheme safety advice: LPG alarms are an additional precaution, not a substitute for sound installation, ventilation, inspection and safe operation.",
  },
  {
    id: "mca-mgn-280",
    label: "MCA MGN 280: Small vessels in commercial use",
    href: "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/282245/mgn280.pdf",
    scope: "Code requirements apply only to vessels within its stated commercial-use scope; they must not be presented as a universal leisure-craft detector mandate.",
  },
  {
    id: "rya-gas-safety",
    label: "RYA: Gas safety on boats",
    href: "https://www.rya.org.uk/water-safety/gas-safety/gas-safety-on-boats/",
    scope: "Current recreational gas-safety context; vessel documentation, detector instructions and applicable requirements control selection, installation and maintenance.",
  },
] as const;
