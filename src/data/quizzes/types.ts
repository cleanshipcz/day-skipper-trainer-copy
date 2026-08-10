/** Shared quiz question interface consumed by all quiz data files and the Quiz component. */
export interface Question {
  readonly id: string;
  readonly question: string;
  /** Canonical `/images/` application asset path (PNG, JPEG, WebP, or SVG; no URL suffixes or traversal). */
  readonly image?: string;
  /** Meaningful visual description that states observable cues without naming the keyed answer. */
  readonly imageAlt?: string;
  /** Structured, non-answer-bearing equivalent for an assessment diagram. */
  readonly scenario?: {
    readonly accessibleName: string;
    readonly description: string;
    readonly facts: readonly { readonly label: string; readonly value: string }[];
  };
  readonly options: readonly string[];
  readonly correctAnswer: number;
  readonly explanation: string;
  /** Optional curriculum traceability used by diagnostic quizzes. */
  readonly learningObjective?: string;
  readonly prerequisite?: string;
  readonly remediationRoute?: string;
}

/** Metadata displayed in the quiz header for a given topic. */
export interface TopicMeta {
  readonly title: string;
  readonly subtitle: string;
}
