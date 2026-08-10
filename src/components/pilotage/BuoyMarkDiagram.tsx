import type { IalaBuoy, Topmark } from "@/data/ialabuoys";

const colours: Record<string,string[]> = {
 "solid-red":["#dc2626"],"solid-green":["#15803d"],"red-green-red":["#dc2626","#15803d","#dc2626"],"green-red-green":["#15803d","#dc2626","#15803d"],"black-yellow":["#111827","#facc15"],"black-yellow-black":["#111827","#facc15","#111827"],"yellow-black":["#facc15","#111827"],"yellow-black-yellow":["#facc15","#111827","#facc15"],"black-red-black":["#111827","#dc2626","#111827"],"red-white-vertical":["#dc2626","#fff"],"solid-yellow":["#facc15"],"blue-yellow-vertical":["#2563eb","#facc15"]
};
const Top = ({kind}:{kind:Topmark}) => {
 const cone=(y:number,down=false)=><path data-cone-direction={down ? "down" : "up"} d={down?`M40 ${y} L54 ${y} L47 ${y+18}Z`:`M40 ${y+18} L54 ${y+18} L47 ${y}Z`} />;
 if(kind==="cylinder") return <rect x="39" y="12" width="16" height="24"/>;
 if(kind==="cone-up") return cone(14);
 if(kind==="cones-up") return <>{cone(3)}{cone(24)}</>;
 if(kind==="cones-down") return <>{cone(3,true)}{cone(24,true)}</>;
 // East: bases meet and points face away. West: points meet.
 if(kind==="cones-base") return <>{cone(3)}{cone(24,true)}</>;
 if(kind==="cones-point") return <>{cone(3,true)}{cone(24)}</>;
 if(kind==="two-spheres") return <><circle cx="47" cy="13" r="8"/><circle cx="47" cy="32" r="8"/></>;
 if(kind==="sphere") return <circle cx="47" cy="24" r="10"/>;
 if(kind==="saltire") return <path d="M37 13 L57 35 M57 13 L37 35" fill="none" strokeWidth="6"/>;
 return <path d="M47 10 V38 M35 24 H59" fill="none" strokeWidth="6"/>;
};
const topmarkColour = (buoy:IalaBuoy) => buoy.category === "cardinal" || buoy.category === "isolated-danger" ? "#111827" : buoy.category === "lateral" ? (buoy.id.includes("starboard") ? "#15803d" : "#dc2626") : buoy.category === "safe-water" ? "#dc2626" : "#facc15";
const bodyCue = (buoy:IalaBuoy) => buoy.id.includes("lateral-port") ? "can" : buoy.id.includes("lateral-starboard") ? "conical" : buoy.id === "safe-water" ? "spherical" : "pillar";
const bodyPath = (cue:string) => cue === "can" ? "M22 58 H72 V145 Q47 165 22 145Z" : cue === "conical" ? "M47 58 L78 145 Q47 165 16 145Z" : cue === "spherical" ? "M47 62 C76 62 82 92 76 124 C70 156 24 156 18 124 C12 92 18 62 47 62Z" : "M25 58 H69 L72 148 Q47 160 22 148Z";

export const BuoyMarkDiagram=({buoy}:{buoy:IalaBuoy})=>{const bands=colours[buoy.pattern];const vertical=buoy.pattern.endsWith("vertical");const cue=bodyCue(buoy);const shape=bodyPath(cue);const topColour=topmarkColour(buoy);return <figure className="min-w-0 rounded-lg border bg-sky-50 p-3 forced-colors:border-[CanvasText] forced-colors:bg-[Canvas]" aria-labelledby={`visual-${buoy.id}`}><svg data-testid={`buoy-visual-${buoy.id}`} viewBox="0 0 220 180" role="img" aria-labelledby={`title-${buoy.id} desc-${buoy.id}`} className="mx-auto block h-auto w-full max-w-56 forced-colors:text-[CanvasText]"><title id={`title-${buoy.id}`}>{buoy.name} daymark</title><desc id={`desc-${buoy.id}`}>{buoy.visualDescriptor} Body: {buoy.bodyShape}. Topmark: {buoy.topMarkShape}.</desc><g data-testid={`topmark-${buoy.id}`} data-topmark-arrangement={buoy.topmark} data-topmark-colour={topColour} fill={topColour} stroke={topColour} className="forced-colors:fill-[CanvasText] forced-colors:stroke-[CanvasText]"><Top kind={buoy.topmark}/></g><line x1="47" y1="40" x2="47" y2="58" stroke="currentColor" strokeWidth="4"/><defs><clipPath id={`body-${buoy.id}`}><path d={shape}/></clipPath></defs><g data-testid={`body-${buoy.id}`} data-body-silhouette={cue} clipPath={`url(#body-${buoy.id})`}>{bands.map((colour,i)=>vertical?<rect key={colour+i} x={12+i*70/bands.length} y="58" width={70/bands.length} height="105" fill={colour}/>:<rect key={colour+i} x="12" y={58+i*105/bands.length} width="70" height={105/bands.length} fill={colour}/>)}</g><path data-testid={`body-outline-${buoy.id}`} data-body-silhouette={cue} d={shape} fill="none" stroke="#111827" strokeWidth="3" className="forced-colors:stroke-[CanvasText]"/><g fill="#111827" className="forced-colors:fill-[CanvasText]" fontSize="12"><text x="92" y="78">BODY</text><text x="92" y="96">{buoy.bodyShape}</text><text x="92" y="124">NIGHT</text><text x="92" y="142">{buoy.lightCharacteristic}</text></g></svg><figcaption id={`visual-${buoy.id}`} className="text-xs text-muted-foreground forced-colors:text-[CanvasText]"><strong>Structured alternative:</strong> {buoy.visualDescriptor}</figcaption></figure>};
