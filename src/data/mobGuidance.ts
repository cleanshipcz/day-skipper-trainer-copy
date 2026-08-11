export const MOB_MAYDAY_VOICE_OPENING = [
  "MAYDAY, MAYDAY, MAYDAY",
  "THIS IS YACHT [NAME], [NAME], [NAME]",
] as const;

export const MOB_SAIL_RETURN_GUIDANCE = {
  description: "One practised return option when suitable for the vessel and conditions",
  initialLeg:
    "Turn onto the practised point of sail. Its length depends on the vessel, rig, wind, sea state, sea room and recovery plan.",
} as const;

/** Stable reviewed hand-off consumed by the theory, assessment, and #341 drill redesign. */
export const MOB_THEORY_OUTCOMES = [
  "alarm-flotation-mark-spotter",
  "vessel-control-and-crew-roles",
  "distress-and-coordination",
  "vessel-dependent-return-and-approach",
  "propeller-exclusion",
  "secure-and-lift",
  "cold-incapacitated-recovery-and-aftercare",
  "prevention-rehearsal-and-escalation",
] as const;

export const MOB_RECOVERY_CONSTRAINTS = [
  "Maintain vessel control and uninterrupted visual/position information.",
  "Do not prescribe a universal manoeuvre, approach side, distance, or engine setting.",
  "Keep people and loose lines clear of propulsion; neutralise or stop before propeller exposure as control and conditions allow.",
  "Secure the casualty with rated, compatible equipment before lifting; never improvise a neck or unsupported limb lift.",
  "Abort an unstable approach early, retain the mark and lookout, alert help, reset, and return under control.",
] as const;

export interface MobTheoryReleaseReview {
  readonly seamanshipReviewer: string | null;
  readonly seamanshipQualification: string | null;
  readonly medicalReviewer: string | null;
  readonly medicalQualification: string | null;
  readonly approvalDate: string | null;
  readonly sourceEvidence: readonly string[];
}

export const isMobTheoryReleaseApproved = (review: MobTheoryReleaseReview) =>
  Boolean(review.seamanshipReviewer?.trim()) &&
  Boolean(review.seamanshipQualification?.trim()) &&
  Boolean(review.medicalReviewer?.trim()) &&
  Boolean(review.medicalQualification?.trim()) &&
  /^\d{4}-\d{2}-\d{2}$/.test(review.approvalDate ?? "") &&
  review.sourceEvidence.length >= 3 &&
  review.sourceEvidence.every((source) => source.trim().length > 0);

export const MOB_THEORY_RELEASE_REVIEW: MobTheoryReleaseReview = {
  seamanshipReviewer: null,
  seamanshipQualification: null,
  medicalReviewer: null,
  medicalQualification: null,
  approvalDate: null,
  sourceEvidence: [],
};

export const MOB_THEORY_SOURCES = [
  "RYA Safety Advisory Notice: Man Overboard (reviewed 2026-08-12)",
  "MCA MGN 570 (M): Fishing vessels — emergency drills and man-overboard recovery (reviewed 2026-08-12)",
  "Maritime and Coastguard Agency / HM Coastguard: GMDSS distress procedure guidance (reviewed 2026-08-12)",
  "Resuscitation Council UK: First Aid Guidelines 2025 — drowning and hypothermia (reviewed 2026-08-12)",
] as const;
