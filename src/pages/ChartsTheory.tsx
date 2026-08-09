import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Map, Anchor, Waves, Info, Ruler, Mountain, Globe, Eye, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useTheoryCompletionGate } from "@/features/progress/useTheoryCompletionGate";
import ChartSymbolQuiz from "@/components/navigation/ChartSymbolQuiz";
import VirtualChartPlotter from "@/components/navigation/VirtualChartPlotter";
import TidalVisualizer from "@/components/navigation/TidalVisualizer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TOPIC_IDS } from "@/constants/topicRegistry";

const ChartsTheory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("coordinates");
  const [announcement, setAnnouncement] = useState("");
  const { canComplete, markCompleted, markSectionVisited, visitedSectionIds, saveState, isHydrated, ownerId } = useTheoryCompletionGate({
    topicId: TOPIC_IDS.CHARTS_THEORY,
    requiredSectionIds: ["plotter-mastery", "tidal-depth-mastery", "symbol-mastery"],
    pointsOnComplete: 10,
    catalogueRevision: "chart-evidence-v1",
  });
  // The embedded drills own transient attempt state. Remount all of them when
  // account ownership changes so a mastered widget from the previous account
  // cannot emit its outcome into the new owner's evidence gate.
  const evidenceOwnerKey = `${ownerId ?? "anonymous"}:chart-evidence-v1`;
  const recordEvidence = async (id: string, label: string) => {
    if (visitedSectionIds.includes(id)) return;
    const outcome = await markSectionVisited(id);
    setAnnouncement(outcome === "failed"
      ? `${label} evidence was retained in this browser, but could not be saved. It will be retried with your next evidence or completion save.`
      : `${label} evidence recorded.`);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 pb-20 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Back to Navigation" onClick={() => navigate("/navigation")}>
              <ArrowLeft aria-hidden="true" className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold leading-tight text-slate-900">The Nautical Chart</h1>
              <p className="text-sm text-slate-500">Day Skipper Module 1: The Basics</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
          }}
          className="space-y-8"
        >
          <div className="sticky top-20 z-30 bg-slate-50 pt-2 pb-4 -mx-4 px-4 md:static md:bg-transparent md:p-0">
            <TabsList aria-label="Chart theory sections" className="grid h-auto w-full grid-cols-1 gap-1 bg-slate-200 p-1 sm:grid-cols-3">
              <TabsTrigger
                value="coordinates"
                className="min-w-0 whitespace-normal py-3 text-center data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Globe className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Coordinates & Plotting</span>
                <span className="md:hidden">Plotting</span>
              </TabsTrigger>
              <TabsTrigger value="depths" className="min-w-0 whitespace-normal py-3 text-center data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Waves className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Depths & Tides</span>
                <span className="md:hidden">Tides</span>
              </TabsTrigger>
              <TabsTrigger value="symbols" className="min-w-0 whitespace-normal py-3 text-center data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Map className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Symbols & Keys</span>
                <span className="md:hidden">Symbols</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: COORDINATES & PLOTTING */}
          <TabsContent value="coordinates" className="space-y-12 focus-visible:outline-none">
            {/* Anatomy Logic */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b pb-2">
                <Globe className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold">1. Anatomy of a Chart</h2>
              </div>

              <div className="prose max-w-none text-slate-700 space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">The Metric of the Sea</h3>
                <p>
                  A nautical chart is a precision instrument, not just a map. To navigate safely, you must understand
                  how the 3D spherical Earth is flattened onto 2D paper, and how this affects measuring distance and
                  direction.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mt-6">The Mercator Projection</h3>
                <p>
                  Mercator is the normal projection for many nautical charts. It is a mathematical transformation,
                  not a perspective view made by shining a light through the Earth. On its graticule, meridians and
                  parallels are straight and cross at right angles; meridians are parallel on the chart even though
                  they converge on the globe.
                </p>
                <p className="border-l-4 border-blue-200 pl-4 italic text-slate-600">
                  Mercator preserves local angles, so a constant-direction rhumb line plots straight. It does not make
                  every straight line the shortest route. Scale increases toward the poles, so use the latitude scale
                  beside the area being measured; high-latitude shapes and distances are increasingly distorted.
                </p>

                <div className="grid md:grid-cols-2 gap-8 my-8">
                  <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4 rotate-90" /> The Parallel of Latitude
                    </h4>
                    <p className="text-sm">
                      Parallels run east-west. They are farther apart toward the poles on a Mercator chart, although
                      latitude is measured in the same angular degrees and minutes everywhere.
                    </p>
                    <ul className="list-disc list-inside text-sm font-medium text-blue-900 bg-blue-50 p-3 rounded">
                      <li>
                        1 degree (°) = 60 minutes (′).
                      </li>
                      <li>A nautical mile is defined as exactly 1,852 metres.</li>
                      <li>For practical chartwork, 1 minute of latitude represents approximately 1 NM.</li>
                    </ul>
                    <p className="text-sm font-bold text-red-600">
                      Measure a short distance on the latitude scale beside the same latitude as the route.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> The Meridian of Longitude
                    </h4>
                    <p className="text-sm">
                      Meridians run north-south. They converge on the globe, but plot as parallel, equally spaced
                      vertical lines on a Mercator graticule.
                    </p>
                    <ul className="list-disc list-inside text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded">
                      <li>One minute of longitude covers less ground as latitude increases.</li>
                      <li>Do not transfer a distance to the longitude border.</li>
                    </ul>
                    <p className="text-sm font-bold text-slate-500">
                      Longitude identifies east/west position; the nearby latitude border supplies the local distance
                      scale.
                    </p>
                  </div>
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center gap-2">
                      <Ruler className="w-5 h-5" />
                      Summary: Measuring Distance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2 text-slate-800">
                      <li>Place your dividers on the two points you want to measure.</li>
                      <li>
                        Move the dividers to the <strong>Vertical (Latitude) Scale</strong> on the left or right edge of
                        the chart roughly inline with the area you are working.
                      </li>
                      <li>
                        Read the latitude minutes locally: <strong>1′ is approximately 1 NM</strong> for chartwork.
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Practical Plotter */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b pb-2">
                <Anchor className="w-8 h-8 text-indigo-600" />
                <h2 className="text-3xl font-bold">Practical Plotting</h2>
              </div>
              <div className="prose max-w-none text-slate-700">
                <p>
                  Use the <strong>Virtual Chart Plotter</strong> below to practice coords and bearings.
                </p>
                <div className="bg-indigo-50 p-4 border-l-4 border-indigo-500 rounded-r my-4">
                  <h4 className="text-indigo-900 font-bold mb-2">Tool Guide:</h4>
                  <ul className="grid grid-cols-1 gap-2 text-sm text-indigo-800 sm:grid-cols-2">
                    <li className="flex gap-2">
                      <Map className="w-4 h-4" /> <strong>Pan:</strong> Drag to move map.
                    </li>
                    <li className="flex gap-2">
                      <Ruler className="w-4 h-4" /> <strong>Dist:</strong> Measure NM (1' Lat).
                    </li>
                    <li className="flex gap-2">
                      <Eye className="w-4 h-4" /> <strong>Bearing:</strong> Measure True °.
                    </li>
                    <li className="flex gap-2">
                      <Anchor className="w-4 h-4" /> <strong>Plot:</strong> Mark Position.
                    </li>
                  </ul>
                </div>
              </div>

              <Card className="min-w-0 border-2 border-indigo-100 shadow-md">
                <CardContent className="min-w-0 px-3 pt-6 sm:px-6">
                  <VirtualChartPlotter key={`plotter:${evidenceOwnerKey}`} onMastery={() => void recordEvidence("plotter-mastery", "Chart plotting mastery")} />
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* TAB 2: DEPTHS & TIDES */}
          <TabsContent value="depths" className="space-y-12 focus-visible:outline-none">
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b pb-2">
                <Waves className="w-8 h-8 text-emerald-600" />
                <h2 className="text-3xl font-bold">2. The Vertical Dimension</h2>
              </div>

              <div className="prose max-w-none text-slate-700 space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Read Every Datum from the Chart</h3>
                <p>
                  A chart can use different reference planes for depths, drying heights, land and light elevations,
                  and overhead clearances. Read the title, notes and legend: never assume that Chart Datum is LAT or
                  that every height or clearance is referred to MHWS.
                </p>

                <div className="grid md:grid-cols-2 gap-8 my-8">
                  {/* Scale 1: Chart Datum */}
                  <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-blue-800 flex items-center gap-2">
                        <Anchor className="w-5 h-5" /> Chart Datum (CD)
                      </CardTitle>
                      <CardDescription className="text-blue-600 font-medium">Reference for depths and drying heights</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-700">
                      <p>
                        <strong>What is it?</strong> The chart's stated reference plane. IHO guidance recommends LAT or
                        a close equivalent in many tidal waters, but local policy or non-tidal conditions may use a
                        different datum, including MSL.
                      </p>
                      <p>
                        <strong>What it does not mean:</strong> A charted sounding is not guaranteed water. Tide
                        predictions exclude weather effects, while pressure, wind and waves can lower levels. Survey
                        age/quality, seabed change, vessel motion and calculation uncertainty also require margins.
                      </p>
                      <ul className="list-disc list-inside bg-white p-3 rounded border border-blue-100 shadow-sm">
                        <li>
                          <strong>Soundings:</strong> Depth shown is measured DOWN from CD.
                        </li>
                        <li>
                          <strong>Drying Heights:</strong> Features that get wet and dry (rocks, banks). Height is
                          measured UP from CD and normally printed as <u>underlined</u> figures.
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Scale 2: Height Datum */}
                  <Card className="border-l-4 border-l-orange-500 bg-orange-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-orange-800 flex items-center gap-2">
                        <Mountain className="w-5 h-5" /> Elevation & Clearance Datums
                      </CardTitle>
                      <CardDescription className="text-orange-600 font-medium">Check the charted reference plane</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-700">
                      <p>
                        <strong>Elevations:</strong> Land and light heights are normally referred to a stated
                        high-water datum such as MHWS, MHHW or HAT. Geographic light range also depends on observer
                        height and Earth curvature; luminous range depends on intensity and visibility.
                      </p>
                      <p>
                        <strong>Clearances:</strong> IHO recommends HAT or an accepted equivalent for vertical
                        clearances, but the adopted datum is stated in the chart title. Determine the predicted water
                        level relative to that same datum before adjusting a charted bridge or cable clearance.
                      </p>
                      <ul className="list-disc list-inside bg-white p-3 rounded border border-orange-100 shadow-sm">
                        <li>
                          <strong>Never mix datums:</strong> Convert or use published differences before combining
                          figures referred to different planes.
                        </li>
                        <li>
                          <strong>Keep a margin:</strong> Include tide/weather uncertainty, vessel motion and a safe
                          air-draught allowance; never treat the printed clearance as a guarantee.
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-slate-900 text-white p-8 rounded-xl shadow-lg mx-auto max-w-3xl space-y-4">
                  <div className="flex items-center gap-4 border-b border-slate-700 pb-4">
                    <Info className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                    <h4 className="text-xl font-bold">The Skipper's Formula</h4>
                  </div>
                  <p className="text-slate-300">
                    Estimate water depth only after confirming that both terms use the same Chart Datum:
                  </p>
                  <div className="font-mono text-xl text-center bg-slate-800 p-4 rounded border border-slate-600">
                    Estimated depth = charted sounding + predicted height of tide above CD
                  </div>
                  <p className="text-sm text-slate-400 italic text-center">
                    For a drying height, water over the feature = height of tide − drying height; a negative result
                    means the feature is exposed by that amount.
                  </p>
                </div>

                <Card className="border-emerald-300 bg-emerald-50/40">
                  <CardHeader>
                    <CardTitle>Worked chart-use procedure: depth and under-keel clearance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-700">
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Check the chart title, edition/corrections, scale, sounding units, CD note, cautions and survey quality.</li>
                      <li>At the planned position, read a <strong>3.2 m</strong> sounding and confirm soundings are metres below CD.</li>
                      <li>From the applicable tide table/curve, interpolate the time between printed values: predicted height is <strong>1.4 m above the same CD</strong>. Apply any published secondary-port correction.</li>
                      <li>Estimated depth: <strong>3.2 m + 1.4 m = 4.6 m</strong>. Check that adding a positive tide height must produce a plausible value deeper than the charted sounding.</li>
                      <li>For draught <strong>2.0 m</strong>, predicted/static UKC = 4.6 − 2.0 = <strong>2.6 m</strong>.</li>
                      <li>After allowing <strong>0.3 m</strong> for squat and <strong>0.2 m</strong> for wave/heel response, allowance-adjusted/dynamic UKC = 2.6 − 0.3 − 0.2 = <strong>2.1 m</strong>.</li>
                      <li>Compare that 2.1 m with the vessel/operator required minimum or policy reserve of <strong>0.5 m</strong>. It leaves <strong>1.6 m excess above the required reserve</strong>; this excess is not itself UKC.</li>
                      <li>Recheck the route for shallower soundings, drying dangers, contours and recent notices; delay or reroute if any input or margin is doubtful.</li>
                    </ol>
                    <p className="font-medium text-emerald-900">Predictions are estimates, not observations. Verify actual conditions and maintain a margin appropriate to the vessel, weather, survey quality and consequences of grounding.</p>
                  </CardContent>
                </Card>

                <div className="mt-12 space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Waves className="w-6 h-6 text-blue-600" />
                    Interactive Tidal Visualizer
                  </h3>
                  <p>
                    Use the tool below to visualize how the tide level (blue water) rises above Chart Datum, adding to
                    your available depth.
                  </p>
                  <TidalVisualizer key={`tidal:${evidenceOwnerKey}`} onMastery={() => void recordEvidence("tidal-depth-mastery", "Tidal depth mastery")} />
                </div>
              </div>
            </section>
          </TabsContent>

          {/* TAB 3: SYMBOLS */}
          <TabsContent value="symbols" className="space-y-12 focus-visible:outline-none">
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b pb-2">
                <Map className="w-8 h-8 text-yellow-600" />
                <h2 className="text-3xl font-bold">3. Symbols & Abbreviations</h2>
              </div>

              <div className="prose max-w-none text-slate-700 space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Reading the Language of the Sea</h3>
                <p>
                  Use the chart's own legend and the current symbol catalogue: IHO <strong>INT 1, edition 8 (2020)</strong>
                  and the relevant national equivalent (for UKHO charts, Chart 5011). Colour is supporting information,
                  not a substitute for contours, symbols, abbreviations and notes.
                </p>

                <h4 className="font-bold text-lg mt-6">The 4-Colour Palette</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
                  <div className="p-4 bg-[#f2e8be] border border-stone-300 rounded shadow-sm">
                    <span className="font-bold text-stone-800 block mb-1">YELLOW</span>
                    <p className="text-xs text-stone-700">A usual land tint; grey may also be used. Inspect symbols and notes.</p>
                  </div>
                  <div className="p-4 bg-[#1d9c60] text-white rounded shadow-sm">
                    <span className="font-bold block mb-1">GREEN</span>
                    <p className="text-xs opacity-90">Common intertidal overprint; confirm limits, drying figures and symbols.</p>
                  </div>
                  <div className="p-4 bg-[#b2d3f0] border border-blue-300 rounded shadow-sm">
                    <span className="font-bold text-blue-900 block mb-1">BLUE</span>
                    <p className="text-xs text-blue-800">A shallow-water tint whose limiting contour varies.</p>
                    <div className="mt-2 text-xs italic text-blue-700">
                      Read the chart's depth contours and units.
                    </div>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded shadow-sm">
                    <span className="font-bold text-slate-900 block mb-1">WHITE</span>
                    <p className="text-xs text-slate-600">Untinted water is not a promise of sufficient depth.</p>
                    <div className="mt-2 text-xs italic text-slate-500">Check soundings, contours and hazards.</div>
                  </div>
                </div>

                <p className="text-sm bg-slate-50 p-4 rounded border border-slate-200">
                  There is no dependable generic “star”, “diamond” or “+” shortcut. Floating buoys and fixed beacons
                  use different symbol families; rocks, wrecks and lights have variants whose exact form, colour,
                  surrounding danger line and accompanying attributes matter. Identify the complete symbol in INT 1 or
                  Chart 5011 before making a navigation decision.
                </p>

                <div className="mt-8 space-y-4">
                  <h3 className="text-xl font-bold">Chart Symbol Quiz</h3>
                  <p className="text-slate-700">
                    The best way to learn symbols is repetition. Test yourself with common symbols found on Admiralty
                    Charts.
                  </p>
                  <ChartSymbolQuiz
                    key={`symbols:${evidenceOwnerKey}`}
                    evidenceOwnerId={ownerId}
                    catalogueRevision="chart-symbols-v1"
                    onMastery={() => void recordEvidence("symbol-mastery", "Chart symbol mastery")}
                  />
                </div>

                <aside className="mt-10 border-t pt-4 text-sm text-slate-600" aria-label="Authoritative references">
                  <h4 className="font-bold text-slate-900">Authoritative references (checked August 2026)</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li><a className="underline" href="https://iho.int/uploads/user/pubs/standards/s-4/S-4%20Ed%204.10.0_FINAL.pdf" target="_blank" rel="noreferrer">IHO S-4, edition 4.10.0 (March 2026)</a>: B-203, B-302, B-380, B-405, B-411 and B-412.</li>
                    <li><a className="underline" href="https://iho.int/standards-and-specifications" target="_blank" rel="noreferrer">IHO Standards and Specifications</a>: INT 1, edition 8 (2020).</li>
                    <li><a className="underline" href="https://assets.publishing.service.gov.uk/media/69973732bfdab2546272c016/OOW_-_500GT_NC_-_Chart-work_and_Practical_Navigation_-_Revised_Nov_24.pdf" target="_blank" rel="noreferrer">MCA chartwork and practical-navigation syllabus, revised November 2024</a>.</li>
                  </ul>
                </aside>
              </div>
            </section>
          </TabsContent>
        </Tabs>

        <section className="mt-12 space-y-4 rounded-lg border bg-white p-6" aria-labelledby="chart-completion-heading">
          <h2 id="chart-completion-heading" className="text-xl font-bold">Completion evidence</h2>
          <ul className="space-y-2">
            {[
              ["plotter-mastery", "Complete all eight chart-plotting challenges"],
              ["tidal-depth-mastery", "Achieve mastery in the tidal-depth drill"],
              ["symbol-mastery", "Achieve mastery in the chart-symbol assessment"],
            ].map(([id, label]) => <li key={id} className="flex items-center gap-2">
              <CheckCircle2 className={`h-5 w-5 ${visitedSectionIds.includes(id) ? "text-green-700" : "text-slate-300"}`} aria-hidden="true" />
              <span>{label}: {visitedSectionIds.includes(id) ? "recorded" : "not yet recorded"}</span>
            </li>)}
          </ul>
          <p role="status" aria-live="polite">{announcement || (saveState === "saving" ? "Saving evidence…" : saveState === "queued" ? "Progress is durably queued on this device and will sync when you reconnect." : saveState === "saved" ? "Progress saved to your account." : saveState === "failed" ? "Progress could not be saved. Your browser evidence is retained; retry completion or another exercise." : !isHydrated ? "Loading saved evidence…" : "Complete each practical outcome to unlock module completion.")}</p>
        </section>

        <div className="flex justify-center pt-6 pb-8">
          <Button
            size="lg"
            className="px-8"
            disabled={!isHydrated || !canComplete || saveState === "saving"}
            onClick={async () => {
              const saved = await markCompleted();
              if (saved) navigate("/navigation");
              else setAnnouncement("Completion was not saved. Your evidence remains here; retry when ready.");
            }}
          >
            {!isHydrated ? "Loading saved evidence…" : canComplete ? saveState === "failed" ? "Retry completion" : "Complete Module" : "Complete all practical outcomes"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ChartsTheory;
