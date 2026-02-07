import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NauticalTermsMenu from "./pages/NauticalTermsMenu";
import NauticalTerms from "./pages/NauticalTerms";
import SailControls from "./pages/SailControls";
import RopeworkTheory from "./pages/RopeworkTheory";
import AnchorTheory from "./pages/AnchorTheory";
import AnchorMinigame from "./pages/AnchorMinigame";
import VictuallingTheory from "./pages/VictuallingTheory";
import EngineTheory from "./pages/EngineTheory";
import RigTheory from "./pages/RigTheory";
import Quiz from "./pages/Quiz";
import RulesOfTheRoadMenu from "./pages/RulesOfTheRoadMenu";
import ColregTheory from "./pages/ColregTheory";
import LightsTheory from "./pages/LightsTheory";
import LightsSignalsMenu from "./pages/LightsSignalsMenu";
import NavigationMenu from "./pages/NavigationMenu";
import ChartsTheory from "./pages/ChartsTheory";
import CompassTheory from "./pages/CompassTheory";
import PositionFixingTheory from "./pages/PositionFixingTheory";
import NotFound from "./pages/NotFound";
import TidesMenu from "./pages/TidesMenu";
import TidalTheory from "./pages/TidalTheory";
import TidalHeightsTheory from "./pages/TidalHeightsTheory";
import TidalHeightsCalculator from "./pages/TidalHeightsCalculator";
import TidalStreamsTheory from "./pages/TidalStreamsTheory";
import VectorTriangleTool from "./pages/VectorTriangleTool";
import SafetyMenu from "./pages/SafetyMenu";
import ManOverboardTheory from "./pages/ManOverboardTheory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/nautical-terms" element={<NauticalTermsMenu />} />
            <Route path="/nautical-terms/boat-parts" element={<NauticalTerms />} />
            <Route path="/nautical-terms/sail-controls" element={<SailControls />} />
            <Route path="/ropework" element={<RopeworkTheory />} />
            <Route path="/anchorwork" element={<AnchorTheory />} />
            <Route path="/anchor-minigame" element={<AnchorMinigame />} />
            <Route path="/victualling" element={<VictuallingTheory />} />
            <Route path="/engine" element={<EngineTheory />} />
            <Route path="/rig" element={<RigTheory />} />
            <Route path="/rules-of-the-road" element={<RulesOfTheRoadMenu />} />
            <Route path="/rules/colregs" element={<ColregTheory />} />
            <Route path="/rules/lights" element={<LightsSignalsMenu />} />
            <Route path="/rules/lights/theory" element={<LightsTheory />} />
            <Route path="/navigation" element={<NavigationMenu />} />
            <Route path="/navigation/charts" element={<ChartsTheory />} />
            <Route path="/navigation/compass" element={<CompassTheory />} />
            <Route path="/navigation/position" element={<PositionFixingTheory />} />
            <Route path="/navigation/tides" element={<TidesMenu />} />
            <Route path="/navigation/tides/theory" element={<TidalTheory />} />
            <Route path="/navigation/tides/heights-theory" element={<TidalHeightsTheory />} />
            <Route path="/navigation/tides/heights-calc" element={<TidalHeightsCalculator />} />
            <Route path="/navigation/tides/streams-theory" element={<TidalStreamsTheory />} />
            <Route path="/navigation/tides/streams-theory" element={<TidalStreamsTheory />} />
            <Route path="/navigation/tides/vector-tool" element={<VectorTriangleTool />} />
            <Route path="/safety" element={<SafetyMenu />} />
            <Route path="/safety/mob" element={<ManOverboardTheory />} />
            <Route path="/quiz/:topicId" element={<Quiz />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
