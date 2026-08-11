import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FuelCalculator } from "./FuelCalculator";

vi.mock("@/hooks/useProgress", () => ({ useProgress: () => ({ saveProgress: vi.fn() }) }));

describe("FuelCalculator", () => {
  it("calculates deliberately, explains the equation, and invalidates stale results accessibly", async () => {
    const user = userEvent.setup();
    render(<FuelCalculator />);
    expect(screen.getByRole("status").textContent).toMatch(/Inputs changed/);
    const calculate = screen.getByRole("button", { name: "Calculate / update result" });
    calculate.focus(); await user.keyboard("{Enter}");
    expect(screen.getByText(/Base fuel \(unrounded\)/).textContent).toContain("18 ÷ 6 × 2 = 6.0000 L");
    expect(screen.getByRole("button", { name: "Complete calculation" }).hasAttribute("disabled")).toBe(false);
    const distance = screen.getByLabelText("Distance (nautical miles)");
    await user.clear(distance); await user.type(distance, "19");
    expect(screen.queryByText(/Base fuel \(unrounded\)/)).toBeNull();
    expect(screen.getByRole("status").textContent).toMatch(/Calculate to produce an updated result/);
    expect(screen.getByRole("button", { name: "Complete calculation" }).hasAttribute("disabled")).toBe(true);
  });
});
