import { describe, expect, test } from "vitest";
import { loadAllQuizTopics, loadQuizTopic, quizCatalogue, topicIds, topicMeta } from "./index";

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
});
