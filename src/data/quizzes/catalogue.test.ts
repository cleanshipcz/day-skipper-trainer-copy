import { describe, expect, test } from "vitest";
import {
  loadAllQuizTopics, loadQuizTopic, quizCatalogue, topicIds, topicMeta,
  validateQuizBank, validateQuizCatalogueIds,
} from "./index";

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
    for (const image of [
      "/images/colregs/example.png", "/images/photo.jpg", "/images/photo.jpeg",
      "/images/diagrams/day_shape.webp", "/images/icons/vessel.svg",
    ]) {
      const bank = [{ ...validQuestion, image }];
      expect(validateQuizBank("test-topic", bank)).toBe(bank);
    }
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
    ["a supported image path", { ...validQuestion, image: "https://example.test/image.png" }, /test-topic.*topic-1.*under \/images/i],
  ])("rejects a question without %s", (_label, invalid, message) => {
    const bank = Array.isArray(invalid) ? invalid : [invalid];
    expect(() => validateQuizBank("test-topic", bank)).toThrow(message as RegExp);
  });

  test.each([
    "\\evil.example/x.png",
    "/\\evil.example/x.png",
    "/images/../secret.png",
    "/images/%2e%2e/secret.png",
    "/images/example.png?remote=true",
    "/images/example.png#remote",
    "/assets/example.png",
  ])("rejects non-canonical media path %s", (image) => {
    expect(() => validateQuizBank("media-topic", [{ ...validQuestion, image }]))
      .toThrow(/media-topic.*topic-1.*canonical local asset path/i);
  });

  test("names both topic owners when bulk catalogue IDs conflict", () => {
    expect(() => validateQuizCatalogueIds({
      anchorwork: [validQuestion],
      pilotage: [{ ...validQuestion, question: "Another question?" }],
    })).toThrow(/topic-1.*anchorwork.*pilotage/i);
  });
});
