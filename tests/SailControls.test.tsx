import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import SailControls from "../src/pages/SailControls";
import TestRouter from "./TestRouter";

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({ saveProgress: vi.fn() }),
}));

vi.mock("@/contexts/AuthHooks", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const answerForCurrentQuestion = () => {
  const clue = screen.getByText(/What control line does this describe/).nextElementSibling?.textContent ?? "";
  const answers: [string, string][] = [
    ["Raises and lowers the mainsail", "Main Halyard"], ["Raises and lowers the headsail", "Jib Halyard"],
    ["angle of the mainsail", "Mainsheet"], ["angle of the jib", "Jib Sheet"], ["boom from rising", "Boom Vang"],
    ["lower mainsail", "Outhaul"], ["Moves draft forward", "Cunningham"], ["Supports the boom", "Topping Lift"],
    ["Reduces mainsail area", "Reefing Lines"], ["boom angle independently", "Mainsheet Traveller"],
    ["angle of pull", "Jib Fairlead"], ["Bends mast", "Backstay Adjuster"],
  ];
  const answer = answers.find(([purpose]) => clue.includes(purpose))?.[1];
  expect(answer).toBeTruthy();
  return screen.getByRole("button", { name: answer! });
};

describe("SailControls schematic geometry", () => {
  it("aligns the jib luff, halyard, and aft-running sheet/fairlead route with the forestay", () => {
    const { container } = render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );

    const jib = container.querySelector('[data-geometry="jib"]');
    const forestay = container.querySelector('[data-geometry="forestay"]');
    const jibHalyard = container.querySelector('[data-control-id="jib-halyard"]');
    const jibSheet = container.querySelector('[data-control-id="jib-sheet"]');
    const fairlead = container.querySelector('[data-control-id="jib-fairlead"]');

    expect(jib?.getAttribute("d")).toBe("M306,78 L500,540 L410,440 Z");
    expect(forestay?.getAttribute("x1")).toBe("300");
    expect(forestay?.getAttribute("y1")).toBe("60");
    expect(forestay?.getAttribute("x2")).toBe("520");
    expect(forestay?.getAttribute("y2")).toBe("560");
    expect(jibHalyard?.querySelector("line")?.getAttribute("x1")).toBe("306");
    expect(jibHalyard?.querySelector("line")?.getAttribute("y1")).toBe("78");
    expect(jibSheet?.querySelector("circle")?.getAttribute("cx")).toBe("410");
    expect(jibSheet?.querySelector("circle")?.getAttribute("cy")).toBe("440");

    const sheetPoints = jibSheet
      ?.querySelector("[data-sheet-route]")
      ?.getAttribute("points")
      ?.split(" ")
      .map((point) => point.split(",").map(Number));
    const fairleadX = Number(fairlead?.querySelector("[data-fairlead-route]")?.getAttribute("x1"));
    const winchX = Number(fairlead?.querySelector("[data-fairlead-route]")?.getAttribute("x2"));

    expect(sheetPoints).toHaveLength(3);
    expect(sheetPoints?.[0]).toEqual([410, 440]);
    expect(sheetPoints?.[1]?.[0]).toBe(fairleadX);
    expect(sheetPoints?.[2]?.[0]).toBe(winchX);
    expect(sheetPoints?.[0]?.[0]).toBeGreaterThan(fairleadX);
    expect(fairleadX).toBeGreaterThan(winchX);
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
    expect(touchTargets).toHaveLength(12);
    touchTargets.forEach((target) => {
      expect(Number(target.getAttribute("width"))).toBeGreaterThanOrEqual(44);
      expect(Number(target.getAttribute("height"))).toBeGreaterThanOrEqual(44);
      expect(target.getAttribute("fill")).toBe("transparent");
    });
  });

  it("keeps touch, click, and highlight behavior on the relocated sheet and fairlead", () => {
    const { container } = render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );

    const jibSheet = container.querySelector<SVGGElement>('[data-control-id="jib-sheet"]');
    const fairleadTarget = container.querySelector<SVGRectElement>('[data-touch-target="jib-fairlead"]');
    const mainHalyard = container.querySelector('[data-touch-target="main-halyard"]')?.parentElement;

    expect(jibSheet).not.toBeNull();
    expect(fairleadTarget).not.toBeNull();
    fireEvent.mouseEnter(jibSheet!);
    expect(jibSheet?.getAttribute("opacity")).toBe("1");
    expect(mainHalyard?.getAttribute("opacity")).toBe("0.4");

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
      ["Controls the angle of the mainsail to the wind", "Mainsheet"],
      ["Controls the angle of the jib/genoa", "Jib Sheet"],
      ["Prevents boom from rising, controls sail twist", "Boom Vang"],
      ["Flattens or adds fullness to lower mainsail", "Outhaul"],
      ["Moves draft forward, tensions luff", "Cunningham"],
      ["Supports the boom when mainsail is down", "Topping Lift"],
      ["Reduces mainsail area for heavy weather", "Reefing Lines"],
      ["Adjusts boom angle independently of sheet tension", "Mainsheet Traveller"],
      ["Sets the angle of pull on the jib sheet", "Jib Fairlead"],
      ["Bends mast to flatten mainsail, tightens forestay", "Backstay Adjuster"],
    ]);

    render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Start Quiz" }));

    const answerCurrentQuestion = () => {
      const clue = screen.getByText(/What control line does this describe/).nextElementSibling?.textContent ?? "";
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
});
