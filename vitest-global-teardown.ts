/**
 * Vitest global teardown – prevents CI timeout caused by lingering handles.
 *
 * WHY THIS EXISTS
 * ───────────────
 * After all tests finish, the main Vitest process may retain open handles from
 * Vite's transform pipeline (e.g. the `vite:dynamic-import-vars` plugin module
 * graph or unreleased IPC channels to forked workers).  Vitest 4.x does not
 * call `process.exit()` after a successful run — it relies on the Node.js event
 * loop draining naturally.  Lingering ref'd handles prevent draining, causing CI
 * runners to hit their wall-clock timeout (exit code 124).
 *
 * WHAT IT DOES
 * ────────────
 * This global teardown runs in the main Vitest process after all workers finish
 * and results are reported.  It:
 *   1. Unrefs every remaining active handle so the event loop can drain.
 *   2. Schedules a deferred `process.exit()` as a guaranteed safety net.
 *
 * The deferred exit preserves the exit code that Vitest already set
 * (`process.exitCode`), so failed-test runs still report the correct status.
 * The 2-second delay lets any pending I/O (coverage writers, reporters) flush
 * before the forced exit.
 */
export async function teardown(): Promise<void> {
  /* ── 1. Best-effort handle cleanup ── */
  const handles: Array<{ unref?: () => void }> =
    (process as unknown as { _getActiveHandles?: () => Array<{ unref?: () => void }> })
      ._getActiveHandles?.() ?? [];

  for (const handle of handles) {
    if (typeof handle?.unref === "function") {
      handle.unref();
    }
  }

  /* ── 2. Guaranteed exit safety net ── */
  // The timer is intentionally *ref'd* so it fires even if unreffing above
  // failed to release all handles.  2 s is enough for reporters / coverage
  // writers to flush while still exiting well before any CI wall-clock timeout.
  setTimeout(() => {
    process.exit(process.exitCode ?? 0);
  }, 2_000);
}
