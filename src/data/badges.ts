export const badgeCategories = ["topic", "quiz", "points", "streak", "syllabus"] as const;
export type BadgeCategory = typeof badgeCategories[number];

export interface BadgeDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly category: BadgeCategory;
}

export const badgeCatalogue: readonly BadgeDefinition[] = [
  { id: "navigation-master", name: "Navigation Master", description: "Complete Navigation.", icon: "🧭", category: "topic" },
  { id: "safety-first", name: "Safety First", description: "Complete Safety.", icon: "🛟", category: "topic" },
  { id: "weather-wise", name: "Weather Wise", description: "Complete Weather.", icon: "🌦️", category: "topic" },
  { id: "passage-planner", name: "Passage Planner", description: "Complete Passage Planning.", icon: "🗺️", category: "topic" },
  { id: "first-quiz", name: "First Quiz", description: "Finish your first quiz.", icon: "✅", category: "quiz" },
  { id: "quiz-veteran", name: "Quiz Veteran", description: "Finish ten quizzes.", icon: "🎓", category: "quiz" },
  { id: "perfect-score", name: "Perfect Score", description: "Score 100% in a quiz.", icon: "💯", category: "quiz" },
  { id: "points-100", name: "Getting Underway", description: "Earn 100 points.", icon: "⛵", category: "points" },
  { id: "points-500", name: "Making Way", description: "Earn 500 points.", icon: "🌊", category: "points" },
  { id: "points-1000", name: "Seasoned Skipper", description: "Earn 1,000 points.", icon: "🏆", category: "points" },
  { id: "streak-3", name: "Three-Day Run", description: "Study on three consecutive Prague days.", icon: "🔥", category: "streak" },
  { id: "streak-7", name: "Week Aboard", description: "Study on seven consecutive Prague days.", icon: "🔥", category: "streak" },
  { id: "streak-30", name: "Monthly Habit", description: "Study on thirty consecutive Prague days.", icon: "🌟", category: "streak" },
  { id: "half-syllabus", name: "Halfway There", description: "Complete at least half of the syllabus.", icon: "📚", category: "syllabus" },
  { id: "full-syllabus", name: "Day Skipper Scholar", description: "Complete the full syllabus.", icon: "⚓", category: "syllabus" },
] as const;

export interface BadgeProgress {
  readonly completedTopicIds: readonly string[];
  readonly quizPercentages: readonly number[];
  readonly points: number;
  readonly currentStreak: number;
  readonly totalRootTopics: number;
}

export const evaluateBadges = (progress: BadgeProgress): readonly string[] => {
  const completed = new Set(progress.completedTopicIds);
  const rules: Readonly<Record<string, boolean>> = {
    "navigation-master": completed.has("navigation"),
    "safety-first": completed.has("safety"),
    "weather-wise": completed.has("weather"),
    "passage-planner": completed.has("passage-planning"),
    "first-quiz": progress.quizPercentages.length >= 1,
    "quiz-veteran": progress.quizPercentages.length >= 10,
    "perfect-score": progress.quizPercentages.some((score) => score === 100),
    "points-100": progress.points >= 100,
    "points-500": progress.points >= 500,
    "points-1000": progress.points >= 1000,
    "streak-3": progress.currentStreak >= 3,
    "streak-7": progress.currentStreak >= 7,
    "streak-30": progress.currentStreak >= 30,
    "half-syllabus": progress.totalRootTopics > 0 && completed.size >= Math.ceil(progress.totalRootTopics / 2),
    "full-syllabus": progress.totalRootTopics > 0 && completed.size >= progress.totalRootTopics,
  };
  return badgeCatalogue.filter(({ id }) => rules[id]).map(({ id }) => id);
};

export const badgeById = new Map(badgeCatalogue.map((badge) => [badge.id, badge]));
