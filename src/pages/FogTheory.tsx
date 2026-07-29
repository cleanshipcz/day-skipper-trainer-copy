import { WeatherTheoryLayout } from "@/components/weather/WeatherTheoryLayout";

export default function FogTheory() {
  return <WeatherTheoryLayout title="Fog & Visibility" subtitle="Anticipate restricted visibility and respond early" topicId="weather-fog" sections={[
    { title: "How fog forms", body: <><p><strong>Advection/sea fog:</strong> warm moist air moves over colder sea, cools to its dew point and can persist in wind. It is common near cold currents and coasts.</p><p><strong>Radiation fog:</strong> land cools on clear, calm nights; fog forms over land and may drift into nearby water, often clearing with daytime heating.</p></> },
    { title: "Visibility scale", body: <ul className="list-disc pl-5"><li>Good: more than 5 NM</li><li>Moderate: 2–5 NM</li><li>Poor: 1,000 m–2 NM</li><li>Fog: less than 1,000 m</li></ul> },
    { title: "Actions in fog", body: <ul className="list-disc pl-5"><li>Reduce to a safe speed and be ready to manoeuvre.</li><li>Post a dedicated lookout; use hearing as well as sight.</li><li>Show navigation lights, use radar/AIS appropriately and hoist a radar reflector.</li><li>Fix position, monitor depth and move clear of traffic routes if safe.</li></ul> },
    { title: "Sound signals", body: <p>Apply COLREG Rule 35. A power-driven vessel making way sounds one prolonged blast at intervals of no more than two minutes; a sailing vessel sounds one prolonged followed by two short. These signals do not confer right of way.</p> },
  ]} />;
}
