import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompletion } from "@/hooks/useCompletion";

const NorthSeaAmphidromicDiagram = () => (
  <figure className="space-y-3">
    <svg
      viewBox="0 0 640 430"
      role="img"
      aria-labelledby="amphidromic-title amphidromic-description"
      className="w-full rounded-lg border bg-slate-50"
    >
      <title id="amphidromic-title">North Sea amphidromic system teaching schematic</title>
      <desc id="amphidromic-description">
        An anti-clockwise tidal wave rotates around an amphidromic point. Blue co-tidal lines show phase in lunar
        hours after high water at a stated reference port; orange co-range contours show tidal range in metres,
        increasing away from the point. This is explanatory, not a navigation chart.
      </desc>
      <defs>
        <marker id="tidal-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#075985" />
        </marker>
      </defs>
      <rect width="640" height="430" fill="#e0f2fe" />
      <path d="M72 20 L157 33 176 85 151 135 167 194 144 255 100 303 69 374 20 407 20 20Z" fill="#d6d3d1" stroke="#78716c" />
      <path d="M493 18 L620 18 620 408 471 408 491 352 465 305 502 256 475 203 513 149 485 91Z" fill="#d6d3d1" stroke="#78716c" />
      <text x="48" y="93" fontSize="18" fill="#44403c">Great Britain</text>
      <text x="520" y="85" fontSize="18" fill="#44403c">Europe</text>

      <circle cx="330" cy="218" r="8" fill="#111827" />
      <text x="342" y="214" fontSize="15" fontWeight="600">amphidromic point</text>
      <text x="342" y="233" fontSize="13">range approaches 0 m</text>

      <g fill="none" stroke="#ea580c" strokeWidth="3">
        <ellipse cx="330" cy="218" rx="55" ry="39" />
        <ellipse cx="330" cy="218" rx="112" ry="79" />
        <ellipse cx="330" cy="218" rx="176" ry="124" />
      </g>
      <g fill="#9a3412" fontSize="14" fontWeight="600">
        <text x="318" y="170">0.5 m</text><text x="318" y="127">1 m</text><text x="318" y="83">2 m</text>
      </g>

      <g stroke="#0369a1" strokeWidth="2">
        <line x1="330" y1="218" x2="330" y2="52" /><line x1="330" y1="218" x2="494" y2="218" />
        <line x1="330" y1="218" x2="330" y2="383" /><line x1="330" y1="218" x2="166" y2="218" />
      </g>
      <g fill="#075985" fontSize="14" fontWeight="600">
        <text x="337" y="66">0 h</text><text x="174" y="211">3 h</text><text x="337" y="375">6 h</text><text x="463" y="211">9 h</text>
      </g>
      <g fill="none" stroke="#075985" strokeWidth="5" markerEnd="url(#tidal-arrow)">
        <path d="M223 306 A150 115 0 0 0 448 304" /><path d="M437 132 A150 115 0 0 0 213 135" />
      </g>
      <text x="224" y="416" fontSize="15" fontWeight="700" fill="#075985">anti-clockwise propagation</text>
    </svg>
    <figcaption className="text-xs text-muted-foreground">
      Original teaching schematic (project licence), not for navigation. Blue lines join places at the same tidal
      phase, expressed here as lunar hours after a notional reference-port HW; orange contours join equal ranges in
      metres. The values explain how to read the symbols and are not predictions for a real port.
    </figcaption>
  </figure>
);

const TidalTheory = () => {
  const navigate = useNavigate();
  const { completeTopic } = useCompletion();
  const [markedComplete, setMarkedComplete] = useState(false);
  const [answer, setAnswer] = useState<"" | "table" | "diagram">("");

  const handleComplete = () => {
    completeTopic("tides-theory");
    setMarkedComplete(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/navigation/tides")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div><h1 className="text-xl font-bold">Understanding Tidal Phenomena</h1><p className="text-sm text-muted-foreground">From astronomical forcing to a local decision</p></div>
          </div>
          {markedComplete ? (
            <Button variant="outline" className="text-green-600 border-green-200 bg-green-50" disabled><CheckCircle2 className="w-4 h-4 mr-2" />Completed</Button>
          ) : (
            <Button onClick={handleComplete}>Mark as Complete <ChevronRight className="w-4 h-4 ml-2" /></Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">Why tides occur</h2>
          <Card><CardContent className="pt-6 space-y-4">
            <p>The tide-generating force is the <strong>difference</strong> in lunar and solar gravity across Earth, not a uniform pull on the ocean. The Moon-facing side is pulled more strongly than Earth's centre; the far side is pulled less strongly. Relative to the Earth–Moon system, this produces <strong>two equilibrium bulges</strong>. The Sun produces the same kind of differential pattern, but the nearer Moon usually has the larger tide-generating effect.</p>
            <div className="rounded-lg border bg-sky-50 p-5 text-center" role="img" aria-label="Ideal equilibrium model with Earth between two opposite tidal bulges on the Earth Moon line">
              <div className="flex items-center justify-center gap-2 sm:gap-5"><span className="rounded-[50%] bg-blue-200 px-8 py-3 text-sm font-semibold">far-side bulge</span><span className="grid size-20 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">Earth</span><span className="rounded-[50%] bg-blue-200 px-8 py-3 text-sm font-semibold">near-side bulge</span><span className="grid size-10 place-items-center rounded-full bg-slate-500 text-xs text-white">Moon</span></div>
            </div>
            <p className="text-sm text-muted-foreground"><strong>Do not picture these bulges sweeping literally around every coast.</strong> They are an equilibrium model. Real tidal waves cross ocean basins and are changed by coastline, depth, friction, resonance and Earth's rotation.</p>
            <p>A lunar day is about <strong>24 h 50 min</strong>. Many UK locations are semidiurnal, with two HWs and two LWs in a lunar day (successive HWs roughly 12 h 25 min apart), but other places have mixed or diurnal regimes. Always use the local tide table.</p>
          </CardContent></Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">Language and the spring–neap cycle</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Essential terms</CardTitle></CardHeader><CardContent><dl className="space-y-3 text-sm"><div><dt className="font-semibold">High water (HW)</dt><dd>The local maximum water level in a tidal cycle.</dd></div><div><dt className="font-semibold">Low water (LW)</dt><dd>The local minimum water level in a tidal cycle.</dd></div><div><dt className="font-semibold">Range</dt><dd>HW height minus the adjacent LW height.</dd></div><div><dt className="font-semibold">Tidal stream</dt><dd>Horizontal water movement; it is distinct from vertical tidal height.</dd></div></dl></CardContent></Card>
            <Card><CardHeader><CardTitle>Springs and neaps</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p><strong>Springs:</strong> near new and full moon, the lunar and solar tide-generating patterns reinforce, usually giving a larger range.</p><p><strong>Neaps:</strong> near first and last quarter, the patterns partly cancel, usually giving a smaller range.</p><p className="text-muted-foreground">The largest/smallest local range can lag the lunar phase (the “age of the tide”). Springs often mean stronger streams, but local tables and atlases—not the Moon phase alone—govern your prediction.</p></CardContent></Card>
          </div>
        </section>

        <section className="space-y-4"><h2 className="text-2xl font-bold text-primary">From astronomy to observed water</h2>
          <Card><CardContent className="pt-6"><ol className="space-y-3 text-sm list-decimal pl-5"><li><strong>Astronomical forcing:</strong> predictable lunar and solar constituents set the underlying rhythm.</li><li><strong>Local response:</strong> basin shape, coastline, bathymetry, friction and resonance change phase, range and even whether the regime is semidiurnal.</li><li><strong>Meteorological residual:</strong> wind and atmospheric pressure (plus river flow and waves locally) can put observed water above or below the astronomical prediction.</li><li><strong>Decision uncertainty:</strong> predictions are not guarantees. Check the current forecast and observations, allow a safety margin, and reconsider if conditions differ.</li></ol></CardContent></Card>
        </section>

        <section className="space-y-4"><h2 className="text-2xl font-bold text-primary">Amphidromic systems</h2><Card><CardContent className="pt-6 space-y-5"><p>In many basins the tidal wave rotates around amphidromic points where range is small. A qualified Northern Hemisphere tendency is <strong>anti-clockwise</strong>, influenced by Coriolis, but basin geometry, depth and boundaries control each real system. The North Sea has anti-clockwise propagation around its amphidromic systems; never infer a port's time or range from this teaching sketch.</p><NorthSeaAmphidromicDiagram /></CardContent></Card></section>

        <section className="space-y-4"><h2 className="text-2xl font-bold text-primary">Worked decision check</h2><Card><CardContent className="pt-6 space-y-4"><p><strong>Scenario:</strong> A local table predicts HW 4.8 m and the following LW 1.2 m. The range is <strong>3.6 m</strong>. Your berth needs 2.0 m and the forecast warns that strong offshore wind may lower water by 0.3 m.</p><fieldset className="space-y-2"><legend className="font-semibold">What is the defensible next step?</legend><label className="flex gap-2"><input type="radio" name="decision" onChange={() => setAnswer("diagram")} /> Use the amphidromic diagram as the exact berth prediction.</label><label className="flex gap-2"><input type="radio" name="decision" onChange={() => setAnswer("table")} /> Use the local table/curve, subtract the possible residual, apply clearance, and monitor actual conditions.</label></fieldset>{answer && <p role="status" className={answer === "table" ? "text-emerald-700" : "text-amber-700"}>{answer === "table" ? "Correct. The adjusted planning level is 4.5 m at HW before applying the vessel-specific calculation and safety margin; keep monitoring." : "Not safe. The schematic explains propagation only; it contains no usable local prediction."}</p>}</CardContent></Card></section>

        <section className="rounded-lg border p-5 space-y-3 text-sm"><h2 className="text-lg font-bold">Check authoritative information</h2><p>Use the current edition of official local tide tables/almanac and the relevant tidal stream atlas or diamonds for navigation. The theory here is supported by:</p><ul className="list-disc pl-5 space-y-1"><li><a className="text-primary underline" href="https://www.nesdis.noaa.gov/about/k-12-education/oceans-coasts/what-causes-tides" target="_blank" rel="noreferrer">NOAA/NESDIS: What Causes Tides?</a></li><li><a className="text-primary underline" href="https://oceanservice.noaa.gov/facts/springtide.html" target="_blank" rel="noreferrer">NOAA Ocean Service: spring and neap tides</a></li><li><a className="text-primary underline" href="https://www.gov.uk/government/publications/officer-of-the-watch-yacht-written-examination-syllabuses/navigation-and-radar-examination-syllabus" target="_blank" rel="noreferrer">MCA Navigation and Radar Examination Syllabus</a></li></ul></section>
      </main>
    </div>
  );
};

export default TidalTheory;
