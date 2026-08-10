import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import VectorTriangleTool from "@/pages/VectorTriangleTool";

vi.mock("@/features/progress/TheoryCompletionButton", () => ({ TheoryCompletionButton: ({ evidenceSatisfied, lockedLabel }: { evidenceSatisfied: boolean; lockedLabel: string }) => <div data-testid="completion">{evidenceSatisfied ? "mastered" : lockedLabel}</div> }));

describe("VectorTriangleTool drill", () => {
  const enterCorrectFirstScenarioHeading = async (user: ReturnType<typeof userEvent.setup>) => {
    const heading = screen.getByRole("slider", { name: /course to steer/i });
    heading.focus();
    await user.keyboard("{End}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}");
  };

  it("withholds the resultant before submission and gives progressive, announced feedback", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><VectorTriangleTool /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: /Start "Find the Heading" Drill/i }));

    expect(screen.getByText(/Result hidden until you check/i)).toBeTruthy();
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("result is hidden");
    expect(screen.getByRole("slider", { name: /course to steer/i }).getAttribute("aria-valuetext")).toContain("degrees true");
    expect(screen.getByTestId("completion").textContent).toContain("Master 3");

    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("alert").textContent).toContain("error of");
    expect(screen.queryByText(/Worked reasoning:/i)).toBeNull();
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("result is shown");

    await user.click(screen.getByRole("button", { name: "Check revised answer" }));
    expect(screen.getByRole("alert").textContent).toContain("Worked reasoning:");
    expect(screen.getByText(/Attempts on this scenario: 2/i)).toBeTruthy();
  });

  it("does not award mastery twice for the same scenario after exit and re-entry", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><VectorTriangleTool /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: /Start "Find the Heading" Drill/i }));
    await enterCorrectFirstScenarioHeading(user);
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText(/Mastery: 1 of 3/i)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Exit Drill Mode" }));
    await user.click(screen.getByRole("button", { name: /Start "Find the Heading" Drill/i }));
    await enterCorrectFirstScenarioHeading(user);
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText(/Mastery: 1 of 3/i)).toBeTruthy();
    expect(screen.getByTestId("completion").textContent).toContain("Master 3");
  });
});
