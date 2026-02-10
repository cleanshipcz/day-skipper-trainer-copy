import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { appRoutes } from "@/app/routes";
import { ROUTER_FUTURE } from "@/app/routerFuture";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={ROUTER_FUTURE}>
        <AuthProvider>
          <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading page...</div>}>
            <Routes>
              {appRoutes.map((route) => {
                const RouteComponent = route.lazyElement;
                return <Route key={route.path} path={route.path} element={<RouteComponent />} />;
              })}
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
