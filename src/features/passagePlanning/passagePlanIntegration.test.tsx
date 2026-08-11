import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"; import { beforeEach, describe, expect, it, vi } from "vitest"; import { PassagePlanBuilder } from "@/components/passagePlanning/PassagePlanBuilder";
const saveProgress=vi.fn().mockResolvedValue(true),loadProgress=vi.fn().mockResolvedValue(null); let currentUser={id:"user-a"}; vi.mock("@/hooks/useProgress",()=>({useProgress:()=>({saveProgress,loadProgress})})); vi.mock("@/contexts/AuthHooks",()=>({useAuth:()=>({user:currentUser})}));
describe("passage plan flow",()=>{beforeEach(()=>{localStorage.clear();sessionStorage.clear();saveProgress.mockReset().mockResolvedValue(true);loadProgress.mockReset().mockResolvedValue(null);currentUser={id:"user-a"}});
it("builds and saves a valid user-scoped plan",async()=>{render(<PassagePlanBuilder/>);fireEvent.change(screen.getByLabelText("Plan name"),{target:{value:"Test passage"}});fireEvent.click(screen.getByRole("button",{name:"Save & complete plan"}));expect(localStorage.getItem("day-skipper-passage-plan:user-a")).toContain("Test passage");expect(saveProgress).toHaveBeenCalledWith("passage-planning-builder",true,100,15,expect.any(Object))});
it("blocks invalid completion and gives actionable errors",()=>{render(<PassagePlanBuilder/>);fireEvent.change(screen.getByLabelText("SOG (knots)"),{target:{value:"0"}});fireEvent.click(screen.getByRole("button",{name:"Save & complete plan"}));expect(screen.getByRole("alert").textContent).toContain("SOG must be greater than 0");expect(saveProgress).not.toHaveBeenCalled();expect(localStorage.length).toBe(0)});
it("does not hydrate another user's cached plan",()=>{localStorage.setItem("day-skipper-passage-plan:user-b",JSON.stringify({version:2,name:"Private B",departure:"2026-07-30T09:00",speed:5,points:[]}));render(<PassagePlanBuilder/>);expect((screen.getByLabelText("Plan name") as HTMLInputElement).value).not.toBe("Private B")});
it("blanks immediately on account switches and ignores stale hydration",async()=>{
 const deferred=<T,>()=>{let resolve!:(value:T)=>void;const promise=new Promise<T>(done=>{resolve=done});return{promise,resolve}};
 const aFirst=deferred<unknown>(),bLoad=deferred<unknown>(),aSecond=deferred<unknown>();
 loadProgress.mockImplementationOnce(()=>aFirst.promise).mockImplementationOnce(()=>bLoad.promise).mockImplementationOnce(()=>aSecond.promise);
 const persisted=(name:string)=>({answers_history:{plan:{version:3,name,departure:"2026-07-30T09:00",speed:5,coordinateFormat:"degrees-decimal-minutes",datum:"WGS84",coordinatePrecision:"0.1 minute",safety:{departureBerth:"start",destinationBerth:"finish",limits:"limits",abortDecision:"abort",alternatives:"divert",manualVerification:"manual"},provenance:{weather:"forecast",tide:"tables",chart:"chart",publications:"almanac",preparedAt:"2026-07-30T08:00",revisedAt:"2026-07-30T08:00"},points:[{id:"1",name:"Start",latitude:"50°00.0'N",longitude:"001°00.0'W",inboundLeg:null},{id:"2",name:"Finish",latitude:"50°03.0'N",longitude:"001°00.0'W",inboundLeg:{course:20,distanceNm:3,notes:"",tidalGate:"",weatherWindow:""}}]}}});
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
 render(<PassagePlanBuilder/>);await waitFor(()=>expect(loadProgress).toHaveBeenCalled());fireEvent.change(screen.getByLabelText("Plan name"),{target:{value:"Retry plan"}});fireEvent.click(screen.getByRole("button",{name:"Save & complete plan"}));
 await waitFor(()=>expect(screen.getByRole("status").textContent).toMatch(/saved locally.*(not persisted|failed)/));
 expect(screen.getByRole("button",{name:"Save & complete plan"})).toBeTruthy();expect(localStorage.getItem("day-skipper-passage-plan:user-a")).toContain("Retry plan");
});
it("marks a successful save clean and prevents duplicate clicks while pending",async()=>{
 let resolve!:(value:boolean)=>void;saveProgress.mockImplementationOnce(()=>new Promise<boolean>(done=>{resolve=done}));render(<PassagePlanBuilder/>);await waitFor(()=>expect(loadProgress).toHaveBeenCalled());
 fireEvent.click(screen.getByRole("button",{name:"Save & complete plan"}));expect((screen.getByRole("button",{name:"Saving plan…"}) as HTMLButtonElement).disabled).toBe(true);fireEvent.click(screen.getByRole("button",{name:"Saving plan…"}));expect(saveProgress).toHaveBeenCalledTimes(1);
 resolve(true);await waitFor(()=>expect(screen.getByRole("status").textContent).toContain("completion persisted"));
});
it("keeps edits made during a successful save dirty and resets to the submitted snapshot",async()=>{
 let resolve!:(value:boolean)=>void;saveProgress.mockImplementationOnce(()=>new Promise<boolean>(done=>{resolve=done}));vi.stubGlobal("confirm",vi.fn().mockReturnValue(true));render(<PassagePlanBuilder/>);await waitFor(()=>expect(loadProgress).toHaveBeenCalled());
 fireEvent.change(screen.getByLabelText("Plan name"),{target:{value:"Submitted snapshot"}});fireEvent.click(screen.getByRole("button",{name:"Save & complete plan"}));
 fireEvent.change(screen.getByLabelText("Plan name"),{target:{value:"Newer unsaved edit"}});expect((screen.getByLabelText("Plan name") as HTMLInputElement).value).toBe("Newer unsaved edit");
 resolve(true);await waitFor(()=>expect(screen.getByRole("status").textContent).toContain("newer route changes remain unsaved"));
 fireEvent.click(screen.getByRole("button",{name:"Reset unsaved changes"}));expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("last saved plan"));
 await waitFor(()=>expect((screen.getByLabelText("Plan name") as HTMLInputElement).value).toBe("Submitted snapshot"));vi.unstubAllGlobals();
});
it("links malformed coordinates to an error and focuses the first invalid field without clearing data",async()=>{
 render(<PassagePlanBuilder/>);await waitFor(()=>expect(loadProgress).toHaveBeenCalled());const latitude=screen.getAllByLabelText("WGS84 latitude (DD°MM.mmm'N/S)")[0] as HTMLInputElement;fireEvent.change(latitude,{target:{value:"91°00.0'N"}});fireEvent.click(screen.getByRole("button",{name:"Save & complete plan"}));
 await waitFor(()=>expect(document.activeElement).toBe(latitude));expect(latitude.value).toBe("91°00.0'N");expect(latitude.getAttribute("aria-invalid")).toBe("true");expect(screen.getByRole("alert").textContent).toContain("valid WGS84 degrees and decimal minutes");
});
});
