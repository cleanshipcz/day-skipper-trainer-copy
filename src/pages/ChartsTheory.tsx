import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Map, Anchor, Waves, Info, Ruler, Mountain, Globe, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheoryCompletionGate } from "@/features/progress/useTheoryCompletionGate";
import ChartSymbolQuiz from "@/components/navigation/ChartSymbolQuiz";
import VirtualChartPlotter from "@/components/navigation/VirtualChartPlotter";
import TidalVisualizer from "@/components/navigation/TidalVisualizer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ChartsTheory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("coordinates");
  const { canComplete, markCompleted, markSectionVisited } = useTheoryCompletionGate({
    topicId: "charts-theory",
    requiredSectionIds: ["coordinates", "depths", "symbols"],
    pointsOnComplete: 10,
  });

  useEffect(() => {
    void markSectionVisited("coordinates");
  }, [markSectionVisited]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/navigation")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">The Nautical Chart</h1>
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
            void markSectionVisited(value);
          }}
          className="space-y-8"
        >
          <div className="sticky top-20 z-30 bg-slate-50 pt-2 pb-4 -mx-4 px-4 md:static md:bg-transparent md:p-0">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-slate-200">
              <TabsTrigger
                value="coordinates"
                className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Globe className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Coordinates & Plotting</span>
                <span className="md:hidden">Plotting</span>
              </TabsTrigger>
              <TabsTrigger value="depths" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Waves className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Depths & Tides</span>
                <span className="md:hidden">Tides</span>
              </TabsTrigger>
              <TabsTrigger value="symbols" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
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
                  Most nautical charts use the <strong>Mercator Projection</strong>. Imagine a light bulb in the center
                  of the Earth projecting the continents onto a cylinder wrapped around the Equator. Use this
                  projection, and <strong>Latitudes</strong> and <strong>Longitudes</strong> become straight lines
                  intersecting at 90°.
                </p>
                <p className="border-l-4 border-blue-200 pl-4 italic text-slate-600">
                  This distortion means that landmasses near the poles look much larger than they are. However, it
                  preserves <strong>Direction</strong> (bearings are straight lines) and strictly defines{" "}
                  <strong>Distance</strong> via the Latitude scale.
                </p>

                <div className="grid md:grid-cols-2 gap-8 my-8">
                  <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4 rotate-90" /> The Parallel of Latitude
                    </h4>
                    <p className="text-sm">
                      Horizontal lines that run East-West parallel to the Equator. They never touch.
                    </p>
                    <ul className="list-disc list-inside text-sm font-medium text-blue-900 bg-blue-50 p-3 rounded">
                      <li>
                        They are <strong>Equidistant</strong> everywhere on Earth.
                      </li>
                      <li>1 Degree (°) = 60 Minutes (').</li>
                      <li>
                        <strong>1 Minute of Latitude = 1 Nautical Mile (1852m).</strong>
                      </li>
                    </ul>
                    <p className="text-sm font-bold text-red-600">
                      Therefore, ALWAYS use the vertical Latitude scale on the side of the chart to measure DISTANCE.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> The Meridian of Longitude
                    </h4>
                    <p className="text-sm">
                      Vertical lines that run North-South and converge at the Poles (like segments of an orange).
                    </p>
                    <ul className="list-disc list-inside text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded">
                      <li>They get closer together as you go North.</li>
                      <li>1 Minute of Longitude is NOT a Nautical Mile (except at the Equator).</li>
                    </ul>
                    <p className="text-sm font-bold text-slate-500">
                      NEVER use the horizontal Longitude scale to measure distance. It is only for defining Position
                      (East/West).
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
                        Read off the minutes. <strong>1 Minute = 1 Mile</strong>.
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
                  <ul className="grid grid-cols-2 gap-2 text-sm text-indigo-800">
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

              <Card className="border-2 border-indigo-100 shadow-md">
                <CardContent className="pt-6">
                  <VirtualChartPlotter />
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
                <h3 className="text-xl font-semibold text-slate-900">The Tale of Two Datums</h3>
                <p>
                  On a chart, we can't just use one "Zero" level because the sea level is constantly changing.
                  Therefore, nautical charts use <strong>two different reference levels (Datums)</strong> to keep you
                  safe.
                </p>

                <div className="grid md:grid-cols-2 gap-8 my-8">
                  {/* Scale 1: Chart Datum */}
                  <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-blue-800 flex items-center gap-2">
                        <Anchor className="w-5 h-5" /> Chart Datum (CD)
                      </CardTitle>
                      <CardDescription className="text-blue-600 font-medium">"The Safety Datum"</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-700">
                      <p>
                        <strong>What is it?</strong> The level of <em>Lowest Astronomical Tide (LAT)</em>. The tide will
                        almost NEVER fall below this level.
                      </p>
                      <p>
                        <strong>Why use it?</strong> It frames the "Worst Case Scenario". If the chart says 5m depth,
                        you are practically guaranteed 5m of water even at low tide.
                      </p>
                      <ul className="list-disc list-inside bg-white p-3 rounded border border-blue-100 shadow-sm">
                        <li>
                          <strong>Soundings:</strong> Depth shown is measured DOWN from CD.
                        </li>
                        <li>
                          <strong>Drying Heights:</strong> Features that get wet and dry (rocks, banks). Height is
                          measured UP from CD. shown as <u>underlined</u> figures.
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Scale 2: Height Datum */}
                  <Card className="border-l-4 border-l-orange-500 bg-orange-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-orange-800 flex items-center gap-2">
                        <Mountain className="w-5 h-5" /> Height Datum (MHWS)
                      </CardTitle>
                      <CardDescription className="text-orange-600 font-medium">"The Clearance Datum"</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-700">
                      <p>
                        <strong>What is it?</strong> Usually <em>Mean High Water Springs (MHWS)</em>. A high average
                        tide level.
                      </p>
                      <p>
                        <strong>Why use it?</strong> It ensures you don't hit your mast. If a bridge has 20m clearance,
                        that is calculated at a High Tide. At low tide, you will have <em>more</em> room.
                      </p>
                      <ul className="list-disc list-inside bg-white p-3 rounded border border-orange-100 shadow-sm">
                        <li>
                          <strong>Vertical Clearances:</strong> Bridges/Power lines. Measured DOWN from MHWS.
                        </li>
                        <li>
                          <strong>Light Heights:</strong> Lighthouses. Measured UP from MHWS (so you know when you can
                          see them).
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
                    To find out how much water you ACTUALLY have under your keel at any specific time:
                  </p>
                  <div className="font-mono text-xl text-center bg-slate-800 p-4 rounded border border-slate-600">
                    Actual Depth = Charted Depth + Height of Tide
                  </div>
                  <p className="text-sm text-slate-400 italic text-center">
                    (If it's a Drying Height, you SUBTRACT it from the Height of Tide)
                  </p>
                </div>

                <div className="mt-12 space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Waves className="w-6 h-6 text-blue-600" />
                    Interactive Tidal Visualizer
                  </h3>
                  <p>
                    Use the tool below to visualize how the tide level (blue water) rises above Chart Datum, adding to
                    your available depth.
                  </p>
                  <TidalVisualizer />
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
                  Admiralty Charts use a standardized set of symbols (defined in publication <strong>Chart 5011</strong>
                  ). While there are thousands of symbols, they follow a logical colour scheme designed to be read under
                  red light at night.
                </p>

                <h4 className="font-bold text-lg mt-6">The 4-Colour Palette</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
                  <div className="p-4 bg-[#f2e8be] border border-stone-300 rounded shadow-sm">
                    <span className="font-bold text-stone-800 block mb-1">YELLOW</span>
                    <p className="text-xs text-stone-700">Land. Always dry.</p>
                    <div className="mt-2 text-xs italic text-stone-600">"If it's yellow, you can walk on it."</div>
                  </div>
                  <div className="p-4 bg-[#1d9c60] text-white rounded shadow-sm">
                    <span className="font-bold block mb-1">GREEN</span>
                    <p className="text-xs opacity-90">Drying Areas.</p>
                    <div className="mt-2 text-xs italic opacity-80">"Wet at high tide, dry at low tide."</div>
                  </div>
                  <div className="p-4 bg-[#b2d3f0] border border-blue-300 rounded shadow-sm">
                    <span className="font-bold text-blue-900 block mb-1">BLUE</span>
                    <p className="text-xs text-blue-800">Shallow Water.</p>
                    <div className="mt-2 text-xs italic text-blue-700">
                      Usually &lt;5m depth (check the contour line!).
                    </div>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded shadow-sm">
                    <span className="font-bold text-slate-900 block mb-1">WHITE</span>
                    <p className="text-xs text-slate-600">Deep Water.</p>
                    <div className="mt-2 text-xs italic text-slate-500">Kept white so text/courses are legible.</div>
                  </div>
                </div>

                <h4 className="font-bold text-lg mt-6">Common Hazards & Symbols</h4>
                <ul className="space-y-2 text-sm bg-slate-50 p-4 rounded border border-slate-200">
                  <li className="flex gap-2 items-start">
                    <strong className="min-w-[4rem]">Star:</strong>
                    <span>A navigational light/lighthouse. The magenta "flare" shows it is lit.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <strong className="min-w-[4rem]">Diamond:</strong>
                    <span>A buoy (Beacon). The shape/colour tells you its purpose (Cardinal, Lateral).</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <strong className="min-w-[4rem]">+</strong>
                    <span>A dangerous rock (submerged).</span>
                  </li>
                </ul>

                <div className="mt-8 space-y-4">
                  <h3 className="text-xl font-bold">Chart Symbol Quiz</h3>
                  <p className="text-slate-700">
                    The best way to learn symbols is repetition. Test yourself with common symbols found on Admiralty
                    Charts.
                  </p>
                  <ChartSymbolQuiz />
                </div>
              </div>
            </section>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center pt-12 pb-8">
          <Button
            size="lg"
            className="px-8"
            disabled={!canComplete}
            onClick={async () => {
              await markCompleted();
              navigate("/navigation");
            }}
          >
            {canComplete ? "Complete Module" : "Explore all sections to complete"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ChartsTheory;
