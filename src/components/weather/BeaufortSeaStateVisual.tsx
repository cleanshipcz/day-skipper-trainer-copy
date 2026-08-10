import { useId } from "react";
import type { BeaufortLevel } from "@/data/beaufortScale";

const amplitudes = [0, 2, 4, 7, 11, 17, 23, 30, 38, 47, 56, 64, 72] as const;
const cycles = [1, 3, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6] as const;
const visualAlternatives = [
  "Glassy water with no developed waves.",
  "A lightly rippled surface with very low undulations.",
  "Smooth water with small rounded wavelets.",
  "A slight sea with distinct low waves and isolated pale crests.",
  "Slight to moderate waves with more frequent white crests.",
  "Moderate, longer waves with many white crests and a little spray.",
  "Rough water with larger waves, broad white crests and foam patches.",
  "Rough to very rough water heaped into steep waves with downwind foam streaks.",
  "Very rough to high waves with breaking crests, foam streaks and blown spray.",
  "High waves with dense foam streaks and spray reducing the clear horizon.",
  "Very high, long overhanging waves with broad white breaking crests and heavy spray.",
  "Very high, exceptionally steep waves with extensive foam and airborne spray.",
  "Phenomenal waves; the surface is largely obscured by foam and driving spray.",
] as const;

const wavePath = (amplitude: number, cycleCount: number) => {
  const baseline = 120;
  const points = Array.from({ length: 61 }, (_, index) => {
    const x = index * 8;
    const phase = (index / 60) * Math.PI * 2 * cycleCount;
    const y = baseline - Math.sin(phase) * amplitude * (0.82 + 0.18 * Math.sin(phase * 0.5));
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  return points.join(" ");
};

export const BeaufortSeaStateVisual = ({ level, className = "" }: { level: BeaufortLevel; className?: string }) => {
  const gradientId = useId().replace(/:/g, "");
  const amplitude = amplitudes[level.force];
  const path = wavePath(amplitude, cycles[level.force]);
  const whitecaps = level.force < 3 ? 0 : Math.min(6, level.force - 2);
  const spray = level.force < 8 ? 0 : level.force - 7;
  return (
    <svg
      viewBox="0 0 480 180"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={visualAlternatives[level.force]}
      className={`block h-auto w-full rounded-md border bg-sky-100 text-sky-950 dark:bg-slate-900 dark:text-sky-100 ${className}`}
      data-testid="beaufort-sea-visual"
    >
      <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bae6fd"/><stop offset="1" stopColor="#e0f2fe"/></linearGradient></defs>
      <rect width="480" height="180" fill={`url(#${gradientId})`} />
      <path d={`${path} L480 180 L0 180 Z`} fill="#0369a1" opacity="0.88" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth={level.force < 3 ? 2 : 3} />
      {Array.from({ length: whitecaps }, (_, index) => {
        const x = 56 + index * 76;
        const y = 117 - amplitude * (0.76 + (index % 2) * 0.1);
        return <path key={`cap-${index}`} d={`M${x - 16} ${y + 3} Q${x} ${y - 9} ${x + 22} ${y + 2} Q${x + 7} ${y - 1} ${x - 5} ${y + 7}`} fill="none" stroke="#fff" strokeWidth={2 + Math.floor(level.force / 5)} strokeLinecap="round" />;
      })}
      {level.force >= 7 && Array.from({ length: Math.min(5, level.force - 5) }, (_, index) => <path key={`foam-${index}`} d={`M${25 + index * 92} ${142 + (index % 2) * 10} l${52 + level.force * 2} -7`} stroke="#fff" strokeWidth="3" opacity="0.8" strokeLinecap="round" />)}
      {Array.from({ length: spray }, (_, index) => <g key={`spray-${index}`} stroke="#fff" strokeWidth="2" opacity="0.75"><path d={`M${70 + index * 72} ${76 - index * 4} l30 -18`} /><path d={`M${58 + index * 72} ${88 - index * 3} l42 -15`} /></g>)}
      <path d="M0 32 H480" stroke="#0c4a6e" strokeWidth="1" opacity={level.force >= 9 ? 0.2 : 0.55} />
    </svg>
  );
};
