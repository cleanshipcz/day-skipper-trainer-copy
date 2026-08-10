import type { TheorySection } from "@/components/weather/WeatherTheoryLayout";
import { WeatherTheoryLayout } from "@/components/weather/WeatherTheoryLayout";

// Exported for safety-critical content regression tests.
// eslint-disable-next-line react-refresh/only-export-components
export const fogTheorySections: readonly TheorySection[] = [
  {
    title: "How fog forms",
    body: <><p><strong>Advection/sea fog:</strong> warm moist air moves over colder sea, cools to its dew point and can persist in wind. It is common near cold currents and coasts.</p><p><strong>Radiation fog:</strong> land cools on clear, calm nights; fog forms over land and may drift into nearby water, often clearing with daytime heating.</p></>,
  },
  {
    title: "Marine forecast visibility scale",
    body: <><p>The four visibility terms in UK marine forecasts describe the prevailing horizontal visibility:</p><ul className="list-disc pl-5"><li><strong>Good:</strong> more than 5 NM (over 9,260 m).</li><li><strong>Moderate:</strong> 2–5 NM (3,704–9,260 m), including exactly 2 NM and 5 NM.</li><li><strong>Poor:</strong> 1,000 m to less than 2 NM (about 0.54 NM to under 3,704 m), including exactly 1,000 m.</li><li><strong>Very poor:</strong> less than 1,000 m (under about 0.54 NM).</li></ul><p>These boundary conventions make the adjacent bands unambiguous: 1,000 m is poor, 2 NM is moderate and 5 NM is moderate.</p></>,
  },
  {
    title: "Fog is not a forecast visibility term",
    body: <><p><strong>Fog</strong> is suspended water droplets with meteorological visibility below 1,000 m. <strong>Mist</strong> is also water droplets, but visibility is 1,000 m or more. <strong>Haze</strong> is caused by dry particles rather than droplets.</p><p>A marine forecast can therefore give <strong>weather</strong> such as fog, mist, rain or drizzle and separately give the expected <strong>visibility</strong> band. “Fog, very poor” describes related but different fields: the phenomenon and the distance category.</p></>,
  },
  {
    title: "COLREG restricted visibility",
    body: <><p>COLREG Rule 3 defines restricted visibility more broadly than meteorological fog: fog, mist, falling snow, heavy rainstorms, sandstorms or any similar cause may restrict visibility. The Rules set no single distance at which Rule 19 begins to apply; assess the actual conditions and whether vessels are in sight.</p><p>In or near restricted visibility, proceed at a safe speed, keep a proper lookout and have engines ready for immediate manoeuvre where required. Apply the Rule 35 sound signals; they do not confer right of way.</p></>,
  },
  {
    title: "Actions in fog",
    body: <ul className="list-disc pl-5"><li>Reduce to a safe speed and be ready to manoeuvre.</li><li>Post a dedicated lookout; use hearing as well as sight.</li><li>Show navigation lights and use radar and AIS appropriately; never rely on AIS alone.</li><li>Fix position, monitor depth and move clear of traffic routes if safe.</li></ul>,
  },
  {
    title: "Sound signals",
    body: <p>Apply COLREG Rule 35. A power-driven vessel making way sounds one prolonged blast at intervals of no more than two minutes; a sailing vessel sounds one prolonged followed by two short. These signals do not confer right of way.</p>,
  },
  {
    title: "Authoritative references",
    body: <ul className="list-disc pl-5"><li>UK Met Office: <a className="underline" href="https://weather.metoffice.gov.uk/guides/coast-and-sea/glossary">Coast and sea glossary</a> (forecast visibility terms and weather definitions).</li><li>UK Met Office: <a className="underline" href="https://www.metoffice.gov.uk/weather/learn-about/weather/types-of-weather/fog/difference-mist-and-fog">Fog, mist and haze guidance</a>.</li><li>U.S. Coast Guard: <a className="underline" href="https://www.navcen.uscg.gov/sites/default/files/pdf/navRules/Handbook/NavRules_Handbook_Corrected_08_08_2024.pdf">Navigation Rules and Regulations Handbook, corrected 8 August 2024</a>, COLREG Rules 3, 19 and 35.</li></ul>,
  },
];

export default function FogTheory() {
  return <WeatherTheoryLayout title="Fog & Visibility" subtitle="Anticipate restricted visibility and respond early" topicId="weather-fog" sections={fogTheorySections} />;
}
