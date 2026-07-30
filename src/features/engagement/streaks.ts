const pragueDate = (timestamp: string): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp));
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
};

const previousDate = (date: string): string => {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
};

export const fetchAllStreakTimestamps = async (
  fetchPage: (from: number, to: number) => Promise<readonly string[]>,
  pageSize = 1_000,
): Promise<readonly string[]> => {
  const timestamps: string[] = [];
  for (let from = 0; ; from += pageSize) {
    const page = await fetchPage(from, from + pageSize - 1);
    timestamps.push(...page);
    if (page.length < pageSize) return timestamps;
  }
};

export const calculateStreak = (timestamps: readonly string[], now: string): number => {
  const activeDates = new Set(timestamps.map(pragueDate));
  let cursor = pragueDate(now);
  if (!activeDates.has(cursor)) cursor = previousDate(cursor);
  let streak = 0;
  while (activeDates.has(cursor)) {
    streak += 1;
    cursor = previousDate(cursor);
  }
  return streak;
};
