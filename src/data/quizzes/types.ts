/** Shared quiz question interface consumed by all quiz data files and the Quiz component. */
export interface Question {
  readonly id: string;
  readonly question: string;
  /** Canonical `/images/` application asset path (PNG, JPEG, WebP, or SVG; no URL suffixes or traversal). */
  readonly image?: string;
  readonly options: readonly string[];
  readonly correctAnswer: number;
  readonly explanation: string;
}

/** Metadata displayed in the quiz header for a given topic. */
export interface TopicMeta {
  readonly title: string;
  readonly subtitle: string;
}
