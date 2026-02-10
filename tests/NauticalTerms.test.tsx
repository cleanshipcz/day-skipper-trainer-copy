import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NauticalTerms from "../src/pages/NauticalTerms";
import TestRouter from "./TestRouter";

const loadProgressMock = vi.fn(async () => null);
const saveProgressMock = vi.fn();

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    loadProgress: loadProgressMock,
    saveProgress: saveProgressMock,
  }),
}));

vi.mock("@/contexts/AuthHooks", () => ({
  useAuth: () => ({
    user: null,
  }),
}));

describe("NauticalTerms page progress writes", () => {
  beforeEach(() => {
    loadProgressMock.mockClear();
    saveProgressMock.mockClear();
  });

  it("does not mark unrelated modules complete when resetting the game", async () => {
    const user = userEvent.setup();

    render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    await user.click(screen.getByRole("button", { name: /reset/i }));

    expect(saveProgressMock).not.toHaveBeenCalledWith("colregs-theory", true, 100, 10);
    expect(saveProgressMock).not.toHaveBeenCalledWith("lights-theory", true, 100, 10);
  });
});
