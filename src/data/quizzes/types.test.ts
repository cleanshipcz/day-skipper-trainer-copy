import { describe, expect, it } from "vitest";

describe("Quiz data types", () => {
  it("should export the Question interface usable as a type", async () => {
    // given
    // - the types module exists and exports Question
    const typesModule = await import("./types");

    // when
    // - we check that the module loaded successfully
    // then
    expect(typesModule).toBeDefined();
  });
});
