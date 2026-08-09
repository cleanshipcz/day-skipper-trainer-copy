export interface RigCheck {
  id: string;
  area: string;
  item: string;
  lookFor: string;
  acceptableEvidence: string;
  limitations: string;
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
    acceptableEvidence: "A documented comparison with the fitted rig plan and maker criteria shows no new damage or change; dated photographs and tension records identify the same stay, material and conditions.",
    limitations: "A deck-level view cannot prove the core, internal corrosion, fatigue life, masthead attachment or terminal interior sound.",
    boundary: "Any broken wire/fibre, kink, cracked terminal or unexplained loss/change of support is no-sail. Keep clear of sharp ends and the loaded rig; secure and unload only under a competent plan.", checked: false,
  },
  {
    id: "turnbuckles", area: "Standing Rigging", item: "Turnbuckles / Bottlescrews & Terminals",
    lookFor: "Cracks, bending, corrosion, pulled/swaged-terminal change and missing or ineffective pins, rings, locknuts or other specified retention. Verify thread engagement, body extension, articulation and locking against the fitted maker's instructions—neither 'no threads showing' nor one locking method is universal.",
    acceptableEvidence: "The identified terminal matches its maker drawing and prior record, with specified articulation, engagement and intact retention and no crack, distortion, corrosion run or pull-out witness mark.",
    limitations: "A smooth exterior does not reveal internal swage cracking, crevice corrosion or fatigue; thread count alone is not evidence without the maker limit.",
    boundary: "Do not adjust a loaded fitting or improvise retention. A crack, distortion, loose/missing retention or uncertain engagement is no-sail pending competent assessment.", checked: false,
  },
  {
    id: "chainplates", area: "Standing Rigging", item: "Chainplates & Supporting Structure",
    lookFor: "Accessible chainplate, fastener, seal and surrounding deck/bulkhead evidence: cracks, distortion, corrosion staining, leaks, delamination/softness and abnormal movement under changing load. Tight-looking bolts do not prove hidden backing, knees or laminate sound.",
    acceptableEvidence: "Dated, item-identified comparison shows a dry, stable attachment with no new staining, cracking, softness, distortion or movement, supported by required competent inspection records.",
    limitations: "Covers, sealant and apparently tight fasteners can hide crevice corrosion, wet core, failed backing, knees or laminate.",
    boundary: "Crack, distortion, abnormal movement, active leak with structural uncertainty, or inaccessible/uncertain support is no-sail. Do not simply tighten fasteners; unload, secure and refer structural and chainplate assessment to competent people.", checked: false,
  },
  {
    id: "mast-base", area: "Mast", item: "Mast Step / Base & Partners",
    lookFor: "Accessible step, heel, partners, compression structure and drains for cracking, corrosion, displacement, water damage, distortion or movement. Compare mast position and chocking/sealing with vessel and mast-maker records.",
    acceptableEvidence: "The mast position and accessible support match the rig plan and baseline record; drains are clear and there is no new movement, cracking, deformation, corrosion or water damage.",
    limitations: "Joinery, liners and tanks may conceal compression-post, beam, fastener and laminate condition.",
    boundary: "Movement, cracking, distortion or uncertain hidden compression/support structure is no-sail. Keep the rig supported and obtain structural and rigging assessment.", checked: false,
  },
  {
    id: "spreaders", area: "Mast", item: "Spreaders & Mast Fittings",
    lookFor: "From deck, look for asymmetry, movement, cracks, corrosion, damaged roots/tips and chafe. Spreader sweep, dihedral, tip attachment and stay contact are configuration-specific; confirm them from the mast/rig plan rather than a remembered angle.",
    acceptableEvidence: "Both sides match the identified mast/rig plan and dated baseline, with no new asymmetry, movement, damage or chafe visible from deck.",
    limitations: "Perspective can mislead and a deck view cannot clear roots, pins, internal fasteners or masthead fittings.",
    boundary: "Do not climb to investigate. Suspected movement, crack, displaced spreader or damaged attachment requires the rig secured and a competent close inspection before sailing.", checked: false,
  },
  {
    id: "halyards", area: "Mast", item: "Halyards & Aloft Leads",
    lookFor: "At deck level and unloaded where practicable, inspect accessible rope/wire, splices, shackles, sheaves and exits for chafe, broken fibres/wires, heat, corrosion, jamming and correct maker-specified retention.",
    acceptableEvidence: "The identified line follows the rig plan, runs freely during an authorised low-load check and its accessible cover, splice and attachment meet maker criteria without new wear.",
    limitations: "Mast-internal sections, sheaves and aloft terminations remain unseen; a free-running line does not prove their condition.",
    boundary: "Keep hands, hair and clothing out of sheaves and winches; loaded lines store energy and can recoil. Aloft work needs a competent plan, independent fall protection, reliable communication and controlled tools—never a halyard-only casual lift.", checked: false,
  },
  {
    id: "mainsail", area: "Sails", item: "Mainsail & Reefing System",
    lookFor: "With sail and boom controlled, inspect accessible cloth, seams, slides/cars, battens, reef points and lines for tears, chafe, distortion, missing retention and routing against the sail/reefing instructions.",
    acceptableEvidence: "With the system depowered, sail and reefing components match the sailmaker/vessel plan, show no new tear, failed stitching, distortion or missing retention, and pass an authorised low-load function check.",
    limitations: "Folds, covers and loaded shape can hide damage; a deck check does not establish remaining cloth or stitching strength.",
    boundary: "Avoid working beneath or in the swing arc of an unsupported boom. Depower and secure sail and boom before handling; do not test a jam by loading it harder.", checked: false,
  },
  {
    id: "jib", area: "Sails", item: "Headsail / Furling System",
    lookFor: "Identify hanked, foil or furler configuration. Inspect accessible sail, luff attachments, swivel/drum, forestay area and sheets for damage, halyard wrap evidence, poor lead or missing retention against the fitted maker's instructions.",
    acceptableEvidence: "The identified configuration matches its plan; accessible attachments and sail are intact and an authorised depowered/low-load operation is smooth without wrap, override or abnormal movement.",
    limitations: "The foil can hide the forestay, and drum, swivel and upper termination internals are not cleared by smooth operation.",
    boundary: "Depower and control the sail before approach. A damaged forestay/furler, jam, abnormal movement or uncertain retention is no-sail; do not apply winch force to clear it.", checked: false,
  },
  {
    id: "sail-covers", area: "Sails", item: "Covers, Lazyjacks & Loose Gear",
    lookFor: "Confirm covers and loose gear are removed or secured for the intended operation; inspect lazyjacks, stack-pack and attachments for chafe, snagging and configuration-specific stowage.",
    acceptableEvidence: "A deliberate walk-round accounts for each cover and loose item; intended-to-remain gear is secured and documented leads are clear of snag and chafe points.",
    limitations: "A tidy-looking deck can conceal loose items in lockers or a lazyjack snag on the far side or aloft.",
    boundary: "Control the boom and avoid its fall/swing zone. Never reach aloft or stand on an unprotected cabin top to free a snag.", checked: false,
  },
  {
    id: "sheets", area: "Running Rigging", item: "Sheets & Control Lines",
    lookFor: "Correct identification and lead for the fitted sail plan; accessible rope, splices and attachments free of severe chafe, glazing, cuts or contamination. End-stopper choice and tail length are vessel/task-specific and must not defeat emergency release.",
    acceptableEvidence: "Each labelled line follows the vessel lead plan, is clear to run, has suitable controlled tails and shows no wear beyond the maker/vessel retirement criteria.",
    limitations: "Clutches, organisers, covers and loaded sections hide wear; colour and apparent diameter do not prove line identity or specification.",
    boundary: "Keep out of bights and snap-back paths; never wrap a line around a hand or body. Ease loads under control and follow the vessel procedure for a jammed or overridden line.", checked: false,
  },
  {
    id: "blocks", area: "Running Rigging", item: "Blocks, Tracks, Cleats & Winches",
    lookFor: "Cracks, corrosion, sharp edges, loose or missing fasteners/retention, distorted tracks and abnormal movement. Check operation only unloaded or under the maker/vessel procedure; deck fasteners do not reveal hidden backing condition.",
    acceptableEvidence: "Identified hardware matches its plan and service record, has intact specified retention and no new crack, edge, corrosion, distortion or movement during an authorised unloaded/low-load check.",
    limitations: "Deck backing, bedding, bearings and internal pawls may remain hidden; operation is not proof of safe working load.",
    boundary: "Do not put fingers in blocks, clutches or self-tailing jaws, and do not service loaded equipment. Winches multiply force: use correct turns/handle technique and stop for movement, cracking, override or uncertain backing.", checked: false,
  },
  {
    id: "boom", area: "Running Rigging", item: "Boom, Gooseneck & Kicker / Vang",
    lookFor: "Accessible gooseneck, boom, kicker/vang, topping lift and preventer attachments for cracks, distortion, corrosion, missing retention, chafe and abnormal movement; verify reefing and support arrangement against the fitted plan.",
    acceptableEvidence: "With the boom positively controlled, components and leads match the fitted plan and dated baseline, retention is effective and there is no new crack, distortion, chafe or movement.",
    limitations: "Fittings and covers can hide fasteners, internal corrosion and fatigue; a topping lift alone may not be an adequate maintenance support.",
    boundary: "Depower and support the boom before inspection; keep people outside its swing and drop zones. Cracking, distortion, missing retention or abnormal movement means unload, secure and do not sail until assessed.", checked: false,
  },
];

export const rigSources = [
  { id: "mca-coswp", label: "UK MCA Code of Safe Working Practices for Merchant Seafarers (2026 edition): work aloft, ropes and lifting hazards", href: "https://www.gov.uk/government/publications/code-of-safe-working-practices-for-merchant-seafarers-2026-edition" },
  { id: "hse-height", label: "UK HSE: Work at height—planning, competence and fall protection", href: "https://www.hse.gov.uk/work-at-height/index.htm" },
  { id: "hse-lines", label: "UK HSE GS6: Avoiding danger from overhead power lines", href: "https://www.hse.gov.uk/pubns/gs6.htm" },
  { id: "selden", label: "Seldén Mast: Hints and advice / rigging instructions (configuration-specific maker example)", href: "https://support.seldenmast.com/en/services/manuals/rigging_instructions.html" },
  { id: "world-sailing", label: "World Sailing Offshore Special Regulations: rig inspection and structural requirements for participating vessels", href: "https://www.sailing.org/tools/documents/OSR20262027v1-[30715].pdf" },
] as const;
