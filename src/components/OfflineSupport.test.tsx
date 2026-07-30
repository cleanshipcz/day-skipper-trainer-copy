import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { OfflineSupport } from "./OfflineSupport";

vi.mock("@/contexts/AuthHooks", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("@/features/offline/progressQueue", () => ({
  replayProgressQueue: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {},
}));

describe("OfflineSupport navigation state", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
  });

  test("keeps the app mounted and announces offline navigation", () => {
    render(<OfflineSupport />);
    expect(screen.queryByText(/Offline —/)).toBeNull();

    act(() => {
      Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
      window.dispatchEvent(new Event("offline"));
    });

    expect(screen.getByRole("status").textContent).toContain("theory and quizzes remain available");
  });
});
