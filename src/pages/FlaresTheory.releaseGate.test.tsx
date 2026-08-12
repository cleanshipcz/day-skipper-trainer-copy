import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import FlaresTheory from "./FlaresTheory";

const progress = vi.hoisted(() => ({ ownerId: "owner-a", loadProgressDetailed: vi.fn(), saveProgressDetailed: vi.fn() }));
vi.mock("@/hooks/useProgress", () => ({ useProgress: () => progress }));

describe("FlaresTheory qualified review release gate", () => {
  it("does not mount revised content or cause progress effects while review is pending", () => {
    render(<MemoryRouter><FlaresTheory /></MemoryRouter>);
    expect(screen.getByRole("status").textContent).toMatch(/release blocked/i);
    expect(screen.queryByText(/Flare Types$/)).toBeNull();
    expect(progress.loadProgressDetailed).not.toHaveBeenCalled(); expect(progress.saveProgressDetailed).not.toHaveBeenCalled();
  });
});
