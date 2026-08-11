import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { buildQuizSessionProgress } from "@/features/quiz/sessionProgress";

const mocks = vi.hoisted(() => ({
  loadProgress: vi.fn(),
  saveProgress: vi.fn(),
  resetProgress: vi.fn(),
  loadQuizTopic: vi.fn(),
  rpc: vi.fn(),
  user: null as { id: string } | null,
}));

vi.mock("@/contexts/AuthHooks", () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock("@/hooks/useProgress", () => ({ useProgress: () => mocks }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: mocks.rpc } }));
vi.mock("@/data/quizzes", () => ({
  isQuizTopicId: (topic: string) => ["test", "anchorwork", "engine", "nautical-terms-quiz", "ropework", "lights-signals", "colregs", "weather", "safety-mob-quiz"].includes(topic),
  topicMeta: {
    test: { title: "A very long localized quiz title that must reflow", subtitle: "Long localized supporting text" },
    "nautical-terms-quiz": { title: "Full Nautical Terms Quiz", subtitle: "Terms" },
    ropework: { title: "Ropework Quiz", subtitle: "Knots" },
    "lights-signals": { title: "Lights & Signals Mastery", subtitle: "Signals" },
    anchorwork: { title: "Anchorwork Quiz", subtitle: "Anchoring" },
    engine: { title: "Engine Checks Quiz", subtitle: "Engine safety" },
    colregs: { title: "Combined Rules Diagnostic", subtitle: "Rules" },
    weather: { title: "Meteorology Quiz", subtitle: "Weather" },
    "safety-mob-quiz": { title: "Man Overboard Applied Recovery Check", subtitle: "12 applied scenarios" },
  },
  loadQuizTopic: mocks.loadQuizTopic,
}));

import Quiz from "./Quiz";

const questions = [
  { id: "q1", question: "First deliberately long localized question withoutshortbreakpoints?", options: ["First wrong", "First correct answer with exceptionallylonglocalizedcontent"], correctAnswer: 1, explanation: "First explanation with exceptionallylonglocalizedcontent." },
  { id: "q2", question: "Second question?", options: ["Second wrong", "Second correct"], correctAnswer: 1, explanation: "Second explanation." },
];

const LocationProbe = () => {
  const location = useLocation();
  return <p>Current path: {location.pathname}</p>;
};
const TopicSwitcher = () => {
  const navigate = useNavigate();
  return <button onClick={() => navigate("/quiz/ropework")}>Switch quiz topic</button>;
};

const QuizTree = ({ path = "/quiz/test" }: { path?: string }) => (
  <MemoryRouter initialEntries={[path]}>
    <TopicSwitcher />
    <Routes>
      <Route path="/quiz/:topicId" element={<Quiz />} />
      <Route path="*" element={<LocationProbe />} />
    </Routes>
  </MemoryRouter>
);
const renderQuiz = (path = "/quiz/test") => render(<QuizTree path={path} />);

describe("Quiz accessible interaction and reflow", () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.loadProgress.mockReset().mockResolvedValue(null);
    mocks.saveProgress.mockReset().mockResolvedValue(true);
    mocks.resetProgress.mockReset().mockResolvedValue(true);
    mocks.loadQuizTopic.mockReset().mockResolvedValue(questions);
    mocks.rpc.mockReset().mockResolvedValue({ data: null, error: null });
    mocks.user = null;
  });

  it.each([
    ["/quiz/nautical-terms-quiz", "Back to Nautical Terms & Boat Parts from Full Nautical Terms Quiz", "/nautical-terms"],
    ["/quiz/nautical-terms", "Back to Nautical Terms & Boat Parts from Full Nautical Terms Quiz", "/nautical-terms"],
    ["/quiz/ropework", "Back to Ropework & Knots from Ropework Quiz", "/ropework"],
    ["/quiz/lights-signals", "Back to Lights & Signals Theory from Lights & Signals Mastery", "/rules/lights"],
    ["/quiz/engine", "Back to Engine Checks & Maintenance from Engine Checks Quiz", "/engine"],
    ["/quiz/weather", "Back to Meteorology from Meteorology Quiz", "/weather"],
  ])("returns active and legacy quiz routes to their registered parent", async (path, backName, expectedPath) => {
    const user = userEvent.setup();
    renderQuiz(path);
    await user.click(await screen.findByRole("button", { name: backName }));
    expect(await screen.findByText(`Current path: ${expectedPath}`)).toBeTruthy();
  });

  it("routes a missed anchorwork quiz skill to its rendered theory remediation", async () => {
    const user = userEvent.setup();
    mocks.loadQuizTopic.mockResolvedValue([{ ...questions[0], id: "a2" }]);
    const SearchProbe = () => { const location = useLocation(); return <p>Route: {location.pathname}{location.search}</p>; };
    render(<MemoryRouter initialEntries={["/quiz/anchorwork?returnTopic=types"]}><Routes><Route path="/quiz/:topicId" element={<Quiz />} /><Route path="*" element={<SearchProbe />} /></Routes></MemoryRouter>);
    await user.click(await screen.findByRole("radio", { name: "First wrong" }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    await user.click(await screen.findByRole("button", { name: "View Results" }));
    await user.click(await screen.findByRole("button", { name: "Review missed anchorwork skill" }));
    expect(await screen.findByText("Route: /anchorwork?topic=procedure&from=quiz")).toBeTruthy();
  });

  it("routes a missed Engine objective to its stable theory section", async () => {
    const user = userEvent.setup();
    mocks.loadQuizTopic.mockResolvedValue([{ ...questions[0], id: "e13" }]);
    const HashProbe = () => { const location = useLocation(); return <p>Route: {location.pathname}{location.hash}</p>; };
    render(<MemoryRouter initialEntries={["/quiz/engine"]}><Routes><Route path="/quiz/:topicId" element={<Quiz />} /><Route path="*" element={<HashProbe />} /></Routes></MemoryRouter>);
    await user.click(await screen.findByRole("radio", { name: "First wrong" }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    await user.click(await screen.findByRole("button", { name: "Review this objective in Engine theory" }));
    expect(await screen.findByText("Route: /engine#engine-objectives")).toBeTruthy();
  });

  it("provides an accessible Meteorology result review and targeted leaf navigation", async () => {
    const user = userEvent.setup();
    mocks.loadQuizTopic.mockResolvedValue([
      { ...questions[0], id: "w1", leaf: "weather-systems", learningObjective: "Read pressure systems" },
      { ...questions[1], id: "w2", leaf: "beaufort-sea-state", learningObjective: "Read sea state" },
      { ...questions[1], id: "w3", leaf: "marine-forecasts", learningObjective: "Read forecasts" },
      { ...questions[1], id: "w4", leaf: "fog-visibility", learningObjective: "Act in fog" },
    ]);
    renderQuiz("/quiz/weather");
    for (let index = 0; index < 4; index += 1) {
      const radios = await screen.findAllByRole("radio");
      const wrong = radios.find((radio) => radio.getAttribute("aria-label")?.includes("wrong") || radio.parentElement?.textContent?.includes("wrong"));
      await user.click(wrong!);
      await user.click(screen.getByRole("button", { name: "Submit Answer" }));
      await user.click(screen.getByRole("button", { name: index === 3 ? "View Results" : "Next Question" }));
    }
    const completion = await screen.findByRole("heading", { name: "Quiz Complete!" });
    await waitFor(() => expect(document.activeElement).toBe(completion));
    expect(screen.getByRole("status").textContent).toContain("More review needed");
    expect(screen.getByRole("heading", { name: "Review missed objectives" })).toBeTruthy();
    expect(screen.getAllByText("Your answer:")[0].parentElement?.textContent).toContain("wrong");
    expect(screen.getAllByText("Correct answer:")[0].parentElement?.textContent).toContain("correct");
    await user.click(screen.getByRole("button", { name: /Review Weather Systems & Fronts/ }));
    expect(await screen.findByText("Current path: /weather/systems")).toBeTruthy();
  });

  it("restores a failed completed attempt for review without starting a replacement attempt", async () => {
    const user = userEvent.setup();
    const weatherQuestions = [
      { ...questions[0], id: "w1", leaf: "weather-systems", learningObjective: "Read pressure systems" },
      { ...questions[1], id: "w2", leaf: "beaufort-sea-state", learningObjective: "Read sea state" },
      { ...questions[1], id: "w3", leaf: "marine-forecasts", learningObjective: "Read forecasts" },
      { ...questions[1], id: "w4", leaf: "fog-visibility", learningObjective: "Act in fog" },
    ];
    mocks.user = { id: "learner" };
    mocks.loadQuizTopic.mockResolvedValue(weatherQuestions);
    mocks.loadProgress.mockResolvedValue({
      completed: false,
      score: 0,
      answers_history: { ...buildQuizSessionProgress([0, 0, 0, 0], 3, weatherQuestions), completed: true },
    });

    renderQuiz("/quiz/weather");
    expect(await screen.findByRole("heading", { name: "Review missed objectives" })).toBeTruthy();
    expect(screen.getAllByText("Your answer:")).toHaveLength(4);
    expect(mocks.rpc).not.toHaveBeenCalledWith("start_quiz_attempt", expect.anything());

    await user.click(screen.getByRole("button", { name: "Retry Quiz" }));
    await waitFor(() => expect(mocks.rpc).toHaveBeenCalledWith("start_quiz_attempt", { p_topic_id: "weather" }));
  });

  it("routes a missed sound objective to its exact theory tab and rule", async () => {
    const user = userEvent.setup();
    mocks.loadQuizTopic.mockResolvedValue([{ ...questions[0], id: "cr17", prerequisite: "Lights & Signals", remediationRoute: "/rules/lights/theory?section=sounds#rule-35" }]);
    const RouteProbe = () => { const location = useLocation(); return <p>Route: {location.pathname}{location.search}{location.hash}</p>; };
    render(<MemoryRouter initialEntries={["/quiz/colregs"]}><Routes><Route path="/quiz/:topicId" element={<Quiz />} /><Route path="*" element={<RouteProbe />} /></Routes></MemoryRouter>);
    await user.click(await screen.findByRole("radio", { name: "First wrong" }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    await user.click(await screen.findByRole("button", { name: "Review Lights & Signals theory" }));
    expect(await screen.findByText("Route: /rules/lights/theory?section=sounds#rule-35")).toBeTruthy();
  });

  it("routes a missed steering objective to its exact rule section", async () => {
    const user = userEvent.setup();
    mocks.loadQuizTopic.mockResolvedValue([{ ...questions[0], id: "cr4", prerequisite: "Steering & Sailing", remediationRoute: "/rules/colregs#rule-17" }]);
    const RouteProbe = () => { const location = useLocation(); return <p>Route: {location.pathname}{location.hash}</p>; };
    render(<MemoryRouter initialEntries={["/quiz/colregs"]}><Routes><Route path="/quiz/:topicId" element={<Quiz />} /><Route path="*" element={<RouteProbe />} /></Routes></MemoryRouter>);
    await user.click(await screen.findByRole("radio", { name: "First wrong" }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    await user.click(await screen.findByRole("button", { name: "Review Steering & Sailing theory" }));
    expect(await screen.findByText("Route: /rules/colregs#rule-17")).toBeTruthy();
  });

  it("shows and follows MOB prerequisite and missed-objective remediation links", async () => {
    const user = userEvent.setup();
    mocks.loadQuizTopic.mockResolvedValue([{ ...questions[0], id: "mob-applied-distress-v2", learningObjective: "Escalate distress", prerequisite: "Review and practise the MOB plan", remediationRoute: "/safety/mob" }]);
    renderQuiz("/quiz/safety-mob-quiz");

    expect(await screen.findByText(/Prerequisite: review and rehearse/i)).toBeTruthy();
    expect(screen.getByText(/Objective: Escalate distress/i)).toBeTruthy();
    await user.click(screen.getByRole("radio", { name: "First wrong" }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    await user.click(await screen.findByRole("button", { name: "Review this objective in the Man Overboard lesson" }));
    expect(await screen.findByText("Current path: /safety/mob")).toBeTruthy();
  });

  it("persists a 9/12 MOB critical-outcome miss as not passed", async () => {
    const critical = new Set(["mob-applied-distress-v2", "mob-applied-propeller-v2", "mob-applied-cold-recovery-v2"]);
    const mobQuestions = [
      ...critical,
      ...Array.from({ length: 9 }, (_, index) => `mob-applied-other-${index}-v2`),
    ].map((id) => ({
      id,
      question: id,
      options: [`unsafe ${id}`, `safe ${id}`],
      correctAnswer: 1,
      explanation: `Review ${id}`,
      learningObjective: id,
      prerequisite: "Review and practise the MOB plan",
      remediationRoute: "/safety/mob",
    }));
    mocks.user = { id: "mob-learner" };
    mocks.loadQuizTopic.mockResolvedValue(mobQuestions);
    mocks.rpc.mockImplementation((name: string) => Promise.resolve(name === "start_quiz_attempt"
      ? { data: { attempt_id: "mob-attempt", started_at: new Date().toISOString() }, error: null }
      : { data: null, error: null }));
    const user = userEvent.setup();
    renderQuiz("/quiz/safety-mob-quiz");

    await screen.findByText("Quiz progress is ready to save.");
    for (let index = 0; index < mobQuestions.length; index += 1) {
      const heading = await screen.findByRole("heading", { level: 3 });
      const id = heading.textContent!;
      await user.click(screen.getByRole("radio", { name: `${critical.has(id) ? "unsafe" : "safe"} ${id}` }));
      await user.click(screen.getByRole("button", { name: "Submit Answer" }));
      await user.click(await screen.findByRole("button", { name: index === mobQuestions.length - 1 ? "View Results" : "Next Question" }));
    }

    expect(await screen.findByText("75%")).toBeTruthy();
    expect(screen.getByText("Further MOB review needed")).toBeTruthy();
    expect(screen.queryByText("Applied recovery check passed")).toBeNull();
    await waitFor(() => expect(mocks.saveProgress).toHaveBeenCalledWith(
      expect.stringContaining("safety-mob-quiz"),
      false,
      75,
      0,
      expect.objectContaining({ completed: true }),
    ));
  });

  it("uses the same safe fallback in the unavailable state", async () => {
    const user = userEvent.setup();
    mocks.loadQuizTopic.mockRejectedValueOnce(new Error("missing"));
    renderQuiz("/quiz/unknown-deep-link");
    await user.click(await screen.findByRole("button", { name: "Go to Home" }));
    expect(await screen.findByText("Current path: /")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Nautical Terms" })).toBeNull();
  });

  it("shows authenticated catalogue failures and offers retry instead of masking them as hydration", async () => {
    const user = userEvent.setup();
    mocks.user = { id: "learner" };
    mocks.loadQuizTopic
      .mockRejectedValueOnce(new Error("catalogue unavailable"))
      .mockResolvedValueOnce(questions);
    renderQuiz();

    expect(await screen.findByRole("heading", { name: "Quiz unavailable" })).toBeTruthy();
    expect(screen.getByText(/saved progress is unchanged/i)).toBeTruthy();
    expect(mocks.loadProgress).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Retry loading" }));
    expect((await screen.findAllByRole("radio")).length).toBeGreaterThan(0);
    await waitFor(() => expect(mocks.loadProgress).toHaveBeenCalled());
  });

  it.each([
    ["load failure", () => Promise.reject(new Error("offline"))],
    ["empty bank", () => Promise.resolve([])],
  ])("returns an unavailable Meteorology quiz to its owning module after a %s", async (_case, load) => {
    const user = userEvent.setup();
    mocks.loadQuizTopic.mockImplementationOnce(load);
    renderQuiz("/quiz/weather");

    await user.click(await screen.findByRole("button", { name: "Back to Meteorology" }));
    expect(await screen.findByText("Current path: /weather")).toBeTruthy();
  });

  it("exposes scenario observations as named structured text alongside keyboard-operable answers", async () => {
    const user = userEvent.setup();
    mocks.loadQuizTopic.mockResolvedValueOnce([{ ...questions[0], id: "cr5", scenario: {
      accessibleName: "Same-tack sailing positions for question cr5",
      description: "Boat positions relative to the wind.",
      facts: [{ label: "Wind", value: "From the port side of both boats" }, { label: "Boat A", value: "Windward of Boat B" }, { label: "Boat B", value: "Leeward of Boat A" }],
    } }]);
    renderQuiz("/quiz/colregs");

    const scenario = await screen.findByRole("figure", { name: "Same-tack sailing positions for question cr5" });
    expect(scenario.getAttribute("aria-describedby")).toBe("scenario-description-cr5");
    expect(scenario.textContent).toMatch(/Boat positions.*Wind.*port side.*Boat A.*Windward.*Boat B.*Leeward/i);
    const heading = screen.getByRole("heading", { name: questions[0].question });
    expect(heading.compareDocumentPosition(scenario) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const firstRadio = screen.getByRole("radio", { name: "First wrong" });
    firstRadio.focus();
    await user.keyboard("{ArrowDown}");
    expect((screen.getByRole("radio", { name: /First correct answer/i }) as HTMLInputElement).checked).toBe(true);
  });

  it("returns completed quizzes to the exact registered parent path", async () => {
    const user = userEvent.setup();
    mocks.loadQuizTopic.mockResolvedValueOnce([questions[0]]);
    renderQuiz("/quiz/ropework");

    await user.click(await screen.findByRole("radio", { name: /First correct answer/i }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    await user.click(screen.getByRole("button", { name: "View Results" }));
    await user.click(await screen.findByRole("button", { name: "Return to Ropework & Knots" }));

    expect(await screen.findByText("Current path: /ropework")).toBeTruthy();
  });

  it("returns completed Meteorology quizzes to the module rather than a generic topic", async () => {
    const user = userEvent.setup();
    mocks.loadQuizTopic.mockResolvedValueOnce([questions[0]]);
    renderQuiz("/quiz/weather");

    await user.click(await screen.findByRole("radio", { name: /First correct answer/i }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    await user.click(screen.getByRole("button", { name: "View Results" }));
    await user.click(await screen.findByRole("button", { name: "Return to Meteorology" }));

    expect(await screen.findByText("Current path: /weather")).toBeTruthy();
  });

  it("labels navigation and numeric progress and exposes one radio selection", async () => {
    const user = userEvent.setup();
    renderQuiz();

    expect(await screen.findByRole("button", { name: /go to home from a very long localized quiz title/i })).toBeTruthy();
    const progress = screen.getByRole("progressbar", { name: /progress: question 1 of 2 \(50%\)/i });
    expect(progress.getAttribute("aria-valuenow")).toBe("50");
    expect(progress.getAttribute("aria-valuetext")).toBe("Question 1 of 2");

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
    radios[0].focus();
    await user.keyboard(" ");
    expect((radios[0] as HTMLInputElement).checked).toBe(true);
    expect((radios[1] as HTMLInputElement).checked).toBe(false);
  });

  it("keeps tentative choices out of score and persistence until submission", async () => {
    mocks.user = { id: "quiz-user" };
    const user = userEvent.setup();
    renderQuiz();

    const score = await screen.findByText("Score: 0/2");
    const correct = screen.getByRole("radio", { name: /correct/i });
    const wrong = screen.getByRole("radio", { name: /wrong/i });

    await user.click(wrong);
    expect(score.textContent).toBe("Score: 0/2");
    expect(screen.queryByRole("status")).toBeNull();
    expect(mocks.saveProgress).not.toHaveBeenCalled();

    await user.click(correct);
    await user.click(wrong);
    expect(score.textContent).toBe("Score: 0/2");
    expect(screen.queryByRole("status")).toBeNull();
    expect(mocks.saveProgress).not.toHaveBeenCalled();

    await user.click(correct);
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));

    await waitFor(() => expect(score.textContent).toBe("Score: 1/2"));
    expect(screen.getByRole("status").textContent).toContain("Correct");
    await waitFor(() => expect(mocks.saveProgress).toHaveBeenCalledTimes(1));
  });

  it("reveals no correctness while trying every option and commits the score exactly once", async () => {
    mocks.user = { id: "quiz-user" };
    mocks.loadQuizTopic.mockResolvedValueOnce([{
      ...questions[0],
      options: ["Alpha", "Bravo", "Charlie", "Delta"],
      correctAnswer: 2,
    }]);
    const user = userEvent.setup();
    renderQuiz();

    const score = await screen.findByText("Score: 0/1");
    for (const option of ["Alpha", "Bravo", "Charlie", "Delta"]) {
      await user.click(screen.getByRole("radio", { name: option }));
      expect(score.textContent).toBe("Score: 0/1");
      expect(screen.queryByText("Correct")).toBeNull();
      expect(screen.queryByText("Incorrect")).toBeNull();
      expect(screen.queryByRole("status")).toBeNull();
      expect(mocks.saveProgress).not.toHaveBeenCalled();
    }

    await user.click(screen.getByRole("radio", { name: "Charlie" }));
    const submit = screen.getByRole("button", { name: "Submit Answer" });
    await user.click(submit);

    await waitFor(() => expect(score.textContent).toBe("Score: 1/1"));
    expect(screen.getByRole("status").textContent).toContain("Correct");
    expect(screen.getAllByRole("radio").every((radio) => (radio as HTMLInputElement).disabled)).toBe(true);
    await waitFor(() => expect(mocks.saveProgress).toHaveBeenCalledTimes(1));
  });

  it("prevents navigation from overtaking a pending assessment save", async () => {
    mocks.user = { id: "quiz-user" };
    let releaseSave!: (value: boolean) => void;
    const pendingSave = new Promise<boolean>((resolve) => { releaseSave = resolve; });
    mocks.saveProgress.mockImplementationOnce(() => pendingSave).mockResolvedValue(true);
    const user = userEvent.setup();
    renderQuiz();

    await user.click(await screen.findByRole("radio", { name: /correct/i }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));

    const next = screen.getByRole("button", { name: "Next Question" });
    await user.click(next);
    expect(screen.getByText(/Question 1 of 2/)).toBeTruthy();
    expect(mocks.saveProgress).toHaveBeenCalledTimes(1);

    releaseSave(true);
    expect(await screen.findByText(/Question 2 of 2/)).toBeTruthy();
    await waitFor(() => expect(mocks.saveProgress).toHaveBeenCalledTimes(2));
    const firstSavedQuestion = (mocks.saveProgress.mock.calls[0][4] as { currentQuestionId: string }).currentQuestionId;
    const secondSavedQuestion = (mocks.saveProgress.mock.calls[1][4] as { currentQuestionId: string }).currentQuestionId;
    expect(secondSavedQuestion).not.toBe(firstSavedQuestion);
  });

  it("keeps a rejected assessed answer available for retry without committing it twice", async () => {
    mocks.user = { id: "quiz-user" };
    mocks.saveProgress.mockResolvedValueOnce(false).mockResolvedValue(true);
    const user = userEvent.setup();
    renderQuiz();

    await user.click(await screen.findByRole("radio", { name: /correct/i }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    expect(await screen.findByText(/latest quiz progress was not saved/i)).toBeTruthy();
    expect(screen.getByText("Score: 1/2")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Next Question" }));
    expect(screen.getByText(/Question 1 of 2/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Retry saving progress" }));
    await waitFor(() => expect(screen.queryByText(/latest quiz progress was not saved/i)).toBeNull());
    expect(screen.getByText("Score: 1/2")).toBeTruthy();
    expect(mocks.saveProgress).toHaveBeenCalledTimes(2);
  });

  it("discards a deferred save result when the signed-in owner changes", async () => {
    mocks.user = { id: "owner-a" };
    let rejectOld!: (value: boolean) => void;
    mocks.saveProgress.mockImplementationOnce(() => new Promise<boolean>((resolve) => { rejectOld = resolve; }));
    const view = renderQuiz();
    const user = userEvent.setup();

    await user.click(await screen.findByRole("radio", { name: /correct/i }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    expect(await screen.findByText("Saving quiz progress…")).toBeTruthy();

    mocks.user = { id: "owner-b" };
    view.rerender(<QuizTree />);
    expect(await screen.findByText("Quiz progress is ready to save.")).toBeTruthy();
    rejectOld(false);
    await waitFor(() => expect(screen.queryByText(/latest quiz progress was not saved/i)).toBeNull());
  });

  it("discards a deferred save and retry snapshot when the quiz topic changes", async () => {
    mocks.user = { id: "quiz-user" };
    let finishOld!: (value: boolean) => void;
    mocks.saveProgress.mockImplementationOnce(() => new Promise<boolean>((resolve) => { finishOld = resolve; }));
    const user = userEvent.setup();
    renderQuiz();

    await user.click(await screen.findByRole("radio", { name: /correct/i }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    await user.click(screen.getByRole("button", { name: "Switch quiz topic" }));
    expect(await screen.findByText("Ropework Quiz")).toBeTruthy();
    expect(screen.getByText("Quiz progress is ready to save.")).toBeTruthy();
    finishOld(false);
    await waitFor(() => expect(screen.queryByText(/latest quiz progress was not saved/i)).toBeNull());
    expect(screen.queryByRole("button", { name: "Retry saving progress" })).toBeNull();
  });

  it("guards diagnostic exits while the latest assessment is still saving", async () => {
    mocks.user = { id: "quiz-user" };
    mocks.saveProgress.mockImplementationOnce(() => new Promise<boolean>(() => undefined));
    const confirm = vi.fn().mockReturnValue(false);
    vi.stubGlobal("confirm", confirm);
    const user = userEvent.setup();
    renderQuiz("/quiz/colregs");

    await user.click(await screen.findByRole("radio", { name: /correct/i }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    await user.click(screen.getByRole("button", { name: "Steering & Sailing theory" }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(screen.getByText("Combined Rules Diagnostic")).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it("announces feedback once and focuses each advanced question and completion", async () => {
    const user = userEvent.setup();
    renderQuiz("/quiz/ropework");
    const firstHeading = await screen.findByRole("heading", { level: 3 });
    const firstPrefix = firstHeading.textContent?.startsWith("First") ? "First" : "Second";
    await user.click(screen.getByRole("radio", { name: new RegExp(`${firstPrefix} correct`, "i") }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    const feedback = screen.getByRole("status");
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(feedback.textContent).toContain("Correct");
    await waitFor(() => expect(document.activeElement).toBe(feedback));
    const selected = screen.getByRole("radio", { name: new RegExp(`${firstPrefix} correct`, "i") });
    expect(selected.getAttribute("aria-describedby")).toBeTruthy();
    expect(selected.disabled).toBe(true);
    expect(document.getElementById(selected.getAttribute("aria-describedby")!)?.textContent).toContain("Correct answer");

    await user.click(screen.getByRole("button", { name: "Next Question" }));
    const secondHeading = await screen.findByRole("heading", { level: 3, name: firstPrefix === "First" ? "Second question?" : /First deliberately/ });
    await waitFor(() => expect(document.activeElement).toBe(secondHeading));

    await user.click(screen.getByRole("button", { name: "Previous" }));
    const previousHeading = await screen.findByRole("heading", { level: 3, name: firstHeading.textContent ?? "" });
    await waitFor(() => expect(document.activeElement).toBe(previousHeading));

    await user.click(screen.getByRole("button", { name: "Next Question" }));
    await screen.findByRole("heading", { level: 3, name: firstPrefix === "First" ? "Second question?" : /First deliberately/ });
    const secondPrefix = firstPrefix === "First" ? "Second" : "First";
    await user.click(screen.getByRole("radio", { name: new RegExp(`${secondPrefix} correct`, "i") }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    await user.click(screen.getByRole("button", { name: "View Results" }));

    const completion = await screen.findByRole("heading", { name: "Quiz Complete!" });
    await waitFor(() => expect(document.activeElement).toBe(completion));
    expect(screen.getByRole("button", { name: "Return to Ropework & Knots" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Retry Quiz" }));
    const restartedHeading = await screen.findByRole("heading", { level: 3 });
    await waitFor(() => expect(document.activeElement).toBe(restartedHeading));
  });

  it("includes narrow reflow, long-content wrapping, and reduced-motion safeguards", async () => {
    const { container } = renderQuiz();
    await screen.findAllByRole("radio");

    expect(container.querySelector("main")?.className).toContain("px-3");
    expect(screen.getByRole("heading", { level: 1 }).className).toContain("[overflow-wrap:anywhere]");
    expect(screen.getAllByRole("radio")[1].closest("label")?.className).toContain("motion-reduce:hover:scale-100");
    expect(screen.getByRole("button", { name: "Submit Answer" }).parentElement?.className).toContain("flex-col");
  });
});
