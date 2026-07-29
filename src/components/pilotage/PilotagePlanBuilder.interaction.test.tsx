import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PilotagePlanBuilder } from "./PilotagePlanBuilder";

describe("PilotagePlanBuilder completion", () => {
  it("locks all plan mutations while a save is pending", async () => {
    const user = userEvent.setup();
    let resolveSave: (saved: boolean) => void = () => undefined;
    const pendingSave = new Promise<boolean>((resolve) => { resolveSave = resolve; });
    const onComplete = vi.fn().mockReturnValue(pendingSave);
    render(<PilotagePlanBuilder onComplete={onComplete} />);

    await user.click(screen.getByRole("button", { name: "Complete pilotage plan" }));
    expect(screen.getByRole("button", { name: "Saving plan…" })).toBeTruthy();

    const speed = screen.getByLabelText("Planned speed") as HTMLInputElement;
    const removeButtons = screen.getAllByRole("button", { name: "Remove" }) as HTMLButtonElement[];
    const addButton = screen.getByRole("button", { name: "Add waypoint" }) as HTMLButtonElement;
    expect(speed.disabled).toBe(true);
    expect(removeButtons.every((button) => button.disabled)).toBe(true);
    expect(addButton.disabled).toBe(true);
    expect((screen.getByLabelText("Waypoint name") as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByLabelText("Pilotage notes") as HTMLTextAreaElement).disabled).toBe(true);

    await user.click(removeButtons[0]);
    await user.type(speed, "4");
    expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(3);
    expect(speed.value).toBe("5");

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
