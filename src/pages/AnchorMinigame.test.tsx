import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "fake-indexeddb/auto";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AnchorMinigame from "./AnchorMinigame";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), message: vi.fn() },
}));

describe("AnchorMinigame", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  it("returns to the originating lesson and routes procedural failure to remediation", async () => {
    const user = userEvent.setup();
    const Probe = () => { const location = useLocation(); return <p>Route: {location.pathname}{location.search}</p>; };
    render(<MemoryRouter initialEntries={["/anchor-minigame?returnTopic=swinging-room"]}><Routes><Route path="/anchor-minigame" element={<AnchorMinigame />} /><Route path="*" element={<Probe />} /></Routes></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: "Enter (check)" }));
    await user.click(screen.getByRole("button", { name: "Review procedure lesson" }));
    expect(await screen.findByText("Route: /anchorwork?topic=procedure&from=practice")).toBeTruthy();
  });

  it("prioritises procedure remediation while scope and setting checks are incomplete", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AnchorMinigame /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: "Enter (check)" }));
    expect(screen.getByRole("button", { name: "Review procedure lesson" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Close" }));
    for (let index = 0; index < 10; index += 1) await user.click(screen.getByRole("button", { name: "↓ Down (pay out)" }));
    for (let index = 0; index < 5; index += 1) await user.click(screen.getByRole("button", { name: "← Left" }));
    await user.click(screen.getByRole("button", { name: "Enter (check)" }));
    expect(screen.getByRole("button", { name: "Review procedure lesson" })).toBeTruthy();
  });

  it.each([320, 375, 768, 1280])("supports pointer controls in a %ipx viewport", async (width) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    const user = userEvent.setup();
    const { container } = render(<MemoryRouter><AnchorMinigame /></MemoryRouter>);

    await user.click(screen.getByRole("button", { name: "↓ Down (pay out)" }));
    expect(screen.getByText("1.0 m")).toBeTruthy();
    expect(container.querySelector('svg[aria-label="Anchoring side profile"]')?.getAttribute("viewBox")).toBe("0 0 760 400");
  });

  it.each(["mouse", "touch"])("supports continuous %s manipulation on the active surface", (pointerType) => {
    render(<MemoryRouter><AnchorMinigame /></MemoryRouter>);
    const surface = screen.getByRole("application", { name: /Anchor manipulation surface/ });
    let captured: number | null = null;
    surface.setPointerCapture = vi.fn((pointerId) => { captured = pointerId; });
    surface.hasPointerCapture = vi.fn((pointerId) => captured === pointerId);
    surface.releasePointerCapture = vi.fn(() => { captured = null; });

    fireEvent.pointerDown(surface, { pointerId: 7, pointerType, isPrimary: true, button: 0, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(surface, { pointerId: 7, pointerType, isPrimary: true, clientX: 62, clientY: 130 });
    fireEvent.pointerUp(surface, { pointerId: 7, pointerType, isPrimary: true, clientX: 62, clientY: 130 });

    expect(screen.getByText("2.0 m")).toBeTruthy();
    expect(screen.getByText("Drifting back from the anchor")).toBeTruthy();
    expect(surface.className).toContain("touch-none");
  });

  it("stops manipulation safely after pointer cancellation or capture loss", () => {
    render(<MemoryRouter><AnchorMinigame /></MemoryRouter>);
    const surface = screen.getByRole("application", { name: /Anchor manipulation surface/ });
    surface.setPointerCapture = vi.fn();
    surface.hasPointerCapture = vi.fn(() => false);
    surface.releasePointerCapture = vi.fn();

    fireEvent.pointerDown(surface, { pointerId: 8, pointerType: "touch", isPrimary: true, clientX: 20, clientY: 20 });
    fireEvent.pointerCancel(surface, { pointerId: 8, pointerType: "touch", isPrimary: true });
    fireEvent.pointerMove(surface, { pointerId: 8, pointerType: "touch", isPrimary: true, clientX: 20, clientY: 100 });
    expect(screen.getByText("0.0 m")).toBeTruthy();

    fireEvent.pointerDown(surface, { pointerId: 9, pointerType: "mouse", isPrimary: true, button: 0, clientX: 20, clientY: 20 });
    fireEvent.lostPointerCapture(surface, { pointerId: 9, pointerType: "mouse", isPrimary: true });
    fireEvent.pointerMove(surface, { pointerId: 9, pointerType: "mouse", isPrimary: true, clientX: 20, clientY: 100 });
    expect(screen.getByText("0.0 m")).toBeTruthy();
  });

  it("shows the scenario factors, reviewed basis, and limits of the model", () => {
    render(<MemoryRouter><AnchorMinigame /></MemoryRouter>);

    expect(screen.getByText("10 m chain plus nylon rode")).toBeTruthy();
    expect(screen.getByText(/RNLI SAR Unit 9, p\. 67; MCA MGN 592/)).toBeTruthy();
    expect(screen.getByText(/numeric exercise bounds are conservative training fixtures, not universal recommendations/)).toBeTruthy();
    expect(screen.getByText(/Simplified: the circular worst-case sweep/)).toBeTruthy();
    expect(screen.getByLabelText("Anchoring swept-area plan")).toBeTruthy();
    expect(screen.getByText(/Differently swinging neighbours:/)).toBeTruthy();
    expect(screen.getByText(/Modeled condition effects:/)).toBeTruthy();
    expect(screen.getByText(/exact wind\/current vectors/)).toBeTruthy();
  });

  it("reproduces a setup from URL identity and advances without a boundary repeat", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={["/?scenarioSeed=0&scenarioIndex=3"]}><AnchorMinigame /></MemoryRouter>);

    expect(screen.getByText("Tidal river bend")).toBeTruthy();
    expect(screen.getByText(/anchor-0-1-4-tidal/)).toBeTruthy();
    expect(screen.getByText(/Family 4\/4/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "New setup" }));
    expect(screen.queryByText("Tidal river bend")).toBeNull();
    expect(screen.getByText(/Cycle 2/)).toBeTruthy();
    expect(screen.getByText(/Tidal river bend \(changed, anchor-0-1-4-tidal\)/)).toBeTruthy();
  });

  it("draws an unsafe swept area beyond the room boundary", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AnchorMinigame /></MemoryRouter>);
    for (let index = 0; index < 43; index += 1) await user.click(screen.getByRole("button", { name: "↓ Down (pay out)" }));
    const room = Number(screen.getByTestId("room-boundary").getAttribute("r"));
    const swept = Number(screen.getByTestId("swept-area").getAttribute("r"));
    expect(swept).toBeGreaterThan(room);
    expect(screen.getByTestId("swept-area").getAttribute("stroke")).toContain("destructive");
  });

  it("routes missing post-change watch work to the anchor-watch lesson", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    const Probe = () => { const location = useLocation(); return <p>Route: {location.pathname}{location.search}</p>; };
    render(<MemoryRouter><Routes><Route path="/" element={<AnchorMinigame />} /><Route path="*" element={<Probe />} /></Routes></MemoryRouter>);
    for (let index = 0; index < 32; index += 1) fireEvent.keyDown(window, { key: "ArrowDown" });
    for (let index = 0; index < 10; index += 1) fireEvent.keyDown(window, { key: "ArrowLeft" });
    for (let index = 0; index < 3; index += 1) fireEvent.click(screen.getByRole("button", { name: "Apply setting load" }));
    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    now.mockReturnValue(6_000);
    fireEvent.click(screen.getByRole("button", { name: "Apply wind/tide change" }));
    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Review anchor-watch lesson" }));
    expect(await screen.findByText("Route: /anchorwork?topic=swinging-room&from=practice")).toBeTruthy();
    now.mockRestore();
  });

  it("supports keyboard placement, checking, and reset without writing browser storage", () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    const localSetItem = vi.spyOn(window.localStorage, "setItem");
    const sessionSetItem = vi.spyOn(window.sessionStorage, "setItem");
    const indexedDbOpen = vi.spyOn(window.indexedDB, "open");
    render(<MemoryRouter><AnchorMinigame /></MemoryRouter>);

    for (let index = 0; index < 32; index += 1) fireEvent.keyDown(window, { key: "ArrowDown" });
    for (let index = 0; index < 10; index += 1) fireEvent.keyDown(window, { key: "ArrowLeft" });
    for (let index = 0; index < 3; index += 1) fireEvent.click(screen.getByRole("button", { name: "Apply setting load" }));
    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    now.mockReturnValue(6_000);
    fireEvent.click(screen.getByRole("button", { name: "Apply wind/tide change" }));
    fireEvent.click(screen.getByRole("button", { name: "Run anchor watch" }));
    fireEvent.keyDown(window, { key: "Enter" });

    expect(screen.getByText("Modeled checks passed")).toBeTruthy();
    expect(screen.getByText("Attempted 2 times")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again here" }));
    expect(screen.getByText("0.0 m")).toBeTruthy();
    expect(screen.getByText("Anchor not set")).toBeTruthy();
    // The simulator currently has no completion persistence contract: unlike
    // theory and quiz pages, success must not create a progress row or offline
    // queue entry. These browser channels are the storage paths used by the app.
    expect(localSetItem).not.toHaveBeenCalled();
    expect(sessionSetItem).not.toHaveBeenCalled();
    expect(indexedDbOpen).not.toHaveBeenCalled();
    now.mockRestore();
  });

  it("lets a focused control handle Enter without also running the global placement check", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AnchorMinigame /></MemoryRouter>);

    const checkButton = screen.getByRole("button", { name: "Enter (check)" });
    checkButton.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByText("Attempted 1 time")).toBeTruthy();

    const payOutButton = screen.getByRole("button", { name: "↓ Down (pay out)" });
    payOutButton.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByText("1.0 m")).toBeTruthy();
    expect(screen.getByText("Attempted 1 time")).toBeTruthy();
  });
});
