import type { ReactElement } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthHooks";
import { ROUTER_FUTURE } from "@/app/routerFuture";

const LocationProbe = () => {
  const location = useLocation();
  return <output aria-label="current route">{location.pathname}</output>;
};

interface RouteSmokeHarnessProps {
  element: ReactElement;
  initialPath: string;
  routePath?: string;
}

export const RouteSmokeHarness = ({
  element,
  initialPath,
  routePath = initialPath,
}: RouteSmokeHarnessProps) => (
  <AuthContext.Provider value={{
    user: null,
    session: null,
    loading: false,
    signOut: async () => undefined,
  }}>
    <MemoryRouter initialEntries={[initialPath]} future={ROUTER_FUTURE}>
      <LocationProbe />
      <Routes>
        <Route path={routePath} element={element} />
        <Route path="*" element={<p>Navigation destination</p>} />
      </Routes>
    </MemoryRouter>
  </AuthContext.Provider>
);
