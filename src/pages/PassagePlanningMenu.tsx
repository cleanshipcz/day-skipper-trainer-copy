import { useNavigate } from "react-router-dom";
import { BookOpen, Calculator, ClipboardList, ListChecks, CircleHelp } from "lucide-react";
import { ModuleMenuPage } from "@/components/module-menu/ModuleMenuPage";
import type { ModuleMenuItem } from "@/components/module-menu/types";
const modules: ModuleMenuItem[] = [
  { id:"passage-planning-prepare", title:"PREPARE", description:"A systematic framework for every passage", icon:BookOpen, path:"/passage-planning/prepare", type:"learn", color:"from-sky-500 to-blue-600" },
  { id:"passage-planning-calculator", title:"Passage Calculator", description:"Time, fuel, reserve and ETA", icon:Calculator, path:"/passage-planning/calculator", type:"practice", color:"from-blue-500 to-indigo-600" },
  { id:"passage-planning-builder", title:"Plan Builder", description:"Waypoints, legs, tidal gates and weather windows", icon:ClipboardList, path:"/passage-planning/builder", type:"practice", color:"from-indigo-500 to-violet-600" },
  { id:"passage-planning-checklist", title:"Pre-departure Checklist", description:"Practise a complete departure routine", icon:ListChecks, path:"/passage-planning/checklist", type:"practice", color:"from-teal-500 to-emerald-600" },
  { id:"quiz-passage-planning", title:"Passage Planning Quiz", description:"Test your end-to-end planning knowledge", icon:CircleHelp, path:"/quiz/passage-planning", type:"quiz", color:"from-violet-500 to-purple-600" },
];
export default function PassagePlanningMenu() { const navigate=useNavigate(); return <ModuleMenuPage title="Passage Planning" subtitle="Appraise, calculate, build, check and execute a safe passage" onBack={()=>navigate("/")} modules={modules} onNavigate={navigate} gridClassName="grid md:grid-cols-2 lg:grid-cols-3 gap-6" />; }
