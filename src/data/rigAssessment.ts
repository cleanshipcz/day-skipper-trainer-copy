export const rigObjectives = [
  { id: "rig-defect", label: "Dispose of visible standing-rig defects safely", theoryAnchor: "rig-defect-disposition", questionIds: ["rg1"] },
  { id: "rig-intervals", label: "Apply configuration-specific inspection timing", theoryAnchor: "rig-scope", questionIds: ["rg2"] },
  { id: "rig-terminals", label: "Evaluate terminals without universal shortcuts", theoryAnchor: "rig-evidence", questionIds: ["rg3"] },
  { id: "rig-spreaders", label: "Handle uncertain spreader evidence", theoryAnchor: "rig-evidence", questionIds: ["rg4"] },
  { id: "rig-tension", label: "Use fitted-rig evidence for tuning", theoryAnchor: "rig-evidence", questionIds: ["rg5"] },
  { id: "rig-hidden", label: "Respect hidden-structure limits", theoryAnchor: "rig-evidence", questionIds: ["rg6"] },
  { id: "rig-lines", label: "Stop safely for loaded-line faults", theoryAnchor: "rig-hazards", questionIds: ["rg7"] },
  { id: "rig-furler", label: "Escalate abnormal furler evidence", theoryAnchor: "rig-evidence", questionIds: ["rg8"] },
  { id: "rig-boom", label: "Control a defective boom attachment", theoryAnchor: "rig-defect-disposition", questionIds: ["rg9"] },
  { id: "rig-incident", label: "Trigger post-incident inspection", theoryAnchor: "rig-incidents", questionIds: ["rg10"] },
  { id: "rig-handoff", label: "Separate learning from inspection", theoryAnchor: "rig-handoff", questionIds: ["rg11"] },
  { id: "rig-electrical", label: "Control overhead-electrical exposure", theoryAnchor: "rig-hazards", questionIds: ["rg12"] },
] as const;

export const rigAssessmentCoverage = Object.fromEntries(rigObjectives.flatMap((objective) => objective.questionIds.map((questionId) => [questionId, objective.id]))) as Record<string, string>;
