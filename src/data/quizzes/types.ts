/** Shared quiz question interface consumed by all quiz data files and the Quiz component. */
export interface Question {
  readonly id: string;
  readonly question: string;
  /** Root-relative application asset path (for example, `/images/colregs/vessel.png`). */
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
