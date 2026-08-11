import { describe, expect, it } from "vitest";
import { PASSAGE_PLAN_CACHE_VERSION, insertWaypoint, normalizeWaypointOrder, parsePassagePlanCache, passagePlanCacheKey, removeWaypoint, reorderWaypoint, validatePassagePlan, type PassagePlan } from "./passagePlan";
const valid: PassagePlan = { version: PASSAGE_PLAN_CACHE_VERSION, name:"Test", departure:"2026-07-30T09:00", speed:5, fuelRate:2, reservePercent:20, coordinateFormat:"degrees-decimal-minutes",datum:"WGS84",coordinatePrecision:"0.1 minute",safety:{departureBerth:"A berth",destinationBerth:"B berth",limits:"limits",abortDecision:"abort",alternatives:"alternatives",manualVerification:"manual chart check"},provenance:{weather:"forecast",tide:"tide table",chart:"chart edition",publications:"almanac",preparedAt:"2026-07-30T08:00",revisedAt:"2026-07-30T08:00"},points:[
 {id:"1",name:"A",latitude:"50°00.0'N",longitude:"001°00.0'W",inboundLeg:null},
 {id:"2",name:"B",latitude:"50°03.0'N",longitude:"001°00.0'W",inboundLeg:{course:20,distanceNm:3,notes:"",tidalGate:"",weatherWindow:""}},
] };
describe("passage plan validation and cache",()=>{
 it("accepts a complete plan",()=>expect(validatePassagePlan(valid)).toEqual([]));
 it("reports every invalid field",()=>expect(validatePassagePlan({...valid,name:" ",departure:"bad",speed:Infinity,fuelRate:0,reservePercent:201,points:[valid.points[0],{...valid.points[1],name:"",inboundLeg:{...valid.points[1].inboundLeg!,course:360,distanceNm:0}}]})).toHaveLength(9));
 it("requires structured PREPARE safety decisions and current source provenance",()=>{const errors=validatePassagePlan({...valid,safety:{...valid.safety,limits:"",abortDecision:""},provenance:{...valid.provenance,chart:"",revisedAt:"bad"}});expect(errors).toEqual(expect.arrayContaining([expect.stringContaining("operating limits"),expect.stringContaining("abort decision"),expect.stringContaining("current chart"),expect.stringContaining("revised time")]))});
 it("requires explicit endpoints and exactly one inbound leg per arrival",()=>{
   expect(validatePassagePlan({...valid,points:[valid.points[0]]})).toContain("Add a departure and at least one destination waypoint.");
   expect(validatePassagePlan({...valid,points:[{...valid.points[0],inboundLeg:valid.points[1].inboundLeg},valid.points[1]]})).toContain("Departure must not have an inbound leg.");
   expect(validatePassagePlan({...valid,points:[valid.points[0],{...valid.points[1],inboundLeg:null}]})).toContain("Leg 1: inbound leg is required.");
 });
 it("normalises add, remove and reorder operations without creating a leg beyond the destination",()=>{
   const added=normalizeWaypointOrder([...valid.points,{id:"3",name:"C",latitude:"",longitude:"",inboundLeg:null}]);
   expect(added).toHaveLength(3);expect(added[0].inboundLeg).toBeNull();expect(added.slice(1).every(point=>point.inboundLeg!==null)).toBe(true);
   const reordered=reorderWaypoint(added,2,1);expect(reordered.map(point=>point.name)).toEqual(["A","C","B"]);expect(reordered[0].inboundLeg).toBeNull();
   const removedDeparture=removeWaypoint(reordered,"1");expect(removedDeparture.map(point=>point.name)).toEqual(["C","B"]);expect(removedDeparture[0].inboundLeg).toBeNull();expect(removedDeparture[1].inboundLeg).not.toBeNull();
 });
 it("clears stale leg data when removal changes a predecessor but preserves unaffected later legs",()=>{
   const route: PassagePlan["points"]=[
     valid.points[0],
     {...valid.points[1],inboundLeg:{course:20,distanceNm:3,notes:"A-B",tidalGate:"AB gate",weatherWindow:"AB weather"}},
     {id:"3",name:"C",latitude:"",longitude:"",inboundLeg:{course:30,distanceNm:4,notes:"B-C",tidalGate:"BC gate",weatherWindow:"BC weather"}},
     {id:"4",name:"D",latitude:"",longitude:"",inboundLeg:{course:40,distanceNm:5,notes:"C-D",tidalGate:"CD gate",weatherWindow:"CD weather"}},
   ];
   const result=removeWaypoint(route,"2");
   expect(result[1].name).toBe("C");expect(result[1].inboundLeg).toEqual({course:0,distanceNm:0,notes:"",tidalGate:"",weatherWindow:""});
   expect(result[2].inboundLeg).toEqual(route[3].inboundLeg);
 });
 it("clears every leg whose predecessor changes during reorder, including a moved departure",()=>{
   const route=normalizeWaypointOrder([...valid.points,{id:"3",name:"C",latitude:"",longitude:"",inboundLeg:{course:30,distanceNm:4,notes:"B-C",tidalGate:"gate",weatherWindow:"weather"}}]);
   const result=reorderWaypoint(route,0,1);
   expect(result.map(point=>point.name)).toEqual(["B","A","C"]);
   expect(result[0].inboundLeg).toBeNull();
   expect(result[1].inboundLeg).toEqual({course:0,distanceNm:0,notes:"",tidalGate:"",weatherWindow:""});
   expect(result[2].inboundLeg).toEqual({course:0,distanceNm:0,notes:"",tidalGate:"",weatherWindow:""});
 });
 it("inserts safely at first, middle and last positions and rejects duplicate stable ids",()=>{
   const make=(id:string)=>({id,name:id,latitude:"",longitude:"",inboundLeg:{course:12,distanceNm:2,notes:"new",tidalGate:"gate",weatherWindow:"weather"}});
   const first=insertWaypoint(valid.points,make("first"),0);expect(first.map(point=>point.id)).toEqual(["first","1","2"]);expect(first[0].inboundLeg).toBeNull();expect(first[1].inboundLeg?.distanceNm).toBe(0);
   const middle=insertWaypoint(valid.points,make("middle"),1);expect(middle.map(point=>point.id)).toEqual(["1","middle","2"]);expect(middle[2].inboundLeg?.distanceNm).toBe(0);
   const last=insertWaypoint(valid.points,make("last"),99);expect(last.map(point=>point.id)).toEqual(["1","2","last"]);expect(last[1].inboundLeg).toEqual(valid.points[1].inboundLeg);
   expect(()=>insertWaypoint(valid.points,make("2"),1)).toThrow("Duplicate waypoint id");
 });
 it("rejects cached plans with duplicate IDs",()=>expect(parsePassagePlanCache(JSON.stringify({...valid,points:[valid.points[0],{...valid.points[1],id:"1"}]}))).toBeNull());
 it("keeps IDs unique through a rapid sequence of insert, move and remove operations",()=>{
   const newPoint={id:"rapid",name:"Rapid",latitude:"",longitude:"",inboundLeg:{course:0,distanceNm:0,notes:"",tidalGate:"",weatherWindow:""}};
   const inserted=insertWaypoint(valid.points,newPoint,1);
   const moved=reorderWaypoint(inserted,1,2);
   const removed=removeWaypoint(moved,"1");
   expect(removed.map(point=>point.id)).toEqual(["2","rapid"]);expect(new Set(removed.map(point=>point.id)).size).toBe(removed.length);
 });
 it("round trips versioned valid cache",()=>expect(parsePassagePlanCache(JSON.stringify(valid))).toEqual(valid));
 it.each(["{", "null", "[]", '{"version":2}', '{"version":1,"name":"x","departure":"2026-01-01T00:00","speed":5,"points":[]}'])("ignores malformed, incomplete, or v1 cache %s",(raw)=>expect(parsePassagePlanCache(raw)).toBeNull());
 it("isolates authenticated and anonymous users",()=>{expect(passagePlanCacheKey("user-a","session")).not.toBe(passagePlanCacheKey("user-b","session"));expect(passagePlanCacheKey(null,"session-a")).not.toBe(passagePlanCacheKey(null,"session-b"))});
});
