import { useNavigate } from "react-router-dom";
import { CloudSun, Gauge, Radio, CloudFog, CircleHelp } from "lucide-react";
import { ModuleMenuPage } from "@/components/module-menu/ModuleMenuPage";
import type { ModuleMenuItem } from "@/components/module-menu/types";

const weatherModules: ModuleMenuItem[] = [
  { id: "weather-systems", title: "Weather Systems & Fronts", description: "Pressure, isobars, wind and synoptic charts", icon: CloudSun, path: "/weather/systems", type: "learn", color: "from-blue-500 to-cyan-500" },
  { id: "weather-beaufort", title: "Beaufort Scale", description: "Wind force, sea state and a force drill", icon: Gauge, path: "/weather/beaufort", type: "practice", color: "from-cyan-500 to-teal-500" },
  { id: "weather-forecasts", title: "Marine Forecasts", description: "Forecast sources, sea areas and interpretation", icon: Radio, path: "/weather/forecasts", type: "practice", color: "from-indigo-500 to-blue-500" },
  { id: "weather-fog", title: "Fog & Visibility", description: "Fog formation, visibility and safe actions", icon: CloudFog, path: "/weather/fog", type: "learn", color: "from-slate-500 to-gray-600" },
  { id: "quiz-weather", title: "Meteorology Quiz", description: "Twenty questions across the full module", icon: CircleHelp, path: "/quiz/weather", type: "quiz", color: "from-violet-500 to-purple-500" },
];

export default function WeatherMenu() {
  const navigate = useNavigate();
  return <ModuleMenuPage title="Meteorology" description="Read the weather, judge conditions and plan safer passages." modules={weatherModules} onBack={() => navigate("/")} intro={{ badge: "RYA syllabus area 12", title: "Weather for skippers", description: "Build a practical understanding of systems, wind force, forecasts and restricted visibility.", ctaLabel: "Start with weather systems", ctaPath: "/weather/systems" }} />;
}
