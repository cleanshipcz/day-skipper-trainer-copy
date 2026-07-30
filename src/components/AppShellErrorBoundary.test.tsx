import { lazy, Suspense } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { AppShellErrorBoundary } from "./AppShellErrorBoundary";

describe("AppShellErrorBoundary", () => {
  test("offers recovery when a lazy route import fails", async () => {
    const FailedRoute = lazy(() => Promise.reject(new Error("chunk unavailable")));

    render(
      <AppShellErrorBoundary>
        <Suspense fallback="Loading">
          <FailedRoute />
        </Suspense>
      </AppShellErrorBoundary>,
    );

    expect((await screen.findByRole("alert")).textContent).toContain("This page could not be opened");
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reload app" })).toBeTruthy();
  });

  test("retry remounts the page after a render exception without reloading", async () => {
    let shouldFail = true;
    const RecoverablePage = () => {
      if (shouldFail) throw new Error("render failed");
      return <p>Recovered page</p>;
    };

    render(
      <AppShellErrorBoundary>
        <RecoverablePage />
      </AppShellErrorBoundary>,
    );

    await screen.findByRole("alert");
    shouldFail = false;
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => expect(screen.getByText("Recovered page")).toBeTruthy());
  });
});
