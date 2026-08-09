import { z } from "zod";

export interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  quantity: string;
}

const text = z.string().trim().min(1);
const checklistItemSchema = z.object({
  id: text,
  category: text,
  item: text,
  quantity: text,
}).strict();

export const VICTUALLING_CATEGORY_ORDER = ["Food", "Safety", "Galley", "Personal"] as const;
const categoryRank = new Map<string, number>(VICTUALLING_CATEGORY_ORDER.map((category, index) => [category, index]));

/**
 * Validates catalogue entries and returns a stable presentation order.
 * Invalid entries and every occurrence of a duplicate ID are excluded so a
 * persisted ID can never point at an ambiguous label. Known categories use
 * the documented order; additional categories and items sort by label then ID.
 */
export const normalizeVictuallingCatalogue = (input: unknown): ChecklistItem[] => {
  if (!Array.isArray(input)) return [];
  const parsed = input.flatMap((entry) => {
    const result = checklistItemSchema.safeParse(entry);
    return result.success ? [result.data] : [];
  });
  const counts = new Map<string, number>();
  parsed.forEach(({ id }) => counts.set(id, (counts.get(id) ?? 0) + 1));
  return parsed
    .filter(({ id }) => counts.get(id) === 1)
    .sort((a, b) => {
      const aRank = categoryRank.get(a.category) ?? Number.MAX_SAFE_INTEGER;
      const bRank = categoryRank.get(b.category) ?? Number.MAX_SAFE_INTEGER;
      return aRank - bRank
        || a.category.localeCompare(b.category)
        || a.item.localeCompare(b.item)
        || a.id.localeCompare(b.id);
    });
};

const rawChecklistData = [
  { id: "f1", category: "Food", item: "Fresh water", quantity: "Enter passage calculation" },
  { id: "f2", category: "Food", item: "Meals", quantity: "Set meals × crew × plan days" },
  { id: "f3", category: "Food", item: "Snacks & energy food", quantity: "Choose portions for workload" },
  { id: "f4", category: "Food", item: "Drinks", quantity: "Record crew choices and water use" },
  { id: "f5", category: "Food", item: "Fresh produce", quantity: "Choose for climate and storage life" },
  { id: "s1", category: "Safety", item: "First aid kit", quantity: "Complete kit" },
  { id: "s2", category: "Safety", item: "Seasickness medication", quantity: "Record crew-specific requirement" },
  { id: "s3", category: "Safety", item: "Sunscreen & lip balm", quantity: "High SPF" },
  { id: "s4", category: "Safety", item: "Emergency flares", quantity: "In date" },
  { id: "g1", category: "Galley", item: "Cooking gas/fuel", quantity: "Calculate consumption and usable capacity" },
  { id: "g2", category: "Galley", item: "Matches/lighter", quantity: "Waterproof" },
  { id: "g3", category: "Galley", item: "Dishwashing supplies", quantity: "Eco-friendly" },
  { id: "g4", category: "Galley", item: "Trash bags", quantity: "Set count from meal and waste plan" },
  { id: "g5", category: "Galley", item: "Paper towels & cloths", quantity: "Set reusable/disposable count" },
  { id: "p1", category: "Personal", item: "Warm clothing layers", quantity: "Per person" },
  { id: "p2", category: "Personal", item: "Waterproof gear", quantity: "Per person" },
  { id: "p3", category: "Personal", item: "Personal medications", quantity: "As prescribed" },
  { id: "p4", category: "Personal", item: "Toiletries", quantity: "Biodegradable" },
];

export const checklistData = normalizeVictuallingCatalogue(rawChecklistData);
