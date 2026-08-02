import { describe, expect, it } from "vitest";
import { maintenanceChecks } from "./engineChecks";
import { engineGuidance, engineSources } from "./engineGuidance";

describe("Engine safety learning content", () => {
  const content = [...engineGuidance.map(({ title, body }) => `${title} ${body}`), ...maintenanceChecks.map(({ task, description, frequency }) => `${task} ${description} ${frequency}`)].join(" ").toLowerCase();

  it("covers installation scope, manual authority and competence boundaries", () => {
    for (const phrase of ["inboard diesel", "inboard petrol", "outboard", "raw-water", "closed-circuit", "manuals", "skipper remains responsible", "competent"]) expect(content).toContain(phrase);
  });

  it("covers start, underway, alarm, shutdown and no-restart decisions", () => {
    for (const phrase of ["before starting", "immediately verify", "underway", "every change", "shutdown", "no restart", "post-run", "log hours"]) expect(content).toContain(phrase);
  });

  it("provides safe sequences for the named fault classes", () => {
    for (const phrase of ["overheat", "low oil pressure", "fuel leak", "smoke/fire", "electrical/charging", "fouled prop", "abnormal vibration"]) expect(content).toContain(phrase);
    expect(content).toContain("never open a hot pressurised cap");
  });

  it("does not generalise blower or leak detection advice", () => {
    expect(content).toContain("where fitted and required");
    expect(content).toContain("absence of smell is not proof");
    expect(content).toContain("never rely on smell");
  });

  it("covers supporting hazards, controls, spares and records", () => {
    for (const phrase of ["propeller clearance", "co alarms", "batteries", "contain spill", "spares", "parts records", "manufacturer inspection limits and intervals"]) expect(content).toContain(phrase);
  });

  it("links authoritative and manufacturer follow-up sources", () => {
    expect(engineSources).toHaveLength(6);
    expect(new Set(engineSources.map(({ id }) => id)).size).toBe(engineSources.length);
    expect(engineSources.every(({ href }) => href.startsWith("https://"))).toBe(true);
    const labels = engineSources.map(({ label }) => label).join(" ");
    for (const authority of ["RYA", "Coast Guard", "MAIB", "Yanmar", "Volvo Penta"]) expect(labels).toContain(authority);
  });
});
