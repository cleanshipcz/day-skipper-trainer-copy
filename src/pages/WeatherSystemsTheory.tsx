import type { TheorySection } from "@/components/weather/WeatherTheoryLayout";
import { WeatherTheoryLayout } from "@/components/weather/WeatherTheoryLayout";
import { SynopticChartReader } from "@/components/weather/SynopticChartReader";

// Content is exported so focused tests can protect safety-critical qualifications.
// eslint-disable-next-line react-refresh/only-export-components
export const weatherSystemsSections: readonly TheorySection[] = [
  {
    title: "Pressure, isobars & tendency",
    body: <>
      <p>Atmospheric pressure is shown in hectopascals (hPa); mean sea-level pressure is about 1013 hPa. A value is not “good” or “bad” by itself: compare it with nearby values, the pattern on the chart and its change with time. Isobars join places of equal pressure, commonly at 4 hPa intervals on UK synoptic charts.</p>
      <p><strong>Spacing shows the pressure gradient.</strong> Closely spaced isobars mean a steeper gradient and generally stronger true wind; widely spaced isobars mean a weaker gradient and generally lighter wind. Local effects, fronts, squalls, friction and topography can make the wind differ from this broad indication.</p>
      <p>Record pressure at regular times. A sustained or accelerating fall can indicate an approaching low or front; a rise often follows a front or accompanies building high pressure. The tendency and the forecast movement matter more than one barometer reading.</p>
    </>,
  },
  {
    title: "Highs, lows, ridges & troughs",
    body: <>
      <p>A <strong>high (anticyclone)</strong> usually has sinking air and often settled weather, but may also trap poor visibility, fog or low cloud. A <strong>low (depression)</strong> usually has rising air, cloud and unsettled weather. Wind strength around either system depends principally on the pressure gradient—not simply on whether an H or L is present.</p>
      <p>A <strong>ridge</strong> is an elongated extension of high pressure and often brings a temporary improvement. A <strong>trough</strong> is an elongated area of relatively low pressure, often marked by a line on the chart, and may bring a wind shift, showers or squalls even without a drawn front.</p>
      <p>In the Northern Hemisphere, surface true wind circulates clockwise around a high and anticlockwise around a low, crossing isobars slightly toward lower pressure. With your back to the true wind, lower pressure is roughly on your left (Buys Ballot’s law). This is a broad guide, not a substitute for the forecast.</p>
    </>,
  },
  {
    title: "The frontal wave & warm sector",
    body: <>
      <p>A frontal depression can develop as a wave on the boundary between warm and cold air. Its <strong>warm front</strong> is shown by <span className="text-red-600 font-bold">red semicircles ◡ ◡ ◡</span>, its <strong>cold front</strong> by <span className="text-blue-600 font-bold">blue triangles ▲ ▲ ▲</span>; the symbols point in the direction the front is moving.</p>
      <p>The wedge of relatively warm air between the warm and cold fronts is the <strong>warm sector</strong>. As the faster cold front catches the warm front, it lifts the warm air from the surface and forms an <strong>occluded front</strong>, shown by <span className="text-purple-600 font-bold">alternating semicircles and triangles ◡ ▲ ◡ ▲</span> on the same side.</p>
      <p>Fronts are zones rather than precise lines. Their timing, intensity and associated conditions vary, and an occlusion may resemble either a warm- or cold-front passage.</p>
    </>,
  },
  {
    title: "Worked passage: warm then cold front",
    body: <>
      <p><strong>Assumption:</strong> a typical Northern Hemisphere depression passes north of an eastbound yacht. The sequence below is a planning model; the low’s track, speed, depth and the yacht’s position can change it.</p>
      <ol className="list-decimal pl-5 space-y-2">
        <li><strong>Ahead of the warm front:</strong> pressure falls; true wind is commonly from east or southeast, then veers toward south as the front approaches, and strengthens if isobars tighten. High cirrus spreads in, then cloud lowers and thickens. Rain becomes persistent, visibility deteriorates and temperature may begin to rise.</li>
        <li><strong>Warm-front passage and warm sector:</strong> pressure usually steadies or falls more slowly. True wind typically veers toward southwest; rain may ease to drizzle, but low cloud, mist and poor visibility can persist. Air becomes milder and humid, with fresh wind where the gradient remains steep.</li>
        <li><strong>Cold-front passage:</strong> pressure reaches a minimum then starts to rise. True wind often veers sharply toward west or northwest, with a short-lived increase or squalls. A narrow band of towering or cumulonimbus cloud may bring heavy rain followed by showers; visibility can be very poor in rain, then improve between showers. Temperature falls.</li>
        <li><strong>Behind the cold front:</strong> pressure rises, cloud becomes broken and showery, and visibility is often good between showers. The colder west or northwest wind may stay strong when isobars remain close together.</li>
      </ol>
    </>,
  },
  {
    title: "Worked passage: occlusion",
    body: <>
      <p>Approaching an occlusion, pressure commonly falls, cloud thickens and prolonged rain or showers reduce visibility. At passage, pressure may level then rise, the true wind may veer and become gusty, and temperature change can be small because the warm sector has been lifted clear of the surface. Afterward, rain may turn showery and visibility improve between showers—but embedded heavy rain and strong winds can persist.</p>
      <p>Do not infer an exact wind shift or clearance time from the symbol alone. Use successive charts, the forecast, barometer and observations to see whether the real system matches the expected sequence.</p>
    </>,
  },
  {
    title: "Turn the chart into passage decisions",
    body: <>
      <ul className="list-disc pl-5 space-y-2">
        <li>Compare successive synoptic charts and forecasts: note the system’s track and speed, front timings, isobar spacing, pressure tendency, expected true wind and sea state.</li>
        <li>Consider delaying, shortening or rerouting if tightening isobars, a rapidly deepening low, a front at a tidal gate, or strong wind against tide could create unsafe seas.</li>
        <li>Before deterioration, reef early, secure gear, prepare waterproofs and navigation lights, brief the crew and identify shelter plus escape ports. Allow extra margin for squalls, lee shores, poor visibility and difficult harbour approaches.</li>
        <li>Monitor actual pressure, cloud, true wind, visibility and temperature against the forecast. Update the plan if the front arrives early or late, strengthens, stalls or follows a different track.</li>
      </ul>
      <p>Synoptic interpretation supports a decision; it does not guarantee conditions. Combine it with current official forecasts and warnings, local knowledge, sea state, tide, vessel limits and crew capability.</p>
    </>,
  },
] as const;

export default function WeatherSystemsTheory() {
  return (
    <WeatherTheoryLayout
      title="Weather Systems & Fronts"
      subtitle="Applied synoptic interpretation for safer passage decisions"
      topicId="weather-systems"
      sections={weatherSystemsSections}
    >
      <SynopticChartReader />
    </WeatherTheoryLayout>
  );
}
