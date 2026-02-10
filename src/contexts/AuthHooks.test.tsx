import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { AuthContext, useAuth, type AuthContextType } from "./AuthHooks";

const authValue: AuthContextType = {
  user: null,
  session: null,
  loading: false,
  signOut: async () => {},
};

const UseAuthProbe = () => {
  useAuth();
  return <span>ok</span>;
};

describe("useAuth", () => {
  it("throws when used outside AuthProvider", () => {
    expect(() => renderToString(<UseAuthProbe />)).toThrowError("useAuth must be used within AuthProvider");
  });

  it("returns context when wrapped with AuthProvider value", () => {
    const html = renderToString(
      <AuthContext.Provider value={authValue}>
        <UseAuthProbe />
      </AuthContext.Provider>,
    );

    expect(html).toContain("ok");
  });
});
