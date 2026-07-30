import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import App from "./App";

const routeImport = vi.hoisted(() => vi.fn());

vi.mock("@/app/routes", async () => {
  const { lazy } = await import("react");
  return {
    appRoutes: [
      {
        path: "*",
        importPage: routeImport,
        lazyElement: lazy(routeImport),
      },
    ],
  };
});

vi.mock("@/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/components/OfflineSupport", () => ({
  OfflineSupport: () => null,
}));

vi.mock("@/components/ServiceWorkerLifecycle", () => ({
  ServiceWorkerLifecycle: () => null,
}));

vi.mock("@/components/ui/toaster", () => ({
  Toaster: () => null,
}));

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => null,
}));

describe("App route recovery", () => {
  beforeEach(() => {
    routeImport.mockReset();
  });

  test("retries a rejected route import with a fresh lazy wrapper without reloading", async () => {
    const reload = vi.spyOn(window.location, "reload");
    routeImport
      .mockRejectedValueOnce(new Error("chunk temporarily unavailable"))
      .mockResolvedValueOnce({ default: () => <h1>Recovered route</h1> });

    render(<App />);

    expect(await screen.findByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Recovered route" })).toBeTruthy());
    expect(routeImport).toHaveBeenCalledTimes(2);
    expect(reload).not.toHaveBeenCalled();
  });
});
