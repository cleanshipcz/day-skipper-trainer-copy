import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheoryCompletionGate } from "@/features/progress/useTheoryCompletionGate";
import { TOPIC_IDS } from "@/constants/topicRegistry";

const NorthSeaAmphidromicDiagram = () => (
  <figure className="min-w-0 space-y-3 rounded-lg border p-3 forced-colors:border-[CanvasText]" aria-labelledby="amphidromic-caption">
    <svg
      viewBox="0 0 640 430"
      role="img"
      aria-labelledby="amphidromic-title amphidromic-description"
      className="block h-auto max-w-full rounded-lg border bg-slate-50 forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]"
    >
      <title id="amphidromic-title">North Sea amphidromic system teaching schematic</title>
      <desc id="amphidromic-description">
        An anti-clockwise tidal wave rotates around an amphidromic point. Blue co-tidal lines show phase in lunar
        hours after high water at a stated reference port; orange co-range contours show tidal range in metres,
        increasing away from the point. This is explanatory, not a navigation chart.
      </desc>
      <defs>
        <marker id="tidal-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path className="forced-colors:fill-[LinkText]" d="M 0 0 L 10 5 L 0 10 z" fill="#075985" />
        </marker>
      </defs>
      <rect className="forced-colors:fill-[Canvas]" width="640" height="430" fill="#e0f2fe" />
      <path className="forced-colors:fill-[ButtonFace] forced-colors:stroke-[CanvasText]" d="M72 20 L157 33 176 85 151 135 167 194 144 255 100 303 69 374 20 407 20 20Z" fill="#d6d3d1" stroke="#78716c" />
      <path className="forced-colors:fill-[ButtonFace] forced-colors:stroke-[CanvasText]" d="M493 18 L620 18 620 408 471 408 491 352 465 305 502 256 475 203 513 149 485 91Z" fill="#d6d3d1" stroke="#78716c" />
      <text className="forced-colors:fill-[CanvasText]" x="48" y="93" fontSize="18" fill="#44403c">Great Britain</text>
      <text className="forced-colors:fill-[CanvasText]" x="520" y="85" fontSize="18" fill="#44403c">Europe</text>

      <circle className="forced-colors:fill-[CanvasText]" cx="330" cy="218" r="8" fill="#111827" />
      <text x="342" y="214" fontSize="15" fontWeight="600">amphidromic point</text>
      <text x="342" y="233" fontSize="13">range approaches 0 m</text>

      <g className="forced-colors:stroke-[VisitedText]" fill="none" stroke="#ea580c" strokeWidth="3" strokeDasharray="8 5">
        <ellipse cx="330" cy="218" rx="55" ry="39" />
        <ellipse cx="330" cy="218" rx="112" ry="79" />
        <ellipse cx="330" cy="218" rx="176" ry="124" />
      </g>
      <g className="forced-colors:fill-[VisitedText]" fill="#9a3412" fontSize="14" fontWeight="600">
        <text x="318" y="170">0.5 m</text><text x="318" y="127">1 m</text><text x="318" y="83">2 m</text>
      </g>

      <g className="forced-colors:stroke-[LinkText]" stroke="#0369a1" strokeWidth="2">
        <line x1="330" y1="218" x2="330" y2="52" /><line x1="330" y1="218" x2="494" y2="218" />
        <line x1="330" y1="218" x2="330" y2="383" /><line x1="330" y1="218" x2="166" y2="218" />
      </g>
      <g className="forced-colors:fill-[LinkText]" fill="#075985" fontSize="14" fontWeight="600">
        <text x="337" y="66">0 h</text><text x="174" y="211">3 h</text><text x="337" y="375">6 h</text><text x="463" y="211">9 h</text>
      </g>
      <g aria-hidden="true" className="forced-colors:stroke-[LinkText]" fill="none" stroke="#075985" strokeWidth="5" markerEnd="url(#tidal-arrow)">
        <path d="M223 306 A150 115 0 0 0 448 304" /><path d="M437 132 A150 115 0 0 0 213 135" />
      </g>
      <text x="224" y="416" fontSize="15" fontWeight="700" fill="#075985">anti-clockwise propagation</text>
    </svg>
    <figcaption id="amphidromic-caption" className="space-y-2 break-words text-xs text-muted-foreground forced-colors:text-[CanvasText]">
      <p><strong>Text equivalent:</strong> Looking down on the North Sea, the tidal wave propagates anti-clockwise around a central amphidromic point. Co-tidal lines radiate from that point: 0 lunar hours is north, 3 hours west, 6 hours south, and 9 hours east, all measured after high water at the notional reference port. Concentric co-range contours increase outwards from about 0 metres at the point to 0.5, 1, and 2 metres.</p>
      <p>
      Original teaching schematic created in-project for issue #244 on 9 August 2026; no external chart or dataset was
      copied. Licensed CC BY 4.0: attribute “Day Skipper Trainer tides schematic, Cleanship, 2026”. Not for navigation.
      Blue lines join places at the same tidal phase, expressed here as lunar hours after a notional reference-port
      HW; orange contours join equal ranges in metres. The values explain the symbols and are not real-port predictions.
      </p>
    </figcaption>
  </figure>
);

const TidalTheory = () => {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState<"" | "table" | "diagram">("");
  const [announcement, setAnnouncement] = useState("");
  const { canComplete, markCompleted, markSectionVisited, visitedSectionIds, saveState, isHydrated, isCompletionDurable } = useTheoryCompletionGate({
    topicId: TOPIC_IDS.TIDES_THEORY,
    requiredSectionIds: ["safe-local-tide-decision"],
    pointsOnComplete: 10,
    catalogueRevision: "tides-theory-evidence-v1",
  });

  const selectAnswer = (next: "table" | "diagram") => {
    setAnswer(next);
    if (next === "table") void markSectionVisited("safe-local-tide-decision");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 min-w-0 border-b border-border bg-card/95 backdrop-blur-sm forced-colors:border-[CanvasText]">
        <div className="container mx-auto flex min-w-0 flex-col items-stretch gap-3 px-3 py-3 sm:px-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-2 sm:items-center sm:gap-3">
            <Button aria-label="Back to Tides" className="min-h-11 min-w-11 shrink-0 focus-visible:ring-2 focus-visible:ring-ring" variant="ghost" size="icon" onClick={() => navigate("/navigation/tides") }>
              <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            </Button>
            <div className="min-w-0"><h1 className="break-words text-xl font-bold">Understanding Tidal Phenomena</h1><p className="break-words text-sm text-muted-foreground">From astronomical forcing to a local decision</p></div>
          </div>
          <Button
            variant={isCompletionDurable ? "outline" : "default"}
            aria-describedby="completion-status"
            className={`min-h-11 w-full min-w-0 whitespace-normal break-words forced-colors:border-[CanvasText] md:w-auto ${isCompletionDurable ? "border-green-200 bg-green-50 text-green-700 forced-colors:text-[CanvasText]" : ""}`}
            disabled={!isHydrated || !canComplete || saveState === "saving" || isCompletionDurable}
            onClick={async () => {
              const durable = await markCompleted();
              setAnnouncement(durable ? "" : "Completion was not saved. Your concept-check evidence remains available; retry when ready.");
            }}
          >
            {isCompletionDurable && <CheckCircle2 aria-hidden="true" className="mr-2 h-4 w-4 shrink-0" />}
            {!isHydrated ? "Loading progress…" : saveState === "saving" ? "Saving…" : isCompletionDurable && saveState === "saved" ? "Saved" : isCompletionDurable && saveState === "queued" ? "Queued offline" : isCompletionDurable && saveState === "local" ? "Completed on this device" : saveState === "failed" && canComplete ? "Retry completion" : canComplete ? "Save completion" : "Complete the concept check"}
            {isHydrated && canComplete && saveState !== "saving" && !isCompletionDurable && <ChevronRight aria-hidden="true" className="ml-2 h-4 w-4 shrink-0" />}
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl min-w-0 space-y-8 px-3 py-8 sm:px-4">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">Why tides occur</h2>
          <Card><CardContent className="pt-6 space-y-4">
            <p>The tide-generating force is the <strong>difference</strong> in lunar and solar gravity across Earth, not a uniform pull on the ocean. The Moon-facing side is pulled more strongly than Earth's centre; the far side is pulled less strongly. Relative to the Earth–Moon system, this produces <strong>two equilibrium bulges</strong>. The Sun produces the same kind of differential pattern, but the nearer Moon usually has the larger tide-generating effect.</p>
            <div className="min-w-0 rounded-lg border bg-sky-50 p-3 text-center forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] sm:p-5" role="img" aria-label="Ideal equilibrium model: on the Earth–Moon alignment, the far-side tidal bulge is opposite the Moon, Earth is between both bulges, and the near-side bulge points toward the Moon">
              <div aria-hidden="true" className="flex min-w-0 flex-col items-center justify-center gap-2 sm:flex-row sm:flex-wrap sm:gap-5"><span className="max-w-full rounded-[50%] bg-blue-200 px-4 py-3 text-sm font-semibold forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas]">far-side bulge</span><span className="grid size-20 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]">Earth</span><span className="max-w-full rounded-[50%] bg-blue-200 px-4 py-3 text-sm font-semibold forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas]">near-side bulge</span><span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-500 text-xs text-white forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]">Moon</span></div>
            </div>
            <p className="text-sm text-muted-foreground"><strong>Do not picture these bulges sweeping literally around every coast.</strong> They are an equilibrium model. Real tidal waves cross ocean basins and are changed by coastline, depth, friction, resonance and Earth's rotation.</p>
            <p>A lunar day is about <strong>24 h 50 min</strong>. Many UK locations are semidiurnal, with two HWs and two LWs in a lunar day (successive HWs roughly 12 h 25 min apart), but other places have mixed or diurnal regimes. Always use the local tide table.</p>
          </CardContent></Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">Language and the spring–neap cycle</h2>
          <div className="grid min-w-0 gap-6 md:grid-cols-2">
            <Card className="min-w-0 forced-colors:border-[CanvasText]"><CardHeader className="min-w-0"><CardTitle className="break-words">Essential terms</CardTitle></CardHeader><CardContent className="min-w-0"><dl className="space-y-3 break-words text-sm"><div><dt className="font-semibold">High water (HW)</dt><dd>The local maximum water level in a tidal cycle.</dd></div><div><dt className="font-semibold">Low water (LW)</dt><dd>The local minimum water level in a tidal cycle.</dd></div><div><dt className="font-semibold">Range</dt><dd>HW height minus the adjacent LW height.</dd></div><div><dt className="font-semibold">Tidal stream</dt><dd>Horizontal water movement; it is distinct from vertical tidal height.</dd></div></dl></CardContent></Card>
            <Card className="min-w-0 forced-colors:border-[CanvasText]"><CardHeader className="min-w-0"><CardTitle className="break-words">Springs and neaps</CardTitle></CardHeader><CardContent className="min-w-0 space-y-3 break-words text-sm"><p><strong>Springs:</strong> near new and full moon, the lunar and solar tide-generating patterns reinforce, usually giving a larger range.</p><p><strong>Neaps:</strong> near first and last quarter, the patterns partly cancel, usually giving a smaller range.</p><p className="text-muted-foreground">The largest/smallest local range can lag the lunar phase (the “age of the tide”). Springs often mean stronger streams, but local tables and atlases—not the Moon phase alone—govern your prediction.</p></CardContent></Card>
          </div>
        </section>

        <section className="space-y-4"><h2 className="text-2xl font-bold text-primary">From astronomy to observed water</h2>
          <Card><CardContent className="pt-6"><ol className="space-y-3 text-sm list-decimal pl-5"><li><strong>Astronomical forcing:</strong> predictable lunar and solar constituents set the underlying rhythm.</li><li><strong>Local response:</strong> basin shape, coastline, bathymetry, friction and resonance change phase, range and even whether the regime is semidiurnal.</li><li><strong>Meteorological residual:</strong> wind and atmospheric pressure (plus river flow and waves locally) can put observed water above or below the astronomical prediction.</li><li><strong>Decision uncertainty:</strong> predictions are not guarantees. Check the current forecast and observations, allow a safety margin, and reconsider if conditions differ.</li></ol></CardContent></Card>
        </section>

        <section className="space-y-4"><h2 className="text-2xl font-bold text-primary">Amphidromic systems</h2><Card><CardContent className="pt-6 space-y-5"><p>In many basins the tidal wave rotates around amphidromic points where range is small. A qualified Northern Hemisphere tendency is <strong>anti-clockwise</strong>, influenced by Coriolis, but basin geometry, depth and boundaries control each real system. The North Sea has anti-clockwise propagation around its amphidromic systems; never infer a port's time or range from this teaching sketch.</p><NorthSeaAmphidromicDiagram /></CardContent></Card></section>

        <section className="min-w-0 space-y-4"><h2 className="break-words text-2xl font-bold text-primary">Worked decision check</h2><Card className="min-w-0 forced-colors:border-[CanvasText]"><CardContent className="min-w-0 space-y-4 pt-6"><p className="break-words"><strong>Scenario:</strong> A local table predicts HW 4.8 m and the following LW 1.2 m. The range is <strong>3.6 m</strong>. Your berth needs 2.0 m and the forecast warns that strong offshore wind may lower water by 0.3 m.</p><fieldset className="min-w-0 space-y-2"><legend className="break-words font-semibold">What is the defensible next step?</legend><label className="flex min-h-11 min-w-0 items-center gap-3 rounded-md border p-3 forced-colors:border-[CanvasText]"><input className="size-5 shrink-0" type="radio" name="decision" checked={answer === "diagram"} onChange={() => selectAnswer("diagram")} /><span className="min-w-0 break-words">Use the amphidromic diagram as the exact berth prediction.</span></label><label className="flex min-h-11 min-w-0 items-center gap-3 rounded-md border p-3 forced-colors:border-[CanvasText]"><input className="size-5 shrink-0" type="radio" name="decision" checked={answer === "table" || visitedSectionIds.includes("safe-local-tide-decision")} onChange={() => selectAnswer("table")} /><span className="min-w-0 break-words">Use the local table/curve, subtract the possible residual, apply clearance, and monitor actual conditions.</span></label></fieldset>{(answer || visitedSectionIds.includes("safe-local-tide-decision")) && <p role="status" className={`break-words forced-colors:text-[CanvasText] ${answer === "diagram" ? "text-amber-700" : "text-emerald-700"}`}>{answer === "diagram" ? "Not safe. The schematic explains propagation only; it contains no usable local prediction." : "Correct. The adjusted planning level is 4.5 m at HW before applying the vessel-specific calculation and safety margin; keep monitoring."}</p>}<p id="completion-status" aria-live="polite" aria-atomic="true" className="break-words">{announcement || (saveState === "saving" ? "Saving progress…" : isCompletionDurable && saveState === "saved" ? "Completion saved to your account." : isCompletionDurable && saveState === "queued" ? "Completion is durably queued on this device and will sync when you reconnect." : isCompletionDurable && saveState === "local" ? "Completed on this device. Sign in to save to an account." : saveState === "failed" ? "Completion was not saved. Retry when ready." : !isHydrated ? "Loading saved progress…" : canComplete ? "Concept-check evidence recorded. Save completion when ready." : "Answer the concept check correctly to unlock completion.")}</p></CardContent></Card></section>

        <section className="min-w-0 space-y-3 rounded-lg border p-5 text-sm forced-colors:border-[CanvasText]"><h2 className="break-words text-lg font-bold">Check authoritative information</h2><p className="break-words">Use the current edition of official local tide tables/almanac and the relevant tidal stream atlas or diamonds for navigation. The theory here is supported by:</p><ul className="list-disc space-y-2 break-words pl-5"><li><a className="inline-flex min-h-11 items-center text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring forced-colors:text-[LinkText]" href="https://www.nesdis.noaa.gov/about/k-12-education/oceans-coasts/what-causes-tides" target="_blank" rel="noreferrer">NOAA/NESDIS: What Causes Tides?</a></li><li><a className="inline-flex min-h-11 items-center text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring forced-colors:text-[LinkText]" href="https://oceanservice.noaa.gov/facts/springtide.html" target="_blank" rel="noreferrer">NOAA Ocean Service: spring and neap tides</a></li><li><a className="inline-flex min-h-11 items-center text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring forced-colors:text-[LinkText]" href="https://www.gov.uk/government/publications/officer-of-the-watch-yacht-written-examination-syllabuses/navigation-and-radar-examination-syllabus" target="_blank" rel="noreferrer">MCA Navigation and Radar Examination Syllabus</a></li></ul></section>
      </main>
    </div>
  );
};

export default TidalTheory;
