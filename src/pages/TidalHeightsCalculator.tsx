import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TidalPassageCalculator from "@/components/navigation/TidalPassageCalculator";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { TheoryCompletionButton } from "@/features/progress/TheoryCompletionButton";
import { useState } from "react";

const TidalHeightsCalculator = () => {
  const navigate = useNavigate();
  const [conceptAnswer, setConceptAnswer] = useState<"" | "sum" | "clearance">("");
  const [practiceMastered, setPracticeMastered] = useState(false);

  return (
    <div className="min-h-screen overflow-x-clip bg-gradient-to-br from-blue-50 to-white pb-20">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="Back to Tides" onClick={() => navigate("/navigation/tides")}>
              <ArrowLeft aria-hidden="true" className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Tidal Passage Planner</h1>
              <p className="text-sm text-slate-500">Calculate safe passage windows over shallow water</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 prose prose-slate max-w-none">
          <h3>Safe Passage Calculation</h3>
          <p>
            When planning to cross a shallow area (like a bar or a bank), you need to ensure the
            <strong> Height of Tide</strong> plus <strong>Charted Depth</strong> exceeds your
            <strong> Vessel Draft</strong> plus a safety <strong>Clearance</strong>.
          </p>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 my-4 text-sm font-medium text-blue-800">
            Formula: Height of Tide Required = Draft + Clearance - Charted Depth
          </div>
          <p>
            Use the tool below to input the day's High and Low Water data, your vessel details, and the depth of the
            shallowest point. The graph estimates a window only between the entered published events; it does not
            replace official predictions, observations, or a prudent safety margin.
          </p>
        </div>

        <TidalPassageCalculator onMastery={() => setPracticeMastered(true)} />

        <div className="mt-12 space-y-4 rounded-lg border bg-white p-5 [&_button]:min-h-11">
          <h2 className="font-bold">Safe-window concept check</h2>
          <p>Which test establishes that a predicted passage window meets the vessel requirement?</p>
          <fieldset className="space-y-2"><legend className="sr-only">Safe-window test</legend><label className="flex gap-2"><input type="radio" name="calculator-check" onChange={() => setConceptAnswer("clearance")} /> Charted depth + predicted tide ≥ draft + clearance</label>
          <label className="flex gap-2"><input type="radio" name="calculator-check" onChange={() => setConceptAnswer("sum")} /> Predicted tide alone ≥ draft</label></fieldset>
          {conceptAnswer && <p role="status">{conceptAnswer === "clearance" ? "Correct — and the prediction still needs suitable uncertainty and observation checks." : "Not safe — charted depth and the chosen clearance are both part of the decision."}</p>}
          <TheoryCompletionButton topicId={TOPIC_IDS.TIDES_HEIGHTS_CALCULATOR} catalogueRevision="tides-heights-calculator-v2" evidenceId="planner-mastery" evidenceSatisfied={conceptAnswer === "clearance" && practiceMastered} lockedLabel="Complete one correct practice scenario and the safe-window check" />
        </div>
      </main>
    </div>
  );
};

export default TidalHeightsCalculator;
