import { WeatherTheoryLayout } from "@/components/weather/WeatherTheoryLayout";
import { SynopticChartReader } from "@/components/weather/SynopticChartReader";

export default function WeatherSystemsTheory() {
  return <WeatherTheoryLayout title="Weather Systems & Fronts" subtitle="Pressure patterns and changing weather" topicId="weather-systems" sections={[
    { title: "Pressure & isobars", body: <><p>Atmospheric pressure is measured in hectopascals. Isobars join equal pressure; close spacing signals a strong pressure gradient and generally stronger wind.</p><p>Pressure tendency matters: a rapid fall often warns of an approaching depression.</p></> },
    { title: "Highs, lows & wind", body: <><p>Anticyclones bring sinking air, light winds and often settled conditions. Depressions bring rising air, cloud, rain and stronger, changeable wind.</p><p>In the Northern Hemisphere wind flows clockwise around a high and anticlockwise around a low, crossing isobars slightly toward lower pressure. Buys Ballot: with your back to the true wind, low pressure lies roughly to your left.</p></> },
    { title: "Warm fronts", body: <><p><span className="text-red-600 font-bold">Red semicircles ◡ ◡ ◡</span> point in the direction of travel. Expect high cloud thickening and lowering, prolonged rain, poor visibility, then warmer air.</p></> },
    { title: "Cold & occluded fronts", body: <><p><span className="text-blue-600 font-bold">Blue triangles ▲ ▲ ▲</span> mark a cold front: squalls, heavy showers, a wind shift, then clearer colder air.</p><p><span className="text-purple-600 font-bold">Occluded ◡ ▲ ◡ ▲</span> fronts combine warm- and cold-front characteristics as the cold front overtakes the warm front.</p></> },
  ]}><SynopticChartReader /></WeatherTheoryLayout>;
}
