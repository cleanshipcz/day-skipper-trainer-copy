import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getTopicById, TOPIC_IDS } from "@/constants/topicRegistry";
import SafetyMenu from "./SafetyMenu";

vi.mock("@/components/CompletionBadge", () => ({
  CompletionBadge: ({ topicIds }: { topicIds: string }) => <span data-completion-topic={topicIds} />,
}));

const renderSafetyMenu = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <SafetyMenu />
    </MemoryRouter>,
  );

describe("SafetyMenu", () => {
  it("should render all 6 safety sub-module cards", () => {
    // given
    const html = renderSafetyMenu();

    // then
    expect(html).toContain("Man Overboard (MOB)");
    expect(html).toContain("Fire Safety");
    expect(html).toContain("Life Raft &amp; Abandon Ship");
    expect(html).toContain("Flares &amp; Pyrotechnics");
    expect(html).toContain("Personal Safety");
    expect(html).toContain("Gas Safety");
  });

  it("keeps all six lesson leaves and exposes a clearly named comprehensive quiz", () => {
    const html = renderSafetyMenu();
    expect((html.match(/Start Learning/g) ?? [])).toHaveLength(6);
    expect(html).toContain("Comprehensive Safety Quiz");
    expect(html).toContain("Take Comprehensive Safety Quiz");
    expect(html).toContain("Man Overboard");
    expect(html).toContain("Fire Safety");
    expect(html).toContain("Life Raft &amp; Abandon Ship");
    expect(html).toContain("Flares &amp; Pyrotechnics");
    expect(html).toContain("Personal Safety Equipment");
    expect(html).toContain("Gas Safety");
  });

  it("navigates the accessible quiz action to the Safety registry quizRoute", async () => {
    const quizRoute = getTopicById(TOPIC_IDS.SAFETY)?.quizRoute;
    expect(quizRoute).toBe("/quiz/safety");
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/safety"]}>
        <Routes>
          <Route path="/safety" element={<SafetyMenu />} />
          <Route path={quizRoute!} element={<h1>Safety quiz destination</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Take Comprehensive Safety Quiz" }));
    expect(screen.getByRole("heading", { name: "Safety quiz destination" })).toBeTruthy();
  });

  it("couples the comprehensive quiz badge to its recorded Safety progress key", () => {
    const html = renderSafetyMenu();
    expect(html).toMatch(new RegExp(`data-completion-topic="${TOPIC_IDS.SAFETY}"[\\s\\S]*Comprehensive Safety Quiz`));
  });

  it("defines quiz availability without treating lesson visits as mastery", () => {
    const html = renderSafetyMenu();
    expect(html).toContain("Available now");
    expect(html).toContain("opening them does not prove mastery");
    expect(html).toContain("quiz result records the assessment");
  });

  it("should render the Personal Safety sub-module with correct description", () => {
    // given
    const html = renderSafetyMenu();

    // then
    expect(html).toContain("Personal Safety");
    expect(html).toContain("Life jackets, harnesses, tethers, jacklines, and kill cords");
  });

  it("should render the Gas Safety sub-module with correct description", () => {
    // given
    const html = renderSafetyMenu();

    // then
    expect(html).toContain("Gas Safety");
    expect(html).toContain("LPG properties, isolation valves, carbon monoxide, and detector placement");
  });

  it("should render the page title and subtitle", () => {
    // given
    const html = renderSafetyMenu();

    // then
    expect(html).toContain("Safety Procedures");
    expect(html).toContain("Emergency protocols and drills");
  });
});
