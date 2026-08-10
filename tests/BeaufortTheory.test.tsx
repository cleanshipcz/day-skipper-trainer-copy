import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BeaufortTheory from "@/pages/BeaufortTheory";
import TestRouter from "./TestRouter";

const progress = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn() }));

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    ownerId: "account-a",
    loadProgressDetailed: progress.load,
    saveProgressDetailed: progress.save,
  }),
}));

describe("BeaufortTheory authoritative marine reference", () => {
  beforeEach(() => {
    window.localStorage.clear();
    progress.load.mockReset().mockResolvedValue({ status: "missing", record: null });
    progress.save.mockReset().mockResolvedValue("remote");
  });

  it("renders probable and probable-maximum wave heights as distinct values", async () => {
    render(<TestRouter><BeaufortTheory /></TestRouter>);
    await screen.findByRole("button", { name: /mark theory complete/i });

    const table = screen.getByRole("table", { name: "Complete Beaufort reference" });
    expect(within(table).getByRole("columnheader", { name: "Probable wave height" })).toBeTruthy();
    expect(within(table).getByRole("columnheader", { name: "Probable maximum" })).toBeTruthy();

    const forceEight = within(table).getByRole("rowheader", { name: "8" }).closest("tr");
    expect(forceEight).toBeTruthy();
    expect(within(forceEight!).getByText("5.5 m")).toBeTruthy();
    expect(within(forceEight!).getByText("7.5 m")).toBeTruthy();

    const forceTwelve = within(table).getByRole("rowheader", { name: "12" }).closest("tr");
    expect(forceTwelve).toBeTruthy();
    expect(within(forceTwelve!).getByText("Hurricane force")).toBeTruthy();
    expect(within(forceTwelve!).getByText("14 m+")).toBeTruthy();
    expect(within(forceTwelve!).getByText("Not specified")).toBeTruthy();
  });

  it("explains wave limitations, terminology and links its Met Office source", async () => {
    render(<TestRouter><BeaufortTheory /></TestRouter>);
    await screen.findByRole("button", { name: /mark theory complete/i });

    expect(screen.getByText(/well-developed wind waves in the open sea/i).textContent).toMatch(/fetch.*wind duration.*water depth.*swell.*lags/i);
    expect(screen.getByText(/Force 12 means “Hurricane force”/i).closest("p")?.textContent).toMatch(/does not by itself classify a tropical cyclone as a hurricane/i);

    const source = screen.getByRole("link", { name: "Met Office: Beaufort wind force scale" });
    expect(source.getAttribute("href")).toBe("https://weather.metoffice.gov.uk/guides/coast-and-sea/beaufort-scale");
    expect(source.getAttribute("target")).toBe("_blank");
    expect(source.getAttribute("rel")).toBe("noreferrer");
  });

  it("teaches all sea states with responsive original visuals and a height caveat", async () => {
    render(<TestRouter><BeaufortTheory /></TestRouter>);
    await screen.findByRole("button", { name: /mark theory complete/i });

    expect(screen.getByRole("heading", { name: "Sea-state visual guide" })).toBeTruthy();
    expect(screen.getAllByTestId("beaufort-sea-visual")).toHaveLength(13);
    expect(screen.getByText(/Compare wave scale, breaking crests, foam and spray—not height alone/i).textContent).toMatch(/Fetch.*duration.*depth.*swell/i);
    expect(screen.getByText(/Artwork provenance:/i).closest("p")?.textContent).toMatch(/Original project SVG artwork.*no third-party image/i);
  });

  it("explains and exposes decimal normalization when it changes the force", async () => {
    const user = userEvent.setup();
    render(<TestRouter><BeaufortTheory /></TestRouter>);
    await screen.findByRole("button", { name: /mark theory complete/i });

    const input = screen.getByLabelText("Wind speed (knots)");
    expect(input.getAttribute("step")).toBe("0.1");
    expect(input.getAttribute("aria-describedby")).toBe("wind-speed-policy");
    expect(screen.getByText(/limits are stated in whole knots/i).textContent).toMatch(/nearest whole knot.*half a knot rounds up/i);

    await user.type(input, "10.75");
    expect(screen.getByText(/Force 4: Moderate breeze/i).textContent).toMatch(/Rounded 10.75 to 11 knots before lookup/i);

    await user.clear(input);
    await user.type(input, "3.49");
    expect(screen.getByText(/Force 1: Light air/i).textContent).toMatch(/Rounded 3.49 to 3 knots before lookup/i);
  });
});
