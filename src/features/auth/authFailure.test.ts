import { describe, expect, it, vi } from "vitest";
import { diagnoseAuthFailure, reportAuthFailure } from "./authFailure";

describe("auth failure diagnostics", () => {
  it("classifies browser fetch failures without retaining sensitive URL data", () => {
    expect(
      diagnoseAuthFailure(
        new TypeError("Failed to fetch"),
        "https://project.supabase.co/path?token=secret",
        true,
      ),
    ).toEqual({
      kind: "network",
      authOrigin: "https://project.supabase.co",
      online: true,
      errorName: "TypeError",
      status: null,
    });
  });

  it("classifies an HTTP auth response as a service failure", () => {
    expect(diagnoseAuthFailure({ name: "AuthApiError", message: "Invalid login", status: 400 }, "https://project.supabase.co", true))
      .toMatchObject({ kind: "service", status: 400 });
  });

  it.each([
    [400, "CORS policy rejected the request"],
    [503, "Network request failed upstream"],
  ])("prioritizes a real HTTP %i response over network-like wording", (status, message) => {
    expect(diagnoseAuthFailure({ name: "AuthApiError", message, status }, "https://project.supabase.co", false))
      .toMatchObject({ kind: "service", status });
  });

  it("returns an actionable network message and logs only sanitized metadata", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const error = new TypeError("Failed to fetch password=do-not-log");

    const message = reportAuthFailure(error, "https://project.supabase.co/auth/v1?apikey=do-not-log");

    expect(message).toContain("https://project.supabase.co");
    expect(message).not.toContain("do-not-log");
    expect(consoleError).toHaveBeenCalledWith("Supabase authentication request failed", {
      kind: "network",
      authOrigin: "https://project.supabase.co",
      online: navigator.onLine,
      errorName: "TypeError",
      status: null,
    });
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("do-not-log");
  });
});
