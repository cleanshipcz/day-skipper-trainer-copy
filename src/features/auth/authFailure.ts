type AuthFailureDetails = {
  name?: unknown;
  message?: unknown;
  status?: unknown;
};

export type AuthFailureDiagnostic = {
  kind: "network" | "service" | "unknown";
  authOrigin: string;
  online: boolean | null;
  errorName: string | null;
  status: number | null;
};

const NETWORK_FAILURE = /failed to fetch|network(?: request)?|load failed|fetch failed|cors/i;

const safeAuthOrigin = (supabaseUrl: string): string => {
  try {
    return new URL(supabaseUrl).origin;
  } catch {
    return "invalid Supabase URL";
  }
};

export const diagnoseAuthFailure = (
  error: unknown,
  supabaseUrl: string,
  online: boolean | null = typeof navigator === "undefined" ? null : navigator.onLine,
): AuthFailureDiagnostic => {
  const details: AuthFailureDetails = error && typeof error === "object" ? error : {};
  const message = typeof details.message === "string" ? details.message : "";
  const status = typeof details.status === "number" && Number.isFinite(details.status) ? details.status : null;
  const errorName = typeof details.name === "string" ? details.name : null;
  const serviceFailure = status !== null && status !== 0;
  const networkFailure = !serviceFailure && (online === false || status === 0 || NETWORK_FAILURE.test(message));

  return {
    kind: serviceFailure ? "service" : networkFailure ? "network" : "unknown",
    authOrigin: safeAuthOrigin(supabaseUrl),
    online,
    errorName,
    status,
  };
};

export const reportAuthFailure = (error: unknown, supabaseUrl: string): string => {
  const diagnostic = diagnoseAuthFailure(error, supabaseUrl);

  // Deliberately log only non-sensitive transport metadata. Auth inputs,
  // tokens, keys, and the error message are excluded because browser console
  // reports are commonly copied into support tickets.
  console.error("Supabase authentication request failed", diagnostic);

  if (diagnostic.kind === "network") {
    return `Could not reach the authentication service (${diagnostic.authOrigin}). Check your connection and try again. If this persists, report this service address to support.`;
  }

  return error instanceof Error ? error.message : "Authentication failed. Please try again.";
};
