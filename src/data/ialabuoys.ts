/**
 * IALA Region A buoyage system data.
 *
 * Covers all buoy types a Day Skipper student must know:
 * lateral marks (port/starboard), cardinal marks (N/E/S/W),
 * isolated danger, safe water, special marks, and new danger marks.
 *
 * Each entry includes name, colour scheme, top mark shape,
 * light characteristic, meaning, a visual descriptor, and
 * (for cardinal marks) the clock-face mnemonic for light patterns.
 *
 * @see docs/FEATURE_TASKS.md — Story E2-S1, AC-2, AC-4
 */

/** Valid buoy category types in the IALA Region A system. */
export type BuoyCategory =
  | "lateral"
  | "cardinal"
  | "isolated-danger"
  | "safe-water"
  | "special"
  | "new-danger";

export const BUOY_CATEGORIES = {
  LATERAL: "lateral",
  CARDINAL: "cardinal",
  ISOLATED_DANGER: "isolated-danger",
  SAFE_WATER: "safe-water",
  SPECIAL: "special",
  NEW_DANGER: "new-danger",
} as const satisfies Record<string, BuoyCategory>;

/** Unique identifier for each buoy entry. */
export type BuoyId =
  | "lateral-port"
  | "lateral-starboard"
  | "lateral-port-preferred"
  | "lateral-starboard-preferred"
  | "cardinal-north"
  | "cardinal-east"
  | "cardinal-south"
  | "cardinal-west"
  | "isolated-danger"
  | "safe-water"
  | "special-mark"
  | "new-danger-mark";

export interface IalaBuoy {
  readonly id: BuoyId;
  readonly name: string;
  readonly category: BuoyCategory;
  readonly colour: string;
  readonly topMarkShape: string;
  readonly lightCharacteristic: string;
  readonly meaning: string;
  readonly visualDescriptor: string;
  /** Clock-face mnemonic for cardinal marks — null for non-cardinal buoys. */
  readonly clockFaceMnemonic?: string;
}

export const ialaBuoys: readonly IalaBuoy[] = [
  // ── Lateral Marks ───────────────────────────���──────────────────────────
  {
    id: "lateral-port",
    name: "Port Lateral Mark",
    category: "lateral",
    colour: "Red (can shape)",
    topMarkShape: "Red can (cylinder)",
    lightCharacteristic: "Red, any rhythm",
    meaning: "Marks the port (left) side of a channel when entering from seaward. Keep to your left when heading into harbour.",
    visualDescriptor: "Red can-shaped buoy with flat top. Top mark: red cylinder.",
  },
  {
    id: "lateral-starboard",
    name: "Starboard Lateral Mark",
    category: "lateral",
    colour: "Green (conical shape)",
    topMarkShape: "Green cone (point up)",
    lightCharacteristic: "Green, any rhythm",
    meaning: "Marks the starboard (right) side of a channel when entering from seaward. Keep to your right when heading into harbour.",
    visualDescriptor: "Green conical buoy with pointed top. Top mark: green cone point up.",
  },
  {
    id: "lateral-port-preferred",
    name: "Port Preferred Channel Mark",
    category: "lateral",
    colour: "Red with green horizontal band",
    topMarkShape: "Red can (cylinder)",
    lightCharacteristic: "Red, Fl(2+1)R",
    meaning: "At a channel junction, the preferred channel is to starboard. Treat as a port mark for the main channel.",
    visualDescriptor: "Red can-shaped buoy with a green horizontal band. Top mark: red cylinder.",
  },
  {
    id: "lateral-starboard-preferred",
    name: "Starboard Preferred Channel Mark",
    category: "lateral",
    colour: "Green with red horizontal band",
    topMarkShape: "Green cone (point up)",
    lightCharacteristic: "Green, Fl(2+1)G",
    meaning: "At a channel junction, the preferred channel is to port. Treat as a starboard mark for the main channel.",
    visualDescriptor: "Green conical buoy with a red horizontal band. Top mark: green cone point up.",
  },

  // ── Cardinal Marks ─────────────────────────────────────────────────────
  {
    id: "cardinal-north",
    name: "North Cardinal Mark",
    category: "cardinal",
    colour: "Black over yellow (black on top)",
    topMarkShape: "Two black cones, both pointing UP",
    lightCharacteristic: "White, VQ or Q (continuous)",
    meaning: "Pass to the NORTH of this mark. Danger lies to the south.",
    visualDescriptor: "Pillar or spar buoy, black top half over yellow bottom half. Top mark: two black cones points up (▲▲).",
    clockFaceMnemonic: "North = 12 o'clock = continuous quick flashes (VQ or Q). Think: 12 is at the top, flashes never stop.",
  },
  {
    id: "cardinal-east",
    name: "East Cardinal Mark",
    category: "cardinal",
    colour: "Black with yellow horizontal band (black-yellow-black)",
    topMarkShape: "Two black cones, base to base (diamond shape)",
    lightCharacteristic: "White, VQ(3) every 5s or Q(3) every 10s",
    meaning: "Pass to the EAST of this mark. Danger lies to the west.",
    visualDescriptor: "Pillar or spar buoy, black-yellow-black horizontal bands. Top mark: two black cones base-to-base (◆).",
    clockFaceMnemonic: "East = 3 o'clock = 3 flashes. Think: 3 o'clock on the clock face.",
  },
  {
    id: "cardinal-south",
    name: "South Cardinal Mark",
    category: "cardinal",
    colour: "Yellow over black (yellow on top)",
    topMarkShape: "Two black cones, both pointing DOWN",
    lightCharacteristic: "White, VQ(6)+LFl every 10s or Q(6)+LFl every 15s",
    meaning: "Pass to the SOUTH of this mark. Danger lies to the north.",
    visualDescriptor: "Pillar or spar buoy, yellow top half over black bottom half. Top mark: two black cones points down (▼▼).",
    clockFaceMnemonic: "South = 6 o'clock = 6 flashes followed by one long flash. Think: 6 o'clock on the clock face, the long flash distinguishes it.",
  },
  {
    id: "cardinal-west",
    name: "West Cardinal Mark",
    category: "cardinal",
    colour: "Yellow with black horizontal band (yellow-black-yellow)",
    topMarkShape: "Two black cones, point to point (hourglass shape)",
    lightCharacteristic: "White, VQ(9) every 10s or Q(9) every 15s",
    meaning: "Pass to the WEST of this mark. Danger lies to the east.",
    visualDescriptor: "Pillar or spar buoy, yellow-black-yellow horizontal bands. Top mark: two black cones point-to-point (⧫).",
    clockFaceMnemonic: "West = 9 o'clock = 9 flashes. Think: 9 o'clock on the clock face.",
  },

  // ── Isolated Danger Mark ───────────────────────────────────────────────
  {
    id: "isolated-danger",
    name: "Isolated Danger Mark",
    category: "isolated-danger",
    colour: "Black with red horizontal band(s)",
    topMarkShape: "Two black spheres, one above the other",
    lightCharacteristic: "White, Fl(2)",
    meaning: "Marks an isolated danger with navigable water all around. Erected on, or moored directly over, the hazard.",
    visualDescriptor: "Black pillar or spar buoy with one or more red horizontal bands. Top mark: two black spheres (●●).",
  },

  // ── Safe Water Mark ────────────────────────────────────────────────────
  {
    id: "safe-water",
    name: "Safe Water Mark",
    category: "safe-water",
    colour: "Red and white vertical stripes",
    topMarkShape: "Single red sphere",
    lightCharacteristic: "White, Isophase, Occulting, or LFl every 10s; or Morse 'A' (·—)",
    meaning: "Navigable water all around. Used as centreline, mid-channel, or landfall mark. Safe to pass on either side.",
    visualDescriptor: "Spherical or pillar buoy with red and white vertical stripes. Top mark: single red sphere (●).",
  },

  // ── Special Mark ───────────────────────────────────────────────────────
  {
    id: "special-mark",
    name: "Special Mark",
    category: "special",
    colour: "Yellow",
    topMarkShape: "Single yellow X-shape (saltire)",
    lightCharacteristic: "Yellow, any rhythm (if lit)",
    meaning: "Marks a special area or feature: racing marks, outfall pipes, military exercise zones, cables, or ODAS buoys. Not primarily for navigation.",
    visualDescriptor: "Yellow buoy of any shape. Top mark: yellow X-shape (saltire). Light (if any) is yellow.",
  },

  // ── New Danger Mark ──────────────────────────────────��─────────────────
  {
    id: "new-danger-mark",
    name: "New Danger Mark",
    category: "new-danger",
    colour: "Blue and yellow vertical stripes",
    topMarkShape: "Yellow upright cross (+)",
    lightCharacteristic: "Alternating blue and yellow, Mo(L) Fl B Y (if lit)",
    meaning: "Marks a newly discovered hazard not yet shown on charts. May be duplicated until the danger is well established and charted.",
    visualDescriptor: "Pillar or spar buoy with blue and yellow vertical stripes. Top mark: upright yellow cross (+).",
  },
];
