import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { toast } from "sonner";
import { ServiceWorkerLifecycle } from "./ServiceWorkerLifecycle";

const sw = vi.hoisted(() => ({
  options: undefined as {
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegisterError?: (error: unknown) => void;
  } | undefined,
  update: vi.fn(async () => undefined),
}));

vi.mock("virtual:pwa-register", () => ({
  registerSW: vi.fn((options) => {
    sw.options = options;
    return sw.update;
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ServiceWorkerLifecycle", () => {
  beforeEach(() => {
    sw.options = undefined;
    sw.update.mockClear();
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  test("waits for explicit approval before applying an available update", async () => {
    render(<ServiceWorkerLifecycle />);

    act(() => sw.options?.onNeedRefresh?.());
    expect((await screen.findByRole("status")).textContent).toContain("finished entering unsaved answers");
    expect(sw.update).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Update and reload" }));
    await waitFor(() => expect(sw.update).toHaveBeenCalledWith(true));
  });

  test("deduplicates offline-ready and registration-error notices", () => {
    render(<ServiceWorkerLifecycle />);

    sw.options?.onOfflineReady?.();
    sw.options?.onOfflineReady?.();
    sw.options?.onRegisterError?.(new Error("first"));
    sw.options?.onRegisterError?.(new Error("second"));

    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
