export interface SailControl {
  id: string;
  name: string;
  aka?: string;
  description: string;
  purpose: string;
  location: string;
  effect: string;
  category: "Running rigging" | "Deck hardware" | "Standing-rigging adjustment";
  color: string;
}

export const sailControls: readonly SailControl[] = [
  {
    id: "main-halyard",
    name: "Main Halyard",
    description:
      "The line used to raise and lower the mainsail. It runs from the head (top) of the sail, up through the masthead, and back down to the deck.",
    purpose: "Raises and lowers the mainsail",
    location: "Head of mainsail → masthead sheave → mast, deck or cockpit cleat/clutch",
    effect: "Raises/lowers the sail; added tension removes luff wrinkles and moves draft forward.",
    category: "Running rigging",
    color: "#3b82f6",
  },
  {
    id: "jib-halyard",
    name: "Jib Halyard",
    description:
      "The line used to raise and lower the jib or genoa. Its tension adjusts luff tension and draft position; the correct setting depends on conditions and the sail.",
    purpose: "Raises and lowers the headsail (jib/genoa)",
    location: "Head of headsail → mast sheave → mast, deck or cockpit cleat/clutch",
    effect: "More tension removes luff wrinkles and moves draft forward; too much can over-flatten the sail.",
    category: "Running rigging",
    color: "#06b6d4",
  },
  {
    id: "mainsheet",
    name: "Mainsheet",
    description:
      "The primary running line for mainsail trim. It acts through blocks between the boom and boat, often via a traveller, for mechanical advantage.",
    purpose: "Controls mainsail angle and, especially upwind, leech tension and twist",
    location: "Boom → blocks → traveller or cockpit floor",
    effect: "Trim brings the boom in and usually tightens the leech; ease lets the boom out and increases twist unless the vang restrains it.",
    category: "Running rigging",
    color: "#ec4899",
  },
  {
    id: "jib-sheet",
    name: "Jib Sheet",
    aka: "Jib Sheets (port & starboard)",
    description:
      "Two lines, one on each side, used to trim the jib. The working sheet is normally on the leeward side; during a tack it is eased as the new sheet is trimmed.",
    purpose: "Controls the angle of the jib/genoa",
    location: "Clew of jib → fairlead/car → winch → cleat",
    effect: "Trim or ease to set angle, depth and twist for the course and lead position; over-trimming closes the leech and can stall airflow.",
    category: "Running rigging",
    color: "#f59e0b",
  },
  {
    id: "boom-vang",
    name: "Boom Vang",
    aka: "Kicking Strap (UK)",
    description:
      "On this diagram, an adjustable tackle between the boom and mast base. It controls boom rise and sail twist, especially when the mainsheet is eased off the wind.",
    purpose: "Prevents boom from rising, controls sail twist",
    location: "Boom (near gooseneck) → mast base",
    effect: "Tighten: boom rises less and leech twist decreases. Ease: the upper leech can open more.",
    category: "Running rigging",
    color: "#ef4444",
  },
  {
    id: "outhaul",
    name: "Outhaul",
    description:
      "Controls the tension along the foot (bottom edge) of the mainsail. Adjusts the amount of draft (belly) in the lower part of the sail.",
    purpose: "Flattens or adds fullness to lower mainsail",
    location: "Mainsail clew → along or inside boom → cleat/clutch",
    effect: "Tighten: flatter (heavy air). Ease: fuller (light air, power).",
    category: "Running rigging",
    color: "#8b5cf6",
  },
  {
    id: "cunningham",
    name: "Cunningham",
    description:
      "A dedicated luff-tension control led through a Cunningham cringle above the tack. Unlike a conventional mainsail downhaul, it tensions the sail without pulling the boom or sliding gooseneck down.",
    purpose: "Moves draft forward, tensions luff",
    location: "Cringle near tack → deck fitting/cleat",
    effect: "Tighten: draft moves forward (heavy air). Ease: draft moves aft.",
    category: "Running rigging",
    color: "#22c55e",
  },
  {
    id: "topping-lift",
    name: "Topping Lift",
    description:
      "On this diagram, an adjustable line from the masthead to the aft end of the boom. It supports the boom when the sail is lowered or while reefing.",
    purpose: "Supports the boom when mainsail is down",
    location: "Aft end of boom → masthead fitting → mast or cockpit cleat",
    effect: "Holds boom up without mainsail. Ease when sailing (or vang takes over).",
    category: "Running rigging",
    color: "#64748b",
  },
  {
    id: "reefing-lines",
    name: "Reefing Lines",
    description:
      "Controls used to reduce mainsail area. Arrangements vary: separate tack and clew controls, single-line systems, hooks or other fittings may secure the reef cringles.",
    purpose: "Reduces mainsail area for heavy weather",
    location: "Vessel-specific: reef tack and clew cringles → boom/deck hardware → mast or cockpit",
    effect: "Loaded reef controls secure the new tack and clew. Reef-point ties only gather loose sail; they must not carry sail load.",
    category: "Running rigging",
    color: "#f97316",
  },
  {
    id: "traveller",
    name: "Mainsheet Traveller",
    description:
      "A track across the cockpit that allows the mainsheet attachment point to slide from side to side. Controls boom angle without changing mainsheet tension.",
    purpose: "Positions the mainsheet attachment point across the boat",
    location: "Track across cockpit or coachroof, behind helmsman",
    effect: "Windward brings the boom toward centre. Leeward lets the boom and sail plan move off centre, reducing angle of attack, power and heel while largely retaining mainsheet-set leech tension; exact response depends on geometry.",
    category: "Deck hardware",
    color: "#475569",
  },
  {
    id: "jib-fairlead",
    name: "Jib Fairlead",
    aka: "Jib Lead / Car",
    description:
      "An adjustable fitting on a track that guides the jib sheet at the correct angle. Position affects the balance between leech and foot tension.",
    purpose: "Sets the angle of pull on the jib sheet",
    location: "Track on deck, between clew and winch",
    effect: "Forward increases leech tension and eases the foot; aft tightens the foot and opens the leech. Use telltales for balanced trim.",
    category: "Deck hardware",
    color: "#78716c",
  },
  {
    id: "backstay-adjuster",
    name: "Backstay Adjuster",
    description:
      "An adjuster for a load-bearing part of the standing rigging. On suitable rigs it changes backstay load, mast bend and forestay sag; response varies with rig design.",
    purpose: "Adjusts rig load, mast bend and forestay sag where the rig permits",
    location: "Lower part of backstay, near deck",
    effect: "On a typical masthead sloop, tightening reduces forestay sag and often bends the mast to flatten and open the mainsail; follow the boat's limits.",
    category: "Standing-rigging adjustment",
    color: "#1e3a5f",
  },
];

