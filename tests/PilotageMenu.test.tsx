/**
 * Tests for the PilotageMenu page.
 *
 * Validates that the pilotage module menu renders correctly
 * and includes the buoyage sub-module link.
 *
 * @see docs/FEATURE_TASKS.md — Story E2-S1
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PilotageMenu from "../src/pages/PilotageMenu";
import TestRouter from "./TestRouter";

// Mock the ModuleMenuPage component to isolate menu tests
vi.mock("@/components/module-menu/ModuleMenuPage", () => ({
  ModuleMenuPage: ({
    title,
    subtitle,
    modules,
  }: {
    title: string;
    subtitle: string;
    modules: Array<{ id: string; title: string; path: string }>;
  }) => (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <ul>
        {modules.map((m) => (
          <li key={m.id}>
            <a href={m.path}>{m.title}</a>
          </li>
        ))}
      </ul>
    </div>
  ),
}));

describe("PilotageMenu Page", () => {
  it("should render the pilotage module menu with title", () => {
    // when
    render(
      <TestRouter>
        <PilotageMenu />
      </TestRouter>
    );

    // then
    expect(screen.getByText("Pilotage")).toBeDefined();
  });

  it("should include the IALA Buoyage sub-module", () => {
    // when
    render(
      <TestRouter>
        <PilotageMenu />
      </TestRouter>
    );

    // then
    expect(screen.getByText("IALA Buoyage")).toBeDefined();
  });

  it("should link buoyage sub-module to /pilotage/buoyage", () => {
    // when
    render(
      <TestRouter>
        <PilotageMenu />
      </TestRouter>
    );

    // then
    const buoyageLink = screen.getByText("IALA Buoyage").closest("a");
    expect(buoyageLink?.getAttribute("href")).toBe("/pilotage/buoyage");
  });
});
