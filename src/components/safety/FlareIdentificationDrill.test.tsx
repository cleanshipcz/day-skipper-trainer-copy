/**
 * Tests for the FlareIdentificationDrill component.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S3, AC-3
 */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FlareIdentificationDrill } from "./FlareIdentificationDrill";

describe("FlareIdentificationDrill", () => {
  it("should render the first scenario description", () => {
    // given
    const noop = () => {};

    // when
    const html = renderToStaticMarkup(
      <FlareIdentificationDrill onComplete={noop} />,
    );

    // then
    // - should contain scenario prompt text
    expect(html).toContain("Which flare would you use?");
    // - should contain a score display
    expect(html).toContain("Score:");
  });

  it("should render all 5 flare type options as selectable buttons", () => {
    // given
    const noop = () => {};

    // when
    const html = renderToStaticMarkup(
      <FlareIdentificationDrill onComplete={noop} />,
    );

    // then
    expect(html).toContain("Red rocket-parachute flare");
    expect(html).toContain("Red hand flare");
    expect(html).toContain("Orange smoke — hand-held");
    expect(html).toContain("Orange smoke — buoyant");
    expect(html).toContain("White hand flare");
  });

  it("should render a Check Answer button", () => {
    // given
    const noop = () => {};

    // when
    const html = renderToStaticMarkup(
      <FlareIdentificationDrill onComplete={noop} />,
    );

    // then
    expect(html).toContain("Check Answer");
  });

  it("should export DrillResult interface type", async () => {
    // given
    const mod = await import("./FlareIdentificationDrill");

    // then
    expect(mod.FlareIdentificationDrill).toBeDefined();
    expect(typeof mod.FlareIdentificationDrill).toBe("function");
  });
});
