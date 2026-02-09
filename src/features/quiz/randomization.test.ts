import { describe, expect, it } from "vitest";
import { createSeededRng, shuffleWithRng } from "./randomization";

describe("quiz randomization", () => {
  it("produces deterministic shuffle for same seed", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const first = shuffleWithRng(input, createSeededRng(42));
    const second = shuffleWithRng(input, createSeededRng(42));

    expect(first).toEqual(second);
    expect(first).not.toEqual(input);
  });

  it("changes shuffle order when seed changes", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const first = shuffleWithRng(input, createSeededRng(1));
    const second = shuffleWithRng(input, createSeededRng(2));

    expect(first).not.toEqual(second);
  });
});
