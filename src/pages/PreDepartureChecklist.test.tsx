import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { preDepartureChecklist } from "@/data/preDepartureChecklist";

const saveProgress = vi.fn();
vi.mock("@/hooks/useProgress", () => ({ useProgress: () => ({ saveProgress }) }));
import PreDepartureChecklist from "./PreDepartureChecklist";

const renderChecklist = () => render(<MemoryRouter initialEntries={["/passage-planning/checklist"]}><PreDepartureChecklist /></MemoryRouter>);
const itemGroup = (label: RegExp | string) => screen.getByRole("group", { name: label });

describe("PreDepartureChecklist", () => {
  it("separates training practice from certification and renders ordered phases", () => {
    renderChecklist();
    expect(screen.getByText(/training practice, not vessel certification/i)).toBeTruthy();
    expect(screen.getByText(/not a seaworthiness certificate/i)).toBeTruthy();
    expect(screen.getByText(/actual vessel, fitted equipment, voyage, operating area and present conditions/i)).toBeTruthy();
    const headings = screen.getAllByRole("heading").map((node) => node.textContent).filter((text) => /^\d\. /.test(text ?? ""));
    expect(headings).toEqual(["1. Planning and current information", "2. Crew and vessel readiness", "3. Pre-start checks", "4. Safe start", "5. Immediate running checks", "6. Final go / no-go"]);
    expect(screen.getByRole("link", { name: "Engine checks" }).getAttribute("href")).toBe("/engine");
  });

  it("models all review states but prevents blanket not-applicable", () => {
    renderChecklist();
    const required = itemGroup(/Review the current berth-to-berth plan/);
    expect(within(required).getByRole("button", { name: "Not checked" })).toBeTruthy();
    expect(within(required).getByRole("button", { name: "Satisfactory" })).toBeTruthy();
    expect(within(required).getByRole("button", { name: "Defect" })).toBeTruthy();
    expect(within(required).getByRole("button", { name: "Blocked" })).toBeTruthy();
    expect(within(required).getByRole("button", { name: "Unknown" })).toBeTruthy();
    expect(within(required).queryByRole("button", { name: "Not applicable" })).toBeNull();
    expect(within(itemGroup(/Test navigation, depth/)).getByRole("button", { name: "Not applicable" })).toBeTruthy();
  });

  it("requires an authority reason for N/A and supports correcting the record", () => {
    renderChecklist();
    const group = itemGroup(/Confirm official charts\/publications/);
    fireEvent.click(within(group).getByRole("button", { name: "Satisfactory" }));
    const conditional = itemGroup(/Test navigation, depth/);
    fireEvent.click(within(conditional).getByRole("button", { name: "Not applicable" }));
    expect(screen.getByText(/0 not applicable, 0 blocked, 29 incomplete/)).toBeTruthy();
    fireEvent.change(within(conditional).getByRole("textbox", { name: /not-applicable reason/ }), { target: { value: "No powered equipment fitted; COLREG and vessel requirements checked" } });
    expect(screen.getByText(/1 not applicable/)).toBeTruthy();
    fireEvent.click(within(conditional).getByRole("button", { name: "Satisfactory" }));
    expect(within(conditional).queryByRole("textbox", { name: /not-applicable reason/ })).toBeNull();
  });

  it.each(["Defect", "Blocked", "Unknown"])("turns %s into explicit stop and escalation guidance", (status) => {
    renderChecklist();
    fireEvent.click(within(itemGroup(/Review the current berth-to-berth plan/)).getByRole("button", { name: status }));
    expect(screen.getByRole("alert").textContent).toMatch(/No-go: readiness is blocked/);
    expect(screen.getByRole("alert").textContent).toMatch(/Stop.*Escalate.*correct.*reassess/i);
    expect((screen.getByRole("button", { name: "Record training checklist completion" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("enforces prerequisites, completes only resolved items, and relocks dependents after correction", () => {
    renderChecklist();
    const planningDecision = itemGroup(/Record the planning-stage/);
    expect((within(planningDecision).getByRole("button", { name: "Satisfactory" }) as HTMLButtonElement).disabled).toBe(true);

    for (let pass = 0; pass < preDepartureChecklist.length + 2; pass++) {
      const next = screen.getAllByRole("group").map((group) => within(group).queryByRole("button", { name: "Satisfactory" })).find((button) => button && !(button as HTMLButtonElement).disabled && button.getAttribute("aria-pressed") !== "true");
      if (!next) break;
      fireEvent.click(next);
    }
    expect(screen.getByText(/Checklist record complete/)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Record training checklist completion" }) as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(within(itemGroup(/Review the current berth-to-berth plan/)).getByRole("button", { name: "Not checked" }));
    expect(screen.getByText(/Incomplete — required items remain/)).toBeTruthy();
    expect((within(planningDecision).getByRole("button", { name: "Satisfactory" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Record training checklist completion" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("captures notes, evidence, responsible person and a timestamp for record use", () => {
    renderChecklist();
    const group = itemGroup(/Review the current berth-to-berth plan/);
    fireEvent.click(within(group).getByRole("button", { name: "Satisfactory" }));
    fireEvent.change(within(group).getByRole("textbox", { name: /notes/ }), { target: { value: "Corrected waypoint" } });
    fireEvent.change(within(group).getByRole("textbox", { name: /evidence/ }), { target: { value: "Plan revision 3" } });
    fireEvent.change(within(group).getByRole("textbox", { name: /responsible person/ }), { target: { value: "Skipper" } });
    expect(within(group).getByDisplayValue("Corrected waypoint")).toBeTruthy();
    expect(within(group).getByText(/Recorded:/).textContent).not.toContain("Not recorded");
  });
});
