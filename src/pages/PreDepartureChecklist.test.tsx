import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/hooks/useProgress",()=>({useProgress:()=>({saveProgress:vi.fn()})}));
import PreDepartureChecklist from "./PreDepartureChecklist";

describe("PreDepartureChecklist",()=>{
  it("explains scope, renders ordered phases and links supporting tools",()=>{
    render(<MemoryRouter initialEntries={["/passage-planning/checklist"]}><PreDepartureChecklist/></MemoryRouter>);
    expect(screen.getByText(/not a seaworthiness certificate/i)).toBeTruthy();
    const headings=screen.getAllByRole("heading").map(node=>node.textContent).filter(text=>/^\d\. /.test(text??""));
    expect(headings).toEqual(["1. Planning and current information","2. Crew and vessel readiness","3. Pre-start checks","4. Safe start","5. Immediate running checks","6. Final go / no-go"]);
    expect(screen.getByRole("link",{name:"Engine checks"}).getAttribute("href")).toBe("/engine");
    expect(screen.getByRole("link",{name:"Passage plan builder"}).getAttribute("href")).toBe("/passage-planning/builder");
  });

  it("enforces prerequisites and provides an explicit authority-based not-applicable path",()=>{
    render(<MemoryRouter><PreDepartureChecklist/></MemoryRouter>);
    expect((screen.getByRole("checkbox",{name:/Record the planning-stage/}) as HTMLButtonElement).disabled).toBe(true);
    const conditional=screen.getAllByRole("button",{name:"Record not applicable after checking authority"})[0];
    fireEvent.click(conditional);
    expect(conditional.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText(/1 recorded not applicable/)).toBeTruthy();
  });
});
