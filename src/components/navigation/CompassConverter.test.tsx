import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import CompassConverter from "./CompassConverter";
import { normalizeHeading } from "./compassHeading";

const text = (name: string) => screen.getByLabelText(name).textContent;

describe("CompassConverter", () => {
  it("withholds results until every field is complete and clears stale results", async () => {
    const user = userEvent.setup();
    render(<CompassConverter />);
    const trueInput = screen.getByLabelText("True heading");
    await user.type(trueInput, "0"); await user.type(screen.getByLabelText("Variation"), "0");
    expect(text("Compass heading")).toContain("--");
    await user.type(screen.getByLabelText("Deviation"), "0");
    expect(text("Compass heading")).toContain("000");
    await user.clear(trueInput);
    expect((trueInput as HTMLInputElement).value).toBe("");
    expect(text("Magnetic heading")).toContain("--");
    expect(screen.queryByText("Course to steer")).toBeNull();
    await user.type(trueInput, "12");
    expect(text("Compass heading")).toContain("012");
  });

  it.each([["True heading", "360", "True heading must be between 0° and 359°."], ["Variation", "90.1", "Variation must be between 0° and 90°."], ["Deviation", "-0.1", "Deviation must be between 0° and 90°."]])("validates %s bounds", (label, value, message) => {
    render(<CompassConverter />);
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
    expect(screen.getByRole("alert").textContent).toContain(message);
    expect(text("Compass heading")).toContain("--");
  });

  it("rejects non-finite values in application logic", () => {
    render(<CompassConverter />);
    fireEvent.change(screen.getByLabelText("True heading"), { target: { value: "Infinity" } });
    expect(screen.getByRole("alert").textContent).toContain("finite number");
  });

  it("accepts bounds and decimals, toggles directions, and rounds only final headings", async () => {
    const user = userEvent.setup(); render(<CompassConverter />);
    await user.type(screen.getByLabelText("True heading"), "359"); await user.type(screen.getByLabelText("Variation"), "0.4"); await user.type(screen.getByLabelText("Deviation"), "90");
    expect(text("Magnetic heading")).toContain("359");
    expect(text("Compass heading")).toContain("269");
    await user.click(screen.getByRole("button", { name: "Variation direction E" }));
    await user.click(screen.getByRole("button", { name: "Deviation direction E" }));
    expect(text("Compass heading")).toContain("089");
  });
});

describe("normalizeHeading", () => {
  it.each([[0, 0], [359.49, 359], [359.5, 0], [720, 0], [-721, 359], [1081, 1]])("normalizes multiple turns: %s", (input, expected) => expect(normalizeHeading(input)).toBe(expected));
});
