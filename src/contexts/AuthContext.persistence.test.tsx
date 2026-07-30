// @vitest-environment happy-dom
import { act, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clearOwnerPersistence: vi.fn(),
  callback: undefined as undefined | ((event: string, session: unknown) => void),
  signOut: vi.fn().mockResolvedValue({ error: null }),
}));
vi.mock("@/features/persistence/browserStorage", () => ({
  clearOwnerPersistence: mocks.clearOwnerPersistence,
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn((callback) => {
        mocks.callback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signOut: mocks.signOut,
    },
  },
}));

import { AuthProvider } from "./AuthContext";

describe("AuthProvider persistence cleanup", () => {
  it("cleans the previous owner when authentication switches identity", async () => {
    render(<MemoryRouter><AuthProvider><p>child</p></AuthProvider></MemoryRouter>);
    await act(async () => {
      mocks.callback?.("SIGNED_IN", { user: { id: "owner-a" } });
      mocks.callback?.("SIGNED_IN", { user: { id: "owner-b" } });
    });

    expect(mocks.clearOwnerPersistence).toHaveBeenCalledWith("owner-a");
    expect(mocks.clearOwnerPersistence).not.toHaveBeenCalledWith("owner-b");
  });
});
