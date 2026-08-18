/**
 * Tests for the PersonalSafetyTheory page component.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S4, AC-1, AC-2, AC-3
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PersonalSafetyTheory from "../src/pages/PersonalSafetyTheory";
import TestRouter from "./TestRouter";

const mockSaveProgressDetailed = vi.fn();
const mockLoadProgressDetailed = vi.fn();

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    ownerId: "legacy-test-owner",
    loadProgressDetailed: mockLoadProgressDetailed,
    saveProgressDetailed: mockSaveProgressDetailed,
  }),
}));

vi.mock("@/features/offline/progressQueue", () => ({
  getQueuedProgress: vi.fn().mockResolvedValue([]),
}));

describe("PersonalSafetyTheory Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadProgressDetailed.mockResolvedValue({ status: "missing", record: null });
    mockSaveProgressDetailed.mockResolvedValue("remote");
    localStorage.clear();
  });

  it("should render the page header with title and navigation back button", () => {
    // when
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // then
    // - title appears in header and overview tab, so use getAllByText
    expect(screen.getAllByText("Personal Safety Equipment").length).toBeGreaterThanOrEqual(1);
    // - header has an icon back button with aria-label="back"
    expect(screen.getByLabelText("back")).toBeDefined();
  });

  it("should render tab navigation with all required theory sections", () => {
    // when
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // then - tabs for all required content areas
    expect(screen.getByRole("tab", { name: /overview/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /buoyancy aids & lifejackets/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /equipment/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /servicing/i })).toBeDefined();
  });

  it("should display overview content about buoyancy aids and lifejackets in the default tab", () => {
    // when
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // then - overview tab content about personal safety
    expect(screen.getAllByText(/buoyancy aid/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/lifejacket/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Level 50 buoyancy aids from Level 100, 150, and 275 lifejackets/i)).toBeDefined();
  });

  it("should display the buoyancy aid and all three lifejacket levels in the inclusive tab (AC-1)", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // when
    const lifeJacketsTab = screen.getByRole("tab", { name: /buoyancy aids & lifejackets/i });
    await user.click(lifeJacketsTab);

    // then - Level 50 remains distinct from the three lifejacket levels
    expect(await screen.findByText("Level 50 Buoyancy Aid")).toBeDefined();
    expect(await screen.findByText("Level 100 Lifejacket")).toBeDefined();
    expect(await screen.findByText("Level 150 Lifejacket")).toBeDefined();
    expect(await screen.findByText("Level 275 Lifejacket")).toBeDefined();
  });

  it("should distinguish all inflation mechanisms and oral backup guidance (AC-1)", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // when
    const lifeJacketsTab = screen.getByRole("tab", { name: /buoyancy aids & lifejackets/i });
    await user.click(lifeJacketsTab);

    // then - inflation method content
    expect(await screen.findByText("Automatic Water-Activated Inflation")).toBeDefined();
    expect(await screen.findByText("Automatic Hydrostatic Inflation")).toBeDefined();
    expect(await screen.findByText("Manual Inflation")).toBeDefined();
    expect(await screen.findByText(/responds to water pressure at a specified immersion depth/i)).toBeDefined();
    expect(await screen.findByText(/resisting activation from rain, spray/i)).toBeDefined();
    expect(await screen.findByText(/oral inflation tube is for topping up.*emergency backup/i)).toBeDefined();
    expect(await screen.findByText(/not a substitute for pulling a manual toggle/i)).toBeDefined();

    await user.click(screen.getByRole("tab", { name: /servicing/i }));
    expect(await screen.findAllByText(/kits and procedures are (?:manufacturer|model)-specific/i)).not.toHaveLength(0);
  });

  it("should cover crotch straps (AC-1)", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // when
    const lifeJacketsTab = screen.getByRole("tab", { name: /buoyancy aids & lifejackets/i });
    await user.click(lifeJacketsTab);

    // then - crotch strap content
    expect(await screen.findByText(/Crotch Strap/)).toBeDefined();
  });

  it("should cover harnesses and tethers in the Equipment tab (AC-1)", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // when
    const equipmentTab = screen.getByRole("tab", { name: /equipment/i });
    await user.click(equipmentTab);

    // then
    expect(await screen.findByText("Harnesses & Tethers")).toBeDefined();
  });

  it("should cover jacklines in the Equipment tab (AC-1)", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // when
    const equipmentTab = screen.getByRole("tab", { name: /equipment/i });
    await user.click(equipmentTab);

    // then
    expect(await screen.findByText("Jacklines")).toBeDefined();
  });

  it("should cover kill cords in the Equipment tab (AC-1)", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // when
    const equipmentTab = screen.getByRole("tab", { name: /equipment/i });
    await user.click(equipmentTab);

    // then
    expect(await screen.findByText("Kill Cords (Engine Cut-Off Devices)")).toBeDefined();
    expect(screen.getByText(/purpose-designed point specified by the manufacturer/i)).toBeDefined();
    expect(screen.getByText(/before setting off.*test the cut-off system/i)).toBeDefined();
    expect(screen.getByText(/carry the correct serviceable spare/i)).toBeDefined();
  });

  it("should not guarantee that a kill cord prevents propeller injury", () => {
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    expect(screen.getByText(/kill cord should stop the engine/i)).toBeDefined();
    expect(screen.getByText(/reducing the risk of an uncontrolled craft and propeller injury/i)).toBeDefined();
    expect(screen.queryByText(/preventing propeller injury/i)).toBeNull();
  });

  it("should display servicing content when clicking the Servicing tab (AC-1)", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // when
    const servicingTab = screen.getByRole("tab", { name: /servicing/i });
    await user.click(servicingTab);

    // then
    expect(await screen.findByText("Servicing & Maintenance")).toBeDefined();
    expect(await screen.findByText("Servicing & Maintenance Schedule")).toBeDefined();
  });

  it("should not call saveProgress automatically on mount (AC-2)", () => {
    // when
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // then - saveProgress should NOT have been called yet
    expect(mockSaveProgressDetailed).not.toHaveBeenCalled();
  });

  it("should render a 'Mark as Complete' button that saves progress when clicked (AC-2, AC-3)", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // when - click the completion button
    const completeButton = await screen.findByRole("button", { name: /mark as complete/i });
    await user.click(completeButton);

    // then - saveProgress called with topic ID, completed=true, score=100, points=10
    expect(mockSaveProgressDetailed).toHaveBeenCalledWith("safety-personal", true, 100, 10);
  });

  it("should disable the completion button after clicking it (AC-2)", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // when
    const completeButton = await screen.findByRole("button", { name: /mark as complete/i });
    await user.click(completeButton);

    // then - button should now show "Completed" and be disabled
    expect(await screen.findByRole("button", { name: /completed/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /completed/i }).hasAttribute("disabled")).toBe(true);
  });

  it("should have a back to safety menu button at the bottom", () => {
    // when
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // then
    expect(
      screen.getByRole("button", { name: /back to safety menu/i }),
    ).toBeDefined();
  });
});
