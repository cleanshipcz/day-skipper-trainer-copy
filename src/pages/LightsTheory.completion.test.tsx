import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  canComplete: false,
  saveState: "idle",
  visitedSectionIds: [] as string[],
  markSectionVisited: vi.fn(),
  markCompleted: vi.fn(),
}));

vi.mock("@/features/progress/useTheoryCompletionGate", () => ({
  useTheoryCompletionGate: () => mocks,
}));

import LightsTheory from "./LightsTheory";

const LocationProbe = () => {
  const location = useLocation();
  return <p>Route: {location.pathname}</p>;
};

const renderPage = () => render(
  <MemoryRouter initialEntries={["/rules/lights/theory"]}>
    <Routes>
      <Route path="/rules/lights/theory" element={<LightsTheory />} />
      <Route path="*" element={<LocationProbe />} />
    </Routes>
  </MemoryRouter>,
);

describe("LightsTheory evidence-based completion", () => {
  beforeEach(() => {
    mocks.canComplete = false;
    mocks.saveState = "idle";
    mocks.visitedSectionIds = [];
    mocks.markSectionVisited.mockReset().mockResolvedValue(undefined);
    mocks.markCompleted.mockReset().mockResolvedValue(true);
  });

  it("does not record evidence from tab activation and requires review plus a correct recognition", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("tab", { name: "Sounds" }));
    expect(mocks.markSectionVisited).not.toHaveBeenCalled();

    const fieldset = screen.getByRole("group", { name: "Part C lights and shapes" });
    const record = fieldset.querySelector("button")!;
    fireEvent.click(fieldset.querySelector("input[type='checkbox']")!);
    fireEvent.click(screen.getByLabelText("A pilot vessel"));
    expect(record.hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByLabelText("A vessel fishing other than trawling"));
    fireEvent.click(record);
    expect(mocks.markSectionVisited).toHaveBeenCalledWith("part-c-recognition");
  });

  it("supports keyboard entry for review and applied recognition evidence", async () => {
    const user = userEvent.setup();
    renderPage();
    const review = screen.getByLabelText(/I reviewed manoeuvring/);
    review.focus();
    await user.keyboard(" ");
    const answer = screen.getByLabelText("A power-driven vessel making way");
    answer.focus();
    await user.keyboard(" ");
    // There are multiple record buttons; choose the enabled Part D control.
    const enabled = screen.getAllByRole("button", { name: "Record objective evidence" }).find((button) => !button.hasAttribute("disabled"))!;
    await user.click(enabled);
    expect(mocks.markSectionVisited).toHaveBeenCalledWith("part-d-recognition");
  });

  it("navigates only after confirmed or durably queued completion and allows retry after failure", async () => {
    mocks.canComplete = true;
    mocks.markCompleted.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const view = renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Complete Module" }));
    await waitFor(() => expect(mocks.markCompleted).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("Route: /rules/lights")).toBeNull();

    mocks.saveState = "failed";
    view.rerender(<MemoryRouter initialEntries={["/rules/lights/theory"]}><Routes><Route path="/rules/lights/theory" element={<LightsTheory />} /><Route path="*" element={<LocationProbe />} /></Routes></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Retry save" }));
    expect(await screen.findByText("Route: /rules/lights")).toBeTruthy();
  });

  it.each([
    ["saved", "Completion saved to the server."],
    ["queued", "Completion is durably queued on this device and will sync when you reconnect."],
    ["local", "Completion saved on this device. Sign in to save it across devices."],
    ["failed", "Completion could not be saved. Retry when ready."],
  ])("reports the %s persistence outcome truthfully", (state, message) => {
    mocks.saveState = state;
    renderPage();
    expect(screen.getByRole("status").textContent).toContain(message);
  });
});
