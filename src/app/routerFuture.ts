import type { FutureConfig } from "react-router-dom";

/**
 * Centralized React Router v7 future flags.
 *
 * Keeping this in one place prevents drift between app/runtime and tests,
 * and removes repeated deprecation warnings while we stay on v6.
 */
export const ROUTER_FUTURE: FutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};
