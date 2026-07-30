import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prepareSteps } from "@/data/prepareSteps";
import { useProgress } from "@/hooks/useProgress";
import { useEffect, useState } from "react";
export default function PrepareTheory() {
 const navigate=useNavigate(), {loadProgress,saveProgress}=useProgress(); const [complete,setComplete]=useState(false);
 useEffect(()=>{void loadProgress("passage-planning-prepare").then(p=>setComplete(Boolean(p?.completed)))},[loadProgress]);
 return <main className="container mx-auto max-w-4xl p-4 py-8 space-y-6"><Button variant="ghost" onClick={()=>navigate("/passage-planning")}><ArrowLeft className="mr-2"/>Back</Button><div><h1 className="text-3xl font-bold">PREPARE a passage</h1><p className="text-muted-foreground">Seven checks turn an idea into a monitored, adaptable plan.</p></div><Accordion type="multiple" className="space-y-3">{prepareSteps.map((s,i)=><AccordionItem value={`${i}`} key={`${s.letter}-${s.title}`} className="border rounded-lg px-4"><AccordionTrigger><span><b className="text-primary text-xl mr-3">{s.letter}</b>{s.title}</span></AccordionTrigger><AccordionContent><Card className="border-0 shadow-none"><CardContent className="pt-4 space-y-3"><p>{s.description}</p><ul className="list-disc pl-5">{s.considerations.map(c=><li key={c}>{c}</li>)}</ul><p><b>Example:</b> {s.example}</p>{i===0&&<p>See also: <button className="underline" onClick={()=>navigate("/weather/systems")}>Weather Systems</button> and <button className="underline" onClick={()=>navigate("/pilotage")}>Pilotage</button>.</p>}</CardContent></Card></AccordionContent></AccordionItem>)}</Accordion><Button disabled={complete} onClick={async()=>{if(await saveProgress("passage-planning-prepare",true,100,10,{completionState:"completed"}))setComplete(true)}}>{complete?<><CheckCircle2 className="mr-2"/>Completed</>:"Mark theory complete"}</Button></main>;
}
