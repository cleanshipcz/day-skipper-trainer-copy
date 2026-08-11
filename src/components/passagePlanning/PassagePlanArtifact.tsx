import { calculateLegEtas } from "@/features/passagePlanning/calculations";
import { calculatePassagePlanSummary, validatePassagePlan, type PassagePlan, type PassagePlanRecord } from "@/features/passagePlanning/passagePlan";

type ArtifactState = "approved" | "draft" | "invalid" | "stale" | "queued" | "conflict";

export interface PassagePlanArtifactProps {
  plan: PassagePlan;
  record: PassagePlanRecord | null;
  dirty: boolean;
  conflict: boolean;
}

const displayTime = (value: string) => value && !Number.isNaN(Date.parse(value))
  ? new Date(value).toLocaleString(undefined, { dateStyle:"medium", timeStyle:"short" })
  : "Not recorded";

function artifactState(plan: PassagePlan, record: PassagePlanRecord | null, dirty: boolean, conflict: boolean, issues: string[]): ArtifactState {
  if (issues.length) return "invalid";
  if (conflict) return "conflict";
  if (dirty || !record || JSON.stringify(record.plan) !== JSON.stringify(plan)) return "stale";
  if (record.completedRevision !== record.revision) return "draft";
  if (record.completionStatus === "queued") return "queued";
  return record.completionStatus === "confirmed" ? "approved" : "draft";
}

const stateText: Record<ArtifactState, string> = {
  approved:"Validated · confirmed current revision",
  draft:"DRAFT · not approved for use",
  invalid:"INVALID · not approved for use",
  stale:"STALE / EDITED DRAFT · not approved for use",
  queued:"PENDING SYNC · completion not confirmed",
  conflict:"CONFLICTED DRAFT · resolve before use",
};

export function PassagePlanArtifact({ plan, record, dirty, conflict }: PassagePlanArtifactProps) {
  const issues = validatePassagePlan(plan);
  const state = artifactState(plan, record, dirty, conflict, issues);
  const approved = state === "approved";
  const etas = calculateLegEtas(plan.points, plan.departure, plan.speed);
  const summary = calculatePassagePlanSummary(plan);
  const departure = plan.points[0];
  const destination = plan.points.at(-1);

  return <section className={`passage-plan-artifact ${approved ? "is-approved" : "is-watermarked"}`} aria-labelledby="passage-artifact-title" data-testid="passage-plan-artifact">
    <header className="artifact-header">
      <div><p className="artifact-kicker">Passage plan · printable artifact</p><h2 id="passage-artifact-title">{plan.name.trim() || "Unnamed passage plan"}</h2></div>
      <p className="artifact-status"><strong>Status: {stateText[state]}</strong></p>
    </header>
    {!approved && <div className="artifact-watermark" aria-hidden="true">{state === "invalid" ? "INVALID" : state === "conflict" ? "CONFLICT" : "DRAFT"}</div>}
    <p className="artifact-screen-note">This accessible preview is the print artifact. Choose portrait or landscape, A4 or Letter, and scaling in the browser print dialog.</p>

    <dl className="artifact-metadata">
      <div><dt>Plan format</dt><dd>Version {plan.version}</dd></div>
      <div><dt>Plan revision</dt><dd>{record ? record.revision : "Not saved"}</dd></div>
      <div><dt>Prepared</dt><dd>{displayTime(plan.provenance.preparedAt)}</dd></div>
      <div><dt>Revised</dt><dd>{displayTime(plan.provenance.revisedAt)}</dd></div>
      <div><dt>Departure</dt><dd>{departure?.name || "Not recorded"}</dd></div>
      <div><dt>Destination</dt><dd>{destination && destination !== departure ? destination.name || "Not recorded" : "Not recorded"}</dd></div>
      <div><dt>Planned departure</dt><dd>{displayTime(plan.departure)}</dd></div>
      <div><dt>Vessel</dt><dd>Not recorded in this plan format</dd></div>
      <div><dt>Author</dt><dd>Not recorded in this plan format</dd></div>
    </dl>

    {issues.length > 0 && <section className="artifact-block artifact-validation" aria-labelledby="artifact-validation-title">
      <h3 id="artifact-validation-title">Validation issues — printing does not make this plan valid</h3>
      <ul>{issues.map(issue => <li key={issue}>{issue}</li>)}</ul>
    </section>}

    <section className="artifact-block" aria-labelledby="artifact-route-title">
      <h3 id="artifact-route-title">Ordered route and leg plan</h3>
      <p>Coordinates use degrees and decimal minutes on <strong>{plan.datum}</strong>; stated precision: {plan.coordinatePrecision || "not recorded"}. Courses are entered plan values in degrees; this model does not record whether they are true, magnetic, or compass courses, so verify the course reference before use. Distances are nautical miles (nm), speed over ground is knots (kn), and times are local browser display times.</p>
      <div className="artifact-table-wrap"><table>
        <caption>{departure?.name || "Departure not recorded"} to {destination?.name || "destination not recorded"}</caption>
        <thead><tr><th scope="col">Leg</th><th scope="col">From → to</th><th scope="col">Arrival position (WGS84)</th><th scope="col">Course (°; reference unrecorded)</th><th scope="col">Distance (nm)</th><th scope="col">ETA</th><th scope="col">Gate / weather / notes</th></tr></thead>
        <tbody>{plan.points.slice(1).map((point, index) => <tr key={point.id}>
          <th scope="row">{index + 1}</th><td>{plan.points[index]?.name || "Unnamed"} → {point.name || "Unnamed"}</td><td>{point.latitude || "—"}<br/>{point.longitude || "—"}</td><td>{point.inboundLeg ? point.inboundLeg.course : "—"}</td><td>{point.inboundLeg ? point.inboundLeg.distanceNm : "—"}</td><td>{etas[index] ? displayTime(etas[index]) : "Unavailable"}</td><td><b>Tide:</b> {point.inboundLeg?.tidalGate || "—"}<br/><b>Weather:</b> {point.inboundLeg?.weatherWindow || "—"}<br/><b>Notes:</b> {point.inboundLeg?.notes || "—"}</td>
        </tr>)}</tbody>
      </table></div>
      <p><strong>Route total:</strong> {summary.ok ? `${summary.totalDistanceNm.toFixed(1)} nm · ${summary.calculation.hours.toFixed(1)} h${plan.fuelRate !== undefined ? ` · ${summary.calculation.fuelWithReserveLitres.toFixed(1)} L including ${plan.reservePercent ?? 0}% reserve` : ""}` : "Unavailable until validation issues are corrected"}.</p>
    </section>

    <section className="artifact-columns">
      <div className="artifact-block"><h3>Sources and validity</h3><dl><dt>Weather</dt><dd>{plan.provenance.weather || "Not recorded"}</dd><dt>Tide</dt><dd>{plan.provenance.tide || "Not recorded"}</dd><dt>Chart</dt><dd>{plan.provenance.chart || "Not recorded"}</dd><dt>Publications</dt><dd>{plan.provenance.publications || "Not recorded"}</dd></dl></div>
      <div className="artifact-block"><h3>Safety, contingency and emergency decisions</h3><dl><dt>Departure berth / exit</dt><dd>{plan.safety.departureBerth || "Not recorded"}</dd><dt>Destination approach / berth</dt><dd>{plan.safety.destinationBerth || "Not recorded"}</dd><dt>Limits and gates</dt><dd>{plan.safety.limits || "Not recorded"}</dd><dt>Go / delay / divert / abort</dt><dd>{plan.safety.abortDecision || "Not recorded"}</dd><dt>Alternatives</dt><dd>{plan.safety.alternatives || "Not recorded"}</dd></dl><p><strong>Emergency information:</strong> No dedicated emergency-contact or procedure fields exist in this plan format. Carry and brief the vessel-specific emergency plan separately.</p></div>
    </section>

    <footer className="artifact-signatures">
      <p><strong>Validation / approval:</strong> {stateText[state]}</p>
      <p><strong>Version identifier:</strong> format {plan.version} / revision {record?.revision ?? "unsaved"}{record?.updatedAt ? ` / saved ${displayTime(record.updatedAt)}` : ""}</p>
      <div><span>Prepared by (name/signature): ____________________</span><span>Date/time: ____________________</span></div>
      <div><span>Skipper approval (name/signature): ____________________</span><span>Date/time: ____________________</span></div>
      <p className="artifact-disclaimer">A signature records human review; it does not replace current charts, publications, forecasts, notices, or an immediate pre-departure check.</p>
    </footer>
  </section>;
}
