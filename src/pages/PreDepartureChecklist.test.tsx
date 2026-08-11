import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { preDepartureChecklist } from "@/data/preDepartureChecklist";

const loadProgressDetailed = vi.fn().mockResolvedValue({ status: "missing", record: null });
const saveProgressDetailed = vi.fn().mockResolvedValue("remote");
vi.mock("@/hooks/useProgress", () => ({ useProgress: () => ({ loadProgressDetailed, saveProgressDetailed }) }));
import PreDepartureChecklist from "./PreDepartureChecklist";

const renderChecklist = async () => {
  const view = render(<MemoryRouter initialEntries={["/passage-planning/checklist"]}><PreDepartureChecklist /></MemoryRouter>);
  await screen.findByText("Readiness record ready.");
  return view;
};
const itemGroup = (label: RegExp | string) => screen.getByRole("group", { name: label });

describe("PreDepartureChecklist", () => {
  beforeEach(() => {
    loadProgressDetailed.mockReset().mockResolvedValue({ status: "missing", record: null });
    saveProgressDetailed.mockReset().mockResolvedValue("remote");
  });
  it("separates training practice from certification and renders ordered phases", async () => {
    await renderChecklist();
    expect(screen.getByText(/training practice, not vessel certification/i)).toBeTruthy();
    expect(screen.getByText(/not a seaworthiness certificate/i)).toBeTruthy();
    expect(screen.getByText(/actual vessel, fitted equipment, voyage, operating area and present conditions/i)).toBeTruthy();
    const headings = screen.getAllByRole("heading").map((node) => node.textContent).filter((text) => /^\d\. /.test(text ?? ""));
    expect(headings).toEqual(["1. Planning and current information", "2. Crew and vessel readiness", "3. Pre-start checks", "4. Safe start", "5. Immediate running checks", "6. Final go / no-go"]);
    expect(screen.getByRole("link", { name: "Engine checks" }).getAttribute("href")).toBe("/engine");
  });

  it("models all review states but prevents blanket not-applicable", async () => {
    await renderChecklist();
    const required = itemGroup(/Review the current berth-to-berth plan/);
    expect(within(required).getByRole("button", { name: "Not checked" })).toBeTruthy();
    expect(within(required).getByRole("button", { name: "Satisfactory" })).toBeTruthy();
    expect(within(required).getByRole("button", { name: "Defect" })).toBeTruthy();
    expect(within(required).getByRole("button", { name: "Blocked" })).toBeTruthy();
    expect(within(required).getByRole("button", { name: "Unknown" })).toBeTruthy();
    expect(within(required).queryByRole("button", { name: "Not applicable" })).toBeNull();
    expect(within(itemGroup(/Test navigation, depth/)).queryByRole("button", { name: "Not applicable" })).toBeNull();
    expect(within(itemGroup(/Ventilate as the installation requires/)).getByRole("button", { name: "Not applicable" })).toBeTruthy();
  });

  it("requires an authority reason for N/A and supports correcting the record", async () => {
    await renderChecklist();
    const group = itemGroup(/Confirm official charts\/publications/);
    fireEvent.click(within(group).getByRole("button", { name: "Satisfactory" }));
    const conditional = itemGroup(/Ventilate as the installation requires/);
    fireEvent.click(within(conditional).getByRole("button", { name: "Not applicable" }));
    expect(screen.getByText(/0 not applicable, 0 blocked, 29 incomplete/)).toBeTruthy();
    fireEvent.change(within(conditional).getByRole("textbox", { name: /not-applicable reason/ }), { target: { value: "No powered equipment fitted; COLREG and vessel requirements checked" } });
    expect(screen.getByText(/1 not applicable/)).toBeTruthy();
    fireEvent.click(within(conditional).getByRole("button", { name: "Satisfactory" }));
    expect(within(conditional).queryByRole("textbox", { name: /not-applicable reason/ })).toBeNull();
  });

  it.each(["Defect", "Blocked", "Unknown"])("turns %s into explicit stop and escalation guidance", async (status) => {
    await renderChecklist();
    fireEvent.click(within(itemGroup(/Review the current berth-to-berth plan/)).getByRole("button", { name: status }));
    expect(screen.getByRole("alert").textContent).toMatch(/No-go: readiness is blocked/);
    expect(screen.getByRole("alert").textContent).toMatch(/Stop.*Escalate.*correct.*reassess/i);
    expect((screen.getByRole("button", { name: "Record training checklist completion" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("enforces prerequisites, completes only resolved items, and relocks dependents after correction", async () => {
    await renderChecklist();
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

  it("captures notes, evidence, responsible person and a timestamp for record use", async () => {
    await renderChecklist();
    const group = itemGroup(/Review the current berth-to-berth plan/);
    fireEvent.click(within(group).getByRole("button", { name: "Satisfactory" }));
    fireEvent.change(within(group).getByRole("textbox", { name: /notes/ }), { target: { value: "Corrected waypoint" } });
    fireEvent.change(within(group).getByRole("textbox", { name: /evidence/ }), { target: { value: "Plan revision 3" } });
    fireEvent.change(within(group).getByRole("textbox", { name: /responsible person/ }), { target: { value: "Skipper" } });
    expect(within(group).getByDisplayValue("Corrected waypoint")).toBeTruthy();
    expect(within(group).getByText(/Recorded:/).textContent).not.toContain("Not recorded");
  });

  it("invalidates completed evidence when vessel context changes", async () => {
    await renderChecklist();
    for (let pass = 0; pass < preDepartureChecklist.length + 2; pass++) {
      const next = screen.getAllByRole("group").map((group) => within(group).queryByRole("button", { name: "Satisfactory" })).find((button) => button && !(button as HTMLButtonElement).disabled && button.getAttribute("aria-pressed") !== "true");
      if (!next) break;
      fireEvent.click(next);
    }
    expect(screen.getByText(/Checklist record complete/)).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox", { name: "vessel" }), { target: { value: "Different vessel" } });
    expect(screen.getByText(/Incomplete — required items remain/)).toBeTruthy();
    expect(screen.getByText(/0% resolved/)).toBeTruthy();
  });

  it("hydrates validated saved evidence with correction history and autosaves edits", async () => {
    loadProgressDetailed.mockResolvedValueOnce({ status: "remote", record: { answers_history: { readinessRecord: {
      version: 1, updatedAt: "2026-08-11T16:00:00.000Z", context: { vessel: "Aster", voyage: "Cowes", conditions: "F4" }, entries: {
        "passage-plan": { status: "satisfactory", reason: "", notes: "Revised", evidence: "Plan 3", responsiblePerson: "Skipper", recordedAt: "2026-08-11T15:00:00.000Z", history: [{ status: "defect", reason: "", notes: "Old route", evidence: "Plan 2", responsiblePerson: "Skipper", recordedAt: "2026-08-11T14:00:00.000Z", supersededAt: "2026-08-11T15:00:00.000Z" }] },
      },
    } } } });
    await renderChecklist();
    expect((screen.getByRole("textbox", { name: "vessel" }) as HTMLInputElement).value).toBe("Aster");
    expect(within(itemGroup(/Review the current berth-to-berth plan/)).getByDisplayValue("Plan 3")).toBeTruthy();
    fireEvent.change(within(itemGroup(/Review the current berth-to-berth plan/)).getByRole("textbox", { name: /notes/ }), { target: { value: "Rechecked" } });
    await waitFor(() => expect(saveProgressDetailed).toHaveBeenCalled());
    expect(saveProgressDetailed.mock.calls.at(-1)?.[4]).toMatchObject({ readinessRecord: { version: 1, entries: { "passage-plan": { notes: "Rechecked", history: [expect.objectContaining({ status: "defect" })] } } } });
  });

  it("shows an accessible load failure and retries without using stale evidence", async () => {
    loadProgressDetailed.mockResolvedValueOnce({ status: "failed", record: null }).mockResolvedValueOnce({ status: "missing", record: null });
    render(<MemoryRouter><PreDepartureChecklist /></MemoryRouter>);
    expect((await screen.findByRole("alert")).textContent).toMatch(/could not be loaded.*No stale or partial record/i);
    fireEvent.click(screen.getByRole("button", { name: "Retry saved record" }));
    await screen.findByText("Readiness record ready.");
    expect(loadProgressDetailed).toHaveBeenCalledTimes(2);
  });
});
