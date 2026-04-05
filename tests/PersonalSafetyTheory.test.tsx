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

const mockSaveProgress = vi.fn();

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    saveProgress: mockSaveProgress,
  }),
}));

describe("PersonalSafetyTheory Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(screen.getByRole("tab", { name: /life jackets/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /equipment/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /servicing/i })).toBeDefined();
  });

  it("should display overview content about life jackets in the default tab", () => {
    // when
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // then - overview tab content about personal safety
    // - multiple elements mention "life jacket" across tabs, so use getAllByText
    expect(screen.getAllByText(/life jacket/i).length).toBeGreaterThanOrEqual(1);
    // - buoyancy ratings mentioned in overview text
    expect(screen.getAllByText(/100N/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/150N/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/275N/).length).toBeGreaterThanOrEqual(1);
  });

  it("should display all three life jacket types when clicking the Life Jackets tab (AC-1)", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // when
    const lifeJacketsTab = screen.getByRole("tab", { name: /life jackets/i });
    await user.click(lifeJacketsTab);

    // then - all three buoyancy ratings
    expect(await screen.findByText("100 Newton Buoyancy Aid")).toBeDefined();
    expect(await screen.findByText("150 Newton Life Jacket")).toBeDefined();
    expect(await screen.findByText("275 Newton Life Jacket")).toBeDefined();
  });

  it("should cover auto-inflate vs manual inflation (AC-1)", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <PersonalSafetyTheory />
      </TestRouter>,
    );

    // when
    const lifeJacketsTab = screen.getByRole("tab", { name: /life jackets/i });
    await user.click(lifeJacketsTab);

    // then - inflation method content
    expect(await screen.findByText(/Automatic \(Hydrostatic\) Inflation/)).toBeDefined();
    expect(await screen.findByText("Manual Inflation")).toBeDefined();
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
    const lifeJacketsTab = screen.getByRole("tab", { name: /life jackets/i });
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
    expect(mockSaveProgress).not.toHaveBeenCalled();
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
    const completeButton = screen.getByRole("button", { name: /mark as complete/i });
    await user.click(completeButton);

    // then - saveProgress called with topic ID, completed=true, score=100, points=10
    expect(mockSaveProgress).toHaveBeenCalledWith("safety-personal", true, 100, 10);
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
    const completeButton = screen.getByRole("button", { name: /mark as complete/i });
    await user.click(completeButton);

    // then - button should now show "Completed" and be disabled
    expect(screen.getByRole("button", { name: /completed/i })).toBeDefined();
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
