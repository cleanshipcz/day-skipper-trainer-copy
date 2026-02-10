import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NauticalTerms from "../src/pages/NauticalTerms";
import TestRouter from "./TestRouter";

const saveProgressMock = vi.fn();
const loadProgressMock = vi.fn().mockResolvedValue(null);

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    saveProgress: saveProgressMock,
    loadProgress: loadProgressMock,
  }),
}));

vi.mock("@/contexts/AuthHooks", () => ({
  useAuth: () => ({
    user: { id: "test-user" },
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {},
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("NauticalTerms progress writes", () => {
  beforeEach(() => {
    saveProgressMock.mockClear();
    loadProgressMock.mockClear();
  });

  it("does not write completion for unrelated modules when resetting", async () => {
    const user = userEvent.setup();

    render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    const resetButtons = await screen.findAllByRole("button", { name: /reset/i });
    await user.click(resetButtons[0]);

    const forbiddenModules = new Set(["lights-theory", "colregs-theory"]);
    const wroteForbiddenModule = saveProgressMock.mock.calls.some(([module]) => forbiddenModules.has(module));

    expect(wroteForbiddenModule).toBe(false);
  });
});
