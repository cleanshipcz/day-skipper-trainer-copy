import type { TheorySection } from "@/components/weather/WeatherTheoryLayout";
import { WeatherTheoryLayout } from "@/components/weather/WeatherTheoryLayout";
import { ForecastAreaMap } from "@/components/weather/ForecastAreaMap";

const sources = {
  guide: "https://weather.metoffice.gov.uk/guides/coast-and-sea",
  glossary: "https://weather.metoffice.gov.uk/guides/coast-and-sea/glossary",
  shipping: "https://weather.metoffice.gov.uk/specialist-forecasts/coast-and-sea/shipping-forecast",
  inshore: "https://weather.metoffice.gov.uk/specialist-forecasts/coast-and-sea/inshore-waters-forecast",
  msi: "https://www.gov.uk/government/publications/advice-note-1033-maritime-safety-information-msi-leaflet/advice-note-1033-maritime-safety-information-msi-leaflet",
  mcaOverview: "https://www.gov.uk/maritime-safety-weather-and-navigation/maritime-safety-information-broadcasts",
} as const;

// Content is exported so focused tests can protect safety-critical product distinctions.
// eslint-disable-next-line react-refresh/only-export-components
export const weatherForecastSections: readonly TheorySection[] = [
  {
    title: "Choose the right official product",
    body: <>
      <ul className="list-disc space-y-2 pl-5">
        <li><strong>Shipping Forecast:</strong> the 31 named sea areas around and approaching the British Isles. It includes gale warnings in force, a general synopsis, then each area’s wind direction and force, sea state, weather and visibility.</li>
        <li><strong>Inshore Waters Forecast:</strong> the coastal strip out to 12 nautical miles, divided into 19 coastal areas. It gives wind, sea state, weather and visibility with coastal and local-area detail plus an outlook.</li>
        <li><strong>Gale Warning:</strong> a separate warning for Shipping Forecast areas when force 8 (34 knots) or more is expected. It is also incorporated into the Shipping Forecast and can be issued independently as required.</li>
        <li><strong>Strong Wind Warning:</strong> an Inshore Waters warning when force 6 (22 knots) or more is newly forecast. It is not a gale warning and remains tied to the inshore product.</li>
      </ul>
      <p>Select the product and every area your route enters—not merely the departure point. Coastal passages normally need the relevant Inshore Waters area; offshore legs need each Shipping Forecast area crossed.</p>
    </>,
  },
  {
    title: "A disciplined acquisition check",
    body: <ol className="list-decimal space-y-2 pl-5">
      <li>Confirm the <strong>product, route area and adjacent/upwind area</strong>; weather and seas can arrive across a boundary.</li>
      <li>Read the <strong>issue time, start time, valid period and time zone</strong>. A cached or expired forecast is not a current forecast.</li>
      <li>Check <strong>current gale, strong-wind and navigational warnings</strong> separately; do not assume the routine text is the latest warning.</li>
      <li>Use <strong>two independent sources</strong>: obtain the official forecast/warnings through an appropriate MSI broadcast and cross-check with a refreshed official forecast, observations or another available broadcast.</li>
      <li>Record the forecast and the next reassessment time in the passage plan. Recheck before departure, at area boundaries and when actual conditions diverge.</li>
    </ol>,
  },
  {
    title: "Delivery routes and their limits",
    body: <>
      <ul className="list-disc space-y-2 pl-5">
        <li><strong>VHF radiotelephony:</strong> HM Coastguard announces MSI on channel 16 and directs listeners to a working channel. Range is coastal and reception depends on aerial height, terrain and service coverage; check the current local schedule rather than memorising one here.</li>
        <li><strong>NAVTEX:</strong> a dedicated text receiver that stores broadcasts. International 518 kHz carries English-language MSI; UK national 490 kHz carries selected inshore weather information. Select the transmitting stations for both the present area and the area being approached.</li>
        <li><strong>Online Met Office pages and official apps:</strong> useful for planning, maps and refreshed text, but connectivity, caching and delayed updates can fail. <strong>The internet is not an MSI broadcast channel and must not be the sole way of receiving the latest warnings at sea.</strong></li>
        <li><strong>Model viewers and third-party apps:</strong> useful scenarios, not an official warning or a guaranteed point forecast. Different runs may disagree and fine-looking local detail can hide uncertainty; compare them with official products and actual observations.</li>
      </ul>
    </>,
  },
  {
    title: "Decode the bulletin",
    body: <>
      <p>Read in order: <strong>warnings → general synopsis → relevant area forecast</strong>. The synopsis explains the pressure systems and their expected movement; it does not replace the area fields.</p>
      <dl className="space-y-2">
        <div><dt className="font-semibold">Wind</dt><dd>Direction is where the wind comes from; force is Beaufort mean wind. A range such as “5 to 7” requires planning for 7. “Occasionally” and “perhaps” still identify plausible worse periods. “Veering” is clockwise, “backing” anticlockwise, “cyclonic” means marked directional variation around a low, and “variable” means no single prevailing direction.</dd></div>
        <div><dt className="font-semibold">Sea state</dt><dd>Smooth: under 0.5 m; slight: 0.5–1.25 m; moderate: 1.25–2.5 m; rough: 2.5–4 m; very rough: 4–6 m. These are significant wave-height bands: individual waves can be higher, and wind against tide, swell, shoaling and headlands can worsen the boat’s actual motion.</dd></div>
        <div><dt className="font-semibold">Weather and visibility</dt><dd>Very poor: under 1,000 m; poor: 1,000 m–2 NM; moderate: 2–5 NM; good: over 5 NM. Treat “occasionally poor” as an operational possibility, especially near traffic, hazards or a difficult approach.</dd></div>
      </dl>
    </>,
  },
  {
    title: "Timing language",
    body: <>
      <ul className="list-disc space-y-2 pl-5">
        <li><strong>Imminent:</strong> expected within 6 hours of the warning’s issue time.</li>
        <li><strong>Soon:</strong> expected 6–12 hours after issue.</li>
        <li><strong>Later:</strong> expected more than 12 hours after issue.</li>
      </ul>
      <p>These terms are windows, not appointments. Convert each one to clock times from the displayed issue time, compare it with the route timeline, and retain margin for forecast error and a slower-than-planned passage.</p>
    </>,
  },
  {
    title: "Worked passage decision",
    body: <>
      <p><strong>Evidence:</strong> “Wight: southwest 5 to 7, veering west 4 later; moderate or rough; rain then showers; moderate or poor becoming good.” A current warning check shows no gale warning, but a force-7 upper range remains significant for a small yacht.</p>
      <ol className="list-decimal space-y-2 pl-5">
        <li><strong>Worst credible conditions:</strong> plan for southwest 7, rough sea, rain and poor visibility—not the later west 4. Check tide direction; wind against tide may make exposed headlands or harbour bars unacceptable.</li>
        <li><strong>Timing and uncertainty:</strong> translate “later” from the issue time. Compare forecast timing with departure, tidal gates and ETA; allow for the improvement arriving late and for slower progress in a head sea.</li>
        <li><strong>Boat and crew:</strong> compare force, waves, visibility and duration with written limits, crew experience, fatigue, reefing capability and navigation workload. Reef and secure early rather than after conditions peak.</li>
        <li><strong>Shelter and escape:</strong> identify sheltered water, a reachable diversion before the exposed leg, safe approaches in poor visibility and the last decision point from which turning back remains safe.</li>
        <li><strong>Reassess:</strong> before departure and at the decision point, obtain current warnings plus a second source; compare actual wind, pressure, sea and visibility with the forecast.</li>
      </ol>
      <p><strong>No-go or escalation triggers:</strong> a new gale/strong-wind warning affecting the route, observed conditions already above the plan, worsening wind against tide, visibility below the crew’s safe-navigation limit, loss of a reliable escape option, equipment defect, or crew concern. Delay, shorten, reroute or seek experienced advice rather than rationalising a breached limit.</p>
    </>,
  },
  {
    title: "Authoritative references",
    body: <>
      <p>Claims checked 10 August 2026. Always use the current pages and displayed issue/valid times:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li><a className="underline" href={sources.guide} target="_blank" rel="noreferrer">Met Office guide to marine forecasts</a> and <a className="underline" href={sources.glossary} target="_blank" rel="noreferrer">marine glossary</a></li>
        <li><a className="underline" href={sources.shipping} target="_blank" rel="noreferrer">Current Shipping Forecast and gale warnings</a> and <a className="underline" href={sources.inshore} target="_blank" rel="noreferrer">current Inshore Waters forecast and strong winds</a></li>
        <li><a className="underline" href={sources.msi} target="_blank" rel="noreferrer">MCA Advice Note 1033: Maritime Safety Information</a> and <a className="underline" href={sources.mcaOverview} target="_blank" rel="noreferrer">MCA MSI broadcast overview</a></li>
      </ul>
    </>,
  },
] as const;

export default function WeatherForecastsTheory() {
  return <WeatherTheoryLayout title="Marine Weather Forecasts" subtitle="Obtain, cross-check and interpret" topicId="weather-forecasts" sections={weatherForecastSections}><ForecastAreaMap /></WeatherTheoryLayout>;
}
