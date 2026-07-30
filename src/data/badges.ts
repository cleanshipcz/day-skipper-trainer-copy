export const badgeCategories = ["topic", "quiz", "points", "streak", "syllabus"] as const;
export type BadgeCategory = typeof badgeCategories[number];

export interface BadgeDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly category: BadgeCategory;
  readonly unlockCondition: string;
}

const badgeDefinitions = [
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

export const badgeCatalogue: readonly BadgeDefinition[] = badgeDefinitions.map((badge) => ({
  ...badge,
  unlockCondition: badge.description,
}));

export const badgeById = new Map(badgeCatalogue.map((badge) => [badge.id, badge]));
