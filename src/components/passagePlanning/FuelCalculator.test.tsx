import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FuelCalculator } from "./FuelCalculator";

vi.mock("@/hooks/useProgress", () => ({ useProgress: () => ({ saveProgress: vi.fn() }) }));

describe("FuelCalculator", () => {
  it("calculates deliberately, explains the equation, and invalidates stale results accessibly", async () => {
    const user = userEvent.setup();
    render(<FuelCalculator />);
    expect(screen.getByRole("status").textContent).toMatch(/Inputs changed/);
    const calculate = screen.getByRole("button", { name: "Calculate / update result" });
    calculate.focus(); await user.keyboard("{Enter}");
    expect(screen.getByText(/Passage duration:/).textContent).toContain("18 nm ÷ 6 kn");
    expect(screen.getByText(/Engine fuel:/).textContent).toContain("3 h × 2 L/h = 6.0000 L");
    expect(screen.getByRole("button", { name: "Complete calculation" }).hasAttribute("disabled")).toBe(false);
    const distance = screen.getByLabelText("Route distance (nautical miles)");
    await user.clear(distance); await user.type(distance, "19");
    expect(screen.queryByText(/Engine fuel:/)).toBeNull();
    expect(screen.getByRole("status").textContent).toMatch(/Calculate to produce an updated result/);
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
    expect(screen.getByRole("alert").textContent).toMatch(/INSUFFICIENT/);
    expect(screen.getByRole("button",{name:"Complete calculation"}).hasAttribute("disabled")).toBe(true);
  });
  it("requires vessel evidence, a passage-specific reserve basis and a positive reserve", async()=>{
    const user=userEvent.setup(); render(<FuelCalculator />);
    for(const label of ["Speed/fuel-rate evidence and expected conditions","Reserve basis: changes, alternatives and policy"]){const input=screen.getByLabelText(label);await user.clear(input);}
    const reserve=screen.getByLabelText("Passage-specific reserve (%)");await user.clear(reserve);await user.type(reserve,"0");
    expect(screen.getByRole("button",{name:"Calculate / update result"}).hasAttribute("disabled")).toBe(true);
    expect(screen.getAllByRole("alert").map(node=>node.textContent).join(" ")).toMatch(/positive reserve.*vessel-specific.*why the reserve/i);
  });
});
