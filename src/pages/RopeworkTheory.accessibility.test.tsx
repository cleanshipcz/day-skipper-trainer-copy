import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import { knots } from "@/data/ropeworkKnots";

const progressMocks = vi.hoisted(() => ({
  load: vi.fn().mockResolvedValue({ status: "anonymous", record: null }),
  save: vi.fn().mockResolvedValue("anonymous"),
}));
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    loadProgressDetailed: progressMocks.load,
    saveProgressDetailed: progressMocks.save,
  }),
}));
vi.mock("@/contexts/AuthHooks", () => ({ useAuth: () => ({ user: null }) }));
import RopeworkTheory from "./RopeworkTheory";

const LocationProbe = () => {
  const location = useLocation();
  return <p>Current path: {location.pathname}</p>;
};

const renderPage = () => render(
  <MemoryRouter initialEntries={["/ropework"]}>
    <Routes>
      <Route path="/ropework" element={<RopeworkTheory />} />
      <Route path="*" element={<LocationProbe />} />
    </Routes>
  </MemoryRouter>,
);

describe("RopeworkTheory accessible knot discovery", () => {
  it("provides one named native control per knot and exposes selection and learning", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText(/Sign in to save/);

    const controls = knots.map((knot) => screen.getByRole("button", { name: knot.name }));
    expect(controls).toHaveLength(knots.length);
    expect(screen.getByRole("heading", { name: knots[0].name })).toBeTruthy();
    expect(controls[0].querySelector("h3, p, div")).toBeNull();
    expect(controls[0].getAttribute("aria-pressed")).toBe("false");
    expect(controls[0].getAttribute("aria-describedby")).toContain(`${knots[0].id}-state`);
    expect(screen.getByText("Not learned", { selector: `#${knots[0].id}-state` })).toBeTruthy();

    controls[0].focus();
    await user.keyboard("{Enter}");

    expect(controls[0].getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Learned", { selector: `#${knots[0].id}-state` })).toBeTruthy();
    const detailsHeading = screen.getByRole("heading", { name: `${knots[0].name} details` });
    await waitFor(() => expect(document.activeElement).toBe(detailsHeading));
    expect(screen.getByRole("status").textContent).toContain(`${knots[0].name} learned`);

    await user.click(screen.getByRole("button", { name: `Back to ${knots[0].name} in knot list` }));
    expect(document.activeElement).toBe(controls[0]);
  });

  it("supports Space activation without introducing a second card focus stop", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText(/Sign in to save/);

    const secondKnot = knots[1];
    const cardControl = screen.getByRole("button", { name: secondKnot.name });
    cardControl.focus();
    await user.keyboard(" ");

    expect(cardControl.getAttribute("aria-pressed")).toBe("true");
    await waitFor(() => expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: `${secondKnot.name} details` }),
    ));
    expect(screen.getAllByRole("button", { name: secondKnot.name })).toHaveLength(1);
  });

  it("announces completion and exposes a predictable quiz CTA", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText(/Sign in to save/);

    for (const knot of knots) {
      await user.click(screen.getByRole("button", { name: knot.name }));
    }

    const completion = screen.getByRole("region", { name: /all knots learned/i });
    expect(completion).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain(`All ${knots.length} knots learned`);
    const quizButton = screen.getByRole("button", { name: "Take Quiz" });
    quizButton.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByText("Current path: /quiz/ropework")).toBeTruthy();
  });

  it("gives the icon-only Back control an accessible name", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Back to Home" }));
    expect(await screen.findByText("Current path: /")).toBeTruthy();
  });

  it("keeps a complete accessible lesson when the optional tutorial is unavailable", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText(/Sign in to save/);
    await user.click(screen.getByRole("button", { name: knots[0].name }));

    expect(screen.getByRole("img", { name: new RegExp(`${knots[0].name} final-form diagram`) })).toBeTruthy();
    expect(screen.getByText(knots[0].visualDescription)).toBeTruthy();
    const link = screen.getByRole("link", { name: /optional external tutorial/i });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(screen.getByText(/may be blocked, offline, moved, or unavailable/i)).toBeTruthy();
    await user.click(link);
    expect(screen.getByRole("status").textContent).toContain("new tab");
  });

  it("exposes a continuous, bridged, text-equivalent diagram for every knot", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText(/Sign in to save/);

    for (const knot of knots) {
      await user.click(screen.getByRole("button", { name: knot.name }));
      const figure = document.querySelector(`figure[data-knot-diagram="${knot.id}"]`);
      const image = figure?.querySelector('[role="img"]');
      expect(image?.getAttribute("aria-label")).toContain(`${knot.name} final-form diagram`);
      expect(figure?.getAttribute("data-knot-diagram")).toBe(knot.id);
      expect(Number(figure?.getAttribute("data-rope-count"))).toBe(knot.id === "reef-knot" || knot.id === "sheet-bend" || knot.id === "rolling-hitch" ? 2 : 1);
      expect(Number(figure?.getAttribute("data-bridge-count"))).toBeGreaterThan(0);
      expect(image!.querySelectorAll('[data-rope-path="continuous"]')).toHaveLength(Number(figure?.getAttribute("data-rope-count")));
      expect(image!.querySelectorAll("[data-crossing-bridge]")).toHaveLength(Number(figure?.getAttribute("data-bridge-count")));
      expect(image!.textContent).toContain("working end");
      expect(image!.textContent).toContain("standing part / load");
      expect(screen.getByText(knot.visualDescription)).toBeTruthy();
    }
  });
});
