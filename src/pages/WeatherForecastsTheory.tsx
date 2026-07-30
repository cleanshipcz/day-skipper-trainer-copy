import { WeatherTheoryLayout } from "@/components/weather/WeatherTheoryLayout";
import { ForecastAreaMap } from "@/components/weather/ForecastAreaMap";

export default function WeatherForecastsTheory() {
  return <WeatherTheoryLayout title="Marine Weather Forecasts" subtitle="Obtain, cross-check and interpret" topicId="weather-forecasts" sections={[
    { title: "Sources", body: <ul className="list-disc pl-5 space-y-2"><li>Coastguard broadcasts on announced VHF working channels; maintain a listening watch and check local schedules.</li><li>NAVTEX automatically receives navigational and meteorological warnings, normally on 518 kHz in English.</li><li>Met Office marine forecasts are authoritative UK products; apps such as Windy visualise model output and should be cross-checked.</li></ul> },
    { title: "Forecast structure", body: <p>The Shipping Forecast begins with gale warnings and a general synopsis, then each sea area gives wind direction and force, weather, visibility and pressure tendency. Inshore Waters forecasts add coastal detail and sea state.</p> },
    { title: "Terms that change decisions", body: <p>“Veering” means changing clockwise; “backing” anticlockwise. “Soon” means 6–12 hours and “later” more than 12 hours in the Shipping Forecast. Gusts, sea state and visibility may govern a small-craft decision even when mean wind is acceptable.</p> },
    { title: "Guided interpretation", body: <><p><strong>Example:</strong> “Wight: southwest 5 to 7, veering west 4 later; rain then showers; moderate or poor becoming good.”</p><ol className="list-decimal pl-5"><li>Plan initially for F7, not the later F4.</li><li>Expect a clockwise wind shift.</li><li>Visibility may be below 5 NM in rain.</li><li>Choose shelter and an abort point before departure.</li></ol></> },
  ]}><ForecastAreaMap /></WeatherTheoryLayout>;
}
