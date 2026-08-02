import { describe, expect, test } from "vitest";
import { loadAllQuizTopics, loadQuizTopic, quizCatalogue, topicIds, topicMeta, validateQuizBank } from "./index";

const validQuestion = {
  id: "topic-1",
  question: "What is the safe action?",
  options: ["Ease the sheet", "Hold course"],
  correctAnswer: 0,
  explanation: "Easing the sheet reduces load.",
};

describe("asynchronous quiz catalogue", () => {
  test("coalesces duplicate topic requests and keeps the resolved bank for the session", async () => {
    const first = loadQuizTopic("anchorwork");
    const duplicate = loadQuizTopic("anchorwork");
    expect(duplicate).toBe(first);
    const loaded = await first;
    expect(await loadQuizTopic("anchorwork")).toBe(loaded);
  });

  test("fails closed for unknown topics with an actionable error", async () => {
    await expect(loadQuizTopic("invented-topic")).rejects.toThrow('Unknown quiz topic "invented-topic"');
  });

  test("bulk loading preserves catalogue metadata and globally unique stable IDs", async () => {
    const banks = await loadAllQuizTopics(3);
    expect(Object.keys(banks).sort()).toEqual([...topicIds].sort());
    expect(Object.keys(quizCatalogue).sort()).toEqual([...topicIds].sort());
    expect(Object.keys(topicMeta).sort()).toEqual([...topicIds].sort());
    const ids = Object.values(banks).flatMap((bank) => bank.map(({ id }) => id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("accepts the complete question schema, including documented local media", () => {
    const bank = [{ ...validQuestion, image: "/images/colregs/example.png" }];
    expect(validateQuizBank("test-topic", bank)).toBe(bank);
  });

  test.each([
    ["an object", null, /test-topic.*index 0.*must be an object/i],
    ["a trimmed id", { ...validQuestion, id: " topic-1" }, /test-topic.*topic-1.*id must be.*trimmed/i],
    ["a unique id", [{ ...validQuestion }, { ...validQuestion }], /test-topic.*topic-1.*duplicated/i],
    ["trimmed question text", { ...validQuestion, question: "Question? " }, /test-topic.*topic-1.*text must be.*trimmed/i],
    ["at least two options", { ...validQuestion, options: ["Only"] }, /test-topic.*topic-1.*at least two/i],
    ["non-blank options", { ...validQuestion, options: ["Safe", "  "] }, /test-topic.*topic-1.*option 2.*non-blank/i],
    ["normalized-distinct options", { ...validQuestion, options: ["Heave  to", " HEAVE TO "] }, /test-topic.*topic-1.*option 2.*normalization/i],
    ["an integer answer", { ...validQuestion, correctAnswer: 0.5 }, /test-topic.*topic-1.*integer index/i],
    ["an in-bounds answer", { ...validQuestion, correctAnswer: 2 }, /test-topic.*topic-1.*integer index/i],
    ["a non-blank explanation", { ...validQuestion, explanation: " " }, /test-topic.*topic-1.*explanation.*non-blank/i],
    ["a supported image path", { ...validQuestion, image: "https://example.test/image.png" }, /test-topic.*topic-1.*root-relative/i],
  ])("rejects a question without %s", (_label, invalid, message) => {
    const bank = Array.isArray(invalid) ? invalid : [invalid];
    expect(() => validateQuizBank("test-topic", bank)).toThrow(message as RegExp);
  });
});
