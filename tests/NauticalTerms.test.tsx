import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NauticalTerms from "../src/pages/NauticalTerms";
import { configurationAwareBoatPartDescriptions } from "../src/data/boatPartDescriptions";
import TestRouter from "./TestRouter";

const saveProgressMock = vi.fn();
const saveProgressAccountBMock = vi.fn();
const loadProgressMock = vi.fn().mockResolvedValue(null);
let currentUser: { id: string } | null = { id: "test-user" };

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    saveProgress: currentUser?.id === "account-b" ? saveProgressAccountBMock : saveProgressMock,
    loadProgress: loadProgressMock,
  }),
}));

vi.mock("@/contexts/AuthHooks", () => ({
  useAuth: () => ({
    user: currentUser,
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {},
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("NauticalTerms progress writes", () => {
  it("qualifies configuration-dependent Boat Parts descriptions", () => {
    const descriptions = configurationAwareBoatPartDescriptions;

    expect(descriptions.stern).toContain("arrangement varies");
    expect(descriptions.keel).toContain("keel form and contribution to stability vary");
    expect(descriptions.boom).toContain("loose-footed");
    expect(descriptions.mainsail).toContain("depend on the boat and sail plan");
    expect(descriptions.forestay).toContain("attachment points vary by rig");
    expect(descriptions.backstay).toContain("no backstay");
  });

  beforeEach(() => {
    saveProgressMock.mockReset().mockResolvedValue(true);
    saveProgressAccountBMock.mockReset().mockResolvedValue(true);
    loadProgressMock.mockReset().mockResolvedValue(null);
    currentUser = { id: "test-user" };
  });

  it("keeps every marker interactive for anonymous learners without attempting persistence", async () => {
    const user = userEvent.setup();
    currentUser = null;
    const { container } = render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    const markers = screen.getAllByRole("button", { name: /marker \d+, undiscovered/i });
    expect(markers).toHaveLength(20);
    expect(loadProgressMock).not.toHaveBeenCalled();

    for (let index = 0; index < markers.length; index += 1) {
      await user.click(screen.getByRole("button", { name: new RegExp(`marker ${index + 1}, undiscovered`, "i") }));
      expect(screen.getByRole("heading", { name: /what is this part/i })).toBe(document.activeElement);
      await user.click(screen.getByRole("button", { name: /close answer choices/i }));
    }

    expect(container.querySelectorAll('[data-marker-state="undiscovered"]')).toHaveLength(20);
    expect(saveProgressMock).not.toHaveBeenCalled();
  });

  it("keeps signed-in markers clickable during hydration and saves the local interaction afterward", async () => {
    const user = userEvent.setup();
    let resolveLoad: (value: { answers_history: { partProgress: { stern: { state: string; attempts: number } }; score: number } }) => void = () => undefined;
    loadProgressMock.mockReturnValueOnce(
      new Promise<{ answers_history: { partProgress: { stern: { state: string; attempts: number } }; score: number } }>((resolve) => {
        resolveLoad = resolve;
      })
    );

    render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    await waitFor(() => expect(loadProgressMock).toHaveBeenCalledOnce());
    expect(saveProgressMock).not.toHaveBeenCalled();
    const pendingMarker = screen.getByRole("button", { name: /marker 1, undiscovered/i });
    expect(pendingMarker.getAttribute("aria-disabled")).toBe("false");
    expect(pendingMarker.hasAttribute("disabled")).toBe(false);
    await user.click(pendingMarker);
    expect(screen.getByRole("heading", { name: /what is this part/i })).toBe(document.activeElement);

    resolveLoad({ answers_history: { partProgress: { stern: { state: "correct", attempts: 1 } }, score: 10 } });
    await waitFor(() => expect(saveProgressMock).toHaveBeenCalledOnce());
    expect(screen.getByRole("button", { name: /marker 1, guessing/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /marker 2, correct: stern/i })).toBeTruthy();
    expect(screen.getByText("10")).toBeTruthy();
    expect(saveProgressMock.mock.calls[0][4]).toMatchObject({
      score: 10,
      partProgress: {
        bow: { state: "guessing", attempts: 0 },
        stern: { state: "correct", attempts: 1 },
      },
    });
  });

  it("does not award points again when a pending local answer was already correct remotely", async () => {
    const user = userEvent.setup();
    let resolveLoad: (value: unknown) => void = () => undefined;
    loadProgressMock.mockReturnValueOnce(new Promise((resolve) => { resolveLoad = resolve; }));
    render(<TestRouter><NauticalTerms /></TestRouter>);

    await waitFor(() => expect(loadProgressMock).toHaveBeenCalledOnce());
    await user.click(screen.getByRole("button", { name: /marker 1, undiscovered/i }));
    await user.click(screen.getByRole("button", { name: "Bow" }));
    resolveLoad({ answers_history: { partProgress: { bow: { state: "correct", attempts: 1 } }, score: 10 } });

    await waitFor(() => expect(saveProgressMock).toHaveBeenCalledOnce());
    expect(screen.getByText("10")).toBeTruthy();
    expect(saveProgressMock.mock.calls[0][4]).toMatchObject({
      score: 10,
      partProgress: { bow: { state: "correct", attempts: 1 } },
    });
  });

  it("uses the hydrated attempt history when scoring a pending local correct answer", async () => {
    const user = userEvent.setup();
    let resolveLoad: (value: unknown) => void = () => undefined;
    loadProgressMock.mockReturnValueOnce(new Promise((resolve) => { resolveLoad = resolve; }));
    render(<TestRouter><NauticalTerms /></TestRouter>);

    await waitFor(() => expect(loadProgressMock).toHaveBeenCalledOnce());
    await user.click(screen.getByRole("button", { name: /marker 1, undiscovered/i }));
    await user.click(screen.getByRole("button", { name: "Bow" }));
    resolveLoad({ answers_history: { partProgress: { bow: { state: "wrong", attempts: 1 } }, score: 0 } });

    await waitFor(() => expect(saveProgressMock).toHaveBeenCalledOnce());
    expect(screen.getByText("5")).toBeTruthy();
    expect(saveProgressMock.mock.calls[0][4]).toMatchObject({
      score: 5,
      partProgress: { bow: { state: "correct", attempts: 2 } },
    });
  });

  it("normalizes partial, stale, and malformed saved progress against the current catalogue", async () => {
    loadProgressMock.mockResolvedValueOnce({
      answers_history: {
        partProgress: {
          bow: { state: "correct", attempts: 1 },
          stern: { state: "corrupt", attempts: -10 },
          hull: { state: "wrong", attempts: Number.POSITIVE_INFINITY },
          obsolete_part: { state: "correct", attempts: 1 },
        },
        score: 999,
      },
    });

    const { container } = render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    await waitFor(() => expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("1"));
    expect(screen.getByRole("button", { name: /marker 1, correct/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /marker 2, undiscovered/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /marker 3, wrong/i })).toBeTruthy();
    expect(container.querySelector('[data-marker-id="obsolete_part"]')).toBeNull();
    expect(container.querySelector("header")?.textContent).toContain("200");
    expect(saveProgressMock).not.toHaveBeenCalled();
  });

  it("recovers from rejected and malformed loads without an unhandled rejection or premature write", async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    loadProgressMock.mockRejectedValueOnce(new Error("offline"));

    render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    await waitFor(() => expect(consoleError).toHaveBeenCalledWith("Error loading boat parts progress:", expect.any(Error)));
    expect(screen.getAllByRole("button", { name: /marker \d+, undiscovered/i })).toHaveLength(20);
    expect(saveProgressMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /marker 1, undiscovered/i }));
    await user.click(screen.getByRole("button", { name: "Bow" }));
    await waitFor(() => expect(saveProgressMock).toHaveBeenCalled());
    consoleError.mockRestore();
  });

  it("serializes saves and coalesces queued changes so reset remains the latest persisted state", async () => {
    const user = userEvent.setup();
    let resolveFirstSave: (value: boolean) => void = () => undefined;
    saveProgressMock
      .mockReturnValueOnce(
        new Promise<boolean>((resolve) => {
          resolveFirstSave = resolve;
        })
      )
      .mockResolvedValue(true);

    render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    const marker = await screen.findByRole("button", { name: /marker 1, undiscovered/i });
    await waitFor(() => expect(loadProgressMock).toHaveBeenCalledOnce());
    await user.click(marker);
    await waitFor(() => expect(saveProgressMock).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "Bow" }));
    await user.click(screen.getByRole("button", { name: /reset/i }));
    expect(saveProgressMock).toHaveBeenCalledTimes(1);

    resolveFirstSave(true);
    await waitFor(() => expect(saveProgressMock).toHaveBeenCalledTimes(2));

    const [, completed, scorePercentage, , history] = saveProgressMock.mock.calls[1];
    expect(completed).toBe(false);
    expect(scorePercentage).toBe(0);
    expect(history.score).toBe(0);
    expect(Object.values(history.partProgress)).toHaveLength(20);
    expect(Object.values(history.partProgress).every((progress) => progress.state === "hidden" && progress.attempts === 0)).toBe(
      true
    );
  });

  it("cannot flush a new account snapshot through the previous account save callback", async () => {
    const user = userEvent.setup();
    let resolveAccountASave: (value: boolean) => void = () => undefined;
    saveProgressMock.mockReturnValueOnce(
      new Promise<boolean>((resolve) => {
        resolveAccountASave = resolve;
      })
    );

    const view = render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    await waitFor(() => expect(loadProgressMock).toHaveBeenCalledTimes(1));
    await user.click(screen.getByRole("button", { name: /marker 1, undiscovered/i }));
    await waitFor(() => expect(saveProgressMock).toHaveBeenCalledTimes(1));

    currentUser = { id: "account-b" };
    view.rerender(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );
    await waitFor(() => expect(loadProgressMock).toHaveBeenCalledTimes(2));
    await user.click(screen.getByRole("button", { name: /marker 2, undiscovered/i }));
    await waitFor(() => expect(saveProgressAccountBMock).toHaveBeenCalledOnce());

    resolveAccountASave(true);
    await waitFor(() => expect(saveProgressMock).toHaveBeenCalledOnce());
    expect(saveProgressAccountBMock).toHaveBeenCalledOnce();
    const accountBHistory = saveProgressAccountBMock.mock.calls[0][4];
    expect(accountBHistory.partProgress.stern.state).toBe("guessing");
    expect(accountBHistory.partProgress.bow.state).toBe("hidden");
  });

  it("continues with the newest queued snapshot after an unexpected save rejection", async () => {
    const user = userEvent.setup();
    let rejectFirstSave: (reason: Error) => void = () => undefined;
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    saveProgressMock
      .mockReturnValueOnce(
        new Promise<boolean>((_resolve, reject) => {
          rejectFirstSave = reject;
        })
      )
      .mockResolvedValue(true);

    render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );
    await waitFor(() => expect(loadProgressMock).toHaveBeenCalledOnce());
    await user.click(screen.getByRole("button", { name: /marker 1, undiscovered/i }));
    await waitFor(() => expect(saveProgressMock).toHaveBeenCalledOnce());
    await user.click(screen.getByRole("button", { name: /reset/i }));

    rejectFirstSave(new Error("unexpected"));
    await waitFor(() => expect(saveProgressMock).toHaveBeenCalledTimes(2));
    expect(consoleError).toHaveBeenCalledWith("Unexpected error saving boat parts progress:", expect.any(Error));
    expect(saveProgressMock.mock.calls[1][4].score).toBe(0);
    consoleError.mockRestore();
  });

  it("does not write completion for unrelated modules when resetting", async () => {
    const user = userEvent.setup();

    render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    const resetButtons = await screen.findAllByRole("button", { name: /reset/i });
    await user.click(resetButtons[0]);

    const forbiddenModules = new Set(["lights-theory", "colregs-theory"]);
    const wroteForbiddenModule = saveProgressMock.mock.calls.some(([module]) => forbiddenModules.has(module));

    expect(wroteForbiddenModule).toBe(false);
  });

  it("exposes marker instructions, state, progress, and icon-only control labels", async () => {
    render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    expect(await screen.findByText(/use enter or space with a keyboard/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /back to nautical terms/i })).toBeTruthy();

    const markers = screen.getAllByRole("button", {
      name: /marker \d+, undiscovered\. activate to identify this boat part/i,
    });
    expect(markers).toHaveLength(20);
    expect(markers[0].getAttribute("tabindex")).toBe("0");
    expect(markers[0].getAttribute("data-marker-state")).toBe("undiscovered");

    expect(screen.getByRole("progressbar", { name: /boat parts identified/i }).getAttribute("aria-valuetext")).toBe(
      "0 of 20 boat parts identified"
    );
  });

  it("moves focus into the answer panel and restores it on close", async () => {
    const user = userEvent.setup();
    render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    const marker = screen.getByRole("button", { name: /marker 1, undiscovered/i });
    await waitFor(() => expect(marker.getAttribute("aria-disabled")).toBe("false"));
    marker.focus();
    fireEvent.keyDown(marker, { key: "Enter" });

    expect(screen.getByRole("heading", { name: /what is this part/i })).toBe(document.activeElement);
    expect(screen.getByRole("button", { name: /marker 1, guessing/i }).getAttribute("data-marker-state")).toBe(
      "guessing"
    );

    await user.click(screen.getByRole("button", { name: /close answer choices/i }));
    expect(marker).toBe(document.activeElement);
    expect(screen.getByRole("button", { name: /marker 1, undiscovered/i })).toBeTruthy();
  });

  it("supports Space and exposes wrong and correct outcomes with progress updates", async () => {
    const user = userEvent.setup();
    render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    const marker = screen.getByRole("button", { name: /marker 1, undiscovered/i });
    await waitFor(() => expect(marker.getAttribute("aria-disabled")).toBe("false"));
    marker.focus();
    fireEvent.keyDown(marker, { key: " " });
    expect(screen.getByRole("heading", { name: /what is this part/i })).toBe(document.activeElement);

    const answerButtons = screen.getAllByRole("button").filter((button) =>
      ["Bow", "Stern", "Hull", "Deck", "Mast", "Boom", "Mainsail", "Jib", "Forestay", "Backstay", "Rudder", "Tiller", "Keel", "Cockpit", "Telltales"].includes(
        button.textContent ?? ""
      )
    );
    const wrongAnswer = answerButtons.find((button) => button.textContent !== "Bow");
    expect(wrongAnswer).toBeTruthy();
    await user.click(wrongAnswer!);

    expect(screen.getByRole("button", { name: /marker 1, wrong, selected for another guess/i })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Bow" }));

    expect(screen.getByRole("button", { name: /marker 1, correct: bow/i })).toBe(document.activeElement);
    const progress = screen.getByRole("progressbar", { name: /boat parts identified/i });
    expect(progress.getAttribute("aria-valuenow")).toBe("1");
    expect(progress.getAttribute("aria-valuemax")).toBe("20");
    expect(progress.getAttribute("aria-valuetext")).toBe("1 of 20 boat parts identified");
  });

  it("preserves mobile scale for 44px touch targets without covering the diagram", () => {
    currentUser = null;
    const { container } = render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    const markerHitAreas = container.querySelectorAll('[data-marker-hit-area]');
    expect(markerHitAreas).toHaveLength(20);
    markerHitAreas.forEach((hitArea) => {
      expect(hitArea.tagName).toBe("BUTTON");
      expect(hitArea.classList.contains("h-12")).toBe(true);
      expect(hitArea.classList.contains("w-12")).toBe(true);
    });
    const markerControls = container.querySelectorAll('button[data-marker-id]');
    const sideViewPlate = markerControls[0]?.parentElement;
    const backViewPlate = markerControls[15]?.parentElement;
    expect(sideViewPlate?.classList.contains("min-w-[550px]")).toBe(true);
    expect(backViewPlate?.classList.contains("min-w-[400px]")).toBe(true);
    expect(sideViewPlate?.querySelector("svg")?.contains(markerControls[0])).toBe(false);
    expect(backViewPlate?.querySelector("svg")?.contains(markerControls[15])).toBe(false);
  });

  it("keeps native button hit surfaces from occluding one another", () => {
    currentUser = null;
    const { container } = render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    container.querySelectorAll("svg").forEach((svg) => {
      if (!svg.querySelector("image")) return;
      const hitAreas = Array.from(svg.parentElement?.querySelectorAll<HTMLButtonElement>("[data-marker-hit-area]") ?? []);
      expect(hitAreas.length).toBeGreaterThan(0);
      hitAreas.forEach((first, index) => {
        for (const second of hitAreas.slice(index + 1)) {
          const distance = Math.hypot(
            (Number.parseFloat(first.style.left) - Number.parseFloat(second.style.left)) * svg.viewBox.baseVal.width / 100,
            (Number.parseFloat(first.style.top) - Number.parseFloat(second.style.top)) * svg.viewBox.baseVal.height / 100
          );
          expect(
            distance,
            `${first.dataset.markerHitArea} and ${second.dataset.markerHitArea} hit surfaces overlap`
          ).toBeGreaterThanOrEqual(48);
        }
      });
    });
  });

  it("renders the marker numbers referenced by the instructions", () => {
    currentUser = null;
    const { container } = render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    const markers = Array.from(container.querySelectorAll<HTMLButtonElement>("button[data-marker-id]"));
    expect(markers).toHaveLength(20);
    markers.forEach((marker, index) => {
      expect(marker.textContent).toBe(`#${index + 1}`);
    });
  });

  it("activates a marker through its explicit HTML overlay hit surface", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    await waitFor(() => expect(loadProgressMock).toHaveBeenCalledOnce());
    const bowHitArea = container.querySelector<HTMLButtonElement>('[data-marker-hit-area="bow"]');
    expect(bowHitArea).toBeTruthy();
    await user.click(bowHitArea!);

    expect(screen.getByRole("heading", { name: /what is this part/i })).toBe(document.activeElement);
    expect(screen.getByRole("button", { name: /marker 1, guessing/i })).toBeTruthy();
  });

  it("uses the overhauled image plates while keeping nearby rigging markers distinct", () => {
    loadProgressMock.mockReturnValueOnce(new Promise(() => undefined));
    const { container } = render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    const jibMarker = container.querySelector('[data-marker-id="jib"]');
    const forestayMarker = container.querySelector('[data-marker-id="forestay"]');
    const sideView = jibMarker?.closest("svg");
    const plate = sideView?.querySelector("image");

    expect(plate?.getAttribute("href")).toBe("/images/quizzes/nautical-terms/yacht-side-profile.png");
    expect(plate?.getAttribute("aria-hidden")).toBe("true");
    expect(jibMarker?.querySelector("line")?.getAttribute("x2")).toBe("357");
    expect(jibMarker?.querySelector("line")?.getAttribute("y2")).toBe("129");
    expect(forestayMarker?.querySelector("line")?.getAttribute("x2")).toBe("410");
    expect(forestayMarker?.querySelector("line")?.getAttribute("y2")).toBe("234");
    expect(jibMarker?.querySelector("line")?.getAttribute("x2")).not.toBe(
      forestayMarker?.querySelector("line")?.getAttribute("x2")
    );

    const sternPlate = container
      .querySelector('[data-marker-id="port"]')
      ?.closest("svg")
      ?.querySelector("image");
    expect(sternPlate?.getAttribute("href")).toBe("/images/quizzes/nautical-terms/yacht-stern-view.png");
  });

  it("anchors ambiguous terms to reference geometry on the raster plates", () => {
    loadProgressMock.mockReturnValueOnce(new Promise(() => undefined));
    const { container } = render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );
    const point = (id: string) => {
      const leader = container.querySelector(`[data-marker-id="${id}"] > line`)!;
      return [Number(leader.getAttribute("x2")), Number(leader.getAttribute("y2"))] as const;
    };

    // The forestay endpoint sits on the visible cable between the masthead and bow fitting.
    const [forestayX, forestayY] = point("forestay");
    const expectedForestayX = 310 + ((440 - 310) * (forestayY - 20)) / (300 - 20);
    expect(Math.abs(forestayX - expectedForestayX)).toBeLessThan(3);

    // The revised plate exposes one real backstay rather than drawing a second, ambiguous reference stay.
    const [backstayX, backstayY] = point("backstay");
    const expectedBackstayX = 310 + ((145 - 310) * (backstayY - 20)) / (280 - 20);
    expect(Math.abs(backstayX - expectedBackstayX)).toBeLessThan(4);
    expect(container.querySelector('[data-reference-id="backstay"]')).toBeNull();

    // Related rigging and sail terms deliberately terminate far enough apart to identify distinct components.
    for (const [first, second] of [["mast", "telltales"], ["jib", "forestay"], ["mainsail", "telltales"]]) {
      const [firstX, firstY] = point(first);
      const [secondX, secondY] = point(second);
      expect(Math.hypot(firstX - secondX, firstY - secondY), `${first} and ${second}`).toBeGreaterThan(45);
    }

    // Beam is a width, not a point: the marker targets the midpoint of a side-to-side dimension line.
    const beamReference = container.querySelector('[data-reference-id="beam"]')!;
    expect(point("beam")).toEqual([200, 280]);
    expect(beamReference.querySelector('line')?.getAttribute("x1")).toBe("140");
    expect(beamReference.querySelector('line')?.getAttribute("x2")).toBe("260");
    expect(beamReference.getAttribute("pointer-events")).toBe("none");

    container.querySelectorAll('[data-marker-id] > line').forEach((leader) => {
      expect(leader.getAttribute("pointer-events")).toBe("none");
    });
  });
});
