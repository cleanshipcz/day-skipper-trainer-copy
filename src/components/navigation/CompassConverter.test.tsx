import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import CompassConverter from "./CompassConverter";
import { normalizeHeading } from "./compassHeading";

const text = (name: RegExp) => screen.getByLabelText(name).textContent;

describe("CompassConverter", () => {
  it("withholds results until every field is complete and clears stale results", async () => {
    const user = userEvent.setup();
    render(<CompassConverter />);
    const trueInput = screen.getByLabelText(/True heading in degrees true/);
    await user.type(trueInput, "0"); await user.type(screen.getByLabelText(/Variation magnitude in degrees/), "0");
    expect(text(/course to steer/)).toContain("--");
    await user.type(screen.getByLabelText(/Deviation magnitude in degrees/), "0");
    expect(text(/course to steer/)).toContain("000");
    await user.clear(trueInput);
    expect((trueInput as HTMLInputElement).value).toBe("");
    expect(text(/magnetic heading/)).toContain("--");
    expect(screen.queryByText("Course to steer")).toBeNull();
    await user.type(trueInput, "12");
    expect(text(/course to steer/)).toContain("012");
  });

  it.each([[/True heading/, "360", "True heading must be between 0° and 359°."], [/Variation magnitude/, "90.1", "Variation must be between 0° and 90°."], [/Deviation magnitude/, "-0.1", "Deviation must be between 0° and 90°."]])("validates %s bounds", (label, value, message) => {
    render(<CompassConverter />);
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
    expect(screen.getByRole("alert").textContent).toContain(message);
    expect(text(/course to steer/)).toContain("--");
  });

  it("rejects non-finite values in application logic", () => {
    render(<CompassConverter />);
    fireEvent.change(screen.getByLabelText(/True heading/), { target: { value: "Infinity" } });
    expect(screen.getByRole("alert").textContent).toContain("finite number");
  });

  it("accepts bounds and decimals, toggles directions, and rounds only final headings", async () => {
    const user = userEvent.setup(); render(<CompassConverter />);
    await user.type(screen.getByLabelText(/True heading/), "359"); await user.type(screen.getByLabelText(/Variation magnitude/), "0.4"); await user.type(screen.getByLabelText(/Deviation magnitude/), "90");
    expect(text(/magnetic heading/)).toContain("359");
    expect(text(/course to steer/)).toContain("269");
    await user.click(screen.getByRole("button", { name: "Variation direction: East" }));
    await user.click(screen.getByRole("button", { name: "Deviation direction: East" }));
    expect(text(/course to steer/)).toContain("089");
  });

  it("exposes toggle state and announces a completed result only after field exit", async () => {
    const user = userEvent.setup(); render(<CompassConverter />);
    const toggle = screen.getByRole("button", { name: "Variation direction: East" });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    await user.type(screen.getByLabelText(/True heading/), "100");
    await user.type(screen.getByLabelText(/Variation magnitude/), "5");
    await user.type(screen.getByLabelText(/Deviation magnitude/), "2");
    fireEvent.blur(screen.getByLabelText(/Deviation magnitude/));
    expect(document.querySelector("p[aria-live=polite]")?.textContent).toContain("093 degrees compass");
    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Variation direction: West" }).getAttribute("aria-pressed")).toBe("true");
  });
});

describe("normalizeHeading", () => {
  it.each([[0, 0], [359.49, 359], [359.5, 0], [720, 0], [-721, 359], [1081, 1]])("normalizes multiple turns: %s", (input, expected) => expect(normalizeHeading(input)).toBe(expected));
});
