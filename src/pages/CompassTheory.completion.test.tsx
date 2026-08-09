import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CompassTheory from "./CompassTheory";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  markCompleted: vi.fn(),
  markSectionVisited: vi.fn(),
  saveState: "idle",
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...await importOriginal<typeof import("react-router-dom")>(),
  useNavigate: () => mocks.navigate,
}));

vi.mock("@/features/progress/useTheoryCompletionGate", () => ({
  useTheoryCompletionGate: (args: unknown) => {
    (globalThis as typeof globalThis & { compassGateArgs?: unknown }).compassGateArgs = args;
    return {
      canComplete: true,
      isHydrated: true,
      saveState: mocks.saveState,
      markCompleted: mocks.markCompleted,
      markSectionVisited: mocks.markSectionVisited,
    };
  },
}));

vi.mock("@/components/navigation/CompassConverter", () => ({ default: () => <div>Converter</div> }));
vi.mock("@/components/navigation/DeviationDrill", () => ({ default: () => <div>Drill</div> }));
vi.mock("@/components/navigation/CompassReference", () => ({ default: () => <div>Reference</div> }));

describe("CompassTheory completion persistence", () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.markCompleted.mockReset();
    mocks.markSectionVisited.mockReset();
    mocks.saveState = "idle";
  });

  it("uses revisioned evidence and navigates only after confirmed durable persistence", async () => {
    mocks.markCompleted.mockResolvedValue(true);
    render(<CompassTheory />);

    expect((globalThis as typeof globalThis & { compassGateArgs?: unknown }).compassGateArgs).toEqual(expect.objectContaining({
      catalogueRevision: "compass-theory-v1",
      requiredSectionIds: ["read-content"],
    }));
    fireEvent.click(screen.getByRole("button", { name: "Complete Module" }));

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/navigation"));
    expect(mocks.markCompleted).toHaveBeenCalledOnce();
  });

  it("stays on the lesson after a failed save and offers an explicit idempotent retry", async () => {
    mocks.markCompleted.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const view = render(<CompassTheory />);

    fireEvent.click(screen.getByRole("button", { name: "Complete Module" }));
    expect((await screen.findByRole("alert")).textContent).toContain("Completion was not saved");
    expect(mocks.navigate).not.toHaveBeenCalled();

    mocks.saveState = "failed";
    view.rerender(<CompassTheory />);
    fireEvent.click(screen.getByRole("button", { name: "Retry completion" }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/navigation"));
    expect(mocks.markCompleted).toHaveBeenCalledTimes(2);
  });
});
