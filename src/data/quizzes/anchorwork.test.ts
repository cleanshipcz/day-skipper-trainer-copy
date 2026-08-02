import { describe, expect, it } from "vitest";

import anchorworkQuestions from "./anchorwork";

const byId = (id: string) => {
  const question = anchorworkQuestions.find((candidate) => candidate.id === id);
  if (!question) throw new Error(`Missing anchorwork question ${id}`);
  return question;
};

describe("anchorwork safety guidance", () => {
  it("uses maximum attachment-to-seabed distance without double-counting tide", () => {
    const scope = byId("a3");
    expect(scope.options[scope.correctAnswer]).toBe("Maximum anticipated bow-roller/chock-to-seabed distance");
    expect(scope.explanation).toContain("add only the further expected rise");
    expect(scope.explanation).toContain("do not add tide twice");
  });

  it("does not present paying out more rode as the unconditional dragging response", () => {
    const dragging = byId("a8");
    expect(dragging.options[dragging.correctAnswer]).toContain("assess whether to add suitable rode or recover and reset");
    expect(dragging.explanation).toContain("only if depth, equipment and safe swinging room permit");
    expect(dragging.explanation).toContain("start the engine when appropriate");
  });

  it("distinguishes chain catenary from elastic shock absorption", () => {
    const chain = byId("a7");
    expect(chain.options[chain.correctAnswer]).toContain("snubber or bridle provides elasticity");
    expect(chain.explanation).toContain("chain is not an elastic shock absorber");
  });

  it("protects qualified trip-line, approach, kedge and securing guidance", () => {
    expect(byId("a6").explanation).toContain("foul propellers");
    expect(byId("a10").explanation).toContain("rather than treating one heading as universal");
    expect(byId("a11").explanation).toContain("safe, trained crew and vessel-specific plan");

    const securing = byId("a12");
    expect(securing.options[securing.correctAnswer]).toContain("engineered strong point");
    expect(securing.explanation).toContain("roller guides the rode but is not automatically the securing point");
    expect(securing.explanation).toContain("manufacturers' load and securing guidance");
  });
});
