export interface RigCheck {
  id: string;
  area: string;
  item: string;
  lookFor: string;
  boundary: string;
  checked: boolean;
}

export interface RigGuidanceSection { title: string; body: string; }

export const rigGuidance: RigGuidanceSection[] = [
  {
    title: "Scope: observe, do not certify",
    body: "This is a representative small-yacht learning review, not a complete inspection or tuning specification. Rig type, wire/rod/fibre material, terminals, mast support, deck structure and maker requirements vary. Universal observations can identify damage, looseness or change; acceptable dimensions, tension, alignment, thread engagement, locking and renewal criteria come from the current vessel, mast, rigging and fitting instructions and a competent rigger.",
  },
  {
    title: "No-sail and unload criteria",
    body: "Do not sail or load the rig after finding a broken wire, cracked or distorted fitting, missing or ineffective retention, abnormal terminal/chainplate/mast-step movement, or uncertainty about supporting structure. Keep people clear, secure the mast or boom without exposing crew to the load, unload only by a planned safe method, tell the skipper, and obtain competent assessment before reuse. Do not cut, bend or tape a sharp broken wire as a substitute for making the rig safe.",
  },
  {
    title: "Visual and post-incident inspection limits",
    body: "A deck-level visual check cannot establish internal terminal condition, fatigue, crevice corrosion, hidden chainplate knees/backing, compression structure, masthead fittings or areas behind covers and liners. Compare records and previous condition. Grounding, collision, dismasting, overload, lightning, unexplained tuning change or other significant incident requires the vessel to be secured and inspected to the maker, insurer, coding authority and competent-person requirements before return to service.",
  },
  {
    title: "Inspection and renewal timing",
    body: "There is no universal calendar life for every standing rig. Use the makers' current inspection and retirement criteria for the fitted materials and terminals, adjusted for use, environment, storage, load history and incidents, plus applicable coding, insurer and survey requirements. Record dates, findings, inaccessible areas, measurements, incidents, component identity and competent work; uncertainty is not satisfactory evidence.",
  },
  {
    title: "Before approaching the rig",
    body: "Keep the mast and rig clear of overhead electrical conductors; high voltage can arc without contact. Depower sails, control the boom, and stay outside bights, snap-back paths and suspended or stored-energy loads. Protect against sharp wire. Do not go aloft for this review: aloft access requires competent planning, independent fall protection, communication and controlled tools.",
  },
];

export const rigChecks: RigCheck[] = [
  {
    id: "shrouds", area: "Standing Rigging", item: "Shrouds & Stays",
    lookFor: "From a safe position, compare accessible wire, rod or fibre stays with their material/maker criteria: broken wires or fibres, kinks, flattening, corrosion, heat/chafe damage, displaced covers and change at terminals. Treat tension only as a recorded comparison; tuning values and measurement method are rig-specific.",
    boundary: "Any broken wire/fibre, kink, cracked terminal or unexplained loss/change of support is no-sail. Keep clear of sharp ends and the loaded rig; secure and unload only under a competent plan.", checked: false,
  },
  {
    id: "turnbuckles", area: "Standing Rigging", item: "Turnbuckles / Bottlescrews & Terminals",
    lookFor: "Cracks, bending, corrosion, pulled/swaged-terminal change and missing or ineffective pins, rings, locknuts or other specified retention. Verify thread engagement, body extension, articulation and locking against the fitted maker's instructions—neither 'no threads showing' nor one locking method is universal.",
    boundary: "Do not adjust a loaded fitting or improvise retention. A crack, distortion, loose/missing retention or uncertain engagement is no-sail pending competent assessment.", checked: false,
  },
  {
    id: "chainplates", area: "Standing Rigging", item: "Chainplates & Supporting Structure",
    lookFor: "Accessible chainplate, fastener, seal and surrounding deck/bulkhead evidence: cracks, distortion, corrosion staining, leaks, delamination/softness and abnormal movement under changing load. Tight-looking bolts do not prove hidden backing, knees or laminate sound.",
    boundary: "Crack, distortion, abnormal movement, active leak with structural uncertainty, or inaccessible/uncertain support is no-sail. Do not simply tighten fasteners; unload, secure and refer structural and chainplate assessment to competent people.", checked: false,
  },
  {
    id: "mast-base", area: "Mast", item: "Mast Step / Base & Partners",
    lookFor: "Accessible step, heel, partners, compression structure and drains for cracking, corrosion, displacement, water damage, distortion or movement. Compare mast position and chocking/sealing with vessel and mast-maker records.",
    boundary: "Movement, cracking, distortion or uncertain hidden compression/support structure is no-sail. Keep the rig supported and obtain structural and rigging assessment.", checked: false,
  },
  {
    id: "spreaders", area: "Mast", item: "Spreaders & Mast Fittings",
    lookFor: "From deck, look for asymmetry, movement, cracks, corrosion, damaged roots/tips and chafe. Spreader sweep, dihedral, tip attachment and stay contact are configuration-specific; confirm them from the mast/rig plan rather than a remembered angle.",
    boundary: "Do not climb to investigate. Suspected movement, crack, displaced spreader or damaged attachment requires the rig secured and a competent close inspection before sailing.", checked: false,
  },
  {
    id: "halyards", area: "Mast", item: "Halyards & Aloft Leads",
    lookFor: "At deck level and unloaded where practicable, inspect accessible rope/wire, splices, shackles, sheaves and exits for chafe, broken fibres/wires, heat, corrosion, jamming and correct maker-specified retention.",
    boundary: "Keep hands, hair and clothing out of sheaves and winches; loaded lines store energy and can recoil. Aloft work needs a competent plan, independent fall protection, reliable communication and controlled tools—never a halyard-only casual lift.", checked: false,
  },
  {
    id: "mainsail", area: "Sails", item: "Mainsail & Reefing System",
    lookFor: "With sail and boom controlled, inspect accessible cloth, seams, slides/cars, battens, reef points and lines for tears, chafe, distortion, missing retention and routing against the sail/reefing instructions.",
    boundary: "Avoid working beneath or in the swing arc of an unsupported boom. Depower and secure sail and boom before handling; do not test a jam by loading it harder.", checked: false,
  },
  {
    id: "jib", area: "Sails", item: "Headsail / Furling System",
    lookFor: "Identify hanked, foil or furler configuration. Inspect accessible sail, luff attachments, swivel/drum, forestay area and sheets for damage, halyard wrap evidence, poor lead or missing retention against the fitted maker's instructions.",
    boundary: "Depower and control the sail before approach. A damaged forestay/furler, jam, abnormal movement or uncertain retention is no-sail; do not apply winch force to clear it.", checked: false,
  },
  {
    id: "sail-covers", area: "Sails", item: "Covers, Lazyjacks & Loose Gear",
    lookFor: "Confirm covers and loose gear are removed or secured for the intended operation; inspect lazyjacks, stack-pack and attachments for chafe, snagging and configuration-specific stowage.",
    boundary: "Control the boom and avoid its fall/swing zone. Never reach aloft or stand on an unprotected cabin top to free a snag.", checked: false,
  },
  {
    id: "sheets", area: "Running Rigging", item: "Sheets & Control Lines",
    lookFor: "Correct identification and lead for the fitted sail plan; accessible rope, splices and attachments free of severe chafe, glazing, cuts or contamination. End-stopper choice and tail length are vessel/task-specific and must not defeat emergency release.",
    boundary: "Keep out of bights and snap-back paths; never wrap a line around a hand or body. Ease loads under control and follow the vessel procedure for a jammed or overridden line.", checked: false,
  },
  {
    id: "blocks", area: "Running Rigging", item: "Blocks, Tracks, Cleats & Winches",
    lookFor: "Cracks, corrosion, sharp edges, loose or missing fasteners/retention, distorted tracks and abnormal movement. Check operation only unloaded or under the maker/vessel procedure; deck fasteners do not reveal hidden backing condition.",
    boundary: "Do not put fingers in blocks, clutches or self-tailing jaws, and do not service loaded equipment. Winches multiply force: use correct turns/handle technique and stop for movement, cracking, override or uncertain backing.", checked: false,
  },
  {
    id: "boom", area: "Running Rigging", item: "Boom, Gooseneck & Kicker / Vang",
    lookFor: "Accessible gooseneck, boom, kicker/vang, topping lift and preventer attachments for cracks, distortion, corrosion, missing retention, chafe and abnormal movement; verify reefing and support arrangement against the fitted plan.",
    boundary: "Depower and support the boom before inspection; keep people outside its swing and drop zones. Cracking, distortion, missing retention or abnormal movement means unload, secure and do not sail until assessed.", checked: false,
  },
];

export const rigSources = [
  { id: "mca-coswp", label: "UK MCA Code of Safe Working Practices for Merchant Seafarers (2024): work aloft, ropes and lifting hazards", href: "https://www.gov.uk/government/publications/code-of-safe-working-practices-for-merchant-seafarers-coswp-2024" },
  { id: "hse-height", label: "UK HSE: Work at height—planning, competence and fall protection", href: "https://www.hse.gov.uk/work-at-height/index.htm" },
  { id: "hse-lines", label: "UK HSE GS6: Avoiding danger from overhead power lines", href: "https://www.hse.gov.uk/pubns/gs6.htm" },
  { id: "selden", label: "Seldén Mast: Hints and advice / rigging instructions (configuration-specific maker example)", href: "https://support.seldenmast.com/en/services/manuals/rigging_instructions.html" },
  { id: "world-sailing", label: "World Sailing Offshore Special Regulations: rig inspection and structural requirements for participating vessels", href: "https://www.sailing.org/tools/documents/OSR20262027v1-[30715].pdf" },
] as const;
