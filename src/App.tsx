import { lazy, Suspense, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { appRoutes } from "@/app/routes";
import { ROUTER_FUTURE } from "@/app/routerFuture";
import { OfflineSupport } from "@/components/OfflineSupport";
import { AppShellErrorBoundary } from "@/components/AppShellErrorBoundary";
import { ServiceWorkerLifecycle } from "@/components/ServiceWorkerLifecycle";

const queryClient = new QueryClient();

const App = () => {
  const [routeLoadAttempt, setRouteLoadAttempt] = useState(0);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={ROUTER_FUTURE}>
          <AuthProvider>
            <OfflineSupport />
            <ServiceWorkerLifecycle />
            <AppShellErrorBoundary onRetry={() => setRouteLoadAttempt((attempt) => attempt + 1)}>
              <Suspense fallback={<div role="status" className="p-6 text-sm text-muted-foreground">Loading page...</div>}>
                <Routes key={routeLoadAttempt}>
                  {appRoutes.map((route) => {
                    // A fresh lazy wrapper is intentional: rejected import promises
                    // are cached by React, so recovery must create a new attempt.
                    const RouteComponent = lazy(route.importPage);
                    return <Route key={route.path} path={route.path} element={<RouteComponent />} />;
                  })}
                </Routes>
              </Suspense>
            </AppShellErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
