import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"; import { beforeEach, describe, expect, it, vi } from "vitest"; import { PassagePlanBuilder } from "@/components/passagePlanning/PassagePlanBuilder";
const saveProgress=vi.fn().mockResolvedValue(true),loadProgress=vi.fn().mockResolvedValue(null); let currentUser={id:"user-a"}; vi.mock("@/hooks/useProgress",()=>({useProgress:()=>({saveProgress,loadProgress})})); vi.mock("@/contexts/AuthHooks",()=>({useAuth:()=>({user:currentUser})}));
const completeEvidence=()=>{const now=new Date(Date.now()-60_000);const local=new Date(now.getTime()-now.getTimezoneOffset()*60_000).toISOString().slice(0,16);[["Current weather source, edition/issue and validity","Met Office issue: 1000 validity: 24 hours"],["Current tide source, edition/issue and validity","Admiralty tide table edition: 2026"],["Current chart source, edition/issue and validity","Chart No. 3418 edition: 2026 correction status checked"],["Current publications source, edition/issue and validity","Almanac edition: 2026"]].forEach(([label,value])=>fireEvent.change(screen.getByLabelText(label),{target:{value}}));fireEvent.change(screen.getByLabelText("Prepared at"),{target:{value:local}});fireEvent.change(screen.getByLabelText("Revised at"),{target:{value:local}});fireEvent.click(screen.getByLabelText(/I independently checked this current route/));fireEvent.click(screen.getByLabelText(/Source freshness policy/))};
describe("passage plan flow",()=>{beforeEach(()=>{localStorage.clear();sessionStorage.clear();saveProgress.mockReset().mockResolvedValue(true);loadProgress.mockReset().mockResolvedValue(null);currentUser={id:"user-a"}});
it("builds and saves a valid user-scoped plan",async()=>{render(<PassagePlanBuilder/>);await waitFor(()=>expect((screen.getByRole("button",{name:"Save & complete plan"}) as HTMLButtonElement).disabled).toBe(false));fireEvent.change(screen.getByLabelText("Plan name"),{target:{value:"Test passage"}});completeEvidence();fireEvent.click(screen.getByRole("button",{name:"Save & complete plan"}));await waitFor(()=>expect(localStorage.getItem("day-skipper-passage-plan:user-a")).toContain("Test passage"));expect(saveProgress).toHaveBeenCalledWith("passage-planning-builder",true,100,15,expect.any(Object))});
it("blocks invalid completion and gives actionable errors",async()=>{render(<PassagePlanBuilder/>);await waitFor(()=>expect((screen.getByRole("button",{name:"Save & complete plan"}) as HTMLButtonElement).disabled).toBe(false));fireEvent.change(screen.getByLabelText("SOG (knots)"),{target:{value:"0"}});fireEvent.click(screen.getByRole("button",{name:"Save & complete plan"}));expect(screen.getByRole("alert").textContent).toContain("SOG must be greater than 0");expect(saveProgress).not.toHaveBeenCalled();expect(localStorage.length).toBe(0)});
it("does not hydrate another user's cached plan",()=>{localStorage.setItem("day-skipper-passage-plan:user-b",JSON.stringify({version:2,name:"Private B",departure:"2026-07-30T09:00",speed:5,points:[]}));render(<PassagePlanBuilder/>);expect((screen.getByLabelText("Plan name") as HTMLInputElement).value).not.toBe("Private B")});
it("reports a corrupt authenticated local plan when no remote plan exists",async()=>{localStorage.setItem("day-skipper-passage-plan:user-a","{");render(<PassagePlanBuilder/>);await waitFor(()=>expect(loadProgress).toHaveBeenCalled());expect((await screen.findByRole("alert")).textContent).toMatch(/saved passage plan.*No local values were used.*No remote plan was available/i);expect((screen.getByLabelText("Plan name") as HTMLInputElement).value).toBe("Solent practice passage")});
it("reports local corruption together with recoverable remote semantic errors",async()=>{const recent=new Date(Date.now()-60_000).toISOString(),future=new Date(Date.now()+3_600_000).toISOString();localStorage.setItem("day-skipper-passage-plan:user-a","{");loadProgress.mockResolvedValueOnce({answers_history:{plan:{version:3,name:"",departure:future,speed:5,coordinateFormat:"degrees-decimal-minutes",datum:"WGS84",coordinatePrecision:"0.1 minute",safety:{departureBerth:"start",destinationBerth:"finish",limits:"limits",abortDecision:"abort",alternatives:"divert",manualVerification:""},provenance:{weather:"Met Office issue: 1000 validity: 24 hours",tide:"Admiralty tide table edition: 2026",chart:"Chart No. 3418 edition: 2026 correction status checked",publications:"Almanac edition: 2026",preparedAt:recent,revisedAt:recent},points:[{id:"1",name:"Start",latitude:"50°00.0'N",longitude:"001°00.0'W",inboundLeg:null},{id:"2",name:"Finish",latitude:"50°03.0'N",longitude:"001°00.0'W",inboundLeg:{course:20,distanceNm:3,notes:"",tidalGate:"",weatherWindow:""}}]}}});render(<PassagePlanBuilder/>);const alert=await screen.findByRole("alert");await waitFor(()=>expect(alert.textContent).toContain("remote plan was recovered but needs correction"));expect(alert.textContent).toContain("Plan name is required");expect(alert.textContent).toContain("No local values were used")});
it("blanks immediately on account switches and ignores stale hydration",async()=>{
 const deferred=<T,>()=>{let resolve!:(value:T)=>void;const promise=new Promise<T>(done=>{resolve=done});return{promise,resolve}};
 const aFirst=deferred<unknown>(),bLoad=deferred<unknown>(),aSecond=deferred<unknown>();
 loadProgress.mockImplementationOnce(()=>aFirst.promise).mockImplementationOnce(()=>bLoad.promise).mockImplementationOnce(()=>aSecond.promise);
 const persisted=(name:string)=>{const recent=new Date(Date.now()-60_000).toISOString(),future=new Date(Date.now()+24*3_600_000).toISOString();return{answers_history:{plan:{version:3,name,departure:future,speed:5,coordinateFormat:"degrees-decimal-minutes",datum:"WGS84",coordinatePrecision:"0.1 minute",safety:{departureBerth:"start",destinationBerth:"finish",limits:"limits",abortDecision:"abort",alternatives:"divert",manualVerification:"manual"},provenance:{weather:"Met Office issue: 1000 validity: 24 hours",tide:"Admiralty tide table edition: 2026",chart:"Chart No. 3418 edition: 2026 correction status checked",publications:"Almanac edition: 2026",preparedAt:recent,revisedAt:recent},points:[{id:"1",name:"Start",latitude:"50°00.0'N",longitude:"001°00.0'W",inboundLeg:null},{id:"2",name:"Finish",latitude:"50°03.0'N",longitude:"001°00.0'W",inboundLeg:{course:20,distanceNm:3,notes:"",tidalGate:"",weatherWindow:""}}]}}}};
 const view=render(<PassagePlanBuilder/>);
 await act(async()=>aFirst.resolve(persisted("Private A")));
 await waitFor(()=>expect((screen.getByLabelText("Plan name") as HTMLInputElement).value).toBe("Private A"));
 currentUser={id:"user-b"};view.rerender(<PassagePlanBuilder/>);
 expect((screen.getByLabelText("Plan name") as HTMLInputElement).value).toBe("Solent practice passage");
 currentUser={id:"user-a"};view.rerender(<PassagePlanBuilder/>);
 expect((screen.getByLabelText("Plan name") as HTMLInputElement).value).toBe("Solent practice passage");
 await act(async()=>bLoad.resolve(persisted("Stale private B")));
 expect((screen.getByLabelText("Plan name") as HTMLInputElement).value).not.toBe("Stale private B");
 await act(async()=>aSecond.resolve(persisted("Fresh A")));
 await waitFor(()=>expect((screen.getByLabelText("Plan name") as HTMLInputElement).value).toBe("Fresh A"));
});
it("confirms removal, announces its impact, focuses the survivor and supports undo",async()=>{
 const confirm=vi.fn().mockReturnValue(true);vi.stubGlobal("confirm",confirm);render(<PassagePlanBuilder/>);await waitFor(()=>expect(loadProgress).toHaveBeenCalled());
 fireEvent.click(screen.getByRole("button",{name:"Remove Bembridge Ledge"}));
 expect(confirm).toHaveBeenCalledWith(expect.stringContaining("inbound leg to Bembridge Harbour will be cleared"));
 await waitFor(()=>expect(document.activeElement).toBe(screen.getByLabelText("Destination waypoint")));
 expect(screen.getByRole("status").textContent).toContain("Removed Bembridge Ledge from position 2");
 fireEvent.click(screen.getByRole("button",{name:"Undo last removal"}));
 await waitFor(()=>expect((document.activeElement as HTMLInputElement).value).toBe("Bembridge Ledge"));
 expect(screen.getByRole("status").textContent).toContain("Restored Bembridge Ledge");vi.unstubAllGlobals();
});
it("inserts and moves with deterministic controls, focus and screen-reader position status",async()=>{
 render(<PassagePlanBuilder/>);await waitFor(()=>expect(loadProgress).toHaveBeenCalled());fireEvent.click(screen.getByRole("button",{name:"Insert waypoint after Portsmouth entrance"}));
 await waitFor(()=>expect(document.activeElement).toBe(screen.getAllByLabelText("Arrival waypoint")[0]));
 fireEvent.change(document.activeElement!,{target:{value:"New mark"}});
 fireEvent.click(screen.getByRole("button",{name:"Move New mark down"}));
 await waitFor(()=>expect((document.activeElement as HTMLInputElement).value).toBe("New mark"));
 expect(screen.getByRole("status").textContent).toContain("position 3");
});
it("invalidates removal undo after a newer edit so that edit cannot be discarded",async()=>{
 vi.stubGlobal("confirm",vi.fn().mockReturnValue(true));render(<PassagePlanBuilder/>);await waitFor(()=>expect(loadProgress).toHaveBeenCalled());
 fireEvent.click(screen.getByRole("button",{name:"Remove Bembridge Ledge"}));expect(screen.getByRole("button",{name:"Undo last removal"})).toBeTruthy();
 fireEvent.change(screen.getByLabelText("Plan name"),{target:{value:"Newer edit"}});
 expect(screen.queryByRole("button",{name:"Undo last removal"})).toBeNull();expect((screen.getByLabelText("Plan name") as HTMLInputElement).value).toBe("Newer edit");vi.unstubAllGlobals();
});
it("invalidates removal undo after a newer move",async()=>{
 vi.stubGlobal("confirm",vi.fn().mockReturnValue(true));render(<PassagePlanBuilder/>);await waitFor(()=>expect(loadProgress).toHaveBeenCalled());
 fireEvent.click(screen.getByRole("button",{name:"Remove Bembridge Ledge"}));fireEvent.click(screen.getByRole("button",{name:"Move Bembridge Harbour up"}));
 expect(screen.queryByRole("button",{name:"Undo last removal"})).toBeNull();expect(screen.getByRole("status").textContent).toContain("Moved Bembridge Harbour");vi.unstubAllGlobals();
});
it.each([["false",false],["rejection",new Error("offline")]])("keeps retry available when completion save returns %s",async(_name,outcome)=>{
 if(outcome instanceof Error)saveProgress.mockRejectedValueOnce(outcome);else saveProgress.mockResolvedValueOnce(outcome);
 render(<PassagePlanBuilder/>);await waitFor(()=>expect(loadProgress).toHaveBeenCalled());fireEvent.change(screen.getByLabelText("Plan name"),{target:{value:"Retry plan"}});completeEvidence();fireEvent.click(screen.getByRole("button",{name:"Save & complete plan"}));
 await waitFor(()=>expect(screen.getByRole("status").textContent).toMatch(/saved locally.*(not persisted|failed)/));
 expect(screen.getByRole("button",{name:"Save & complete plan"})).toBeTruthy();expect(localStorage.getItem("day-skipper-passage-plan:user-a")).toContain("Retry plan");
});
it("marks a successful save clean and prevents duplicate clicks while pending",async()=>{
 let resolve!:(value:boolean)=>void;saveProgress.mockImplementationOnce(()=>new Promise<boolean>(done=>{resolve=done}));render(<PassagePlanBuilder/>);await waitFor(()=>expect(loadProgress).toHaveBeenCalled());
 completeEvidence();fireEvent.click(screen.getByRole("button",{name:"Save & complete plan"}));expect((screen.getByRole("button",{name:"Saving plan…"}) as HTMLButtonElement).disabled).toBe(true);fireEvent.click(screen.getByRole("button",{name:"Saving plan…"}));expect(saveProgress).toHaveBeenCalledTimes(1);
 resolve(true);await waitFor(()=>expect(screen.getByRole("status").textContent).toContain("completion persisted"));
});
it("keeps edits made during a successful save dirty and resets to the submitted snapshot",async()=>{
 let resolve!:(value:boolean)=>void;saveProgress.mockImplementationOnce(()=>new Promise<boolean>(done=>{resolve=done}));vi.stubGlobal("confirm",vi.fn().mockReturnValue(true));render(<PassagePlanBuilder/>);await waitFor(()=>expect(loadProgress).toHaveBeenCalled());
 fireEvent.change(screen.getByLabelText("Plan name"),{target:{value:"Submitted snapshot"}});completeEvidence();fireEvent.click(screen.getByRole("button",{name:"Save & complete plan"}));
 fireEvent.change(screen.getByLabelText("Plan name"),{target:{value:"Newer unsaved edit"}});expect((screen.getByLabelText("Plan name") as HTMLInputElement).value).toBe("Newer unsaved edit");
 resolve(true);await waitFor(()=>expect(screen.getByRole("status").textContent).toContain("newer route changes remain unsaved"));
 fireEvent.click(screen.getByRole("button",{name:"Reset unsaved changes"}));expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("last saved plan"));
 await waitFor(()=>expect((screen.getByLabelText("Plan name") as HTMLInputElement).value).toBe("Submitted snapshot"));vi.unstubAllGlobals();
});
it("links malformed coordinates to an error and focuses the first invalid field without clearing data",async()=>{
 render(<PassagePlanBuilder/>);await waitFor(()=>expect(loadProgress).toHaveBeenCalled());const latitude=screen.getAllByLabelText("WGS84 latitude (DD°MM.mmm'N/S)")[0] as HTMLInputElement;fireEvent.change(latitude,{target:{value:"91°00.0'N"}});fireEvent.click(screen.getByRole("button",{name:"Save & complete plan"}));
 await waitFor(()=>expect(document.activeElement).toBe(latitude));expect(latitude.value).toBe("91°00.0'N");expect(latitude.getAttribute("aria-invalid")).toBe("true");expect(screen.getByRole("alert").textContent).toContain("valid WGS84 degrees and decimal minutes");
});
it("focuses longitude, not latitude, when only longitude is malformed",async()=>{
 render(<PassagePlanBuilder/>);await waitFor(()=>expect(loadProgress).toHaveBeenCalled());const latitude=screen.getAllByLabelText("WGS84 latitude (DD°MM.mmm'N/S)")[0] as HTMLInputElement,longitude=screen.getAllByLabelText("WGS84 longitude (DDD°MM.mmm'E/W)")[0] as HTMLInputElement;fireEvent.change(longitude,{target:{value:"181°00.0'W"}});fireEvent.click(screen.getByRole("button",{name:"Save & complete plan"}));await waitFor(()=>expect(document.activeElement).toBe(longitude));expect(latitude.getAttribute("aria-invalid")).toBeNull();expect(longitude.getAttribute("aria-invalid")).toBe("true");expect(longitude.value).toBe("181°00.0'W");
});
it("clears route and freshness acknowledgements at an account boundary",async()=>{
 const view=render(<PassagePlanBuilder/>);await waitFor(()=>expect(loadProgress).toHaveBeenCalled());completeEvidence();expect((screen.getByLabelText(/I independently checked this current route/) as HTMLInputElement).checked).toBe(true);expect((screen.getByLabelText(/Source freshness policy/) as HTMLInputElement).checked).toBe(true);
 currentUser={id:"user-b"};view.rerender(<PassagePlanBuilder/>);await waitFor(()=>expect(loadProgress).toHaveBeenCalledTimes(2));expect((screen.getByLabelText(/I independently checked this current route/) as HTMLInputElement).checked).toBe(false);expect((screen.getByLabelText(/Source freshness policy/) as HTMLInputElement).checked).toBe(false);
});
});
