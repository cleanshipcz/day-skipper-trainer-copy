import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

  it("does not write initial state while hydration is delayed or after it completes", async () => {
    let resolveLoad: (value: null) => void = () => undefined;
    loadProgressMock.mockReturnValueOnce(
      new Promise<null>((resolve) => {
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

    resolveLoad(null);
    await waitFor(() => expect(screen.getAllByRole("button", { name: /marker \d+, undiscovered/i })).toHaveLength(20));
    expect(saveProgressMock).not.toHaveBeenCalled();
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
    loadProgressMock.mockReturnValueOnce(new Promise(() => undefined));
    render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    expect(screen.getByText(/use enter or space with a keyboard/i)).toBeTruthy();
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
    marker.focus();
    await user.keyboard("{Enter}");

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
    marker.focus();
    await user.keyboard(" ");
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

    expect(screen.getByRole("button", { name: /marker 1, correct/i })).toBe(document.activeElement);
    const progress = screen.getByRole("progressbar", { name: /boat parts identified/i });
    expect(progress.getAttribute("aria-valuenow")).toBe("1");
    expect(progress.getAttribute("aria-valuemax")).toBe("20");
    expect(progress.getAttribute("aria-valuetext")).toBe("1 of 20 boat parts identified");
  });

  it("preserves mobile scale for 44px touch targets without covering the diagram", () => {
    loadProgressMock.mockReturnValueOnce(new Promise(() => undefined));
    const { container } = render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    const markerHitAreas = container.querySelectorAll('[role="button"] > circle[r="28"]');
    expect(markerHitAreas).toHaveLength(20);
    markerHitAreas.forEach((hitArea) => expect(hitArea.getAttribute("fill")).toBe("transparent"));
    const markerControls = container.querySelectorAll('[role="button"][data-marker-id]');
    const sideViewSvg = markerControls[0]?.closest("svg");
    const backViewSvg = markerControls[15]?.closest("svg");
    expect(sideViewSvg?.classList.contains("min-w-[550px]")).toBe(true);
    expect(backViewSvg?.classList.contains("min-w-[400px]")).toBe(true);
  });

  it("keeps the jib luff aligned with the forestay while pointing to each part distinctly", () => {
    loadProgressMock.mockReturnValueOnce(new Promise(() => undefined));
    const { container } = render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    const jibMarker = container.querySelector('[data-marker-id="jib"]');
    const forestayMarker = container.querySelector('[data-marker-id="forestay"]');
    const sideView = jibMarker?.closest("svg");

    expect(sideView?.querySelector('[data-geometry="jib"]')?.getAttribute("d")).toBe("M278,46 L490,190 L355,176 Z");
    expect(sideView?.querySelector('[data-geometry="forestay"]')).not.toBeNull();
    expect(sideView?.querySelector('[data-geometry="forestay"]')?.getAttribute("x2")).toBe("520");
    expect(jibMarker?.querySelector("line")?.getAttribute("x2")).toBe("385");
    expect(jibMarker?.querySelector("line")?.getAttribute("y2")).toBe("145");
    expect(forestayMarker?.querySelector("line")?.getAttribute("x2")).toBe("505");
    expect(forestayMarker?.querySelector("line")?.getAttribute("y2")).toBe("200");
  });
});
