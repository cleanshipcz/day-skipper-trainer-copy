import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calculator,
  ChevronRight,
  Compass,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { TheoryCompletionButton } from "@/features/progress/TheoryCompletionButton";

const TidalHeightsTheory = () => {
  const navigate = useNavigate();
  const [heightAnswer, setHeightAnswer] = useState<"" | "3.9" | "4.2">("");
  const [timeAnswer, setTimeAnswer] = useState<"" | "both" | "one">("");
  const checksPassed = heightAnswer === "3.9" && timeAnswer === "both";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto flex min-w-0 flex-col gap-4 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:py-4">
          <div className="flex min-w-0 items-start gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11 shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Back to Tides overview"
              onClick={() => navigate("/navigation/tides")}
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            <div className="min-w-0">
              <h1 className="break-words text-xl font-bold leading-tight">
                Calculating Tidal Heights
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                From published predictions to a conservative passage decision
              </p>
            </div>
          </div>
          <div className="min-w-0 break-words sm:max-w-xs [&_button]:h-auto [&_button]:max-w-full [&_button]:min-h-11 [&_button]:whitespace-normal">
            <TheoryCompletionButton
              topicId={TOPIC_IDS.TIDES_HEIGHTS_THEORY}
              catalogueRevision="tides-heights-theory-v2"
              evidenceId="two-direction-curve-checks"
              evidenceSatisfied={checksPassed}
              lockedLabel="Pass both calculation checks"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-blue-600" />
              Start with the publication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              A <strong>standard port</strong> has its own daily HW/LW
              predictions and a labelled curve in the official almanac or tide
              tables. A <strong>secondary port</strong> is derived by applying
              the publication's time and height corrections to its named
              standard port. Do those corrections first; never copy a
              standard-port curve answer straight to a secondary port.
            </p>
            <div
              className="max-w-full overflow-x-auto"
              tabIndex={0}
              aria-label="Scrollable tidal prediction table"
            >
              <table className="w-full min-w-[34rem] border-collapse text-left">
                <caption className="mb-2 text-left font-semibold">
                  Training extract — Northhaven standard port, 18 June (times in
                  local zone; heights above chart datum)
                </caption>
                <thead>
                  <tr className="bg-muted">
                    <th scope="col" className="border p-2">
                      Date
                    </th>
                    <th scope="col" className="border p-2">
                      Low water time
                    </th>
                    <th scope="col" className="border p-2">
                      Height
                    </th>
                    <th scope="col" className="border p-2">
                      High water time
                    </th>
                    <th scope="col" className="border p-2">
                      Height
                    </th>
                    <th scope="col" className="border p-2">
                      Low water time
                    </th>
                    <th scope="col" className="border p-2">
                      Height
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className="border p-2 font-normal">
                      18 Jun
                    </th>
                    <td className="border p-2">03:50</td>
                    <td className="border p-2">0.8 m</td>
                    <td className="border p-2">10:00</td>
                    <td className="border p-2">4.8 m</td>
                    <td className="border p-2">16:00</td>
                    <td className="border p-2">1.2 m</td>
                  </tr>
                  <tr>
                    <th scope="row" className="border p-2 font-normal">
                      18/19 Jun
                    </th>
                    <td className="border p-2">—</td>
                    <td className="border p-2">—</td>
                    <td className="border p-2">21:40</td>
                    <td className="border p-2">4.6 m</td>
                    <td className="border p-2">03:50 (+1 day)</td>
                    <td className="border p-2">0.8 m</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="rounded-md border-l-4 border-amber-500 bg-amber-50 p-3 text-amber-950">
              Check the publication's date, time zone/DST note, units and datum.
              Predictions are astronomical: pressure, wind, river flow, swell
              and local effects can change both height and time. Compare with
              current gauge/harbour observations and notices.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Use the standard-port curve
            </CardTitle>
            <CardDescription>
              The publication's curve, not a generic sine wave, is the primary
              method.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <figure className="space-y-3">
              <svg
                viewBox="0 0 720 270"
                role="img"
                aria-labelledby="curve-title curve-desc"
                className="h-auto w-full rounded-md border bg-slate-50 forced-color-adjust-auto"
              >
                <title id="curve-title">
                  Labelled standard-port falling tidal curve
                </title>
                <desc id="curve-desc">
                  The solid curve falls from high water at ten hundred and 4.8
                  metres to low water at sixteen hundred and 1.2 metres. Dashed
                  construction lines at noon meet the curve at 3.9 metres above
                  chart datum.
                </desc>
                <line
                  x1="70"
                  y1="220"
                  x2="680"
                  y2="220"
                  stroke="currentColor"
                />
                <line x1="70" y1="30" x2="70" y2="220" stroke="currentColor" />
                <text x="15" y="35" fontSize="14">
                  HOT (m)
                </text>
                <text x="625" y="255" fontSize="14">
                  Time
                </text>
                {[1, 2, 3, 4, 5].map((h) => (
                  <g key={h}>
                    <line
                      x1="65"
                      y1={220 - h * 36}
                      x2="680"
                      y2={220 - h * 36}
                      stroke="#94a3b8"
                    />
                    <text x="48" y={225 - h * 36} fontSize="12">
                      {h}
                    </text>
                  </g>
                ))}
                {[10, 11, 12, 13, 14, 15, 16].map((h, i) => (
                  <g key={h}>
                    <line
                      x1={90 + i * 90}
                      y1="220"
                      x2={90 + i * 90}
                      y2="225"
                      stroke="currentColor"
                    />
                    <text x={76 + i * 90} y="242" fontSize="12">
                      {h}:00
                    </text>
                  </g>
                ))}
                <path
                  d="M90 47 C170 50 225 70 270 80 S385 112 450 148 S560 177 630 177"
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="5"
                />
                <circle
                  cx="90"
                  cy="47"
                  r="7"
                  fill="#1d4ed8"
                  stroke="currentColor"
                />
                <circle
                  cx="630"
                  cy="177"
                  r="7"
                  fill="#1d4ed8"
                  stroke="currentColor"
                />
                <line
                  x1="270"
                  y1="80"
                  x2="270"
                  y2="220"
                  stroke="#047857"
                  strokeWidth="3"
                  strokeDasharray="8 5"
                />
                <line
                  x1="70"
                  y1="80"
                  x2="270"
                  y2="80"
                  stroke="#047857"
                  strokeWidth="3"
                  strokeDasharray="8 5"
                />
                <text x="100" y="43" fontSize="13">
                  HW 10:00, 4.8 m
                </text>
                <text x="515" y="172" fontSize="13">
                  LW 16:00, 1.2 m
                </text>
                <text x="278" y="75" fontSize="13" fill="#047857">
                  12:00 ≈ 3.9 m
                </text>
              </svg>
              <figcaption className="text-sm">
                <strong>Figure 1. Standard-port falling curve.</strong> The
                solid blue curve encodes the changing height; the dashed green
                construction lines encode the noon lookup, so the result does
                not depend on colour alone.
              </figcaption>
              <dl className="grid gap-2 rounded-md border p-3 text-sm sm:grid-cols-[max-content_1fr]">
                <dt className="font-semibold">Start event</dt>
                <dd>High water, 10:00, 4.8 metres above chart datum.</dd>
                <dt className="font-semibold">Lookup</dt>
                <dd>
                  Noon; follow the vertical dashed line to the curve, then the
                  horizontal dashed line to the height scale.
                </dd>
                <dt className="font-semibold">Result</dt>
                <dd>About 3.9 metres above chart datum.</dd>
                <dt className="font-semibold">End event</dt>
                <dd>Low water, 16:00, 1.2 metres above chart datum.</dd>
              </dl>
            </figure>
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              <li>
                Select the two <strong>adjacent</strong> events bracketing the
                required time: HW→LW is falling, LW→HW is rising. Write the date
                beside any time that crosses midnight.
              </li>
              <li>
                Mark their published times and heights on the correct
                spring/neap curve sheet exactly as its instructions require.
              </li>
              <li>
                <strong>Height at time:</strong> enter at the requested clock
                time, move to the curve, then across through the height
                construction to read metres above CD.
              </li>
              <li>
                <strong>Time for height:</strong> convert the vessel/depth
                problem to required HOT, enter at that height, reverse the
                construction to the curve, then read the time. Search both
                adjacent limbs when both rising and falling answers matter.
              </li>
              <li>
                Record source values, limb, units and result. Read only to the
                curve's resolution (normally about 0.1 m and 5–10 min), then
                apply a conservative margin—never imply false precision.
              </li>
            </ol>
          </CardContent>
        </Card>

        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Worked 1: height at time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <strong>Given:</strong> on 18 June, the falling limb runs from
                high water at 10:00 and 4.8 metres to low water at 16:00 and 1.2
                metres.
              </p>
              <p>
                <strong>Curve result:</strong> at 12:00, height of tide (HOT) is
                approximately 3.9 metres above chart datum (CD).
              </p>
              <dl className="space-y-2">
                <div>
                  <dt className="font-semibold">Water over a charted depth</dt>
                  <dd>
                    <span aria-hidden="true">1.4 m + 3.9 m = 5.3 m.</span>
                    <span className="sr-only">
                      Add charted depth 1.4 metres to height of tide 3.9 metres.
                      Water depth is 5.3 metres.
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Water over a drying height</dt>
                  <dd>
                    <span aria-hidden="true">3.9 m − 0.6 m = 3.3 m.</span>
                    <span className="sr-only">
                      Subtract drying height 0.6 metres from height of tide 3.9
                      metres. Water depth is 3.3 metres.
                    </span>
                  </dd>
                </div>
              </dl>
              <p>
                Treating drying height as a negative charted depth gives the
                same arithmetic. Quote 3.9 m, not 3.900 m. Reduce the planning
                value if uncertainty/current observations warrant it.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Worked 2: time(s) for height</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <strong>Required height:</strong>{" "}
                <span aria-hidden="true">
                  HOT = 2.0 m draft + 0.4 m UKC + 0.6 m drying height = 3.0 m.
                </span>
                <span className="sr-only">
                  Required height of tide equals draft of 2 metres, plus
                  under-keel clearance of 0.4 metres, plus drying height of 0.6
                  metres: 3 metres.
                </span>
              </p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  The falling curve crosses 3.0 metres at about{" "}
                  <strong>13:00</strong>.
                </li>
                <li>
                  The following rising curve crosses 3.0 metres at about{" "}
                  <strong>18:55</strong>.
                </li>
                <li>
                  Water is adequate{" "}
                  <strong>before 13:00 and after 18:55</strong>. Approximately
                  13:00–18:55 is unsafe; move both boundaries farther from
                  danger by the chosen margin.
                </li>
              </ol>
              <p>
                <strong>Midnight discipline:</strong> for HW 18 Jun 21:40 4.6 m
                to LW 19 Jun 03:50 0.8 m, HOT 2.7 m occurs about{" "}
                <strong>19 Jun 00:45</strong>, not “18 Jun 00:45”.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datums, clearance and limits</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 text-sm md:grid-cols-2">
            <section
              aria-labelledby="clearance-heading"
              className="min-w-0 space-y-2"
            >
              <h3 id="clearance-heading" className="font-semibold">
                Clearance formulas
              </h3>
              <p>
                <strong>Under-keel:</strong> depth of water equals charted depth
                plus height of tide. Over a drying height, subtract drying
                height from height of tide. Required height of tide equals draft
                plus under-keel clearance minus charted depth.
              </p>
              <p>
                <strong>Sign convention:</strong> a sounding below chart datum
                is positive charted depth; a drying height above chart datum is
                subtracted.
              </p>
              <p>
                <strong>Overhead:</strong> charted clearance is commonly
                referred to a high-water datum, not CD. Follow the
                chart/publication convention; compare available clearance with
                air draught plus margin. Do not combine values from different
                datums.
              </p>
            </section>
            <section
              aria-labelledby="twelves-heading"
              className="min-w-0 space-y-2"
            >
              <h3 id="twelves-heading" className="font-semibold">
                Rule of Twelves rough check
              </h3>
              <div
                className="max-w-full overflow-x-auto"
                tabIndex={0}
                aria-label="Scrollable Rule of Twelves table"
              >
                <table className="w-full min-w-[26rem] border-collapse text-center">
                  <caption className="pb-2 text-left">
                    Approximate share of total range during each hour of a
                    regular six-hour tide
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col" className="border p-2">
                        Hour
                      </th>
                      {[1, 2, 3, 4, 5, 6].map((hour) => (
                        <th scope="col" className="border p-2" key={hour}>
                          {hour}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row" className="border p-2 text-left">
                        Twelfths
                      </th>
                      {[1, 2, 3, 3, 2, 1].map((share, index) => (
                        <td className="border p-2" key={index}>
                          {share}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                The sequence is 1, 2, 3, 3, 2, 1 twelfths per hour. The third
                and fourth hours have the greatest change. Use it only as a
                rough check for a fairly regular six-hour semidiurnal tide,
                never for strongly distorted, shallow-water or double high/low
                tides.
              </p>
              <p>
                Standard-port predictions do not remove secondary-port
                corrections or weather/local uncertainty.
              </p>
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" aria-hidden="true" />
              Calculation checks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <fieldset className="space-y-1">
              <legend className="mb-2 font-semibold">
                1. On the worked falling limb, what HOT should be recorded at
                12:00?
              </legend>
              <label className="flex min-h-11 items-center gap-3 rounded-md px-2 focus-within:ring-2 focus-within:ring-ring">
                <input
                  type="radio"
                  name="height-check"
                  checked={heightAnswer === "3.9"}
                  onChange={() => setHeightAnswer("3.9")}
                />
                3.9 m above CD
              </label>
              <label className="flex min-h-11 items-center gap-3 rounded-md px-2 focus-within:ring-2 focus-within:ring-ring">
                <input
                  type="radio"
                  name="height-check"
                  checked={heightAnswer === "4.2"}
                  onChange={() => setHeightAnswer("4.2")}
                />
                4.2 m water depth
              </label>
              {heightAnswer && (
                <p role="status" aria-live="polite" className="mt-2">
                  {heightAnswer === "3.9"
                    ? "Correct — enter at 12:00 and read about 3.9 m above CD; add charted depth separately."
                    : "Try again — keep height of tide above CD separate from depth of water."}
                </p>
              )}
            </fieldset>
            <fieldset className="space-y-1">
              <legend className="mb-2 font-semibold">
                2. Required HOT is 3.0 m, crossed at 13:00 falling and about
                18:55 rising. Which statement is safe?
              </legend>
              <label className="flex min-h-11 items-center gap-3 rounded-md px-2 focus-within:ring-2 focus-within:ring-ring">
                <input
                  type="radio"
                  name="time-check"
                  checked={timeAnswer === "both"}
                  onChange={() => setTimeAnswer("both")}
                />
                Adequate before 13:00 and after 18:55, then add margin
              </label>
              <label className="flex min-h-11 items-center gap-3 rounded-md px-2 focus-within:ring-2 focus-within:ring-ring">
                <input
                  type="radio"
                  name="time-check"
                  checked={timeAnswer === "one"}
                  onChange={() => setTimeAnswer("one")}
                />
                Adequate from 13:00 to 18:55
              </label>
              {timeAnswer && (
                <p role="status" aria-live="polite" className="mt-2">
                  {timeAnswer === "both"
                    ? "Correct — on the falling limb the crossing ends adequacy; on the rising limb it restores it. Move both limits conservatively away from danger."
                    : "Unsafe — height is below the requirement between the falling and rising crossings."}
                </p>
              )}
            </fieldset>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 text-sm">
            <strong>Practice-tool boundary:</strong> the planner is a learning
            aid using a smooth mathematical approximation. It is useful for
            rehearsing depth/clearance arithmetic and exploring windows, but it
            does not reproduce a named port's official curve, secondary-port
            corrections, weather or live observations. Recalculate from current
            official publications before navigation.
          </CardContent>
        </Card>
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/navigation/tides/heights-calc")}
            className="h-auto max-w-full whitespace-normal bg-emerald-600 hover:bg-emerald-700"
          >
            Open the practice tool <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TidalHeightsTheory;
