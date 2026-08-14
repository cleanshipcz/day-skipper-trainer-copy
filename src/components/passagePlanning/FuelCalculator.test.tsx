import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FuelCalculator } from "./FuelCalculator";

const progressMock={ownerId:null as string|null,loadProgressDetailed:vi.fn(),saveProgressDetailed:vi.fn().mockResolvedValue("anonymous")};
vi.mock("@/hooks/useProgress", () => ({ useProgress: () => progressMock }));
const saveProgressDetailed=progressMock.saveProgressDetailed;

describe("FuelCalculator", () => {
  it("calculates deliberately, explains the equation, and invalidates stale results accessibly", async () => {
    const user = userEvent.setup();
    render(<FuelCalculator />);
    expect(screen.getByText(/Inputs changed/)).toBeTruthy();
    const calculate = screen.getByRole("button", { name: "Calculate / update result" });
    calculate.focus(); await user.keyboard("{Enter}");
    expect(screen.getByText(/Passage duration:/).textContent).toContain("18 nm ÷ 6 kn");
    expect(screen.getByText(/Engine fuel:/).textContent).toContain("3 h × 2 L/h = 6.0000 L");
    expect(screen.getByRole("button", { name: "Complete calculation" }).hasAttribute("disabled")).toBe(true);
    const distance = screen.getByLabelText("Route distance (nautical miles)");
    await user.clear(distance); await user.type(distance, "19");
    expect(screen.queryByText(/Engine fuel:/)).toBeNull();
    expect(screen.getByText(/Calculate to produce an updated result/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Complete calculation" }).hasAttribute("disabled")).toBe(true);
  });
  it("applies every documented sail preset field and prevents completion when usable fuel is insufficient", async () => {
    const user=userEvent.setup(); render(<FuelCalculator />);
    await user.click(screen.getByRole("button",{name:"Channel crossing — sail/auxiliary"}));
    expect((screen.getByLabelText("Route distance (nautical miles)") as HTMLInputElement).value).toBe("72");
    expect((screen.getByLabelText("Engine-running duration (hours)") as HTMLInputElement).value).toBe("4");
    expect((screen.getByLabelText("Passage-specific reserve (%)") as HTMLInputElement).value).toBe("30");
    expect((screen.getByLabelText(/Departure date/) as HTMLInputElement).value).toBe("");
    await user.click(screen.getByRole("button",{name:"Calculate / update result"}));
    expect(screen.getByText(/Passage duration:/).textContent).toContain("12 h 0 min");
    expect(screen.getByText(/Engine fuel:/).textContent).toContain("14.0000 L");
    const usable=screen.getByLabelText("Usable fuel aboard (litres)"); await user.clear(usable); await user.type(usable,"10");
    await user.click(screen.getByRole("button",{name:"Calculate / update result"}));
    expect(screen.getByText(/INSUFFICIENT/).textContent).toMatch(/INSUFFICIENT/);
    expect(screen.getByRole("button",{name:"Complete calculation"}).hasAttribute("disabled")).toBe(true);
  });
  it("requires vessel evidence, a passage-specific reserve basis and a positive reserve", async()=>{
    const user=userEvent.setup(); render(<FuelCalculator />);
    for(const label of ["Speed/fuel-rate evidence and expected conditions","Reserve basis: changes, alternatives and policy"]){const input=screen.getByLabelText(label);await user.clear(input);}
    const reserve=screen.getByLabelText("Passage-specific reserve (%)");await user.clear(reserve);await user.type(reserve,"0");await user.tab();
    expect(screen.getByRole("button",{name:"Calculate / update result"}).hasAttribute("disabled")).toBe(true);
    expect(screen.getAllByRole("alert").map(node=>node.textContent).join(" ")).toMatch(/finite number from 0.1 to 200.*vessel-specific.*why the reserve/i);
  });
  it("persists the selected resolved instant for a repeated local departure time",async()=>{
    const user=userEvent.setup(); render(<FuelCalculator timeZone="Europe/London" />);
    const departure=screen.getByLabelText(/Departure date and time/); fireEvent.change(departure,{target:{value:"2026-10-25T01:30"}});
    const occurrence=screen.getByLabelText("This time occurs twice; choose the intended offset");
    await user.selectOptions(occurrence,"2026-10-25T01:30:00.000Z");
    await user.click(screen.getByRole("button",{name:"Calculate / update result"}));
    await user.type(screen.getByLabelText(/Explain what the time/),"The ETA and fuel reserve cover this specific passage plan.");
    await user.click(screen.getByRole("button",{name:"Complete calculation"}));
    expect(saveProgressDetailed).toHaveBeenLastCalledWith(expect.any(String),true,100,0,expect.objectContaining({modelVersion:3,inputs:expect.objectContaining({departureTime:"2026-10-25T01:30:00.000Z"}),outputs:expect.any(Object),units:expect.any(Object)}));
  });
  it("survives blank, exponent overflow and excessive derived duration, then calculates after correction",async()=>{
    const user=userEvent.setup();render(<FuelCalculator />);const speed=screen.getByLabelText("Conservative passage SOG (knots)") as HTMLInputElement;
    await user.clear(speed);await user.tab();expect(speed.getAttribute("min")).toBe("0.1");expect(speed.getAttribute("max")).toBe("80");expect(speed.getAttribute("step")).toBe("0.1");expect(speed.getAttribute("aria-invalid")).toBe("true");
    fireEvent.change(speed,{target:{value:"1e999"}});expect(screen.getByRole("button",{name:"Calculate / update result"}).hasAttribute("disabled")).toBe(true);
    fireEvent.change(screen.getByLabelText("Route distance (nautical miles)"),{target:{value:"2000"}});fireEvent.change(speed,{target:{value:"0.1"}});expect(screen.queryByText(/Derived passage duration/)).toBeNull();fireEvent.blur(speed);expect(screen.getByText(/Derived passage duration/).textContent).toContain("1,000 hours");
    fireEvent.change(screen.getByLabelText("Route distance (nautical miles)"),{target:{value:"18"}});fireEvent.change(speed,{target:{value:"6"}});await user.click(screen.getByRole("button",{name:"Calculate / update result"}));expect(screen.getByText(/Passage duration:/)).toBeTruthy();
  });
  it("keeps native and structured step validity aligned",()=>{
    render(<FuelCalculator />);const distance=screen.getByLabelText("Route distance (nautical miles)") as HTMLInputElement;const calculate=screen.getByRole("button",{name:"Calculate / update result"});
    expect(distance.getAttribute("step")).toBe("0.1");fireEvent.change(distance,{target:{value:"18.05"}});expect(screen.queryByText(/increments of 0.1/)).toBeNull();fireEvent.blur(distance);expect(distance.getAttribute("aria-invalid")).toBe("true");expect(screen.getByText(/increments of 0.1/)).toBeTruthy();expect(calculate.hasAttribute("disabled")).toBe(true);
    fireEvent.change(distance,{target:{value:"18.1"}});expect(distance.getAttribute("aria-invalid")).toBe("false");expect(calculate.hasAttribute("disabled")).toBe(false);
  });
  it("describes fields, announces presets and results concisely, and exposes touch-sized wrapping controls",async()=>{
    const user=userEvent.setup();render(<FuelCalculator />);const distance=screen.getByLabelText("Route distance (nautical miles)");expect(distance.getAttribute("inputmode")).toBe("decimal");expect(distance.getAttribute("aria-describedby")).toContain("distanceNm-hint");expect(screen.getByText("Allowed 0.1 to 2000, in 0.1 increments.")).toBeTruthy();
    const sail=screen.getByRole("button",{name:"Channel crossing — sail/auxiliary"});expect(sail.className).toContain("min-h-11");await user.keyboard("{Tab}");sail.focus();await user.keyboard("{Enter}");expect(sail.getAttribute("aria-pressed")).toBe("true");expect(screen.getAllByRole("status").some(node=>/applied.*Changed:/.test(node.textContent??""))).toBe(true);await user.click(screen.getByRole("button",{name:"Calculate / update result"}));expect(screen.getAllByRole("status").some(node=>/Passage 12 h 0 min; practical fuel 26 litres; usable fuel sufficient/.test(node.textContent??""))).toBe(true);expect(screen.getByText("Calculated plan").closest("div[aria-live]")).toBeNull();
  });
  it("keeps derived errors silent during partial typing then announces once politely on blur",()=>{
    render(<FuelCalculator />);const distance=screen.getByLabelText("Route distance (nautical miles)");const speed=screen.getByLabelText("Conservative passage SOG (knots)");fireEvent.change(distance,{target:{value:"2000"}});fireEvent.change(speed,{target:{value:"0.1"}});expect(screen.queryByText(/Derived passage duration/)).toBeNull();fireEvent.blur(speed);const message=screen.getByText(/Derived passage duration/);const region=message.closest('[aria-live="polite"]');expect(region?.getAttribute("aria-atomic")).toBe("true");expect(region?.querySelectorAll("p")).toHaveLength(1);
  });
  it("resets a derived group when a sibling contributor changes",()=>{
    render(<FuelCalculator />);const distance=screen.getByLabelText("Route distance (nautical miles)");const speed=screen.getByLabelText("Conservative passage SOG (knots)");fireEvent.blur(distance);fireEvent.change(distance,{target:{value:"2000"}});fireEvent.blur(distance);expect(screen.queryByText(/Derived passage duration/)).toBeNull();fireEvent.change(speed,{target:{value:"0.1"}});expect(screen.queryByText(/Derived passage duration/)).toBeNull();fireEvent.blur(speed);expect(screen.getByText(/Derived passage duration/)).toBeTruthy();
  });
  it("locks edits during deferred hydration and recomputes rather than trusting saved outputs",async()=>{
    let resolveLoad:(value:unknown)=>void=()=>undefined;progressMock.ownerId="user-1";progressMock.loadProgressDetailed.mockReturnValueOnce(new Promise(resolve=>{resolveLoad=resolve}));render(<FuelCalculator />);const distance=screen.getByLabelText("Route distance (nautical miles)");expect(distance.closest("fieldset[disabled]")).toBeTruthy();const inputs={distanceNm:18,speedKnots:6,engineHours:3,fuelLitresPerHour:2,additionalFuelLitres:2,reservePercent:20,usableFuelLitres:20,evidence:"Measured vessel evidence",reserveBasis:"Route-specific reserve basis",departureTime:""};await act(async()=>resolveLoad({status:"remote",record:{completed:true,answers_history:{modelVersion:3,model:"small-craft-diesel-passage",inputs,outputs:{practicalFuelLitres:999},interpretation:"Time fuel reserve and ETA are understood."}}}));expect(distance.closest("fieldset[disabled]")).toBeNull();expect(screen.getByText(/practical carry/).textContent).toContain("10 L");progressMock.ownerId=null;
  });
  it("ignores malformed v3 hydration with missing text fields without crashing",async()=>{progressMock.ownerId="user-2";progressMock.loadProgressDetailed.mockResolvedValueOnce({status:"remote",record:{completed:true,answers_history:{modelVersion:3,model:"small-craft-diesel-passage",inputs:{distanceNm:18,speedKnots:6,engineHours:3,fuelLitresPerHour:2,additionalFuelLitres:2,reservePercent:20,usableFuelLitres:20,departureTime:""},interpretation:"Valid-looking interpretation"}}});render(<FuelCalculator />);await act(async()=>{});expect(screen.queryByText("Calculated plan")).toBeNull();expect(screen.getByText(/untouched defaults do not qualify/)).toBeTruthy();progressMock.ownerId=null;});
});
