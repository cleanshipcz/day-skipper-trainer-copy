import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({ saveProgress: vi.fn() }),
}));

import PersonalSafetyTheory from "./PersonalSafetyTheory";

describe("PersonalSafetyTheory lifejacket guidance", () => {
  it("shows ISO levels and qualified self-righting labels to learners", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PersonalSafetyTheory />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Level 50 buoyancy aids from Level 100, 150, and 275/i)).toBeTruthy();

    await user.click(screen.getByRole("tab", { name: "Life Jackets" }));

    expect(screen.getByText("Level 50 Buoyancy Aid")).toBeTruthy();
    expect(screen.getByText("Level 100 Lifejacket")).toBeTruthy();
    expect(screen.getByText("Level 150 Lifejacket")).toBeTruthy();
    expect(screen.getByText("Level 275 Lifejacket")).toBeTruthy();
    expect(screen.getAllByText("Self-righting performance")).toHaveLength(4);
    expect(screen.queryByText("Yes — will turn a casualty face-up")).toBeNull();
  });
});
