import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import NauticalTermsMenu from "@/pages/NauticalTermsMenu";
import PassagePlanningMenu from "@/pages/PassagePlanningMenu";
import RulesOfTheRoadMenu from "@/pages/RulesOfTheRoadMenu";
import TidesMenu from "@/pages/TidesMenu";
import { RouteSmokeHarness } from "./RouteSmokeHarness";

const { authCalls } = vi.hoisted(() => ({
  authCalls: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
  },
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: authCalls } }));
vi.mock("@/components/CompletionBadge", () => ({ CompletionBadge: () => null }));

describe("route family render smoke coverage", () => {
  beforeEach(() => {
    authCalls.signInWithPassword.mockReset();
    authCalls.signUp.mockReset();
  });

  it("renders authentication without contacting Supabase", () => {
    render(<RouteSmokeHarness element={<Auth />} initialPath="/auth" />);

    expect(screen.getByRole("heading", { name: "RYA Day Skipper" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeTruthy();
    expect(authCalls.signInWithPassword).not.toHaveBeenCalled();
    expect(authCalls.signUp).not.toHaveBeenCalled();
  });

  it("renders the error family with a home recovery link", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<RouteSmokeHarness element={<NotFound />} initialPath="/missing" routePath="*" />);

    expect(screen.getByRole("heading", { name: "404" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Return to Home" }).getAttribute("href")).toBe("/");
    expect(error).toHaveBeenCalledWith(
      "404 Error: User attempted to access non-existent route:",
      "/missing",
    );
    error.mockRestore();
  });

  it.each([
    {
      family: "nautical basics",
      path: "/nautical-terms",
      element: <NauticalTermsMenu />,
      heading: "Nautical Terms & Boat Parts",
      action: "Start Learning",
      destination: "/nautical-terms/boat-parts",
    },
    {
      family: "rules and lights",
      path: "/rules-of-the-road",
      element: <RulesOfTheRoadMenu />,
      heading: "Rules of the Road",
      action: "Start Learning",
      destination: "/rules/colregs",
    },
    {
      family: "tides",
      path: "/navigation/tides",
      element: <TidesMenu />,
      heading: "Tidal Theory & Streams",
      action: "Start Learning",
      destination: "/navigation/tides/theory",
    },
    {
      family: "passage planning",
      path: "/passage-planning",
      element: <PassagePlanningMenu />,
      heading: "Passage Planning",
      action: "Start Learning",
      destination: "/passage-planning/prepare",
    },
  ])("renders $family and navigates through its primary action", ({
    path, element, heading, action, destination,
  }) => {
    render(<RouteSmokeHarness element={element} initialPath={path} />);

    expect(screen.getByRole("heading", { name: heading })).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: action })[0]);
    expect(screen.getByLabelText("current route").textContent).toBe(destination);
    expect(screen.getByText("Navigation destination")).toBeTruthy();
  });
});
