import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import FlaresTheory from "./FlaresTheory";

const progress = vi.hoisted(() => ({ ownerId: "owner-a", loadProgressDetailed: vi.fn().mockResolvedValue({ status: "missing", record: null }), saveProgressDetailed: vi.fn() }));
vi.mock("@/hooks/useProgress", () => ({ useProgress: () => progress }));

describe("FlaresTheory practitioner-review waiver", () => {
  it("mounts the sourced lesson without claiming practitioner approval", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><FlaresTheory /></MemoryRouter>);
    await user.click(await screen.findByRole("tab", { name: /Expiry & Storage$/ }));
    expect(screen.getByText(/qualified-practitioner review was explicitly waived/i)).toBeTruthy();
    expect(screen.getByText(/no practitioner approval is claimed/i)).toBeTruthy();
    expect(progress.loadProgressDetailed).toHaveBeenCalledOnce(); expect(progress.saveProgressDetailed).not.toHaveBeenCalled();
  });
});
