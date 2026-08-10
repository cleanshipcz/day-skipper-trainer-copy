import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PreciseNumberInput } from "./VectorTriangleTool";

describe("PreciseNumberInput", () => {
  it("keeps blank and invalid drafts away from numeric state, then accepts a valid retype without warnings", () => {
    const onValidValue = vi.fn();
    const onDraftValidity = vi.fn();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<PreciseNumberInput id="speed" label="Speed" value={5} onValidValue={onValidValue} onDraftValidity={onDraftValidity} min={0.1} max={20} step={0.1} unit="kn" />);
    const input = screen.getByLabelText("Speed");
    fireEvent.change(input, { target: { value: "" } });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert").textContent).toContain("finite number");
    expect(onValidValue).not.toHaveBeenCalled();
    expect(onDraftValidity).toHaveBeenLastCalledWith(false);
    fireEvent.change(input, { target: { value: "25" } });
    expect(screen.getByRole("alert").textContent).toContain("0.1 to 20kn");
    expect(onValidValue).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "6.4" } });
    expect(input.getAttribute("aria-invalid")).toBe("false");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(onValidValue).toHaveBeenLastCalledWith(6.4);
    expect(onDraftValidity).toHaveBeenLastCalledWith(true);
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("replaces an invalid draft and restores validity when a slider or reset supplies a new finite value", () => {
    const onValidValue = vi.fn();
    const onDraftValidity = vi.fn();
    const { rerender } = render(<PreciseNumberInput id="track" label="Track" value={90} onValidValue={onValidValue} onDraftValidity={onDraftValidity} min={0} max={359.9} step={0.1} unit="°T" />);
    const input = screen.getByLabelText("Track") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "" } });
    expect(input.value).toBe("");
    expect(onDraftValidity).toHaveBeenLastCalledWith(false);

    rerender(<PreciseNumberInput id="track" label="Track" value={120} onValidValue={onValidValue} onDraftValidity={onDraftValidity} min={0} max={359.9} step={0.1} unit="°T" />);
    expect(input.value).toBe("120");
    expect(input.getAttribute("aria-invalid")).toBe("false");
    expect(onDraftValidity).toHaveBeenLastCalledWith(true);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
