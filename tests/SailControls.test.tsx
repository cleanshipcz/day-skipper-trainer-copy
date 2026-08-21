import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import SailControls from "../src/pages/SailControls";
import TestRouter from "./TestRouter";

const progressMocks = vi.hoisted(() => ({
  user: null as { id: string } | null,
  loadProgress: vi.fn(),
  loadProgressDetailed: vi.fn(),
  saveProgressDetailed: vi.fn(),
}));

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    loadProgress: progressMocks.loadProgress,
    loadProgressDetailed: progressMocks.loadProgressDetailed,
    saveProgressDetailed: progressMocks.saveProgressDetailed,
  }),
}));

vi.mock("@/contexts/AuthHooks", () => ({
  useAuth: () => ({ user: progressMocks.user }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const answerForCurrentQuestion = () => {
  const clue = screen.getByText(/Which sail control or rig adjustment has this purpose/).nextElementSibling?.textContent ?? "";
  const answers: [string, string][] = [
    ["Raises and lowers the mainsail", "Main Halyard"], ["Raises and lowers the headsail", "Jib Halyard"],
    ["mainsail angle", "Mainsheet"], ["angle of the jib", "Jib Sheet"], ["boom from rising", "Boom Vang"],
    ["lower mainsail", "Outhaul"], ["Moves draft forward", "Cunningham"], ["Supports the boom", "Topping Lift"],
    ["Reduces mainsail area", "Reefing Lines"], ["mainsheet attachment point", "Mainsheet Traveller"],
    ["angle of pull", "Jib Fairlead"], ["Adjusts rig load", "Backstay Adjuster"],
  ];
  const answer = answers.find(([purpose]) => clue.includes(purpose))?.[1];
  expect(answer).toBeTruthy();
  return screen.getByRole("button", { name: answer! });
};

beforeEach(() => {
  progressMocks.user = null;
  progressMocks.loadProgress.mockReset();
  progressMocks.loadProgress.mockResolvedValue(null);
  progressMocks.loadProgressDetailed.mockReset();
  progressMocks.loadProgressDetailed.mockResolvedValue({ status: "missing", record: null });
  progressMocks.saveProgressDetailed.mockReset();
  progressMocks.saveProgressDetailed.mockResolvedValue("remote");
});

const finishQuiz = () => {
  fireEvent.click(screen.getByRole("button", { name: "Start Quiz" }));
  for (let question = 1; question <= 12; question += 1) {
    fireEvent.click(answerForCurrentQuestion());
    act(() => vi.advanceTimersByTime(1000));
  }
};

describe("SailControls schematic geometry", () => {
  it.each([
    ["remote", "Completion saved to your account."],
    ["queued", "Completion saved offline and queued to sync."],
    ["failed", "Completion is still available here, but could not be saved."],
  ])("surfaces the %s durable completion outcome", async (result, message) => {
    vi.useFakeTimers();
    progressMocks.user = { id: "user-a" };
    progressMocks.saveProgressDetailed.mockResolvedValue(result);
    render(<TestRouter><SailControls /></TestRouter>);
    await act(async () => { await Promise.resolve(); });

    finishQuiz();
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByTestId("durable-status").textContent).toBe(message);
    expect(progressMocks.saveProgressDetailed).toHaveBeenCalledTimes(1);
    if (result === "failed") {
      progressMocks.saveProgressDetailed.mockResolvedValueOnce("remote");
      fireEvent.click(screen.getByRole("button", { name: "Retry saving" }));
      await act(async () => { await Promise.resolve(); });
      expect(screen.getByTestId("durable-status").textContent).toBe("Completion saved to your account.");
      expect(progressMocks.saveProgressDetailed).toHaveBeenCalledTimes(2);
    }
    vi.useRealTimers();
  });

  it("waits for hydration and restores a valid returning completion", async () => {
    let resolveLoad!: (value: unknown) => void;
    progressMocks.user = { id: "user-a" };
    progressMocks.loadProgressDetailed.mockReturnValue(new Promise((resolve) => { resolveLoad = resolve; }));
    render(<TestRouter><SailControls /></TestRouter>);

    expect(screen.getByRole("button", { name: "Loading progress…" }).hasAttribute("disabled")).toBe(true);
    resolveLoad({ status: "remote", record: { user_id: "user-a", topic_id: "nautical-terms-sail-controls", completed: true, score: 100, answers_history: { module: "sail-controls", version: 1, score: 120 } } });

    await waitFor(() => expect(screen.getByRole("heading", { name: "Quiz Complete!" })).toBeTruthy());
    expect(screen.getByText(/A completion is saved to your account/)).toBeTruthy();
    expect(progressMocks.saveProgressDetailed).not.toHaveBeenCalled();
  });

  it("uses a valid durable completion while safely ignoring its malformed or stale payload", async () => {
    progressMocks.user = { id: "user-a" };
    progressMocks.loadProgressDetailed.mockResolvedValue({ status: "remote", record: {
      completed: true,
      score: 100,
      user_id: "user-a",
      topic_id: "nautical-terms-sail-controls",
      answers_history: { module: "sail-controls", version: 0, score: 120 },
    } });
    render(<TestRouter><SailControls /></TestRouter>);

    await waitFor(() => expect(screen.getByRole("heading", { name: "Quiz Complete!" })).toBeTruthy());
    expect(screen.getByText(/Final Score:/).textContent).toContain("120");
    expect(progressMocks.saveProgressDetailed).not.toHaveBeenCalled();
  });

  it("distinguishes a failed load and retries it", async () => {
    progressMocks.user = { id: "user-a" };
    progressMocks.loadProgressDetailed
      .mockResolvedValueOnce({ status: "failed", record: null })
      .mockResolvedValueOnce({ status: "missing", record: null });
    render(<TestRouter><SailControls /></TestRouter>);

    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.getByText(/could not be loaded/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry loading progress" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Start Quiz" })).toBeTruthy());
    expect(progressMocks.loadProgressDetailed).toHaveBeenCalledTimes(2);
  });

  it("does not claim a retake replaced an already durable completion", async () => {
    vi.useFakeTimers();
    progressMocks.user = { id: "user-a" };
    progressMocks.loadProgressDetailed.mockResolvedValue({ status: "remote", record: {
      user_id: "user-a", topic_id: "nautical-terms-sail-controls", completed: true, score: 100,
      answers_history: { module: "sail-controls", version: 1, score: 120 },
    } });
    progressMocks.saveProgressDetailed.mockResolvedValue("remote");
    render(<TestRouter><SailControls /></TestRouter>);
    await act(async () => { await Promise.resolve(); });

    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
    for (let question = 1; question <= 12; question += 1) {
      fireEvent.click(answerForCurrentQuestion());
      act(() => vi.advanceTimersByTime(1000));
    }
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByTestId("durable-status").textContent).toBe(
      "A completion is saved to your account. Retakes do not replace that durable record."
    );
    expect(progressMocks.saveProgressDetailed).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("tracks a confirmed first save so its immediate retake is described as preserved", async () => {
    vi.useFakeTimers();
    progressMocks.user = { id: "user-a" };
    progressMocks.loadProgressDetailed.mockResolvedValue({ status: "missing", record: null });
    progressMocks.saveProgressDetailed.mockResolvedValue("remote");
    render(<TestRouter><SailControls /></TestRouter>);
    await act(async () => { await Promise.resolve(); });

    finishQuiz();
    await act(async () => { await Promise.resolve(); });
    expect(screen.getByTestId("durable-status").textContent).toBe("Completion saved to your account.");

    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
    for (let question = 1; question <= 12; question += 1) {
      fireEvent.click(answerForCurrentQuestion());
      act(() => vi.advanceTimersByTime(1000));
    }
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByTestId("durable-status").textContent).toBe(
      "A completion is saved to your account. Retakes do not replace that durable record."
    );
    expect(progressMocks.saveProgressDetailed).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("describes a confirmed save conservatively when the earlier load failed", async () => {
    vi.useFakeTimers();
    progressMocks.user = { id: "user-a" };
    progressMocks.loadProgressDetailed.mockResolvedValue({ status: "failed", record: null });
    progressMocks.saveProgressDetailed.mockResolvedValue("remote");
    render(<TestRouter><SailControls /></TestRouter>);
    await act(async () => { await Promise.resolve(); });
    expect(screen.getByRole("alert")).toBeTruthy();

    finishQuiz();
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByTestId("durable-status").textContent).toBe(
      "A completion is saved to your account. Because earlier progress may already exist or have synced, this may be the previously saved record."
    );
    vi.useRealTimers();
  });

  it("treats a queued completion as potentially replayed before a retake saves", async () => {
    vi.useFakeTimers();
    progressMocks.user = { id: "user-a" };
    progressMocks.loadProgressDetailed.mockResolvedValue({ status: "missing", record: null });
    progressMocks.saveProgressDetailed
      .mockResolvedValueOnce("queued")
      .mockResolvedValueOnce("remote");
    render(<TestRouter><SailControls /></TestRouter>);
    await act(async () => { await Promise.resolve(); });

    finishQuiz();
    await act(async () => { await Promise.resolve(); });
    expect(screen.getByTestId("durable-status").textContent).toBe("Completion saved offline and queued to sync.");

    // The queue may replay between these two user actions; the component must
    // not claim that the retake created a brand-new durable record.
    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
    for (let question = 1; question <= 12; question += 1) {
      fireEvent.click(answerForCurrentQuestion());
      act(() => vi.advanceTimersByTime(1000));
    }
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByTestId("durable-status").textContent).toBe(
      "A completion is saved to your account. Because earlier progress may already exist or have synced, this may be the previously saved record."
    );
    expect(progressMocks.saveProgressDetailed).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
  it("preserves safety-critical taxonomy and trim guidance", () => {
    const { container } = render(<TestRouter><SailControls /></TestRouter>);

    expect(screen.getAllByText("Deck hardware")).toHaveLength(2);
    expect(screen.getAllByText("Standing-rigging adjustment")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Show Cunningham details from control list" }));
    expect(screen.getByText(/Unlike a conventional mainsail downhaul/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Show Reefing Lines details from control list" }));
    expect(screen.getByText(/Arrangements vary/)).toBeTruthy();
    expect(screen.getByText(/ties only gather loose sail.*must not carry sail load/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Show Mainsheet Traveller details from control list" }));
    expect(screen.getByText(/Leeward lets the boom and sail plan move off centre.*largely retaining mainsheet-set leech tension/i)).toBeTruthy();
    expect(screen.queryByText(/traveller.*opens the leech/i)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show Boom Vang details from control list" }));
    expect(screen.getByText(/On this diagram, an adjustable tackle/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Show Topping Lift details from control list" }));
    expect(screen.getByText(/On this diagram, an adjustable line/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Show Jib Sheet details from control list" }));
    expect(screen.getByText(/over-trimming.*stall airflow/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Show Jib Fairlead details from control list" }));
    expect(screen.getByText(/Forward.*leech.*aft.*opens the leech/i)).toBeTruthy();
  });

  it("aligns the generated yacht plate with the jib halyard and aft-running sheet/fairlead overlays", () => {
    const { container } = render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );

    const plate = container.querySelector('[data-yacht-plate="cruising-sloop-controls"]');
    const jibHalyard = container.querySelector('[data-control-id="jib-halyard"]');
    const jibSheet = container.querySelector('[data-control-id="jib-sheet"]');
    const fairlead = container.querySelector('[data-control-id="jib-fairlead"]');

    expect(plate?.getAttribute("href")).toBe("/images/sail-controls/cruising-sloop-controls.png");
    expect(plate?.getAttribute("width")).toBe("600");
    expect(plate?.getAttribute("height")).toBe("700");
    expect(jibHalyard?.querySelector('[data-control-artwork="jib-halyard"]')?.getAttribute("d")).toBe("M340 464 L340 51 L332 35");
    expect(jibSheet?.querySelector("circle")?.getAttribute("cx")).toBe("520");
    expect(jibSheet?.querySelector("circle")?.getAttribute("cy")).toBe("530");

    const sheetPoints = jibSheet
      ?.querySelector('[data-control-artwork="jib-sheet"]')
      ?.getAttribute("points")
      ?.split(" ")
      .map((point) => point.split(",").map(Number));
    const fairleadPath = fairlead?.querySelector('[data-control-artwork="jib-fairlead"]')?.getAttribute("d");

    expect(sheetPoints).toHaveLength(2);
    expect(sheetPoints?.[0]).toEqual([520, 530]);
    expect(sheetPoints?.[1]).toEqual([480, 548]);
    expect(fairleadPath).toBe("M430 570 L404 579");
  });

  it("preserves mobile scale and provides effective touch targets for every diagram control", () => {
    const { container } = render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );

    const schematic = container.querySelector('[data-schematic-scroll] svg');
    const touchTargets = container.querySelectorAll("[data-touch-target]");

    expect(container.querySelector("[data-schematic-scroll]")?.classList.contains("overflow-x-auto")).toBe(true);
    expect(schematic?.classList.contains("min-w-[600px]")).toBe(true);
    expect(schematic?.classList.contains("md:min-w-0")).toBe(true);
    expect(schematic?.getAttribute("aria-describedby")).toBe("sail-controls-diagram-help");
    expect(touchTargets).toHaveLength(12);
    touchTargets.forEach((target) => {
      const polygons = target.getAttribute("data-hit-polygons")
        ?.split("|")
        .flatMap((polygon) => polygon.split(" ").map((pair) => pair.split(",").map(Number)));
      expect(polygons?.length).toBeGreaterThanOrEqual(4);
      const xs = polygons!.map(([x]) => x);
      const ys = polygons!.map(([, y]) => y);
      expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThanOrEqual(44);
      expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThanOrEqual(44);
      expect(target.getAttribute("d")).toMatch(/^M.+Z/);
      expect(target.getAttribute("fill")).toBe("transparent");
    });
  });

  it.each([375, 768, 1280])("keeps the %ipx schematic in a bounded responsive scroller", (width) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    const { container } = render(<TestRouter><SailControls /></TestRouter>);

    const scroller = container.querySelector("[data-schematic-scroll]");
    const svg = scroller?.querySelector("svg");
    expect(scroller?.className).toContain("w-full");
    expect(scroller?.className).toContain("overflow-x-auto");
    expect(scroller?.className).toContain("overscroll-x-contain");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 600 700");
    expect(svg?.querySelectorAll("text")).toHaveLength(0);
    expect(svg?.querySelector('[data-yacht-plate="cruising-sloop-controls"]')).not.toBeNull();
  });

  it("places selected details after the diagram instead of over it", () => {
    const { container } = render(<TestRouter><SailControls /></TestRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Show Main Halyard details from diagram" }));

    const scroller = container.querySelector("[data-schematic-scroll]");
    const details = container.querySelector("[data-control-details]");
    expect(details).not.toBeNull();
    expect(details?.className).not.toContain("absolute");
    expect(scroller?.compareDocumentPosition(details!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("keeps touch, click, and highlight behavior on the relocated sheet and fairlead", () => {
    const { container } = render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );

    const jibSheet = container.querySelector<SVGGElement>('[data-control-id="jib-sheet"]');
    const fairleadTarget = container.querySelector<SVGPathElement>('[data-touch-target="jib-fairlead"]');
    const mainHalyard = container.querySelector('[data-touch-target="main-halyard"]')?.parentElement;

    expect(jibSheet).not.toBeNull();
    expect(fairleadTarget).not.toBeNull();
    fireEvent.mouseEnter(jibSheet!);
    expect(jibSheet?.getAttribute("opacity")).toBe("1");
    expect(mainHalyard?.getAttribute("opacity")).toBe("0.22");

    fireEvent.mouseLeave(jibSheet!);
    fireEvent.click(fairleadTarget!);
    expect(screen.getByText("Sets the angle of pull on the jib sheet")).toBeTruthy();
  });

  it("exposes distinct keyboard controls for the diagram and control list", () => {
    render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );

    const diagramControls = screen.getAllByRole("button", { name: /details from diagram/i });
    const listControls = screen.getAllByRole("button", { name: /details from control list/i });
    expect(diagramControls).toHaveLength(12);
    expect(listControls).toHaveLength(12);

    const mainHalyard = screen.getByRole("button", { name: "Show Main Halyard details from diagram" });
    fireEvent.focus(mainHalyard);
    fireEvent.keyDown(mainHalyard, { key: "Enter" });
    expect(screen.getByText("Raises and lowers the mainsail")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close Main Halyard details" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Close Main Halyard details" }));
    const jibHalyard = screen.getByRole("button", { name: "Show Jib Halyard details from control list" });
    fireEvent.keyDown(jibHalyard, { key: " " });
    expect(screen.getByText("Raises and lowers the headsail (jib/genoa)")).toBeTruthy();
  });

  it("provides named navigation and programmatic quiz progress and feedback", () => {
    render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );

    expect(screen.getByRole("button", { name: "Back to nautical terms" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Start Quiz" }));

    const progress = screen.getByRole("progressbar", { name: "Quiz progress" });
    expect(progress.getAttribute("aria-valuenow")).toBe("0");
    expect(progress.getAttribute("aria-valuetext")).toBe("0 of 12 questions completed");
    expect(screen.getByRole("status").textContent).toContain("Question 1 of 12");

    const answers = screen.getAllByRole("button").filter((button) =>
      ["Main Halyard", "Jib Halyard", "Mainsheet", "Jib Sheet", "Boom Vang", "Outhaul", "Cunningham", "Topping Lift", "Reefing Lines", "Mainsheet Traveller", "Jib Fairlead", "Backstay Adjuster"].includes(button.textContent ?? "")
    );
    fireEvent.click(answers[0]);
    expect(screen.getByRole("status").textContent).toMatch(/Correct|Incorrect/);
  });

  it("moves focus across timed quiz transitions and uses one accessible feedback channel", () => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    const answersByPurpose = new Map([
      ["Raises and lowers the mainsail", "Main Halyard"],
      ["Raises and lowers the headsail (jib/genoa)", "Jib Halyard"],
      ["Controls mainsail angle and, especially upwind, leech tension and twist", "Mainsheet"],
      ["Controls the angle of the jib/genoa", "Jib Sheet"],
      ["Prevents boom from rising, controls sail twist", "Boom Vang"],
      ["Flattens or adds fullness to lower mainsail", "Outhaul"],
      ["Moves draft forward, tensions luff", "Cunningham"],
      ["Supports the boom when mainsail is down", "Topping Lift"],
      ["Reduces mainsail area for heavy weather", "Reefing Lines"],
      ["Positions the mainsheet attachment point across the boat", "Mainsheet Traveller"],
      ["Sets the angle of pull on the jib sheet", "Jib Fairlead"],
      ["Adjusts rig load, mast bend and forestay sag where the rig permits", "Backstay Adjuster"],
    ]);

    render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Start Quiz" }));

    const answerCurrentQuestion = () => {
      const clue = screen.getByText(/Which sail control or rig adjustment has this purpose/).nextElementSibling?.textContent ?? "";
      const answer = [...answersByPurpose].find(([purpose]) => clue.includes(purpose))?.[1];
      expect(answer).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: answer! }));
    };

    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Question 1 of 12" }));
    answerCurrentQuestion();
    expect(screen.getByRole("status").textContent).toContain("Next: question 2 of 12");
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1000));
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Question 2 of 12" }));

    for (let question = 2; question <= 12; question += 1) {
      answerCurrentQuestion();
      act(() => vi.advanceTimersByTime(1000));
    }

    const completionHeading = screen.getByRole("heading", { name: "Quiz Complete!" });
    expect(document.activeElement).toBe(completionHeading);
    expect(screen.getByRole("status").textContent).toMatch(/Quiz complete\. Final score:/);
    expect(screen.getByText("Completed on this device. Sign in to save your progress.")).toBeTruthy();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Review Controls" }));
    expect(screen.getByRole("button", { name: "Start Quiz" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Start Quiz" }));
    expect(screen.getByRole("heading", { name: "Question 1 of 12" })).toBeTruthy();
    vi.useRealTimers();
  });

  it("invalidates a correct-answer transition across reset and restart", () => {
    vi.useFakeTimers();
    render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Start Quiz" }));
    fireEvent.click(answerForCurrentQuestion());
    expect(screen.getByLabelText("Score: 10 points")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    fireEvent.click(screen.getByRole("button", { name: "Start Quiz" }));
    act(() => vi.advanceTimersByTime(1000));

    expect(screen.getByRole("heading", { name: "Question 1 of 12" })).toBeTruthy();
    expect(screen.getByLabelText("Score: 0 points")).toBeTruthy();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });

  it("cancels a pending transition on navigation and unmount", () => {
    vi.useFakeTimers();
    const first = render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Start Quiz" }));
    fireEvent.click(answerForCurrentQuestion());
    expect(vi.getTimerCount()).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: "Back to nautical terms" }));
    expect(vi.getTimerCount()).toBe(0);
    first.unmount();

    const second = render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Start Quiz" }));
    fireEvent.click(answerForCurrentQuestion());
    expect(vi.getTimerCount()).toBe(1);
    second.unmount();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });

  it("scores and schedules only once for repeated correct activation", () => {
    vi.useFakeTimers();
    render(<TestRouter><SailControls /></TestRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Start Quiz" }));
    const button = answerForCurrentQuestion();
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.getByLabelText("Score: 10 points")).toBeTruthy();
    expect(vi.getTimerCount()).toBe(1);
    vi.useRealTimers();
  });

  it("assesses purpose-to-name recall across all 12 questions without revealing labels in a diagram", () => {
    vi.useFakeTimers();
    const { container } = render(<TestRouter><SailControls /></TestRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Start Quiz" }));

    expect(screen.getByText("Match each purpose to the correct sail control or rig adjustment")).toBeTruthy();
    expect(container.querySelector("[data-control-id]")).toBeNull();

    const seenPurposes = new Set<string>();
    for (let question = 1; question <= 12; question += 1) {
      const prompt = screen.getByText("Which sail control or rig adjustment has this purpose?");
      const purpose = prompt.nextElementSibling?.textContent?.replaceAll('"', "") ?? "";
      expect(purpose).toBeTruthy();
      seenPurposes.add(purpose);
      fireEvent.click(answerForCurrentQuestion());
      act(() => vi.advanceTimersByTime(1000));
    }

    expect(seenPurposes.size).toBe(12);
    expect(screen.getByRole("heading", { name: "Quiz Complete!" })).toBeTruthy();
    vi.useRealTimers();
  });
});
