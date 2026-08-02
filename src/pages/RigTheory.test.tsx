import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = { user: null as { id: string } | null };
const loadProgressDetailed = vi.fn();
const saveProgressDetailed = vi.fn();
vi.mock("@/contexts/AuthHooks", () => ({ useAuth: () => auth }));
vi.mock("@/hooks/useProgress", () => ({ useProgress: () => ({ loadProgressDetailed, saveProgressDetailed }) }));

import RigTheory from "./RigTheory";

const renderPage = () => render(<MemoryRouter><RigTheory /></MemoryRouter>);
const select = async (groupName: RegExp, choice: string) => {
  const group = await screen.findByRole("group", { name: groupName });
  fireEvent.click(within(group).getByRole("radio", { name: choice }));
  await waitFor(() => expect(within(group).getByRole("radio", { name: choice }).getAttribute("aria-checked") ?? (within(group).getByRole("radio", { name: choice }) as HTMLInputElement).checked).toBeTruthy());
};
const completeEvidencePractice = () => {
  for (const location of ["Wire beside its terminal", "Chainplate/deck interface", "Headsail sheet and lead"]) {
    fireEvent.click(screen.getByRole("radio", { name: location }));
    fireEvent.click(screen.getByRole("button", { name: "Evaluate evidence" }));
    expect(screen.getByText(/^Correct location/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next observation" }));
  }
};

describe("RigTheory honest durable outcomes", () => {
  beforeEach(() => {
    sessionStorage.clear(); auth.user = null;
    loadProgressDetailed.mockReset().mockResolvedValue({ status: "anonymous" });
    saveProgressDetailed.mockReset().mockResolvedValue("remote");
  });

  it("supports reversible outcomes, defect escalation and reset", async () => {
    renderPage();
    await screen.findByText(/saved for this browser session/i);
    await select(/Shrouds & Stays/i, "Defect found");
    expect(screen.getByRole("alert").textContent).toMatch(/Stop.*escalate/i);
    await select(/Shrouds & Stays/i, "Satisfactory evidence");
    expect(screen.queryByText(/Record the defect and escalate/i)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Reset review" }));
    await waitFor(() => expect((within(screen.getByRole("group", { name: /Shrouds & Stays/i })).getByRole("radio", { name: "Not reviewed" }) as HTMLInputElement).checked).toBe(true));
  });

  it("resumes anonymous outcomes and never awards points", async () => {
    sessionStorage.setItem("rig-review-anonymous-v1", JSON.stringify({ version: 1, catalogueId: "rig-review-v1", outcomes: { shrouds: "unknown-na" } }));
    renderPage();
    expect((await screen.findByRole("radio", { name: "Unknown / not accessible", checked: true })).getAttribute("value")).toBe("unknown-na");
    expect(screen.getByText(/awards zero points/i)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Readiness not established" })).toBeTruthy();
  });

  it("requires every item to be satisfactory for qualified learning completion", async () => {
    renderPage(); await screen.findByText(/saved for this browser session/i);
    for (const group of screen.getAllByRole("group")) {
      if (!within(group).queryByRole("radio", { name: "Satisfactory evidence" })) continue;
      fireEvent.click(within(group).getByRole("radio", { name: "Satisfactory evidence" }));
      await screen.findByText(/saved for this browser session/i);
    }
    completeEvidencePractice();
    expect(await screen.findByRole("heading", { name: "Learning review complete" })).toBeTruthy();
    expect(screen.getByText(/not a certificate/i)).toBeTruthy();
  });

  it("teaches configuration orientation and requires locating evidence with feedback", async () => {
    renderPage(); await screen.findByText(/saved for this browser session/i);
    expect(screen.getByRole("img", { name: /configuration-qualified mast/i })).toBeTruthy();
    expect(screen.getByText(/one masthead-sloop example/i)).toBeTruthy();
    expect(screen.getByRole("heading", { name: /Safe deck-level walk-round/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "Sail reefing patch" }));
    fireEvent.click(screen.getByRole("button", { name: "Evaluate evidence" }));
    expect(screen.getByText(/Not yet.*trace the observation/i)).toBeTruthy();
    completeEvidencePractice();
    expect(screen.getByText(/Evidence walk-round practice complete/i)).toBeTruthy();
  });

  it("navigates from the lesson to rig quiz practice", async () => {
    render(<MemoryRouter initialEntries={["/rig"]}><Routes><Route path="/rig" element={<RigTheory />} /><Route path="/quiz/rig" element={<h1>Rig quiz destination</h1>} /></Routes></MemoryRouter>);
    await screen.findByText(/saved for this browser session/i);
    fireEvent.click(screen.getByRole("button", { name: "Practise Rig Quiz" }));
    expect(await screen.findByRole("heading", { name: "Rig quiz destination" })).toBeTruthy();
  });

  it("pauses editing on save failure and retries the same snapshot", async () => {
    auth.user = { id: "rig-user" };
    loadProgressDetailed.mockResolvedValue({ status: "missing" });
    saveProgressDetailed.mockResolvedValueOnce("failed").mockResolvedValueOnce("remote");
    renderPage();
    await select(/Shrouds & Stays/i, "Satisfactory evidence");
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("latest outcome was not saved");
    fireEvent.click(within(alert).getByRole("button", { name: "Retry save" }));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(saveProgressDetailed).toHaveBeenLastCalledWith("rig-review", false, 0, 0, expect.objectContaining({ catalogueId: "rig-review-v1" }));
  });

  it("never reads or changes a legacy completed rig row", async () => {
    loadProgressDetailed.mockImplementation((topic: string) => {
      if (topic === "rig") throw new Error("legacy row must remain untouched");
      return Promise.resolve({ status: "missing" });
    });
    renderPage();
    await screen.findByText("0 of 12 items reviewed; 0 unresolved.");
    expect(loadProgressDetailed).toHaveBeenCalledWith("rig-review");
    expect(loadProgressDetailed).not.toHaveBeenCalledWith("rig");
  });

  it("offers retry for transient load failure", async () => {
    loadProgressDetailed.mockResolvedValueOnce({ status: "failed" }).mockResolvedValueOnce({ status: "anonymous" });
    renderPage();
    fireEvent.click(within(await screen.findByRole("alert")).getByRole("button", { name: "Retry load" }));
    expect(await screen.findByText(/saved for this browser session/i)).toBeTruthy();
  });

  it("keeps malformed anonymous data until explicit safe clear", async () => {
    sessionStorage.setItem("rig-review-anonymous-v1", "{bad");
    renderPage();
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("was not deleted");
    expect(sessionStorage.getItem("rig-review-anonymous-v1")).toBe("{bad");
    fireEvent.click(within(alert).getByRole("button", { name: "Clear local review" }));
    expect(sessionStorage.getItem("rig-review-anonymous-v1")).toBeNull();
    expect(await screen.findByText(/saved for this browser session/i)).toBeTruthy();
  });

  it("requires explicit reset for malformed remote data", async () => {
    auth.user = { id: "rig-user" };
    loadProgressDetailed.mockResolvedValue({ status: "remote", record: { answers_history: { version: 1, catalogueId: "stale", outcomes: {} } } });
    saveProgressDetailed.mockResolvedValue("remote");
    renderPage();
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("it was not changed");
    expect(saveProgressDetailed).not.toHaveBeenCalled();
    fireEvent.click(within(alert).getByRole("button", { name: "Reset saved review" }));
    await waitFor(() => expect(saveProgressDetailed).toHaveBeenCalledWith("rig-review", false, 0, 0, expect.objectContaining({ outcomes: {} })));
  });
});
