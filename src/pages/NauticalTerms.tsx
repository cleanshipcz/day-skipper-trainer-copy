import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, RotateCcw, HelpCircle, X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProgress } from "@/hooks/useProgress";
import { useAuth } from "@/contexts/AuthHooks";
import { supabase } from "@/integrations/supabase/client";

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
    description: "The rear end of the boat. The stern houses the rudder and is where the helmsman typically sits.",
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
    description:
      "The horizontal pole attached to the mast that holds the foot (bottom edge) of the mainsail. Watch your head - it swings during tacks and gybes!",
    partX: 210,
    partY: 160,
    labelX: 150,
    labelY: 180,
    view: "side",
  },
  {
    id: "mainsail",
    name: "Mainsail",
    description:
      "The principal and largest sail, set behind the mast. It provides the main driving force when sailing.",
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
    partX: 360,
    partY: 130,
    labelX: 430,
    labelY: 150,
    view: "side",
  },
  {
    id: "forestay",
    name: "Forestay",
    description:
      "A wire running from the mast top to the bow. It supports the mast from the front and the jib is often attached to it.",
    partX: 420,
    partY: 140,
    labelX: 480,
    labelY: 115,
    view: "side",
  },
  {
    id: "backstay",
    name: "Backstay",
    description:
      "A wire running from the mast top to the stern. It supports the mast from behind and can be tensioned to control mast bend.",
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
    description:
      "A heavy underwater fin that prevents sideways drift and provides stability. The weight at the bottom keeps the boat upright.",
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

// SVG Side View Boat Diagram Component
const SideViewBoat = () => (
  <g>
    {/* Sky gradient */}
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
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
      <linearGradient id="sailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fefce8" />
        <stop offset="100%" stopColor="#fef9c3" />
      </linearGradient>
    </defs>

    {/* Sky */}
    <rect x="0" y="0" width="600" height="220" fill="url(#skyGradient)" />

    {/* Water */}
    <rect x="0" y="220" width="600" height="180" fill="url(#waterGradient)" />

    {/* Water line waves */}
    <path
      d="M0,220 Q30,215 60,220 T120,220 T180,220 T240,220 T300,220 T360,220 T420,220 T480,220 T540,220 T600,220"
      stroke="#0ea5e9"
      strokeWidth="2"
      fill="none"
    />

    {/* Keel - centered under hull */}
    <path d="M280,255 L300,355 L320,255" fill="#1e3a5f" stroke="#0f172a" strokeWidth="2" />

    {/* Rudder - clearly separate from hull */}
    <path d="M75,235 L65,310 L90,310 L80,235" fill="#1e3a5f" stroke="#0f172a" strokeWidth="2" />

    {/* Hull - sleek sailboat shape */}
    <path
      d="M90,220 
         C85,230 85,245 95,255 
         L505,255 
         C515,245 520,235 525,220 
         L480,195 
         L120,195 
         Z"
      fill="url(#hullGradient)"
      stroke="#1e3a5f"
      strokeWidth="2.5"
    />

    {/* Hull stripe */}
    <path d="M100,238 L510,238" stroke="#1e3a5f" strokeWidth="1" opacity="0.3" />

    {/* Deck surface */}
    <path
      d="M120,195 L480,195 Q490,195 495,200 L525,220 L90,220 L120,195"
      fill="#f1f5f9"
      stroke="#1e3a5f"
      strokeWidth="1.5"
    />

    {/* Cockpit well - more distinct, deeper */}
    <rect x="155" y="198" width="90" height="22" rx="3" fill="#94a3b8" stroke="#1e3a5f" strokeWidth="1.5" />
    <rect x="160" y="202" width="80" height="14" rx="2" fill="#64748b" stroke="none" />
    {/* Cockpit seats */}
    <line x1="175" y1="198" x2="175" y2="220" stroke="#1e3a5f" strokeWidth="1" opacity="0.5" />
    <line x1="225" y1="198" x2="225" y2="220" stroke="#1e3a5f" strokeWidth="1" opacity="0.5" />
    <text x="200" y="213" textAnchor="middle" fill="#1e3a5f" fontSize="8" opacity="0.6">
      COCKPIT
    </text>

    {/* Cabin/Coach roof */}
    <path
      d="M260,170 Q265,165 275,165 L420,165 Q430,165 435,170 L450,195 L250,195 Z"
      fill="#f8fafc"
      stroke="#1e3a5f"
      strokeWidth="2"
    />

    {/* Cabin windows */}
    <rect x="285" y="172" width="25" height="18" rx="3" fill="#7dd3fc" stroke="#1e3a5f" strokeWidth="1.5" />
    <rect x="325" y="172" width="25" height="18" rx="3" fill="#7dd3fc" stroke="#1e3a5f" strokeWidth="1.5" />
    <rect x="365" y="172" width="25" height="18" rx="3" fill="#7dd3fc" stroke="#1e3a5f" strokeWidth="1.5" />

    {/* Mast - raised higher with clear deck gap */}
    <line x1="270" y1="30" x2="270" y2="175" stroke="#374151" strokeWidth="7" strokeLinecap="round" />

    {/* Boom - attached to mast above deck level, goes to mainsail foot */}
    <line x1="270" y1="160" x2="170" y2="160" stroke="#374151" strokeWidth="5" strokeLinecap="round" />
    <circle cx="170" cy="160" r="4" fill="#6b7280" />

    {/* Backstay - wire from mast top to stern */}
    <line x1="270" y1="35" x2="95" y2="215" stroke="#64748b" strokeWidth="2" />

    {/* Forestay - wire from mast top to bow (separate from jib!) */}
    <line x1="270" y1="35" x2="520" y2="210" stroke="#64748b" strokeWidth="2" />

    {/* Mainsail - smaller, doesn't cover backstay */}
    <path d="M268,45 L268,157 L175,157 Z" fill="url(#sailGradient)" stroke="#1e3a5f" strokeWidth="2" />
    {/* Mainsail battens */}
    <line x1="268" y1="70" x2="220" y2="82" stroke="#d4d4d8" strokeWidth="1" />
    <line x1="268" y1="100" x2="205" y2="110" stroke="#d4d4d8" strokeWidth="1" />
    <line x1="268" y1="130" x2="190" y2="138" stroke="#d4d4d8" strokeWidth="1" />

    {/* Jib - positioned FORWARD of forestay, clearly a sail shape */}
    <path d="M267,45 L267,155 L420,155 Z" fill="#fef9c3" stroke="#1e3a5f" strokeWidth="2" opacity="0.95" />
    {/* Jib telltales */}
    <line x1="320" y1="95" x2="335" y2="98" stroke="#ef4444" strokeWidth="2" />
    <line x1="340" y1="115" x2="355" y2="118" stroke="#ef4444" strokeWidth="2" />

    {/* Tiller - clearly extending from rudder into cockpit */}
    <line x1="80" y1="220" x2="175" y2="200" stroke="#92400e" strokeWidth="6" strokeLinecap="round" />
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
    </defs>

    {/* Sky */}
    <rect x="0" y="0" width="400" height="225" fill="url(#skyGradientFront)" />

    {/* Water */}
    <rect x="0" y="225" width="400" height="175" fill="url(#waterGradientFront)" />

    {/* Water line waves */}
    <path d="M0,225 Q50,220 100,225 T200,225 T300,225 T400,225" stroke="#0ea5e9" strokeWidth="2" fill="none" />

    {/* Keel */}
    <path d="M185,260 L200,350 L215,260" fill="#1e3a5f" stroke="#0f172a" strokeWidth="2" />

    {/* Hull - rounded bottom */}
    <path
      d="M80,225 
         Q70,240 80,260 
         L320,260 
         Q330,240 320,225
         Q280,195 200,195
         Q120,195 80,225"
      fill="#f8fafc"
      stroke="#1e3a5f"
      strokeWidth="2.5"
    />

    {/* Hull shading for 3D effect */}
    <path d="M90,235 Q200,255 310,235" fill="none" stroke="#cbd5e1" strokeWidth="15" opacity="0.5" />

    {/* Deck */}
    <ellipse cx="200" cy="195" rx="85" ry="20" fill="#f1f5f9" stroke="#1e3a5f" strokeWidth="2" />

    {/* Cabin back (companionway) */}
    <rect x="160" y="160" width="80" height="40" rx="8" fill="#f8fafc" stroke="#1e3a5f" strokeWidth="2" />
    <rect x="180" y="170" width="40" height="28" rx="3" fill="#475569" stroke="#1e3a5f" strokeWidth="1.5" />
    <text x="200" y="188" textAnchor="middle" fill="#94a3b8" fontSize="8">
      HATCH
    </text>

    {/* Mast */}
    <line x1="200" y1="30" x2="200" y2="165" stroke="#374151" strokeWidth="8" strokeLinecap="round" />

    {/* Spreaders */}
    <line x1="120" y1="90" x2="280" y2="90" stroke="#374151" strokeWidth="4" strokeLinecap="round" />

    {/* Shrouds - port side (now on RIGHT when looking from behind, but visually on left of screen) */}
    <line x1="200" y1="35" x2="305" y2="225" stroke="#64748b" strokeWidth="2" />
    <line x1="280" y1="90" x2="305" y2="225" stroke="#64748b" strokeWidth="2" />

    {/* Shrouds - starboard side (now on LEFT when looking from behind, but visually on right of screen) */}
    <line x1="200" y1="35" x2="95" y2="225" stroke="#64748b" strokeWidth="2" />
    <line x1="120" y1="90" x2="95" y2="225" stroke="#64748b" strokeWidth="2" />

    {/* Port side marker (red navigation light) - on LEFT of screen = YOUR left when looking from behind */}
    <circle cx="95" cy="210" r="10" fill="#ef4444" stroke="#1e3a5f" strokeWidth="2" />
    <text x="95" y="214" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
      P
    </text>

    {/* Starboard side marker (green navigation light) - on RIGHT of screen = YOUR right when looking from behind */}
    <circle cx="305" cy="210" r="10" fill="#22c55e" stroke="#1e3a5f" strokeWidth="2" />
    <text x="305" y="214" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
      S
    </text>

    {/* Backstay - visible from behind */}
    <line x1="200" y1="35" x2="200" y2="195" stroke="#64748b" strokeWidth="2" strokeDasharray="4,4" />

    {/* Mast top */}
    <circle cx="200" cy="28" r="6" fill="#374151" />

    {/* Beam indicator */}
    <line x1="85" y1="250" x2="315" y2="250" stroke="#64748b" strokeWidth="1" strokeDasharray="5,5" />
    <path d="M90,245 L85,250 L90,255" stroke="#64748b" strokeWidth="1.5" fill="none" />
    <path d="M310,245 L315,250 L310,255" stroke="#64748b" strokeWidth="1.5" fill="none" />

    {/* Label to clarify view */}
    <text x="200" y="385" textAnchor="middle" fill="#64748b" fontSize="11" fontStyle="italic">
      (View from behind - as if you're at the helm)
    </text>
  </g>
);

const NauticalTerms = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loadProgress, saveProgress } = useProgress();
  const [partProgress, setPartProgress] = useState<Record<string, PartProgress>>(() => {
    const initial: Record<string, PartProgress> = {};
    allParts.forEach((part) => {
      initial[part.id] = { state: "hidden", attempts: 0 };
    });
    return initial;
  });
  const [activePart, setActivePart] = useState<BoatPart | null>(null);
  const [selectedPart, setSelectedPart] = useState<BoatPart | null>(null);
  const [score, setScore] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState<string | null>(null);

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
      const progress = partProgress[part.id];
      setSelectedPart(part);
      if (progress.state === "correct") {
        return;
      }
      setActivePart(part);
      setWrongAnswer(null);
      if (progress.state === "hidden") {
        setPartProgress((prev) => ({
          ...prev,
          [part.id]: { ...prev[part.id], state: "guessing" },
        }));
      }
    },
    [partProgress]
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
    },
    [activePart, partProgress]
  );

  const handleCloseOptions = useCallback(() => {
    setActivePart(null);
    setWrongAnswer(null);
    saveProgress("lights-theory", true, 100, 10);
  }, [saveProgress]);

  const resetGame = useCallback(() => {
    const initial: Record<string, PartProgress> = {};
    allParts.forEach((part) => {
      initial[part.id] = { state: "hidden", attempts: 0 };
    });
    setPartProgress(initial);
    setScore(0);
    setActivePart(null);
    setSelectedPart(null);
    setWrongAnswer(null);
    toast.success("Game reset! Good luck!");
    saveProgress("colregs-theory", true, 100, 10);
  }, [saveProgress]);

  const correctCount = Object.values(partProgress).filter((p) => p.state === "correct").length;
  const wrongPart = wrongAnswer ? allParts.find((p) => p.id === wrongAnswer) : null;
  const progressPercent = (correctCount / allParts.length) * 100;

  // Load saved progress on mount
  useEffect(() => {
    const loadSavedProgress = async () => {
      const savedData = await loadProgress("nautical-terms-boat-parts");
      if (savedData?.answers_history) {
        try {
          const saved =
            typeof savedData.answers_history === "string"
              ? JSON.parse(savedData.answers_history)
              : savedData.answers_history;
          if (saved.partProgress) {
            setPartProgress(saved.partProgress);
          }
          if (saved.score !== undefined) {
            setScore(saved.score);
          }
        } catch (error) {
          console.error("Error parsing saved progress:", error);
        }
      }
    };
    loadSavedProgress();
  }, [loadProgress]);

  // Save progress whenever it changes
  useEffect(() => {
    if (user) {
      const progressData = { partProgress, score };
      const completed = correctCount === allParts.length;
      const scorePercentage = Math.round((score / (allParts.length * 10)) * 100);

      saveProgress("nautical-terms-boat-parts", completed, scorePercentage, 0, progressData);
    }
  }, [partProgress, score, user, correctCount, saveProgress]);

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

    return (
      <g key={part.id} style={{ cursor: "pointer" }} onClick={() => handlePartClick(part)}>
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
              <Button variant="ghost" size="icon" onClick={() => navigate("/nautical-terms")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Nautical Terms Quiz</h1>
                <p className="text-sm text-muted-foreground">Click markers to identify each part</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={resetGame}>
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
        <div className="w-full bg-muted rounded-full h-3 mb-6">
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
              <div className="relative rounded-lg border-2 border-slate-200 overflow-hidden">
                <svg viewBox="0 0 600 400" className="w-full h-auto">
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
              <div className="relative rounded-lg border-2 border-slate-200 overflow-hidden">
                <svg viewBox="0 0 400 400" className="w-full h-auto">
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
                  <h3 className="font-semibold text-lg">What is this part?</h3>
                  <Button variant="ghost" size="icon" onClick={handleCloseOptions}>
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
