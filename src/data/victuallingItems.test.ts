import { describe, expect, it } from "vitest";
import { normalizeVictuallingCatalogue } from "./victuallingItems";

const item = (id: string, category: string, label = id) => ({ id, category, item: label, quantity: "1 tin" });

describe("normalizeVictuallingCatalogue", () => {
  it("enforces category and item ordering independently of insertion order", () => {
    expect(normalizeVictuallingCatalogue([
      item("p", "Personal"), item("f-z", "Food", "Zulu"), item("x", "Extra"), item("f-a", "Food", "Alpha"), item("s", "Safety"),
    ]).map(({ id }) => id)).toEqual(["f-a", "f-z", "s", "p", "x"]);
  });

  it("excludes malformed entries and every ambiguous duplicate", () => {
    expect(normalizeVictuallingCatalogue([
      item("safe", "Food"), item("duplicate", "Food", "One"), item("duplicate", "Safety", "Two"),
      { id: "blank", category: " ", item: "Label", quantity: "1" },
      { id: "missing", category: "Food", item: "Label" }, null,
    ])).toEqual([item("safe", "Food")]);
    expect(normalizeVictuallingCatalogue(null)).toEqual([]);
    expect(normalizeVictuallingCatalogue([])).toEqual([]);
  });
});
