import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Square, Volume2 } from "lucide-react";
import { SOUND_EXERCISES, SOUND_SIGNALS, type Blast, type SoundSignal } from "./partDSoundSignalsData";

const duration = (blast: Blast) => blast === "short" ? 1 : 4;

function Player({ signal }: { signal: SoundSignal }) {
  const nodes = useRef<OscillatorNode[]>([]);
  const context = useRef<AudioContext | null>(null);
  const [playing,setPlaying] = useState(false);
  const stop = () => { nodes.current.forEach(node => { try { node.stop(); } catch { /* ended */ } }); nodes.current=[]; setPlaying(false); };
  useEffect(() => stop, []);
  const play = () => {
    stop();
    if (!window.AudioContext) return;
    const audio = context.current ?? new AudioContext();
    context.current=audio;
    let at=audio.currentTime+.05;
    signal.pattern.forEach(blast => { const oscillator=audio.createOscillator(); const gain=audio.createGain(); oscillator.frequency.value=440; gain.gain.value=.08; oscillator.connect(gain).connect(audio.destination); oscillator.start(at); oscillator.stop(at+duration(blast)); nodes.current.push(oscillator); at += duration(blast)+.45; });
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), (at-audio.currentTime)*1000);
  };
  return <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" className="min-h-11" onClick={play} aria-label={"Play "+signal.title+" signal"}><Volume2 className="mr-2 h-4 w-4" aria-hidden />{playing?"Playing…":"Play signal"}</Button><Button type="button" variant="ghost" className="min-h-11" onClick={stop} disabled={!playing}><Square className="mr-2 h-4 w-4" aria-hidden />Stop</Button></div>;
}
function SignalCard({signal}:{signal:SoundSignal}) {
  const description=signal.pattern.map(blast => blast+", "+duration(blast)+(blast==="prolonged"?" to 6":"")+" seconds").join("; ");
  return <Card><CardHeader><CardTitle className="text-lg">{signal.title}</CardTitle><CardDescription>{signal.condition}</CardDescription></CardHeader><CardContent className="space-y-3"><div role="img" aria-label={description} className="flex flex-wrap gap-2 font-mono text-xl">{signal.pattern.map((blast,index)=><span className="rounded border px-2 py-1" key={index} aria-hidden>{blast==="short"?"●":"━━━━"}</span>)}</div><p className="text-sm"><strong>Timing:</strong> short ≈ 1 second; prolonged = 4–6 seconds. Playback uses 4 seconds.</p><p className="text-sm"><strong>Repeat:</strong> {signal.repetition}.</p><p className="text-sm"><strong>Meaning:</strong> {signal.meaning}</p><Player signal={signal}/></CardContent></Card>;
}
function Exercise(){
  const [index,setIndex]=useState(0); const [feedback,setFeedback]=useState(""); const item=SOUND_EXERCISES[index];
  return <Card><CardHeader><CardTitle>Apply the signal</CardTitle><CardDescription>Identify visibility, vessel/status, underway/making-way state, pattern and interval.</CardDescription></CardHeader><CardContent className="space-y-4"><p className="font-medium">{index+1} of {SOUND_EXERCISES.length}. {item.prompt}</p><div className="grid gap-2" role="group" aria-label="Answer choices">{item.options.map((option,i)=><Button className="h-auto min-h-11 whitespace-normal" variant="outline" key={option} onClick={()=>setFeedback((i===item.answer?"Correct. ":"Try again. ")+item.feedback)}>{option}</Button>)}</div><p role="status" aria-live="polite" className="min-h-6 text-sm font-medium">{feedback}</p><Button disabled={!feedback.startsWith("Correct")} onClick={()=>{setIndex((index+1)%SOUND_EXERCISES.length);setFeedback("");}}>Next exercise</Button></CardContent></Card>;
}
export function PartDSoundSignals(){
  return <div className="space-y-6">
    <Card id="rule-32" tabIndex={-1} className="scroll-mt-28"><CardHeader><CardTitle>Rule 32: definitions</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p><strong>Short blast:</strong> about 1 second. <strong>Prolonged blast:</strong> 4–6 seconds.</p><p>A whistle is the prescribed appliance. “Underway” means not at anchor, made fast to shore or aground; “making way” means moving through the water.</p></CardContent></Card>
    <Card id="rule-33" tabIndex={-1} className="scroll-mt-28"><CardHeader><CardTitle>Rule 33: equipment</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>Vessels 12 m or more carry a whistle; vessels 20 m or more also carry a bell; vessels 100 m or more additionally carry a gong whose tone cannot be confused with the bell. Equivalent sound characteristics are permitted.</p><p>Under 12 m, another means of making an efficient sound signal may replace the prescribed appliances.</p></CardContent></Card>
    <section id="rule-34" tabIndex={-1} className="scroll-mt-28 space-y-4"><h3 className="text-xl font-bold">Rule 34: manoeuvring and warning</h3><p className="text-sm text-muted-foreground">These state actions in their specified in-sight context; they do not grant right of way.</p><div className="grid gap-4 md:grid-cols-2">{SOUND_SIGNALS.filter(s=>s.rule===34).map(s=><SignalCard key={s.id} signal={s}/>)}</div><Card><CardHeader><CardTitle className="text-lg">Supplementary manoeuvring lights</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>One, two or three all-round white flashes may repeat the corresponding starboard, port or astern whistle signal. Each flash lasts about 1 second, with about 1 second between flashes and at least 10 seconds between successive signals.</p><p>The light must be visible for at least 5 miles. A doubt signal may likewise be supplemented by <strong>at least five short, rapid flashes</strong>.</p></CardContent></Card><Card><CardHeader><CardTitle className="text-lg">Narrow-channel overtaking agreement</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>Under Rule 9(e)(i), the overtaker sounds <strong>two prolonged + one short</strong> to overtake on the other vessel's starboard side, or <strong>two prolonged + two short</strong> on her port side.</p><p>Agreement is <strong>one prolonged, one short, one prolonged, one short</strong>. It is not permission to proceed unsafely.</p></CardContent></Card></section>
    <div id="rule-35" tabIndex={-1} className="scroll-mt-28 space-y-4"><h3 className="text-xl font-bold">Restricted Visibility (Rule 35)</h3><p className="text-sm text-muted-foreground">Use in or near restricted visibility, by day or night. Status signals do not establish right of way.</p><div className="grid gap-4 md:grid-cols-2">{SOUND_SIGNALS.filter(s=>s.rule===35).map(s=><SignalCard key={s.id} signal={s}/>)}</div><Card><CardHeader><CardTitle className="text-lg">Anchor, aground, pilot and small vessels</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p><strong>At anchor:</strong> ring the bell rapidly for about 5 seconds at intervals of not more than 1 minute. At 100 m or more, bell forward then gong aft for about 5 seconds. An extra short–prolonged–short whistle warning may be sounded.</p><p><strong>Aground:</strong> add three distinct bell strokes immediately before and after the anchor ringing; an appropriate whistle signal may also be sounded.</p><p><strong>Pilot on duty:</strong> may add four short blasts to its Rule 35 signal.</p><p><strong>Under 12 m:</strong> if not making the prescribed signal, make another efficient signal at intervals of not more than 2 minutes. <strong>Under 20 m at anchor/aground:</strong> may substitute another efficient signal at the same maximum interval.</p></CardContent></Card></div>
    <Card id="rule-36" tabIndex={-1} className="scroll-mt-28"><CardHeader><CardTitle>Rule 36: attracting attention</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>If necessary, use light or sound that <strong>cannot be mistaken for a signal authorised elsewhere</strong>, or direct a searchlight toward danger without embarrassing another vessel.</p><p>Avoid high-intensity intermittent or revolving lights, such as strobes, that could be mistaken for an aid to navigation. Attention signals do not replace prescribed signals.</p></CardContent></Card>
    <Exercise/>
    <aside className="rounded-md border p-4 text-sm"><strong>Source and version:</strong> educational summary of COLREG Part D, Rules 32–36, checked against the U.S. Coast Guard <a className="underline" href="https://www.navcen.uscg.gov/navigation-rules-amalgamated">Amalgamated Navigation Rules</a> and <a className="underline" href="https://www.navcen.uscg.gov/sites/default/files/pdf/navRules/Handbook/NavRules_Handbook_Corrected_08_08_2024.pdf">Navigation Rules and Regulations Handbook, corrected 8 August 2024</a>. Consult current rule text and Annex III; local/inland rules may differ.</aside>
  </div>;
}
