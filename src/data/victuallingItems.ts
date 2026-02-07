export interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  quantity: string;
  checked: boolean;
}

export const checklistData: ChecklistItem[] = [
  // Food
  { id: "f1", category: "Food", item: "Fresh water", quantity: "2L per person/day", checked: false },
  { id: "f2", category: "Food", item: "Non-perishable meals", quantity: "3 meals/person/day", checked: false },
  { id: "f3", category: "Food", item: "Snacks & energy bars", quantity: "As needed", checked: false },
  { id: "f4", category: "Food", item: "Tea, coffee, hot chocolate", quantity: "As preferred", checked: false },
  { id: "f5", category: "Food", item: "Fresh fruit & vegetables", quantity: "For 2-3 days", checked: false },

  // Safety
  { id: "s1", category: "Safety", item: "First aid kit", quantity: "Complete kit", checked: false },
  { id: "s2", category: "Safety", item: "Seasickness medication", quantity: "As needed", checked: false },
  { id: "s3", category: "Safety", item: "Sunscreen & lip balm", quantity: "High SPF", checked: false },
  { id: "s4", category: "Safety", item: "Emergency flares", quantity: "In date", checked: false },

  // Galley
  { id: "g1", category: "Galley", item: "Cooking gas/fuel", quantity: "Full bottles", checked: false },
  { id: "g2", category: "Galley", item: "Matches/lighter", quantity: "Waterproof", checked: false },
  { id: "g3", category: "Galley", item: "Dishwashing supplies", quantity: "Eco-friendly", checked: false },
  { id: "g4", category: "Galley", item: "Trash bags", quantity: "Multiple", checked: false },
  { id: "g5", category: "Galley", item: "Paper towels & cloths", quantity: "Adequate supply", checked: false },

  // Personal
  { id: "p1", category: "Personal", item: "Warm clothing layers", quantity: "Per person", checked: false },
  { id: "p2", category: "Personal", item: "Waterproof gear", quantity: "Per person", checked: false },
  { id: "p3", category: "Personal", item: "Personal medications", quantity: "As prescribed", checked: false },
  { id: "p4", category: "Personal", item: "Toiletries", quantity: "Biodegradable", checked: false },
];
