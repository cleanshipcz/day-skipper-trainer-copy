/**
 * Life Raft & Abandon Ship data — types, SOLAS pack contents, and
 * ordered procedure steps for the Day Skipper safety module.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S2
 */

// ── Types ────────────────────────────────────────────────────────────────

export interface LifeRaftType {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly features: readonly string[];
}

export interface SolasPackItem {
  readonly id: string;
  readonly name: string;
  readonly purpose: string;
}

export interface ProcedureStep {
  readonly id: string;
  readonly text: string;
}

// ── Life Raft Types ──────────────────────────────────────────────────────

export const lifeRaftTypes: readonly LifeRaftType[] = [
  {
    id: "coastal",
    name: "Coastal Life Raft",
    description:
      "Designed for use within 3 nautical miles of shore. Lighter and more compact than offshore models, but carries a reduced equipment pack.",
    features: [
      "Suitable for coastal passages",
      "Lighter and more compact than offshore models",
      "Basic equipment pack (no SOLAS B pack)",
      "Typically 4–8 person capacity",
      "Must be serviced annually",
    ],
  },
  {
    id: "offshore",
    name: "Offshore Life Raft",
    description:
      "Built for extended survival in open ocean conditions. Carries a full SOLAS B equipment pack and is constructed to withstand heavy weather.",
    features: [
      "Suitable for offshore and ocean passages",
      "Full SOLAS B equipment pack included",
      "Double-floor insulation against hypothermia",
      "Ballast bags to resist capsizing",
      "Canopy for weather protection and visibility (orange/red)",
      "Must be serviced annually",
    ],
  },
  {
    id: "open-reversible",
    name: "Open-Reversible Life Raft",
    description:
      "Can be boarded from either side if it inflates upside down, eliminating the need to right it in the water.",
    features: [
      "Usable whichever way up it inflates",
      "Faster boarding in heavy seas",
      "Common on racing yachts (ISAF/World Sailing requirement)",
      "Usually lighter than canopied models",
    ],
  },
];

// ── SOLAS B Pack Contents ────────────────────────────────────────────────
// Items required in a SOLAS B (yacht) equipment pack.

export const solasPackContents: readonly SolasPackItem[] = [
  {
    id: "bailer",
    name: "Bailer",
    purpose: "Remove water from inside the raft",
  },
  {
    id: "sponge",
    name: "Sponges (2)",
    purpose: "Mop up residual water and keep the floor dry",
  },
  {
    id: "sea-anchor",
    name: "Sea Anchor (Drogue)",
    purpose: "Slow drift and keep the raft oriented to wind and waves",
  },
  {
    id: "paddles",
    name: "Paddles (2)",
    purpose: "Manoeuvre the raft away from danger or toward rescue",
  },
  {
    id: "repair-kit",
    name: "Repair Kit",
    purpose: "Patch punctures to maintain buoyancy",
  },
  {
    id: "bellows",
    name: "Bellows / Inflation Pump",
    purpose: "Top up air pressure in tubes and floor",
  },
  {
    id: "knife",
    name: "Safety Knife",
    purpose: "Cut the painter after boarding and free entanglements",
  },
  {
    id: "whistle",
    name: "Whistle",
    purpose: "Attract attention of nearby vessels in poor visibility",
  },
  {
    id: "torch",
    name: "Waterproof Torch",
    purpose: "Signal at night and illuminate inside the raft",
  },
  {
    id: "flares",
    name: "Flares (hand-held and parachute)",
    purpose: "Signal for rescue; visible over long distances",
  },
  {
    id: "first-aid",
    name: "First Aid Kit",
    purpose: "Treat injuries and seasickness",
  },
  {
    id: "water",
    name: "Fresh Water (1.5 L per person)",
    purpose: "Prevent dehydration; essential for survival",
  },
];

// ── Procedure Steps (ordered correctly) ──────────────────────────────────
// The correct order is the array order. Games shuffle these for the player.

export const abandonShipSteps: readonly ProcedureStep[] = [
  { id: "mayday", text: "Send a MAYDAY distress call with position" },
  { id: "lifejackets", text: "Ensure all crew don lifejackets and warm clothing" },
  { id: "grab-bag", text: "Collect the grab bag, EPIRB, and SART" },
  { id: "launch-raft", text: "Launch and inflate the life raft" },
  { id: "board", text: "Board the raft — stay as dry as possible" },
  { id: "cut-painter", text: "Cut the painter only when everyone is aboard" },
  { id: "clear-vessel", text: "Paddle clear of the sinking vessel" },
];

export const deploymentProcedureSteps: readonly ProcedureStep[] = [
  { id: "check-painter", text: "Secure the painter to a strong point on the vessel" },
  { id: "remove-lashings", text: "Remove the raft canister lashings" },
  { id: "launch-leeward", text: "Launch the canister over the leeward side" },
  { id: "pull-painter", text: "Pull the painter sharply to trigger inflation" },
  { id: "bring-alongside", text: "Pull the raft alongside using the painter" },
];

export const boardingProcedureSteps: readonly ProcedureStep[] = [
  { id: "strongest-first", text: "Strongest person boards first to stabilise the raft" },
  { id: "help-others", text: "Help injured or weaker crew members aboard" },
  { id: "stay-low", text: "Keep low when entering to avoid capsizing" },
  { id: "sit-opposite", text: "Distribute weight evenly around the raft" },
  { id: "cut-free", text: "Cut the painter when everyone is safely aboard" },
];

export const actionsInRaftSteps: readonly ProcedureStep[] = [
  { id: "stream-drogue", text: "Stream the sea anchor (drogue) to slow drift" },
  { id: "close-canopy", text: "Close the canopy to retain warmth and reduce exposure" },
  { id: "bail-water", text: "Bail out water and dry the floor with sponges" },
  { id: "treat-injured", text: "Administer first aid and treat seasickness" },
  { id: "ration-water", text: "Ration water — no food or water for the first 24 hours" },
  { id: "post-lookout", text: "Post a lookout and prepare flares for signalling" },
];
