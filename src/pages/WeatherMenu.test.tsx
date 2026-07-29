// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import WeatherMenu from "./WeatherMenu";

vi.mock("@/components/CompletionBadge", () => ({
  CompletionBadge: () => null,
}));

const LocationProbe = () => {
  const location = useLocation();
  return <output aria-label="location">{location.pathname}</output>;
};

describe("WeatherMenu", () => {
  it("renders all meteorology modules and navigates from a module action", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={["/weather"]}><WeatherMenu /><LocationProbe /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Meteorology" })).toBeTruthy();
    expect(screen.getByText("Weather Systems & Fronts")).toBeTruthy();
    expect(screen.getByText("Meteorology Quiz")).toBeTruthy();
    const starts = screen.getAllByRole("button", { name: /start learning/i });
    await user.click(starts[0]);
    expect(screen.getByLabelText("location").textContent).toBe("/weather/systems");
  });
});
