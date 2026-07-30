import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf8"));
const topicSources = [
  "nauticalTerms", "ropework", "anchorwork", "victualling", "engine", "rig",
  "colregs", "lightsSignals", "safetyMob", "safetyFire", "safetyLifeRaft",
  "safetyFlares", "safety", "pilotage", "weather", "passagePlanning",
].map((name) => `src/data/quizzes/${name}.ts`);

const missing = topicSources.filter((source) => !manifest[source]?.isDynamicEntry);
if (missing.length) {
  throw new Error(`Quiz banks must remain independent dynamic chunks; missing: ${missing.join(", ")}`);
}

const quizPage = manifest["src/pages/Quiz.tsx"];
if (!quizPage?.isDynamicEntry) throw new Error("Quiz page must remain a lazy route.");
const bundledTopic = topicSources.find((source) => quizPage.dynamicImports?.includes(source));
if (bundledTopic) throw new Error(`Single-topic route eagerly bundles ${bundledTopic}.`);

console.log(`Quiz chunk assertion passed: ${topicSources.length} independently lazy banks; Quiz route loads none eagerly.`);
