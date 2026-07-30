import { describe, expect, it } from "vitest";
import { PASSAGE_PLAN_CACHE_VERSION, parsePassagePlanCache, passagePlanCacheKey, validatePassagePlan, type PassagePlan } from "./passagePlan";
const valid: PassagePlan = { version: PASSAGE_PLAN_CACHE_VERSION, name:"Test", departure:"2026-07-30T09:00", speed:5, fuelRate:2, reservePercent:20, points:[{id:"1",name:"A",latitude:"",longitude:"",bearing:20,distanceNm:3,notes:"",tidalGate:"",weatherWindow:""}] };
describe("passage plan validation and cache",()=>{
 it("accepts a complete plan",()=>expect(validatePassagePlan(valid)).toEqual([]));
 it("reports every invalid field",()=>expect(validatePassagePlan({...valid,name:" ",departure:"bad",speed:Infinity,fuelRate:0,reservePercent:201,points:[{...valid.points[0],name:"",bearing:360,distanceNm:0}]})).toHaveLength(8));
 it("round trips versioned valid cache",()=>expect(parsePassagePlanCache(JSON.stringify(valid))).toEqual(valid));
 it.each(["{", "null", "[]", '{"version":2}', '{"version":1,"name":"x","departure":"x","speed":5,"points":[{}]}'])("ignores malformed or wrong-shape cache %s",(raw)=>expect(parsePassagePlanCache(raw)).toBeNull());
 it("isolates authenticated and anonymous users",()=>{expect(passagePlanCacheKey("user-a","session")).not.toBe(passagePlanCacheKey("user-b","session"));expect(passagePlanCacheKey(null,"session-a")).not.toBe(passagePlanCacheKey(null,"session-b"))});
});
