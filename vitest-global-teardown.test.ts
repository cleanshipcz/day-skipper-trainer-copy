import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { teardown } from "./vitest-global-teardown";

describe("vitest-global-teardown", () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let originalExitCode: number | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as unknown as (code?: number) => never);
    originalExitCode = process.exitCode;
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
    exitSpy.mockRestore();
    vi.useRealTimers();
  });

  test("should schedule process.exit after teardown to prevent CI hang", async () => {
    // when
    await teardown();
    vi.advanceTimersByTime(3_000);

    // then
    expect(exitSpy).toHaveBeenCalledOnce();
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  test("should preserve non-zero exitCode set by Vitest on failure", async () => {
    // given
    process.exitCode = 1;

    // when
    await teardown();
    vi.advanceTimersByTime(3_000);

    // then
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  test("should not call process.exit synchronously", async () => {
    // when
    await teardown();

    // then - exit must be deferred, not immediate
    expect(exitSpy).not.toHaveBeenCalled();
  });
});
