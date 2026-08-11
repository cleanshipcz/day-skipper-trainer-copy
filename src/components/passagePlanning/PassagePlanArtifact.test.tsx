import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PASSAGE_PLAN_CACHE_VERSION, PASSAGE_PLAN_PERSISTENCE_VERSION, type PassagePlan, type PassagePlanRecord } from "@/features/passagePlanning/passagePlan";
import { PassagePlanArtifact } from "./PassagePlanArtifact";

const now = Date.now();
const plan: PassagePlan = {
  version:PASSAGE_PLAN_CACHE_VERSION,
  name:"Long coastal passage",
  departure:new Date(now + 86_400_000).toISOString(), speed:5,
  coordinateFormat:"degrees-decimal-minutes", datum:"WGS84", coordinatePrecision:"0.1 minute",
  safety:{departureBerth:"Departure berth",destinationBerth:"Destination berth",limits:"Visibility at least 3 nm",abortDecision:"Divert before the approach",alternatives:"Return or use the named alternative harbour",manualVerification:""},
  provenance:{weather:"Met Office issue: 1000 validity: 24 hours",tide:"Admiralty tide table edition: 2026",chart:"Chart No. 3418 edition: 2026 correction status checked",publications:"Almanac edition: 2026",preparedAt:new Date(now-120_000).toISOString(),revisedAt:new Date(now-60_000).toISOString()},
  points:Array.from({length:18},(_,index)=>({id:String(index),name:index===0?"Start":index===17?"Finish":`Waypoint with a deliberately long navigational name ${index}`,latitude:"50°00.0'N",longitude:"001°00.0'W",inboundLeg:index===0?null:{course:20+index,distanceNm:3,tidalGate:"Gate details ".repeat(4),weatherWindow:"Weather window ".repeat(4),notes:"Long notes that must wrap without clipping. ".repeat(8)}})),
};
const record: PassagePlanRecord = {persistenceVersion:PASSAGE_PLAN_PERSISTENCE_VERSION,ownerId:"user-a",revision:7,updatedAt:new Date(now-30_000).toISOString(),lineage:[],completedRevision:7,completionStatus:"confirmed",plan};

describe("PassagePlanArtifact",()=>{
  it("renders an accessible, approved multi-leg artifact with repeated-heading print hooks",()=>{
    render(<PassagePlanArtifact plan={plan} record={record} dirty={false} conflict={false}/>);
    const artifact=screen.getByTestId("passage-plan-artifact");
    expect(within(artifact).getByRole("heading",{name:"Long coastal passage"})).toBeTruthy();
    expect(within(artifact).getByText(/Status: Validated/).textContent).toContain("confirmed current revision");
    const table=within(artifact).getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(18);
    expect(within(table).getByRole("columnheader",{name:/Course/})).toBeTruthy();
    expect(artifact.textContent).toContain("true, magnetic, or compass");
    expect(artifact.textContent).toContain("Not recorded in this plan format");
    expect(artifact.className).toContain("is-approved");
  });

  it("watermarks invalid drafts and exposes all validation issues in navigation order",()=>{
    const invalid={...plan,name:"",points:plan.points.slice(0,1),provenance:{...plan.provenance,weather:""}};
    render(<PassagePlanArtifact plan={invalid} record={{...record,plan:invalid,completedRevision:null,completionStatus:"draft"}} dirty={false} conflict={false}/>);
    const artifact=screen.getByTestId("passage-plan-artifact");
    expect(within(artifact).getByText(/Status: INVALID/).textContent).toContain("INVALID");
    expect(within(artifact).getByRole("heading",{name:/Validation issues/})).toBeTruthy();
    expect(artifact.textContent).toContain("Plan name is required");
    expect(artifact.textContent).toContain("Add a departure and at least one destination waypoint");
    expect(artifact.className).toContain("is-watermarked");
  });

  it("marks a valid edited revision stale and handles omitted fuel fields without invented totals",()=>{
    const edited={...plan,name:"Edited plan"};
    render(<PassagePlanArtifact plan={edited} record={record} dirty={true} conflict={false}/>);
    expect(screen.getByText(/Status: STALE \/ EDITED DRAFT/).textContent).toContain("STALE / EDITED DRAFT");
    expect(screen.getByText(/Route total:/).textContent).not.toContain(" L ");
  });
});
