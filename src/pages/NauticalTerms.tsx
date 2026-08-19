import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, RotateCcw, HelpCircle, X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProgress } from "@/hooks/useProgress";
import { useAuth } from "@/contexts/AuthHooks";
import { supabase } from "@/integrations/supabase/client";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { configurationAwareBoatPartDescriptions } from "@/data/boatPartDescriptions";
import type { KeyboardEvent } from "react";

interface BoatPart {
  id: string;
  name: string;
  description: string;
  // Position of the actual part on the boat (where the line points TO)
  partX: number;
  partY: number;
  // Position of the label/marker (where user clicks)
  labelX: number;
  labelY: number;
  view: "side" | "front";
}

type PartState = "hidden" | "guessing" | "correct" | "wrong";

interface PartProgress {
  state: PartState;
  attempts: number;
}

interface ProgressSnapshot {
  ownerId: string;
  ownerEpoch: number;
  completed: boolean;
  scorePercentage: number;
  data: {
    partProgress: Record<string, PartProgress>;
    score: number;
  };
}

// Side view parts - coordinates are in SVG viewBox units (0-600 x 0-400)
const sideViewParts: BoatPart[] = [
  {
    id: "bow",
    name: "Bow",
    description:
      "The front end of the boat. In sailing, knowing which way is 'forward' is essential for navigation and sail trim.",
    partX: 520,
    partY: 215,
    labelX: 570,
    labelY: 215,
    view: "side",
  },
  {
    id: "stern",
    name: "Stern",
    description: configurationAwareBoatPartDescriptions.stern,
    partX: 90,
    partY: 235,
    labelX: 35,
    labelY: 280,
    view: "side",
  },
  {
    id: "hull",
    name: "Hull",
    description:
      "The main watertight body of the boat. The hull's shape determines the boat's speed, stability, and handling characteristics.",
    partX: 350,
    partY: 240,
    labelX: 420,
    labelY: 280,
    view: "side",
  },
  {
    id: "deck",
    name: "Deck",
    description:
      "The top surface of the boat that you walk on. It keeps water out of the hull and provides a working platform.",
    partX: 380,
    partY: 200,
    labelX: 450,
    labelY: 175,
    view: "side",
  },
  {
    id: "mast",
    name: "Mast",
    description: "The vertical pole that supports the sails. It's held up by the standing rigging (stays and shrouds).",
    partX: 270,
    partY: 100,
    labelX: 320,
    labelY: 70,
    view: "side",
  },
  {
    id: "boom",
    name: "Boom",
    description: configurationAwareBoatPartDescriptions.boom,
    partX: 210,
    partY: 160,
    labelX: 150,
    labelY: 180,
    view: "side",
  },
  {
    id: "mainsail",
    name: "Mainsail",
    description: configurationAwareBoatPartDescriptions.mainsail,
    partX: 230,
    partY: 105,
    labelX: 175,
    labelY: 75,
    view: "side",
  },
  {
    id: "jib",
    name: "Jib",
    description:
      "A triangular sail set forward of the mast. It helps balance the boat and adds power, especially when sailing upwind.",
    partX: 385,
    partY: 145,
    labelX: 425,
    labelY: 120,
    view: "side",
  },
  {
    id: "forestay",
    name: "Forestay",
    description: configurationAwareBoatPartDescriptions.forestay,
    partX: 505,
    partY: 200,
    labelX: 550,
    labelY: 155,
    view: "side",
  },
  {
    id: "backstay",
    name: "Backstay",
    description: configurationAwareBoatPartDescriptions.backstay,
    partX: 150,
    partY: 150,
    labelX: 90,
    labelY: 120,
    view: "side",
  },
  {
    id: "rudder",
    name: "Rudder",
    description:
      "An underwater blade at the stern used for steering. It pivots to direct water flow and turn the boat.",
    partX: 78,
    partY: 280,
    labelX: 30,
    labelY: 330,
    view: "side",
  },
  {
    id: "tiller",
    name: "Tiller",
    description:
      "A handle attached to the rudder for steering. Push it the opposite way you want to turn (push left to go right).",
    partX: 155,
    partY: 205,
    labelX: 155,
    labelY: 255,
    view: "side",
  },
  {
    id: "keel",
    name: "Keel",
    description: configurationAwareBoatPartDescriptions.keel,
    partX: 300,
    partY: 330,
    labelX: 370,
    labelY: 355,
    view: "side",
  },
  {
    id: "cockpit",
    name: "Cockpit",
    description:
      "The recessed area where the crew sits to steer and control the boat. It provides safety and comfort while sailing.",
    partX: 200,
    partY: 210,
    labelX: 255,
    labelY: 255,
    view: "side",
  },
  {
    id: "telltales",
    name: "Telltales",
    description:
      "Small ribbons or yarn attached to sails to show wind flow. They help sailors trim sails correctly - when both sides stream back evenly, the sail is set properly.",
    partX: 335,
    partY: 98,
    labelX: 390,
    labelY: 115,
    view: "side",
  },
];

// Back view parts - coordinates are in SVG viewBox units (0-400 x 0-400)
// Looking from BEHIND the boat, port is on YOUR LEFT, starboard on YOUR RIGHT
const frontViewParts: BoatPart[] = [
  {
    id: "port",
    name: "Port",
    description:
      "The left side of the boat when facing forward, marked with a RED navigation light. Remember: 'port' and 'left' both have 4 letters.",
    partX: 95,
    partY: 210,
    labelX: 35,
    labelY: 250,
    view: "front",
  },
  {
    id: "starboard",
    name: "Starboard",
    description:
      "The right side of the boat when facing forward, marked with a GREEN navigation light. The term comes from 'steerboard' - the steering oar was on the right.",
    partX: 305,
    partY: 210,
    labelX: 365,
    labelY: 250,
    view: "front",
  },
  {
    id: "beam",
    name: "Beam",
    description:
      "The widest part of the boat, measured from side to side. 'On the beam' means something is at 90 degrees to the boat's heading.",
    partX: 200,
    partY: 235,
    labelX: 200,
    labelY: 295,
    view: "front",
  },
  {
    id: "shrouds",
    name: "Shrouds",
    description:
      "Wire cables on either side of the mast providing lateral (sideways) support. They run from the mast to the deck or chainplates.",
    partX: 290,
    partY: 185,
    labelX: 355,
    labelY: 165,
    view: "front",
  },
  {
    id: "spreaders",
    name: "Spreaders",
    description:
      "Horizontal struts that push the shrouds away from the mast, improving their angle and support. They spread the load of the rigging.",
    partX: 270,
    partY: 90,
    labelX: 345,
    labelY: 60,
    view: "front",
  },
];

const allParts = [...sideViewParts, ...frontViewParts];
const partMarkerNumbers = new Map(allParts.map((part, index) => [part.id, index + 1]));

const POINTS_FIRST_TRY = 10;
const POINTS_SECOND_TRY = 5;
const MAX_SCORE = allParts.length * POINTS_FIRST_TRY;

const createInitialPartProgress = (): Record<string, PartProgress> =>
  Object.fromEntries(allParts.map((part) => [part.id, { state: "hidden", attempts: 0 }]));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizePartProgress = (value: unknown): Record<string, PartProgress> => {
  const savedProgress = isRecord(value) ? value : {};

  return Object.fromEntries(
    allParts.map((part) => {
      const candidate = savedProgress[part.id];
      if (!isRecord(candidate)) return [part.id, { state: "hidden", attempts: 0 }];

      const state = candidate.state;
      if (state !== "hidden" && state !== "guessing" && state !== "correct" && state !== "wrong") {
        return [part.id, { state: "hidden", attempts: 0 }];
      }

      const rawAttempts = candidate.attempts;
      const attempts =
        typeof rawAttempts === "number" && Number.isFinite(rawAttempts)
          ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(rawAttempts)))
          : 0;
      const minimumAttempts = state === "correct" || state === "wrong" ? 1 : 0;

      return [part.id, { state, attempts: Math.max(attempts, minimumAttempts) }];
    })
  );
};

const normalizeScore = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(MAX_SCORE, Math.round(value))) : 0;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// SVG Side View Boat Diagram Component
const SideViewBoat = () => (
  <g>
    <defs>
      <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#7dd3fc" />
        <stop offset="100%" stopColor="#e0f2fe" />
      </linearGradient>
      <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
      </linearGradient>
      <linearGradient id="hullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="55%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
      <linearGradient id="sailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fffef5" />
        <stop offset="72%" stopColor="#f8f2d8" />
        <stop offset="100%" stopColor="#d8cfaa" />
      </linearGradient>
      <linearGradient id="sideKeelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#172c46" />
        <stop offset="55%" stopColor="#355d7d" />
        <stop offset="100%" stopColor="#10243a" />
      </linearGradient>
      <filter id="sideBoatShadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.22" />
      </filter>
    </defs>

    {/* Sky */}
    <rect x="0" y="0" width="600" height="220" fill="url(#skyGradient)" />

    {/* Water */}
    <rect x="0" y="220" width="600" height="180" fill="url(#waterGradient)" />

    {/* Layered water gives the boat a waterline without obscuring underwater parts. */}
    <path
      d="M0,220 Q30,215 60,220 T120,220 T180,220 T240,220 T300,220 T360,220 T420,220 T480,220 T540,220 T600,220"
      stroke="#0ea5e9"
      strokeWidth="2"
      fill="none"
    />
    <path d="M0,270 Q45,263 90,270 T180,270 T270,270 T360,270 T450,270 T540,270 T630,270" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.45" />
    <path d="M0,315 Q35,309 70,315 T140,315 T210,315 T280,315 T350,315 T420,315 T490,315 T560,315 T630,315" stroke="#0369a1" strokeWidth="1" fill="none" opacity="0.25" />

    {/* Fin keel and ballast bulb are visibly separate from the hull. */}
    <path d="M275,250 C280,278 287,326 294,350 L310,350 C317,315 320,278 322,250 Z" fill="url(#sideKeelGradient)" stroke="#0f172a" strokeWidth="2" />
    <ellipse cx="302" cy="350" rx="21" ry="7" fill="#172c46" stroke="#0f172a" strokeWidth="2" />

    {/* Rudder stock and balanced blade remain clearly separate from the hull. */}
    <line x1="79" y1="218" x2="77" y2="243" stroke="#0f172a" strokeWidth="4" />
    <path d="M77,238 C70,255 66,285 66,309 Q80,315 92,305 L85,239 Z" fill="url(#sideKeelGradient)" stroke="#0f172a" strokeWidth="2" />

    <g filter="url(#sideBoatShadow)">
    {/* A conventional cruising-yacht sheer, near-vertical transom and raked bow. */}
    <path
      d="M88,215 C86,229 90,247 104,257 C226,267 395,266 478,255 C501,251 516,237 527,214 L480,194 C359,190 229,190 119,196 Z"
      fill="url(#hullGradient)"
      stroke="#1e3a5f"
      strokeWidth="2.5"
    />

    {/* Boot stripe follows the hull instead of floating across it. */}
    <path d="M94,239 C218,250 399,250 500,239" stroke="#174d72" strokeWidth="5" fill="none" opacity="0.9" />
    <path d="M99,246 C226,257 394,257 488,247" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8" />

    {/* Deck surface */}
    <path
      d="M112,198 C226,187 361,187 478,194 Q497,199 527,214 L88,215 Z"
      fill="#f1f5f9"
      stroke="#1e3a5f"
      strokeWidth="1.5"
    />

    {/* Cockpit well - more distinct, deeper */}
    <path d="M149,198 L244,196 L237,218 L154,218 Z" fill="#94a3b8" stroke="#1e3a5f" strokeWidth="1.5" />
    <path d="M158,202 L235,200 L230,214 L160,215 Z" fill="#475569" />
    {/* Cockpit seats */}
    <line x1="175" y1="198" x2="175" y2="220" stroke="#1e3a5f" strokeWidth="1" opacity="0.5" />
    <line x1="225" y1="198" x2="225" y2="220" stroke="#1e3a5f" strokeWidth="1" opacity="0.5" />
    <circle cx="179" cy="201" r="8" fill="none" stroke="#334155" strokeWidth="2" />
    <line x1="179" y1="193" x2="179" y2="209" stroke="#334155" strokeWidth="1" />
    <line x1="171" y1="201" x2="187" y2="201" stroke="#334155" strokeWidth="1" />

    {/* Cabin/Coach roof */}
    <path
      d="M250,194 L261,171 Q267,164 278,164 L414,165 Q428,168 438,192 Z"
      fill="#f8fafc"
      stroke="#1e3a5f"
      strokeWidth="2"
    />

    {/* Cabin windows */}
    <path d="M281,170 L314,170 L310,187 L277,188 Z" fill="#609bc1" stroke="#1e3a5f" strokeWidth="1.2" />
    <path d="M322,170 L355,170 L354,187 L319,187 Z" fill="#609bc1" stroke="#1e3a5f" strokeWidth="1.2" />
    <path d="M364,170 L405,171 L414,188 L364,187 Z" fill="#609bc1" stroke="#1e3a5f" strokeWidth="1.2" />
    </g>

    {/* Mast - raised higher with clear deck gap */}
    <line x1="270" y1="30" x2="270" y2="175" stroke="#374151" strokeWidth="7" strokeLinecap="round" />

    {/* Boom - attached to mast above deck level, goes to mainsail foot */}
    <line x1="270" y1="160" x2="170" y2="160" stroke="#374151" strokeWidth="5" strokeLinecap="round" />
    <circle cx="170" cy="160" r="4" fill="#6b7280" />

    {/* Backstay - wire from mast top to stern */}
    <line x1="270" y1="35" x2="95" y2="215" stroke="#64748b" strokeWidth="2" />

    {/* Forestay remains exposed between the jib tack and bow so it can be identified independently. */}
    <line data-geometry="forestay" x1="270" y1="35" x2="520" y2="210" stroke="#64748b" strokeWidth="2" />

    {/* Curved leeches and panel seams suggest loaded cloth while preserving silhouettes. */}
    <path d="M267,45 L267,157 L175,157 Q205,142 222,113 Q248,77 267,45 Z" fill="url(#sailGradient)" stroke="#1e3a5f" strokeWidth="2" />
    {/* Mainsail battens */}
    <line x1="268" y1="70" x2="220" y2="82" stroke="#d4d4d8" strokeWidth="1" />
    <line x1="268" y1="100" x2="205" y2="110" stroke="#d4d4d8" strokeWidth="1" />
    <line x1="268" y1="130" x2="190" y2="138" stroke="#d4d4d8" strokeWidth="1" />

    {/* Jib: its luff follows the forestay, with the clew aft and the tack near the bow. */}
    <path
      data-geometry="jib"
      d="M278,46 L490,190 Q430,186 355,176 Q390,136 278,46 Z"
      fill="url(#sailGradient)"
      stroke="#1e3a5f"
      strokeWidth="2"
      opacity="0.95"
    />
    {/* Jib telltales */}
    <line x1="350" y1="105" x2="365" y2="108" stroke="#ef4444" strokeWidth="2" />
    <line x1="385" y1="132" x2="400" y2="135" stroke="#ef4444" strokeWidth="2" />
    <path d="M278,84 Q355,120 447,174" stroke="#d6cda9" strokeWidth="1" fill="none" />
    <path d="M278,124 Q341,145 406,181" stroke="#d6cda9" strokeWidth="1" fill="none" />

    {/* Tiller - clearly extending from rudder into cockpit */}
    <line x1="80" y1="220" x2="175" y2="200" stroke="#78350f" strokeWidth="7" strokeLinecap="round" />
    <line x1="83" y1="218" x2="174" y2="199" stroke="#d6a56a" strokeWidth="2" strokeLinecap="round" />
    <circle cx="175" cy="200" r="5" fill="#78350f" />

    {/* Mast top fitting */}
    <circle cx="270" cy="28" r="6" fill="#374151" />

    {/* Burgee/Flag */}
    <path d="M270,28 L295,38 L270,48" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />

    {/* Bow pulpit */}
    <path d="M500,195 Q520,190 525,200" stroke="#64748b" strokeWidth="2" fill="none" />
    <path d="M510,195 Q525,188 530,195" stroke="#64748b" strokeWidth="2" fill="none" />
  </g>
);

// SVG Back View Boat Diagram Component (looking from behind - port on left, starboard on right)
const BackViewBoat = () => (
  <g>
    {/* Sky gradient */}
    <defs>
      <linearGradient id="skyGradientFront" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#7dd3fc" />
        <stop offset="100%" stopColor="#e0f2fe" />
      </linearGradient>
      <linearGradient id="waterGradientFront" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
      </linearGradient>
      <radialGradient id="sternHullGradient" cx="50%" cy="8%" r="90%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="58%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#bccbd8" />
      </radialGradient>
      <linearGradient id="sternKeelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#142b43" />
        <stop offset="50%" stopColor="#3b6585" />
        <stop offset="100%" stopColor="#142b43" />
      </linearGradient>
      <filter id="sternBoatShadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.24" />
      </filter>
    </defs>

    {/* Sky */}
    <rect x="0" y="0" width="400" height="225" fill="url(#skyGradientFront)" />

    {/* Water */}
    <rect x="0" y="225" width="400" height="175" fill="url(#waterGradientFront)" />

    {/* Water line waves */}
    <path d="M0,225 Q50,220 100,225 T200,225 T300,225 T400,225" stroke="#0ea5e9" strokeWidth="2" fill="none" />
    <path d="M0,278 Q35,272 70,278 T140,278 T210,278 T280,278 T350,278 T420,278" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.5" />
    <path d="M0,325 Q45,319 90,325 T180,325 T270,325 T360,325 T450,325" stroke="#0369a1" strokeWidth="1" fill="none" opacity="0.25" />

    {/* Foreshortened fin and bulb make the stern-on orientation legible. */}
    <path d="M183,254 Q187,310 192,345 L208,345 Q213,310 217,254 Z" fill="url(#sternKeelGradient)" stroke="#0f172a" strokeWidth="2" />
    <ellipse cx="200" cy="347" rx="19" ry="7" fill="#142b43" stroke="#0f172a" strokeWidth="2" />

    <g filter="url(#sternBoatShadow)">
    {/* Broad transom above a rounded underwater body, viewed squarely from astern. */}
    <path
      d="M79,218 Q70,236 84,259 Q126,276 200,279 Q274,276 316,259 Q330,236 321,218 Q276,194 200,191 Q124,194 79,218 Z"
      fill="url(#sternHullGradient)"
      stroke="#1e3a5f"
      strokeWidth="2.5"
    />

    {/* Transom edge, boot stripe, and cockpit opening show depth rather than a flat oval. */}
    <path d="M84,226 Q200,248 316,226" fill="none" stroke="#d8e2ea" strokeWidth="18" opacity="0.75" />
    <path d="M82,249 Q200,274 318,249" fill="none" stroke="#174d72" strokeWidth="5" opacity="0.9" />

    {/* Deck */}
    <path d="M91,218 Q124,181 200,178 Q276,181 309,218 Q249,235 200,236 Q151,235 91,218 Z" fill="#f1f5f9" stroke="#1e3a5f" strokeWidth="2" />
    <path d="M128,211 Q151,191 200,189 Q249,191 272,211 Q237,221 200,222 Q163,221 128,211 Z" fill="#475569" stroke="#1e3a5f" strokeWidth="2" />
    <path d="M139,208 Q161,196 200,195 Q239,196 261,208" fill="none" stroke="#94a3b8" strokeWidth="4" />

    {/* Cabin back (companionway) */}
    <path d="M157,190 L165,157 Q200,147 235,157 L243,190 Q200,181 157,190 Z" fill="#f8fafc" stroke="#1e3a5f" strokeWidth="2" />
    <path d="M178,183 L182,162 Q200,157 218,162 L222,183 Q200,178 178,183 Z" fill="#36566d" stroke="#1e3a5f" strokeWidth="1.5" />
    </g>

    {/* Mast */}
    <line x1="200" y1="30" x2="200" y2="165" stroke="#374151" strokeWidth="8" strokeLinecap="round" />

    {/* Spreaders */}
    <line x1="120" y1="90" x2="280" y2="90" stroke="#374151" strokeWidth="4" strokeLinecap="round" />

    {/* Starboard shrouds land on the viewer's right when looking forward from astern. */}
    <line x1="200" y1="35" x2="305" y2="225" stroke="#64748b" strokeWidth="2" />
    <line x1="280" y1="90" x2="305" y2="225" stroke="#64748b" strokeWidth="2" />

    {/* Port shrouds land on the viewer's left. */}
    <line x1="200" y1="35" x2="95" y2="225" stroke="#64748b" strokeWidth="2" />
    <line x1="120" y1="90" x2="95" y2="225" stroke="#64748b" strokeWidth="2" />

    {/* Navigation-light housings reinforce port/starboard without spelling out the answer. */}
    <path d="M87,203 Q95,198 103,203 L103,214 Q95,219 87,214 Z" fill="#7f1d1d" stroke="#1e3a5f" strokeWidth="2" />
    <circle cx="95" cy="210" r="6" fill="#ef4444" stroke="#fecaca" strokeWidth="1.5" />

    <path d="M297,203 Q305,198 313,203 L313,214 Q305,219 297,214 Z" fill="#14532d" stroke="#1e3a5f" strokeWidth="2" />
    <circle cx="305" cy="210" r="6" fill="#22c55e" stroke="#bbf7d0" strokeWidth="1.5" />

    {/* Backstay - visible from behind */}
    <line x1="200" y1="35" x2="200" y2="195" stroke="#64748b" strokeWidth="2" strokeDasharray="4,4" />

    {/* Mast top */}
    <circle cx="200" cy="28" r="6" fill="#374151" />

    {/* Beam indicator */}
    <line x1="85" y1="235" x2="315" y2="235" stroke="#475569" strokeWidth="1.5" strokeDasharray="5,5" />
    <path d="M91,230 L85,235 L91,240" stroke="#475569" strokeWidth="1.5" fill="none" />
    <path d="M309,230 L315,235 L309,240" stroke="#475569" strokeWidth="1.5" fill="none" />

    {/* Label to clarify view */}
    <text x="200" y="385" textAnchor="middle" fill="#64748b" fontSize="11" fontStyle="italic">
      Looking forward from astern (stern view)
    </text>
  </g>
);

const NauticalTerms = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loadProgress, saveProgress } = useProgress();
  const ownerId = user?.id ?? null;
  const [partProgress, setPartProgress] = useState<Record<string, PartProgress>>(createInitialPartProgress);
  const [activePart, setActivePart] = useState<BoatPart | null>(null);
  const [selectedPart, setSelectedPart] = useState<BoatPart | null>(null);
  const [score, setScore] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState<string | null>(null);
  const answerHeadingRef = useRef<HTMLHeadingElement>(null);
  const originatingMarkerIdRef = useRef<string | null>(null);
  const [hydratedOwnerId, setHydratedOwnerId] = useState<string | null>(null);
  const progressDirtyRef = useRef(false);
  const pendingSaveRef = useRef<ProgressSnapshot | null>(null);
  const activeFlushEpochRef = useRef<number | null>(null);
  const ownerRef = useRef<string | null>(ownerId);
  const ownerEpochRef = useRef(0);
  const [progressRevision, setProgressRevision] = useState(0);
  const hydrationComplete = ownerId !== null && hydratedOwnerId === ownerId;

  useLayoutEffect(() => {
    if (ownerRef.current === ownerId) return;
    ownerRef.current = ownerId;
    ownerEpochRef.current += 1;
    pendingSaveRef.current = null;
    activeFlushEpochRef.current = null;
    progressDirtyRef.current = false;
  }, [ownerId]);

  const markProgressDirty = useCallback(() => {
    progressDirtyRef.current = true;
    setProgressRevision((revision) => revision + 1);
  }, []);

  const flushProgressSaves = useCallback(async () => {
    const flushOwnerId = ownerRef.current;
    const flushEpoch = ownerEpochRef.current;
    if (!flushOwnerId || activeFlushEpochRef.current === flushEpoch) return;
    activeFlushEpochRef.current = flushEpoch;

    try {
      while (ownerRef.current === flushOwnerId && ownerEpochRef.current === flushEpoch) {
        const snapshot = pendingSaveRef.current;
        if (!snapshot || snapshot.ownerId !== flushOwnerId || snapshot.ownerEpoch !== flushEpoch) break;
        pendingSaveRef.current = null;
        try {
          await saveProgress(
            TOPIC_IDS.NAUTICAL_TERMS_BOAT_PARTS,
            snapshot.completed,
            snapshot.scorePercentage,
            0,
            snapshot.data
          );
        } catch (error) {
          console.error("Unexpected error saving boat parts progress:", error);
        }
      }
    } finally {
      if (activeFlushEpochRef.current === flushEpoch) activeFlushEpochRef.current = null;
    }
  }, [saveProgress]);

  // Generate 4 options for the active part (including the correct answer)
  const options = useMemo(() => {
    if (!activePart) return [];
    const sameParts = allParts.filter((p) => p.view === activePart.view);
    const otherParts = sameParts.filter((p) => p.id !== activePart.id);
    const wrongOptions = shuffleArray(otherParts).slice(0, 3);
    return shuffleArray([activePart, ...wrongOptions]);
  }, [activePart]);

  const handlePartClick = useCallback(
    (part: BoatPart) => {
      if (!hydrationComplete) return;
      const progress = partProgress[part.id];
      setSelectedPart(part);
      if (progress.state === "correct") {
        return;
      }
      originatingMarkerIdRef.current = part.id;
      setActivePart(part);
      setWrongAnswer(null);
      setPartProgress((prev) => {
        let next = prev;
        if (activePart && activePart.id !== part.id && prev[activePart.id].state === "guessing") {
          next = {
            ...next,
            [activePart.id]: { ...prev[activePart.id], state: "hidden" },
          };
        }
        if (prev[part.id].state === "hidden") {
          next = {
            ...next,
            [part.id]: { ...prev[part.id], state: "guessing" },
          };
        }
        return next;
      });
      markProgressDirty();
    },
    [activePart, hydrationComplete, markProgressDirty, partProgress]
  );

  const handleOptionSelect = useCallback(
    (selectedOption: BoatPart) => {
      if (!activePart) return;

      if (selectedOption.id === activePart.id) {
        const attempts = partProgress[activePart.id].attempts;
        const points = attempts === 0 ? POINTS_FIRST_TRY : POINTS_SECOND_TRY;
        setScore((prev) => prev + points);
        setPartProgress((prev) => ({
          ...prev,
          [activePart.id]: { state: "correct", attempts: attempts + 1 },
        }));
        toast.success(`+${points} points! Correct: ${activePart.name}`, {
          description: activePart.description,
        });
        setActivePart(null);
        setWrongAnswer(null);
      } else {
        setWrongAnswer(selectedOption.id);
        setPartProgress((prev) => ({
          ...prev,
          [activePart.id]: {
            state: "wrong",
            attempts: prev[activePart.id].attempts + 1,
          },
        }));
        toast.error("Wrong! Try again", {
          description: `That's not it. Give it another try!`,
        });
      }
      markProgressDirty();
    },
    [activePart, markProgressDirty, partProgress]
  );

  const handleCloseOptions = useCallback(() => {
    if (activePart) {
      setPartProgress((prev) =>
        prev[activePart.id].state === "guessing"
          ? { ...prev, [activePart.id]: { ...prev[activePart.id], state: "hidden" } }
          : prev
      );
    }
    setActivePart(null);
    setWrongAnswer(null);
    markProgressDirty();
  }, [activePart, markProgressDirty]);

  useEffect(() => {
    if (activePart) {
      answerHeadingRef.current?.focus();
      return;
    }

    const markerId = originatingMarkerIdRef.current;
    if (markerId) {
      document.querySelector<SVGGElement>(`[data-marker-id="${markerId}"]`)?.focus();
      originatingMarkerIdRef.current = null;
    }
  }, [activePart]);

  const resetGame = useCallback(() => {
    setPartProgress(createInitialPartProgress());
    setScore(0);
    originatingMarkerIdRef.current = null;
    setActivePart(null);
    setSelectedPart(null);
    setWrongAnswer(null);
    markProgressDirty();
    toast.success("Game reset! Good luck!");
  }, [markProgressDirty]);

  const partsById = useMemo(() => {
    const partsMap: Record<string, BoatPart> = {};
    allParts.forEach((part) => {
      partsMap[part.id] = part;
    });
    return partsMap;
  }, []);

  const correctCount = useMemo(
    () => Object.values(partProgress).filter((p) => p.state === "correct").length,
    [partProgress]
  );
  const wrongPart = useMemo(() => (wrongAnswer ? partsById[wrongAnswer] ?? null : null), [wrongAnswer, partsById]);
  const progressPercent = useMemo(() => (correctCount / allParts.length) * 100, [correctCount]);

  // Load saved progress on mount
  useEffect(() => {
    let cancelled = false;
    const loadOwnerId = ownerId;
    const loadOwnerEpoch = ownerEpochRef.current;

    setHydratedOwnerId(null);
    setPartProgress(createInitialPartProgress());
    setScore(0);
    setActivePart(null);
    setSelectedPart(null);
    setWrongAnswer(null);

    if (!loadOwnerId) return () => undefined;

    const loadSavedProgress = async () => {
      try {
        const savedData = await loadProgress(TOPIC_IDS.NAUTICAL_TERMS_BOAT_PARTS);
        if (cancelled || ownerRef.current !== loadOwnerId || ownerEpochRef.current !== loadOwnerEpoch) return;

        if (savedData?.answers_history) {
          const saved =
            typeof savedData.answers_history === "string"
              ? JSON.parse(savedData.answers_history)
              : savedData.answers_history;
          if (isRecord(saved)) {
            setPartProgress(normalizePartProgress(saved.partProgress));
            setScore(normalizeScore(saved.score));
          }
        }
      } catch (error) {
        console.error("Error loading boat parts progress:", error);
      } finally {
        if (!cancelled && ownerRef.current === loadOwnerId && ownerEpochRef.current === loadOwnerEpoch) {
          setHydratedOwnerId(loadOwnerId);
        }
      }
    };
    void loadSavedProgress();

    return () => {
      cancelled = true;
    };
  }, [loadProgress, ownerId]);

  // Save progress whenever it changes
  useEffect(() => {
    if (ownerId && hydrationComplete && progressDirtyRef.current) {
      progressDirtyRef.current = false;
      pendingSaveRef.current = {
        ownerId,
        ownerEpoch: ownerEpochRef.current,
        completed: correctCount === allParts.length,
        scorePercentage: Math.round((score / MAX_SCORE) * 100),
        data: { partProgress, score },
      };
      void flushProgressSaves();
    }
  }, [partProgress, score, ownerId, correctCount, progressRevision, hydrationComplete, flushProgressSaves]);

  const getMarkerColor = (part: BoatPart) => {
    const progress = partProgress[part.id];
    if (progress.state === "correct") return "#22c55e";
    if (progress.state === "wrong") return "#f97316";
    if (progress.state === "guessing") return "#3b82f6";
    return "#f59e0b";
  };

  const renderPartMarker = (part: BoatPart, isActive: boolean) => {
    const progress = partProgress[part.id];
    const color = getMarkerColor(part);
    const markerNumber = partMarkerNumbers.get(part.id);
    const markerState = isActive
      ? progress.state === "wrong"
        ? "wrong, selected for another guess"
        : "guessing"
      : progress.state === "hidden"
        ? "undiscovered"
        : progress.state;
    const handleMarkerKeyDown = (event: KeyboardEvent<SVGGElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handlePartClick(part);
      }
    };

    return (
      <g
        key={part.id}
        role="button"
        tabIndex={0}
        aria-label={`Marker ${markerNumber}, ${markerState}. Activate to identify this boat part.`}
        aria-describedby="boat-parts-instructions"
        data-marker-state={markerState}
        data-marker-id={part.id}
        style={{ cursor: "pointer" }}
        onClick={() => handlePartClick(part)}
        onKeyDown={handleMarkerKeyDown}
        className="focus:outline-none focus-visible:[&_.marker-focus-ring]:stroke-ring focus-visible:[&_.marker-focus-ring]:stroke-[4]"
      >
        {/* Transparent hit area and minimum SVG scale preserve a 44px+ touch target. */}
        <circle cx={part.labelX} cy={part.labelY} r="28" fill="transparent" className="pointer-events-all" />
        {/* Connection line from label to part */}
        <line
          x1={part.labelX}
          y1={part.labelY}
          x2={part.partX}
          y2={part.partY}
          stroke={color}
          strokeWidth="2"
          strokeDasharray={progress.state === "correct" ? "0" : "4,4"}
          opacity="0.7"
        />

        {/* Dot on the actual part */}
        <circle cx={part.partX} cy={part.partY} r="6" fill={color} stroke="#fff" strokeWidth="2" />

        {/* Label marker (clickable) */}
        <g>
          <circle
            cx={part.labelX}
            cy={part.labelY}
            r={isActive ? "18" : "15"}
            fill={color}
            stroke="#fff"
            strokeWidth="3"
            className={progress.state === "hidden" ? "animate-pulse" : ""}
          />
          <circle
            cx={part.labelX}
            cy={part.labelY}
            r="20"
            fill="none"
            stroke="transparent"
            className="marker-focus-ring pointer-events-none"
          />
          {progress.state === "correct" ? (
            <text x={part.labelX} y={part.labelY + 5} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">
              ✓
            </text>
          ) : progress.state === "wrong" ? (
            <text x={part.labelX} y={part.labelY + 5} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">
              ✗
            </text>
          ) : (
            <text x={part.labelX} y={part.labelY + 5} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">
              ?
            </text>
          )}
        </g>

        {/* Show name if correct */}
        {progress.state === "correct" && (
          <text
            x={part.labelX}
            y={part.labelY - 22}
            textAnchor="middle"
            fill="#1e3a5f"
            fontSize="11"
            fontWeight="600"
            className="pointer-events-none"
          >
            {part.name}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Back to nautical terms"
                onClick={() => navigate("/nautical-terms")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Nautical Terms Quiz</h1>
                <p id="boat-parts-instructions" className="text-sm text-muted-foreground">
                  Select a numbered marker to identify the boat part. Use Enter or Space with a keyboard.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={resetGame} disabled={!hydrationComplete}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                <span className="font-bold text-lg">{score}</span>
              </div>
              <Badge variant="secondary">
                {correctCount}/{allParts.length}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Progress bar */}
        <div
          className="w-full bg-muted rounded-full h-3 mb-6"
          role="progressbar"
          aria-label="Boat parts identified"
          aria-valuemin={0}
          aria-valuemax={allParts.length}
          aria-valuenow={correctCount}
          aria-valuetext={`${correctCount} of ${allParts.length} boat parts identified`}
        >
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Side View */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="w-5 h-5 text-secondary" />
                Side View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto overflow-y-hidden rounded-lg border-2 border-slate-200">
                <svg viewBox="0 0 600 400" className="h-auto w-full min-w-[550px]">
                  <SideViewBoat />
                  {sideViewParts.map((part) => renderPartMarker(part, activePart?.id === part.id))}
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Back View */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="w-5 h-5 text-secondary" />
                Back View (Helm)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto overflow-y-hidden rounded-lg border-2 border-slate-200">
                <svg viewBox="0 0 400 400" className="h-auto w-full min-w-[400px]">
                  <BackViewBoat />
                  {frontViewParts.map((part) => renderPartMarker(part, activePart?.id === part.id))}
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Options Panel - shown when a part is selected */}
          {activePart && partProgress[activePart.id].state !== "correct" && (
            <Card className="lg:col-span-3 border-2 border-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 ref={answerHeadingRef} tabIndex={-1} className="font-semibold text-lg focus:outline-none">
                    What is this part?
                  </h3>
                  <Button variant="ghost" size="icon" aria-label="Close answer choices" onClick={handleCloseOptions}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {options.map((option) => (
                    <Button
                      key={option.id}
                      variant={wrongAnswer === option.id ? "destructive" : "outline"}
                      size="lg"
                      className={`h-auto py-4 ${wrongAnswer === option.id ? "opacity-50" : ""}`}
                      onClick={() => handleOptionSelect(option)}
                      disabled={wrongAnswer === option.id}
                    >
                      {option.name}
                    </Button>
                  ))}
                </div>
                {partProgress[activePart.id].attempts > 0 && (
                  <p className="text-sm text-muted-foreground mt-3 text-center">
                    Attempts: {partProgress[activePart.id].attempts}
                    {partProgress[activePart.id].attempts === 1 ? " — Next correct answer: 5 pts" : ""}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Selected Part Description */}
          {selectedPart && (
            <Card
              className={`lg:col-span-3 border-2 ${
                partProgress[selectedPart.id].state === "correct"
                  ? "border-green-500"
                  : partProgress[selectedPart.id].state === "wrong"
                  ? "border-orange-500"
                  : partProgress[selectedPart.id].state === "guessing"
                  ? "border-blue-500"
                  : "border-secondary"
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      partProgress[selectedPart.id].state === "correct"
                        ? "bg-green-500"
                        : partProgress[selectedPart.id].state === "wrong"
                        ? "bg-orange-500"
                        : partProgress[selectedPart.id].state === "guessing"
                        ? "bg-blue-500"
                        : "bg-amber-500"
                    }`}
                  />
                  {partProgress[selectedPart.id].state === "correct"
                    ? selectedPart.name
                    : partProgress[selectedPart.id].state === "wrong" && wrongPart
                    ? wrongPart.name
                    : "???"}
                  {partProgress[selectedPart.id].state === "correct" && (
                    <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                      Identified
                    </Badge>
                  )}
                  {partProgress[selectedPart.id].state === "wrong" && wrongPart && (
                    <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
                      Wrong Choice!
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {partProgress[selectedPart.id].state === "correct" ? (
                  <p className="text-muted-foreground">{selectedPart.description}</p>
                ) : partProgress[selectedPart.id].state === "wrong" && wrongPart ? (
                  <div>
                    <p className="text-muted-foreground mb-3">{wrongPart.description}</p>
                    <p className="text-orange-600 text-sm font-medium">
                      This is not what the marker points to! Look again and try another option.
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Identify this part correctly to learn more about it!</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Legend & Score */}
          <Card className="lg:col-span-3">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500" />
                    <span>Undiscovered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                    <span>Guessing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500" />
                    <span>Wrong</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                    <span>Correct</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="text-green-600 font-semibold">+10 pts</span> first try •
                  <span className="text-orange-500 font-semibold"> +5 pts</span> retry
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parts List */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                Parts to Find ({correctCount}/{allParts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {allParts.map((part) => (
                  <div
                    key={part.id}
                    className={`text-sm p-2 rounded flex items-center justify-between ${
                      partProgress[part.id].state === "correct"
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-muted"
                    }`}
                  >
                    <span className={partProgress[part.id].state === "correct" ? "" : "blur-sm select-none"}>
                      {part.name}
                    </span>
                    {partProgress[part.id].state === "correct" && (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Completion Card */}
          {correctCount === allParts.length && (
            <Card className="lg:col-span-3 border-2 border-green-500 bg-green-500/5">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">🎉 Congratulations! All parts identified!</h3>
                    <p className="text-muted-foreground">
                      Final score: <span className="font-bold text-primary">{score}</span> points
                      {score === allParts.length * 10 && " — Perfect score!"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetGame}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Play Again
                    </Button>
                    <Button
                      className="bg-green-500 text-white hover:bg-green-600"
                      onClick={() => navigate("/quiz/nautical-terms")}
                    >
                      Take Full Quiz
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default NauticalTerms;
