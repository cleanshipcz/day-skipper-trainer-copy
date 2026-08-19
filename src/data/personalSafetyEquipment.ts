/**
 * Personal safety equipment data for the Personal Safety Equipment sub-module.
 *
 * Covers the personal safety equipment a Day Skipper student must know:
 * buoyancy aids and life jacket levels (50, 100, 150, 275), inflation methods,
 * servicing schedule, crotch straps, harnesses & tethers, jacklines, and kill cords.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S4, AC-1
 */

// ── Life Jacket Types ──────────────────────────────────────────────────────

/** Known life jacket IDs — used for compile-time validation. */
export type LifeJacketId =
  | "buoyancy-50n"
  | "buoyancy-100n"
  | "buoyancy-150n"
  | "buoyancy-275n";

export const LIFE_JACKET_IDS = {
  BUOYANCY_50N: "buoyancy-50n",
  BUOYANCY_100N: "buoyancy-100n",
  BUOYANCY_150N: "buoyancy-150n",
  BUOYANCY_275N: "buoyancy-275n",
} as const satisfies Record<string, LifeJacketId>;

export interface LifeJacketType {
  readonly id: LifeJacketId;
  readonly name: string;
  readonly buoyancyRating: string;
  readonly description: string;
  readonly suitableFor: string;
  readonly selfRightingPerformance: string;
}

export const lifeJacketTypes: readonly LifeJacketType[] = [
  {
    id: "buoyancy-50n",
    name: "Level 50 Buoyancy Aid",
    buoyancyRating: "50N",
    description:
      "An ISO 12402 Level 50 buoyancy aid for competent swimmers. It assists flotation but is not a lifejacket and is not designed to turn an unconscious wearer face-up.",
    suitableFor:
      "Sheltered or calm water where help and rescue are close at hand, such as dinghy sailing and water sports. Not suitable for offshore use, rough water, or anyone unable to swim.",
    selfRightingPerformance:
      "Not designed to self-right an unconscious wearer.",
  },
  {
    id: "buoyancy-100n",
    name: "Level 100 Lifejacket",
    buoyancyRating: "100N",
    description:
      "An ISO 12402 Level 100 lifejacket for relatively sheltered or calm water. It provides limited self-righting assistance, but its performance can be affected by the design, fit, clothing, water conditions, and air trapped in clothing.",
    suitableFor:
      "Inshore and sheltered-water use where rescue should be reasonably quick. It is not intended for offshore or severe conditions and may not have enough buoyancy to overcome heavy or air-trapping clothing.",
    selfRightingPerformance:
      "May help turn some wearers face-up; never assume this is guaranteed. Check the manufacturer's stated performance and ensure the correct fit.",
  },
  {
    id: "buoyancy-150n",
    name: "Level 150 Lifejacket",
    buoyancyRating: "150N",
    description:
      "An ISO 12402 Level 150 lifejacket for general offshore and rough-weather use. It is designed to provide self-righting performance for many wearers, including with foul-weather clothing, but actual performance depends on the product, fit, clothing, and conditions.",
    suitableFor:
      "Coastal and offshore sailing and rough weather. Confirm the selected model is suitable for the clothing and equipment being worn, fits correctly, and meets the manufacturer's instructions.",
    selfRightingPerformance:
      "Designed to self-right many unconscious wearers, but no universal guarantee applies across all designs, body types, clothing, fits, and sea conditions.",
  },
  {
    id: "buoyancy-275n",
    name: "Level 275 Lifejacket",
    buoyancyRating: "275N",
    description:
      "An ISO 12402 Level 275 lifejacket offering high buoyancy for demanding offshore conditions and for wearers carrying heavy clothing or equipment. Extra buoyancy can help overcome trapped air, but it does not make self-righting unconditional.",
    suitableFor:
      "Offshore and ocean passages, severe conditions, and situations involving heavy protective clothing or equipment. Follow the manufacturer's limits because fit, equipment, clothing, and the particular design still affect performance.",
    selfRightingPerformance:
      "Designed for strong self-righting performance, including with heavier clothing, but trapped air, fit, design, body position, and conditions can prevent or delay turning.",
  },
];

// ── Inflation Methods ──────────────────────────────────────────────────────

export type InflationMethodId =
  | "automatic-water-activated"
  | "automatic-hydrostatic"
  | "manual";

export interface InflationMethod {
  readonly id: InflationMethodId;
  readonly name: string;
  readonly description: string;
  readonly advantages: string;
  readonly disadvantages: string;
}

export const inflationMethods: readonly InflationMethod[] = [
  {
    id: "automatic-water-activated",
    name: "Automatic Water-Activated Inflation",
    description:
      "A water-sensitive element dissolves or reacts when sufficiently wetted, releasing a mechanism that pierces the CO₂ cylinder and inflates the bladder. The exact trigger and delay depend on the model.",
    advantages:
      "Can inflate without action from a wearer who is unconscious or incapacitated after entering the water.",
    disadvantages:
      "Because the trigger responds to wetting, heavy rain, spray, or water collecting around the firing head can cause unwanted activation on some models. Keep it maintained and stowed as its manufacturer directs.",
  },
  {
    id: "automatic-hydrostatic",
    name: "Automatic Hydrostatic Inflation",
    description:
      "A hydrostatic firing head responds to water pressure at a specified immersion depth, then pierces the CO₂ cylinder to inflate the bladder. It is pressure-activated, not simply triggered by getting its surface wet.",
    advantages:
      "Can inflate without action from an unconscious or incapacitated wearer, while resisting activation from rain, spray, and ordinary deck wetness.",
    disadvantages:
      "It must reach the model's specified pressure or immersion condition, costs more than simpler mechanisms, and its firing head and cylinder require inspection and replacement as the manufacturer specifies.",
  },
  {
    id: "manual",
    name: "Manual Inflation",
    description:
      "The wearer must pull a toggle or cord to trigger the CO₂ cylinder and inflate the life jacket. Some models also have an oral inflation tube as a backup. The wearer must be conscious and able to activate the device.",
    advantages:
      "Will not inflate accidentally in spray or rain. Lower servicing costs and simpler mechanism. Preferred by some dinghy sailors and racers who want to avoid accidental inflation.",
    disadvantages:
      "Requires the wearer to be conscious, able to reach the toggle, and capable of acting promptly; it may provide no inflated buoyancy if the wearer is incapacitated.",
  },
];

export const oralInflationGuidance =
  "The oral inflation tube is for topping up a partly inflated bladder or as an emergency backup if the normal system fails. It is not a substitute for pulling a manual toggle or allowing the fitted automatic system to activate. Follow the lifejacket instructions; do not trigger the CO₂ cylinder when the bladder is already orally inflated because over-pressure can injure the wearer or damage the bladder.";

export const lifejacketServicingGuidance = {
  ownerChecks: {
    name: "Routine owner checks",
    description:
      "Before use and at the intervals on the product label or in its manual, inspect the lifejacket without dismantling or altering its inflation system.",
    keyPoints: [
      "Check the cover, bladder, webbing, stitching, buckles, crotch strap, whistle, light, reflective material, oral tube, and inflation indicators for damage, contamination, corrosion, or missing parts.",
      "Confirm the CO₂ cylinder is secure, undamaged, unpierced, and the specified type and charge for that model. Weigh or remove it only when the manufacturer's instructions tell the owner how to do so.",
      "Check dated firing heads, cartridges, lights, and other replaceable parts against their marked expiry dates and the manual; replace them at the earlier product-specific limit.",
      "An oral-inflation leak test, including whether the bladder should remain inflated for 24 hours, is manufacturer-dependent. Perform it only at the interval and by the method in that lifejacket's instructions, then fully deflate and repack exactly as directed.",
      "If a check finds damage, leakage, corrosion, an incorrect or expired component, an uncertain indicator, or a missed service date, withdraw the lifejacket from use until the manufacturer or an approved service station confirms it is serviceable.",
    ],
  },
  approvedService: {
    name: "Manufacturer-approved servicing",
    description:
      "Use the service interval printed on the lifejacket or stated in its current manual; there is no single leisure-lifejacket interval that overrides the product instructions.",
    keyPoints: [
      "Use a service station approved for the exact make and model whenever the label/manual requires professional servicing, after damage or a failed owner check, or whenever the owner procedure is unclear.",
      "Servicing, repairs, replacement intervals, pressure tests, and repacking must follow the manufacturer's current instructions and service bulletins.",
      "After activation, re-arm only if the manufacturer permits owner re-arming, using the exact cylinder, firing head or water-activated element, seals, and status indicators specified for that model. Otherwise use an approved service station.",
      "Record inspections, servicing, activation, re-arming, and component replacement so the next due date and fitted parts can be verified.",
    ],
  },
  regulatedVessels: {
    name: "Commercial and SOLAS requirements",
    description:
      "Commercial, coded, fishing, passenger, and SOLAS vessels may be subject to statutory service intervals, approved-service-station rules, certification, and record-keeping beyond leisure-craft owner guidance.",
    keyPoints: [
      "Identify the vessel's applicable flag-state regulations, code, certification, and survey requirements; do not assume a leisure product manual alone satisfies them.",
      "MCA MGN 548 Amendment 1 requires SOLAS-certificated inflatable lifejackets in its scope to be serviced every 12 months at an approved service station, subject only to the formal exceptions described there.",
      "Other UK commercial categories can have different regimes. Follow the applicable MCA code or regulation, the lifejacket approval and manufacturer instructions, and any surveyor direction.",
    ],
  },
} as const;

export const lifejacketServiceSources = [
  {
    label: "RYA: Life Jackets and Buoyancy Aids",
    href: "https://www.rya.org.uk/water-safety/lifejacket-safety/lifejackets-and-buoyancy-aids/",
  },
  {
    label: "MCA MGN 548 (M+F) Amendment 1: SOLAS inflatable life-saving appliance servicing",
    href: "https://www.gov.uk/government/publications/mgn-548-mf-amendment-1-life-saving-appliances-servicing-requirements-for-solas-inflatable-life-saving-appliances-at-approved-service-stations/mgn-548-mf-amendment-1-life-saving-appliances-servicing-requirements-for-solas-inflatable-life-saving-appliances-at-approved-service-stations",
  },
] as const;

export const tetherJackstaySources = [
  {
    id: "rya-lifejackets-harnesses",
    label: "RYA: Life Jackets and Buoyancy Aids — PFD harness attachment-point context",
    href: "https://www.rya.org.uk/water-safety/lifejacket-safety/lifejackets-and-buoyancy-aids/",
    scope: "Recreational PFD context only, including whether a lifejacket incorporates a harness attachment point; not a source for jackstay design, tether transfer, hook loading, or tethered-MOB recovery.",
  },
  {
    id: "world-sailing-osr-2026-2027",
    label: "World Sailing Offshore Special Regulations 2026–2027, sections 4.04 and 5.02",
    href: "https://media.sailing.org/sailing/wp-content/uploads/2025/12/05110802/WS_Offshore_Special-Regulations_2026-2027_v1_wcover.pdf",
    scope: "Offshore-racing requirements for boats and competitors within the rules' scope; not presented as universal recreational law.",
  },
  {
    id: "maib-annual-report-2019-cv30",
    label: "MAIB Annual Report 2019 — CV30 tethered-overboard safety recommendations",
    href: "https://assets.publishing.service.gov.uk/media/5efadd12e90e075c5492d593/MAIBAnnualReport2019.pdf",
    scope: "Accident evidence concerning securing points, lateral hook loading, jackstay termination, and tethered-casualty recovery drills.",
  },
] as const;

export const tetherJackstayReview = {
  contentVersion: "2026-08-12",
  sourceCheckedOn: "2026-08-12",
  sourceIds: tetherJackstaySources.map((source) => source.id),
  reviewScope:
    "PFD attachment-point context checked against the listed RYA page. Tether and jackstay claims checked against the listed World Sailing offshore-racing rules and MAIB accident evidence; manufacturer instructions and vessel-specific competent assessment remain necessary for recreational use.",
  qualifiedReview: {
    status: "pending",
    reviewerName: null,
    qualification: null,
    approvedOn: null,
    reviewedCommit: null,
  },
  releaseNote:
    "No qualified practitioner approval is recorded. This lesson supports learning only and does not certify a tether system, installation, recovery plan, or crew competence.",
} as const;

export const lifejacketEmergencyFeatures = [
  {
    id: "whistle",
    name: "Whistle",
    purpose: "Attracts nearby attention when voice alone may be lost in wind, waves, darkness, or exhaustion.",
    preUse: "Confirm it is present, secured where the wearer can reach it after inflation, unobstructed, and works by the maker's permitted check.",
    emergencyUse: "Give repeated blasts when rescuers may be within hearing; conserve effort and combine it with visual and radio distress signals.",
  },
  {
    id: "light",
    name: "Emergency light",
    purpose: "Helps searchers locate the wearer at night or in poor visibility; it does not replace an alerting beacon.",
    preUse: "Check secure positioning, status indicator or maker-approved test, battery expiry, lens condition, and that inflation will leave it visible above water.",
    emergencyUse: "Ensure the light has activated or switch it on as its instructions require, then keep it clear of the sprayhood and clothing.",
  },
  {
    id: "retroreflective",
    name: "Retroreflective material",
    purpose: "Returns a searchlight beam towards its source, making the inflated lifejacket easier to pick out; it does not generate light.",
    preUse: "Check the patches are present, clean, securely bonded, and not covered or badly degraded.",
    emergencyUse: "Keep the patches exposed towards likely searchers and use them alongside the whistle, light, beacon, and other available signals.",
  },
  {
    id: "sprayhood",
    name: "Sprayhood",
    purpose: "Reduces inhalation of spray and breaking water, which can threaten a casualty even when the lifejacket supports the airway.",
    preUse: "Confirm the hood is fitted, undamaged, accessible after inflation, correctly packed, and that the wearer has practised deploying it safely.",
    emergencyUse: "After inflation and once breathing is stable, pull it over the head and inflated lobes as instructed, keeping the airway, light, and visibility clear.",
  },
] as const;

export const lifejacketAttachmentGuidance = {
  harness:
    "The harness D-ring or other manufacturer-identified harness point is for attaching the safety tether to keep the wearer connected to the vessel. It is not automatically a lifting point.",
  recovery:
    "A lifting or recovery loop is a separate, manufacturer-identified point intended to help recover an inflated casualty. Its position, load direction, compatible lifting strop, and whether it may lift the person are product-specific: rescuers must use only the method approved for that exact lifejacket.",
  warning:
    "Never lift by the bladder, cover, oral tube, whistle cord, light, sprayhood, crotch strap, or an ordinary harness/tether point unless the manufacturer expressly identifies that component for recovery. Brief and practise the vessel's recovery system before departure.",
} as const;

export const personalBeaconScenarios = [
  {
    title: "Coastal crew on an AIS-equipped yacht",
    choice: "An AIS-MOB device compatible with the vessel's receivers can rapidly alert the own boat and nearby AIS-equipped vessels; some units also initiate DSC, but only with the stated compatible equipment and programming.",
  },
  {
    title: "Solo or remote activity beyond immediate vessel recovery",
    choice: "A 406 MHz PLB with GNSS can alert the international search-and-rescue system through satellites. It must be correctly registered to the user or authority required for the operating area; it does not by itself put an AIS target on the yacht's display.",
  },
  {
    title: "Mixed crew, charter boat, or changing waters",
    choice: "Select from the whole activity and vessel plan: operating area, likely rescuers, time to detection, carriage and activation method, GNSS position capability, AIS/DSC compatibility where applicable, and local registration or programming rules. Carrying both types may address different alert paths, but one device should never be assumed to provide every function.",
  },
] as const;

export const personalBeaconChecks = [
  "Before departure, confirm the device is registered and/or programmed as required, identity and emergency-contact data are current, and vessel displays/radios support the advertised AIS or DSC function.",
  "Use only the maker's self-test procedure and interval—never transmit a live distress alert as a test. Check test result, battery or service expiry, seals, antenna, attachment, and any stated replacement after activation or excessive testing.",
  "Install or attach the beacon exactly as approved for the combined beacon and lifejacket. It must remain retained and deploy or activate as intended without puncturing, snagging, obstructing, or otherwise impairing lifejacket inflation, oral inflation, light, sprayhood, or recovery fittings.",
] as const;

export const lifejacketEmergencySources = [
  {
    id: "rya-lifejacket-guidance",
    label: "RYA: Life Jackets and Buoyancy Aids",
    href: "https://www.rya.org.uk/water-safety/lifejacket-safety/lifejackets-and-buoyancy-aids/",
    scope: "Current recreational guidance on lifejacket selection, fit, features, harness points, care, and compatible personal location equipment.",
  },
  {
    id: "mca-personal-emergency-radio-devices",
    label: "MCA: Personal Emergency Radio Devices",
    href: "https://assets.publishing.service.gov.uk/media/5a81dea8ed915d74e34007fb/10672-MCGA-Personal-Emergency-Radio-Devices.pdf",
    scope: "Official comparison of 406 MHz Cospas-Sarsat, AIS, DSC, and homing alert paths; activity selection, manufacturer setup/attachment instructions, and manufacturer-prescribed testing only. It does not establish a particular model's capabilities or battery life.",
  },
  {
    id: "mca-register-406-beacons",
    label: "MCA: Register a UK 406 MHz beacon",
    href: "https://www.gov.uk/register-406-beacons",
    scope: "Current UK registration and update service, required identity, emergency-contact, and vessel/radio details; not a source for AIS-MOB registration or product installation.",
  },
  {
    id: "mca-mgn-665-amendment-1",
    label: "MCA MGN 665 (M+F) Amendment 1: EPIRB and PLB registration",
    href: "https://www.gov.uk/government/publications/mgn-665-mf-amendment-1-mandatory-registration-of-epirbs-and-plbs/mgn-665-mf-amendment-1-mandatory-registration-of-epirbs-and-plbs-used-on-uk-registered-ships-hovercraft-and-watercraft",
    scope: "Current UK legal scope for registering carried 406 MHz PLBs, 406 MHz satellite alerting, GNSS coding context, and keeping details current; not evidence of AIS or DSC capability.",
  },
  {
    id: "cospas-sarsat-system-documents",
    label: "Cospas-Sarsat: official system documents",
    href: "https://www.cospas-sarsat.int/en/documents-pro/system-documents",
    scope: "Primary system specifications and beacon-regulation handbook for compliant 406 MHz distress beacons; technical reference, not consumer installation instructions for a lifejacket.",
  },
  {
    id: "maib-safety-digest-2012-1-case-26",
    label: "MAIB Safety Digest 1/2012, case 26",
    href: "https://assets.publishing.service.gov.uk/media/547c6f8ce5274a428d0000b7/Safety_Digest_1-2012.pdf",
    scope: "Accident lesson on recovery difficulty and the importance of knowing and using the lifejacket's intended lifting arrangement.",
  },
  {
    id: "world-sailing-osr-2026-2027-5-01",
    label: "World Sailing Offshore Special Regulations 2026–2027, section 5.01",
    href: "https://media.sailing.org/sailing/wp-content/uploads/2025/12/05110802/WS_Offshore_Special-Regulations_2026-2027_v1_wcover.pdf",
    scope: "Offshore-racing personal-flotation requirements within stated race categories; a useful benchmark, not universal law for leisure Day Skipper passages.",
  },
] as const;

export const lifejacketEmergencyReview = {
  contentVersion: "2026-08-12",
  sourceCheckedOn: "2026-08-12",
  sourceIds: lifejacketEmergencySources.map((source) => source.id),
  reviewScope: "Emergency-feature and recovery claims were compared with the listed RYA guidance and MAIB accident lesson; racing scope with World Sailing OSR; beacon alert-path, registration, and testing claims with the listed Cospas-Sarsat and MCA material. No individual beacon manual or lifejacket/beacon pairing was reviewed, so model capability, battery/expiry limits, programming, and installation remain manufacturer- and vessel-specific.",
  qualifiedReview: { status: "pending", reviewerName: null, qualification: null, approvedOn: null, reviewedCommit: null },
  releaseNote: "No qualified practitioner approval is recorded. This is proportionate Day Skipper learning guidance, not certification of a lifejacket, beacon installation, or recovery system.",
} as const;

// ── Safety Equipment Topics ────────────────────────────────────────────────

export interface SafetyEquipmentTopic {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly keyPoints: readonly string[];
}

export const safetyEquipmentTopics: readonly SafetyEquipmentTopic[] = [
  {
    id: "servicing",
    name: "Servicing & Maintenance Schedule",
    description:
      "Lifejackets need routine checks and servicing at the intervals specified on the product label and in the current manufacturer instructions. Legal requirements for regulated vessels are a separate minimum and may be more prescriptive.",
    keyPoints: [
      "Read the product label and current manual before checking, testing, servicing, or re-arming the lifejacket; intervals, parts, and procedures are manufacturer-specific.",
      "Keep owner checks within the procedures the manufacturer assigns to the owner; use an approved service station for specified service work and defects.",
      "Check the next service date and component expiry dates before each passage and record completed work.",
      "Apply any separate commercial, coding, flag-state, or SOLAS requirements that govern the vessel and equipment.",
    ],
  },
  {
    id: "crotch-straps",
    name: "Crotch Straps",
    description:
      "A crotch strap (or leg strap) passes between the legs and prevents the life jacket from riding up over the wearer's head when in the water. Without a crotch strap, wave action and the buoyancy of the jacket can push it upward, leaving the wearer's face unprotected.",
    keyPoints: [
      "Always fasten the crotch strap before going on deck — a life jacket without a crotch strap can ride up and slip off in the water.",
      "Most modern 150N and 275N life jackets include a crotch strap or a thigh strap as standard.",
      "Adjust the strap so the life jacket sits snugly on the torso with no slack — it should be firm but not restrictive.",
      "Check the crotch strap buckle is secure and not corroded during each pre-passage safety check.",
    ],
  },
  {
    id: "harnesses-tethers",
    name: "Harnesses & Tethers",
    description:
      "A correctly selected harness and tether attach the wearer to the boat's verified, purpose-designed strongpoints or jackstays. Arrange the whole system to keep the wearer aboard wherever practicable: a person who passes the deck edge can be dragged alongside, unable to breathe, and drown before recovery succeeds.",
    keyPoints: [
      "For recreational sailing, follow the harness, tether, lifejacket, and boat manufacturers' instructions and the skipper's passage-specific plan. ISO 12401 is a product standard for deck safety harnesses and safety lines; a product marking does not verify the boat's strongpoints or make every arrangement safe.",
      "A two-ended tether has a harness attachment and one working attachment to the boat. It cannot provide continuous attachment while moving past an obstruction: transfer only at a place and by a method in the boat's plan that does not require momentary unclipping.",
      "A three-point tether adds a second working leg or intermediate hook. For continuous transfer, clip the free working hook to the next verified point, close and physically tug it to confirm engagement, then release the previous hook; never describe this as 'one hook at a time' unless the tether actually has two working hooks.",
      "Choose the shortest suitable working leg and inboard route that still permits the task. Plan movement and attachment so a fall is arrested on deck wherever practicable, rather than merely shortening the distance a person is dragged in the water.",
      "Use compatible self-closing hooks as the product instructions specify. After clipping, look at the connection and tug it; keep the hook gate clear, aligned to load through its intended axis, and away from fittings or webbing that could snag, lever it open, or side-load it.",
      "Clip on before leaving the companionway at night, in rough weather, or whenever the skipper calls for harnesses.",
      "Attach only to purpose-designed strongpoints or jackstays verified for the boat and oriented for the expected load. Do not improvise with guardrails, stanchions, ordinary cleats, or other convenient fittings unless the boat manufacturer or a competent documented assessment identifies that exact point for tether loads.",
      "Before use, inspect webbing, stitching, hooks, gates, corrosion, deformation, labels, and any overload indicator. Retire the tether immediately after it arrests a fall or takes a significant load, when an indicator deploys, or whenever damage or loading history is in doubt; replace or return it for manufacturer-authorised assessment rather than resetting an indicator.",
      "Brief and practise a vessel-specific tethered-MOB recovery: stop and control the boat, prevent propeller exposure and continued dragging, support the casualty's airway, and use a prepared retrieval method. The tether keeps attachment; it does not by itself recover a person aboard.",
      "World Sailing Offshore Special Regulations add requirements for offshore racing within their stated categories, including safety-line hook, intermediate-attachment, and overload provisions. Treat those as racing rules in scope, not as universal law for every recreational passage.",
    ],
  },
  {
    id: "jacklines",
    name: "Jacklines",
    description:
      "Jacklines (also called jackstays) are purpose-designed lines or webbing and terminations forming part of the boat's tether system. Their route, strength, stretch, end attachments, and compatibility with the tether must be verified for the boat; the aim is to keep a falling wearer aboard wherever practicable.",
    keyPoints: [
      "Rig and use only the purpose-designed jackstay arrangement identified by the boat manufacturer or a competent documented design, including its dedicated end strongpoints, fastenings, material, tension, replacement limits, and any separate cockpit working points.",
      "Route jackstays as far inboard or centrally as the verified design permits. Check the combined jackstay deflection, tether length, body position, and task at every working area; an inboard route alone does not prove the wearer cannot pass the deck edge.",
      "Do not treat a bow or stern cleat as a jackstay anchorage merely because it is strong for mooring. Loading direction, structure, termination geometry, and interaction with the tether hook must all be suitable for the specified fall load.",
      "Flat webbing can reduce rolling underfoot compared with wire, but material choice is installation-specific. Avoid routes where webbing twists, hooks snag or bear sideways, and protect against chafe, heat, chemicals, UV exposure, and sharp edges.",
      "Inspect the complete system before use and after severe weather or any load: jackstay, stitching or splices, knots only where specified, end fittings, backing structure, tension, chafe, deterioration, and labels. Withdraw it after overload, damage, expired life, or doubt according to its instructions.",
      "Rig the verified system before it is needed and brief where crew clip on before leaving shelter, where transfers occur, which tether leg to use, and how the tethered-casualty recovery plan works.",
    ],
  },
  {
    id: "kill-cords",
    name: "Kill Cords (Engine Cut-Off Devices)",
    description:
      "A kill cord is a lanyard between the helm operator and the engine's emergency stop switch. If the operator is thrown away from the controls, it should operate the switch and stop the engine, reducing the risk of an uncontrolled powered craft and propeller injury.",
    keyPoints: [
      "Follow the engine and boat manufacturers' instructions for the correct cord, attachment point, checks, and replacement interval. Using the kill cord whenever the engine is running is essential safe practice; separate statutory or coded-vessel requirements may also apply, so check the rules for the vessel and waters.",
      "Attach it to the operator at the purpose-designed point specified by the manufacturer, securely enough that it cannot slip off or detach during normal helm movement. Do not assume that a loose loop around a bare wrist, clothing, or an ordinary lifejacket or harness D-ring is suitable: use a D-ring or other point only when its manufacturer identifies it for kill-cord attachment.",
      "Before setting off, start the engine as directed and test the cut-off system by operating the kill cord; confirm the engine stops, then refit it correctly before restarting. Repeat the applicable check after changing helm operator, cord, switch, or helm arrangement, following the manufacturers' procedure.",
      "When handing over the helm, stop or control the boat as instructed, transfer or reconnect the kill cord securely to the new operator, and verify the connection before they take control.",
      "Inspect the cord, clip, fittings, and switch before use for cuts, stretching, loss of recoil, corrosion, stiffness, or other damage. Replace suspect or time-expired parts with the specified type; never knot, extend, or improvise a repair unless the manufacturer expressly permits it.",
      "Carry the correct serviceable spare where it is accessible but cannot foul the controls. A spare supports recovery after a loss or failure; it must not be left fitted to defeat the cut-off switch or used to keep the engine running without the operator attached.",
      "Kill cords are especially critical on RIBs, tenders, and open boats where the risk of being thrown from the helm is highest.",
    ],
  },
];
