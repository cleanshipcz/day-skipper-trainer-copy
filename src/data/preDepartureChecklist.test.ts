import { describe, expect, it } from "vitest";
import { checklistPhases, checklistSupportingRoutes, preDepartureChecklist } from "./preDepartureChecklist";

describe("pre-departure safety gate catalogue",()=>{
  it("has six explicit phases in operational order and valid backward dependencies",()=>{
    expect(checklistPhases).toEqual(["Planning and current information","Crew and vessel readiness","Pre-start checks","Safe start","Immediate running checks","Final go / no-go"]);
    const ids=preDepartureChecklist.map(item=>item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(preDepartureChecklist.length).toBeGreaterThan(20);
    for(const item of preDepartureChecklist)for(const dependency of item.dependsOn??[])expect(ids.indexOf(dependency),`${item.id} dependency ${dependency}`).toBeLessThan(ids.indexOf(item.id));
    expect(preDepartureChecklist.map(item=>item.phase)).toEqual([...preDepartureChecklist].sort((a,b)=>checklistPhases.indexOf(a.phase)-checklistPhases.indexOf(b.phase)).map(item=>item.phase));
  });

  it("covers planning, vessel, crew, emergency and final-decision evidence without collapsing engine phases",()=>{
    const content=preDepartureChecklist.map(item=>`${item.label} ${item.why}`).join(" ");
    for(const phrase of ["charts/publications","Notices to Mariners","under-keel clearance","forecast","crew number","incapacitation","hull/deck","seacocks","bilge","emergency steering","rig","anchors","electrical","LPG","navigation lights","sound signals","fire","MOB","shore contact","stowage","hatches","final go, delay, divert or cancel"])expect(content).toContain(phrase);
    expect(preDepartureChecklist.find(item=>item.id==="cold-fluids")?.label).toMatch(/stopped, cool and isolated/);
    expect(preDepartureChecklist.find(item=>item.id==="cooling-exhaust")?.label).toMatch(/raw-water.*wet-exhaust\/cooling discharge/);
    expect(preDepartureChecklist.find(item=>item.id==="cold-fluids")?.why).toMatch(/hot or pressurised cap/);
  });

  it("places lawful radio boundaries and applicability authority on conditional equipment",()=>{
    const radio=preDepartureChecklist.find(item=>item.id==="vhf-dsc")!;
    expect(`${radio.label} ${radio.why}`).toMatch(/lawful VHF\/DSC.*never send a DSC distress alert or false distress/is);
    expect(radio.conditional?.authority).toMatch(/licence.*qualification.*manufacturer/is);
    const conditional=preDepartureChecklist.filter(item=>item.conditional);
    expect(conditional.length).toBeGreaterThanOrEqual(5);
    expect(conditional.every(item=>Boolean(item.conditional?.when&&item.conditional.authority))).toBe(true);
  });

  it("cross-references dedicated tools for detailed work",()=>{
    expect(checklistSupportingRoutes.map(item=>item.route)).toEqual(expect.arrayContaining(["/passage-planning/builder","/navigation/tides","/weather/forecasts","/engine","/rig","/anchorwork","/safety","/victualling"]));
  });
});
