import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const progress = vi.hoisted(() => ({
  outcome: "remote" as "remote" | "queued" | "anonymous" | "failed",
  save: vi.fn(),
  load: vi.fn(),
}));

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    ownerId: null,
    loadProgressDetailed: progress.load,
    saveProgress: progress.save,
    saveProgressDetailed: (...args: unknown[]) => progress.save(...args),
  }),
}));

import LightsTheory from "./LightsTheory";

const Probe = () => {
  const location = useLocation();
  return <p>Route: {location.pathname}</p>;
};

const renderPage = () => render(
  <MemoryRouter initialEntries={["/rules/lights/theory"]}>
    <Routes>
      <Route path="/rules/lights/theory" element={<LightsTheory />} />
      <Route path="*" element={<Probe />} />
    </Routes>
  </MemoryRouter>,
);

const objectives = [
  [/I reviewed how vessel status/, "A vessel fishing other than trawling"],
  [/I reviewed manoeuvring/, "A power-driven vessel making way"],
  [/I reviewed the Annex IV/, "It is an Annex IV distress signal requiring assistance"],
] as const;

describe("LightsTheory real persistence transitions", () => {
  beforeEach(() => {
    localStorage.clear();
    progress.save.mockReset().mockImplementation(async () => progress.outcome);
    progress.load.mockReset().mockResolvedValue({ status: "anonymous", record: null });
  });

  it.each([
    ["remote", "Progress saved to the server."],
    ["queued", "Progress is durably queued on this device"],
    ["anonymous", "Progress saved only in this browser profile."],
  ] as const)("announces the %s completion outcome without navigation or focus disruption", async (outcome, message) => {
    progress.outcome = outcome;
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(progress.load).toHaveBeenCalled());

    for (const [review, answer] of objectives) {
      await user.click(screen.getByLabelText(review));
      await user.click(screen.getByLabelText(answer));
      const record = screen.getAllByRole("button", { name: "Record objective evidence" })
        .find((button) => button.getAttribute("aria-disabled") !== "true")!;
      record.focus();
      await user.click(record);
      await waitFor(() => expect(record.textContent).toBe("Evidence recorded"));
      expect(document.activeElement).toBe(record);
      expect(record.getAttribute("aria-disabled")).toBe("true");
    }

    const complete = screen.getByRole("button", { name: "Complete Module" });
    complete.focus();
    await user.click(complete);
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain(message));
    expect(document.activeElement).toBe(complete);
    expect(screen.queryByText("Route: /rules/lights")).toBeNull();
  });

  it("does not claim evidence persistence when the real hook reports failure", async () => {
    progress.outcome = "failed";
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(progress.load).toHaveBeenCalled());
    await user.click(screen.getByLabelText(objectives[0][0]));
    await user.click(screen.getByLabelText(objectives[0][1]));
    const record = screen.getAllByRole("button", { name: "Record objective evidence" })[0];
    await user.click(record);
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("could not be saved"));
    expect(screen.getByRole("status").textContent).not.toContain("saved to the server");
  });
});
