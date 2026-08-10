import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, Crosshair, Globe, MapPin, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import UnifiedChartTable from "@/components/navigation/unified/UnifiedChartTable";
import { useTheoryCompletionGate } from "@/features/progress/useTheoryCompletionGate";
import { TOPIC_IDS } from "@/constants/topicRegistry";

const PositionFixingTheory = () => {
  const navigate = useNavigate();
  const [completionMessage, setCompletionMessage] = useState("");
  const { canComplete, markCompleted, markSectionVisited, saveState, isHydrated } = useTheoryCompletionGate({
    topicId: TOPIC_IDS.POSITION_THEORY,
    requiredSectionIds: ["read-content"],
    pointsOnComplete: 10,
    catalogueRevision: "position-fixing-theory-v1",
  });

  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight;
      if (docHeight > 0 && ((window.scrollY + window.innerHeight) / docHeight) * 100 >= 80) {
        void markSectionVisited("read-content");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [markSectionVisited]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto flex items-center gap-3 px-4 py-4">
          <Button aria-label="Back to Navigation from Position Fixing" variant="ghost" size="icon" onClick={() => navigate("/navigation")}>
            <ArrowLeft aria-hidden className="h-5 w-5" />
          </Button>
          <div><h1 className="text-xl font-bold">Position Fixing</h1><p className="text-sm text-muted-foreground">Build, interpret and check a defensible position</p></div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
        <p className="text-lg leading-relaxed">A fix is observed evidence, not certainty. Keep the observation time, source and corrections with every plotted position, compare it with the expected track, and navigate to the safe side of uncertainty.</p>

        <section className="space-y-4" aria-labelledby="coordinates-heading">
          <h2 id="coordinates-heading" className="flex items-center gap-2 text-2xl font-semibold"><Globe className="h-6 w-6 text-primary" />Read and plot latitude/longitude</h2>
          <Card><CardContent className="space-y-4 pt-6">
            <p>Write <strong>latitude first</strong> (north/south of the Equator), then <strong>longitude</strong> (east/west of Greenwich). Use degrees, minutes and decimal minutes with hemisphere letters, including leading zeros where they prevent ambiguity: <strong>50° 45.5′ N, 001° 30.2′ W</strong>.</p>
            <div className="rounded-md border p-4">
              <h3 className="font-bold">Worked chart plot</h3>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">
                <li>Check the chart title, edition/corrections, scale and horizontal datum. If a position source uses another datum, apply the charted datum shift before plotting.</li>
                <li>For <strong>50° 45.5′ N</strong>, find 50° 45′ on a side latitude scale and interpolate halfway to 46′. Carry a light horizontal construction line into the chart.</li>
                <li>For <strong>001° 30.2′ W</strong>, find 001° 30′ on the top/bottom longitude scale and interpolate 0.2′ towards 31′ W. Carry a vertical construction line to meet the latitude line; mark a small precise cross.</li>
                <li>Read back from the cross—latitude first, then longitude—and state the datum. Quote only precision supported by the chart scale and plotting accuracy.</li>
              </ol>
            </div>
            <p className="text-sm text-muted-foreground">For short chartwork distances, one minute of latitude is approximately one nautical mile: use the nearby latitude scale. Do not measure distance on the longitude border; a minute of longitude covers less ground away from the Equator.</p>
          </CardContent></Card>
        </section>

        <section className="space-y-4" aria-labelledby="visual-fix-heading">
          <h2 id="visual-fix-heading" className="flex items-center gap-2 text-2xl font-semibold"><Crosshair className="h-6 w-6 text-red-500" />A repeatable visual-fix procedure</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardContent className="pt-6"><Target className="mb-2 h-8 w-8 text-primary" /><h3 className="font-bold">1. Select</h3><p className="mt-2 text-sm">Choose unmistakable, charted, fixed and conspicuous objects. Confirm each identity. Prefer a useful angular spread; avoid three objects in nearly the same direction.</p></CardContent></Card>
            <Card><CardContent className="pt-6"><Compass className="mb-2 h-8 w-8 text-primary" /><h3 className="font-bold">2. Observe and record</h3><p className="mt-2 text-sm">Take bearings in quick succession so vessel movement is small—normally the object changing fastest first. Record each bearing, exact time and log reading. If delay matters, advance earlier LOPs to a common time.</p></CardContent></Card>
            <Card><CardContent className="pt-6"><MapPin className="mb-2 h-8 w-8 text-primary" /><h3 className="font-bold">3. Correct, plot, annotate</h3><p className="mt-2 text-sm">Use the deviation card for the vessel heading and the charted variation updated to the observation date. Convert Compass → Magnetic → True. Plot each reciprocal from its object; intersect the LOPs and annotate the fix with a circle and time.</p></CardContent></Card>
          </div>
          <Card><CardContent className="space-y-3 pt-6">
            <h3 className="font-bold">Worked bearing and reciprocal</h3>
            <p className="text-sm">At 1042, log 18.6 NM, a lighthouse bears 073°C. Deviation on the vessel card for the heading is 2°E; chart variation updated to 2026 is 4°W. Using east positive and west negative: <strong>073°C + 2° = 075°M; 075°M − 4° = 071°T</strong>. The direction from the vessel to the light is 071°T, so plot its reciprocal <strong>251°T</strong> from the charted lighthouse back towards the vessel. Record “1042 / log 18.6”.</p>
            <p className="text-xs text-muted-foreground">Do not reuse this arithmetic blindly: deviation is vessel- and heading-specific, and variation must come from the current chart information.</p>
          </CardContent></Card>
          <UnifiedChartTable />
        </section>

        <section className="space-y-4" aria-labelledby="quality-heading">
          <h2 id="quality-heading" className="text-2xl font-semibold">Cut geometry, cocked hats and safety</h2>
          <Card><CardContent className="space-y-4 pt-6">
            <ul className="list-disc space-y-2 pl-5 text-sm">
              <li><strong>Strong cut:</strong> two LOPs crossing near 90° constrain position well in both directions. Three bearings spread around the vessel improve diagnosis, but 60°–120° is guidance, not a magic rule.</li>
              <li><strong>Weak cut:</strong> LOPs crossing at 15° turn small bearing errors into a long uncertainty area. Near-parallel lines may look tidy yet locate the vessel poorly along their length.</li>
              <li><strong>Example:</strong> a ±2° bearing uncertainty at 3 NM is roughly ±0.10 NM across each LOP; at 10 NM it is roughly ±0.35 NM. Range and cut angle both matter.</li>
            </ul>
            <div className="rounded-md border-l-4 border-amber-500 bg-amber-500/10 p-4">
              <h3 className="font-bold">A cocked hat does not prove you are inside it</h3>
              <p className="mt-2 text-sm"><strong>Random errors</strong> (reading, steering and plotting scatter) can put the probable position near or within a small triangle. A shared <strong>systematic error</strong>—wrong variation, biased compass, misidentified object or chart/datum mismatch—can shift all LOPs so the vessel lies outside it. A large or unexpected triangle demands investigation and another observation.</p>
              <p className="mt-2 text-sm"><strong>Near danger, use the hazard-side conservative position</strong>: assume the vessel is at the point of the uncertainty area closest to the hazard, then maintain the required clearance. Never choose the triangle centre merely because it is convenient.</p>
            </div>
          </CardContent></Card>
        </section>

        <section className="space-y-4" aria-labelledby="dr-ep-heading">
          <h2 id="dr-ep-heading" className="text-2xl font-semibold">Worked DR and EP</h2>
          <Card><CardContent className="space-y-4 pt-6">
            <p><strong>DR:</strong> From the 0900 fix, steer 090°T at 5 kn for 2 hours. Plot 10 NM along 090°T and mark the 1100 DR with the standard semicircle/time annotation. It uses course and distance through the water only; uncertainty accumulates from the start fix, compass, steering and log.</p>
            <p><strong>EP:</strong> If leeway is assessed as 5° to starboard with a northerly wind, start again at the 0900 fix and plot the 10 NM water-track vector on 095°T. From that water-track endpoint—not from the 090°T DR—apply the forecast tidal stream for the same two hours: 180°T at 1 kn gives a 2 NM south-going vector. The resulting 1100 EP is about 9.96 NM east and 2.87 NM south of the 0900 fix, equivalent to 10.37 NM on 106.1°T. Mark that endpoint with a square and “EP 1100”.</p>
            <p className="text-sm text-muted-foreground">An EP is a reasoned construction, not a fix. State the tide, leeway, speed and time assumptions. Draw an uncertainty area that grows with uncertain start position, elapsed time, steering/log error, changing stream and estimated leeway. Compare the next observed fix with the EP; a material difference is evidence to investigate, not something to erase.</p>
          </CardContent></Card>
        </section>

        <section className="space-y-4" aria-labelledby="monitor-heading">
          <h2 id="monitor-heading" className="text-2xl font-semibold">Fix often enough—and cross-check independently</h2>
          <Card><CardContent className="space-y-3 pt-6">
            <p>Set the interval from speed, visibility, traffic, charted dangers, tidal uncertainty and distance to the next decision. Offshore in stable conditions it may be longer; in pilotage, restricted visibility or near hazards it may be minutes or continuous monitoring. Fix before and after course alterations and before a position becomes critical.</p>
            <p>Do not rely on one sensor or one family of errors. Cross-check visual bearings with a transit, radar ranges/bearings, depth against predicted tide and charted contours, GNSS on the correct datum, or another suitable method. Compare every fix with DR/EP, track, log and surrounding evidence; resolve disagreement promptly.</p>
          </CardContent></Card>
        </section>

        <aside className="border-t pt-4 text-sm text-muted-foreground" aria-label="Authoritative references">
          <h2 className="font-bold text-foreground">Authoritative references (checked August 2026)</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li><a className="underline" href="https://www.gov.uk/government/publications/deck-officer-yacht-oral-examination-syllabuses/master-code-vessels-less-than-200-gtofficer-of-the-watch-yachts-less-than-500-gt-oral-examination-syllabus" target="_blank" rel="noreferrer">MCA yacht oral examination syllabus</a>, navigation section 1.1.</li>
            <li><a className="underline" href="https://www.gov.uk/government/publications/officer-of-the-watch-yacht-written-examination-syllabuses/navigation-and-radar-examination-syllabus" target="_blank" rel="noreferrer">MCA Navigation and Radar written examination syllabus</a>, position fixing, DR and EP outcomes.</li>
            <li><a className="underline" href="https://iho.int/uploads/user/pubs/standards/s-4/S-4%20Ed%204.10.0_FINAL.pdf" target="_blank" rel="noreferrer">IHO S-4, edition 4.10.0 (March 2026)</a>, coordinate and chart-datum conventions.</li>
            <li><a className="underline" href="https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/440740/MGN_379.pdf" target="_blank" rel="noreferrer">MCA MGN 379: Use of Electronic Navigation Aids</a>, independent position cross-checking.</li>
          </ul>
        </aside>

        <div className="flex flex-col items-center gap-3 pt-8">
          <Button size="lg" disabled={!isHydrated || !canComplete || saveState === "saving"} onClick={async () => {
            setCompletionMessage("");
            if (await markCompleted()) navigate("/navigation");
            else setCompletionMessage("Completion was not saved. Your reading progress remains here; retry when ready.");
          }}>
            {!isHydrated ? "Loading saved progress…" : saveState === "saving" ? "Saving…" : canComplete ? saveState === "failed" ? "Retry completion" : "Complete Module" : "Scroll through module to complete"}
          </Button>
          {completionMessage && <p role="alert" className="text-center text-sm text-destructive">{completionMessage}</p>}
          {!completionMessage && (saveState === "queued" || saveState === "local") && <p role="status" className="text-center text-sm text-muted-foreground">{saveState === "queued" ? "Completion is durably queued on this device and will sync when you reconnect." : "Completion is saved in this browser. Sign in to sync future progress to an account."}</p>}
        </div>
      </main>
    </div>
  );
};

export default PositionFixingTheory;
