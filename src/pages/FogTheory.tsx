import type { TheorySection } from "@/components/weather/WeatherTheoryLayout";
import { WeatherTheoryLayout } from "@/components/weather/WeatherTheoryLayout";

const SpreadDiagram = () => (
  <figure className="rounded-md border p-3" aria-labelledby="spread-title spread-caption">
    <h3 id="spread-title" className="font-semibold">Air temperature closing on dew point</h3>
    <svg viewBox="0 0 520 170" role="img" aria-label="A line diagram: air temperature falls from 14 to 11 degrees Celsius while dew point stays near 11 degrees; fog risk rises as the gap closes." className="mt-2 w-full">
      <title>Air temperature and dew-point spread</title>
      <desc>Air temperature, shown as a solid line marked with circles, approaches dew point, shown as a dashed line marked with squares. They meet at saturation and fog becomes possible.</desc>
      <line x1="45" y1="135" x2="490" y2="135" stroke="currentColor" />
      <line x1="45" y1="20" x2="45" y2="135" stroke="currentColor" />
      <polyline points="55,35 190,65 325,94 460,112" fill="none" stroke="currentColor" strokeWidth="4" />
      <polyline points="55,112 190,112 325,112 460,112" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="9 6" />
      {[55, 190, 325, 460].map((x, index) => <circle key={x} cx={x} cy={[35, 65, 94, 112][index]} r="5" fill="currentColor" />)}
      {[55, 190, 325, 460].map((x) => <rect key={x} x={x - 5} y="107" width="10" height="10" fill="white" stroke="currentColor" strokeWidth="2" />)}
      <text x="62" y="30" className="fill-current text-[13px]">Air temperature (solid/circles)</text>
      <text x="62" y="128" className="fill-current text-[13px]">Dew point (dashed/squares)</text>
      <text x="382" y="92" className="fill-current text-[13px]">spread ≈ 0: saturated</text>
      <text x="225" y="158" className="fill-current text-[13px]">time / cooling →</text>
    </svg>
    <figcaption id="spread-caption" className="text-sm text-muted-foreground">Conceptual example, not a forecast: a shrinking spread is a warning, not proof that fog will form. Moisture, mixing, sea temperature and local terrain also matter. Adapted from Met Office explanations of fog and dew point.</figcaption>
  </figure>
);

// Exported for safety-critical content regression tests.
// eslint-disable-next-line react-refresh/only-export-components
export const fogTheorySections: readonly TheorySection[] = [
  {
    title: "Condensation and dew point",
    body: <><p>Air can hold less water vapour as it cools. The <strong>dew point</strong> is the temperature to which air must cool, at the same pressure and moisture content, to become saturated. Further cooling allows vapour to condense onto tiny particles as droplets. At the surface those droplets may make mist or fog.</p><p>Compare air temperature with dew point: a falling <strong>air/dew-point spread</strong> means saturation is becoming more likely. A zero or small spread does not guarantee fog, and a forecast spread is not a visibility forecast.</p><SpreadDiagram /></>,
  },
  {
    title: "Common UK coastal mechanisms",
    body: <ul className="list-disc pl-5 space-y-2"><li><strong>Advection (sea) fog:</strong> mild, moist air moving over colder sea cools to its dew point. It can cover a wide area, persist by day and move ashore in an onshore breeze. A light or moderate breeze supplies moist air; stronger mixing may lift it into low cloud.</li><li><strong>Radiation fog:</strong> land loses heat on a clear, long, light-wind night. Fog pools in valleys, rivers and harbours, may drift offshore, and often thins after sunrise—though winter heating may be weak.</li><li><strong>Frontal fog/low cloud:</strong> rain adds moisture and evaporative cooling near a warm front; cloud base and visibility can fall together. Hill fog forms where moist air is forced up coastal slopes and may affect headlands while lower water remains clearer.</li><li><strong>Steam fog:</strong> very cold air over relatively warm water gains vapour that condenses. It is less common around temperate UK coasts than advection or radiation fog.</li></ul>,
  },
  {
    title: "Practical indicators—not a formula",
    body: <ul className="list-disc pl-5"><li>Read both forecast <strong>weather and visibility</strong>, including timing, area and changes; “fog patches” can still cover a harbour entrance.</li><li>Track observed air temperature and dew point. A narrowing spread, especially with moisture increasing, supports concern; sensor siting and forecast error limit precision.</li><li>Compare moist-air temperature/dew point with <strong>sea-surface temperature (SST)</strong>. Air moving over colder water favours advection cooling.</li><li>Check wind direction and strength: will it carry fog from sea, land or a river valley? Calm/light wind favours radiation fog; fresh wind can mix or relocate low cloud.</li><li>Look for fronts, drizzle or rain, overnight clearing, sunrise timing, tidal estuaries, valleys, cliffs and headlands. Conditions can differ sharply a few miles apart.</li></ul>,
  },
  {
    title: "A worked coastal decision",
    body: <><p><strong>Plan:</strong> an 0700 departure crosses a busy approach before entering a cliff-lined harbour. The inshore forecast says “fog patches, visibility very poor at times”; overnight air/dew point is 12/11 °C, nearby SST 10 °C, and a light onshore wind is forecast.</p><ol className="list-decimal pl-5 space-y-2"><li><strong>Delay:</strong> the forecast, small spread, colder sea and onshore flow reinforce one another. Wait for a later observation and harbour report rather than assuming sunrise will clear advection fog.</li><li><strong>Divert:</strong> if the approach remains affected but an accessible harbour outside the fog area has verified better visibility, recalculate fuel/time, tide and daylight and use it only if the whole route remains safe.</li><li><strong>Abort:</strong> do not depart—or turn back while a safe option remains—if visibility falls, equipment/crew readiness is inadequate, or the escape margin is being consumed. Radar or AIS does not make a marginal plan safe.</li></ol><p>If evidence conflicts (for example, one clear webcam but widespread very-poor observations), treat uncertainty as a reason for more margin, not permission to select the most favourable report.</p></>,
  },
  {
    title: "Brief, observe, reassess",
    body: <><p><strong>Before departure:</strong> use the latest Shipping Forecast/Inshore Waters Forecast and local observations, noting issue time, validity period, update time, units and station location. Add harbour/VTS information where available. Cross-check rather than relying on one app, model symbol or webcam; forecasts cannot resolve every fog bank or predict its exact edge and clearance time.</p><p><strong>Underway:</strong> set reassessment points before traffic separation, headlands and harbour approaches. Log visibility against known ranges, temperature/dew point trend, wind, cloud, rain and reports. Obtain forecast updates and verify they remain valid. Decide trigger points in advance: slow and prepare for restricted visibility, divert before the safe alternative closes, or abort while sea room remains.</p></>,
  },
  {
    title: "Marine forecast visibility scale",
    body: <><p>The four visibility terms in UK marine forecasts describe prevailing horizontal visibility:</p><ul className="list-disc pl-5"><li><strong>Good:</strong> more than 5 NM (over 9,260 m).</li><li><strong>Moderate:</strong> 2–5 NM (3,704–9,260 m), including exactly 2 NM and 5 NM.</li><li><strong>Poor:</strong> 1,000 m to less than 2 NM (about 0.54 NM to under 3,704 m), including exactly 1,000 m.</li><li><strong>Very poor:</strong> less than 1,000 m (under about 0.54 NM).</li></ul><p>Thus 1,000 m is poor, 2 NM is moderate and 5 NM is moderate.</p></>,
  },
  {
    title: "Fog, forecast terms and COLREGs",
    body: <><p><strong>Fog</strong> is suspended water droplets with meteorological visibility below 1,000 m; <strong>mist</strong> is suspended water droplets with visibility of 1,000 m or more; <strong>haze</strong> is dry particles. Forecast weather (“fog, mist, rain or drizzle”) is reported separately from forecast visibility.</p><p>COLREG Rule 3 is broader: fog, mist, falling snow, heavy rainstorms, sandstorms or a similar cause may create restricted visibility. There is no single distance at which Rule 19 applies. In or near restricted visibility use safe speed, a proper lookout, engines ready where required, navigation lights, radar and AIS appropriately (never AIS alone), and Rule 35 sound signals. A power-driven vessel making way sounds one prolonged blast at intervals of no more than two minutes; a sailing vessel sounds one prolonged followed by two short. Sound signals do not confer right of way.</p></>,
  },
  {
    title: "Authoritative references",
    body: <ul className="list-disc pl-5"><li>UK Met Office: <a className="underline" href="https://weather.metoffice.gov.uk/guides/coast-and-sea/glossary">Coast and sea glossary</a> (visibility terminology).</li><li>UK Met Office: <a className="underline" href="https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/fog">What is fog?</a> (formation, UK coastal fog, radiation fog, visibility and forecasting limits).</li><li>UK Met Office: <a className="underline" href="https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/humidity">Understanding humidity</a> (saturation, condensation and dew point).</li><li>U.S. Coast Guard: <a className="underline" href="https://www.navcen.uscg.gov/sites/default/files/pdf/navRules/Handbook/NavRules_Handbook_Corrected_08_08_2024.pdf">Navigation Rules and Regulations Handbook, corrected 8 August 2024</a>, COLREG Rules 3, 19 and 35.</li></ul>,
  },
];

export default function FogTheory() {
  return <WeatherTheoryLayout title="Fog & Visibility" subtitle="Anticipate restricted visibility and respond early" topicId="weather-fog" sections={fogTheorySections} />;
}
