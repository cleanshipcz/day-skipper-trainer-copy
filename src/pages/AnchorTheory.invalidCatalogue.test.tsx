import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadProgressDetailed: vi.fn(),
  saveProgressDetailed: vi.fn(),
}));

vi.mock("@/data/anchorTopics", () => ({ topics: [] }));
vi.mock("@/contexts/AuthHooks", () => ({ useAuth: () => ({ user: { id: "user-a" } }) }));
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    loadProgressDetailed: mocks.loadProgressDetailed,
    saveProgressDetailed: mocks.saveProgressDetailed,
  }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

import AnchorTheory from "./AnchorTheory";

it("fails closed without loading or showing completion for an empty runtime catalogue", async () => {
  render(<MemoryRouter><AnchorTheory /></MemoryRouter>);
  expect((await screen.findByRole("alert")).textContent).toContain("lesson catalogue is invalid");
  expect(screen.queryByText("All topics completed!")).toBeNull();
  expect(mocks.loadProgressDetailed).not.toHaveBeenCalled();
  expect(mocks.saveProgressDetailed).not.toHaveBeenCalled();
});
