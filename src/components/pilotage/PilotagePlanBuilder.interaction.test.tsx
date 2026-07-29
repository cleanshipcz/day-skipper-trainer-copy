import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PilotagePlanBuilder } from "./PilotagePlanBuilder";

describe("PilotagePlanBuilder completion", () => {
  it("allows retry when persistence fails and locks only after success", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    render(<PilotagePlanBuilder onComplete={onComplete} />);

    await user.click(screen.getByRole("button", { name: "Complete pilotage plan" }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect((screen.getByRole("button", { name: "Complete pilotage plan" }) as HTMLButtonElement).disabled).toBe(false);

    await user.click(screen.getByRole("button", { name: "Complete pilotage plan" }));
    await waitFor(() => expect((screen.getByRole("button", { name: "Plan completed" }) as HTMLButtonElement).disabled).toBe(true));
    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it("clears completed state after speed changes or a waypoint is removed", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn().mockResolvedValue(true);
    render(<PilotagePlanBuilder onComplete={onComplete} />);

    await user.click(screen.getByRole("button", { name: "Complete pilotage plan" }));
    await waitFor(() => expect((screen.getByRole("button", { name: "Plan completed" }) as HTMLButtonElement).disabled).toBe(true));
    fireEvent.change(screen.getByLabelText("Planned speed"), { target: { value: "4" } });
    expect((screen.getByRole("button", { name: "Complete pilotage plan" }) as HTMLButtonElement).disabled).toBe(false);

    await user.click(screen.getByRole("button", { name: "Complete pilotage plan" }));
    await waitFor(() => expect((screen.getByRole("button", { name: "Plan completed" }) as HTMLButtonElement).disabled).toBe(true));
    await user.click(screen.getAllByRole("button", { name: "Remove" })[0]);
    expect((screen.getByRole("button", { name: "Complete pilotage plan" }) as HTMLButtonElement).disabled).toBe(false);
  });
});
