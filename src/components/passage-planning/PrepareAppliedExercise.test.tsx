import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PREPARE_EXERCISE_REVISION, prepareScenarios } from "@/data/prepareSteps";
import { PrepareAppliedExercise } from "./PrepareAppliedExercise";

describe("PrepareAppliedExercise", () => {
  beforeEach(() => localStorage.clear());
  it("requires every PREPARE objective, remediates unsafe answers, and saves one reviewable artifact", async () => {
    const user = userEvent.setup(); const complete = vi.fn().mockResolvedValue(true);
    render(<PrepareAppliedExercise ownerScope="user:a" onComplete={complete}/>);
    expect(screen.getByRole("button", { name: "Save evidence-based completion" }).hasAttribute("disabled")).toBe(true);
    await user.click(screen.getByRole("button", { name: /forecast printed yesterday/ }));
    expect(screen.getByRole("status").textContent).toMatch(/Not yet.*current inputs/);
    expect(screen.queryByRole("button", { name: prepareScenarios[0].answers[0] })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Reassess this objective" }));
    for (const answer of prepareScenarios[0].answers) await user.click(screen.getByRole("button", { name: answer }));
    expect(screen.getByText("7 of 8")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "go" }));
    expect(screen.getByRole("status").textContent).not.toMatch(/delay|divert|abort/i);
    expect(screen.queryByRole("button", { name: "delay" })).toBeNull();
    expect(screen.getByRole("button", { name: "Save evidence-based completion" }).hasAttribute("disabled")).toBe(true);
    await user.click(screen.getByRole("button", { name: "Reassess the final decision" }));
    await user.click(screen.getByRole("button", { name: "delay" }));
    await user.click(screen.getByRole("button", { name: "Save evidence-based completion" }));
    expect(complete).toHaveBeenCalledTimes(1);
    expect(complete.mock.calls[0][0]).toEqual(expect.objectContaining({ catalogueRevision: PREPARE_EXERCISE_REVISION, scenarioId: "bar-arrival", decision: "delay", responses: prepareScenarios[0].answers }));
    expect(screen.getByRole("button", { name: "Completion saved" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("region", { name: /Reviewable decision record/ })).toBeTruthy();
  });

  it("restores a valid revisioned draft and rejects malformed or stale data", () => {
    localStorage.setItem("prepare-applied-exercise:user:a", JSON.stringify({ catalogueRevision: PREPARE_EXERCISE_REVISION, scenarioId: "visibility-loss", responses: [prepareScenarios[1].answers[0]] }));
    const { unmount } = render(<PrepareAppliedExercise ownerScope="user:a" onComplete={vi.fn()}/>);
    expect(screen.getByText(/Step 2 of 7: Regulations/)).toBeTruthy(); unmount();
    localStorage.setItem("prepare-applied-exercise:user:a", "{bad");
    const malformed = render(<PrepareAppliedExercise ownerScope="user:a" onComplete={vi.fn()}/>);
    expect(screen.getByText(/Step 1 of 7: Passage appraisal/)).toBeTruthy(); malformed.unmount();
    localStorage.setItem("prepare-applied-exercise:user:a", JSON.stringify({ catalogueRevision: "retired", scenarioId: "visibility-loss", responses: prepareScenarios[1].answers }));
    render(<PrepareAppliedExercise ownerScope="user:a" onComplete={vi.fn()}/>);
    expect(screen.getByText(/Step 1 of 7: Passage appraisal/)).toBeTruthy();
  });

  it("keeps retry evidence, supports existing completions, and exposes accessible responsive controls", async () => {
    const user = userEvent.setup(); const complete = vi.fn().mockResolvedValue(false);
    const { rerender } = render(<PrepareAppliedExercise ownerScope="user:a" onComplete={complete}/>);
    for (const answer of prepareScenarios[0].answers) await user.click(screen.getByRole("button", { name: answer }));
    await user.click(screen.getByRole("button", { name: "delay" })); await user.click(screen.getByRole("button", { name: "Save evidence-based completion" }));
    expect(screen.getByRole("status").textContent).toContain("not saved");
    expect(screen.getByText("Reviewable decision record")).toBeTruthy();
    expect(screen.getByText("8 of 8")).toBeTruthy();
    rerender(<PrepareAppliedExercise ownerScope="user:a" alreadyCompleted onComplete={complete}/>);
    expect(screen.getByRole("button", { name: "Completion saved" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(/Route flow/);
    expect(screen.getByRole("button", { name: /Sheltered harbour/ }).className).toContain("min-h-11");
  });

  it("truncates forged restored answers and isolates identity transitions", () => {
    localStorage.setItem("prepare-applied-exercise:user:a", JSON.stringify({ catalogueRevision: PREPARE_EXERCISE_REVISION, scenarioId: "bar-arrival", responses: [prepareScenarios[0].answers[0], "forged", ...prepareScenarios[0].answers.slice(2)], decision: "delay" }));
    localStorage.setItem("prepare-applied-exercise:user:b", JSON.stringify({ catalogueRevision: PREPARE_EXERCISE_REVISION, scenarioId: "visibility-loss", responses: [prepareScenarios[1].answers[0]] }));
    const ownerBDraft = localStorage.getItem("prepare-applied-exercise:user:b");
    const { rerender, unmount } = render(<PrepareAppliedExercise ownerScope="user:a" onComplete={vi.fn()}/>);
    expect(screen.getByText(/Step 2 of 7: Regulations/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save evidence-based completion" }).hasAttribute("disabled")).toBe(true);
    rerender(<PrepareAppliedExercise ownerScope="user:b" onComplete={vi.fn()}/>);
    expect(screen.getByText("Visibility deteriorates near the decision point", { selector: "h3" })).toBeTruthy();
    expect(screen.getByText(/Step 2 of 7: Regulations/)).toBeTruthy();
    expect(screen.queryByText(/Check crew limits/)).toBeNull();
    expect(localStorage.getItem("prepare-applied-exercise:user:b")).toBe(ownerBDraft);
    unmount();
    render(<PrepareAppliedExercise ownerScope="user:b" onComplete={vi.fn()}/>);
    expect(screen.getByText("Visibility deteriorates near the decision point", { selector: "h3" })).toBeTruthy();
    expect(screen.getByText(/Step 2 of 7: Regulations/)).toBeTruthy();
  });

  it("serializes activation and prevents scenario changes while a save is pending", async () => {
    const user = userEvent.setup();
    let resolve!: (value: "remote") => void;
    const complete = vi.fn().mockReturnValue(new Promise<"remote">((done) => { resolve = done; }));
    render(<PrepareAppliedExercise ownerScope="user:a" onComplete={complete}/>);
    for (const answer of prepareScenarios[0].answers) await user.click(screen.getByRole("button", { name: answer }));
    await user.click(screen.getByRole("button", { name: "delay" }));
    const save = screen.getByRole("button", { name: "Save evidence-based completion" });
    await user.click(save); await user.click(save);
    expect(complete).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Visibility deteriorates near the decision point" }).hasAttribute("disabled")).toBe(true);
    for (const decision of ["go", "delay", "divert", "abort"]) expect(screen.getByRole("button", { name: decision }).hasAttribute("disabled")).toBe(true);
    resolve("remote");
    await waitFor(() => expect(screen.getByRole("button", { name: "Completion saved" })).toBeTruthy());
  });

  it.each([
    ["queued", "Retry queued completion", /queued offline/],
    ["failed", "Retry saving completion", /not saved/],
  ] as const)("exposes a %s save outcome with retryable evidence", async (outcome, buttonName, feedback) => {
    localStorage.setItem("prepare-applied-exercise:user:a", JSON.stringify({ catalogueRevision: PREPARE_EXERCISE_REVISION, scenarioId: "bar-arrival", responses: prepareScenarios[0].answers, decision: "delay" }));
    const user = userEvent.setup(); const complete = vi.fn().mockResolvedValue(outcome);
    render(<PrepareAppliedExercise ownerScope="user:a" onComplete={complete}/>);
    await user.click(screen.getByRole("button", { name: "Save evidence-based completion" }));
    expect(await screen.findByRole("button", { name: buttonName })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toMatch(feedback);
    await user.click(screen.getByRole("button", { name: buttonName }));
    expect(complete).toHaveBeenCalledTimes(2);
  });

  it("turns thrown saves into recoverable failure and ignores stale owner results", async () => {
    localStorage.setItem("prepare-applied-exercise:user:a", JSON.stringify({ catalogueRevision: PREPARE_EXERCISE_REVISION, scenarioId: "bar-arrival", responses: prepareScenarios[0].answers, decision: "delay" }));
    const user = userEvent.setup();
    const thrown = vi.fn().mockImplementation(() => { throw new Error("synchronous ambiguity"); });
    const first = render(<PrepareAppliedExercise ownerScope="user:a" onComplete={thrown}/>);
    await user.click(screen.getByRole("button", { name: "Save evidence-based completion" }));
    expect(await screen.findByRole("button", { name: "Retry saving completion" })).toBeTruthy(); first.unmount();

    let resolve!: (value: "remote") => void;
    const delayed = vi.fn().mockReturnValue(new Promise<"remote">((done) => { resolve = done; }));
    const view = render(<PrepareAppliedExercise ownerScope="user:a" onComplete={delayed}/>);
    await user.click(screen.getByRole("button", { name: "Save evidence-based completion" }));
    view.rerender(<PrepareAppliedExercise ownerScope="user:b" onComplete={delayed}/>); resolve("remote");
    await waitFor(() => expect(screen.queryByRole("button", { name: "Completion saved" })).toBeNull());
    view.unmount();

    let resolveAfterUnmount!: (value: "remote") => void;
    const pendingUnmount = vi.fn().mockReturnValue(new Promise<"remote">((done) => { resolveAfterUnmount = done; }));
    const unmounted = render(<PrepareAppliedExercise ownerScope="user:a" onComplete={pendingUnmount}/>);
    await user.click(screen.getByRole("button", { name: "Save evidence-based completion" }));
    unmounted.unmount(); resolveAfterUnmount("remote");
    await waitFor(() => expect(pendingUnmount).toHaveBeenCalledOnce());
  });
});
