export interface RigCheck {
  id: string;
  area: string;
  item: string;
  lookFor: string;
  checked: boolean;
}

export const rigChecks: RigCheck[] = [
  // Standing Rigging
  {
    id: "shrouds",
    area: "Standing Rigging",
    item: "Shrouds & Stays",
    lookFor: "Broken strands, rust, correct tension, secure fittings",
    checked: false,
  },
  {
    id: "turnbuckles",
    area: "Standing Rigging",
    item: "Turnbuckles/Bottlescrews",
    lookFor: "Split pins secure, no cracks, threads not showing",
    checked: false,
  },
  {
    id: "chainplates",
    area: "Standing Rigging",
    item: "Chainplates",
    lookFor: "No cracks, corrosion, or movement, bolts tight",
    checked: false,
  },

  // Mast
  {
    id: "mast-base",
    area: "Mast",
    item: "Mast Step/Base",
    lookFor: "Secure, no cracks, drain clear",
    checked: false,
  },
  {
    id: "spreaders",
    area: "Mast",
    item: "Spreaders",
    lookFor: "Secure, no cracks, tips protected, correct angle",
    checked: false,
  },
  {
    id: "halyards",
    area: "Mast",
    item: "Halyards",
    lookFor: "Run freely, no chafe, shackles secure",
    checked: false,
  },

  // Sails
  {
    id: "mainsail",
    area: "Sails",
    item: "Mainsail",
    lookFor: "No tears, slides/slugs secure, reefing lines OK",
    checked: false,
  },
  {
    id: "jib",
    area: "Sails",
    item: "Jib/Genoa",
    lookFor: "No tears, hanks/furler OK, sheets attached",
    checked: false,
  },
  {
    id: "sail-covers",
    area: "Sails",
    item: "Sail Covers",
    lookFor: "Remove and stow securely before sailing",
    checked: false,
  },

  // Running Rigging
  {
    id: "sheets",
    area: "Running Rigging",
    item: "Sheets",
    lookFor: "No fraying, correct lead, ends figure-eighted",
    checked: false,
  },
  {
    id: "blocks",
    area: "Running Rigging",
    item: "Blocks & Cleats",
    lookFor: "Run freely, secure fixings, no cracks",
    checked: false,
  },
  {
    id: "boom",
    area: "Running Rigging",
    item: "Boom",
    lookFor: "Gooseneck secure, kicker/vang OK, reefing lines rigged",
    checked: false,
  },
];
