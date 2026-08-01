import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, RotateCcw, HelpCircle, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProgress, type ProgressSaveResult } from "@/hooks/useProgress";
import { useAuth } from "@/contexts/AuthHooks";
import { TOPIC_IDS } from "@/constants/topicRegistry";

interface SailControl {
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

type PartState = "hidden" | "guessing" | "correct" | "wrong";

interface PartProgress {
  state: PartState;
  attempts: number;
}

type DurableStatus =
  | "anonymous"
  | "loading"
  | "ready"
  | "saving"
  | "queued"
  | "remote"
  | "failed";

interface SailControlsProgressPayload {
  module: "sail-controls";
  version: 1;
  score: number;
}

const isSavedPayload = (value: unknown): value is SailControlsProgressPayload => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return candidate.module === "sail-controls" && candidate.version === 1 &&
    typeof candidate.score === "number" && Number.isFinite(candidate.score) &&
    candidate.score >= 0 && candidate.score <= sailControls.length * POINTS_FIRST_TRY;
};

const isDurableCompletionRecord = (value: unknown, ownerId: string) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return candidate.user_id === ownerId &&
    candidate.topic_id === TOPIC_IDS.NAUTICAL_TERMS_SAIL_CONTROLS &&
    candidate.completed === true &&
    typeof candidate.score === "number" && Number.isFinite(candidate.score) &&
    candidate.score >= 0 && candidate.score <= 100;
};

const sailControls: SailControl[] = [
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

const POINTS_FIRST_TRY = 10;
const POINTS_SECOND_TRY = 5;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getDiagramControlProps(
  id: string,
  name: string,
  onClick?: (id: string) => void,
  onHover?: (id: string | null) => void
) {
  if (!onClick) return {};

  return {
    role: "button",
    tabIndex: 0,
    "aria-label": `Show ${name} details from diagram`,
    className:
      "focus:outline-none focus-visible:[&>rect[data-touch-target]]:stroke-primary focus-visible:[&>rect[data-touch-target]]:stroke-[4]",
    onFocus: () => onHover?.(id),
    onBlur: () => onHover?.(null),
    onKeyDown: (event: ReactKeyboardEvent<SVGGElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick(id);
      }
    },
  };
}

// Simple schematic diagram showing where controls are - with clickable areas
const SchematicDiagram = ({
  highlightId,
  onHover,
  onClick,
}: {
  highlightId?: string;
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}) => (
  <svg viewBox="0 0 600 700" className="h-auto w-full min-w-[600px]" aria-label="Sail controls diagram">
    <defs>
      <linearGradient id="sailGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="100%" stopColor="#fde68a" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Background */}
    <rect x="0" y="0" width="600" height="700" fill="#f0f9ff" />

    {/* Water hint at bottom */}
    <rect x="0" y="620" width="600" height="80" fill="#e0f2fe" />
    <path d="M0,620 Q75,610 150,620 T300,620 T450,620 T600,620" stroke="#7dd3fc" strokeWidth="2" fill="none" />

    {/* Hull outline */}
    <path d="M120,580 L480,580 L510,640 L90,640 Z" fill="#e2e8f0" stroke="#1e3a5f" strokeWidth="3" />
    <text x="300" y="615" textAnchor="middle" fontSize="14" fill="#64748b">
      HULL
    </text>

    {/* Mast */}
    <line x1="300" y1="60" x2="300" y2="520" stroke="#374151" strokeWidth="10" />
    <circle cx="300" cy="55" r="8" fill="#374151" />
    <text x="315" y="300" fontSize="12" fill="#374151" fontWeight="bold">
      MAST
    </text>

    {/* Boom */}
    <line x1="300" y1="440" x2="140" y2="440" stroke="#374151" strokeWidth="8" />
    <circle cx="140" cy="440" r="6" fill="#6b7280" />
    <text x="220" y="460" fontSize="11" fill="#374151">
      BOOM
    </text>

    {/* Mainsail */}
    <path d="M296,75 L296,436 L144,436 Z" fill="url(#sailGradient2)" stroke="#1e3a5f" strokeWidth="2" opacity="0.9" />
    <text x="220" y="300" fontSize="14" fill="#1e3a5f" opacity="0.6">
      MAINSAIL
    </text>

    {/* Jib: luff follows the forestay; tack is forward and clew is aft. */}
    <path
      data-geometry="jib"
      d="M306,78 L500,540 L410,440 Z"
      fill="#fef9c3"
      stroke="#1e3a5f"
      strokeWidth="2"
      opacity="0.85"
    />
    <text x="390" y="330" fontSize="14" fill="#1e3a5f" opacity="0.6">
      JIB
    </text>

    {/* Forestay */}
    <line data-geometry="forestay" x1="300" y1="60" x2="520" y2="560" stroke="#94a3b8" strokeWidth="3" />

    {/* Backstay */}
    <line x1="300" y1="60" x2="110" y2="640" stroke="#94a3b8" strokeWidth="3" />

    {/* === INTERACTIVE CONTROL LINES === */}

    {/* Main Halyard */}
    <g
      {...getDiagramControlProps("main-halyard", "Main Halyard", onClick, onHover)}
      style={{ cursor: "pointer" }}
      opacity={highlightId === "main-halyard" || !highlightId ? 1 : 0.4}
      filter={highlightId === "main-halyard" ? "url(#glow)" : undefined}
      onMouseEnter={() => onHover?.("main-halyard")}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.("main-halyard")}
    >
      <rect data-touch-target="main-halyard" x="308" y="89" width="103" height="44" fill="transparent" />
      <line x1="296" y1="75" x2="308" y2="55" stroke="#3b82f6" strokeWidth="4" />
      <line x1="308" y1="55" x2="308" y2="520" stroke="#3b82f6" strokeWidth="3" strokeDasharray="6,3" />
      <circle cx="296" cy="75" r="8" fill="#3b82f6" stroke="white" strokeWidth="2" />
      <rect x="312" y="100" width="95" height="22" rx="4" fill="#3b82f6" />
      <text x="360" y="116" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">
        Main Halyard
      </text>
    </g>

    {/* Jib Halyard */}
    <g
      {...getDiagramControlProps("jib-halyard", "Jib Halyard", onClick, onHover)}
      data-control-id="jib-halyard"
      style={{ cursor: "pointer" }}
      opacity={highlightId === "jib-halyard" || !highlightId ? 1 : 0.4}
      filter={highlightId === "jib-halyard" ? "url(#glow)" : undefined}
      onMouseEnter={() => onHover?.("jib-halyard")}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.("jib-halyard")}
    >
      <rect data-touch-target="jib-halyard" x="176" y="89" width="93" height="44" fill="transparent" />
      <line x1="306" y1="78" x2="288" y2="55" stroke="#06b6d4" strokeWidth="4" />
      <line x1="288" y1="55" x2="288" y2="520" stroke="#06b6d4" strokeWidth="3" strokeDasharray="6,3" />
      <circle cx="306" cy="78" r="8" fill="#06b6d4" stroke="white" strokeWidth="2" />
      <rect x="180" y="100" width="85" height="22" rx="4" fill="#06b6d4" />
      <text x="222" y="116" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">
        Jib Halyard
      </text>
    </g>

    {/* Mainsheet */}
    <g
      {...getDiagramControlProps("mainsheet", "Mainsheet", onClick, onHover)}
      style={{ cursor: "pointer" }}
      opacity={highlightId === "mainsheet" || !highlightId ? 1 : 0.4}
      filter={highlightId === "mainsheet" ? "url(#glow)" : undefined}
      onMouseEnter={() => onHover?.("mainsheet")}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.("mainsheet")}
    >
      <rect data-touch-target="mainsheet" x="201" y="474" width="83" height="44" fill="transparent" />
      <line x1="200" y1="440" x2="200" y2="550" stroke="#ec4899" strokeWidth="4" />
      <line x1="200" y1="550" x2="300" y2="590" stroke="#ec4899" strokeWidth="4" />
      <circle cx="200" cy="440" r="8" fill="#ec4899" stroke="white" strokeWidth="2" />
      <rect x="205" y="485" width="75" height="22" rx="4" fill="#ec4899" />
      <text x="242" y="501" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">
        Mainsheet
      </text>
    </g>

    {/* Jib Sheet */}
    <g
      {...getDiagramControlProps("jib-sheet", "Jib Sheet", onClick, onHover)}
      data-control-id="jib-sheet"
      style={{ cursor: "pointer" }}
      opacity={highlightId === "jib-sheet" || !highlightId ? 1 : 0.4}
      filter={highlightId === "jib-sheet" ? "url(#glow)" : undefined}
      onMouseEnter={() => onHover?.("jib-sheet")}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.("jib-sheet")}
    >
      <rect data-touch-target="jib-sheet" x="352" y="459" width="86" height="44" fill="transparent" />
      <polyline data-sheet-route points="410,440 365,520 330,555" fill="none" stroke="#f59e0b" strokeWidth="4" />
      <circle cx="410" cy="440" r="8" fill="#f59e0b" stroke="white" strokeWidth="2" />
      <rect x="356" y="470" width="78" height="22" rx="4" fill="#f59e0b" />
      <text x="395" y="486" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">
        Jib Sheet
      </text>
    </g>

    {/* Boom Vang */}
    <g
      {...getDiagramControlProps("boom-vang", "Boom Vang", onClick, onHover)}
      style={{ cursor: "pointer" }}
      opacity={highlightId === "boom-vang" || !highlightId ? 1 : 0.4}
      filter={highlightId === "boom-vang" ? "url(#glow)" : undefined}
      onMouseEnter={() => onHover?.("boom-vang")}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.("boom-vang")}
    >
      <rect data-touch-target="boom-vang" x="236" y="459" width="63" height="44" fill="transparent" />
      <line x1="240" y1="440" x2="300" y2="510" stroke="#ef4444" strokeWidth="4" />
      <circle cx="240" cy="440" r="6" fill="#ef4444" stroke="white" strokeWidth="2" />
      <circle cx="300" cy="510" r="6" fill="#ef4444" stroke="white" strokeWidth="2" />
      <rect x="240" y="470" width="55" height="22" rx="4" fill="#ef4444" />
      <text x="268" y="486" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
        Vang
      </text>
    </g>

    {/* Outhaul */}
    <g
      {...getDiagramControlProps("outhaul", "Outhaul", onClick, onHover)}
      style={{ cursor: "pointer" }}
      opacity={highlightId === "outhaul" || !highlightId ? 1 : 0.4}
      filter={highlightId === "outhaul" ? "url(#glow)" : undefined}
      onMouseEnter={() => onHover?.("outhaul")}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.("outhaul")}
    >
      <rect data-touch-target="outhaul" x="96" y="394" width="68" height="44" fill="transparent" />
      <line x1="144" y1="436" x2="220" y2="436" stroke="#8b5cf6" strokeWidth="4" />
      <circle cx="144" cy="436" r="8" fill="#8b5cf6" stroke="white" strokeWidth="2" />
      <rect x="100" y="405" width="60" height="22" rx="4" fill="#8b5cf6" />
      <text x="130" y="421" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">
        Outhaul
      </text>
    </g>

    {/* Cunningham */}
    <g
      {...getDiagramControlProps("cunningham", "Cunningham", onClick, onHover)}
      style={{ cursor: "pointer" }}
      opacity={highlightId === "cunningham" || !highlightId ? 1 : 0.4}
      filter={highlightId === "cunningham" ? "url(#glow)" : undefined}
      onMouseEnter={() => onHover?.("cunningham")}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.("cunningham")}
    >
      <rect data-touch-target="cunningham" x="296" y="414" width="93" height="44" fill="transparent" />
      <circle cx="296" cy="410" r="6" fill="none" stroke="#22c55e" strokeWidth="3" />
      <line x1="296" y1="416" x2="296" y2="460" stroke="#22c55e" strokeWidth="3" />
      <line x1="296" y1="460" x2="315" y2="520" stroke="#22c55e" strokeWidth="3" />
      <rect x="300" y="425" width="85" height="22" rx="4" fill="#22c55e" />
      <text x="342" y="441" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">
        Cunningham
      </text>
    </g>

    {/* Topping Lift */}
    <g
      {...getDiagramControlProps("topping-lift", "Topping Lift", onClick, onHover)}
      style={{ cursor: "pointer" }}
      opacity={highlightId === "topping-lift" || !highlightId ? 1 : 0.4}
      filter={highlightId === "topping-lift" ? "url(#glow)" : undefined}
      onMouseEnter={() => onHover?.("topping-lift")}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.("topping-lift")}
    >
      <rect data-touch-target="topping-lift" x="46" y="219" width="98" height="44" fill="transparent" />
      <line x1="300" y1="60" x2="145" y2="438" stroke="#64748b" strokeWidth="3" strokeDasharray="8,4" />
      <rect x="50" y="230" width="90" height="22" rx="4" fill="#64748b" />
      <text x="95" y="246" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">
        Topping Lift
      </text>
    </g>

    {/* Reefing points */}
    <g
      {...getDiagramControlProps("reefing-lines", "Reefing Lines", onClick, onHover)}
      style={{ cursor: "pointer" }}
      opacity={highlightId === "reefing-lines" || !highlightId ? 1 : 0.4}
      filter={highlightId === "reefing-lines" ? "url(#glow)" : undefined}
      onMouseEnter={() => onHover?.("reefing-lines")}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.("reefing-lines")}
    >
      <rect data-touch-target="reefing-lines" x="91" y="299" width="98" height="44" fill="transparent" />
      <circle cx="296" cy="280" r="6" fill="#f97316" />
      <circle cx="200" cy="296" r="6" fill="#f97316" />
      <line x1="296" y1="280" x2="200" y2="296" stroke="#f97316" strokeWidth="3" strokeDasharray="4,3" />
      <circle cx="296" cy="340" r="6" fill="#f97316" />
      <circle cx="180" cy="356" r="6" fill="#f97316" />
      <line x1="296" y1="340" x2="180" y2="356" stroke="#f97316" strokeWidth="3" strokeDasharray="4,3" />
      <rect x="95" y="310" width="90" height="22" rx="4" fill="#f97316" />
      <text x="140" y="326" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">
        Reef Points
      </text>
    </g>

    {/* Traveller */}
    <g
      {...getDiagramControlProps("traveller", "Mainsheet Traveller", onClick, onHover)}
      style={{ cursor: "pointer" }}
      opacity={highlightId === "traveller" || !highlightId ? 1 : 0.4}
      filter={highlightId === "traveller" ? "url(#glow)" : undefined}
      onMouseEnter={() => onHover?.("traveller")}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.("traveller")}
    >
      <rect data-touch-target="traveller" x="311" y="584" width="73" height="44" fill="transparent" />
      <line x1="180" y1="590" x2="420" y2="590" stroke="#475569" strokeWidth="6" />
      <rect x="285" y="582" width="30" height="16" fill="#475569" rx="3" stroke="white" strokeWidth="2" />
      <rect x="315" y="595" width="65" height="22" rx="4" fill="#475569" />
      <text x="348" y="611" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">
        Traveller
      </text>
    </g>

    {/* Jib Fairlead */}
    <g
      {...getDiagramControlProps("jib-fairlead", "Jib Fairlead", onClick, onHover)}
      data-control-id="jib-fairlead"
      style={{ cursor: "pointer" }}
      opacity={highlightId === "jib-fairlead" || !highlightId ? 1 : 0.4}
      filter={highlightId === "jib-fairlead" ? "url(#glow)" : undefined}
      onMouseEnter={() => onHover?.("jib-fairlead")}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.("jib-fairlead")}
    >
      <rect data-touch-target="jib-fairlead" x="337" y="516" width="86" height="44" fill="transparent" />
      <line data-fairlead-route x1="365" y1="520" x2="330" y2="565" stroke="#78716c" strokeWidth="5" />
      <rect x="356" y="514" width="18" height="12" fill="#78716c" rx="3" stroke="white" strokeWidth="2" />
      <rect x="341" y="530" width="78" height="22" rx="4" fill="#78716c" />
      <text x="380" y="546" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">
        Fairlead
      </text>
    </g>

    {/* Backstay Adjuster */}
    <g
      {...getDiagramControlProps("backstay-adjuster", "Backstay Adjuster", onClick, onHover)}
      style={{ cursor: "pointer" }}
      opacity={highlightId === "backstay-adjuster" || !highlightId ? 1 : 0.4}
      filter={highlightId === "backstay-adjuster" ? "url(#glow)" : undefined}
      onMouseEnter={() => onHover?.("backstay-adjuster")}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.("backstay-adjuster")}
    >
      <rect data-touch-target="backstay-adjuster" x="11" y="584" width="98" height="44" fill="transparent" />
      <rect x="103" y="580" width="14" height="40" fill="#1e3a5f" rx="3" stroke="white" strokeWidth="2" />
      <rect x="15" y="595" width="90" height="22" rx="4" fill="#1e3a5f" />
      <text x="60" y="611" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
        Backstay Adj.
      </text>
    </g>
  </svg>
);

const SailControls = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loadProgress, saveProgressDetailed } = useProgress();
  const [mode, setMode] = useState<"learn" | "quiz">("learn");
  const [partProgress, setPartProgress] = useState<Record<string, PartProgress>>(() => {
    const initial: Record<string, PartProgress> = {};
    sailControls.forEach((part) => {
      initial[part.id] = { state: "hidden", attempts: 0 };
    });
    return initial;
  });
  const [activePart, setActivePart] = useState<SailControl | null>(null);
  const [selectedPart, setSelectedPart] = useState<SailControl | null>(null); // clicked/locked selection
  const [hoveredPart, setHoveredPart] = useState<SailControl | null>(null); // hover highlight only
  const [score, setScore] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState<string | null>(null);
  const [quizQueue, setQuizQueue] = useState<SailControl[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnnouncement, setQuizAnnouncement] = useState("");
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const completionHeadingRef = useRef<HTMLHeadingElement>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quizGenerationRef = useRef(0);
  const answerLockedRef = useRef(false);
  const ownerRef = useRef(user?.id ?? null);
  ownerRef.current = user?.id ?? null;
  const [durableStatus, setDurableStatus] = useState<DurableStatus>(user ? "loading" : "anonymous");
  const [pendingCompletion, setPendingCompletion] = useState<{ percentage: number; score: number } | null>(null);

  const persistCompletion = useCallback(async (percentage: number, finalScore: number) => {
    if (!user) {
      setDurableStatus("anonymous");
      return;
    }
    const ownerId = user.id;
    setDurableStatus("saving");
    setPendingCompletion({ percentage, score: finalScore });
    const payload: SailControlsProgressPayload = { module: "sail-controls", version: 1, score: finalScore };
    let result: ProgressSaveResult;
    try {
      result = await saveProgressDetailed(
        TOPIC_IDS.NAUTICAL_TERMS_SAIL_CONTROLS,
        true,
        percentage,
        finalScore,
        payload as unknown as Record<string, unknown>
      );
    } catch (error) {
      console.error("Error saving Sail Controls completion:", error);
      result = "failed";
    }
    if (ownerRef.current !== ownerId) return;
    setDurableStatus(result === "remote" ? "remote" : result === "queued" ? "queued" : result === "anonymous" ? "anonymous" : "failed");
  }, [saveProgressDetailed, user]);

  useEffect(() => {
    let cancelled = false;
    const ownerId = user?.id ?? null;
    setPendingCompletion(null);
    if (!ownerId) {
      setDurableStatus("anonymous");
      return () => { cancelled = true; };
    }

    setDurableStatus("loading");
    void loadProgress(TOPIC_IDS.NAUTICAL_TERMS_SAIL_CONTROLS).then((record) => {
      if (cancelled || ownerRef.current !== ownerId) return;
      let payload: unknown = record?.answers_history;
      if (typeof payload === "string") {
        try { payload = JSON.parse(payload); } catch { payload = null; }
      }
      if (isDurableCompletionRecord(record, ownerId)) {
        const restoredScore = isSavedPayload(payload)
          ? payload.score
          : Math.round(((record?.score ?? 0) / 100) * sailControls.length * POINTS_FIRST_TRY);
        setScore(restoredScore);
        setMode("quiz");
        setQuizQueue([...sailControls]);
        setCurrentQuizIndex(sailControls.length - 1);
        setActivePart(null);
        setPartProgress(Object.fromEntries(sailControls.map((part) => [part.id, { state: "correct", attempts: 1 }] as const)));
        setPendingCompletion({ percentage: record?.score ?? 0, score: restoredScore });
        setDurableStatus("remote");
      } else {
        setDurableStatus("ready");
      }
    }).catch((error) => {
      console.error("Error loading Sail Controls progress:", error);
      if (!cancelled && ownerRef.current === ownerId) setDurableStatus("failed");
    });
    return () => { cancelled = true; };
  }, [loadProgress, user?.id]);

  const invalidatePendingTransition = useCallback(() => {
    quizGenerationRef.current += 1;
    answerLockedRef.current = false;
    if (transitionTimeoutRef.current !== null) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => invalidatePendingTransition, [invalidatePendingTransition]);

  useEffect(() => {
    if (mode !== "quiz") return;
    if (activePart) {
      questionHeadingRef.current?.focus();
    } else if (quizQueue.length > 0) {
      completionHeadingRef.current?.focus();
    }
  }, [mode, activePart, currentQuizIndex, quizQueue.length]);

  // The highlighted part is either hovered or selected (hovered takes visual priority for diagram)
  const highlightedId = hoveredPart?.id || selectedPart?.id;

  const startQuiz = useCallback(() => {
    invalidatePendingTransition();
    const shuffled = shuffleArray([...sailControls]);
    setQuizQueue(shuffled);
    setCurrentQuizIndex(0);
    setActivePart(shuffled[0]);
    setMode("quiz");
    setWrongAnswer(null);
    const initial: Record<string, PartProgress> = {};
    sailControls.forEach((part) => {
      initial[part.id] = { state: "hidden", attempts: 0 };
    });
    setPartProgress(initial);
    setScore(0);
    setQuizAnnouncement(`Quiz started. Question 1 of ${sailControls.length}.`);
  }, [invalidatePendingTransition]);

  const options = useMemo(() => {
    if (!activePart) return [];
    const otherParts = sailControls.filter((p) => p.id !== activePart.id);
    const wrongOptions = shuffleArray(otherParts).slice(0, 3);
    return shuffleArray([activePart, ...wrongOptions]);
  }, [activePart]);

  const handleOptionSelect = useCallback(
    (selectedOption: SailControl) => {
      if (!activePart) return;

      if (selectedOption.id === activePart.id) {
        if (answerLockedRef.current) return;
        answerLockedRef.current = true;
        const attempts = partProgress[activePart.id].attempts;
        const points = attempts === 0 ? POINTS_FIRST_TRY : POINTS_SECOND_TRY;
        setScore((prev) => prev + points);
        setPartProgress((prev) => ({
          ...prev,
          [activePart.id]: { state: "correct", attempts: attempts + 1 },
        }));
        const isLastQuestion = currentQuizIndex === quizQueue.length - 1;
        setQuizAnnouncement(
          isLastQuestion
            ? `Correct. ${points} points. Quiz complete. Final score: ${score + points} points.`
            : `Correct. ${points} points. Next: question ${currentQuizIndex + 2} of ${quizQueue.length}.`
        );
        setWrongAnswer(null);

        const generation = quizGenerationRef.current;
        transitionTimeoutRef.current = setTimeout(() => {
          transitionTimeoutRef.current = null;
          if (generation !== quizGenerationRef.current) return;
          if (currentQuizIndex < quizQueue.length - 1) {
            const nextIndex = currentQuizIndex + 1;
            answerLockedRef.current = false;
            setCurrentQuizIndex(nextIndex);
            setActivePart(quizQueue[nextIndex]);
            setSelectedPart(null);
          } else {
            setActivePart(null);

            const finalScore = score + points;
            const maxScore = sailControls.length * POINTS_FIRST_TRY;
            const percentage = Math.round((finalScore / maxScore) * 100);
            void persistCompletion(percentage, finalScore);
          }
        }, 1000);
      } else {
        setWrongAnswer(selectedOption.id);
        setSelectedPart(selectedOption);
        setPartProgress((prev) => ({
          ...prev,
          [activePart.id]: {
            state: "wrong",
            attempts: prev[activePart.id].attempts + 1,
          },
        }));
        setQuizAnnouncement(`Incorrect. ${selectedOption.name} is not the answer. Try again.`);
      }
    },
    [activePart, partProgress, currentQuizIndex, quizQueue, score, persistCompletion]
  );

  const resetQuiz = useCallback(() => {
    invalidatePendingTransition();
    const initial: Record<string, PartProgress> = {};
    sailControls.forEach((part) => {
      initial[part.id] = { state: "hidden", attempts: 0 };
    });
    setPartProgress(initial);
    setScore(0);
    setActivePart(null);
    setSelectedPart(null);
    setWrongAnswer(null);
    setMode("learn");
    setQuizAnnouncement("");
    toast.success("Reset! Ready to learn.");
  }, [invalidatePendingTransition]);

  const controlsById = useMemo(() => {
    const controlsMap: Record<string, SailControl> = {};
    sailControls.forEach((control) => {
      controlsMap[control.id] = control;
    });
    return controlsMap;
  }, []);

  const correctCount = useMemo(
    () => Object.values(partProgress).filter((p) => p.state === "correct").length,
    [partProgress]
  );
  const wrongPart = useMemo(() => (wrongAnswer ? controlsById[wrongAnswer] ?? null : null), [wrongAnswer, controlsById]);
  const progressPercent = useMemo(() => (correctCount / sailControls.length) * 100, [correctCount]);

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
                onClick={() => {
                  invalidatePendingTransition();
                  navigate("/nautical-terms");
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Sail Controls & Rig Adjustments</h1>
                <p className="text-sm text-muted-foreground">
                  {mode === "learn"
                    ? "Learn lines, deck hardware and rig adjustments"
                    : "Match each purpose to the correct sail control or rig adjustment"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {mode === "quiz" ? (
                <>
                  <Button variant="outline" size="sm" onClick={resetQuiz}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <div className="flex items-center gap-2" aria-label={`Score: ${score} points`}>
                    <Trophy className="w-5 h-5 text-accent" />
                    <span className="font-bold text-lg">{score}</span>
                  </div>
                  <Badge variant="secondary" aria-label={`${correctCount} of ${sailControls.length} answers correct`}>
                    {correctCount}/{sailControls.length}
                  </Badge>
                </>
              ) : (
                <Button onClick={startQuiz} disabled={durableStatus === "loading"}>
                  {durableStatus === "loading" ? "Loading progress…" : "Start Quiz"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {quizAnnouncement}
        </div>
        {mode === "quiz" && (
          <div
            className="w-full bg-muted rounded-full h-3 mb-6"
            role="progressbar"
            aria-label="Quiz progress"
            aria-valuemin={0}
            aria-valuemax={sailControls.length}
            aria-valuenow={correctCount}
            aria-valuetext={`${correctCount} of ${sailControls.length} questions completed`}
          >
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {mode === "learn" ? (
          /* LEARN MODE */
          <div className="space-y-6">
            {/* Large Diagram with floating active card */}
            <div className="relative">
              <Card className="overflow-hidden">
                <CardContent className="p-4 md:p-6">
                  <div className="relative">
                    {/* The main large diagram */}
                    <div data-schematic-scroll className="mx-auto max-w-4xl overflow-x-auto">
                      <SchematicDiagram
                        highlightId={highlightedId}
                        onHover={(id) => {
                          if (id) {
                            const control = controlsById[id];
                            if (control) setHoveredPart(control);
                          } else {
                            setHoveredPart(null);
                          }
                        }}
                        onClick={(id) => {
                          const control = controlsById[id];
                          // Toggle selection: click same = deselect, click different = select
                          if (control) {
                            setSelectedPart(selectedPart?.id === id ? null : control);
                          }
                        }}
                      />
                    </div>

                    {/* Floating Active Card - appears when control is CLICKED (selectedPart) */}
                    {selectedPart && (
                      <div className="absolute top-4 right-4 w-80 z-20 animate-in fade-in slide-in-from-right-4 duration-200">
                        <Card className="shadow-xl border-2" style={{ borderColor: selectedPart.color }}>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <span
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: selectedPart.color }}
                                />
                                {selectedPart.name}
                              </CardTitle>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 -mt-1 -mr-2"
                                aria-label={`Close ${selectedPart.name} details`}
                                onClick={() => setSelectedPart(null)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            {selectedPart.aka && (
                              <Badge variant="outline" className="text-xs font-normal w-fit">
                                Also called: {selectedPart.aka}
                              </Badge>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <Badge variant="secondary">{selectedPart.category}</Badge>
                            <p className="text-muted-foreground">{selectedPart.description}</p>
                            <div className="pt-2 space-y-2 border-t">
                              <div className="flex gap-2">
                                <span className="font-semibold text-primary w-20">Purpose:</span>
                                <span>{selectedPart.purpose}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="font-semibold text-primary w-20">Location:</span>
                                <span>{selectedPart.location}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="font-semibold text-primary w-20">Effect:</span>
                                <span>{selectedPart.effect}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Hint when no card is selected */}
                    {!selectedPart && (
                      <div className="absolute top-4 right-4 z-10">
                        <Card className="bg-muted/80 backdrop-blur-sm shadow-md border-dashed">
                          <CardContent className="py-3 px-4 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Click or use the diagram controls to learn more
                            </span>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info and Control Cards Grid below */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  This catalogue includes <strong>running rigging</strong> (movable lines), <strong>deck hardware</strong>{" "}
                  (the traveller and jib fairlead/car), and a <strong>standing-rigging adjustment</strong> (the backstay
                  adjuster). Click a diagram control or card to see its classification and effect.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sailControls.map((control) => (
                <Card
                  key={control.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Show ${control.name} details from control list`}
                  aria-pressed={selectedPart?.id === control.id}
                  className={`cursor-pointer hover:shadow-md transition-all border-l-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    selectedPart?.id === control.id ? "ring-2 ring-primary shadow-lg" : ""
                  } ${hoveredPart?.id === control.id && selectedPart?.id !== control.id ? "shadow-md" : ""}`}
                  style={{ borderLeftColor: control.color }}
                  onClick={() => setSelectedPart(selectedPart?.id === control.id ? null : control)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedPart(selectedPart?.id === control.id ? null : control);
                    }
                  }}
                  onMouseEnter={() => setHoveredPart(control)}
                  onMouseLeave={() => setHoveredPart(null)}
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: control.color }} />
                      <span className="font-medium text-sm truncate">{control.name}</span>
                    </div>
                    {control.aka && <p className="text-xs text-muted-foreground mt-1 pl-5">({control.aka})</p>}
                    <p className="text-xs text-muted-foreground mt-1 pl-5">{control.category}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* QUIZ MODE */
          <div className="space-y-6">
            {activePart ? (
              <div className="max-w-2xl mx-auto space-y-4">
                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <CardTitle
                        ref={questionHeadingRef}
                        className="text-center focus:outline-none"
                        id="sail-controls-question"
                        tabIndex={-1}
                      >
                        Question {currentQuizIndex + 1} of {quizQueue.length}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-lg font-medium mb-2">
                          Which sail control or rig adjustment has this purpose?
                        </p>
                        <p className="text-muted-foreground italic">"{activePart.purpose}"</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby="sail-controls-question">
                        {options.map((option) => {
                          const isWrong = wrongAnswer === option.id;
                          const isCorrect =
                            partProgress[activePart.id]?.state === "correct" && option.id === activePart.id;
                          return (
                            <Button
                              key={option.id}
                              variant={isWrong ? "destructive" : isCorrect ? "default" : "outline"}
                              size="lg"
                              className={`h-auto py-4 ${isWrong ? "opacity-50" : ""} ${
                                isCorrect ? "bg-green-500 hover:bg-green-600" : ""
                              }`}
                              onClick={() => handleOptionSelect(option)}
                              disabled={isWrong || isCorrect}
                            >
                              {option.name}
                            </Button>
                          );
                        })}
                      </div>

                      {partProgress[activePart.id]?.attempts > 0 &&
                        partProgress[activePart.id]?.state !== "correct" && (
                          <p className="text-sm text-muted-foreground text-center">
                            Attempts: {partProgress[activePart.id].attempts} — Next correct answer: 5 pts
                          </p>
                        )}
                    </CardContent>
                  </Card>

                  {/* Wrong answer explanation */}
                  {wrongPart && (
                    <Card className="border-2 border-orange-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-orange-600">
                          <span className="w-3 h-3 rounded-full bg-orange-500" />
                          {wrongPart.name}
                          <Badge className="bg-orange-100 text-orange-700">Wrong Choice</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-2">{wrongPart.description}</p>
                        <p className="text-orange-600 text-sm font-medium">
                          This isn't the right answer. The clue was: "{activePart.purpose}"
                        </p>
                      </CardContent>
                    </Card>
                  )}
              </div>
            ) : (
              /* Quiz Complete */
              <div className="max-w-xl mx-auto">
                <Card className="border-2 border-green-500">
                  <CardContent className="pt-6 text-center space-y-4">
                    <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
                    <h2 ref={completionHeadingRef} className="text-2xl font-bold focus:outline-none" tabIndex={-1}>
                      Quiz Complete!
                    </h2>
                    <p className="text-xl">
                      Final Score: <span className="text-green-600 font-bold">{score}</span> points
                    </p>
                    <p className="text-muted-foreground">
                      You identified {correctCount} out of {sailControls.length} sail controls.
                    </p>
                    <div className="text-sm" data-testid="durable-status" aria-live="polite">
                      {durableStatus === "anonymous" && "Completed on this device. Sign in to save your progress."}
                      {durableStatus === "saving" && "Saving completion…"}
                      {durableStatus === "queued" && "Completion saved offline and queued to sync."}
                      {durableStatus === "remote" && "Completion saved to your account."}
                      {durableStatus === "failed" && "Completion is still available here, but could not be saved."}
                    </div>
                    {durableStatus === "failed" && pendingCompletion && user && (
                      <Button
                        variant="outline"
                        onClick={() => void persistCompletion(pendingCompletion.percentage, pendingCompletion.score)}
                      >
                        Retry saving
                      </Button>
                    )}
                    <div className="flex gap-3 justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          invalidatePendingTransition();
                          setMode("learn");
                        }}
                      >
                        Review Controls
                      </Button>
                      <Button onClick={startQuiz}>Try Again</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SailControls;
