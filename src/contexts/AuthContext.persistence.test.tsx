// @vitest-environment happy-dom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
import { useAuth } from "./AuthHooks";

const SignOutProbe = () => {
  const { signOut } = useAuth();
  return <button onClick={() => void signOut()}>Sign out</button>;
};

describe("AuthProvider persistence cleanup", () => {
  beforeEach(() => {
    mocks.clearOwnerPersistence.mockClear();
    mocks.signOut.mockClear();
  });

  it("cleans the previous owner when authentication switches identity", async () => {
    render(<MemoryRouter><AuthProvider><p>child</p></AuthProvider></MemoryRouter>);
    await act(async () => {
      mocks.callback?.("SIGNED_IN", { user: { id: "owner-a" } });
      mocks.callback?.("SIGNED_IN", { user: { id: "owner-b" } });
    });

    expect(mocks.clearOwnerPersistence).toHaveBeenCalledWith("owner-a");
    expect(mocks.clearOwnerPersistence).not.toHaveBeenCalledWith("owner-b");
  });

  it("cleans the current owner after a successful explicit sign-out", async () => {
    render(<MemoryRouter><AuthProvider><SignOutProbe /></AuthProvider></MemoryRouter>);
    await act(async () => Promise.resolve());
    await act(async () => mocks.callback?.("SIGNED_IN", { user: { id: "owner-a" } }));

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(mocks.clearOwnerPersistence).toHaveBeenCalledWith("owner-a"));
  });
});
