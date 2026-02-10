import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { ROUTER_FUTURE } from "@/app/routerFuture";

type TestRouterProps = {
  children: ReactNode;
};

export default function TestRouter({ children }: TestRouterProps) {
  return <BrowserRouter future={ROUTER_FUTURE}>{children}</BrowserRouter>;
}
