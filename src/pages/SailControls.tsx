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
import { sailControls } from "@/data/sailControls";

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
type DurableCompletionKnowledge = "absent" | "existing" | "unknown";
type RemoteSaveSemantics = "new" | "preserved" | "unknown";

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

// Interactive yacht profile: presentation layers stay separate from the stable control targets.
const SchematicDiagram = ({
  highlightId,
  onHover,
  onClick,
}: {
  highlightId?: string;
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}) => (
  <svg
    viewBox="0 0 600 700"
    className="h-auto w-full min-w-[600px] max-w-none rounded-xl [--diagram-coast:#8aa8a4] [--diagram-sea-bottom:#0d5274] [--diagram-sea-top:#3ba4c7] [--diagram-sky-bottom:#d9edf5] [--diagram-sky-top:#dff3ff] md:min-w-0 dark:[--diagram-coast:#304b55] dark:[--diagram-sea-bottom:#071c2b] dark:[--diagram-sea-top:#123d53] dark:[--diagram-sky-bottom:#172536] dark:[--diagram-sky-top:#081321] forced-colors:[--diagram-coast:CanvasText] forced-colors:[--diagram-sea-bottom:Canvas] forced-colors:[--diagram-sea-top:Canvas] forced-colors:[--diagram-sky-bottom:Canvas] forced-colors:[--diagram-sky-top:Canvas]"
    aria-label="Interactive side view of a cruising yacht showing sail controls and rig adjustments"
    aria-describedby="sail-controls-diagram-help"
  >
    <defs>
      <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--diagram-sky-top)" />
        <stop offset="72%" stopColor="var(--diagram-sky-bottom)" />
        <stop offset="100%" stopColor="var(--diagram-sky-bottom)" />
      </linearGradient>
      <linearGradient id="seaGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--diagram-sea-top)" />
        <stop offset="100%" stopColor="var(--diagram-sea-bottom)" />
      </linearGradient>
      <linearGradient id="hullGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="55%" stopColor="#dbe4ec" />
        <stop offset="57%" stopColor="#173b56" />
        <stop offset="100%" stopColor="#0b263c" />
      </linearGradient>
      <linearGradient id="mastGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="48%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="sailGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fffdf4" />
        <stop offset="58%" stopColor="#f5f0da" />
        <stop offset="100%" stopColor="#d7e1e6" />
      </linearGradient>
      <linearGradient id="jibGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="72%" stopColor="#e8f0f2" />
        <stop offset="100%" stopColor="#c8d8df" />
      </linearGradient>
      <filter id="boatShadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#082f49" floodOpacity="0.28" />
      </filter>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Coastal atmosphere and water establish a credible yacht side profile. */}
    <rect x="0" y="0" width="600" height="700" rx="18" fill="url(#skyGradient)" className="forced-colors:fill-[Canvas]" />
    <circle cx="502" cy="92" r="37" fill="#fff7c2" opacity="0.78" />
    <path d="M0 535 C70 506 120 520 183 500 C255 478 326 518 390 492 C470 460 530 491 600 470 L600 565 L0 565Z" fill="var(--diagram-coast)" opacity="0.3" className="forced-colors:fill-[CanvasText]" />
    <path d="M0 555 C95 526 155 548 232 530 C330 507 404 552 492 520 C535 505 570 511 600 520 L600 580 L0 580Z" fill="var(--diagram-coast)" opacity="0.2" className="forced-colors:fill-[CanvasText]" />
    <rect x="0" y="565" width="600" height="135" fill="url(#seaGradient)" className="forced-colors:fill-[Canvas]" />
    <g fill="none" strokeLinecap="round">
      <path d="M0 585 C45 575 77 596 122 585 S204 575 252 587 S337 596 387 583 S474 575 526 587 S570 592 600 584" stroke="#d7f5ff" strokeWidth="3" opacity="0.8" />
      <path d="M15 654 C66 643 102 663 153 652 M420 655 C468 643 516 662 580 650" stroke="#8ed6e8" strokeWidth="2" opacity="0.62" />
    </g>

    <g filter="url(#boatShadow)">
      {/* A raked bow, counter stern and underwater body replace the box hull. */}
      <path d="M89 573 Q112 567 139 558 L461 553 Q493 555 523 570 L505 598 Q472 626 406 639 L184 639 Q124 627 98 602Z" fill="url(#hullGradient)" stroke="#163a52" strokeWidth="3" />
      <path d="M104 591 Q210 604 501 580" fill="none" stroke="#e44d43" strokeWidth="4" opacity="0.9" />
      <path d="M122 565 Q183 544 264 546 L430 548 L465 559 L139 568Z" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
      {/* Low coachroof, cockpit, ports and deck fittings. */}
      <path d="M282 548 L307 517 L391 517 Q414 529 427 550Z" fill="#eef4f6" stroke="#40586b" strokeWidth="2" />
      <path d="M315 522 H384 Q396 526 403 538 H306Z" fill="#28546d" opacity="0.9" />
      <path d="M441 550 H488 L475 564 H432Z" fill="#9db1bb" stroke="#40586b" strokeWidth="2" />
      <ellipse cx="211" cy="583" rx="13" ry="7" fill="#173b56" stroke="#9fb9c7" strokeWidth="2" />
      <ellipse cx="253" cy="586" rx="13" ry="7" fill="#173b56" stroke="#9fb9c7" strokeWidth="2" />
      <ellipse cx="404" cy="584" rx="13" ry="7" fill="#173b56" stroke="#9fb9c7" strokeWidth="2" />
      <path d="M130 557 V539 M469 553 V535 M130 540 L469 536" stroke="#718899" strokeWidth="2" fill="none" />
    </g>

    {/* Aluminium spars with subtle highlight and real mast hardware. */}
    <path d="M296 520 L296 60 Q300 47 304 60 L304 520Z" fill="url(#mastGradient)" stroke="#334155" strokeWidth="1.5" />
    <circle cx="300" cy="55" r="6" fill="#263746" stroke="#dbe5eb" strokeWidth="2" />
    <line x1="299" y1="440" x2="140" y2="440" stroke="#263746" strokeWidth="10" strokeLinecap="round" />
    <line x1="299" y1="437" x2="142" y2="437" stroke="#aebcc6" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
    <text x="315" y="270" fontSize="10" fill="#355264" opacity="0.78" fontWeight="700" letterSpacing="1.4" className="forced-colors:fill-[CanvasText]">
      MAST
    </text>
    <text x="213" y="458" textAnchor="middle" fontSize="10" fill="#355264" opacity="0.78" fontWeight="700" letterSpacing="1.4" className="forced-colors:fill-[CanvasText]">
      BOOM
    </text>

    {/* Mainsail */}
    <path d="M296,75 C281,195 285,319 296,436 L144,436 C203,347 253,210 296,75 Z" fill="url(#sailGradient2)" stroke="#304c60" strokeWidth="2" />
    <g fill="none" stroke="#9eacb4" strokeWidth="1.2" opacity="0.62">
      <path d="M292 152 Q251 164 225 190" /><path d="M294 239 Q228 250 190 285" />
      <path d="M295 329 Q204 341 157 382" /><path d="M181 352 L268 352 M166 392 L248 392" />
    </g>
    <text x="220" y="300" fontSize="13" fill="#355264" opacity="0.72" fontWeight="600" letterSpacing="1.5">
      MAINSAIL
    </text>

    {/* Jib: luff follows the forestay; tack is forward and clew is aft. */}
    <path
      data-geometry="jib"
      d="M306,78 L500,540 L410,440 Z"
      fill="url(#jibGradient)"
      stroke="#304c60"
      strokeWidth="2"
    />
    <path d="M336 150 Q399 281 472 476 M362 214 Q407 274 442 342" fill="none" stroke="#a4b3bb" strokeWidth="1.2" opacity="0.65" />
    <text x="390" y="330" fontSize="13" fill="#355264" opacity="0.72" fontWeight="600" letterSpacing="1.5">
      JIB
    </text>

    {/* Forestay */}
    <line data-geometry="forestay" x1="300" y1="60" x2="520" y2="560" stroke="#526b7a" strokeWidth="2.5" />

    {/* Backstay */}
    <line x1="300" y1="60" x2="110" y2="640" stroke="#526b7a" strokeWidth="2.5" />

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
  const { loadProgressDetailed, saveProgressDetailed } = useProgress();
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
  const [loadRevision, setLoadRevision] = useState(0);
  const [durableCompletionKnowledge, setDurableCompletionKnowledge] = useState<DurableCompletionKnowledge>(
    user ? "unknown" : "absent"
  );
  const [remoteSaveSemantics, setRemoteSaveSemantics] = useState<RemoteSaveSemantics>("new");

  const persistCompletion = useCallback(async (percentage: number, finalScore: number) => {
    if (!user) {
      setDurableStatus("anonymous");
      return;
    }
    const ownerId = user.id;
    const knowledgeBeforeSave = durableCompletionKnowledge;
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
    if (result === "remote") {
      setRemoteSaveSemantics(
        knowledgeBeforeSave === "absent" ? "new" : knowledgeBeforeSave === "existing" ? "preserved" : "unknown"
      );
      setDurableCompletionKnowledge("existing");
    } else if (result === "queued") {
      // Replay can make this durable at any point, so a later save cannot
      // safely be described as the first remote record.
      setDurableCompletionKnowledge("unknown");
    }
    setDurableStatus(result === "remote" ? "remote" : result === "queued" ? "queued" : result === "anonymous" ? "anonymous" : "failed");
  }, [durableCompletionKnowledge, saveProgressDetailed, user]);

  useEffect(() => {
    let cancelled = false;
    const ownerId = user?.id ?? null;
    setPendingCompletion(null);
    if (!ownerId) {
      setDurableStatus("anonymous");
      return () => { cancelled = true; };
    }

    setDurableStatus("loading");
    void loadProgressDetailed(TOPIC_IDS.NAUTICAL_TERMS_SAIL_CONTROLS).then((loadResult) => {
      if (cancelled || ownerRef.current !== ownerId) return;
      if (loadResult.status === "failed") {
        setDurableCompletionKnowledge("unknown");
        setDurableStatus("failed");
        return;
      }
      const record = loadResult.record;
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
        setDurableCompletionKnowledge("existing");
        setRemoteSaveSemantics("preserved");
        setDurableStatus("remote");
      } else {
        setDurableCompletionKnowledge("absent");
        setRemoteSaveSemantics("new");
        setDurableStatus("ready");
      }
    }).catch((error) => {
      console.error("Error loading Sail Controls progress:", error);
      if (!cancelled && ownerRef.current === ownerId) setDurableStatus("failed");
    });
    return () => { cancelled = true; };
  }, [loadProgressDetailed, loadRevision, user?.id]);

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
        {durableStatus === "failed" && !pendingCompletion && user && (
          <Card className="mb-6 border-orange-500" role="alert">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
              <p>Saved progress could not be loaded. You can continue locally or retry.</p>
              <Button variant="outline" onClick={() => setLoadRevision((revision) => revision + 1)}>
                Retry loading progress
              </Button>
            </CardContent>
          </Card>
        )}
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
                    <p id="sail-controls-diagram-help" className="mb-2 text-center text-xs text-muted-foreground md:hidden">
                      Swipe horizontally to explore the full diagram. Tap a labelled control for details.
                    </p>
                    <div
                      data-schematic-scroll
                      className="mx-auto w-full max-w-4xl overflow-x-auto overscroll-x-contain rounded-md"
                    >
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

                    {/* Details follow the diagram so they never cover the selected control. */}
                    {selectedPart && (
                      <div data-control-details className="mx-auto mt-4 w-full max-w-2xl animate-in fade-in duration-200">
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
                      <div className="mx-auto mt-4 w-fit max-w-full">
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
                      {durableStatus === "remote" && remoteSaveSemantics === "new" && "Completion saved to your account."}
                      {durableStatus === "remote" && remoteSaveSemantics === "preserved" &&
                        "A completion is saved to your account. Retakes do not replace that durable record."}
                      {durableStatus === "remote" && remoteSaveSemantics === "unknown" &&
                        "A completion is saved to your account. Because earlier progress may already exist or have synced, this may be the previously saved record."}
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
