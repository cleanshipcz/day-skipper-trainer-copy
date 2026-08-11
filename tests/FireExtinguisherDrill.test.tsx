import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FireExtinguisherDrill } from "../src/components/safety/FireExtinguisherDrill";
import { fireResponseScenarios } from "../src/data/fireExtinguishers";
import TestRouter from "./TestRouter";
import { toast } from "sonner";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("FireExtinguisherDrill", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders a fire scenario with decision-sequence options", () => {
    // when
    render(
      <TestRouter>
        <FireExtinguisherDrill onComplete={vi.fn()} />
      </TestRouter>
    );

    // then - should show a fire scenario description
    expect(screen.getByTestId("fire-scenario")).toBeDefined();

    // then - should show extinguisher options to choose from
    const options = screen.getAllByTestId(/^response-option-/);
    expect(options.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText(/assesses decisions and sequence/i)).toBeDefined();
    expect(screen.getByText(/does not ask you to match extinguisher/i)).toBeDefined();
  });

  it("should display feedback when an extinguisher is selected and submitted", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <FireExtinguisherDrill onComplete={vi.fn()} />
      </TestRouter>
    );

    // when - select an option and submit
    const options = screen.getAllByTestId(/^response-option-/);
    await user.click(options[0]);

    const submitButton = screen.getByRole("button", { name: /^check answer$/i });
    await user.click(submitButton);

    // then - should show a result (correct or incorrect)
    expect(screen.getByTestId("drill-result")).toBeDefined();
    expect(screen.getByTestId("drill-result").textContent).toMatch(/people|alongside|evacuation|vessel|smoke/i);
  });

  it("should allow advancing to next scenario after answering", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <FireExtinguisherDrill onComplete={vi.fn()} />
      </TestRouter>
    );

    // when - select an option and submit
    const options = screen.getAllByTestId(/^response-option-/);
    await user.click(options[0]);
    const submitButton = screen.getByRole("button", { name: /^check answer$/i });
    await user.click(submitButton);

    // then - should show a "next" button to advance
    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeDefined();
  });

  it("should track score across multiple scenarios", () => {
    // when
    render(
      <TestRouter>
        <FireExtinguisherDrill onComplete={vi.fn()} />
      </TestRouter>
    );

    // then - should display score tracking
    expect(screen.getByTestId("drill-score")).toBeDefined();
  });

  it("commits one answer for duplicate activation and exposes native single-choice semantics", () => {
    render(<TestRouter><FireExtinguisherDrill onComplete={vi.fn()} /></TestRouter>);
    const radios = screen.getAllByRole("radio");
    expect(new Set(radios.map((radio) => radio.getAttribute("name"))).size).toBe(1);
    fireEvent.click(radios[0]);
    const submit = screen.getByRole("button", { name: /^check answer$/i });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(screen.getByTestId("drill-score").textContent).toMatch(/\/ 1/);
    expect(vi.mocked(toast.success).mock.calls.length + vi.mocked(toast.error).mock.calls.length).toBe(1);
    expect(screen.getByTestId("drill-result").getAttribute("role")).toBe("status");
  });

  it.each([
    ["forged counters", { version: 2, scenarioIds: fireResponseScenarios.map((scenario) => scenario.id), answers: [], currentIndex: fireResponseScenarios.length, answered: false, selectedOptionId: null, correctCount: 99, totalAnswered: 99 }],
    ["duplicate scenario ids", { version: 2, scenarioIds: fireResponseScenarios.map(() => fireResponseScenarios[0].id), answers: [], currentIndex: 0, answered: false, selectedOptionId: null }],
    ["tampered answer ledger", { version: 2, scenarioIds: fireResponseScenarios.map((scenario) => scenario.id), answers: [{ scenarioId: fireResponseScenarios[0].id, optionId: "not-an-option" }], currentIndex: 0, answered: true, selectedOptionId: "not-an-option" }],
  ])("fails closed for %s in persisted drill state", (_label, persisted) => {
    localStorage.setItem("fire-test", JSON.stringify(persisted));
    const onComplete = vi.fn();
    render(<TestRouter><FireExtinguisherDrill storageKey="fire-test" onComplete={onComplete} /></TestRouter>);
    expect(screen.getByTestId("drill-score").textContent).toMatch(/0 \/ 0/);
    expect(screen.getByText(/Question 1 of/i)).toBeDefined();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("does not treat a valid-shape all-correct restored ledger as a trusted completion", () => {
    const scenarioIds = fireResponseScenarios.map((scenario) => scenario.id);
    localStorage.setItem("forged-complete", JSON.stringify({ version: 2, scenarioIds, answers: fireResponseScenarios.map((scenario) => ({ scenarioId: scenario.id, optionId: scenario.correctOptionId })), currentIndex: scenarioIds.length, answered: false, selectedOptionId: null }));
    const onComplete = vi.fn();
    render(<TestRouter><FireExtinguisherDrill storageKey="forged-complete" onComplete={onComplete} /></TestRouter>);
    expect(screen.getByText(/restored practice evidence/i)).toBeDefined();
    expect(screen.getByText(/cannot establish a trusted pass or award points/i)).toBeDefined();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("reports local persistence failure and offers an accessible retry", async () => {
    const setItem = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => { throw new DOMException("quota", "QuotaExceededError"); });
    render(<TestRouter><FireExtinguisherDrill storageKey="blocked" onComplete={vi.fn()} /></TestRouter>);
    expect((await screen.findByRole("alert")).textContent).toMatch(/could not be saved/i);
    expect(screen.getByRole("button", { name: /retry local save/i })).toBeDefined();
    setItem.mockRestore();
  });

  it("reports a successful local retry to the parent without replaying completion itself", async () => {
    const user = userEvent.setup();
    const setItem = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => { throw new DOMException("quota", "QuotaExceededError"); });
    const onComplete = vi.fn();
    const onPersistenceRecovered = vi.fn();
    render(<TestRouter><FireExtinguisherDrill storageKey="recover" onComplete={onComplete} onPersistenceRecovered={onPersistenceRecovered} /></TestRouter>);
    for (let i = 0; i < fireResponseScenarios.length; i++) {
      await user.click(screen.getAllByRole("radio")[0]);
      await user.click(screen.getByRole("button", { name: /^check answer$/i }));
      await user.click(screen.getByRole("button", { name: /next scenario/i }));
    }
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0].browserPersisted).toBe(false);
    setItem.mockRestore();
    await user.click(screen.getByRole("button", { name: /retry local save/i }));
    expect(onPersistenceRecovered).toHaveBeenCalledTimes(1);
    expect(onPersistenceRecovered.mock.calls[0][0].browserPersisted).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("should render a reset button to restart the drill", () => {
    // when
    render(
      <TestRouter>
        <FireExtinguisherDrill onComplete={vi.fn()} />
      </TestRouter>
    );

    // then
    expect(screen.getByRole("button", { name: /reset|restart/i })).toBeDefined();
  });

  // M3: Test drill completion screen
  it("should render the completion screen with final score after all scenarios", async () => {
    // given
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <TestRouter>
        <FireExtinguisherDrill onComplete={onComplete} />
      </TestRouter>
    );

    // when - answer all scenarios by selecting any option and advancing
    for (let i = 0; i < fireResponseScenarios.length; i++) {
      const options = screen.getAllByTestId(/^response-option-/);
      await user.click(options[0]);
      const submitButton = screen.getByRole("button", { name: /^check answer$/i });
      await user.click(submitButton);
      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);
    }

    // then - should show "Drill Complete!" completion screen
    expect(screen.getByText("Drill Complete!")).toBeDefined();
    expect(screen.getByTestId("drill-score")).toBeDefined();
    expect(screen.getByRole("button", { name: /restart/i })).toBeDefined();
  });

  // H1: Test that onComplete callback is invoked when drill finishes
  it("should call onComplete with correctCount and totalAnswered when drill finishes", async () => {
    // given
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <TestRouter>
        <FireExtinguisherDrill onComplete={onComplete} />
      </TestRouter>
    );

    // when - answer all scenarios
    for (let i = 0; i < fireResponseScenarios.length; i++) {
      const options = screen.getAllByTestId(/^response-option-/);
      await user.click(options[0]);
      const submitButton = screen.getByRole("button", { name: /^check answer$/i });
      await user.click(submitButton);
      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);
    }

    // then - onComplete should have been called with score info
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        correctCount: expect.any(Number),
        totalAnswered: fireResponseScenarios.length,
      })
    );
  });
});
