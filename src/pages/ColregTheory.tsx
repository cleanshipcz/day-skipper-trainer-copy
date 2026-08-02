import { useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheoryCompletionGate } from "@/features/progress/useTheoryCompletionGate";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { ColregScenarioExercise } from "@/components/colregs/ColregScenarioExercise";

export type ColregRule = { rule: number; title: string; scope: string; points: string[] };

/** Learning summaries, not substitutes for the Regulations' operative text. */
// eslint-disable-next-line react-refresh/only-export-components
export const COLREG_RULES: ColregRule[] = [
  { rule: 5, title: "Look-out", scope: "All vessels, at all times", points: [
    "Maintain a proper look-out by sight, hearing and every available means appropriate to the circumstances and conditions.",
    "The purpose is a full appraisal of the situation and risk of collision.",
  ] },
  { rule: 6, title: "Safe speed", scope: "All vessels, at all times", points: [
    "Proceed at a safe speed so effective avoiding action can be taken and the vessel can be stopped within an appropriate distance.",
    "Consider visibility, traffic density, manoeuvrability (including stopping and turning), background light, wind/sea/current, hazards and draught; radar-equipped vessels also consider radar limitations, scale, clutter, detection range and radar-derived assessments.",
  ] },
  { rule: 7, title: "Risk of collision", scope: "All vessels, at all times", points: [
    "Use all available means appropriate to the circumstances; if there is any doubt, deem risk to exist.",
    "Use radar properly when fitted, including long-range scanning and plotting or equivalent systematic observation; do not rely on scanty information.",
    "A bearing that does not appreciably change is a warning, but risk can exist despite bearing change, especially with a large vessel, tow or at close range.",
  ] },
  { rule: 8, title: "Action to avoid collision", scope: "All vessels, at all times", points: [
    "Action must comply with these Rules, be positive, made in ample time and show good seamanship; course or speed changes should be large enough to be readily apparent and avoid successive small alterations.",
    "If there is room, a course alteration alone may be most effective if made in good time, substantial and not creating another close-quarters situation.",
    "Pass at a safe distance and check the action's effectiveness until the other vessel is finally past and clear; slacken speed, stop or reverse if necessary.",
    "A vessel required not to impede must take early action to allow sufficient sea-room. That duty remains when collision risk develops, while the other vessel still complies with the applicable Part B rules.",
  ] },
  { rule: 9, title: "Narrow channels", scope: "All visibility; channels and fairways", points: [
    "A vessel proceeding along a narrow channel or fairway keeps as near the starboard outer limit as is safe and practicable.",
    "A vessel under 20 m or sailing vessel must not impede a vessel that can safely navigate only within the channel; a fishing vessel must not impede any vessel navigating within it.",
    "Do not cross if that would impede such a channel-bound vessel. Overtaking requires agreement where the vessel ahead must act; near a bend or obstruction navigate with particular alertness and caution. Avoid anchoring where circumstances allow.",
  ] },
  { rule: 10, title: "Traffic separation schemes", scope: "All visibility; IMO-adopted TSS", points: [
    "Use the correct lane in its traffic-flow direction, keep clear of separation lines/zones, and normally join or leave at lane ends or at as small an angle as practicable.",
    "Avoid crossing; if obliged, cross on a heading as nearly as practicable at right angles to the traffic flow. Inshore traffic zones have limited permitted uses.",
    "Fishing vessels, vessels under 20 m and sailing vessels must not impede a power-driven vessel following a lane. A vessel not using the scheme avoids it by as wide a margin as practicable.",
    "Rule 10 does not relieve any vessel of obligations under any other Rule.",
  ] },
  { rule: 12, title: "Sailing vessels", scope: "Vessels in sight; two sailing vessels", points: [
    "Different sides: the vessel with wind on the port side keeps out of the way.",
    "Same side: the windward vessel keeps out of the way of the leeward vessel.",
    "If a port-wind vessel sees a vessel to windward and cannot determine whether the other has wind on port or starboard, she keeps out of the way. For this rule, windward side is opposite the mainsail side (or largest fore-and-aft sail).",
  ] },
  { rule: 13, title: "Overtaking", scope: "Vessels in sight; any vessel overtaking any other", points: [
    "The overtaking vessel keeps out of the way, despite anything in Rules 4–18.",
    "Overtaking means approaching from more than 22.5° abaft the beam (at night, only the sternlight visible). If in doubt, assume overtaking.",
    "A later bearing change does not turn the overtaker into a crossing vessel or end the duty until finally past and clear.",
  ] },
  { rule: 14, title: "Head-on", scope: "Vessels in sight; two power-driven vessels", points: [
    "When meeting on reciprocal or nearly reciprocal courses with risk of collision, each alters to starboard and passes port-to-port.",
    "The situation exists when seen ahead or nearly ahead with the prescribed night aspect or corresponding day aspect. If in doubt, assume it exists.",
  ] },
  { rule: 15, title: "Crossing", scope: "Vessels in sight; two power-driven vessels", points: [
    "When crossing with risk of collision, the vessel with the other on her starboard side keeps out of the way.",
    "If circumstances admit, the give-way vessel avoids crossing ahead.",
  ] },
  { rule: 16, title: "Give-way vessel", scope: "Vessels in sight", points: [
    "Take early and substantial action to keep well clear.",
  ] },
  { rule: 17, title: "Stand-on vessel", scope: "Vessels in sight", points: [
    "Initially keep course and speed while continuing the Rules 5, 7 and 8 assessment.",
    "You may act by your manoeuvre alone as soon as it becomes apparent that the give-way vessel is not taking appropriate action.",
    "When so close that the give-way vessel's action alone cannot avoid collision, you must take the action that will best aid avoidance.",
    "In a power-driven crossing situation, a stand-on vessel acting under the may-act stage should, if circumstances admit, not alter to port for a vessel on her own port side. The give-way vessel is not relieved of her duty.",
  ] },
];

// eslint-disable-next-line react-refresh/only-export-components
export const RULE_18_DECISIONS = [
  "First apply Rules 9, 10 and 13: narrow-channel, TSS and overtaking duties can control before Rule 18.",
  "Except where Rules 9, 10 and 13 otherwise require, a power-driven vessel underway keeps out of the way of NUC, RAM, fishing and sailing vessels.",
  "A sailing vessel underway keeps out of NUC, RAM and fishing vessels; a fishing vessel underway, so far as possible, keeps out of NUC and RAM vessels.",
  "Any vessel other than NUC or RAM should, if circumstances permit, avoid impeding the safe passage of a vessel constrained by her draught exhibiting Rule 28 signals; the CBD vessel navigates with particular caution.",
  "A seaplane generally keeps well clear of all vessels and avoids impeding navigation, but follows Part B when collision risk exists.",
  "A WIG craft taking off, landing or flying near the surface keeps well clear and avoids impeding all other vessels; when operating on the surface it follows Part B as a power-driven vessel.",
];

// Rule 18 sits in Part B, Section II; it applies only when vessels are in sight.
export const RULE_18_SCOPE = "Vessels in sight of one another";
const COLREG_COMPLETION_SECTIONS = ["framework", "rules-5-17", "rule-18", "rule-19", "applied"];

const ColregTheory = () => {
  const navigate = useNavigate();
  const requiredSections = COLREG_COMPLETION_SECTIONS;
  const { canComplete, markCompleted, markSectionVisited, visitedSectionIds, saveState } = useTheoryCompletionGate({ topicId: TOPIC_IDS.COLREGS_THEORY, requiredSectionIds: requiredSections, pointsOnComplete: 10, catalogueRevision: "colregs-part-b-v1" });
  const reviewButton = (id: string, label: string) => <Button variant="outline" disabled={visitedSectionIds.includes(id)} onClick={() => void markSectionVisited(id)}>{visitedSectionIds.includes(id) ? "Reviewed" : label}</Button>;

  return <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background pb-20">
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40"><div className="container mx-auto px-4 py-4 flex items-center gap-3">
      <Button aria-label="Back to rules of the road" variant="ghost" size="icon" onClick={() => navigate("/rules-of-the-road")}><ArrowLeft className="w-5 h-5" /></Button>
      <div><h1 className="text-xl font-bold">Steering &amp; Sailing Rules</h1><p className="text-sm text-muted-foreground">COLREG Part B — Rules 4–19</p></div>
    </div></header>
    <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <section className="space-y-3"><h2 className="text-2xl font-semibold flex gap-2"><Compass />How Part B works</h2>
        <p>Rule 2 frames every decision: nothing in the Rules excuses neglect of the Rules, ordinary seamanlike precautions or special circumstances. In immediate danger, a departure may be necessary to avoid that danger.</p>
        <div className="grid md:grid-cols-3 gap-3">
          <Card><CardContent className="pt-6"><Badge>Section I</Badge><h3 className="font-bold mt-2">Rules 4–10</h3><p className="text-sm text-muted-foreground">Conduct of vessels in any condition of visibility.</p></CardContent></Card>
          <Card><CardContent className="pt-6"><Badge>Section II</Badge><h3 className="font-bold mt-2">Rules 11–18</h3><p className="text-sm text-muted-foreground">Applies only when vessels are in sight of one another. Rule 11 establishes that scope.</p></CardContent></Card>
          <Card><CardContent className="pt-6"><Badge>Section III</Badge><h3 className="font-bold mt-2">Rule 19</h3><p className="text-sm text-muted-foreground">Conduct in restricted visibility when vessels are not in sight of one another.</p></CardContent></Card>
        </div>
        {reviewButton("framework", "I have reviewed the Part B framework")}</section>
      <section className="space-y-4"><h2 className="text-2xl font-semibold">Rules 5–17: decision essentials</h2><div className="grid md:grid-cols-2 gap-4">
        {COLREG_RULES.map(({ rule, title, scope, points }) => <Card key={rule}><CardContent className="pt-6"><h3 className="font-bold text-lg">Rule {rule}: {title}</h3><p className="text-xs font-medium text-primary mb-3">{scope}</p><ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">{points.map(point => <li key={point}>{point}</li>)}</ul></CardContent></Card>)}
      </div>{reviewButton("rules-5-17", "I have reviewed Rules 5–17")}</section>
      <section className="space-y-3"><h2 className="text-2xl font-semibold flex gap-2"><AlertTriangle />Rule 18: responsibilities, not a ladder</h2>
        <Card><CardContent className="pt-6"><p className="text-xs font-medium text-primary mb-3">{RULE_18_SCOPE}</p><p className="mb-3">Identify the encounter and special waterway duties first; then apply the relevant responsibility:</p><ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">{RULE_18_DECISIONS.map(x => <li key={x}>{x}</li>)}</ol></CardContent></Card>
        {reviewButton("rule-18", "I have reviewed Rule 18 responsibilities")}</section>
      <section className="space-y-3"><h2 className="text-2xl font-semibold">Rule 19: restricted visibility</h2><Card><CardContent className="pt-6 space-y-3 text-sm text-muted-foreground">
        <p>Rule 19 applies to vessels not in sight of one another when navigating in or near restricted visibility. Proceed at a safe speed adapted to the conditions; a power-driven vessel has engines ready for immediate manoeuvre. Apply Rules 5–10 with due regard to the restricted conditions.</p>
        <p>For a vessel detected by radar alone, determine whether close quarters or collision risk is developing and act in ample time. If altering course, so far as possible avoid port for a vessel forward of the beam (unless overtaking) and avoid altering toward a vessel abeam or abaft the beam.</p>
        <p>Except where satisfied no risk exists, a vessel hearing apparently forward of her beam another vessel's fog signal—or unable to avoid close quarters forward of the beam—reduces to the minimum speed at which she can keep course, takes all way off if necessary, and navigates with extreme caution until danger is over.</p>
      </CardContent></Card>{reviewButton("rule-19", "I have reviewed restricted visibility")}</section>
      <ColregScenarioExercise onScenarioCompleted={() => void markSectionVisited("applied")} />
      <aside className="rounded-lg border p-4 text-sm"><p><strong>Source and version:</strong> Convention on the International Regulations for Preventing Collisions at Sea, 1972 (COLREGs), as amended, consolidated in the U.S. Coast Guard <em>Navigation Rules and Regulations Handbook</em>, August 2014, Rules 2 and 4–19. These are learning summaries, not quoted rule text. Informal phrases and mnemonics are memory aids only and have no legal force.</p></aside>
      <div className="flex flex-col items-center gap-2 pt-8"><p className="text-sm text-muted-foreground">Evidence complete: {visitedSectionIds.length} of {requiredSections.length} objectives</p><Button size="lg" disabled={!canComplete || saveState === "saving"} onClick={async () => { if (await markCompleted()) navigate("/rules-of-the-road"); }}>{saveState === "saving" ? "Saving…" : saveState === "failed" ? "Retry completion save" : canComplete ? "Complete Module" : "Review each section and complete an applied scenario"}</Button>{saveState === "queued" && <p role="status">Completion is queued offline and will sync when you reconnect.</p>}{saveState === "failed" && <p role="alert">Completion was not saved. Check your connection and retry.</p>}</div>
    </main>
  </div>;
};

export default ColregTheory;
