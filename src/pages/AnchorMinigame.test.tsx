import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "fake-indexeddb/auto";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AnchorMinigame from "./AnchorMinigame";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), message: vi.fn() },
}));

describe("AnchorMinigame", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  it.each([375, 768, 1280])("supports pointer controls in a %ipx viewport", async (width) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    const user = userEvent.setup();
    const { container } = render(<MemoryRouter><AnchorMinigame /></MemoryRouter>);

    await user.click(screen.getByRole("button", { name: "↓ Down (pay out)" }));
    expect(screen.getByText("1.0 m")).toBeTruthy();
    expect(container.querySelector('svg[aria-label="Anchoring side profile"]')?.getAttribute("viewBox")).toBe("0 0 760 360");
  });

  it("supports keyboard placement, checking, and reset without writing browser storage", () => {
    const localSetItem = vi.spyOn(window.localStorage, "setItem");
    const sessionSetItem = vi.spyOn(window.sessionStorage, "setItem");
    const indexedDbOpen = vi.spyOn(window.indexedDB, "open");
    render(<MemoryRouter><AnchorMinigame /></MemoryRouter>);

    for (let index = 0; index < 27; index += 1) fireEvent.keyDown(window, { key: "ArrowDown" });
    for (let index = 0; index < 10; index += 1) fireEvent.keyDown(window, { key: "ArrowLeft" });
    fireEvent.keyDown(window, { key: "Enter" });

    expect(screen.getByText("Anchor secure")).toBeTruthy();
    expect(screen.getByText("Attempted 1 time")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again here" }));
    expect(screen.getByText("0.0 m")).toBeTruthy();
    expect(screen.getByText("Anchor not set")).toBeTruthy();
    // The simulator currently has no completion persistence contract: unlike
    // theory and quiz pages, success must not create a progress row or offline
    // queue entry. These browser channels are the storage paths used by the app.
    expect(localSetItem).not.toHaveBeenCalled();
    expect(sessionSetItem).not.toHaveBeenCalled();
    expect(indexedDbOpen).not.toHaveBeenCalled();
  });
});
