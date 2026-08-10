import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PilotagePlanBuilder } from "./PilotagePlanBuilder";

describe("PilotagePlanBuilder completion", () => {
  beforeEach(() => localStorage.clear());
  const brief = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole("checkbox"));
  };

  it("shows fractional leg time while explaining that only the total is rounded", async () => {
    const user = userEvent.setup();
    render(<PilotagePlanBuilder onComplete={vi.fn()} />);

    await user.type(screen.getByLabelText("Leg name"), "Short harbour leg");
    await user.clear(screen.getByLabelText("Distance (NM)"));
    await user.type(screen.getByLabelText("Distance (NM)"), "0.1");
    await user.clear(screen.getByLabelText("Planned SOG (knots)"));
    await user.type(screen.getByLabelText("Planned SOG (knots)"), "20");
    for (const label of ["Mark or feature", "Hazards", "Safe limits", "Monitoring", "Depth and tide", "Communications", "Abort and contingency"]) {
      await user.type(screen.getByLabelText(label), "Checked");
    }
    await user.click(screen.getByRole("button", { name: "Add waypoint" }));

    expect(screen.getByText(/SOG 20 kn · 0\.3 min/)).toBeTruthy();
    expect(screen.getByText(/cumulative time uses full precision/i)).toBeTruthy();
  });

  it("locks all plan mutations while a save is pending", async () => {
    const user = userEvent.setup();
    let resolveSave: (saved: boolean) => void = () => undefined;
    const pendingSave = new Promise<boolean>((resolve) => { resolveSave = resolve; });
    const onComplete = vi.fn().mockReturnValue(pendingSave);
    render(<PilotagePlanBuilder onComplete={onComplete} />);

    await brief(user);
    await user.click(screen.getByRole("button", { name: "Complete pilotage plan" }));
    expect(screen.getByRole("button", { name: "Saving plan…" })).toBeTruthy();

    const sog = screen.getByLabelText("Planned SOG (knots)") as HTMLInputElement;
    const removeButtons = screen.getAllByRole("button", { name: "Remove" }) as HTMLButtonElement[];
    const addButton = screen.getByRole("button", { name: "Add waypoint" }) as HTMLButtonElement;
    expect(sog.disabled).toBe(true);
    expect(removeButtons.every((button) => button.disabled)).toBe(true);
    expect(addButton.disabled).toBe(true);
    expect((screen.getByLabelText("Leg name") as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByLabelText("Pilotage notes") as HTMLTextAreaElement).disabled).toBe(true);

    await user.click(removeButtons[0]);
    await user.type(sog, "4");
    expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(removeButtons.length);
    expect(sog.value).toBe("5");

    resolveSave(true);
    await waitFor(() => expect((screen.getByRole("button", { name: "Plan completed" }) as HTMLButtonElement).disabled).toBe(true));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("allows retry when persistence fails and locks only after success", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    render(<PilotagePlanBuilder onComplete={onComplete} />);

    await brief(user);
    await user.click(screen.getByRole("button", { name: "Complete pilotage plan" }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect((screen.getByRole("button", { name: "Complete pilotage plan" }) as HTMLButtonElement).disabled).toBe(false);

    await user.click(screen.getByRole("button", { name: "Complete pilotage plan" }));
    await waitFor(() => expect((screen.getByRole("button", { name: "Plan completed" }) as HTMLButtonElement).disabled).toBe(true));
    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it("clears completed state after a waypoint is removed", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn().mockResolvedValue(true);
    render(<PilotagePlanBuilder onComplete={onComplete} />);

    await brief(user);
    await user.click(screen.getByRole("button", { name: "Complete pilotage plan" }));
    await waitFor(() => expect((screen.getByRole("button", { name: "Plan completed" }) as HTMLButtonElement).disabled).toBe(true));
    await user.click(screen.getAllByRole("button", { name: "Remove" })[0]);
    expect((screen.getByRole("button", { name: "Complete pilotage plan" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
    await brief(user);
    expect((screen.getByRole("button", { name: "Complete pilotage plan" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("edits, reorders, and reopens a versioned draft", async () => {
    const user = userEvent.setup();
    const view = render(<PilotagePlanBuilder onComplete={vi.fn()} />);
    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    await user.clear(screen.getByLabelText("Leg name"));
    await user.type(screen.getByLabelText("Leg name"), "Revised safe-water leg");
    await user.click(screen.getByRole("button", { name: "Save leg" }));
    expect(screen.getAllByText("1. Revised safe-water leg")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Move Revised safe-water leg down" }));
    expect(screen.getAllByText("2. Revised safe-water leg")).toHaveLength(2);
    expect(JSON.parse(localStorage.getItem("day-skipper:pilotage-plan:draft") ?? "null").version).toBe(2);

    view.unmount();
    render(<PilotagePlanBuilder onComplete={vi.fn()} />);
    expect(screen.getAllByText("2. Revised safe-water leg")).toHaveLength(2);
  });

  it("provides a dedicated controls-free, non-splitting print plan", () => {
    render(<PilotagePlanBuilder onComplete={vi.fn()} />);
    const printPlan = screen.getByTestId("print-cockpit-plan");
    expect(printPlan.className).toContain("print:block");
    expect(printPlan.querySelectorAll("button, input, textarea")).toHaveLength(0);
    expect(printPlan.querySelectorAll("article")).toHaveLength(3);
    expect(Array.from(printPlan.querySelectorAll("article")).every((leg) => leg.className.includes("break-inside-avoid"))).toBe(true);
    expect(screen.getByText("1. Harbour approach").closest(".print\\:hidden")).toBeTruthy();
  });
});
