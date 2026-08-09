import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Slider } from "@/components/ui/slider";

describe("Slider", () => {
  it("passes aria-label to its interactive thumb", () => {
    render(<Slider aria-label="Tidal height" value={[2]} max={6} />);
    expect(screen.getByRole("slider", { name: "Tidal height" })).toBeTruthy();
  });

  it("passes aria-labelledby to its interactive thumb", () => {
    render(<><span id="speed-label">Boat speed</span><Slider aria-labelledby="speed-label" value={[3]} max={10} /></>);
    expect(screen.getByRole("slider", { name: "Boat speed" })).toBeTruthy();
  });
});
